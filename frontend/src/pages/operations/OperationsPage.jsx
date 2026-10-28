import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reservationsApi, billingApi } from '../../api/endpoints';
import {
  KeyRound,
  CheckCircle,
  Clock,
  Search,
  BedDouble,
  User,
  Calendar,
  AlertCircle,
  Receipt,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const OperationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('checkin'); // 'checkin' or 'checkout'
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRes, setSelectedRes] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchReservations = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const status = activeTab === 'checkin' ? 'confirmed' : 'checked_in';
      const res = await reservationsApi.listReservations({ status });
      if (res.data?.reservations) {
        setReservations(res.data.reservations);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not load operational reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedRes(null);
    fetchReservations();
  }, [activeTab]);

  const handleExecuteCheckIn = async (id) => {
    setProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await reservationsApi.checkIn(id);
      setSuccessMsg('Guest check-in recorded successfully! Room is now marked Occupied.');
      setSelectedRes(null);
      fetchReservations();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Check-in failed. Check room availability.');
    } finally {
      setProcessing(false);
    }
  };

  const handleExecuteCheckOut = async (id) => {
    setProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await reservationsApi.checkOut(id);
      setSuccessMsg('Check-out completed! Room sent to Housekeeping for sanitation.');
      setSelectedRes(null);
      fetchReservations();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Check-out failed.');
    } finally {
      setProcessing(false);
    }
  };

  const filtered = reservations.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.confirmationCode?.toLowerCase().includes(q) ||
      r.guest?.firstName?.toLowerCase().includes(q) ||
      r.guest?.lastName?.toLowerCase().includes(q) ||
      r.room?.roomNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F8FAFC' }}>
          Front Desk Operations: Check-in & Check-out
        </h1>
        <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
          Real-time arrival verification, room key issuance, and checkout departure processing.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid #263E59', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('checkin')}
          className={`btn ${activeTab === 'checkin' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <KeyRound size={16} /> Guest Check-in ({activeTab === 'checkin' ? reservations.length : '—'})
        </button>
        <button
          onClick={() => setActiveTab('checkout')}
          className={`btn ${activeTab === 'checkout' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Clock size={16} /> Guest Check-out ({activeTab === 'checkout' ? reservations.length : '—'})
        </button>
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

      {/* Main Two-Column Workflow Area */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Left: Queue List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #263E59' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#F8FAFC', marginBottom: '0.75rem' }}>
              {activeTab === 'checkin' ? 'Scheduled Arrivals (Confirmed)' : 'In-House Guests (Checked In)'}
            </h3>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#A8B8CC' }} />
              <input
                type="text"
                placeholder="Search by code, guest name, or room #..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.4rem' }}
              />
            </div>
          </div>

          <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#D6B779' }}>
                Fetching operational queue...
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: '#A8B8CC' }}>
                No reservations waiting for {activeTab === 'checkin' ? 'check-in' : 'check-out'}.
              </div>
            ) : (
              filtered.map((res) => {
                const isSelected = selectedRes?._id === res._id;
                return (
                  <div
                    key={res._id}
                    onClick={() => setSelectedRes(res)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid #263E59',
                      backgroundColor: isSelected ? 'rgba(214, 183, 121, 0.12)' : 'transparent',
                      borderLeft: isSelected ? '4px solid #D6B779' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: '700', color: '#D6B779', fontSize: '0.95rem' }}>
                        {res.confirmationCode}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#F8FAFC', fontWeight: '600' }}>
                        Room #{res.room?.roomNumber || 'TBD'}
                      </span>
                    </div>

                    <p style={{ color: '#F8FAFC', fontSize: '0.9rem', fontWeight: '500' }}>
                      {res.guest?.firstName} {res.guest?.lastName}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#A8B8CC', marginTop: '0.2rem' }}>
                      <span>
                        Dates: {new Date(res.checkInDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
                        {new Date(res.checkOutDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                      <span style={{ textTransform: 'capitalize' }}>{res.room?.roomType}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Operational Verification & Execution Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {selectedRes ? (
            <div>
              <div style={{ borderBottom: '1px solid #263E59', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#D6B779', fontWeight: '700', letterSpacing: '0.05em' }}>
                  OPERATIONAL VERIFICATION
                </span>
                <h3 style={{ fontSize: '1.4rem', color: '#F8FAFC', marginTop: '0.2rem' }}>
                  Folio: {selectedRes.confirmationCode}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ backgroundColor: '#143253', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#D6B779', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Guest Details
                  </h4>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: '#F8FAFC' }}>
                    {selectedRes.guest?.firstName} {selectedRes.guest?.lastName}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#A8B8CC' }}>
                    Email: {selectedRes.guest?.email || 'N/A'} • Phone: {selectedRes.guest?.phone || 'N/A'}
                  </p>
                </div>

                <div style={{ backgroundColor: '#143253', padding: '1rem', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#D6B779', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    Room Allocation
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#F8FAFC' }}>
                        Room #{selectedRes.room?.roomNumber} ({selectedRes.room?.roomType})
                      </p>
                      <p style={{ fontSize: '0.82rem', color: '#A8B8CC' }}>
                        Nightly rate: ${selectedRes.room?.pricePerNight || 0}
                      </p>
                    </div>
                    <span className={`badge badge-${selectedRes.room?.status || 'available'}`}>
                      {selectedRes.room?.status || 'Ready'}
                    </span>
                  </div>
                </div>

                {selectedRes.specialRequests && (
                  <div style={{ backgroundColor: '#143253', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#D6B779', fontWeight: '600' }}>
                      GUEST SPECIAL REQUESTS:
                    </span>
                    <p style={{ color: '#F8FAFC', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                      {selectedRes.specialRequests}
                    </p>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid #263E59' }}>
                {activeTab === 'checkin' ? (
                  <button
                    onClick={() => handleExecuteCheckIn(selectedRes._id)}
                    disabled={processing}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                  >
                    <CheckCircle size={18} />{' '}
                    {processing ? 'Processing Check-in...' : 'Confirm Guest Check-In & Issue Access'}
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleExecuteCheckOut(selectedRes._id)}
                      disabled={processing}
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%' }}
                    >
                      <CheckCircle size={18} />{' '}
                      {processing ? 'Processing Checkout...' : 'Confirm Guest Check-Out & Dispatch Housekeeping'}
                    </button>
                    <button
                      onClick={() => navigate(`/billing?reservationId=${selectedRes._id}`)}
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                    >
                      <Receipt size={16} /> View & Generate Final Invoice
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#A8B8CC' }}>
              <ShieldCheck size={48} style={{ color: '#D6B779', margin: '0 auto 1rem', opacity: 0.7 }} />
              <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '0.4rem' }}>
                No Reservation Selected
              </h3>
              <p style={{ fontSize: '0.88rem', maxWidth: '340px', margin: '0 auto' }}>
                Select an arriving or departing guest from the queue on the left to verify details and perform operational transitions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationsPage;
