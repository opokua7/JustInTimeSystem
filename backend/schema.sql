-- JustInTime FloatFry MRP Database Schema

-- Drop tables if they exist to allow clean rebuilds
DROP TABLE IF EXISTS forecasts;
DROP TABLE IF EXISTS batches;
DROP TABLE IF EXISTS designs;
DROP TABLE IF EXISTS timetable;
DROP TABLE IF EXISTS maintenance_logs;
DROP TABLE IF EXISTS purchase_orders;
DROP TABLE IF EXISTS materials;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS machines;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;

-- 1. Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Active'
);

-- Seed initial test users
INSERT INTO users (username, password, role, status) VALUES
('floormanager', 'Floor@1234', 'Floor Manager', 'Active'),
('stamper01', 'Stamp@1234', 'Stamper', 'Active'),
('prodop01', 'ProdOp@1234', 'Production Operative', 'Active'),
('prodeng01', 'ProdEng@1234', 'Product Engineer', 'Active'),
('prodmgr', 'ProdMgr@1234', 'Production Manager', 'Active'),
('marketing', 'Market@1234', 'Marketing Director', 'Active'),
('admin', 'Admin@1234', 'Admin', 'Active');

-- 2. Machines table
CREATE TABLE machines (
    id VARCHAR(10) PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    operator VARCHAR(100) DEFAULT '—',
    job_in_progress VARCHAR(10) DEFAULT 'None',
    progress INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'idle',
    next_maint VARCHAR(20) NOT NULL
);

-- Seed initial machines
INSERT INTO machines (id, type, location, operator, job_in_progress, progress, status, next_maint) VALUES
('M-001', 'Stamping machine', 'Floor A, Bay 3', 'Mattie F.', 'JC-4421', 72, 'running', '14 Apr'),
('M-002', 'Coating machine', 'Floor A, Bay 5', 'Sam K.', 'JC-4419', 45, 'warning', 'Today'),
('M-003', 'Conveyor belt', 'Floor B, Bay 1', '—', 'Halted', 0, 'fault', 'Urgent'),
('M-004', 'Plotter printer', 'Floor C, Bay 2', 'Lisa T.', 'JC-4425', 88, 'running', '20 Apr'),
('M-005', 'Assembly machine', 'Floor B, Bay 4', '—', 'Awaiting', 0, 'idle', '22 Apr'),
('M-006', 'Heat-seal machine', 'Floor B, Bay 2', 'Omar B.', 'JC-4420', 31, 'running', '18 Apr');

-- 3. Materials table
CREATE TABLE materials (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    stock INTEGER NOT NULL,
    min_required INTEGER NOT NULL,
    lead_time VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL
);

-- Seed initial materials
INSERT INTO materials (id, name, stock, min_required, lead_time, status) VALUES
('MAT-001', 'Titanium sheet', 120, 50, '3 days', 'In Stock'),
('MAT-002', 'Handle grip x2', 12, 40, '5 days', 'Low Stock'),
('MAT-003', 'Heat-seal film', 350, 100, '2 days', 'In Stock'),
('MAT-004', 'Lid blank x4', 4, 20, '7 days', 'Shortage'),
('MAT-005', 'Engraving foil', 80, 15, '4 days', 'In Stock');

-- 4. Orders table
CREATE TABLE orders (
    id VARCHAR(20) PRIMARY KEY,
    customer VARCHAR(100) NOT NULL,
    product VARCHAR(50) NOT NULL,
    qty INTEGER NOT NULL,
    customisation VARCHAR(255) DEFAULT 'None',
    status VARCHAR(20) NOT NULL,
    delivery VARCHAR(50) NOT NULL
);

-- Seed initial orders
INSERT INTO orders (id, customer, product, qty, customisation, status, delivery) VALUES
('ORD-1001', 'The Floats Family', 'Cardamon', 12, 'Signature engraving', 'In Production', '15 Apr 2026'),
('ORD-1002', 'Hendricks & Co.', 'Saffron XP', 6, 'Custom colour: Teal', 'Pending', '18 Apr 2026'),
('ORD-1003', 'Premier Kitchens Ltd', 'Clove TM47', 20, 'Standard', 'Completed', '10 Apr 2026'),
('ORD-1004', 'Rosewood Hotels', 'Chive TX5', 50, 'Hotel logo engraving', 'In Production', '22 Apr 2026'),
('ORD-1005', 'Gold Leaf Restaurant', 'Rosemary TS1', 8, 'New colourway: Ivory', 'Issue', 'TBC');

-- 5. Jobs table (production schedule blocks)
CREATE TABLE jobs (
    id VARCHAR(10) PRIMARY KEY,
    machine_id VARCHAR(10) REFERENCES machines(id),
    day VARCHAR(10) NOT NULL,
    start_time VARCHAR(10) NOT NULL,
    end_time VARCHAR(10) NOT NULL,
    title VARCHAR(100) NOT NULL,
    mat_ready BOOLEAN DEFAULT FALSE
);

INSERT INTO jobs (id, machine_id, day, start_time, end_time, title, mat_ready) VALUES
('JC-4421', 'M-001', 'Mon', '08:00', '10:00', 'Cardamon Press', TRUE),
('JC-4423', 'M-001', 'Mon', '09:00', '11:00', 'Clove Press', FALSE),
('JC-4422', 'M-006', 'Tue', '10:00', '12:00', 'Saffron Lid Seal', TRUE),
('JC-4424', 'M-004', 'Wed', '14:00', '16:00', 'Rosemary Engrave', FALSE);

-- 6. Maintenance Logs
CREATE TABLE maintenance_logs (
    id VARCHAR(10) PRIMARY KEY,
    machine_id VARCHAR(10) REFERENCES machines(id),
    action VARCHAR(255) NOT NULL,
    date VARCHAR(20) NOT NULL,
    technician VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL
);

INSERT INTO maintenance_logs (id, machine_id, action, date, technician, status) VALUES
('L-8821', 'M-001', 'Replaced press mold and checked hydraulic pressure', '08 Apr 2026', 'Alice R.', 'Completed'),
('L-8822', 'M-002', 'Oiled roller bearings and cleaned spray nozzles', '09 Apr 2026', 'Bob S.', 'Completed'),
('L-8823', 'M-003', 'Replaced faulty belt drive gear', 'Today', 'Alice R.', 'In Progress');

-- 7. Timetable Shift table
CREATE TABLE timetable (
    id SERIAL PRIMARY KEY,
    operator VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    shift VARCHAR(100) NOT NULL,
    machine VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL
);

INSERT INTO timetable (operator, role, shift, machine, status) VALUES
('Mattie F.', 'Stamper', 'AM Shift (06:00 – 14:00)', 'M-001 Stamping', 'Active'),
('Omar B.', 'Stamper', 'AM Shift (06:00 – 14:00)', 'M-006 Heat-seal', 'Active'),
('Sam K.', 'Coater Operative', 'PM Shift (14:00 – 22:00)', 'M-002 Coating', 'Scheduled'),
('Lisa T.', 'Printer Specialist', 'PM Shift (14:00 – 22:00)', 'M-004 Plotter', 'Scheduled'),
('Dave H.', 'Assembly Tech', 'AM Shift (06:00 – 14:00)', 'M-005 Assembly', 'On Break');

-- 8. Batches Dispatch table
CREATE TABLE batches (
    id VARCHAR(10) PRIMARY KEY,
    product VARCHAR(100) NOT NULL,
    qty INTEGER NOT NULL,
    quality VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL
);

INSERT INTO batches (id, product, qty, quality, status) VALUES
('B-0081', 'Cardamon Frying Pan', 150, 'Passed', 'Pending Dispatch'),
('B-0082', 'Saffron XP Frying Pan', 80, 'Passed', 'Pending Dispatch'),
('B-0083', 'Clove TM47 Lid Unit', 220, 'In Review', 'On Hold'),
('B-0084', 'Rosemary TS1 Engraved', 60, 'Passed', 'Dispatched');

-- 9. Design Specifications table
CREATE TABLE designs (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    stage VARCHAR(50) NOT NULL,
    updated VARCHAR(50) NOT NULL,
    check_cad BOOLEAN DEFAULT FALSE,
    check_stress BOOLEAN DEFAULT FALSE,
    check_thermal BOOLEAN DEFAULT FALSE
);

INSERT INTO designs (id, name, category, stage, updated, check_cad, check_stress, check_thermal) VALUES
('DS-001', 'Cardamon V2 – Circular press', 'Frying Pan', 'Production Ready', '2 days ago', TRUE, TRUE, TRUE),
('DS-002', 'Saffron XP – Lid seal pattern', 'Lid System', 'In Design Review', 'Yesterday', TRUE, TRUE, FALSE),
('DS-003', 'Clove TM47 – Handle press spec', 'Handle Mount', 'Prototype Stage', 'Just Now', TRUE, FALSE, FALSE);

-- 10. Forecasts table
CREATE TABLE forecasts (
    id SERIAL PRIMARY KEY,
    month VARCHAR(20) NOT NULL,
    target_volume INTEGER NOT NULL,
    actual_sales INTEGER DEFAULT 0,
    rate VARCHAR(20) DEFAULT 'TBD'
);

INSERT INTO forecasts (month, target_volume, actual_sales, rate) VALUES
('May 2026', 2000, 1950, '97.5%'),
('Jun 2026', 2200, 2350, '106.8%'),
('Jul 2026', 2500, 0, 'TBD');
