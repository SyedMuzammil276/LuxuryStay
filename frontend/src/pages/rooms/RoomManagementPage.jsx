import React, { useState, useEffect } from 'react';
import { roomsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import {
  BedDouble,
  PlusCircle,
  Search,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Users,
  DollarSign,
  Sparkles,
  Wrench,
  X,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export const RoomManagementPage = () => {
  const { isManager, isFrontDesk, isHousekeeping, isMaintenance, isGuest } = useAuth();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [formData, setFormData] = useState({
    roomNumber: '',
    roomType: 'double',
    floor: 1,
    capacity: 2,
    pricePerNight: '',
    status: 'available',
    amenities: '',
    description: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.roomType = typeFilter;
      if (activeFilter !== '') params.active = activeFilter;

      const res = await roomsApi.listRooms(params);
      if (res.data?.rooms) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not load rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [statusFilter, typeFilter, activeFilter]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        ...formData,
        floor: Number(formData.floor),
        capacity: Number(formData.capacity),
        pricePerNight: Number(formData.pricePerNight),
        amenities: formData.amenities
          ? formData.amenities.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
      };

      const res = await roomsApi.createRoom(payload);
      setSuccessMsg(res.data?.message || 'Room added to inventory!');
      setIsCreateModalOpen(false);
      fetchRooms();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create room.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return;
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        ...formData,
        floor: Number(formData.floor),
        capacity: Number(formData.capacity),
        pricePerNight: Number(formData.pricePerNight),
        amenities: formData.amenities
          ? formData.amenities.split(',').map((a) => a.trim()).filter(Boolean)
          : [],
      };

      const res = await roomsApi.updateRoom(selectedRoom._id, payload);
      setSuccessMsg(res.data?.message || 'Room updated successfully!');
      setIsEditModalOpen(false);
      fetchRooms();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update room.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (roomId, newStatus) => {
    try {
      await roomsApi.updateRoomStatus(roomId, newStatus);
      setSuccessMsg(`Room status updated to ${newStatus}.`);
      setRooms((prev) =>
        prev.map((r) => (r._id === roomId ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update room status.');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedRoom) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      await roomsApi.deleteRoom(selectedRoom._id);
      setSuccessMsg('Room removed from inventory.');
      setIsDeleteModalOpen(false);
      setSelectedRoom(null);
      fetchRooms();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete room.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setFormData({
      roomNumber: room.roomNumber || '',
      roomType: room.roomType || 'double',
      floor: room.floor || 1,
      capacity: room.capacity || 2,
      pricePerNight: room.pricePerNight || '',
      status: room.status || 'available',
      amenities: room.amenities ? room.amenities.join(', ') : '',
      description: room.description || '',
      isActive: room.isActive ?? true,
    });
    setIsEditModalOpen(true);
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) =>
    r.roomNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F8FAFC' }}>
            Room & Inventory Management
          </h1>
          <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
            Monitor real-time room occupancies, tariffs, housekeeping states, and maintenance alerts.
          </p>
        </div>

        {isManager && (
          <button
            onClick={() => {
              setFormData({
                roomNumber: '',
                roomType: 'double',
                floor: 1,
                capacity: 2,
                pricePerNight: '',
                status: 'available',
                amenities: 'King Bed, City View, Wi-Fi, Mini Bar',
                description: '',
                isActive: true,
              });
              setIsCreateModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <PlusCircle size={16} /> Add New Room
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

      {/* Filter & View Switcher Bar */}
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
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '240px', maxWidth: '360px' }}>
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
              placeholder="Search by room #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '145px' }}
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '135px' }}
          >
            <option value="">All Types</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="twin">Twin</option>
            <option value="deluxe">Deluxe</option>
            <option value="suite">Suite</option>
            <option value="family">Family</option>
          </select>

          {/* Active Filter */}
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            style={{ width: '130px' }}
          >
            <option value="">All States</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive</option>
          </select>

          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#061529',
              border: '1px solid #263E59',
              borderRadius: '6px',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '0.35rem 0.6rem',
                borderRadius: '4px',
                color: viewMode === 'grid' ? '#061529' : '#A8B8CC',
                backgroundColor: viewMode === 'grid' ? '#D6B779' : 'transparent',
              }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '0.35rem 0.6rem',
                borderRadius: '4px',
                color: viewMode === 'table' ? '#061529' : '#A8B8CC',
                backgroundColor: viewMode === 'table' ? '#D6B779' : 'transparent',
              }}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>

          <button onClick={fetchRooms} className="btn btn-secondary btn-sm" title="Refresh">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#D6B779' }}>
              Loading luxury rooms inventory...
            </div>
          ) : filteredRooms.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#A8B8CC' }}>
              No rooms match the applied filters.
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div
                key={room._id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  padding: 0,
                  border: '1px solid #263E59',
                }}
              >
                {/* Room Card Top Header */}
                <div
                  style={{
                    padding: '1.25rem',
                    background: 'linear-gradient(135deg, #102B4C 0%, #143253 100%)',
                    borderBottom: '1px solid #263E59',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span
                      style={{
                        backgroundColor: '#061529',
                        color: '#D6B779',
                        padding: '0.2rem 0.65rem',
                        borderRadius: '14px',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                      }}
                    >
                      ROOM #{room.roomNumber}
                    </span>
                    <h3
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '1.3rem',
                        color: '#F8FAFC',
                        textTransform: 'capitalize',
                        marginTop: '0.4rem',
                      }}
                    >
                      {typeof room.roomType === 'string' && room.roomType.length < 15 ? room.roomType : 'Deluxe'}
                    </h3>
                  </div>

                  <span className={`badge badge-${(room.status || 'available').toLowerCase()}`}>
                    {room.status}
                  </span>
                </div>

                {/* Details Body */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                      paddingBottom: '0.85rem',
                      borderBottom: '1px solid #263E59',
                      fontSize: '0.8rem',
                      color: '#A8B8CC',
                    }}
                  >
                    <div>
                      <span>Floor</span>
                      <p style={{ color: '#F8FAFC', fontWeight: '600' }}>{room.floor}</p>
                    </div>
                    <div>
                      <span>Capacity</span>
                      <p style={{ color: '#F8FAFC', fontWeight: '600' }}>{room.capacity} Guests</p>
                    </div>
                    <div>
                      <span>Tariff</span>
                      <p style={{ color: '#D6B779', fontWeight: '700' }}>${room.pricePerNight || room.price}/nt</p>
                    </div>
                  </div>

                  {room.description && (
                    <p style={{ fontSize: '0.84rem', color: '#A8B8CC', marginBottom: '1rem', lineHeight: '1.4' }}>
                      {room.description}
                    </p>
                  )}

                  {/* Amenities */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                    {(room.amenities || []).slice(0, 4).map((a, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.72rem',
                          backgroundColor: '#143253',
                          color: '#F8FAFC',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>

                  {/* Operational Controls & Status Quick Changer */}
                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #263E59', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    {!isGuest && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.72rem', color: '#A8B8CC' }}>Status:</span>
                        <select
                          value={room.status}
                          onChange={(e) => handleQuickStatusChange(room._id, e.target.value)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            height: '28px',
                            backgroundColor: '#061529',
                            color: '#D6B779',
                            borderColor: '#263E59',
                          }}
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="reserved">Reserved</option>
                          <option value="cleaning">Cleaning</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      {isManager && (
                        <>
                          <button
                            onClick={() => openEditModal(room)}
                            className="btn btn-secondary btn-sm"
                            title="Edit Room"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRoom(room);
                              setIsDeleteModalOpen(true);
                            }}
                            className="btn btn-danger btn-sm"
                            title="Delete Room"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Room #</th>
                <th>Type</th>
                <th>Floor</th>
                <th>Capacity</th>
                <th>Price / Night</th>
                <th>Current Status</th>
                <th>Active</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#D6B779' }}>
                    Loading rooms inventory...
                  </td>
                </tr>
              ) : filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem', color: '#A8B8CC' }}>
                    No rooms found.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr key={room._id}>
                    <td style={{ fontWeight: '700', color: '#D6B779' }}>
                      #{room.roomNumber}
                    </td>
                    <td style={{ textTransform: 'capitalize', color: '#F8FAFC' }}>
                      {room.roomType}
                    </td>
                    <td style={{ color: '#A8B8CC' }}>Floor {room.floor}</td>
                    <td style={{ color: '#A8B8CC' }}>{room.capacity} Guests</td>
                    <td style={{ fontWeight: '600', color: '#D6B779' }}>
                      ${room.pricePerNight || room.price}
                    </td>
                    <td>
                      {!isGuest ? (
                        <select
                          value={(room.status || 'available').toLowerCase()}
                          onChange={(e) => handleQuickStatusChange(room._id, e.target.value)}
                          style={{
                            padding: '0.2rem 0.5rem',
                            fontSize: '0.78rem',
                            backgroundColor: '#061529',
                            color: '#D6B779',
                            borderRadius: '4px',
                            borderColor: '#263E59',
                          }}
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="reserved">Reserved</option>
                          <option value="cleaning">Cleaning</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      ) : (
                        <span className={`badge badge-${(room.status || 'available').toLowerCase()}`}>{room.status}</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${room.isActive ? 'success' : 'danger'}`}>
                        {room.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isManager && (
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => openEditModal(room)}
                            className="btn btn-secondary btn-sm"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedRoom(room);
                              setIsDeleteModalOpen(true);
                            }}
                            className="btn btn-danger btn-sm"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Room Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <PlusCircle size={20} style={{ color: '#D6B779' }} /> Add Room to Inventory
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Room Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 401"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Room Type *</label>
                    <select
                      value={formData.roomType}
                      onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    >
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="twin">Twin</option>
                      <option value="deluxe">Deluxe</option>
                      <option value="suite">Suite</option>
                      <option value="family">Family</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Floor Number</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.floor}
                      onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Guest Capacity *</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price Per Night ($) *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      placeholder="e.g. 250"
                      value={formData.pricePerNight}
                      onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="available">Available</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Amenities (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="King Bed, Balcony, Jacuzzi, Mini Bar, Wi-Fi"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe suite features, views, and luxurious touches..."
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
                  {submitting ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {isEditModalOpen && selectedRoom && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>
                <Edit2 size={20} style={{ color: '#D6B779' }} /> Edit Room #{selectedRoom.roomNumber}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Room Number</label>
                    <input
                      type="text"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Room Type</label>
                    <select
                      value={formData.roomType}
                      onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    >
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="twin">Twin</option>
                      <option value="deluxe">Deluxe</option>
                      <option value="suite">Suite</option>
                      <option value="family">Family</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Capacity</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Price Per Night ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.pricePerNight}
                      onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Active State</label>
                    <select
                      value={String(formData.isActive)}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    >
                      <option value="true">Active Inventory</option>
                      <option value="false">Inactive / Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Amenities</label>
                  <input
                    type="text"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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

      {/* Delete Room Modal */}
      {isDeleteModalOpen && selectedRoom && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ color: '#E45B65' }}>
                <Trash2 size={20} /> Delete Room #{selectedRoom.roomNumber}
              </h3>
              <button onClick={() => setIsDeleteModalOpen(false)} style={{ color: '#A8B8CC' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#A8B8CC', lineHeight: '1.6' }}>
                Are you sure you want to remove Room #{selectedRoom.roomNumber} from inventory?
                <br />
                <span style={{ fontSize: '0.8rem', color: '#E6AA45' }}>
                  Note: Backend business logic prevents deleting rooms that are currently occupied or reserved.
                </span>
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

export default RoomManagementPage;
