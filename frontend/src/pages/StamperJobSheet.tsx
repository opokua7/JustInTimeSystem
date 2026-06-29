import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import { Calendar, ClipboardList, CheckSquare, Clock, ShieldAlert, ArrowDown } from 'lucide-react';

const FALLBACK_JOB_CARDS = [
  { id: 'JC-4421', machine: 'M-001 – Stamping machine', location: 'Floor A, Bay 3', start: '06:00', end: '08:30', design: 'Cardamon V2 – Circular press',      materials: 'Titanium sheet, Handle grip x2',   cert: 'Stamping Cert. Level 3', status: 'Completed',   matReady: true  },
  { id: 'JC-4422', machine: 'M-006 – Heat-seal machine', location: 'Floor B, Bay 2', start: '08:45', end: '10:30', design: 'Saffron XP – Lid seal pattern',      materials: 'Heat-seal film, Lid blank x4',    cert: 'Heat-seal Cert. Level 2',status: 'In Progress', matReady: true  },
  { id: 'JC-4423', machine: 'M-001 – Stamping machine', location: 'Floor A, Bay 3', start: '10:45', end: '12:00', design: 'Clove TM47 – Handle press',          materials: 'Titanium handle blank x6',        cert: 'Stamping Cert. Level 3', status: 'Pending',     matReady: false },
  { id: 'JC-4424', machine: 'M-004 – Plotter printer',  location: 'Floor C, Bay 2', start: '12:15', end: '14:00', design: 'Rosemary TS1 – Signature engrave',   materials: 'Engraving foil, Pan base x2',     cert: 'Plotter Cert. Level 1',  status: 'Pending',     matReady: false },
];

const badgeColors = {
  'Completed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'In Progress': 'bg-sky-100 text-sky-800 border-sky-200',
  'Pending': 'bg-slate-100 text-slate-700 border-slate-200'
};

