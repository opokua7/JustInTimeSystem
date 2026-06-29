import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const MACHINES = [
  { id: 'M-001', type: 'Stamping machine',  location: 'Floor A, Bay 3', operator: 'Mattie F.', job: 'JC-4421', progress: 72,  status: 'running',  nextMaint: '14 Apr' },
  { id: 'M-002', type: 'Coating machine',   location: 'Floor A, Bay 5', operator: 'Sam K.',    job: 'JC-4419', progress: 45,  status: 'warning',  nextMaint: 'Today'  },
  { id: 'M-003', type: 'Conveyor belt',     location: 'Floor B, Bay 1', operator: '—',         job: 'Halted',  progress: 0,   status: 'fault',    nextMaint: 'Urgent' },
  { id: 'M-004', type: 'Plotter printer',   location: 'Floor C, Bay 2', operator: 'Lisa T.',   job: 'JC-4425', progress: 88,  status: 'running',  nextMaint: '20 Apr' },
  { id: 'M-005', type: 'Assembly machine',  location: 'Floor B, Bay 4', operator: '—',         job: 'Awaiting',progress: 0,   status: 'idle',     nextMaint: '22 Apr' },
  { id: 'M-006', type: 'Heat-seal machine', location: 'Floor B, Bay 2', operator: 'Omar B.',   job: 'JC-4420', progress: 31,  status: 'running',  nextMaint: '18 Apr' },
];

const NOTIFICATIONS = [
  { color: '#E24B4A', msg: 'M-003 conveyor belt fault detected — production halted', time: '2 min ago · Critical' },
  { color: '#BA7517', msg: 'M-002 coating machine maintenance due today',             time: '18 min ago · Warning' },
  { color: '#1D9E75', msg: 'JC-4418 completed successfully on M-001',                time: '42 min ago · Info'    },
];

const statusLabel = { running: 'Running', warning: 'Maint. due', fault: 'Fault', idle: 'Idle' };

function FloorManager() {
  const running  = MACHINES.filter(m => m.status === 'running').length;
  const warnings = MACHINES.filter(m => m.status === 'warning').length;
  const faults   = MACHINES.filter(m => m.status === 'fault').length;
  const idle     = MACHINES.filter(m => m.status === 'idle').length;

  const [machines] = useState(MACHINES);

  return (
    <div>
      <Navbar role="Floor Manager" />
      <div className="page-wrapper">
        <div className="page-title">Machine Status Dashboard</div>
        <div className="page-subtitle">Real-time overview of all machines on the production floor</div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total machines</div>
            <div className="stat-value">{machines.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Running</div>
            <div className="stat-value" style={{ color: '#1D9E75' }}>{running}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Maintenance due</div>
            <div className="stat-value" style={{ color: '#BA7517' }}>{warnings}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Faults</div>
            <div className="stat-value" style={{ color: '#E24B4A' }}>{faults}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Idle</div>
            <div className="stat-value" style={{ color: '#888' }}>{idle}</div>
          </div>
        </div>

        <div className="section-title">Live Machine Status</div>
        <div className="machine-grid">
          {machines.map(m => (
            <div className={`machine-card ${m.status}`} key={m.id}>
              <div className="machine-header">
                <div>
                  <div className="machine-id">{m.id}</div>
                  <div className="machine-type">{m.type}</div>
                </div>
                <span className={`status-badge ${m.status}`}>
                  {statusLabel[m.status]}
                </span>
              </div>
              <div className="machine-row"><span>Operator</span><span>{m.operator}</span></div>
              <div className="machine-row"><span>Current job</span><span>{m.job}</span></div>
              <div className="machine-row"><span>Location</span><span>{m.location}</span></div>
              <div className="machine-row"><span>Next maint.</span><span>{m.nextMaint}</span></div>
              <div className="progress-wrap">
                <div className="progress-label">
                  <span>Cycle progress</span>
                  <span>{m.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill fill-${m.status}`}
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="section-title">Recent Notifications</div>
        <div className="notif-list">
          {NOTIFICATIONS.map((n, i) => (
            <div className="notif-item" key={i}>
              <div className="notif-dot" style={{ backgroundColor: n.color }} />
              <div>
                <div className="notif-msg">{n.msg}</div>
                <div className="notif-time">{n.time}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default FloorManager;