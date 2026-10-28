import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  PlusCircle,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  X,
  RefreshCw,
  Send,
} from 'lucide-react';

export const NotificationsPage = () => {
  const { isManager } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readFilter, setReadFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Manual Announcement Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    category: 'general',
    type: 'info',
    targetRole: 'all',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (readFilter !== '') params.read = readFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await notificationsApi.listNotifications(params);
      if (res.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [readFilter, categoryFilter]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      setErrorMsg('Failed to mark notification as read.');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setSuccessMsg('All notifications marked as read.');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setErrorMsg('Failed to mark all as read.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setSuccessMsg('Notification removed.');
    } catch (err) {
      setErrorMsg('Could not delete notification.');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await notificationsApi.createManualNotification(formData);
      setSuccessMsg(res.data?.message || 'Announcement broadcasted successfully!');
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        message: '',
        category: 'general',
        type: 'info',
        targetRole: 'all',
      });
      fetchNotifications();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to dispatch notification.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} style={{ color: '#27AE75' }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: '#E6AA45' }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: '#E45B65' }} />;
      default:
        return <Info size={18} style={{ color: '#55A7E8' }} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F8FAFC' }}>
            Notification Center
          </h1>
          <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
            Operational dispatches, reservation activity, housekeeping updates, and announcements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleMarkAllRead} className="btn btn-secondary btn-sm">
            <CheckCheck size={14} /> Mark All Read
          </button>
          {isManager && (
            <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary btn-sm">
              <PlusCircle size={14} /> Broadcast Announcement
            </button>
          )}
        </div>
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
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="">All Statuses</option>
            <option value="false">Unread Only</option>
            <option value="true">Read Only</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Categories</option>
            <option value="reservation">Reservation</option>
            <option value="room">Room</option>
            <option value="billing">Billing</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="maintenance">Maintenance</option>
            <option value="guest">Guest</option>
            <option value="system">System</option>
          </select>
        </div>

        <button onClick={fetchNotifications} className="btn btn-secondary btn-sm" title="Refresh">
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#D6B779' }}>
            Loading live notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#A8B8CC' }}>
            <Bell size={40} style={{ color: '#D6B779', margin: '0 auto 1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.1rem', color: '#F8FAFC', marginBottom: '0.35rem' }}>
              No Notifications Found
            </h3>
            <p style={{ fontSize: '0.85rem' }}>You're completely caught up with all property events.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '1rem',
                backgroundColor: n.read ? '#0D2340' : 'rgba(20, 50, 83, 0.85)',
                borderLeft: n.read ? '1px solid #263E59' : '4px solid #D6B779',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ marginTop: '2px' }}>{getSeverityIcon(n.type)}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontSize: '0.98rem', fontWeight: n.read ? '500' : '700', color: '#F8FAFC' }}>
                      {n.title}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        textTransform: 'uppercase',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: '#061529',
                        color: '#D6B779',
                      }}
                    >
                      {n.category}
                    </span>
                    {!n.read && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D6B779' }} />
                    )}
                  </div>
                  <p style={{ color: '#A8B8CC', fontSize: '0.88rem', lineHeight: '1.5' }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '0.4rem', display: 'block' }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                {!n.read && (
                  <button
                    onClick={() => handleMarkRead(n._id)}
                    className="btn btn-secondary btn-sm"
                    title="Mark as Read"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n._id)}
                  className="btn btn-danger btn-sm"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Announcement Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <Send size={20} style={{ color: '#D6B779' }} /> Broadcast Hotel Announcement
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAnnouncement}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Announcement Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Executive VIP Delegations Arriving at 3 PM"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Target Department / Role</label>
                    <select
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    >
                      <option value="all">All Hotel Staff & Guests</option>
                      <option value="receptionist">Front Desk Receptionists</option>
                      <option value="housekeeping">Housekeeping Department</option>
                      <option value="maintenance">Maintenance Engineering</option>
                      <option value="manager">Management Only</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Severity Level</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option value="info">Informational (Blue)</option>
                      <option value="success">Success / Milestone (Green)</option>
                      <option value="warning">Warning / Alert (Amber)</option>
                      <option value="error">Critical / Urgent (Red)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Message Content *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Enter dispatch message..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Broadcasting...' : 'Send Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