export default function StamperJobSheet() {
  const [jobs, setJobs] = useState(FALLBACK_JOB_CARDS);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Time Box States
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [checkInTime, setCheckInTime] = useState('—');
  const [checkOutTime, setCheckOutTime] = useState('—');
  const [currentDateStr, setCurrentDateStr] = useState('Jun 29, 2026');

  const loadJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/jobs`);
      if (response.ok) {
        const data = await response.json();
        setJobs(data.map((j: any) => ({
          id: j.id,
          machine: j.machine_id === 'M-001' ? 'M-001 – Stamping machine' : j.machine_id === 'M-006' ? 'M-006 – Heat-seal machine' : `${j.machine_id} – Machine`,
          location: j.machine_id === 'M-001' ? 'Floor A, Bay 3' : 'Floor B, Bay 2',
          start: j.start_time,
          end: j.end_time,
          design: j.title,
          materials: j.machine_id === 'M-001' ? 'Titanium sheet, Handle grip x2' : 'Heat-seal film, Lid blank x4',
          cert: j.machine_id === 'M-001' ? 'Stamping Cert. Level 3' : 'Heat-seal Cert. Level 2',
          status: j.id === 'JC-4421' ? 'Completed' : j.id === 'JC-4422' ? 'In Progress' : 'Pending',
          matReady: j.mat_ready
        })));
      }
    } catch (e) {
      console.warn('API error, using fallback jobs data.');
    }
  };

  useEffect(() => {
    loadJobs();
    // Set formatted date
    const d = new Date();
    setCurrentDateStr(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isClockedIn && !isOnBreak) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isClockedIn, isOnBreak]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleCheckIn = () => {
    setIsClockedIn(true);
    setIsOnBreak(false);
    setCheckOutTime('—');
    setElapsedSeconds(0);
    const now = new Date();
    setCheckInTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  };

  const handleCheckOut = () => {
    if (!isClockedIn) return;
    setIsClockedIn(false);
    setIsOnBreak(false);
    const now = new Date();
    setCheckOutTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  };

  const toggleMat = async (id: string) => {
    if (!isClockedIn) return; // Prevent if clocked out

    try {
      const response = await fetch(`${API_URL}/api/jobs/${id}/materials`, {
        method: 'PUT'
      });
      if (response.ok) {
        loadJobs();
        return;
      }
    } catch (e) {
      console.warn('API integration failed. Simulating locally.');
    }

    setJobs(prev =>
      prev.map(j => j.id === id ? { ...j, matReady: !j.matReady } : j)
    );
  };

  const filtered = statusFilter
    ? jobs.filter(j => j.status === statusFilter)
    : jobs;

  const completed = jobs.filter(j => j.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar role="Stamper" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Clock In Warning Banner */}
        {!isClockedIn && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-4 py-3 rounded-lg mb-6 font-semibold flex items-center gap-2 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You are currently <strong>Clocked Out</strong>. Please check in using the Time Box panel below to enable materials verification and job updates.</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-800">Mattie Float</h1>
              <span className="text-xs bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-450">EMP-0042</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 mt-2">
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Shift: AM (06:00–14:00)</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Date: {currentDateStr}</span>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-slate-50 border px-4 py-2 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Jobs</span>
              <span className="text-lg font-extrabold text-slate-800">{jobs.length}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-lg text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block">Completed</span>
              <span className="text-lg font-extrabold text-emerald-700">{completed} / {jobs.length}</span>
            </div>
          </div>
        </div>

        {/* Time Box Component matching Mockup */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8 max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black text-slate-900 tracking-tight">Time Box</h2>
            <span className="text-xs font-semibold text-slate-500">{currentDateStr}</span>
          </div>

          <div className="grid grid-cols-3 items-center justify-items-center gap-4">
            {/* Left Check In block */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleCheckIn}
                className="w-36 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold uppercase transition-all shadow-sm tracking-wider"
              >
                Check In
              </button>
              <ArrowDown className="w-5 h-5 text-slate-400 mt-3" />
              <span className="text-xs font-bold text-slate-800 mt-2">{checkInTime}</span>
            </div>

            {/* Center Circle timer */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full border-8 border-slate-100 flex items-center justify-center bg-white shadow-inner">
                <span className="text-xs font-bold text-slate-800">
                  {checkOutTime !== '—' ? '09:00 hrs' : isClockedIn ? formatTime(elapsedSeconds) : '00:00:00'}
                </span>
              </div>
              <button
                onClick={() => setIsOnBreak(!isOnBreak)}
                disabled={!isClockedIn}
                className={`mt-4 px-6 py-2 rounded-lg text-[11px] font-bold uppercase transition-all border ${
                  !isClockedIn
                    ? 'border-slate-200 text-slate-350 cursor-not-allowed'
                    : isOnBreak
                    ? 'bg-amber-500 border-amber-500 text-white hover:bg-amber-600'
                    : 'bg-white border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {isOnBreak ? 'On Break' : 'Break'}
              </button>
            </div>

            {/* Right Check Out block */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleCheckOut}
                disabled={!isClockedIn}
                className={`w-36 py-2.5 rounded-lg text-[11px] font-bold uppercase transition-all shadow-sm tracking-wider ${
                  !isClockedIn
                    ? 'bg-slate-100 text-slate-350 cursor-not-allowed border border-slate-200'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                Check Out
              </button>
              <ArrowDown className="w-5 h-5 text-slate-400 mt-3" />
              <span className="text-xs font-bold text-slate-800 mt-2">{checkOutTime}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 flex justify-end">
          <select
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-emerald-500"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Job Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-white border border-slate-200 rounded-xl">
              No job sheets found matching this status filter.
            </div>
          ) : (
            filtered.map(j => (
              <div key={j.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-emerald-500" />
                      <span className="font-bold text-slate-800">{j.id}</span>
                      <span className="text-xs text-slate-400">({j.start} – {j.end})</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${badgeColors[j.status as keyof typeof badgeColors] || badgeColors.Pending}`}>
                      {j.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-600">
                    <div>
                      <span className="font-semibold block text-slate-400 mb-0.5">Machine</span>
                      <span className="font-medium text-slate-800">{j.machine}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-slate-400 mb-0.5">Location</span>
                      <span className="font-medium text-slate-800">{j.location}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-slate-400 mb-0.5">Design Pattern</span>
                      <span className="font-medium text-slate-800">{j.design}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-slate-400 mb-0.5">Cert Required</span>
                      <span className="font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded inline-block">{j.cert}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <span className="text-xs font-semibold block text-slate-400 mb-1">Required Materials</span>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">{j.materials}</p>
                  </div>
                </div>

                {/* Materials Confirmation Section */}
                <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 px-6 py-4 flex flex-col justify-center items-center md:w-56 shrink-0 gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Materials Verified?</span>
                  
                  <button
                    onClick={() => toggleMat(j.id)}
                    disabled={!isClockedIn}
                    className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold text-xs transition-all border ${
                      !isClockedIn 
                        ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-not-allowed'
                        : j.matReady
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckSquare className={`w-4 h-4 ${j.matReady && isClockedIn ? 'text-emerald-600' : 'text-slate-450'}`} />
                    {j.matReady ? 'Confirmed Ready' : 'Mark as Ready'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
