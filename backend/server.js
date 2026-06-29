const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'justintime_mrp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Test connection and auto-seed users
pool.query('SELECT NOW()', async (err, res) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err.stack);
  } else {
    console.log('Successfully connected to PostgreSQL database');
    try {
      // Auto-create users table if not exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(100) NOT NULL,
          role VARCHAR(50) NOT NULL,
          status VARCHAR(20) DEFAULT 'Active'
        )
      `);
      
      // Seed default users if table is empty
      const userCount = await pool.query('SELECT COUNT(*) FROM users');
      if (parseInt(userCount.rows[0].count) === 0) {
        await pool.query(`
          INSERT INTO users (username, password, role, status) VALUES
          ('floormanager', 'Floor@1234', 'Floor Manager', 'Active'),
          ('stamper01', 'Stamp@1234', 'Stamper', 'Active'),
          ('prodop01', 'ProdOp@1234', 'Production Operative', 'Active'),
          ('prodeng01', 'ProdEng@1234', 'Product Engineer', 'Active'),
          ('prodmgr', 'ProdMgr@1234', 'Production Manager', 'Active'),
          ('marketing', 'Market@1234', 'Marketing Director', 'Active'),
          ('admin', 'Admin@1234', 'Admin', 'Active')
        `);
        console.log('Seeded default user accounts into PostgreSQL users table.');
      }
    } catch (dbInitErr) {
      console.error('Failed to initialize or seed users table:', dbInitErr);
    }
  }
});

// 1. User Authentication
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const result = await pool.query(
      'SELECT username, role, status FROM users WHERE username = $1 AND password = $2',
      [username.trim(), password]
    );
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (user.status !== 'Active') {
        return res.status(403).json({ error: 'Account access has been revoked' });
      }
      return res.status(200).json({ success: true, username: user.username, role: user.role });
    } else {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database login query failure' });
  }
});

// 2. Admin - Get all users
app.get('/api/admin/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT username, role, status FROM users ORDER BY username ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve user accounts' });
  }
});

// 3. Admin - Provision new user
app.post('/api/admin/users', async (req, res) => {
  const { username, role } = req.body;
  if (!username || !role) {
    return res.status(400).json({ error: 'Username and role are required fields' });
  }
  try {
    const defaultPassword = 'User@1234';
    const result = await pool.query(
      'INSERT INTO users (username, password, role, status) VALUES ($1, $2, $3, $4) RETURNING username, role, status',
      [username.toLowerCase().replace(/\s+/g, ''), defaultPassword, role, 'Active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create user account' });
  }
});

// 4. Admin - Toggle user status (revoke/grant)
app.put('/api/admin/users/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const userCheck = await pool.query('SELECT status FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const nextStatus = userCheck.rows[0].status === 'Active' ? 'Revoked' : 'Active';
    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE username = $2 RETURNING username, role, status',
      [nextStatus, username]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// 5. Floor Operations - Get Machines list
app.get('/api/machines', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM machines ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve machines' });
  }
});

// 6. Floor Operations - Get Shift Timetables
app.get('/api/timetable', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM timetable ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve timetable shifts' });
  }
});

// 7. Floor Operations - Get Maintenance Logs
app.get('/api/maintenance', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM maintenance_logs ORDER BY date DESC, id DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve maintenance logs' });
  }
});

// 8. Floor Operations - Add Maintenance Log & Update Machine Status
app.post('/api/maintenance', async (req, res) => {
  const { machineId, action, technician } = req.body;
  if (!machineId || !action || !technician) {
    return res.status(400).json({ error: 'machineId, action, and technician are required' });
  }
  try {
    const newId = `L-${Math.floor(1000 + Math.random() * 9000)}`;
    const date = 'Today';
    
    // Add maintenance entry
    const logResult = await pool.query(
      'INSERT INTO maintenance_logs (id, machine_id, action, date, technician, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [newId, machineId, action, date, technician, 'Completed']
    );

    // Update machine status back to running
    await pool.query(
      "UPDATE machines SET status = 'running', progress = 0, next_maint = '28 Apr' WHERE id = $1",
      [machineId]
    );

    res.status(201).json(logResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log maintenance' });
  }
});

// 9. Schedule - Get all Job Cards
app.get('/api/jobs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM jobs ORDER BY day ASC, start_time ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve jobs' });
  }
});

// 10. Schedule - Toggle materials confirmation for job card (Stamper Action)
app.put('/api/jobs/:id/materials', async (req, res) => {
  const { id } = req.params;
  try {
    const jobCheck = await pool.query('SELECT mat_ready FROM jobs WHERE id = $1', [id]);
    if (jobCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Job card not found' });
    }
    const nextVal = !jobCheck.rows[0].mat_ready;
    const result = await pool.query(
      'UPDATE jobs SET mat_ready = $1 WHERE id = $2 RETURNING *',
      [nextVal, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update job materials status' });
  }
});

// 11. Schedule - Reschedule Job (Conflict Resolution)
app.put('/api/jobs/:id/reschedule', async (req, res) => {
  const { id } = req.params;
  const { start, end } = req.body;
  if (!start || !end) {
    return res.status(400).json({ error: 'start and end times are required' });
  }
  try {
    const result = await pool.query(
      'UPDATE jobs SET start_time = $1, end_time = $2 WHERE id = $3 RETURNING *',
      [start, end, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reschedule job' });
  }
});

// 12. Logistics - Materials stock list
app.get('/api/materials', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM materials ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve materials' });
  }
});

// 13. Logistics - Trigger safety stock purchase order
app.post('/api/purchase-orders', async (req, res) => {
  const { materialId, quantity } = req.body;
  if (!materialId) {
    return res.status(400).json({ error: 'materialId is required' });
  }
  const orderQty = quantity || 100;
  try {
    const materialCheck = await pool.query('SELECT name FROM materials WHERE id = $1', [materialId]);
    if (materialCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }
    const updateResult = await pool.query(
      "UPDATE materials SET stock = stock + $1, status = 'In Stock' WHERE id = $2 RETURNING *",
      [orderQty, materialId]
    );
    res.status(201).json({
      message: `Successfully processed purchase order for: ${materialCheck.rows[0].name}`,
      updatedMaterial: updateResult.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to trigger purchase order' });
  }
});

// 14. Logistics - Get batches
app.get('/api/batches', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM batches ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve dispatch batches' });
  }
});

// 15. Logistics - Ship/Dispatch batch
app.put('/api/batches/:id/dispatch', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE batches SET status = 'Dispatched' WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to ship batch' });
  }
});

// 16. Engineering - Get design specs
app.get('/api/designs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM designs ORDER BY id DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve design specs' });
  }
});

// 17. Engineering - Upload design spec
app.post('/api/designs', async (req, res) => {
  const { name, category } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'Design spec name and category are required' });
  }
  try {
    const listCheck = await pool.query('SELECT count(*) FROM designs');
    const newId = `DS-00${parseInt(listCheck.rows[0].count) + 1}`;
    const result = await pool.query(
      "INSERT INTO designs (id, name, category, stage, updated, check_cad, check_stress, check_thermal) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [newId, name, category, 'Prototype Stage', 'Just Now', false, false, false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process spec upload' });
  }
});

// 18. Engineering - Toggle quality check status
app.put('/api/designs/:id/checks', async (req, res) => {
  const { id } = req.params;
  const { field } = req.body; // 'check_cad', 'check_stress', or 'check_thermal'
  if (!field) {
    return res.status(400).json({ error: 'field identifier is required' });
  }
  try {
    const checkRow = await pool.query('SELECT * FROM designs WHERE id = $1', [id]);
    if (checkRow.rows.length === 0) {
      return res.status(404).json({ error: 'Design spec not found' });
    }
    const currentVal = checkRow.rows[0][field];
    const nextVal = !currentVal;
    
    // Toggle check
    const updateCheck = await pool.query(
      `UPDATE designs SET ${field} = $1, updated = 'Just Now' WHERE id = $2 RETURNING *`,
      [nextVal, id]
    );
    
    const d = updateCheck.rows[0];
    // Re-determine stage
    let nextStage = 'Prototype Stage';
    if (d.check_cad && d.check_stress && d.check_thermal) {
      nextStage = 'Production Ready';
    } else if (d.check_cad) {
      nextStage = 'In Design Review';
    }
    
    const finalResult = await pool.query(
      'UPDATE designs SET stage = $1 WHERE id = $2 RETURNING *',
      [nextStage, id]
    );
    
    res.status(200).json(finalResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update quality check' });
  }
});

// 19. Marketing - Get all forecasts
app.get('/api/forecasts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM forecasts ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve sales forecasts' });
  }
});

// 20. Marketing - Add Forecast target
app.post('/api/forecasts', async (req, res) => {
  const { month, target } = req.body;
  if (!month || !target) {
    return res.status(400).json({ error: 'month and target volume are required' });
  }
  try {
    const result = await pool.query(
      "INSERT INTO forecasts (month, target_volume, actual_sales, rate) VALUES ($1, $2, $3, $4) RETURNING *",
      [month, target, 0, 'TBD']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add sales forecast target' });
  }
});

// 21. Marketing - Get orders
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY id DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve orders list' });
  }
});

// 22. Marketing - Create sales order
app.post('/api/orders', async (req, res) => {
  const { customer, product, qty, customisation } = req.body;
  if (!customer || !product || !qty) {
    return res.status(400).json({ error: 'customer, product, and qty are required' });
  }
  try {
    const newId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const delivery = '15 Apr 2026';
    const status = 'Pending';
    const result = await pool.query(
      'INSERT INTO orders (id, customer, product, qty, customisation, status, delivery) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [newId, customer, product, qty, customisation || 'None', status, delivery]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create sales order' });
  }
});

app.listen(PORT, () => {
  console.log(`JustInTime MRP Backend running on http://localhost:${PORT}`);
});
