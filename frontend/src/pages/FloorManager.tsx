import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import NotificationPanel, { Notification } from '../components/NotificationPanel';
import { Cpu, MapPin, Wrench, UserCheck, RefreshCw, Calendar, BarChart2, Plus, CheckCircle } from 'lucide-react';

const FALLBACK_MACHINES = [
  { id: 'M-001', type: 'Stamping machine',  location: 'Floor A, Bay 3', operator: 'Mattie F.', job: 'JC-4421', progress: 72,  status: 'running',  nextMaint: '14 Apr' },
  { id: 'M-002', type: 'Coating machine',   location: 'Floor A, Bay 5', operator: 'Sam K.',    job: 'JC-4419', progress: 45,  status: 'warning',  nextMaint: 'Today'  },
  { id: 'M-003', type: 'Conveyor belt',     location: 'Floor B, Bay 1', operator: '—',         job: 'Halted',  progress: 0,   status: 'fault',    nextMaint: 'Urgent' },
  { id: 'M-004', type: 'Plotter printer',   location: 'Floor C, Bay 2', operator: 'Lisa T.',   job: 'JC-4425', progress: 88,  status: 'running',  nextMaint: '20 Apr' },
  { id: 'M-005', type: 'Assembly machine',  location: 'Floor B, Bay 4', operator: '—',         job: 'Awaiting',progress: 0,   status: 'idle',     nextMaint: '22 Apr' },
  { id: 'M-006', type: 'Heat-seal machine', location: 'Floor B, Bay 2', operator: 'Omar B.',   job: 'JC-4420', progress: 31,  status: 'running',  nextMaint: '18 Apr' },
];

const FALLBACK_TIMETABLE = [
  { operator: 'Mattie F.', role: 'Stamper', shift: 'AM Shift (06:00 – 14:00)', machine: 'M-001 Stamping', status: 'Active' },
  { operator: 'Omar B.', role: 'Stamper', shift: 'AM Shift (06:00 – 14:00)', machine: 'M-006 Heat-seal', status: 'Active' },
  { operator: 'Sam K.', role: 'Coater Operative', shift: 'PM Shift (14:00 – 22:00)', machine: 'M-002 Coating', status: 'Scheduled' },
  { operator: 'Lisa T.', role: 'Printer Specialist', shift: 'PM Shift (14:00 – 22:00)', machine: 'M-004 Plotter', status: 'Scheduled' },
  { operator: 'Dave H.', role: 'Assembly Tech', shift: 'AM Shift (06:00 – 14:00)', machine: 'M-005 Assembly', status: 'On Break' }
];

const FALLBACK_MAINT_LOGS = [
  { id: 'L-8821', machineId: 'M-001', action: 'Replaced press mold and checked hydraulic pressure', date: '08 Apr 2026', technician: 'Alice R.', status: 'Completed' },
  { id: 'L-8822', machineId: 'M-002', action: 'Oiled roller bearings and cleaned spray nozzles', date: '09 Apr 2026', technician: 'Bob S.', status: 'Completed' },
  { id: 'L-8823', machineId: 'M-003', action: 'Replaced faulty belt drive gear', date: 'Today', technician: 'Alice R.', status: 'In Progress' }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', type: 'critical', msg: 'M-003 conveyor belt fault detected — production halted', time: '2 min ago · Critical' },
  { id: 'notif-2', type: 'warning', msg: 'M-002 coating machine maintenance due today',             time: '18 min ago · Warning' },
  { id: 'notif-3', type: 'info', msg: 'JC-4418 completed successfully on M-001',                time: '42 min ago · Info'    },
];

