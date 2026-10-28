import React, { useState, useEffect } from 'react';
import { usersApi } from '../../api/endpoints';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Mail,
  Lock,
  User,
  X,
} from 'lucide-react';

export const StaffManagementPage = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'receptionist',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await usersApi.getAllUsers();
      if (res.data?.staff) {
        setStaffList(res.data.staff);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not load staff members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await usersApi.createStaff(formData);
      setSuccessMsg(res.data?.message || 'Staff account created successfully!');
      setIsCreateModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'receptionist' });
      fetchStaff();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create staff account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await usersApi.updateStaff(selectedStaff._id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });
      setSuccessMsg(res.data?.message || 'Staff account updated.');
      setIsEditModalOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update staff account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await usersApi.toggleStaffStatus(id);
      setSuccessMsg(res.data?.message || 'Staff status toggled.');
      setStaffList((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isActive: !s.isActive } : s))
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const openEditModal = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      role: staff.role,
      password: '',
    });
    setIsEditModalOpen(true);
  };

  // Filtered staff list
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F8FAFC' }}>
            Staff & User Management
          </h1>
          <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
            Manage hotel personnel, assign operational roles, and enforce security policies.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ name: '', email: '', password: '', role: 'receptionist' });
            setIsCreateModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <UserPlus size={16} /> Add Staff Account
        </button>
      </div>

      {/* Notifications / Alerts */}
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

      {/* Controls & Filters Bar */}
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
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '260px', maxWidth: '400px' }}>
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
              placeholder="Search by staff name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="all">All Roles</option>
            <option value="manager">Manager</option>
            <option value="receptionist">Receptionist</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <button onClick={fetchStaff} className="btn btn-secondary btn-sm" title="Refresh list">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Contact Email</th>
              <th>Assigned Role</th>
              <th>Status</th>
              <th>Created Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#D6B779' }}>
                  Loading hotel staff accounts...
                </td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: '#A8B8CC' }}>
                  No staff accounts found matching query.
                </td>
              </tr>
            ) : (
              filteredStaff.map((staff) => (
                <tr key={staff._id}>
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
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: '600', color: '#F8FAFC' }}>{staff.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#A8B8CC' }}>{staff.email}</td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.65rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        backgroundColor: '#143253',
                        color: '#D6B779',
                        border: '1px solid rgba(214, 183, 121, 0.3)',
                      }}
                    >
                      {staff.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${staff.isActive ? 'success' : 'danger'}`}>
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#A8B8CC' }}>
                    {new Date(staff.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                      <button
                        onClick={() => openEditModal(staff)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Staff Member"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(staff._id)}
                        className={`btn btn-sm ${staff.isActive ? 'btn-danger' : 'btn-secondary'}`}
                        title={staff.isActive ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {staff.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Staff Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <UserPlus size={20} style={{ color: '#D6B779' }} /> Add Staff Account
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="staffName">Full Name *</label>
                  <input
                    id="staffName"
                    type="text"
                    required
                    placeholder="e.g. Sarah Jenkins"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="staffEmail">Official Email *</label>
                  <input
                    id="staffEmail"
                    type="email"
                    required
                    placeholder="s.jenkins@luxurystay.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="staffPassword">Initial Password *</label>
                  <input
                    id="staffPassword"
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="staffRole">Operational Role *</label>
                  <select
                    id="staffRole"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="manager">Manager (Property & Financial Control)</option>
                    <option value="receptionist">Receptionist (Front Desk & Bookings)</option>
                    <option value="housekeeping">Housekeeping (Room Cleaning & Inspections)</option>
                    <option value="maintenance">Maintenance (Facility Repairs & Engineering)</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditModalOpen && selectedStaff && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <Edit2 size={20} style={{ color: '#D6B779' }} /> Edit Staff Member
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="editName">Full Name</label>
                  <input
                    id="editName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editEmail">Official Email</label>
                  <input
                    id="editEmail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editRole">Assigned Role</label>
                  <select
                    id="editRole"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="manager">Manager</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementPage;
