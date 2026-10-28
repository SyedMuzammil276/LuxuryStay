import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { billingApi, reservationsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import {
  Receipt,
  PlusCircle,
  Search,
  DollarSign,
  Printer,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
  Eye,
  CreditCard,
  Building,
  Calendar,
  Crown,
} from 'lucide-react';

export const BillingPage = () => {
  const { isGuest, isFrontDesk } = useAuth();
  const [searchParams] = useSearchParams();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInvoice, setSearchInvoice] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(Boolean(searchParams.get('reservationId')));
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  // Form State
  const [targetReservationId, setTargetReservationId] = useState(searchParams.get('reservationId') || '');
  const [taxRateInput, setTaxRateInput] = useState(5);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [checkedOutReservations, setCheckedOutReservations] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (statusFilter) params.paymentStatus = statusFilter;
      const res = await billingApi.listBills(params);
      if (res.data?.bills) {
        setBills(res.data.bills);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not load billing records.');
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    if (!isFrontDesk) return;
    try {
      const res = await reservationsApi.listReservations({ status: 'checked_out' });
      setCheckedOutReservations(res.data?.reservations || []);
    } catch (e) {
      console.warn('Could not load checked out reservations for billing:', e.message);
    }
  };

  useEffect(() => {
    fetchBills();
    loadReservations();
  }, [statusFilter]);

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    if (!targetReservationId) {
      setErrorMsg('Please select a checked-out reservation.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await billingApi.generateBill({
        reservationId: targetReservationId,
        taxRate: Number(taxRateInput),
      });
      setSuccessMsg(res.data?.message || 'Invoice generated successfully!');
      setIsGenerateModalOpen(false);
      setTargetReservationId('');
      fetchBills();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to generate invoice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedBill || !paymentAmount || Number(paymentAmount) <= 0) {
      setErrorMsg('Please enter a valid positive payment amount.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await billingApi.recordPayment(selectedBill._id, Number(paymentAmount));
      setSuccessMsg(res.data?.message || 'Payment recorded successfully!');
      setIsPaymentModalOpen(false);
      setSelectedBill(null);
      setPaymentAmount('');
      fetchBills();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  const openPrintModal = (bill) => {
    setSelectedBill(bill);
    setIsPrintModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredBills = bills.filter((b) => {
    const q = searchInvoice.toLowerCase();
    return (
      b.invoiceNumber?.toLowerCase().includes(q) ||
      b.guest?.firstName?.toLowerCase().includes(q) ||
      b.guest?.lastName?.toLowerCase().includes(q) ||
      b.reservation?.confirmationCode?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F8FAFC' }}>
            Billing & Invoices
          </h1>
          <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
            Room tariffs, extra services folios, tax assessments, and official receipts.
          </p>
        </div>

        {isFrontDesk && (
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="btn btn-primary"
          >
            <PlusCircle size={16} /> Generate Invoice
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="toast-banner toast-error">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="toast-banner toast-success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '260px', maxWidth: '380px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#A8B8CC',
              }}
            />
            <input
              type="text"
              placeholder="Search invoice #, guest, or confirmation..."
              value={searchInvoice}
              onChange={(e) => setSearchInvoice(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Payments</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial Paid</option>
            <option value="paid">Fully Paid</option>
          </select>

          <button onClick={fetchBills} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Guest Name</th>
              <th>Room & Nights</th>
              <th>Room Charges</th>
              <th>Services</th>
              <th>Tax</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#D6B779' }}>
                  Loading hotel billing folios...
                </td>
              </tr>
            ) : filteredBills.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem', color: '#A8B8CC' }}>
                  No billing invoices recorded yet.
                </td>
              </tr>
            ) : (
              filteredBills.map((bill) => (
                <tr key={bill._id}>
                  <td>
                    <span style={{ fontWeight: '700', color: '#D6B779' }}>
                      {bill.invoiceNumber || 'PENDING'}
                    </span>
                    <p style={{ fontSize: '0.74rem', color: '#A8B8CC' }}>
                      Ref: {bill.reservation?.confirmationCode || '—'}
                    </p>
                  </td>
                  <td>
                    <span style={{ fontWeight: '600', color: '#F8FAFC' }}>
                      {bill.guest?.firstName} {bill.guest?.lastName}
                    </span>
                    <p style={{ fontSize: '0.74rem', color: '#A8B8CC' }}>{bill.guest?.email}</p>
                  </td>
                  <td>
                    <span style={{ color: '#F8FAFC' }}>Room #{bill.room?.roomNumber}</span>
                    <p style={{ fontSize: '0.74rem', color: '#A8B8CC' }}>
                      {bill.nights} night(s) @ ${bill.room?.pricePerNight}
                    </p>
                  </td>
                  <td style={{ color: '#F8FAFC' }}>${bill.roomCharges}</td>
                  <td style={{ color: '#F8FAFC' }}>${bill.additionalCharges || 0}</td>
                  <td style={{ color: '#A8B8CC' }}>
                    ${bill.taxAmount} ({bill.taxRate}%)
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#D6B779', fontSize: '0.95rem' }}>
                      ${bill.totalAmount}
                    </span>
                    <p style={{ fontSize: '0.74rem', color: '#A8B8CC' }}>Paid: ${bill.amountPaid || 0}</p>
                  </td>
                  <td>
                    <span className={`badge badge-${bill.paymentStatus}`}>
                      {bill.paymentStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => openPrintModal(bill)}
                        className="btn btn-secondary btn-sm"
                        title="View & Print Folio"
                      >
                        <Printer size={13} /> View
                      </button>

                      {isFrontDesk && bill.paymentStatus !== 'paid' && (
                        <button
                          onClick={() => {
                            setSelectedBill(bill);
                            const remaining = Math.max(0, bill.totalAmount - (bill.amountPaid || 0));
                            setPaymentAmount(String(remaining));
                            setIsPaymentModalOpen(true);
                          }}
                          className="btn btn-primary btn-sm"
                          title="Record Payment"
                        >
                          <CreditCard size={13} /> Pay
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Generate Invoice Modal */}
      {isGenerateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <Receipt size={20} style={{ color: '#D6B779' }} /> Generate Guest Bill
              </h3>
              <button onClick={() => setIsGenerateModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleGenerateBill}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Checked-Out Reservation *</label>
                  <select
                    required
                    value={targetReservationId}
                    onChange={(e) => setTargetReservationId(e.target.value)}
                  >
                    <option value="">-- Choose Checked-Out Booking --</option>
                    {checkedOutReservations.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.confirmationCode} — {r.guest?.firstName} {r.guest?.lastName} (Room #{r.room?.roomNumber})
                      </option>
                    ))}
                  </select>
                  <span className="form-hint">
                    Backend business rule: Invoices are calculated after official check-out.
                  </span>
                </div>

                <div className="form-group">
                  <label>Tax Rate (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={taxRateInput}
                    onChange={(e) => setTaxRateInput(e.target.value)}
                  />
                  <span className="form-hint">Standard luxury hospitality tax configured in system.</span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsGenerateModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Calculating...' : 'Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedBill && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>
                <CreditCard size={20} style={{ color: '#27AE75' }} /> Record Payment
              </h3>
              <button onClick={() => setIsPaymentModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div className="modal-body">
                <div style={{ backgroundColor: '#143253', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
                  <p style={{ color: '#A8B8CC', fontSize: '0.8rem' }}>Invoice Number</p>
                  <p style={{ color: '#D6B779', fontWeight: '700', fontSize: '1.1rem' }}>
                    {selectedBill.invoiceNumber}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: '#A8B8CC' }}>Total Amount:</span>
                    <span style={{ color: '#F8FAFC', fontWeight: '600' }}>${selectedBill.totalAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#A8B8CC' }}>Already Paid:</span>
                    <span style={{ color: '#27AE75', fontWeight: '600' }}>${selectedBill.amountPaid || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginTop: '0.25rem', paddingTop: '0.25rem', borderTop: '1px solid #263E59' }}>
                    <span style={{ color: '#D6B779' }}>Balance Due:</span>
                    <span style={{ color: '#D6B779', fontWeight: '700' }}>
                      ${Math.max(0, selectedBill.totalAmount - (selectedBill.amountPaid || 0))}
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Payment Amount Received ($) *</label>
                  <input
                    type="number"
                    min={0.01}
                    step="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Recording...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Invoice Folio Modal (Print-Ready) */}
      {isPrintModalOpen && selectedBill && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header no-print">
              <h3>
                <Printer size={20} style={{ color: '#D6B779' }} /> Official LuxuryStay Invoice
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handlePrint} className="btn btn-primary btn-sm">
                  <Printer size={14} /> Print Invoice
                </button>
                <button onClick={() => setIsPrintModalOpen(false)} style={{ color: '#A8B8CC' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Printable Area: rendered in white for high standard hotel folio printing */}
            <div
              className="printable-invoice"
              style={{
                padding: '2.5rem',
                backgroundColor: '#ffffff',
                color: '#1a1a1a',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {/* Hotel Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #D6B779', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#071A31' }}>
                    <Crown size={28} style={{ color: '#C49E58' }} />
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', fontWeight: '700', margin: 0 }}>
                      LuxuryStay Hospitality
                    </h2>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#555', marginTop: '0.25rem' }}>
                    Five-Star Hotel & Resort Management • Royal Avenue, Karachi
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#555' }}>
                    Phone: +92 (21) 111-LUXURY • Web: www.luxurystay.com
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.78rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    GUEST FOLIO / INVOICE
                  </span>
                  <h3 style={{ fontSize: '1.25rem', color: '#071A31', fontWeight: '700', marginTop: '0.2rem' }}>
                    {selectedBill.invoiceNumber || 'PENDING'}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#555' }}>
                    Date: {new Date(selectedBill.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Guest & Stay Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.4rem' }}>
                    Billed To Guest:
                  </h4>
                  <p style={{ fontWeight: '700', color: '#071A31', fontSize: '1rem' }}>
                    {selectedBill.guest?.firstName} {selectedBill.guest?.lastName}
                  </p>
                  <p style={{ color: '#555' }}>Email: {selectedBill.guest?.email}</p>
                  <p style={{ color: '#555' }}>Phone: {selectedBill.guest?.phone || 'On file'}</p>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.4rem' }}>
                    Reservation Reference:
                  </h4>
                  <p style={{ fontWeight: '700', color: '#071A31' }}>
                    Confirmation: {selectedBill.reservation?.confirmationCode}
                  </p>
                  <p style={{ color: '#555' }}>
                    Suite #{selectedBill.room?.roomNumber} ({selectedBill.room?.roomType})
                  </p>
                  <p style={{ color: '#555' }}>
                    Duration: {selectedBill.nights} Night(s)
                  </p>
                </div>
              </div>

              {/* Line Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd', backgroundColor: '#f9f9f9', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Description</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty / Nights</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Rate</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem' }}>
                      Suite Accommodation (Room #{selectedBill.room?.roomNumber})
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>{selectedBill.nights}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>${selectedBill.room?.pricePerNight}</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                      ${selectedBill.roomCharges}
                    </td>
                  </tr>

                  {/* Extra Services items */}
                  {(selectedBill.services || []).map((s, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.75rem' }}>
                        Guest Service: {s.serviceName?.replace('_', ' ')}
                        {s.description && <span style={{ color: '#777', fontSize: '0.8rem' }}> — {s.description}</span>}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>{s.quantity || 1}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>${s.unitPrice}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600' }}>
                        ${s.totalPrice}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}>
                <div style={{ width: '280px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                    <span style={{ color: '#555' }}>Room Charges:</span>
                    <span>${selectedBill.roomCharges}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                    <span style={{ color: '#555' }}>Additional Services:</span>
                    <span>${selectedBill.additionalCharges || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0' }}>
                    <span style={{ color: '#555' }}>Tax ({selectedBill.taxRate}%):</span>
                    <span>${selectedBill.taxAmount}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0',
                      borderTop: '2px solid #071A31',
                      borderBottom: '2px solid #071A31',
                      fontWeight: '700',
                      fontSize: '1.1rem',
                      color: '#071A31',
                      marginTop: '0.4rem',
                    }}
                  >
                    <span>Total Amount:</span>
                    <span>${selectedBill.totalAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', color: '#27AE75', fontWeight: '600' }}>
                    <span>Amount Paid:</span>
                    <span>${selectedBill.amountPaid || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', color: '#E45B65', fontWeight: '700' }}>
                    <span>Payment Status:</span>
                    <span style={{ textTransform: 'uppercase' }}>{selectedBill.paymentStatus}</span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div style={{ textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '1.5rem', color: '#777', fontSize: '0.78rem' }}>
                <p>Thank you for choosing LuxuryStay Hospitality. We look forward to welcoming you back.</p>
                <p style={{ marginTop: '0.2rem' }}>This invoice is system-generated and certified by LuxuryStay HMS.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage;
