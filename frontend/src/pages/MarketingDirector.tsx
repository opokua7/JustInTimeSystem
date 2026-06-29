import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import { ShoppingCart, CheckCircle2, TrendingUp, BarChart3, ClipboardList } from 'lucide-react';

const FALLBACK_FORECASTS = [
  { month: 'May 2026', target: 2000, actual: 1950, rate: '97.5%' },
  { month: 'Jun 2026', target: 2200, actual: 2350, rate: '106.8%' },
  { month: 'Jul 2026', target: 2500, actual: 0, rate: 'TBD' }
];

const FALLBACK_PLACED_ORDERS = [
  { id: 'ORD-5001', customer: 'The Floats Family', product: 'Cardamon', qty: 12, customisation: 'Signature engraving', status: 'In Production' },
  { id: 'ORD-5002', customer: 'Hendricks & Co.', product: 'Saffron XP', qty: 6, customisation: 'Custom teal color', status: 'Pending' },
];

export default function MarketingDirector() {
  const [customer, setCustomer] = useState('');
  const [product, setProduct] = useState('Cardamon');
  const [qty, setQty] = useState(1);
  const [customisation, setCustomisation] = useState('');
  const [forecasts, setForecasts] = useState(FALLBACK_FORECASTS);
  const [placedOrders, setPlacedOrders] = useState(FALLBACK_PLACED_ORDERS);
  const [newTarget, setNewTarget] = useState('');
  const [newMonth, setNewMonth] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    try {
      const resOrd = await fetch(`${API_URL}/api/orders`);
      if (resOrd.ok) {
        setPlacedOrders(await resOrd.json());
      }
      const resFor = await fetch(`${API_URL}/api/forecasts`);
      if (resFor.ok) {
        const data = await resFor.json();
        setForecasts(data.map((f: any) => ({
          month: f.month,
          target: f.target_volume,
          actual: f.actual_sales,
          rate: f.rate
        })));
      }
    } catch (e) {
      console.warn('API error, falling back to mock data lists.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim() || qty <= 0) return;

    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer, product, qty, customisation })
      });
      if (response.ok) {
        const data = await response.json();
        setMessage(`Order submitted for customer: ${customer} (${qty}x ${product})`);
        loadData();
        setCustomer('');
        setCustomisation('');
        setQty(1);
        setTimeout(() => setMessage(''), 4000);
        return;
      }
    } catch (e) {
      console.warn('API integration failed. Simulating locally.');
    }

    const newOrder = {
      id: `ORD-${Math.floor(5000 + Math.random() * 5000)}`,
      customer: customer,
      product: product,
      qty: qty,
      customisation: customisation || 'None',
      status: 'Pending'
    };

    setPlacedOrders([newOrder, ...placedOrders]);
    setMessage(`Order submitted for customer: ${customer} (${qty}x ${product})`);
    setCustomer('');
    setCustomisation('');
    setQty(1);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleAddForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonth || !newTarget) return;

    try {
      const response = await fetch(`${API_URL}/api/forecasts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: newMonth, target: parseInt(newTarget) })
      });
      if (response.ok) {
        loadData();
        setNewMonth('');
        setNewTarget('');
        return;
      }
    } catch (e) {
      console.warn('API error. Simulating locally.');
    }

    const newForecast = {
      month: newMonth,
      target: parseInt(newTarget),
      actual: 0,
      rate: 'TBD'
    };

    setForecasts([...forecasts, newForecast]);
    setNewMonth('');
    setNewTarget('');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar role="Marketing Director" />

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Order Entry Form */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <ShoppingCart className="w-5 h-5 text-emerald-500" />
            Place Sales Order
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter new customer purchases to queue into the JIT production schedule pipeline.
          </p>

          {message && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs p-3 rounded-lg mb-4 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {message}
            </div>
          )}

          <form onSubmit={handleOrderSubmit} className="space-y-4 text-xs">
            <div>
              <label htmlFor="customer-input" className="block text-slate-500 font-semibold mb-1">Customer / Client Name</label>
              <input
                id="customer-input"
                type="text"
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Hendricks & Co."
                value={customer}
                onChange={e => setCustomer(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="product-select" className="block text-slate-500 font-semibold mb-1">Product Line</label>
                <select
                  id="product-select"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                >
                  <option value="Cardamon">Cardamon</option>
                  <option value="Saffron XP">Saffron XP</option>
                  <option value="Clove TM47">Clove TM47</option>
                  <option value="Chive TX5">Chive TX5</option>
                  <option value="Rosemary TS1">Rosemary TS1</option>
                </select>
              </div>

              <div>
                <label htmlFor="qty-input" className="block text-slate-500 font-semibold mb-1">Quantity</label>
                <input
                  id="qty-input"
                  type="number"
                  min="1"
                  required
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                  value={qty}
                  onChange={e => setQty(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="custom-textarea" className="block text-slate-500 font-semibold mb-1">Customisation Specs</label>
              <textarea
                id="custom-textarea"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded px-3 py-2 focus:outline-none focus:border-emerald-500"
                placeholder="e.g. Custom teal color, Hotel logo engraving..."
                rows={3}
                value={customisation}
                onChange={e => setCustomisation(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded transition-all text-xs"
            >
              Submit Order to Production
            </button>
          </form>
        </div>

        {/* Live Tracked Placed Orders List & Sales Forecasting Panel */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-emerald-500" />
              Live Placed Orders Queue
            </h2>
            <div className="overflow-x-auto max-h-60 overflow-y-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 sticky top-0">
                    <th className="px-4 py-2">ID</th>
                    <th className="px-4 py-2">Customer</th>
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Qty</th>
                    <th className="px-4 py-2">Specs</th>
                    <th className="px-4 py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-655 bg-white">
                  {placedOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-bold text-slate-800">{o.id}</td>
                      <td className="px-4 py-2.5">{o.customer}</td>
                      <td className="px-4 py-2.5 font-medium">{o.product}</td>
                      <td className="px-4 py-2.5 font-bold text-slate-850">{o.qty}</td>
                      <td className="px-4 py-2.5 text-slate-450 italic">{o.customisation}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          o.status === 'Pending' ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-blue-50 border-blue-200 text-blue-700'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Demand Forecasting Input
            </h2>

            {/* Table display */}
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                    <th className="px-4 py-2">Forecast Period</th>
                    <th className="px-4 py-2">Target Demand (units)</th>
                    <th className="px-4 py-2">Actual Sales (units)</th>
                    <th className="px-4 py-2 text-right">Forecast Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 bg-white">
                  {forecasts.map((f, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{f.month}</td>
                      <td className="px-4 py-3">{f.target}</td>
                      <td className="px-4 py-3">{f.actual || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 rounded font-bold border ${
                          f.rate === 'TBD'
                            ? 'bg-slate-50 border-slate-250 text-slate-500'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}>
                          {f.rate}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Form input */}
            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                Add Target Demand
              </h3>
              <form onSubmit={handleAddForecast} className="flex flex-col sm:flex-row gap-4 text-xs">
                <input
                  type="text"
                  required
                  className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-3 py-2 flex-1 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Aug 2026"
                  value={newMonth}
                  onChange={e => setNewMonth(e.target.value)}
                />
                <input
                  type="number"
                  required
                  className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-3 py-2 flex-1 focus:outline-none focus:border-emerald-500"
                  placeholder="Target volume (e.g. 2600)"
                  value={newTarget}
                  onChange={e => setNewTarget(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded transition-all text-xs shrink-0"
                >
                  Log Forecast Target
                </button>
              </form>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
