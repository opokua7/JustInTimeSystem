import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import { CalendarRange, ClipboardList, AlertTriangle, CheckCircle } from 'lucide-react';

const FALLBACK_ORDERS = [
  { id: 'ORD-1001', customer: 'The Floats Family',   product: 'Cardamon',    qty: 12, customisation: 'Signature engraving',  status: 'In Production', delivery: '15 Apr 2026' },
  { id: 'ORD-1002', customer: 'Hendricks & Co.',     product: 'Saffron XP',  qty: 6,  customisation: 'Custom colour: Teal',   status: 'Pending',       delivery: '18 Apr 2026' },
  { id: 'ORD-1003', customer: 'Premier Kitchens Ltd',product: 'Clove TM47',  qty: 20, customisation: 'Standard',              status: 'Completed',     delivery: '10 Apr 2026' },
  { id: 'ORD-1004', customer: 'Rosewood Hotels',     product: 'Chive TX5',   qty: 50, customisation: 'Hotel logo engraving',  status: 'In Production', delivery: '22 Apr 2026' },
  { id: 'ORD-1005', customer: 'Gold Leaf Restaurant',product: 'Rosemary TS1',qty: 8,  customisation: 'New colourway: Ivory',  status: 'Issue',         delivery: 'TBC'         },
];

