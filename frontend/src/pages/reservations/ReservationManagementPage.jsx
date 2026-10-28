import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reservationsApi, guestsApi, roomsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import {
  CalendarCheck,
  PlusCircle,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  KeyRound,
  Ban,
  Clock,
  Eye,
  Edit2,
  X,
  RefreshCw,
  BedDouble,
  User,
  Calendar,
} from 'lucide-react';

export const ReservationManagementPage = () => {
  const { isGuest, isFrontDesk } = useAuth();
  const [searchParams] = useSearchParams();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState(searchParams.get('confirmationCode') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [guestList, setGuestList] = useState([]);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(searchParams.get('action') === 'new');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    guestId: '',
    roomId: '',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    guestsCount: 1,
    specialRequests: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      if (isGuest) {
        const res = await reservationsApi.listMyReservations();
        setReservations(res.data?.reservations || []);
      } else {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        if (searchCode) params.confirmationCode = searchCode;

        const res = await reservationsApi.listReservations(params);
        setReservations(res.data?.reservations || []);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not load reservations.');
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const roomRes = await roomsApi.listRooms({ active: 'true' });
      setAvailableRooms(roomRes.data?.rooms || []);

      if (!isGuest) {
        const gRes = await guestsApi.listGuests({ limit: 100 });
        setGuestList(gRes.data?.guests || []);
      }
    } catch (e) {
      console.warn('Dependency fetch notice:', e.message);
    }
  };

  useEffect(() => {
    fetchReservations();
    loadDependencies();
  }, [statusFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let res;
      if (isGuest) {
        res = await reservationsApi.createMyReservation({
          roomId: formData.roomId,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          guestsCount: Number(formData.guestsCount),
          specialRequests: formData.specialRequests,
        });
      } else {
        res = await reservationsApi.createReservation({
          guestId: formData.guestId,
          roomId: formData.roomId,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          guestsCount: Number(formData.guestsCount),
          specialRequests: formData.specialRequests,
        });
      }

      setSuccessMsg(`Reservation booked! Confirmation: ${res.data?.reservation?.confirmationCode}`);
      setIsCreateModalOpen(false);
      fetchReservations();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await reservationsApi.checkIn(id);
      setSuccessMsg('Guest checked in successfully! Room status updated.');
      fetchReservations();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Check-in failed.');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await reservationsApi.checkOut(id);
      setSuccessMsg('Check-out completed! Room sent to Housekeeping for cleaning.');
      fetchReservations();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Check-out failed.');
    }
  };

  const handleMarkNoShow = async (id) => {
    try {
      await reservationsApi.markNoShow(id);
      setSuccessMsg('Reservation marked as No-Show.');
      fetchReservations();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleCancelSubmit = async () => {
    if (!selectedRes) return;
    setSubmitting(true);
    try {
      await reservationsApi.cancelReservation(selectedRes._id, cancelReason);
      setSuccessMsg('Reservation has been cancelled.');
      setIsCancelModalOpen(false);
      setSelectedRes(null);
      setCancelReason('');
      fetchReservations();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Cancellation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F8FAFC' }}>
            Reservation Management
          </h1>
          <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
            Front desk bookings, check-in operations, stay dates, and guest requests.
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreateModalOpen(true);
            if (availableRooms.length > 0 && !formData.roomId) {
              setFormData((prev) => ({ ...prev, roomId: availableRooms[0]._id }));
            }
          }}
          className="btn btn-primary"
        >
          <PlusCircle size={16} /> New Reservation
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

      {/* Filter & Search Bar */}
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
              placeholder="Search confirmation code..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>
          <button onClick={fetchReservations} className="btn btn-secondary btn-sm">
            Filter
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>

          <button onClick={fetchReservations} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Confirmation Code</th>
              <th>Guest Name</th>
              <th>Room</th>
              <th>Stay Duration</th>
              <th>Guests</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#D6B779' }}>
                  Loading reservations...
                </td>
              </tr>
            ) : reservations.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#A8B8CC' }}>
                  No reservations found.
                </td>
              </tr>
            ) : (
              reservations.map((res) => (
                <tr key={res._id}>
                  <td>
                    <span style={{ fontWeight: '700', color: '#D6B779' }}>
                      {res.confirmationCode}
                    </span>
                  </td>
                  <td>
                    {res.guest?.firstName ? (
                      <div>
                        <span style={{ fontWeight: '600', color: '#F8FAFC' }}>
                          {res.guest.firstName} {res.guest.lastName}
                        </span>
                        <p style={{ fontSize: '0.74rem', color: '#A8B8CC' }}>{res.guest.phone || res.guest.email}</p>
                      </div>
                    ) : (
                      'Guest Record'
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: '600', color: '#F8FAFC' }}>
                      Room #{res.room?.roomNumber || '—'}
                    </span>
                    <p style={{ fontSize: '0.74rem', color: '#A8B8CC', textTransform: 'capitalize' }}>
                      {res.room?.roomType}
                    </p>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem' }}>
                      <span style={{ color: '#F8FAFC' }}>
                        {new Date(res.checkInDate).toLocaleDateString()}
                      </span>
                      <span style={{ color: '#A8B8CC', margin: '0 0.3rem' }}>→</span>
                      <span style={{ color: '#F8FAFC' }}>
                        {new Date(res.checkOutDate).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td>{res.guestsCount} Guests</td>
                  <td>
                    <span className={`badge badge-${res.status}`}>
                      {res.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      {/* Check In Action */}
                      {isFrontDesk && res.status === 'confirmed' && (
                        <button
                          onClick={() => handleCheckIn(res._id)}
                          className="btn btn-primary btn-sm"
                          title="Check In Guest"
                        >
                          <KeyRound size={13} /> Check In
                        </button>
                      )}

                      {/* Check Out Action */}
                      {isFrontDesk && res.status === 'checked_in' && (
                        <button
                          onClick={() => handleCheckOut(res._id)}
                          className="btn btn-secondary btn-sm"
                          title="Check Out Guest"
                        >
                          <CheckCircle size={13} /> Check Out
                        </button>
                      )}

                      {/* View Detail */}
                      <button
                        onClick={() => {
                          setSelectedRes(res);
                          setIsDetailModalOpen(true);
                        }}
                        className="btn btn-secondary btn-sm"
                        title="View Full Folio"
                      >
                        <Eye size={13} />
                      </button>

                      {/* Cancel Action */}
                      {['confirmed', 'checked_in'].includes(res.status) && (
                        <button
                          onClick={() => {
                            setSelectedRes(res);
                            setIsCancelModalOpen(true);
                          }}
                          className="btn btn-danger btn-sm"
                          title="Cancel Reservation"
                        >
                          <Ban size={13} />
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

      {/* Reservation Details Modal */}
      {isDetailModalOpen && selectedRes && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <CalendarCheck size={20} style={{ color: '#D6B779' }} /> Reservation Folio #{selectedRes.confirmationCode}
              </h3>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`badge badge-${selectedRes.status}`} style={{ fontSize: '0.85rem' }}>
                  Status: {selectedRes.status?.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#A8B8CC' }}>
                  Booked on: {new Date(selectedRes.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Guest Name</span>
                  <p style={{ color: '#F8FAFC', fontWeight: '600' }}>
                    {selectedRes.guest?.firstName} {selectedRes.guest?.lastName}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Room Allocation</span>
                  <p style={{ color: '#D6B779', fontWeight: '600' }}>
                    Room #{selectedRes.room?.roomNumber} ({selectedRes.room?.roomType})
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Check-in Date</span>
                  <p style={{ color: '#F8FAFC' }}>{new Date(selectedRes.checkInDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Check-out Date</span>
                  <p style={{ color: '#F8FAFC' }}>{new Date(selectedRes.checkOutDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Party Size</span>
                  <p style={{ color: '#F8FAFC' }}>{selectedRes.guestsCount} Guests</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Booked Role</span>
                  <p style={{ color: '#F8FAFC', textTransform: 'capitalize' }}>{selectedRes.bookedBy || 'Direct'}</p>
                </div>
              </div>

              {selectedRes.specialRequests && (
                <div style={{ backgroundColor: '#143253', padding: '1rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#D6B779', fontWeight: '600' }}>SPECIAL GUEST REQUESTS:</span>
                  <p style={{ color: '#F8FAFC', fontSize: '0.88rem', marginTop: '0.3rem' }}>{selectedRes.specialRequests}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsDetailModalOpen(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Reservation Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <PlusCircle size={20} style={{ color: '#D6B779' }} /> Create Hotel Reservation
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                {/* Guest Selector for staff */}
                {!isGuest && (
                  <div className="form-group">
                    <label>Select Guest Profile *</label>
                    <select
                      required
                      value={formData.guestId}
                      onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
                    >
                      <option value="">-- Choose Registered Guest --</option>
                      {guestList.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.firstName} {g.lastName} ({g.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Room Selector */}
                <div className="form-group">
                  <label>Select Room *</label>
                  <select
                    required
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  >
                    <option value="">-- Select Room --</option>
                    {availableRooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        Room #{r.roomNumber} — {r.roomType} (${r.pricePerNight}/night, {r.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Check-in Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.checkInDate}
                      onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Check-out Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.checkOutDate}
                      onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Number of Guests *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={formData.guestsCount}
                    onChange={(e) => setFormData({ ...formData, guestsCount: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Special Requests (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Late arrival, airport pickup request, high floor preference..."
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Confirming...' : 'Book Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {isCancelModalOpen && selectedRes && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ color: '#E45B65' }}>
                <Ban size={20} /> Cancel Reservation #{selectedRes.confirmationCode}
              </h3>
              <button onClick={() => setIsCancelModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#A8B8CC', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Please provide the operational or guest reason for this cancellation:
              </p>
              <textarea
                rows={3}
                required
                placeholder="Reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsCancelModalOpen(false)} className="btn btn-secondary">
                Back
              </button>
              <button onClick={handleCancelSubmit} disabled={submitting} className="btn btn-danger">
                {submitting ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationManagementPage;