const statusStyles = {
  running: { badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500', barBg: 'bg-emerald-500' },
  warning: { badgeBg: 'bg-amber-100 text-amber-900 border-amber-200', dot: 'bg-amber-500', barBg: 'bg-amber-500' },
  fault: { badgeBg: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500', barBg: 'bg-red-500' },
  idle: { badgeBg: 'bg-slate-100 text-slate-800 border-slate-200', dot: 'bg-slate-500', barBg: 'bg-slate-300' }
};

export default function FloorManager() {
  const [machines, setMachines] = useState(FALLBACK_MACHINES);
  const [timetable, setTimetable] = useState(FALLBACK_TIMETABLE);
  const [maintLogs, setMaintLogs] = useState(FALLBACK_MAINT_LOGS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'timetable' | 'maintenance' | 'reports'>('telemetry');
  
  // Maintenance Form State
  const [selectedMachine, setSelectedMachine] = useState('M-001');
  const [maintAction, setMaintAction] = useState('');
  const [technician, setTechnician] = useState('');
  const [maintMessage, setMaintMessage] = useState('');

  // Load data from Backend API
  const loadData = async () => {
    try {
      const resMach = await fetch(`${API_URL}/api/machines`);
      if (resMach.ok) {
        const data = await resMach.json();
        setMachines(data.map((m: any) => ({
          id: m.id,
          type: m.type,
          location: m.location,
          operator: m.operator,
          job: m.job_in_progress,
          progress: m.progress,
          status: m.status,
          nextMaint: m.next_maint
        })));
      }

      const resTime = await fetch(`${API_URL}/api/timetable`);
      if (resTime.ok) {
        setTimetable(await resTime.json());
      }

      const resMaint = await fetch(`${API_URL}/api/maintenance`);
      if (resMaint.ok) {
        const data = await resMaint.json();
        setMaintLogs(data.map((m: any) => ({
          id: m.id,
          machineId: m.machine_id,
          action: m.action,
          date: m.date,
          technician: m.technician,
          status: m.status
        })));
      }
    } catch (e) {
      console.warn('Backend API offline, running in fallback mode.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const running  = machines.filter(m => m.status === 'running').length;
  const warnings = machines.filter(m => m.status === 'warning').length;
  const faults   = machines.filter(m => m.status === 'fault').length;
  const idle     = machines.filter(m => m.status === 'idle').length;

  const handleClearNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const simulateRealtimeUpdates = () => {
    setMachines(prev => prev.map(m => {
      if (m.status === 'running') {
        const nextProg = m.progress >= 95 ? 0 : m.progress + Math.floor(Math.random() * 5) + 1;
        return { ...m, progress: nextProg };
      }
      return m;
    }));
  };

  const handleAddMaintLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintAction || !technician) return;

    try {
      const response = await fetch(`${API_URL}/api/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ machineId: selectedMachine, action: maintAction, technician })
      });
      if (response.ok) {
        setMaintAction('');
        setTechnician('');
        setMaintMessage(`Maintenance logged successfully for ${selectedMachine}! Machine status updated.`);
        loadData();
        setTimeout(() => setMaintMessage(''), 4000);
        return;
      }
    } catch (e) {
      console.warn('API connection failed, falling back to local updates.');
    }

    // Local Fallback Log
    const newLog = {
      id: `L-${Math.floor(1000 + Math.random() * 9000)}`,
      machineId: selectedMachine,
      action: maintAction,
      date: 'Today',
      technician: technician,
      status: 'Completed'
    };
    setMachines(prev => prev.map(m => m.id === selectedMachine ? { ...m, status: 'running', progress: 0, nextMaint: '28 Apr' } : m));
    setMaintLogs([newLog, ...maintLogs]);
    setMaintAction('');
    setTechnician('');
    setMaintMessage(`Maintenance logged successfully for ${selectedMachine}! Machine status updated to Running.`);
    setTimeout(() => setMaintMessage(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        role="Floor Manager"
        notificationsCount={notifications.length}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
      />

      {showNotifications && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onClearNotification={handleClearNotif}
        />
      )}

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Floor Operations</h1>
            <p className="text-sm text-slate-500">Real-time status, shift schedules, and maintenance logs</p>
          </div>
          {activeTab === 'telemetry' && (
            <button
              onClick={simulateRealtimeUpdates}
              className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-all self-start"
            >
              <RefreshCw className="w-4 h-4" />
              Simulate Update
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all px-1 whitespace-nowrap ${
              activeTab === 'telemetry' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Live Telemetry
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all px-1 whitespace-nowrap ${
              activeTab === 'timetable' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Shift Timetable
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all px-1 whitespace-nowrap ${
              activeTab === 'maintenance' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Maintenance Log
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all px-1 whitespace-nowrap ${
              activeTab === 'reports' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Uptime Reports
          </button>
        </div>

        {/* Content Tabs */}
        {activeTab === 'telemetry' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Machines</span>
                <span className="text-3xl font-black text-slate-800">{machines.length}</span>
              </div>
              <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-emerald-500">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">Running</span>
                <span className="text-3xl font-black text-emerald-600">{running}</span>
              </div>
              <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-amber-500">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider block mb-1">Maint. Due</span>
                <span className="text-3xl font-black text-amber-600">{warnings}</span>
              </div>
              <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-red-500">
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider block mb-1">Faults</span>
                <span className="text-3xl font-black text-red-600">{faults}</span>
              </div>
              <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-slate-400">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Idle</span>
                <span className="text-3xl font-black text-slate-600">{idle}</span>
              </div>
            </div>

            {/* Machine Grid */}
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-500" />
              Live Telemetry Grid
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {machines.map(m => {
                const style = statusStyles[m.status as keyof typeof statusStyles] || statusStyles.idle;
                return (
                  <div key={m.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 tracking-wider block uppercase">{m.id}</span>
                        <span className="font-bold text-slate-800 text-sm block">{m.type}</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase ${style.badgeBg}`}>
                        {m.status}
                      </span>
                    </div>

                    <div className="p-5 space-y-3 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-slate-400" /> Operator</span>
                        <span className="font-semibold text-slate-800">{m.operator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current job</span>
                        <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">{m.job}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Location</span>
                        <span className="font-medium text-slate-800">{m.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5 text-slate-400" /> Next Maint.</span>
                        <span className="font-semibold text-slate-800">{m.nextMaint}</span>
                      </div>

                      <div className="pt-2">
                        <div className="flex justify-between text-[11px] mb-1 font-semibold">
                          <span>Cycle Progress</span>
                          <span>{m.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${style.barBg}`}
                            style={{ width: `${m.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'timetable' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              Active Operator Shifts
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Operator Name</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Shift Hours</th>
                    <th className="pb-3">Assigned Machine</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {timetable.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 font-bold text-slate-850">{s.operator}</td>
                      <td className="py-4">{s.role}</td>
                      <td className="py-4 font-medium">{s.shift}</td>
                      <td className="py-4 font-mono">{s.machine}</td>
                      <td className="py-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          s.status === 'Active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          s.status === 'Scheduled' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 lg:col-span-2">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-500" />
                Recent Maintenance Logs
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">ID</th>
                      <th className="pb-3">Machine</th>
                      <th className="pb-3">Action Description</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Technician</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {maintLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 font-mono font-bold">{log.id}</td>
                        <td className="py-4 font-bold">{log.machineId}</td>
                        <td className="py-4 text-slate-550">{log.action}</td>
                        <td className="py-4">{log.date}</td>
                        <td className="py-4">{log.technician}</td>
                        <td className="py-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            log.status === 'Completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 h-fit">
              <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-slate-500" />
                Schedule Maintenance
              </h3>
              <p className="text-xs text-slate-500 mb-4">Log immediate fixes or schedule preventive checkups.</p>
              
              {maintMessage && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] p-3 rounded-lg mb-4 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  {maintMessage}
                </div>
              )}

              <form onSubmit={handleAddMaintLog} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Select Machine</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-3 py-2"
                    value={selectedMachine}
                    onChange={e => setSelectedMachine(e.target.value)}
                  >
                    {machines.map(m => (
                      <option key={m.id} value={m.id}>{m.id} – {m.type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Technician</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice R."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-3 py-2"
                    value={technician}
                    onChange={e => setTechnician(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Maintenance Action</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe maintenance action or calibration..."
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-3 py-2"
                    value={maintAction}
                    onChange={e => setMaintAction(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded transition-all text-xs"
                >
                  Log & Update Status
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-500" />
              Machine Performance Reports (Weekly Uptime)
            </h2>
            <p className="text-xs text-slate-500 mb-6">Percentage of scheduled hours each machine was running vs idle or faulty.</p>

            <div className="space-y-6">
              {[
                { id: 'M-001', name: 'Stamping machine', uptime: 98, idle: 2, fault: 0 },
                { id: 'M-002', name: 'Coating machine', uptime: 85, idle: 10, fault: 5 },
                { id: 'M-003', name: 'Conveyor belt', uptime: 60, idle: 15, fault: 25 },
                { id: 'M-004', name: 'Plotter printer', uptime: 94, idle: 4, fault: 2 },
                { id: 'M-005', name: 'Assembly machine', uptime: 70, idle: 30, fault: 0 },
                { id: 'M-006', name: 'Heat-seal machine', uptime: 91, idle: 9, fault: 0 },
              ].map(m => (
                <div key={m.id} className="text-xs">
                  <div className="flex justify-between font-semibold mb-1">
                    <span>{m.id} – {m.name}</span>
                    <span className="text-emerald-600 font-bold">Uptime: {m.uptime}%</span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-500" style={{ width: `${m.uptime}%` }} title={`Uptime ${m.uptime}%`} />
                    <div className="h-full bg-slate-300" style={{ width: `${m.idle}%` }} title={`Idle ${m.idle}%`} />
                    <div className="h-full bg-red-500" style={{ width: `${m.fault}%` }} title={`Fault ${m.fault}%`} />
                  </div>
                  <div className="flex gap-4 text-[10px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full" /> Uptime ({m.uptime}%)</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-350 rounded-full" /> Idle ({m.idle}%)</span>
                    {m.fault > 0 && (
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" /> Fault ({m.fault}%)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
