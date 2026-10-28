import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  roomNumber: { type: String, required: true, unique: true, trim: true },
  roomType: { type: String, required: true, enum: ["single", "double", "twin", "deluxe", "suite", "family", "other"], default: "double" },
  floor: { type: Number, min: 0, default: 0 },
  capacity: { type: Number, min: 1, required: true, default: 2 },
  pricePerNight: { type: Number, min: 0, required: true },
  status: { type: String, enum: ["available", "occupied", "reserved", "maintenance", "cleaning"], default: "available" },
  amenities: [{ type: String, trim: true }],
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

RoomSchema.index({ status: 1, roomType: 1 });
export default mongoose.model("Room", RoomSchema);