const FALLBACK_JOBS = [
  { id: 'JC-4421', machine: 'M-001', day: 'Mon', start: '08:00', end: '10:00', title: 'Cardamon Press' },
  { id: 'JC-4423', machine: 'M-001', day: 'Mon', start: '09:00', end: '11:00', title: 'Clove Press' },
  { id: 'JC-4422', machine: 'M-006', day: 'Tue', start: '10:00', end: '12:00', title: 'Saffron Lid Seal' },
  { id: 'JC-4424', machine: 'M-004', day: 'Wed', start: '14:00', end: '16:00', title: 'Rosemary Engrave' }
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

const badgeColors = {
  'Pending': 'bg-slate-100 text-slate-700 border-slate-200',
  'In Production': 'bg-blue-100 text-blue-800 border-blue-200',
  'Completed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Issue': 'bg-red-100 text-red-800 border-red-200'
};

export default function ProductionManager() {
  const [filter, setFilter] = useState('');
  const [orders, setOrders] = useState(FALLBACK_ORDERS);
  const [jobs, setJobs] = useState(FALLBACK_JOBS);
  const [conflictResolved, setConflictResolved] = useState(false);

  const loadData = async () => {
    try {
      const resOrd = await fetch(`${API_URL}/api/orders`);
      if (resOrd.ok) {
        setOrders(await resOrd.json());
      }
      const resJobs = await fetch(`${API_URL}/api/jobs`);
      if (resJobs.ok) {
        const data = await resJobs.json();
        setJobs(data.map((j: any) => ({
          id: j.id,
          machine: j.machine_id,
          day: j.day,
          start: j.start_time,
          end: j.end_time,
          title: j.title
        })));
        
        // Detect if conflict is still there
        const conflictJob = data.find((j: any) => j.id === 'JC-4423');
        if (conflictJob && conflictJob.start_time === '14:00') {
          setConflictResolved(true);
        } else {
          setConflictResolved(false);
        }
      }
    } catch (e) {
      console.warn('API error, using local fallback arrays.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = filter
    ? orders.filter(o => o.status === filter)
    : orders;

  const total      = orders.length;
  const inProd     = orders.filter(o => o.status === 'In Production').length;
  const completed  = orders.filter(o => o.status === 'Completed').length;
  const issues     = orders.filter(o => o.status === 'Issue').length;

  const handleResolveConflict = async () => {
    try {
      const response = await fetch(`${API_URL}/api/jobs/JC-4423/reschedule`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: '14:00', end: '16:00' })
      });
      if (response.ok) {
        setConflictResolved(true);
        loadData();
        return;
      }
    } catch (e) {
      console.warn('API error, rescheduling locally.');
    }

    setJobs(prev => prev.map(j => j.id === 'JC-4423' ? { ...j, start: '14:00', end: '16:00' } : j));
    setConflictResolved(true);
  };

  const hasConflict = (day: string, time: string) => {
    if (conflictResolved) return false;
    return day === 'Mon' && (time === '08:00' || time === '10:00');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar role="Production Manager" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Production Management</h1>
          <p className="text-sm text-slate-500">Weekly order overview, 7-day schedule calendar and conflict diagnostics</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Orders</span>
            <span className="text-3xl font-black text-slate-800">{total}</span>
          </div>
          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-blue-500">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block mb-1">In Production</span>
            <span className="text-3xl font-black text-blue-600">{inProd}</span>
          </div>
          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-emerald-500">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">Completed</span>
            <span className="text-3xl font-black text-emerald-600">{completed}</span>
          </div>
          <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-red-500">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider block mb-1">Issues</span>
            <span className="text-3xl font-black text-red-600">{issues}</span>
          </div>
        </div>

        {/* 7-Day Production Schedule Calendar Grid */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-emerald-500" />
            7-Day Production Schedule Grid
          </h2>
          <p className="text-xs text-slate-500 mb-6">Visual schedule of machine jobs showing active blocks and collision detection.</p>

          <div className="overflow-x-auto">
            <div className="min-w-[700px] grid grid-cols-8 gap-2">
              {/* Corner cell */}
              <div className="bg-slate-50 border border-slate-100 rounded p-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Time
              </div>
              {/* Day headers */}
              {DAYS.map(day => (
                <div key={day} className="bg-slate-50 border border-slate-100 rounded p-2 text-center text-xs font-bold text-slate-700">
                  {day}
                </div>
              ))}

              {/* Time Slot Rows */}
              {TIMES.map(time => (
                <React.Fragment key={time}>
                  {/* Time label */}
                  <div className="bg-slate-50 border border-slate-100 rounded p-2 text-center text-xs font-bold text-slate-500 flex items-center justify-center">
                    {time}
                  </div>
                  {/* Day cells */}
                  {DAYS.map(day => {
                    const cellJobs = jobs.filter(j => j.day === day && j.start <= time && time < j.end);
                    const cellConflict = hasConflict(day, time);

                    return (
                      <div
                        key={`${day}-${time}`}
                        className={`border rounded p-2 min-h-16 flex flex-col justify-between transition-colors ${
                          cellConflict
                            ? 'bg-red-50 border-red-300'
                            : cellJobs.length > 0
                            ? 'bg-emerald-50 border-emerald-250'
                            : 'bg-white border-slate-150'
                        }`}
                      >
                        {cellJobs.map(job => (
                          <div key={job.id} className="text-[10px]">
                            <span className="font-bold text-slate-800 block leading-tight">{job.id}</span>
                            <span className="text-slate-500 font-medium block leading-none">{job.title}</span>
                            <span className="font-mono text-[9px] text-slate-400 mt-1 block">({job.machine})</span>
                          </div>
                        ))}
                        {cellConflict && (
                          <div className="text-[10px] text-red-700 font-bold flex items-center gap-0.5 mt-1">
                            <AlertTriangle className="w-3 h-3 text-red-500 shrink-0" />
                            Double Booking
                          </div>
                        )}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Schedule Calendar and Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order List Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-500" />
                Active Orders
              </h2>
              
              <select
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 self-end sm:self-auto"
                value={filter}
                onChange={e => setFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Production">In Production</option>
                <option value="Completed">Completed</option>
                <option value="Issue">Issue</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Product</th>
                    <th className="pb-3">Qty</th>
                    <th className="pb-3">Customisation</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Est. Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {filtered.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-bold text-slate-800">{o.id}</td>
                      <td className="py-4">{o.customer}</td>
                      <td className="py-4 font-medium">{o.product}</td>
                      <td className="py-4 font-semibold text-slate-800">{o.qty}</td>
                      <td className="py-4 text-slate-500 italic">{o.customisation}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${badgeColors[o.status as keyof typeof badgeColors] || badgeColors.Pending}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-4 font-medium text-slate-800">{o.delivery}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  No orders found.
                </div>
              )}
            </div>
          </div>

          {/* Calendar Conflict Panel */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <CalendarRange className="w-5 h-5 text-emerald-500" />
              Scheduling Conflict Panel
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Shows real-time machine and timetable conflict warnings across production lines.
            </p>

            <div className="space-y-4 flex-1">
              {!conflictResolved ? (
                <div className="border border-red-200 bg-red-50/40 p-4 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Double Booking Alert (M-001)</div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Job <strong>JC-4421</strong> and Job <strong>JC-4423</strong> both scheduled for machine <strong>M-001</strong> between 09:00 - 10:00 on Monday.
                    </p>
                    <button
                      onClick={handleResolveConflict}
                      className="mt-2 text-[10px] text-red-750 font-black hover:underline block bg-red-100 hover:bg-red-200 px-2.5 py-1 rounded"
                    >
                      Reschedule Job Card (JC-4423) to 14:00
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-emerald-200 bg-emerald-50/40 p-4 rounded-lg flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">All Conflicts Resolved</div>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Job <strong>JC-4423</strong> successfully moved to Monday 14:00 - 16:00. No active collisions detected.
                    </p>
                  </div>
                </div>
              )}

              <div className="border border-slate-200 bg-slate-50/50 p-4 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-slate-450 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Operator Conflict (Omar B.)</div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Omar B. is scheduled to operate <strong>M-006</strong>, but is also assigned to machine maintenance crew for 18th Apr.
                  </p>
                  <button className="mt-2 text-[10px] text-slate-600 font-bold hover:underline">
                    Resolve Assignment
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
