
import crypto from "crypto";
import Guest from "../models/Guest.js";
import createNotification from "../utils/createNotification.js";
import sendVerificationEmail from "../utils/sendVerificationEmail.js";
import bcrypt from "bcryptjs";


const MANAGEMENT_ROLES = ["admin", "manager", "receptionist"];

async function notifyRoles({ roles, category = "guest", ...payload }) {
  const results = await Promise.allSettled(
    roles.map((role) =>
      createNotification({
        ...payload,
        category,
        targetRole: role,
      })
    )
  );

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(
        "Guest notification failed:",
        result.reason?.message
      );
    }
  });

  return results.filter((result) => result.status === "fulfilled").length;
}



const publicGuest = (guest) => guest;


const RESEND_COOLDOWN_SECONDS = 60;

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const baseUrl = () =>
  (process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`)
    .replace(/\/+$/, "");


async function issueEmailVerification(guest) {
  if (!guest?.email) return false;

  try {
    const token = crypto.randomBytes(32).toString("hex");

    await Guest.updateOne(
      { _id: guest._id },
      {
        $set: {
          emailVerified: false,
          emailVerificationToken: hashToken(token),
         emailVerificationExpires: new Date(
    Date.now() + 24 * 60 * 60 * 1000
),
          emailVerificationSentAt: new Date()
        },
        $unset: { emailVerifiedAt: "" }
      }
    );

   await sendVerificationEmail({
    guest,
    verifyUrl: `${baseUrl()}/api/guests/verify-email/${token}`,
    expiresInHours: 24
});

    return true;
  } catch (e) {
    console.error("Guest verification email error:", e.message);
    return false;
  }
}

const resultPage = (title, message, ok) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title></head>
<body style="font-family:Arial,sans-serif;background:#f6f4ef;display:flex;
align-items:center;justify-content:center;min-height:100vh;margin:0;">
<div style="background:#fff;padding:40px;border-radius:10px;max-width:420px;
text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.08);">
<div style="font-size:48px;">${ok ? "&#10003;" : "&#10007;"}</div>
<h2 style="color:${ok ? "#2e7d32" : "#c62828"};">${title}</h2>
<p style="color:#555;">${message}</p>
<p style="color:#999;font-size:13px;">LuxuryStay Hospitality</p>
</div></body></html>`;




export async function createGuest(req, res) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      nationality,
      identificationType,
      identificationNumber,
      notes
    } = req.body;


    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({
        message: "firstName and lastName are required"
      });
    }

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address"
      });
    }

    if (typeof password !== "string" || !password) {
      return res.status(400).json({
        message: "Password is required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      });
    }


    const existingGuest = await Guest.findOne({
      email: normalizedEmail
    });

    if (existingGuest) {
      return res.status(409).json({
        message: "A guest with this email already exists"
      });
    }


    const isSelfRegistration = !req.user?._id;


    const hashedPassword = await bcrypt.hash(password, 10);

    const guest = await Guest.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone,
      address,
      nationality,
      identificationType,
      identificationNumber,
      notes,


      emailVerified: !isSelfRegistration
    });

    
    let verificationEmailSent = false;

    if (isSelfRegistration) {
      try {
        verificationEmailSent =
          await issueEmailVerification(guest);
      } catch (mailErr) {
        console.error(
          "Guest verification email failed:",
          mailErr
        );
      }
    }

   
  
try {
  await notifyRoles({
    roles: MANAGEMENT_ROLES,
    title: isSelfRegistration
      ? "New guest registered"
      : "Guest added",
    message: isSelfRegistration
      ? `${guest.firstName} ${guest.lastName} registered a new account.`
      : `${guest.firstName} ${guest.lastName} was added to guest records.`,
    category: "guest",
    type: isSelfRegistration ? "info" : "success",
    createdBy: req.user?._id || null,
    relatedModel: "Guest",
    relatedId: guest._id,
    metadata: {
      guestId: guest._id,
      source: isSelfRegistration ? "self-registration" : "staff",
      emailVerificationPending:
        isSelfRegistration && !guest.emailVerified,
    },
  });
} catch (notifyErr) {
  console.error("Guest notification failed:", notifyErr);
}


    
    return res.status(201).json({
      message: "Guest created successfully",
      verificationEmailSent,
      guest: publicGuest(guest)
    });

  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({
        message:
          "A guest with this email or identification number already exists"
      });
    }

    console.error("Create guest error:", e);

    return res.status(500).json({
      message: "Server error"
    });
  }
}

export async function listGuests(req, res) {
  try {
    const {
      search,
      active,
      page = 1,
      limit = 50
    } = req.query;

    const filter = {};

    if (active !== undefined) {
      filter.isActive = active === "true";
    }

    if (search) {
      filter.$or = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "identificationNumber"
      ].map((key) => ({
        [key]: {
          $regex: search,
          $options: "i"
        }
      }));
    }

    const p = Math.max(1, Number(page) || 1);
    const l = Math.min(100, Math.max(1, Number(limit) || 50));

    const [guests, total] = await Promise.all([
      Guest.find(filter)
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l),
      Guest.countDocuments(filter)
    ]);

    return res.json({
      message: "Guests fetched successfully",
      count: guests.length,
      total,
      page: p,
      pages: Math.ceil(total / l),
      guests
    });
  } catch (e) {
    return res.status(500).json({
      message: "Server error",
      error: e.message
    });
  }
}

