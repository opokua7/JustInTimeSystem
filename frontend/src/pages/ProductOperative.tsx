import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import { Package, ShieldCheck, AlertTriangle, Users, Truck, CheckCircle2 } from 'lucide-react';

const FALLBACK_MATERIALS = [
  { id: 'MAT-001', name: 'Titanium sheet', stock: 120, minRequired: 50, leadTime: '3 days', status: 'In Stock' },
  { id: 'MAT-002', name: 'Handle grip x2', stock: 12, minRequired: 40, leadTime: '5 days', status: 'Low Stock' },
  { id: 'MAT-003', name: 'Heat-seal film', stock: 350, minRequired: 100, leadTime: '2 days', status: 'In Stock' },
  { id: 'MAT-004', name: 'Lid blank x4', stock: 4, minRequired: 20, leadTime: '7 days', status: 'Shortage' },
  { id: 'MAT-005', name: 'Engraving foil', stock: 80, minRequired: 15, leadTime: '4 days', status: 'In Stock' }
];

const SUPPLIERS = [
  { name: 'Apex Metals Group', material: 'Titanium sheet', leadTime: '3 days', contact: 'sales@apexmetals.com', phone: '+44 121 456 7890' },
  { name: 'GripTech Plastics', material: 'Handle grip x2', leadTime: '5 days', contact: 'info@griptech.co.uk', phone: '+44 247 612 3456' },
  { name: 'SealWrap Industries', material: 'Heat-seal film', leadTime: '2 days', contact: 'orders@sealwrap.co.uk', phone: '+44 161 789 0123' },
  { name: 'AluForge Castings', material: 'Lid blank x4', leadTime: '7 days', contact: 'support@aluforge.com', phone: '+44 114 234 5678' }
];

const FALLBACK_BATCHES = [
  { id: 'B-0081', product: 'Cardamon Frying Pan', qty: 150, quality: 'Passed', status: 'Pending Dispatch' },
  { id: 'B-0082', product: 'Saffron XP Frying Pan', qty: 80, quality: 'Passed', status: 'Pending Dispatch' },
  { id: 'B-0083', product: 'Clove TM47 Lid Unit', qty: 220, quality: 'In Review', status: 'On Hold' },
  { id: 'B-0084', product: 'Rosemary TS1 Engraved', qty: 60, quality: 'Passed', status: 'Dispatched' }
];

