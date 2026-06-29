import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const ORDERS = [
  { id: 'ORD-1001', customer: 'The Floats Family',   product: 'Cardamon',    qty: 12, customisation: 'Signature engraving',  status: 'In Production', delivery: '15 Apr 2026' },
  { id: 'ORD-1002', customer: 'Hendricks & Co.',     product: 'Saffron XP',  qty: 6,  customisation: 'Custom colour: Teal',   status: 'Pending',       delivery: '18 Apr 2026' },
  { id: 'ORD-1003', customer: 'Premier Kitchens Ltd',product: 'Clove TM47',  qty: 20, customisation: 'Standard',              status: 'Completed',     delivery: '10 Apr 2026' },
  { id: 'ORD-1004', customer: 'Rosewood Hotels',     product: 'Chive TX5',   qty: 50, customisation: 'Hotel logo engraving',  status: 'In Production', delivery: '22 Apr 2026' },
  { id: 'ORD-1005', customer: 'Gold Leaf Restaurant',product: 'Rosemary TS1',qty: 8,  customisation: 'New colourway: Ivory',  status: 'Issue',         delivery: 'TBC'         },
];

const badgeClass = {
  'Pending':       'pending',
  'In Production': 'inproduction',
  'Completed':     'completed',
  'Issue':         'issue',
};

function ProductionManager() {
  const [filter, setFilter] = useState('');

  const filtered = filter
    ? ORDERS.filter(o => o.status === filter)
    : ORDERS;

  const total      = ORDERS.length;
  const inProd     = ORDERS.filter(o => o.status === 'In Production').length;
  const completed  = ORDERS.filter(o => o.status === 'Completed').length;
  const issues     = ORDERS.filter(o => o.status === 'Issue').length;

  return (
    <div>
      <Navbar role="Production Manager" />
      <div className="page-wrapper">
        <div className="page-title">Production Schedule</div>
        <div className="page-subtitle">Weekly order overview and production status</div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total orders</div>
            <div className="stat-value">{total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">In production</div>
            <div className="stat-value" style={{ color: '#185FA5' }}>{inProd}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed</div>
            <div className="stat-value" style={{ color: '#1D9E75' }}>{completed}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Issues</div>
            <div className="stat-value" style={{ color: '#E24B4A' }}>{issues}</div>
          </div>
        </div>

        <div className="filter-bar" style={{ marginBottom: '16px' }}>
          <select
            className="filter-select"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Production">In Production</option>
            <option value="Completed">Completed</option>
            <option value="Issue">Issue</option>
          </select>
        </div>

        <div className="section-title">Order List</div>
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product line</th>
              <th>Qty</th>
              <th>Customisation</th>
              <th>Status</th>
              <th>Est. delivery</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id}>
                <td><strong>{o.id}</strong></td>
                <td>{o.customer}</td>
                <td>{o.product}</td>
                <td>{o.qty}</td>
                <td>{o.customisation}</td>
                <td>
                  <span className={`order-badge ${badgeClass[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td>{o.delivery}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#aaa', fontSize: '14px' }}>
            No orders match this filter.
          </div>
        )}

      </div>
    </div>
  );
}

export default ProductionManager;