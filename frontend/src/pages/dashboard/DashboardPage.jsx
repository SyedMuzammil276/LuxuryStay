import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reportsApi, reservationsApi, housekeepingApi, maintenanceApi, roomsApi } from '../../api/endpoints';
import {
  BedDouble,
  Users,
  CalendarCheck,
  Percent,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  Wrench,
  Receipt,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Crown,
  Globe,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const DashboardPage = () => {
  const { user, isGuest, isManager, isFrontDesk } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [roomTypeStats, setRoomTypeStats] = useState([]);
  const [recentReservations, setRecentReservations] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentMaintenance, setRecentMaintenance] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      if (isGuest) {
        // Guest specific dashboard: fetch their reservations
        const resRes = await reservationsApi.listMyReservations();
        setRecentReservations(resRes.data?.reservations || []);
      } else {
        // Staff/Admin/Manager dashboard
        const promises = [
          isManager ? reportsApi.getDashboardReport() : Promise.resolve({ data: null }),
          isManager ? reportsApi.getRoomReport() : Promise.resolve({ data: null }),
          reservationsApi.listReservations({ limit: 5 }),
          housekeepingApi.listTasks({ limit: 4 }),
          maintenanceApi.listRequests({ limit: 4 }),
        ];

        // Also fetch rooms to calculate real stats for non-manager staff
        if (!isManager) {
          promises.push(roomsApi.listRooms());
        }

        const [repRes, roomRepRes, resRes, taskRes, maintRes, staffRoomsRes] = await Promise.allSettled(promises);

        if (repRes.status === 'fulfilled' && repRes.value?.data?.summary) {
          setReport(repRes.value.data);
        } else if (staffRoomsRes && staffRoomsRes.status === 'fulfilled' && staffRoomsRes.value?.data?.rooms) {
          const allRooms = staffRoomsRes.value.data.rooms;
          const statusCounts = {};
          allRooms.forEach((r) => {
            const st = (r.status || '').toLowerCase();
            statusCounts[st] = (statusCounts[st] || 0) + 1;
          });
          setReport({
            summary: {
              totalRooms: allRooms.length,
              availableRooms: statusCounts['available'] || 0,
              occupiedRooms: statusCounts['occupied'] || 0,
              reservedRooms: statusCounts['reserved'] || 0,
              cleaningRooms: statusCounts['cleaning'] || 0,
              maintenanceRooms: statusCounts['maintenance'] || 0,
              activeStaff: 0,
              occupancyRate: allRooms.length > 0 ? Number(((statusCounts['occupied'] || 0) / allRooms.length * 100).toFixed(1)) : 0,
            }
          });
        }

        if (roomRepRes.status === 'fulfilled' && roomRepRes.value?.data?.rooms) {
          const typeMap = {};
          roomRepRes.value.data.rooms.forEach((r) => {
            const t = r.roomType || 'Standard';
            if (!typeMap[t]) {
              typeMap[t] = { type: t.toUpperCase(), totalRooms: 0, totalPrice: 0, count: 0 };
            }
            typeMap[t].totalRooms += r.totalRooms || 0;
            typeMap[t].totalPrice += (r.averagePricePerNight || 0) * (r.totalRooms || 1);
            typeMap[t].count += r.totalRooms || 1;
          });
          const formatted = Object.values(typeMap).map((item) => ({
            type: item.type,
            rooms: item.totalRooms,
            avgRate: item.count > 0 ? Math.round(item.totalPrice / item.count) : 0,
          }));
          setRoomTypeStats(formatted);
        }

        if (resRes.status === 'fulfilled') {
          setRecentReservations(resRes.value.data?.reservations || []);
        }

        if (taskRes.status === 'fulfilled') {
          setRecentTasks(taskRes.value.data?.tasks || []);
        }

        if (maintRes.status === 'fulfilled') {
          setRecentMaintenance(maintRes.value.data?.requests || []);
        }
      }
    } catch (err) {
      setErrorMsg('Could not refresh some dashboard metrics.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Derived statistics directly from real database records (defaults to 0)
  const summary = report?.summary || {
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    reservedRooms: 0,
    cleaningRooms: 0,
    maintenanceRooms: 0,
    activeStaff: 0,
    occupancyRate: 0,
    totalGuests: 0,
  };

  // Status distribution data for pie chart
  const roomStatusData = [
    { name: 'Available', value: summary.availableRooms || 0, color: '#27AE75' },
    { name: 'Occupied', value: summary.occupiedRooms || 0, color: '#E45B65' },
    { name: 'Reserved', value: summary.reservedRooms || 0, color: '#55A7E8' },
    { name: 'Cleaning', value: summary.cleaningRooms || 0, color: '#E6AA45' },
    { name: 'Maintenance', value: summary.maintenanceRooms || 0, color: '#9E9E9E' },
  ].filter((d) => d.value > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner / Welcome Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#F8FAFC', letterSpacing: '-0.02em' }}>
              Welcome back, {user?.name}
            </h1>
            <span
              style={{
                backgroundColor: 'rgba(214, 183, 121, 0.15)',
                color: '#D6B779',
                border: '1px solid rgba(214, 183, 121, 0.3)',
                padding: '0.2rem 0.65rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                fontWeight: '700',
              }}
            >
              {user?.role}
            </span>
          </div>
          <p style={{ color: '#A8B8CC', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {isGuest
              ? 'Manage your personalized stay, in-room amenities, and billing receipts.'
              : 'Five-Star Operations Overview & Live Property Statistics'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* View Hotel Front Page Button */}
          <Link
            to="/"
            className="btn btn-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(135deg, rgba(214,183,121,0.15) 0%, rgba(214,183,121,0.08) 100%)',
              border: '1px solid rgba(214,183,121,0.4)',
              color: '#D6B779',
              borderRadius: '8px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.82rem',
              fontWeight: '600',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(214,183,121,0.2)';
              e.currentTarget.style.borderColor = '#D6B779';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(214,183,121,0.15) 0%, rgba(214,183,121,0.08) 100%)';
              e.currentTarget.style.borderColor = 'rgba(214,183,121,0.4)';
            }}
          >
            <Globe size={14} /> Hotel Website <ExternalLink size={12} />
          </Link>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Data
          </button>

          {!isGuest && (
            <>
              <button
                onClick={() => navigate('/reservations?action=new')}
                className="btn btn-primary btn-sm"
              >
                <PlusCircle size={15} /> New Reservation
              </button>
              <button
                onClick={() => navigate('/guests?action=new')}
                className="btn btn-secondary btn-sm"
              >
                <Users size={15} /> Add Guest
              </button>
            </>
          )}

          {isGuest && (
            <button
              onClick={() => navigate('/reservations?action=new')}
              className="btn btn-primary btn-sm"
            >
              <CalendarCheck size={15} /> Book a Suite
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="toast-banner toast-error">
          <AlertTriangle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Metric Stat Cards Grid */}
      {!isGuest ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {/* Total Rooms */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: 'rgba(214, 183, 121, 0.12)',
                border: '1px solid rgba(214, 183, 121, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D6B779',
                flexShrink: 0,
              }}
            >
              <BedDouble size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#A8B8CC', textTransform: 'uppercase' }}>
                Total Rooms
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#F8FAFC' }}>
                {summary.totalRooms || 0}
              </p>
            </div>
          </div>

          {/* Available Rooms */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: 'rgba(39, 174, 117, 0.12)',
                border: '1px solid rgba(39, 174, 117, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#27AE75',
                flexShrink: 0,
              }}
            >
              <CheckCircle size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#A8B8CC', textTransform: 'uppercase' }}>
                Available
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#27AE75' }}>
                {summary.availableRooms || 0}
              </p>
            </div>
          </div>

          {/* Occupied Rooms */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: 'rgba(228, 91, 101, 0.12)',
                border: '1px solid rgba(228, 91, 101, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E45B65',
                flexShrink: 0,
              }}
            >
              <Clock size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#A8B8CC', textTransform: 'uppercase' }}>
                Occupied
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#E45B65' }}>
                {summary.occupiedRooms || 0}
              </p>
            </div>
          </div>

          {/* Cleaning / Maintenance */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: 'rgba(230, 170, 69, 0.12)',
                border: '1px solid rgba(230, 170, 69, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E6AA45',
                flexShrink: 0,
              }}
            >
              <Sparkles size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#A8B8CC', textTransform: 'uppercase' }}>
                Cleaning & Maint
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#E6AA45' }}>
                {(summary.cleaningRooms || 0) + (summary.maintenanceRooms || 0)}
              </p>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: 'rgba(85, 167, 232, 0.12)',
                border: '1px solid rgba(85, 167, 232, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#55A7E8',
                flexShrink: 0,
              }}
            >
              <Percent size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#A8B8CC', textTransform: 'uppercase' }}>
                Occupancy Rate
              </span>
              <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#55A7E8' }}>
                {summary.occupancyRate || 0}%
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Guest Specific Stat Overview */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: 'rgba(214, 183, 121, 0.12)',
                border: '1px solid #D6B779',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D6B779',
              }}
            >
              <CalendarCheck size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#A8B8CC' }}>My Total Bookings</span>
              <p style={{ fontSize: '1.6rem', fontWeight: '700', color: '#F8FAFC' }}>
                {recentReservations.length}
              </p>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                backgroundColor: 'rgba(39, 174, 117, 0.12)',
                border: '1px solid #27AE75',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#27AE75',
              }}
            >
              <Crown size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#A8B8CC' }}>Membership Status</span>
              <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#D6B779' }}>
                Royal VIP Guest
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section for Staff & Managers */}
      {!isGuest && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Real Room Category & Rates Chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#F8FAFC' }}>
                  Room Categories & Inventory
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#A8B8CC' }}>
                  Live room counts and average rates by category
                </span>
              </div>
              <span className="badge badge-info">Real Aggregation</span>
            </div>

            <div style={{ width: '100%', height: '260px' }}>
              {roomTypeStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roomTypeStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#263E59" vertical={false} />
                    <XAxis dataKey="type" stroke="#A8B8CC" fontSize={12} tickLine={false} />
                    <YAxis stroke="#A8B8CC" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0D2340',
                        borderColor: '#D6B779',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                      }}
                      formatter={(val, name) => [name === 'rooms' ? `${val} Rooms` : `$${val}`, name === 'rooms' ? 'Total Rooms' : 'Avg Rate']}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }} />
                    <Bar dataKey="rooms" fill="#55A7E8" name="Total Rooms" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="avgRate" fill="#D6B779" name="Avg Rate ($)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#A8B8CC', fontSize: '0.9rem' }}>
                  <BedDouble size={36} style={{ color: '#D6B779', marginBottom: '0.5rem', opacity: 0.6 }} />
                  <p>No room inventory configured in database yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Room Inventory Status Distribution */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#F8FAFC' }}>
                  Current Room Inventory Breakdown
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#A8B8CC' }}>
                  Live room states across all hotel floors
                </span>
              </div>
              <span className="badge badge-success">Inventory Synced</span>
            </div>

            <div style={{ width: '100%', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {roomStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roomStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roomStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0D2340',
                        borderColor: '#263E59',
                        borderRadius: '8px',
                        color: '#F8FAFC',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(val) => <span style={{ color: '#A8B8CC', fontSize: '0.8rem' }}>{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: '#A8B8CC', fontSize: '0.9rem' }}>No room data available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Operational Highlights Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Reservations Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              padding: '1.2rem 1.5rem',
              borderBottom: '1px solid #263E59',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#F8FAFC' }}>
                {isGuest ? 'My Recent Reservations' : 'Recent Front Desk Bookings'}
              </h3>
              <span style={{ fontSize: '0.78rem', color: '#A8B8CC' }}>
                Latest verified guest reservations
              </span>
            </div>
            <Link
              to="/reservations"
              style={{
                fontSize: '0.82rem',
                color: '#D6B779',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontWeight: '600',
              }}
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  {!isGuest && <th>Guest</th>}
                  <th>Room</th>
                  <th>Dates</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.length === 0 ? (
                  <tr>
                    <td colSpan={isGuest ? 4 : 5} style={{ textAlign: 'center', padding: '2rem', color: '#A8B8CC' }}>
                      No active bookings recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentReservations.map((res) => (
                    <tr key={res._id}>
                      <td style={{ fontWeight: '600', color: '#D6B779' }}>
                        {res.confirmationCode}
                      </td>
                      {!isGuest && (
                        <td>
                          {res.guest?.firstName ? `${res.guest.firstName} ${res.guest.lastName}` : 'Guest'}
                        </td>
                      )}
                      <td>
                        Room #{res.room?.roomNumber || 'N/A'}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#A8B8CC' }}>
                        {new Date(res.checkInDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} -{' '}
                        {new Date(res.checkOutDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                      <td>
                        <span className={`badge badge-${res.status}`}>
                          {res.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tasks & Maintenance Summaries (For Staff) */}
        {!isGuest ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Housekeeping Tasks Snippet */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} style={{ color: '#E6AA45' }} /> Housekeeping Tasks
                </h4>
                <Link to="/housekeeping" style={{ fontSize: '0.78rem', color: '#D6B779' }}>
                  Manage
                </Link>
              </div>

              {recentTasks.length === 0 ? (
                <p style={{ color: '#A8B8CC', fontSize: '0.85rem' }}>All rooms clean and inspected.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {recentTasks.map((t) => (
                    <div
                      key={t._id}
                      style={{
                        padding: '0.6rem 0.8rem',
                        backgroundColor: '#143253',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: '600', color: '#F8FAFC' }}>
                          Room #{t.room?.roomNumber || 'N/A'}
                        </span>
                        <span style={{ color: '#A8B8CC', marginLeft: '0.5rem', textTransform: 'capitalize' }}>
                          {t.taskType.replace('_', ' ')}
                        </span>
                      </div>
                      <span className={`badge badge-${t.status}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Maintenance Requests Snippet */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wrench size={16} style={{ color: '#55A7E8' }} /> Maintenance Status
                </h4>
                <Link to="/maintenance" style={{ fontSize: '0.78rem', color: '#D6B779' }}>
                  Manage
                </Link>
              </div>

              {recentMaintenance.length === 0 ? (
                <p style={{ color: '#A8B8CC', fontSize: '0.85rem' }}>No open maintenance requests.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {recentMaintenance.map((m) => (
                    <div
                      key={m._id}
                      style={{
                        padding: '0.6rem 0.8rem',
                        backgroundColor: '#143253',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.82rem',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: '600', color: '#F8FAFC' }}>
                          Room #{m.room?.roomNumber || 'N/A'}
                        </span>
                        <span style={{ color: '#A8B8CC', marginLeft: '0.5rem' }}>
                          {m.title}
                        </span>
                      </div>
                      <span className={`badge badge-${m.priority === 'urgent' ? 'danger' : 'warning'}`}>
                        {m.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Guest Experience Card */
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#F8FAFC', marginBottom: '0.5rem' }}>
                Bespoke Guest Privileges
              </h3>
              <p style={{ color: '#A8B8CC', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                As an esteemed guest of LuxuryStay, you can request 24/7 in-suite dining, laundry, and chauffeur service directly from your portal.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <Link to="/guest-services" className="btn btn-primary btn-sm">
                Request Room Service
              </Link>
              <Link to="/billing" className="btn btn-secondary btn-sm">
                View Invoices & Folio
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
