import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import { UploadCloud, CheckCircle2, ListCollapse, CheckSquare } from 'lucide-react';

const FALLBACK_DESIGNS = [
  { 
    id: 'DS-001', 
    name: 'Cardamon V2 – Circular press', 
    category: 'Frying Pan', 
    stage: 'Production Ready', 
    updated: '2 days ago',
    checks: { cad: true, stress: true, thermal: true } 
  },
  { 
    id: 'DS-002', 
    name: 'Saffron XP – Lid seal pattern', 
    category: 'Lid System', 
    stage: 'In Design Review', 
    updated: 'Yesterday',
    checks: { cad: true, stress: true, thermal: false }
  },
  { 
    id: 'DS-003', 
    name: 'Clove TM47 – Handle press spec', 
    category: 'Handle Mount', 
    stage: 'Prototype Stage', 
    updated: 'Just Now',
    checks: { cad: true, stress: false, thermal: false }
  }
];

export default function ProductEngineer() {
  const [designs, setDesigns] = useState(FALLBACK_DESIGNS);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Frying Pan');
  const [message, setMessage] = useState('');

  const loadDesigns = async () => {
    try {
      const response = await fetch(`${API_URL}/api/designs`);
      if (response.ok) {
        const data = await response.json();
        setDesigns(data.map((d: any) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          stage: d.stage,
          updated: d.updated,
          checks: {
            cad: d.check_cad,
            stress: d.check_stress,
            thermal: d.check_thermal
          }
        })));
      }
    } catch (e) {
      console.warn('API connection failed, falling back to mock designs.');
    }
  };

  useEffect(() => {
    loadDesigns();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const response = await fetch(`${API_URL}/api/designs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category })
      });
      if (response.ok) {
        setMessage(`Successfully uploaded spec for: ${name}`);
        loadDesigns();
        setName('');
        setTimeout(() => setMessage(''), 4000);
        return;
      }
    } catch (e) {
      console.warn('API connection failed, executing locally.');
    }

    const newDesign = {
      id: `DS-00${designs.length + 1}`,
      name: name,
      category: category,
      stage: 'Prototype Stage',
      updated: 'Just Now',
      checks: { cad: false, stress: false, thermal: false }
    };

    setDesigns([newDesign, ...designs]);
    setName('');
    setMessage(`Successfully uploaded spec for: ${name}`);
    setTimeout(() => setMessage(''), 4000);
  };

  const toggleCheck = async (designId: string, checkKey: 'cad' | 'stress' | 'thermal') => {
    const fieldMap = {
      cad: 'check_cad',
      stress: 'check_stress',
      thermal: 'check_thermal'
    };

    try {
      const response = await fetch(`${API_URL}/api/designs/${designId}/checks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field: fieldMap[checkKey] })
      });
      if (response.ok) {
        loadDesigns();
        return;
      }
    } catch (e) {
      console.warn('API error, performing local check toggles.');
    }

    setDesigns(prev => prev.map(d => {
      if (d.id === designId) {
        const nextChecks = { ...d.checks, [checkKey]: !d.checks[checkKey] };
        let nextStage = 'Prototype Stage';
        if (nextChecks.cad && nextChecks.stress && nextChecks.thermal) {
          nextStage = 'Production Ready';
        } else if (nextChecks.cad) {
          nextStage = 'In Design Review';
        }

        return {
          ...d,
          checks: nextChecks,
          stage: nextStage,
          updated: 'Just Now'
        };
      }
      return d;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar role="Product Engineer" />

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Form */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <UploadCloud className="w-5 h-5 text-emerald-500" />
            Upload Design Spec
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Upload new CAD models or specification blueprints to sync across all factory floor machines.
          </p>

          {message && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3 rounded-lg mb-4 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {message}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Design Spec Name</label>
              <input
                type="text"
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Rosemary TS2 - Handle press"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Product Category</label>
              <select
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="Frying Pan">Frying Pan</option>
                <option value="Lid System">Lid System</option>
                <option value="Handle Mount">Handle Mount</option>
                <option value="Packaging Box">Packaging Box</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Specification Document (.pdf, .dxf)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-[11px] text-slate-500 font-medium">Drag file here or click to select</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded transition-all text-xs"
            >
              Upload & Process Spec
            </button>
          </form>
        </div>

        {/* Lifecycle Tracker */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm lg:col-span-2">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
            <ListCollapse className="w-5 h-5 text-emerald-500" />
            Product Lifecycle Tracker
          </h2>

          <div className="space-y-6">
            {designs.map(d => (
              <div key={d.id} className="border border-slate-200 p-5 rounded-xl hover:shadow-sm transition-shadow bg-white flex flex-col md:flex-row gap-6">
                
                {/* Progress bar visualising design lifecycle */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">{d.id} · {d.category}</span>
                      <h3 className="text-sm font-bold text-slate-800">{d.name}</h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                      d.stage === 'Production Ready'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : d.stage === 'In Design Review'
                        ? 'bg-sky-100 text-sky-800 border-sky-200'
                        : 'bg-amber-100 text-amber-900 border-amber-200'
                    }`}>
                      {d.stage}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-1">
                      <span>1. CAD Blueprint</span>
                      <span>2. Proto Testing</span>
                      <span>3. Quality Audit</span>
                      <span>4. Production Ready</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex gap-0.5">
                      <div className="h-full bg-emerald-500 flex-1" />
                      <div className={`h-full flex-1 ${d.stage !== 'Prototype Stage' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 ${d.stage === 'Production Ready' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 ${d.stage === 'Production Ready' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-2 text-right">Updated {d.updated}</span>
                  </div>
                </div>

                {/* Quality Check Checklist Section */}
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-lg md:w-56 shrink-0 flex flex-col justify-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b pb-1 mb-1">Quality Check Audit</span>
                  
                  <button
                    onClick={() => toggleCheck(d.id, 'cad')}
                    className={`flex items-center gap-2 py-1.5 px-3 rounded text-[11px] font-semibold transition-all border ${
                      d.checks.cad
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckSquare className={`w-3.5 h-3.5 ${d.checks.cad ? 'text-emerald-600' : 'text-slate-400'}`} />
                    CAD Model Approved
                  </button>

                  <button
                    onClick={() => toggleCheck(d.id, 'stress')}
                    className={`flex items-center gap-2 py-1.5 px-3 rounded text-[11px] font-semibold transition-all border ${
                      d.checks.stress
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckSquare className={`w-3.5 h-3.5 ${d.checks.stress ? 'text-emerald-600' : 'text-slate-400'}`} />
                    Stress Test Verified
                  </button>

                  <button
                    onClick={() => toggleCheck(d.id, 'thermal')}
                    className={`flex items-center gap-2 py-1.5 px-3 rounded text-[11px] font-semibold transition-all border ${
                      d.checks.thermal
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckSquare className={`w-3.5 h-3.5 ${d.checks.thermal ? 'text-emerald-600' : 'text-slate-400'}`} />
                    Thermal Audit Passed
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