export default function ProductOperative() {
  const [materials, setMaterials] = useState(FALLBACK_MATERIALS);
  const [batches, setBatches] = useState(FALLBACK_BATCHES);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'suppliers' | 'dispatch'>('inventory');

  const loadData = async () => {
    try {
      const resMat = await fetch(`${API_URL}/api/materials`);
      if (resMat.ok) {
        const data = await resMat.json();
        setMaterials(data.map((m: any) => ({
          id: m.id,
          name: m.name,
          stock: m.stock,
          minRequired: m.min_required,
          leadTime: m.lead_time,
          status: m.status
        })));
      }

      const resBat = await fetch(`${API_URL}/api/batches`);
      if (resBat.ok) {
        setBatches(await resBat.json());
      }
    } catch (e) {
      console.warn('API connection failed. Falls back to mock data.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const triggerPO = async (matId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/purchase-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: matId, quantity: 100 })
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(data.message);
        loadData();
        setTimeout(() => setMessage(''), 4000);
        return;
      }
    } catch (e) {
      console.warn('API error, executing locally.');
    }

    setMaterials(prev => prev.map(m => {
      if (m.id === matId) {
        setMessage(`Successfully triggered purchase order for: ${m.name}`);
        return { ...m, stock: m.stock + 100, status: 'In Stock' };
      }
      return m;
    }));
    setTimeout(() => setMessage(''), 4000);
  };

  const autoOrderShortages = async () => {
    let triggeredCount = 0;
    try {
      for (const m of materials) {
        if (m.stock < m.minRequired) {
          await fetch(`${API_URL}/api/purchase-orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ materialId: m.id, quantity: 150 })
          });
          triggeredCount++;
        }
      }
      if (triggeredCount > 0) {
        setMessage(`Auto-PO Triggered: Ordered materials for ${triggeredCount} items.`);
        loadData();
        setTimeout(() => setMessage(''), 4000);
        return;
      }
    } catch (e) {
      console.warn('API error during auto-PO loop.');
    }

    setMaterials(prev => prev.map(m => {
      if (m.stock < m.minRequired) {
        triggeredCount++;
        return { ...m, stock: m.stock + 150, status: 'In Stock' };
      }
      return m;
    }));
    setMessage(`Auto-PO Triggered: Ordered materials for ${triggeredCount} items.`);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleDispatch = async (batchId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/batches/${batchId}/dispatch`, {
        method: 'PUT'
      });
      if (res.ok) {
        setMessage(`Batch ${batchId} has been successfully dispatched to the logistics center.`);
        loadData();
        setTimeout(() => setMessage(''), 4000);
        return;
      }
    } catch (e) {
      console.warn('API connection failed, dispatching locally.');
    }

    setBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        return { ...b, status: 'Dispatched' };
      }
      return b;
    }));
    setMessage(`Batch ${batchId} has been successfully dispatched to the logistics center.`);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar role="Production Operative" />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Material & Logistics Control</h1>
            <p className="text-sm text-slate-500">Manage raw material safety stock, view suppliers, and track batch dispatches</p>
          </div>
          {activeTab === 'inventory' && (
            <button
              onClick={autoOrderShortages}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-550 text-white rounded-lg text-sm font-semibold transition-all self-start shadow-sm"
            >
              Auto-Trigger All Shortages
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all px-1 whitespace-nowrap ${
              activeTab === 'inventory' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Inventory Stock Levels
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all px-1 whitespace-nowrap ${
              activeTab === 'suppliers' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Supplier Portal
          </button>
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`pb-3 text-sm font-bold border-b-2 transition-all px-1 whitespace-nowrap ${
              activeTab === 'dispatch' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Batch Dispatches
          </button>
        </div>

        {message && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-lg mb-6 font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            {message}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-4.5 h-4.5 text-emerald-500" />
                Inventory Stock Levels
              </h2>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/30">
                  <th className="px-6 py-3">Material ID</th>
                  <th className="px-6 py-3">Material Name</th>
                  <th className="px-6 py-3">Available Stock</th>
                  <th className="px-6 py-3">Minimum Safety Stock</th>
                  <th className="px-6 py-3">Supplier Lead Time</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {materials.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold">{m.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{m.name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{m.stock} units</td>
                    <td className="px-6 py-4 text-slate-500">{m.minRequired} units</td>
                    <td className="px-6 py-4">{m.leadTime}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                        m.stock >= m.minRequired
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : m.stock > 10
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}>
                        {m.stock < m.minRequired && <AlertTriangle className="w-3 h-3 text-current" />}
                        {m.stock < m.minRequired ? (m.stock <= 10 ? 'Shortage' : 'Low Stock') : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => triggerPO(m.id)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold transition-all"
                      >
                        Trigger Purchase Order (PO)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Suppliers Tab */}
        {activeTab === 'suppliers' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-emerald-500" />
                Raw Material Suppliers
              </h2>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/30">
                  <th className="px-6 py-3">Supplier Name</th>
                  <th className="px-6 py-3">Material Supplied</th>
                  <th className="px-6 py-3">Lead Time</th>
                  <th className="px-6 py-3">Email Contact</th>
                  <th className="px-6 py-3 text-right">Phone Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {SUPPLIERS.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                    <td className="px-6 py-4 font-semibold">{s.material}</td>
                    <td className="px-6 py-4">{s.leadTime}</td>
                    <td className="px-6 py-4 font-mono text-slate-500">{s.contact}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-500">{s.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dispatch Tab */}
        {activeTab === 'dispatch' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Truck className="w-4.5 h-4.5 text-emerald-500" />
                Cookware Batch Dispatch list
              </h2>
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/30">
                  <th className="px-6 py-3">Batch ID</th>
                  <th className="px-6 py-3">Product Name</th>
                  <th className="px-6 py-3">Quantity</th>
                  <th className="px-6 py-3">Quality Audit</th>
                  <th className="px-6 py-3">Shipping Status</th>
                  <th className="px-6 py-3 text-right">Dispatch Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {batches.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold">{b.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{b.product}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{b.qty} units</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        b.quality === 'Passed' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                      }`}>
                        {b.quality}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                        b.status === 'Dispatched' ? 'bg-slate-100 border-slate-200 text-slate-500' :
                        b.status === 'On Hold' ? 'bg-red-50 border-red-200 text-red-700' :
                        'bg-blue-50 border-blue-200 text-blue-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDispatch(b.id)}
                        disabled={b.status === 'Dispatched' || b.quality !== 'Passed'}
                        className={`px-3 py-1 rounded text-[10px] font-bold transition-all border ${
                          b.status === 'Dispatched' || b.quality !== 'Passed'
                            ? 'bg-slate-100 border-slate-200 text-slate-350 cursor-not-allowed'
                            : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-550'
                        }`}
                      >
                        Ship Batch
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
