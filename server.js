import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// -------------------- HOMEPAGE --------------------
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Express API</title>
      </head>
      <body>
        <h1>Express API</h1>
      </body>
    </html>
  `);
});

// -------------------- IN-MEMORY DATA --------------------
const users = [
  { id: 1, name: 'Admin User', email: 'admin@example.com' },
  { id: 2, name: 'Regular User', email: 'user@example.com' },
  { id: 3, name: 'Another User', email: 'another@example.com' }
];

let transactions = [];
let nextTransactionId = 1;

// Seed 30 transactions
for (let i = 1; i <= 30; i++) {
  const isEven = i % 2 === 0;
  transactions.push({
    id: nextTransactionId++,
    amount: i * 10,
    type: isEven ? 'withdrawal' : 'deposit',
    owner: isEven ? 'user@example.com' : 'admin@example.com'
  });
}

// -------------------- AUTH HELPERS --------------------
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing token' });

  const token = header.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, 'super-secret-key');
    req.role = decoded.role;
    req.email = decoded.email;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// -------------------- HEALTH --------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({ health: 'healthy' });
});

// -------------------- STATUS --------------------
app.get('/api/status', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// -------------------- LOGIN --------------------
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email) return res.status(400).json({ error: 'Missing email' });
  if (!password) return res.status(400).json({ error: 'Missing password' });

  let role = null;

  if (email === 'admin@example.com' && password === 'secret') {
    role = 'admin';
  } else if (email === 'user@example.com' && password === 'secret') {
    role = 'user';
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email, role }, 'super-secret-key', { expiresIn: '1h' });

  res.status(200).json({ token, role });
});

// -------------------- USERS CRUD --------------------
app.post('/api/users', auth, (req, res) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { name, email } = req.body || {};

  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!email) return res.status(400).json({ error: 'Email is required' });
  if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email format' });

  if (users.some(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email
  };

  users.push(newUser);
  res.status(201).json(newUser);
});

// -------------------- USERS GET BY ID (RBAC FIXED) --------------------
app.get('/api/users/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'Not found' });
  }

  // Regular user can ONLY access their own profile
  if (req.role === 'user' && user.email !== req.email) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.status(200).json(user);
});

// -------------------- USERS UPDATE --------------------
app.put('/api/users/:id', auth, (req, res) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const id = parseInt(req.params.id);
  const { name } = req.body || {};

  if (!name) return res.status(400).json({ error: 'Name is required' });

  const user = users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'Not found' });

  user.name = name;
  res.status(200).json(user);
});

// -------------------- USERS DELETE --------------------
app.delete('/api/users/:id', auth, (req, res) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const id = parseInt(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) return res.status(404).json({ error: 'Not found' });

  users.splice(index, 1);
  res.status(200).json({ deleted: true });
});

// -------------------- USERS LIST --------------------
app.get('/api/users', auth, (req, res) => {
  if (req.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  let { page = 1, limit = 10, search = '', sort = 'id', order = 'asc' } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);
  order = order.toLowerCase() === 'desc' ? 'desc' : 'asc';

  const allowedSort = ['id', 'name', 'email'];
  if (!allowedSort.includes(sort)) sort = 'id';

  let filtered = users;

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s)
    );
  }

  filtered = filtered.sort((a, b) => {
    const A = a[sort];
    const B = b[sort];
    if (A < B) return order === 'asc' ? -1 : 1;
    if (A > B) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  const data = filtered.slice(offset, offset + limit);

  res.status(200).json({ page, limit, total, totalPages, data });
});

// -------------------- TRANSACTIONS CREATE --------------------
app.post('/api/transactions', auth, (req, res) => {
  const { amount, type } = req.body || {};

  if (amount === undefined || amount === null) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  if (typeof amount !== 'number') {
    return res.status(400).json({ error: 'Amount must be a number' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be positive' });
  }

  if (!type) {
    return res.status(400).json({ error: 'Type is required' });
  }

  const allowedTypes = ['deposit', 'withdrawal'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  const newTransaction = {
    id: nextTransactionId++,
    amount,
    type,
    owner: req.email
  };

  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

// -------------------- TRANSACTIONS LIST --------------------
app.get('/api/transactions', auth, (req, res) => {
  let { page = 1, limit = 10, type, minAmount, maxAmount, sort = 'id', order = 'asc' } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);
  order = order.toLowerCase() === 'desc' ? 'desc' : 'asc';

  const allowedSort = ['id', 'amount', 'type', 'owner'];
  if (!allowedSort.includes(sort)) sort = 'id';

  let filtered = transactions;

  if (req.role === 'user') {
    filtered = filtered.filter(t => t.owner === req.email);
  }

  if (type) filtered = filtered.filter(t => t.type === type);
  if (minAmount) filtered = filtered.filter(t => t.amount >= parseFloat(minAmount));
  if (maxAmount) filtered = filtered.filter(t => t.amount <= parseFloat(maxAmount));

  filtered = filtered.sort((a, b) => {
    const A = a[sort];
    const B = b[sort];
    if (A < B) return order === 'asc' ? -1 : 1;
    if (A > B) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  const data = filtered.slice(offset, offset + limit);

  res.status(200).json({ page, limit, total, totalPages, data });
});

// -------------------- START SERVER --------------------
app.listen(3000, () => {
  console.log('API running on http://localhost:3000');
});