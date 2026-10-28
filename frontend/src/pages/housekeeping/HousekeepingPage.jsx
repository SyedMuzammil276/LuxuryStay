import React, { useState, useEffect } from 'react';
import { housekeepingApi, roomsApi, usersApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCw,
} from 'lucide-react';

// Role ko normalize karta hai: "House_Keeping" / "house keeping" -> "housekeeping"
const normalizeRole = (role) => String(role || '').toLowerCase().replace(/[\s_-]/g, '');

// Different backend response shapes handle karta hai
const extractUserList = (data) => {
  if (Array.isArray(data)) return data;
  return data?.staff || data?.users || data?.data || [];
};

export const HousekeepingPage = () => {
  const { user, isFrontDesk } = useAuth();

  // Admin, manager aur receptionist teeno task assign kar sakte hain
  const canAssign =
    !!isFrontDesk || ['admin', 'manager', 'receptionist'].includes(normalizeRole(user?.role));

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [housekeepingStaff, setHousekeepingStaff] = useState([]);
  const [staffError, setStaffError] = useState('');

  // Form
  const [formData, setFormData] = useState({
    roomId: '',
    taskType: 'routine_cleaning',
    priority: 'normal',
    assignedToId: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await housekeepingApi.listTasks(params);
      if (res.data?.tasks) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not load housekeeping tasks.');
    } finally {
      setLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const rRes = await roomsApi.listRooms({ active: 'true' });
      setAvailableRooms(rRes.data?.rooms || []);
    } catch (e) {
      console.warn('Failed to load rooms:', e.message);
    }
  };

  const loadStaff = async () => {
    setStaffError('');
    try {
      const uRes = await usersApi.getAssignableStaff('housekeeping');
      const list = extractUserList(uRes.data);
      const hk = list.filter((s) => normalizeRole(s.role) === 'housekeeping');
      setHousekeepingStaff(hk);
    } catch (e) {
      console.warn('Failed to load housekeeping staff:', e.message);
      setStaffError(
        e.response?.status === 403
          ? 'Aapko staff list dekhne ki permission nahi hai (403). Backend route check karein.'
          : e.response?.data?.message || 'Could not load housekeeping staff.'
      );
    }
  };

  // Tasks filter badalne par reload hon
  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  // Rooms sirf ek dafa
  useEffect(() => {
    loadRooms();
  }, []);

  // Staff tab load hoga jab user ka role maloom ho aur wo assign kar sakta ho
  useEffect(() => {
    if (canAssign) loadStaff();
  }, [canAssign]);

  const resetForm = () =>
    setFormData({
      roomId: '',
      taskType: 'routine_cleaning',
      priority: 'normal',
      assignedToId: '',
      notes: '',
    });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomId) {
      setErrorMsg('Please select a room.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        roomId: formData.roomId,
        taskType: formData.taskType,
        priority: formData.priority,
        assignedTo: formData.assignedToId || null,
        notes: formData.notes,
      };

      const res = await housekeepingApi.createTask(payload);
      setSuccessMsg(res.data?.message || 'Housekeeping task assigned.');
      setIsCreateModalOpen(false);
      resetForm();
      fetchTasks();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await housekeepingApi.updateTaskStatus(taskId, newStatus);
      setSuccessMsg(`Task marked ${newStatus.replace('_', ' ')}.`);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Status update failed.');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesPriority = !priorityFilter || t.priority === priorityFilter;
    const matchesType = !typeFilter || t.taskType === typeFilter;
    return matchesPriority && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F8FAFC' }}>
            Housekeeping Management
          </h1>
          <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
            Room turn-down, sanitation, linen replenishment, and deep cleaning schedules.
          </p>
        </div>

        {canAssign && (
          <button
            onClick={() => {
              if (availableRooms.length > 0 && !formData.roomId) {
                setFormData((prev) => ({ ...prev, roomId: availableRooms[0]._id }));
              }
              setIsCreateModalOpen(true);
              if (housekeepingStaff.length === 0) loadStaff();
            }}
            className="btn btn-primary"
          >
            <PlusCircle size={16} /> Assign Housekeeping Task
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
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
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

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '170px' }}
          >
            <option value="">All Cleaning Types</option>
            <option value="checkout_cleaning">Checkout Cleaning</option>
            <option value="routine_cleaning">Routine Cleaning</option>
            <option value="deep_cleaning">Deep Cleaning</option>
            <option value="inspection">Inspection</option>
            <option value="linen_change">Linen Change</option>
          </select>
        </div>

        <button onClick={fetchTasks} className="btn btn-secondary btn-sm" title="Refresh">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Task List Table */}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Room</th>
              <th>Task Type</th>
              <th>Priority</th>
              <th>Assigned Staff</th>
              <th>Status</th>
              <th>Instructions / Notes</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#D6B779' }}>
                  Loading housekeeping tasks...
                </td>
              </tr>
            ) : filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: '#A8B8CC' }}>
                  No housekeeping tasks found matching filters.
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task._id}>
                  <td>
                    <span style={{ fontWeight: '700', color: '#D6B779' }}>
                      Room #{task.room?.roomNumber || '—'}
                    </span>
                    <p style={{ fontSize: '0.74rem', color: '#A8B8CC', textTransform: 'capitalize' }}>
                      {task.room?.roomType}
                    </p>
                  </td>
                  <td>
                    <span style={{ color: '#F8FAFC', textTransform: 'capitalize', fontWeight: '500' }}>
                      {task.taskType?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${task.priority === 'urgent' ? 'danger' : task.priority === 'high' ? 'warning' : 'info'}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    {task.assignedTo ? (
                      <span style={{ color: '#F8FAFC' }}>{task.assignedTo.name}</span>
                    ) : (
                      <span style={{ color: '#E6AA45', fontStyle: 'italic', fontSize: '0.82rem' }}>
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${task.status}`}>
                      {task.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#A8B8CC', maxWidth: '220px' }}>
                    {task.notes || 'Standard protocol'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                      {task.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(task._id, 'in_progress')}
                          className="btn btn-secondary btn-sm"
                          title="Start Cleaning"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusChange(task._id, 'completed')}
                          className="btn btn-primary btn-sm"
                          title="Mark Completed"
                        >
                          <CheckCircle size={13} /> Complete
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

      {/* Assign Task Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <Sparkles size={20} style={{ color: '#D6B779' }} /> Assign Cleaning Task
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
                        Room #{r.roomNumber} ({r.roomType}, {r.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Task Type</label>
                    <select
                      value={formData.taskType}
                      onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                    >
                      <option value="checkout_cleaning">Checkout Cleaning</option>
                      <option value="routine_cleaning">Routine Cleaning</option>
                      <option value="deep_cleaning">Deep Cleaning</option>
                      <option value="inspection">Inspection</option>
                      <option value="linen_change">Linen Change</option>
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
                  <label>Assign to Housekeeper</label>
                  <select
                    value={formData.assignedToId}
                    onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  >
                    <option value="">-- Unassigned (General Pool) --</option>
                    {housekeepingStaff.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                  {staffError && (
                    <p style={{ color: '#E6AA45', fontSize: '0.78rem', marginTop: '0.35rem' }}>
                      {staffError}
                    </p>
                  )}
                  {!staffError && housekeepingStaff.length === 0 && (
                    <p style={{ color: '#A8B8CC', fontSize: '0.78rem', marginTop: '0.35rem' }}>
                      Koi housekeeping staff nahi mila.
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label>Instructions & Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. VIP guest arrival, extra feather pillows required..."
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
                  {submitting ? 'Assigning...' : 'Dispatch Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HousekeepingPage;