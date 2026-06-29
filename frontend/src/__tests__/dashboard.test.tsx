import React from 'react';
import { render as rtlRender, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../store';
import { logout } from '../store/authSlice';
import Login from '../pages/Login';
import FloorManager from '../pages/FloorManager';
import StamperJobSheet from '../pages/StamperJobSheet';
import ProductOperative from '../pages/ProductOperative';
import ProductionManager from '../pages/ProductionManager';
import MarketingDirector from '../pages/MarketingDirector';

const render = (ui: React.ReactElement, options?: any) => {
  return rtlRender(
    <Provider store={store}>
      {ui}
    </Provider>,
    options
  );
};

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as any),
  useNavigate: () => mockNavigate,
}));

describe('JustInTime MRP Application Test Suite', () => {
  let rescheduleTriggered = false;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    store.dispatch(logout());
    rescheduleTriggered = false;

    global.fetch = jest.fn((url: string, options?: any) => {
      let data: any = [];
      if (url.includes('/api/login')) {
        const { username, password } = JSON.parse(options.body);
        if (username === 'floormanager' && password === 'Floor@1234') {
          data = { success: true, username: 'floormanager', role: 'Floor Manager' };
        } else {
          return Promise.resolve({
            ok: false,
            status: 401,
            json: () => Promise.resolve({ error: 'Invalid username or password. Please check credentials.' }),
          } as Response);
        }
      } else if (url.includes('/api/machines')) {
        data = [
          { id: 'M-001', type: 'Stamping machine', location: 'Floor A, Bay 3', operator: 'Mattie F.', job_in_progress: 'JC-4421', progress: 72, status: 'running', next_maint: '14 Apr' },
          { id: 'M-003', type: 'Conveyor belt', location: 'Floor B, Bay 1', operator: '—', job_in_progress: 'Halted', progress: 0, status: 'fault', next_maint: 'Urgent' }
        ];
      } else if (url.includes('/api/timetable')) {
        data = [];
      } else if (url.includes('/api/maintenance')) {
        if (options && options.method === 'POST') {
          data = { id: 'L-8824', machine_id: 'M-001', action: 'Fixed', date: 'Today', technician: 'Bob', status: 'Completed' };
        } else {
          data = [];
        }
      } else if (url.includes('/reschedule')) {
        rescheduleTriggered = true;
        data = { id: 'JC-4423', start_time: '14:00', end_time: '16:00' };
      } else if (url.includes('/api/jobs')) {
        data = [
          { id: 'JC-4421', machine_id: 'M-001', day: 'Mon', start_time: '08:00', end_time: '10:00', title: 'Cardamon Press', mat_ready: true },
          { id: 'JC-4423', machine_id: 'M-001', day: 'Mon', start_time: rescheduleTriggered ? '14:00' : '09:00', end_time: rescheduleTriggered ? '16:00' : '11:00', title: 'Clove Press', mat_ready: false }
        ];
      } else if (url.includes('/api/purchase-orders')) {
        data = { message: 'Successfully triggered purchase order for: Titanium sheet' };
      } else if (url.includes('/api/materials')) {
        data = [
          { id: 'MAT-001', name: 'Titanium sheet', stock: 120, min_required: 50, lead_time: '3 days', status: 'In Stock' }
        ];
      } else if (url.includes('/api/batches')) {
        data = [];
      } else if (url.includes('/api/admin/users')) {
        data = [
          { username: 'floormanager', role: 'Floor Manager', status: 'Active' }
        ];
      } else if (url.includes('/api/orders')) {
        if (options && options.method === 'POST') {
          data = { id: 'ORD-1234', customer: 'New Test Client', product: 'Cardamon', qty: 5, customisation: '', status: 'Pending', delivery: 'TBC' };
        } else {
          data = [
            { id: 'ORD-1001', customer: 'The Floats Family', product: 'Cardamon', qty: 12, customisation: 'Signature engraving', status: 'In Production', delivery: '15 Apr 2026' },
            { id: 'ORD-1005', customer: 'Gold Leaf Restaurant', product: 'Rosemary TS1', qty: 8, customisation: 'New colourway: Ivory', status: 'Issue', delivery: 'TBC' }
          ];
        }
      } else if (url.includes('/api/forecasts')) {
        data = [];
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(data),
      } as Response);
    }) as jest.Mock;
  });

  test('TC-01: Login renders all inputs and test accounts', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByText('JustInTime')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByText('floormanager')).toBeInTheDocument();
  });

  test('TC-02: Login validation displays error for incorrect credentials', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    const userInput = screen.getByLabelText(/username/i);
    const passInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(userInput, { target: { value: 'wronguser' } });
    fireEvent.change(passInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument();
  });

  test('TC-03: FloorManager dashboard renders statistics and machine list', () => {
    render(
      <BrowserRouter>
        <FloorManager />
      </BrowserRouter>
    );
    expect(screen.getByText(/Floor Operations/i)).toBeInTheDocument();
    expect(screen.getByText(/total machines/i)).toBeInTheDocument();
    expect(screen.getByText('M-001')).toBeInTheDocument();
    expect(screen.getByText('M-003')).toBeInTheDocument();
  });

  test('TC-04: Stamper job sheet displays job cards and shifts', () => {
    render(
      <BrowserRouter>
        <StamperJobSheet />
      </BrowserRouter>
    );
    expect(screen.getByText('Mattie Float')).toBeInTheDocument();
    expect(screen.getByText('JC-4421')).toBeInTheDocument();
    expect(screen.getByText('Titanium sheet, Handle grip x2')).toBeInTheDocument();
  });

  test('TC-05: ProductOperative allows triggering purchase order (PO)', async () => {
    render(
      <BrowserRouter>
        <ProductOperative />
      </BrowserRouter>
    );
    const triggerButtons = screen.getAllByRole('button', { name: /trigger purchase order/i });
    fireEvent.click(triggerButtons[0]);
    expect(await screen.findByText(/successfully triggered purchase order/i)).toBeInTheDocument();
  });

  // Sprint 2 Specific Test Cases (alight with the Report)
  test('TC-06: ProductionManager Order List renders with active orders', () => {
    render(
      <BrowserRouter>
        <ProductionManager />
      </BrowserRouter>
    );
    expect(screen.getByText('ORD-1001')).toBeInTheDocument();
    expect(screen.getByText('The Floats Family')).toBeInTheDocument();
    expect(screen.getByText('ORD-1005')).toBeInTheDocument();
  });

  test('TC-07: ProductionManager Order status badge renders correct color styling', () => {
    const { container } = render(
      <BrowserRouter>
        <ProductionManager />
      </BrowserRouter>
    );
    const badge = container.querySelector('.border-blue-200');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(/In Production/i);
  });

  test('TC-08: Production Schedule Calendar renders 7-day grid', () => {
    render(
      <BrowserRouter>
        <ProductionManager />
      </BrowserRouter>
    );
    expect(screen.getByText('7-Day Production Schedule Grid')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  test('TC-09: ProductionScheduleCalendar conflict detection renders booking warning', async () => {
    render(
      <BrowserRouter>
        <ProductionManager />
      </BrowserRouter>
    );
    expect(screen.getByText('Double Booking Alert (M-001)')).toBeInTheDocument();
    
    // Resolve conflict
    const resolveBtn = screen.getByRole('button', { name: /reschedule job card/i });
    fireEvent.click(resolveBtn);
    expect(await screen.findByText('All Conflicts Resolved')).toBeInTheDocument();
  });

  test('TC-10: MarketingDirector form submits a valid order', async () => {
    render(
      <BrowserRouter>
        <MarketingDirector />
      </BrowserRouter>
    );
    const clientInput = screen.getByLabelText(/Customer \/ Client Name/i);
    const qtyInput = screen.getByLabelText(/Quantity/i);
    const form = screen.getByRole('button', { name: /submit order to production/i });

    fireEvent.change(clientInput, { target: { value: 'New Test Client' } });
    fireEvent.change(qtyInput, { target: { value: '5' } });
    fireEvent.click(form);

    expect(await screen.findByText(/order submitted for customer: New Test Client/i)).toBeInTheDocument();
  });
});
