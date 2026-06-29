import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const JOB_CARDS = [
  { id: 'JC-4421', machine: 'M-001 – Stamping machine', location: 'Floor A, Bay 3', start: '06:00', end: '08:30', design: 'Cardamon V2 – Circular press',      materials: 'Titanium sheet, Handle grip x2',   cert: 'Stamping Cert. Level 3', status: 'Completed',   matReady: true  },
  { id: 'JC-4422', machine: 'M-006 – Heat-seal machine', location: 'Floor B, Bay 2', start: '08:45', end: '10:30', design: 'Saffron XP – Lid seal pattern',      materials: 'Heat-seal film, Lid blank x4',    cert: 'Heat-seal Cert. Level 2',status: 'In Progress', matReady: true  },
  { id: 'JC-4423', machine: 'M-001 – Stamping machine', location: 'Floor A, Bay 3', start: '10:45', end: '12:00', design: 'Clove TM47 – Handle press',          materials: 'Titanium handle blank x6',        cert: 'Stamping Cert. Level 3', status: 'Pending',     matReady: false },
  { id: 'JC-4424', machine: 'M-004 – Plotter printer',  location: 'Floor C, Bay 2', start: '12:15', end: '14:00', design: 'Rosemary TS1 – Signature engrave',   materials: 'Engraving foil, Pan base x2',     cert: 'Plotter Cert. Level 1',  status: 'Pending',     matReady: false },
];

const statusClass = { 'Completed': 'completed', 'In Progress': 'inprogress', 'Pending': 'pending' };
const badgeStyle  = {
  'Completed':   { background: '#EAF3DE', color: '#27500A' },
  'In Progress': { background: '#E6F1FB', color: '#0C447C' },
  'Pending':     { background: '#F1EFE8', color: '#444441' },
};

function StamperJobSheet() {
  const [jobs, setJobs]         = useState(JOB_CARDS);
  const [statusFilter, setStatusFilter] = useState('');

  const toggleMat = (id) => {
    setJobs(prev =>
      prev.map(j => j.id === id ? { ...j, matReady: !j.matReady } : j)
    );
  };

  const filtered = statusFilter
    ? jobs.filter(j => j.status === statusFilter)
    : jobs;

  const completed = jobs.filter(j => j.status === 'Completed').length;

  return (
    <div>
      <Navbar role="Stamper" />
      <div className="page-wrapper">

        <div className="job-header">
          <div className="job-header-top">
            <div className="stamper-name">
              Mattie Float
              <span style={{ fontSize: '13px', fontWeight: 400, color: '#888', marginLeft: '8px' }}>
                EMP-0042
              </span>
            </div>
          </div>
          <div className="meta-pills">
            <span className="meta-pill">Shift <strong>AM (06:00–14:00)</strong></span>
            <span className="meta-pill">Date <strong>9 Apr 2026</strong></span>
            <span className="meta-pill">Total jobs <strong>{jobs.length}</strong></span>
            <span className="meta-pill">Completed <strong>{completed} / {jobs.length}</strong></span>
          </div>
        </div>

        <div className="filter-bar">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#aaa', fontSize: '14px' }}>
            No job cards match this filter.
          </div>
        )}

        {filtered.map(j => (
          <div className={`job-card ${statusClass[j.status]}`} key={j.id}>
            <div className="job-card-top">
              <div>
                <div className="job-id">{j.id}</div>
                <div className="job-time">{j.start} – {j.end}</div>
              </div>
              <span className="status-badge" style={badgeStyle[j.status]}>
                {j.status}
              </span>
            </div>
            <div className="job-body">
              <div>
                <div className="job-field-label">Machine</div>
                <div className="job-field-value">{j.machine}</div>
              </div>
              <div>
                <div className="job-field-label">Location</div>
                <div className="job-field-value">{j.location}</div>
              </div>
              <div>
                <div className="job-field-label">Design pattern</div>
                <div className="job-field-value">{j.design}</div>
              </div>
              <div>
                <div className="job-field-label">Certification required</div>
                <div className="job-field-value">{j.cert}</div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <div className="job-field-label">Materials required</div>
                <div className="job-field-value">{j.materials}</div>
              </div>
            </div>
            <div className="job-footer">
              <span className="mat-label">Materials ready?</span>
              <div className="toggle-wrap" onClick={() => toggleMat(j.id)}>
                <div className={`toggle-track ${j.matReady ? 'on' : ''}`}>
                  <div className="toggle-thumb" />
                </div>
                <span className={`toggle-text ${j.matReady ? 'on' : ''}`}>
                  {j.matReady ? 'Confirmed' : 'Not confirmed'}
                </span>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}

export default StamperJobSheet;