export async function getGuest(req, res) {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return res.status(404).json({
        message: "Guest not found"
      });
    }

    return res.json({ guest });
  } catch (e) {
    return res.status(400).json({
      message: "Invalid guest ID",
      error: e.message
    });
  }
}


export async function updateGuest(req, res) {
  try {
    const allowed = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "nationality",
      "identificationType",
      "identificationNumber",
      "notes",
      "isActive"
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) =>
        allowed.includes(key)
      )
    );

    
    if (
      updates.firstName !== undefined &&
      !String(updates.firstName).trim()
    ) {
      return res.status(400).json({
        message: "firstName cannot be empty"
      });
    }

    
    if (
      updates.lastName !== undefined &&
      !String(updates.lastName).trim()
    ) {
      return res.status(400).json({
        message: "lastName cannot be empty"
      });
    }

    
    if (updates.email !== undefined) {
      updates.email = String(updates.email).trim().toLowerCase();

      if (!updates.email) {
        updates.email = undefined;
      } else {
        const existingGuest = await Guest.findOne({
          email: updates.email,
          _id: { $ne: req.params.id }
        });

        if (existingGuest) {
          return res.status(409).json({
            message: "Another guest is already using this email"
          });
        }
      }
    }

   
    const guestExists = await Guest.findById(req.params.id);

    if (!guestExists) {
      return res.status(404).json({
        message: "Guest not found"
      });
    }


    const guest = await Guest.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!guest) {
      return res.status(404).json({
        message: "Guest not found"
      });
    }

   
 
if (req.user?._id) {
  await notifyRoles({
    roles: MANAGEMENT_ROLES,
    title: "Guest updated",
    message: `${guest.firstName} ${guest.lastName}'s guest record was updated.`,
    category: "guest",
    type: "info",
    createdBy: req.user._id,
    relatedModel: "Guest",
    relatedId: guest._id,
    metadata: {
      guestId: guest._id,
    },
  });
}


    return res.json({
      message: "Guest updated successfully",
      guest
    });

  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({
        message: "Email or identification number already exists"
      });
    }

    return res.status(400).json({
      message: "Could not update guest",
      error: e.message
    });
  }
}


export async function deleteGuest(req, res) {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);

    if (!guest) {
      return res.status(404).json({
        message: "Guest not found"
      });
    }

 
if (req.user?._id) {
  await notifyRoles({
    roles: MANAGEMENT_ROLES,
    title: "Guest removed",
    message: `${guest.firstName} ${guest.lastName}'s guest record was removed.`,
    category: "guest",
    type: "warning",
    createdBy: req.user._id,
    relatedModel: "Guest",
    relatedId: guest._id,
    metadata: {
      guestId: guest._id,
    },
  });
}

    return res.json({
      message: "Guest deleted successfully"
    });
  } catch (e) {
    return res.status(400).json({
      message: "Could not delete guest",
      error: e.message
    });
  }
}


export async function verifyGuestEmail(req, res) {
  try {
    const guest = await Guest.findOne({
      emailVerificationToken: hashToken(req.params.token),
      emailVerificationExpires: { $gt: new Date() }
    }).select("+emailVerificationToken +emailVerificationExpires");

    if (!guest) {
      return res
        .status(400)
        .send(
          resultPage(
            "Link invalid or expired",
            "This verification link is invalid or has expired. Please request a new one.",
            false
          )
        );
    }

    guest.emailVerified = true;
    guest.emailVerifiedAt = new Date();
    guest.emailVerificationToken = undefined;
    guest.emailVerificationExpires = undefined;
    guest.emailVerificationSentAt = undefined;
    await guest.save();

    return res.send(
      resultPage(
        "Email verified",
        "Thank you! Your email address has been verified.",
        true
      )
    );
  } catch (e) {
    console.error("Verify guest email error:", e);

    return res
      .status(500)
      .send(
        resultPage("Something went wrong", "Please try again later.", false)
      );
  }
}


async function resendFor(guest) {
  if (!guest || !guest.email) {
    return { status: 404, message: "No email on file for this guest" };
  }

  if (guest.emailVerified) {
    return { status: 400, message: "Email is already verified" };
  }

  const sentAt = guest.emailVerificationSentAt?.getTime() || 0;
  const waitMs = RESEND_COOLDOWN_SECONDS * 1000 - (Date.now() - sentAt);

  if (waitMs > 0) {
    return {
      status: 429,
      message: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another email`
    };
  }

  const sent = await issueEmailVerification(guest);

  return sent
    ? { status: 200, message: "Verification email sent" }
    : { status: 502, message: "Could not send verification email" };
}


export async function resendVerificationPublic(req, res) {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const guest = await Guest.findOne({ email }).select(
      "+emailVerificationSentAt"
    );

   
    if (guest && !guest.emailVerified) {
      await resendFor(guest);
    }

    return res.json({
      message:
        "If this email is registered and not yet verified, a new verification email has been sent"
    });
  } catch (e) {
    return res.status(500).json({
      message: "Server error",
      error: e.message
    });
  }
}


export async function resendVerificationStaff(req, res) {
  try {
    const guest = await Guest.findById(req.params.id).select(
      "+emailVerificationSentAt"
    );

    if (!guest) {
      return res.status(404).json({ message: "Guest not found" });
    }

    const result = await resendFor(guest);

    return res.status(result.status).json({ message: result.message });
  } catch (e) {
    return res.status(400).json({
      message: "Could not resend verification email",
      error: e.message
    });
  }
}
