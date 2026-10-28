import React, { useState } from 'react';
import {
  Settings,
  Building,
  DollarSign,
  Shield,
  Clock,
  Server,
  Database,
  CheckCircle,
  Lock,
  FileText,
} from 'lucide-react';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('hotel');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F8FAFC' }}>
          System Settings & Hotel Configuration
        </h1>
        <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
          Inspect environment configuration, tax policies, role permissions, and operational thresholds.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #263E59', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'hotel', label: 'Hotel Identity', icon: Building },
          { id: 'tax', label: 'Billing & Tax', icon: DollarSign },
          { id: 'policies', label: 'Stay Policies', icon: Clock },
          { id: 'roles', label: 'Role Permissions', icon: Shield },
          { id: 'system', label: 'Server & Database', icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Hotel Identity Tab */}
      {activeTab === 'hotel' && (
        <div className="card" style={{ maxWidth: '750px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={20} style={{ color: '#D6B779' }} /> Five-Star Hotel Profile
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Property Name</span>
              <p style={{ color: '#F8FAFC', fontWeight: '600', fontSize: '1rem', marginTop: '0.2rem' }}>
                LuxuryStay Hospitality
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Classification</span>
              <p style={{ color: '#D6B779', fontWeight: '700', fontSize: '1rem', marginTop: '0.2rem' }}>
                ★★★★★ 5-Star Luxury Resort
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Primary Location</span>
              <p style={{ color: '#F8FAFC', marginTop: '0.2rem' }}>
                Royal Avenue, Suite 100, Karachi
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Concierge Hotline</span>
              <p style={{ color: '#F8FAFC', marginTop: '0.2rem' }}>
                +92 (21) 111-589-879
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Official Email</span>
              <p style={{ color: '#F8FAFC', marginTop: '0.2rem' }}>
                reception@luxurystay.com
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: '#A8B8CC', textTransform: 'uppercase' }}>Time Zone</span>
              <p style={{ color: '#F8FAFC', marginTop: '0.2rem' }}>
                Asia/Karachi (UTC+5)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Billing & Tax Tab */}
      {activeTab === 'tax' && (
        <div className="card" style={{ maxWidth: '750px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={20} style={{ color: '#D6B779' }} /> Billing & Tax Configuration
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#143253', padding: '1.25rem', borderRadius: '8px', border: '1px solid #263E59' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: '600', color: '#F8FAFC', display: 'block' }}>
                    Government Hospitality Tax Rate
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#A8B8CC' }}>
                    Configured in backend environment (BILLING_TAX_RATE)
                  </span>
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: '700', color: '#D6B779' }}>
                  5.0%
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: '#143253', padding: '1.25rem', borderRadius: '8px', border: '1px solid #263E59' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: '600', color: '#F8FAFC', display: 'block' }}>
                    Operating Currency
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#A8B8CC' }}>
                    Dual currency support for local & international folios
                  </span>
                </div>
                <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#27AE75' }}>
                  USD ($) / PKR (Rs.)
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: '#143253', padding: '1.25rem', borderRadius: '8px', border: '1px solid #263E59' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: '600', color: '#F8FAFC', display: 'block' }}>
                    Invoice Generation Policy
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#A8B8CC' }}>
                    Invoices are consolidated upon reservation check-out with additional room services
                  </span>
                </div>
                <span className="badge badge-success">Enforced</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="card" style={{ maxWidth: '750px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} style={{ color: '#D6B779' }} /> Operating Check-in & Stay Policies
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#143253', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#D6B779', fontWeight: '700' }}>STANDARD CHECK-IN</span>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F8FAFC', marginTop: '0.2rem' }}>
                14:00 (2:00 PM)
              </p>
              <p style={{ fontSize: '0.8rem', color: '#A8B8CC', marginTop: '0.2rem' }}>Early check-in subject to room readiness</p>
            </div>

            <div style={{ backgroundColor: '#143253', padding: '1rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: '#D6B779', fontWeight: '700' }}>STANDARD CHECK-OUT</span>
              <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#F8FAFC', marginTop: '0.2rem' }}>
                12:00 (12:00 PM)
              </p>
              <p style={{ fontSize: '0.8rem', color: '#A8B8CC', marginTop: '0.2rem' }}>Late check-out available on request</p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem', color: '#A8B8CC' }}>
            <p>• <strong>Cancellation Policy:</strong> Free cancellation up to 24 hours prior to check-in calendar date.</p>
            <p>• <strong>Identification Requirement:</strong> Valid passport or government CNIC required at check-in.</p>
            <p>• <strong>Housekeeping Sanitation:</strong> All departed rooms undergo comprehensive turn-down and UV sterilization prior to re-assignment.</p>
          </div>
        </div>
      )}

      {/* Role Permissions Matrix Tab */}
      {activeTab === 'roles' && (
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={20} style={{ color: '#D6B779' }} /> Role-Based Access Control (RBAC) Matrix
          </h3>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Department / Feature</th>
                  <th>Admin</th>
                  <th>Manager</th>
                  <th>Receptionist</th>
                  <th>Housekeeping</th>
                  <th>Maintenance</th>
                  <th>Guest</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Dashboard Metrics', admin: true, mgr: true, rec: true, hk: true, mt: true, gst: true },
                  { feature: 'User & Staff Management', admin: true, mgr: false, rec: false, hk: false, mt: false, gst: false },
                  { feature: 'Guest Directory & KYC', admin: true, mgr: true, rec: true, hk: false, mt: false, gst: false },
                  { feature: 'Room Inventory (Create / Edit)', admin: true, mgr: true, rec: false, hk: false, mt: false, gst: false },
                  { feature: 'Room Status Updates', admin: true, mgr: true, rec: true, hk: true, mt: true, gst: false },
                  { feature: 'Booking / Reservation Engine', admin: true, mgr: true, rec: true, hk: false, mt: false, gst: true },
                  { feature: 'Check-In & Check-Out Operations', admin: true, mgr: true, rec: true, hk: false, mt: false, gst: false },
                  { feature: 'Billing & Payments', admin: true, mgr: true, rec: true, hk: false, mt: false, gst: true },
                  { feature: 'Housekeeping Task Dispatch', admin: true, mgr: true, rec: true, hk: true, mt: false, gst: false },
                  { feature: 'Maintenance Incident Tracking', admin: true, mgr: true, rec: true, hk: false, mt: true, gst: false },
                  { feature: 'Executive Reports & CSV Exports', admin: true, mgr: true, rec: false, hk: false, mt: false, gst: false },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '600', color: '#F8FAFC' }}>{row.feature}</td>
                    <td>{row.admin ? <CheckCircle size={16} color="#27AE75" /> : '—'}</td>
                    <td>{row.mgr ? <CheckCircle size={16} color="#27AE75" /> : '—'}</td>
                    <td>{row.rec ? <CheckCircle size={16} color="#27AE75" /> : '—'}</td>
                    <td>{row.hk ? <CheckCircle size={16} color="#27AE75" /> : '—'}</td>
                    <td>{row.mt ? <CheckCircle size={16} color="#27AE75" /> : '—'}</td>
                    <td>{row.gst ? <CheckCircle size={16} color="#27AE75" /> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Health Tab */}
      {activeTab === 'system' && (
        <div className="card" style={{ maxWidth: '750px' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={20} style={{ color: '#D6B779' }} /> Runtime & Architecture Health
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: '#143253', padding: '1rem 1.25rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: '600', color: '#F8FAFC' }}>Backend Express API</span>
                <p style={{ fontSize: '0.8rem', color: '#A8B8CC' }}>Base URL: http://localhost:5000/api</p>
              </div>
              <span className="badge badge-success">Online & Listening</span>
            </div>

            <div style={{ backgroundColor: '#143253', padding: '1rem 1.25rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: '600', color: '#F8FAFC' }}>Database Engine</span>
                <p style={{ fontSize: '0.8rem', color: '#A8B8CC' }}>MongoDB Protocol v9.11</p>
              </div>
              <span className="badge badge-success">Connected</span>
            </div>

            <div style={{ backgroundColor: '#143253', padding: '1rem 1.25rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: '600', color: '#F8FAFC' }}>Authentication Mode</span>
                <p style={{ fontSize: '0.8rem', color: '#A8B8CC' }}>HMAC SHA-256 JWT Bearer Authentication</p>
              </div>
              <span className="badge badge-info">Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
