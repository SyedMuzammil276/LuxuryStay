import React, { useState, useEffect } from 'react';
import { reportsApi } from '../../api/endpoints';
import {
  BarChart3,
  Download,
  Calendar,
  Percent,
  BedDouble,
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

export const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardReport, setDashboardReport] = useState(null);
  const [roomReport, setRoomReport] = useState([]);
  const [guestReport, setGuestReport] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [dashRes, roomRes, guestRes] = await Promise.all([
        reportsApi.getDashboardReport(),
        reportsApi.getRoomReport(),
        reportsApi.getGuestReport(),
      ]);

      if (dashRes.data) setDashboardReport(dashRes.data);
      if (roomRes.data?.rooms) setRoomReport(roomRes.data.rooms);
      if (guestRes.data?.guests) setGuestReport(guestRes.data.guests);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Could not compile reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Format room report for bar chart
  const roomPriceData = roomReport.map((r) => ({
    name: `${r.roomType?.toUpperCase()} (${r.status})`,
    price: r.averagePricePerNight || 0,
    rooms: r.totalRooms || 0,
  }));

  // Export CSV
  const handleExportCSV = () => {
    if (!roomReport || roomReport.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Room Type,Status,Total Rooms,Average Price Per Night ($)\n';

    roomReport.forEach((r) => {
      csvContent += `${r.roomType},${r.status},${r.totalRooms},${r.averagePricePerNight}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `luxurystay_room_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = dashboardReport?.summary || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F8FAFC' }}>
            Executive Reports & Analytics
          </h1>
          <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
            Data aggregation derived from real MongoDB models and business records.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchReports} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button onClick={handleExportCSV} className="btn btn-primary btn-sm">
            <Download size={14} /> Export CSV Report
          </button>
        </div>
      </div>

      {/* High Level KPI summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Occupancy Rate</span>
          <p style={{ fontSize: '1.8rem', fontWeight: '700', color: '#55A7E8', marginTop: '0.2rem' }}>
            {summary.occupancyRate || 0}%
          </p>
          <span style={{ fontSize: '0.75rem', color: '#A8B8CC' }}>
            {summary.occupiedRooms || 0} of {summary.activeRooms || summary.totalRooms || 0} active rooms occupied
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Total Registered Guests</span>
          <p style={{ fontSize: '1.8rem', fontWeight: '700', color: '#D6B779', marginTop: '0.2rem' }}>
            {summary.totalGuests || 0}
          </p>
          <span style={{ fontSize: '0.75rem', color: '#A8B8CC' }}>
            +{summary.guestsAddedToday || 0} registered today
          </span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Active Hotel Staff</span>
          <p style={{ fontSize: '1.8rem', fontWeight: '700', color: '#27AE75', marginTop: '0.2rem' }}>
            {summary.activeStaff || 0}
          </p>
          <span style={{ fontSize: '0.75rem', color: '#A8B8CC' }}>On duty across departments</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.75rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Room Readiness</span>
          <p style={{ fontSize: '1.8rem', fontWeight: '700', color: '#27AE75', marginTop: '0.2rem' }}>
            {summary.availableRooms || 0} Ready
          </p>
          <span style={{ fontSize: '0.75rem', color: '#A8B8CC' }}>
            {summary.cleaningRooms || 0} in cleaning • {summary.maintenanceRooms || 0} in maintenance
          </span>
        </div>
      </div>

      {/* Chart: Room Tariffs & Count Distribution */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#F8FAFC' }}>
              Average Room Tariffs & Inventory By Category
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#A8B8CC' }}>
              Aggregate statistics calculated from current room inventory
            </span>
          </div>
          <span className="badge badge-info">Real Aggregation</span>
        </div>

        <div style={{ width: '100%', height: '320px' }}>
          {roomPriceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomPriceData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#263E59" vertical={false} />
                <XAxis dataKey="name" stroke="#A8B8CC" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#A8B8CC" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D2340',
                    borderColor: '#D6B779',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="price" fill="#D6B779" name="Average Price ($)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rooms" fill="#55A7E8" name="Total Rooms Count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#A8B8CC' }}>
              No room data to display
            </div>
          )}
        </div>
      </div>

      {/* Monthly Guest Growth Trend */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#F8FAFC' }}>
              Monthly Guest Registration & Directory Growth
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#A8B8CC' }}>
              Chronological guest registration volume by calendar month
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: '260px' }}>
          {guestReport.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={guestReport} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#263E59" vertical={false} />
                <XAxis dataKey="month" stroke="#A8B8CC" fontSize={12} />
                <YAxis stroke="#A8B8CC" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D2340',
                    borderColor: '#27AE75',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="totalGuests"
                  stroke="#27AE75"
                  strokeWidth={2.5}
                  name="New Guests"
                  dot={{ r: 4, fill: '#27AE75' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#A8B8CC' }}>
              No monthly guest data recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
