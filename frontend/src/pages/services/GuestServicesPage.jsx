import React, { useState, useEffect } from 'react';
import { guestServicesApi, reservationsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import {
  ConciergeBell,
  PlusCircle,
  Search,
  CheckCircle,
  AlertCircle,
  Utensils,
  Car,
  Bell,
  Shirt,
  Sparkles,
  X,
  RefreshCw,
  Ban,
} from 'lucide-react';

export const GuestServicesPage = () => {
  const { isGuest, isFrontDesk } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReservations, setActiveReservations] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    reservationId: '',
    serviceName: 'room_service',
    description: '',
    quantity: 1,
    unitPrice: 25,
  });
  const [submitting, setSubmitting] = useState(false);

  // Pre-configured luxury services menu for easy ordering
  const standardServices = {
    room_service: { label: 'In-Suite Fine Dining & Caviar', price: 65, icon: Utensils },
    food: { label: 'Artisan Breakfast & High Tea', price: 40, icon: Utensils },
    laundry: { label: 'Express Steam Press & Dry Cleaning', price: 30, icon: Shirt },
    transportation: { label: 'VIP Chauffeur & Airport Limousine', price: 85, icon: Car },
    wake_up_call: { label: 'Personalized Morning Wake-Up Call', price: 0, icon: Bell },
  };

  const fetchServices = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await guestServicesApi.listServices();
      if (res.data?.services) {
        setServices(res.data.services);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not load guest services.');
    } finally {
      setLoading(false);
    }
  };

  const loadReservations = async () => {
    try {
      const res = isGuest
        ? await reservationsApi.listMyReservations()
        : await reservationsApi.listReservations({ status: 'checked_in' });
      setActiveReservations(res.data?.reservations || []);
    } catch (e) {
      console.warn('Could not load reservations for services:', e.message);
    }
  };

  useEffect(() => {
    fetchServices();
    loadReservations();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reservationId) {
      setErrorMsg('Please select a valid reservation.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await guestServicesApi.createService({
        reservationId: formData.reservationId,
        serviceName: formData.serviceName,
        description: formData.description || standardServices[formData.serviceName]?.label,
        quantity: Number(formData.quantity),
        unitPrice: Number(formData.unitPrice),
      });

      setSuccessMsg(res.data?.message || 'Service request dispatched to hotel staff!');
      setIsCreateModalOpen(false);
      fetchServices();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to place service request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await guestServicesApi.updateServiceStatus(id, newStatus);
      setSuccessMsg(`Service request updated to ${newStatus}.`);
      setServices((prev) =>
        prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Status update failed.');
    }
  };

  const handleCancel = async (id) => {
    try {
      await guestServicesApi.cancelService(id);
      setSuccessMsg('Service request cancelled.');
      fetchServices();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not cancel request.');
    }
  };

  const getServiceIcon = (name) => {
    switch (name) {
      case 'room_service':
      case 'food':
        return <Utensils size={18} style={{ color: '#D6B779' }} />;
      case 'laundry':
        return <Shirt size={18} style={{ color: '#55A7E8' }} />;
      case 'transportation':
        return <Car size={18} style={{ color: '#27AE75' }} />;
      case 'wake_up_call':
        return <Bell size={18} style={{ color: '#E6AA45' }} />;
      default:
        return <ConciergeBell size={18} style={{ color: '#D6B779' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F8FAFC' }}>
            Guest Services & Room Orders
          </h1>
          <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
            In-suite dining, laundry, private limousine transfers, and wake-up notifications.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeReservations.length > 0 && !formData.reservationId) {
              setFormData((prev) => ({ ...prev, reservationId: activeReservations[0]._id }));
            }
            setIsCreateModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <PlusCircle size={16} /> Order Guest Service
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

      {/* Services Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Reservation & Guest</th>
              <th>Quantity & Rate</th>
              <th>Total Tariff</th>
              <th>Requested By</th>
              <th>Status</th>
              <th>Requested At</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#D6B779' }}>
                  Loading service requests...
                </td>
              </tr>
            ) : services.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#A8B8CC' }}>
                  No guest service orders on record.
                </td>
              </tr>
            ) : (
              services.map((svc) => (
                <tr key={svc._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#143253',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {getServiceIcon(svc.serviceName)}
                      </div>
                      <div>
                        <span style={{ fontWeight: '600', color: '#F8FAFC', textTransform: 'capitalize' }}>
                          {svc.serviceName?.replace('_', ' ')}
                        </span>
                        <p style={{ fontSize: '0.74rem', color: '#A8B8CC' }}>{svc.description}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: '#D6B779', fontWeight: '600' }}>
                      {svc.reservation?.confirmationCode || 'In-House'}
                    </span>
                    <p style={{ fontSize: '0.74rem', color: '#A8B8CC' }}>
                      {svc.guest?.firstName ? `${svc.guest.firstName} ${svc.guest.lastName}` : 'Guest'}
                    </p>
                  </td>
                  <td>
                    {svc.quantity} × ${svc.unitPrice}
                  </td>
                  <td>
                    <span style={{ fontWeight: '700', color: '#D6B779' }}>
                      ${svc.totalPrice}
                    </span>
                  </td>
                  <td>
                    <span style={{ textTransform: 'capitalize', color: '#A8B8CC' }}>
                      {svc.requestedBy}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${svc.status}`}>
                      {svc.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#A8B8CC' }}>
                    {new Date(svc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      {!isGuest && svc.status === 'requested' && (
                        <button
                          onClick={() => handleStatusChange(svc._id, 'in_progress')}
                          className="btn btn-secondary btn-sm"
                          title="Begin preparing"
                        >
                          Prepare
                        </button>
                      )}
                      {!isGuest && svc.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusChange(svc._id, 'completed')}
                          className="btn btn-primary btn-sm"
                          title="Mark delivered"
                        >
                          <CheckCircle size={13} /> Complete
                        </button>
                      )}
                      {['requested', 'in_progress'].includes(svc.status) && (
                        <button
                          onClick={() => handleCancel(svc._id)}
                          className="btn btn-danger btn-sm"
                          title="Cancel request"
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

      {/* Order Service Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <ConciergeBell size={20} style={{ color: '#D6B779' }} /> Request Guest Service
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Reservation / Room *</label>
                  <select
                    required
                    value={formData.reservationId}
                    onChange={(e) => setFormData({ ...formData, reservationId: e.target.value })}
                  >
                    <option value="">-- Choose Active Booking --</option>
                    {activeReservations.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.confirmationCode} — Room #{r.room?.roomNumber} ({r.guest?.firstName || 'Guest'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Select Service *</label>
                  <select
                    value={formData.serviceName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const standard = standardServices[name];
                      setFormData({
                        ...formData,
                        serviceName: name,
                        unitPrice: standard?.price ?? 25,
                        description: standard?.label ?? '',
                      });
                    }}
                  >
                    <option value="room_service">Room Service (Fine Dining)</option>
                    <option value="food">Artisan Breakfast / Refreshments</option>
                    <option value="laundry">Dry Cleaning & Laundry</option>
                    <option value="transportation">Airport Limousine & Valet</option>
                    <option value="wake_up_call">Personalized Wake-Up Call</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit Price ($)</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Custom Instructions / Dietary Requirements</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please deliver at 8:00 AM, extra sparkling water..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Placing Order...' : 'Confirm Service Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestServicesPage;
