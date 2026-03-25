const express = require('express');
const { getAll, getOne, run, getDbReady } = require('../db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.use(async (req, res, next) => { await getDbReady(); next(); });

const prospectJoin = `
  SELECT p.*,
    c.first_name || ' ' || c.last_name AS contact_name,
    c.company AS contact_company, c.email AS contact_email, c.phone AS contact_phone,
    a.make || ' ' || a.model AS aircraft_name, a.price AS aircraft_price,
    a.registration AS aircraft_registration, a.year AS aircraft_year
  FROM prospects p
  LEFT JOIN contacts c ON p.contact_id = c.id
  LEFT JOIN aircraft a ON p.aircraft_id = a.id
`;

router.get('/', (req, res) => {
  const { stage, priority, assigned_to, search } = req.query;
  let query = prospectJoin + ' WHERE 1=1';
  const params = [];
  let idx = 1;

  if (stage) { query += ` AND p.stage = ?${idx}`; params.push(stage); idx++; }
  if (priority) { query += ` AND p.priority = ?${idx}`; params.push(priority); idx++; }
  if (assigned_to) { query += ` AND p.assigned_to = ?${idx}`; params.push(assigned_to); idx++; }
  if (search) {
    const term = `%${search}%`;
    query += ` AND (c.first_name LIKE ?${idx} OR c.last_name LIKE ?${idx} OR c.company LIKE ?${idx} OR a.make LIKE ?${idx} OR a.model LIKE ?${idx})`;
    params.push(term); idx++;
  }
  query += ' ORDER BY p.created_at DESC';
  res.json(getAll(query, params));
});

router.get('/pipeline', (req, res) => {
  const stages = getAll('SELECT * FROM pipeline_stages ORDER BY sort_order');
  const prospects = getAll(`
    SELECT p.*, c.first_name || ' ' || c.last_name AS contact_name,
      c.company AS contact_company, a.make || ' ' || a.model AS aircraft_name, a.price AS aircraft_price
    FROM prospects p
    LEFT JOIN contacts c ON p.contact_id = c.id
    LEFT JOIN aircraft a ON p.aircraft_id = a.id
    ORDER BY p.created_at DESC
  `);

  const pipeline = stages.map(stage => ({
    ...stage,
    prospects: prospects.filter(p => p.stage === stage.stage),
    total_value: prospects.filter(p => p.stage === stage.stage).reduce((sum, p) => sum + (p.aircraft_price || 0), 0),
  }));
  res.json(pipeline);
});

router.get('/:id', (req, res) => {
  const prospect = getOne(prospectJoin + ' WHERE p.id = ?', [req.params.id]);
  if (!prospect) return res.status(404).json({ error: 'Prospect not found' });
  const activities = getAll('SELECT * FROM activities WHERE prospect_id = ? ORDER BY created_at DESC', [req.params.id]);
  res.json({ ...prospect, activities });
});

router.post('/', (req, res) => {
  const { contact_id, aircraft_id, stage, source, budget_min, budget_max, priority, assigned_to, expected_close_date, notes } = req.body;
  if (!contact_id) return res.status(400).json({ error: 'Contact ID required' });
  const id = uuidv4();
  run(`INSERT INTO prospects (id,contact_id,aircraft_id,stage,source,budget_min,budget_max,priority,assigned_to,expected_close_date,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [id, contact_id, aircraft_id||null, stage||'inquiry', source||null, budget_min||null, budget_max||null, priority||'medium', assigned_to||null, expected_close_date||null, notes||null]);
  res.status(201).json(getOne('SELECT * FROM prospects WHERE id = ?', [id]));
});

router.put('/:id', (req, res) => {
  const e = getOne('SELECT * FROM prospects WHERE id = ?', [req.params.id]);
  if (!e) return res.status(404).json({ error: 'Prospect not found' });
  const { contact_id, aircraft_id, stage, source, budget_min, budget_max, priority, assigned_to, expected_close_date, notes } = req.body;
  run(`UPDATE prospects SET contact_id=?,aircraft_id=?,stage=?,source=?,budget_min=?,budget_max=?,priority=?,assigned_to=?,expected_close_date=?,notes=?,updated_at=datetime('now') WHERE id=?`,
    [contact_id||e.contact_id, aircraft_id??e.aircraft_id, stage||e.stage, source??e.source,
     budget_min??e.budget_min, budget_max??e.budget_max, priority||e.priority,
     assigned_to??e.assigned_to, expected_close_date??e.expected_close_date, notes??e.notes, req.params.id]);
  res.json(getOne('SELECT * FROM prospects WHERE id = ?', [req.params.id]));
});

router.delete('/:id', (req, res) => {
  run('DELETE FROM activities WHERE prospect_id = ?', [req.params.id]);
  const result = run('DELETE FROM prospects WHERE id = ?', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Prospect not found' });
  res.json({ success: true });
});

module.exports = router;
