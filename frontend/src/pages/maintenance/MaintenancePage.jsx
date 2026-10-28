import React, { useState, useEffect } from 'react';
import { maintenanceApi, roomsApi, usersApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench,
  PlusCircle,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  BedDouble,
  X,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

export const MaintenancePage = () => {
  const { isFrontDesk, isMaintenance } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [availableRooms, setAvailableRooms] = useState([]);
  const [maintenanceStaff, setMaintenanceStaff] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    roomId: '',
    title: '',
    description: '',
    category: 'other',
    priority: 'normal',
    assignedToId: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await maintenanceApi.listRequests(params);
      if (res.data?.requests) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not load maintenance requests.');
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const rRes = await roomsApi.listRooms({ active: 'true' });
      setAvailableRooms(rRes.data?.rooms || []);

      const uRes = await usersApi.getAllUsers();
      if (uRes.data?.staff) {
        const ms = uRes.data.staff.filter((s) => s.role === 'maintenance');
        setMaintenanceStaff(ms);
      }
    } catch (e) {
      console.warn('Failed to load maintenance dependencies:', e.message);
    }
  };

  useEffect(() => {
    fetchRequests();
    loadDependencies();
  }, [statusFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomId || !formData.title.trim() || !formData.description.trim()) {
      setErrorMsg('Room, title, and description are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        roomId: formData.roomId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        assignedTo: formData.assignedToId || null,
      };

      const res = await maintenanceApi.createRequest(payload);
      setSuccessMsg(res.data?.message || 'Maintenance request logged successfully!');
      setIsCreateModalOpen(false);
      setFormData({
        roomId: '',
        title: '',
        description: '',
        category: 'other',
        priority: 'normal',
        assignedToId: '',
      });
      fetchRequests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to file maintenance request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveSubmit = async () => {
    if (!selectedReq) return;
    setSubmitting(true);
    try {
      await maintenanceApi.updateRequestStatus(selectedReq._id, {
        status: 'resolved',
        resolutionNotes,
      });
      setSuccessMsg('Maintenance issue marked resolved.');
      setIsResolveModalOpen(false);
      setSelectedReq(null);
      setResolutionNotes('');
      fetchRequests();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (reqId, newStatus) => {
    try {
      await maintenanceApi.updateRequestStatus(reqId, { status: newStatus });
      setSuccessMsg(`Status set to ${newStatus}.`);
      setRequests((prev) =>
        prev.map((r) => (r._id === reqId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not update status.');
    }
  };

  const filtered = requests.filter((r) => {
    const matchesCategory = !categoryFilter || r.category === categoryFilter;
    const matchesPriority = !priorityFilter || r.priority === priorityFilter;
    return matchesCategory && matchesPriority;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F8FAFC' }}>
            Facility & Room Maintenance
          </h1>
          <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
            Plumbing, HVAC, electrical, and appliance engineering incident tracking.
          </p>
        </div>

        {isFrontDesk && (
          <button
            onClick={() => {
              if (availableRooms.length > 0 && !formData.roomId) {
                setFormData((prev) => ({ ...prev, roomId: availableRooms[0]._id }));
              }
              setIsCreateModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <PlusCircle size={16} /> Log Maintenance Issue
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="toast-banner toast-error">
          <AlertTriangle size={18} />
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
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="">All Categories</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="hvac">HVAC / Air Con</option>
            <option value="furniture">Furniture</option>
            <option value="appliance">Appliance</option>
            <option value="safety">Safety</option>
            <option value="other">Other</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: '140px' }}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <button onClick={fetchRequests} className="btn btn-secondary btn-sm" title="Refresh">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Requests Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Issue Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Assigned Technician</th>
              <th>Status</th>
              <th>Logged Date</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#D6B779' }}>
                  Loading maintenance issues...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#A8B8CC' }}>
                  No maintenance requests recorded.
                </td>
              </tr>
            ) : (
              filtered.map((req) => (
                <tr key={req._id}>
                  <td>
                    <span style={{ fontWeight: '700', color: '#D6B779' }}>
                      Room #{req.room?.roomNumber || '—'}
                    </span>
                  </td>
                  <td>
                    <p style={{ fontWeight: '600', color: '#F8FAFC' }}>{req.title}</p>
                    <p style={{ fontSize: '0.75rem', color: '#A8B8CC', maxWidth: '280px' }}>
                      {req.description}
                    </p>
                  </td>
                  <td>
                    <span style={{ textTransform: 'capitalize', color: '#A8B8CC' }}>
                      {req.category}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${req.priority === 'urgent' ? 'danger' : req.priority === 'high' ? 'warning' : 'info'}`}>
                      {req.priority}
                    </span>
                  </td>
                  <td>
                    {req.assignedTo ? (
                      <span style={{ color: '#F8FAFC' }}>{req.assignedTo.name}</span>
                    ) : (
                      <span style={{ color: '#E6AA45', fontStyle: 'italic', fontSize: '0.82rem' }}>
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${req.status}`}>
                      {req.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#A8B8CC' }}>
                    {new Date(req.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      {req.status === 'open' && (
                        <button
                          onClick={() => handleStatusChange(req._id, 'in_progress')}
                          className="btn btn-secondary btn-sm"
                          title="Start work"
                        >
                          Start Work
                        </button>
                      )}
                      {req.status !== 'resolved' && (
                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setIsResolveModalOpen(true);
                          }}
                          className="btn btn-primary btn-sm"
                          title="Resolve and file notes"
                        >
                          <CheckCircle size={13} /> Resolve
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

      {/* Log Request Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <Wrench size={20} style={{ color: '#D6B779' }} /> File Maintenance Request
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Room *</label>
                  <select
                    required
                    value={formData.roomId}
                    onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  >
                    <option value="">-- Choose Room --</option>
                    {availableRooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        Room #{r.roomNumber} ({r.roomType})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Issue Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master bathroom faucet dripping"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="hvac">HVAC / Climate Control</option>
                      <option value="furniture">Furniture</option>
                      <option value="appliance">Appliance / TV</option>
                      <option value="safety">Safety / Door Locks</option>
                      <option value="other">Other Facility</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Assign to Technician</label>
                  <select
                    value={formData.assignedToId}
                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  >
                    <option value="">-- Unassigned (Engineering Queue) --</option>
                    {maintenanceStaff.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Detailed Problem Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe specific symptoms, urgency, and instructions..."
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
                  {submitting ? 'Submitting...' : 'File Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Issue Modal */}
      {isResolveModalOpen && selectedReq && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>
                <CheckCircle size={20} style={{ color: '#27AE75' }} /> Resolve Issue #{selectedReq.room?.roomNumber}
              </h3>
              <button onClick={() => setIsResolveModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#F8FAFC', fontWeight: '600', marginBottom: '0.5rem' }}>
                {selectedReq.title}
              </p>
              <div className="form-group">
                <label>Resolution Notes / Parts Replaced</label>
                <textarea
                  rows={3}
                  placeholder="e.g. O-ring replaced and water pressure tested. System operational."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setIsResolveModalOpen(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleResolveSubmit} disabled={submitting} className="btn btn-primary">
                {submitting ? 'Resolving...' : 'Confirm Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
