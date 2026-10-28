import React, { useState, useEffect } from 'react';
import { guestsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import {
  UserCheck,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  CheckCircle,
  AlertCircle,
  X,
  Send,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const GuestManagementPage = () => {
  const { isAdmin } = useAuth();

  const [guests, setGuests] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    nationality: '',
    identificationType: 'passport',
    identificationNumber: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchGuests = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (activeFilter !== '') params.active = activeFilter;

      const res = await guestsApi.listGuests(params);
      if (res.data?.guests) {
        setGuests(res.data.guests);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not load guests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [page, activeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchGuests();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await guestsApi.createGuest(formData);
      setSuccessMsg(res.data?.message || 'Guest account created successfully!');
      setIsCreateModalOpen(false);
      fetchGuests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create guest account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGuest) return;
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await guestsApi.updateGuest(selectedGuest._id, formData);
      setSuccessMsg(res.data?.message || 'Guest updated successfully!');
      setIsEditModalOpen(false);
      fetchGuests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update guest.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedGuest) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await guestsApi.deleteGuest(selectedGuest._id);
      setSuccessMsg('Guest removed from records.');
      setIsDeleteModalOpen(false);
      setSelectedGuest(null);
      fetchGuests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete guest.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async (id) => {
    try {
      const res = await guestsApi.resendVerificationStaff(id);
      setSuccessMsg(res.data?.message || 'Verification email dispatched to guest.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not resend email.');
    }
  };

  const openEditModal = (guest) => {
    setSelectedGuest(guest);
    setFormData({
      firstName: guest.firstName || '',
      lastName: guest.lastName || '',
      email: guest.email || '',
      phone: guest.phone || '',
      address: guest.address || '',
      nationality: guest.nationality || '',
      identificationType: guest.identificationType || 'passport',
      identificationNumber: guest.identificationNumber || '',
      notes: guest.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const openDetailModal = (guest) => {
    setSelectedGuest(guest);
    setIsDetailModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F8FAFC' }}>
            Guest Management
          </h1>
          <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
            Registered guest directory, identity verification, stay folios, and contact records.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              phone: '',
              address: '',
              nationality: '',
              identificationType: 'passport',
              identificationNumber: '',
              notes: '',
            });
            setIsCreateModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <UserPlus size={16} /> Register New Guest
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
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '280px', maxWidth: '440px', display: 'flex', gap: '0.5rem' }}>
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
              placeholder="Search by name, email, phone, or ID number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="true">Active Guests</option>
            <option value="false">Inactive Profiles</option>
          </select>

          <button onClick={fetchGuests} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Guest Data Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Guest Name</th>
              <th>Email & Contact</th>
              <th>Nationality</th>
              <th>Identification</th>
              <th>Email Verified</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#D6B779' }}>
                  Loading guest profiles...
                </td>
              </tr>
            ) : guests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#A8B8CC' }}>
                  No guest profiles found matching your search.
                </td>
              </tr>
            ) : (
              guests.map((guest) => (
                <tr key={guest._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          backgroundColor: '#102B4C',
                          border: '1px solid #D6B779',
                          color: '#D6B779',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                        }}
                      >
                        {guest.firstName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span style={{ fontWeight: '600', color: '#F8FAFC', display: 'block' }}>
                          {guest.firstName} {guest.lastName}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#A8B8CC' }}>
                          Added {new Date(guest.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <p style={{ color: '#F8FAFC' }}>{guest.email}</p>
                      <p style={{ color: '#A8B8CC', fontSize: '0.78rem' }}>{guest.phone || 'No phone'}</p>
                    </div>
                  </td>
                  <td style={{ color: '#A8B8CC' }}>{guest.nationality || 'Unspecified'}</td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: '#F8FAFC', textTransform: 'capitalize' }}>
                      {guest.identificationType?.replace('_', ' ') || 'None'}:{' '}
                      <strong>{guest.identificationNumber || '—'}</strong>
                    </span>
                  </td>
                  <td>
                    {guest.emailVerified ? (
                      <span className="badge badge-success">Verified</span>
                    ) : (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span className="badge badge-warning">Unverified</span>
                        <button
                          onClick={() => handleResendVerification(guest._id)}
                          title="Resend email verification link"
                          style={{ color: '#D6B779', cursor: 'pointer', padding: 0 }}
                        >
                          <Send size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${guest.isActive ? 'success' : 'danger'}`}>
                      {guest.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => openDetailModal(guest)}
                        className="btn btn-secondary btn-sm"
                        title="View Guest Details"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => openEditModal(guest)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Details"
                      >
                        <Edit2 size={14} />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setSelectedGuest(guest);
                            setIsDeleteModalOpen(true);
                          }}
                          className="btn btn-danger btn-sm"
                          title="Delete Guest"
                        >
                          <Trash2 size={14} />
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

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#A8B8CC' }}>
            Showing page {page} of {totalPages} ({total} total guests)
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary btn-sm"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary btn-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Guest Details Modal */}
      {isDetailModalOpen && selectedGuest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <UserCheck size={20} style={{ color: '#D6B779' }} /> Guest Profile Details
              </h3>
              <button onClick={() => setIsDetailModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #263E59' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#102B4C',
                    border: '2px solid #D6B779',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#D6B779',
                    fontSize: '1.4rem',
                    fontWeight: '700',
                  }}
                >
                  {selectedGuest.firstName?.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: '#F8FAFC' }}>
                    {selectedGuest.firstName} {selectedGuest.lastName}
                  </h3>
                  <span className={`badge badge-${selectedGuest.isActive ? 'success' : 'danger'}`}>
                    {selectedGuest.isActive ? 'Active Profile' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Email</span>
                  <p style={{ color: '#F8FAFC', fontWeight: '500' }}>{selectedGuest.email}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Phone</span>
                  <p style={{ color: '#F8FAFC', fontWeight: '500' }}>{selectedGuest.phone || 'None'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Address</span>
                  <p style={{ color: '#F8FAFC', fontWeight: '500' }}>{selectedGuest.address || 'None'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Nationality</span>
                  <p style={{ color: '#F8FAFC', fontWeight: '500' }}>{selectedGuest.nationality || 'Unspecified'}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Document Type</span>
                  <p style={{ color: '#F8FAFC', fontWeight: '500', textTransform: 'capitalize' }}>
                    {selectedGuest.identificationType?.replace('_', ' ') || 'None'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Document Number</span>
                  <p style={{ color: '#F8FAFC', fontWeight: '500' }}>{selectedGuest.identificationNumber || '—'}</p>
                </div>
              </div>

              {selectedGuest.notes && (
                <div style={{ backgroundColor: '#143253', padding: '1rem', borderRadius: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#D6B779', fontWeight: '600' }}>SPECIAL GUEST PREFERENCES:</span>
                  <p style={{ color: '#F8FAFC', fontSize: '0.88rem', marginTop: '0.3rem' }}>{selectedGuest.notes}</p>
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

      {/* Add Guest Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <UserPlus size={20} style={{ color: '#D6B779' }} /> Register Guest
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Password (Min 8 Chars) *</label>
                    <input
                      type="password"
                      required
                      placeholder="Min 8 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>ID Type</label>
                    <select
                      value={formData.identificationType}
                      onChange={(e) => setFormData({ ...formData, identificationType: e.target.value })}
                    >
                      <option value="passport">Passport</option>
                      <option value="national_id">National ID</option>
                      <option value="driving_license">Driving License</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>ID Number</label>
                    <input
                      type="text"
                      value={formData.identificationNumber}
                      onChange={(e) => setFormData({ ...formData, identificationNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Guest Notes / Preferences</label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Registering...' : 'Register Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Guest Modal */}
      {isEditModalOpen && selectedGuest && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <Edit2 size={20} style={{ color: '#D6B779' }} /> Edit Guest Details
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nationality</label>
                    <input
                      type="text"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedGuest && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ color: '#E45B65' }}>
                <Trash2 size={20} /> Delete Guest Profile
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#A8B8CC', lineHeight: '1.6' }}>
                Are you sure you want to permanently delete the profile for{' '}
                <strong style={{ color: '#F8FAFC' }}>
                  {selectedGuest.firstName} {selectedGuest.lastName}
                </strong>
                ? This action cannot be reversed.
              </p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsDeleteModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleDeleteSubmit} disabled={submitting} className="btn btn-danger">
                {submitting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestManagementPage;
