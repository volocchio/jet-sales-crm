const express = require('express');
const { getAll, getOne, run, getDbReady } = require('../db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.use(async (req, res, next) => { await getDbReady(); next(); });

router.get('/', (req, res) => {
  const { status, search } = req.query;
  let query = 'SELECT * FROM aircraft WHERE 1=1';
  const params = [];
  let idx = 1;

  if (status) { query += ` AND status = ?${idx}`; params.push(status); idx++; }
  if (search) {
    const term = `%${search}%`;
    query += ` AND (make LIKE ?${idx} OR model LIKE ?${idx} OR registration LIKE ?${idx})`;
    params.push(term); idx++;
  }
  query += ' ORDER BY make, model';
  res.json(getAll(query, params));
});

router.get('/:id', (req, res) => {
  const aircraft = getOne('SELECT * FROM aircraft WHERE id = ?', [req.params.id]);
  if (!aircraft) return res.status(404).json({ error: 'Aircraft not found' });
  res.json(aircraft);
});

router.post('/', (req, res) => {
  const { make, model, year, serial_number, registration, total_hours, price, status, description, image_url } = req.body;
  if (!make || !model) return res.status(400).json({ error: 'Make and model required' });
  const id = uuidv4();
  run(`INSERT INTO aircraft (id,make,model,year,serial_number,registration,total_hours,price,status,description,image_url) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [id, make, model, year||null, serial_number||null, registration||null, total_hours||null, price||null, status||'available', description||null, image_url||null]);
  res.status(201).json(getOne('SELECT * FROM aircraft WHERE id = ?', [id]));
});

router.put('/:id', (req, res) => {
  const e = getOne('SELECT * FROM aircraft WHERE id = ?', [req.params.id]);
  if (!e) return res.status(404).json({ error: 'Aircraft not found' });
  const { make, model, year, serial_number, registration, total_hours, price, status, description, image_url } = req.body;
  run(`UPDATE aircraft SET make=?,model=?,year=?,serial_number=?,registration=?,total_hours=?,price=?,status=?,description=?,image_url=?,updated_at=datetime('now') WHERE id=?`,
    [make||e.make, model||e.model, year??e.year, serial_number??e.serial_number, registration??e.registration,
     total_hours??e.total_hours, price??e.price, status||e.status, description??e.description, image_url??e.image_url, req.params.id]);
  res.json(getOne('SELECT * FROM aircraft WHERE id = ?', [req.params.id]));
});

router.delete('/:id', (req, res) => {
  const result = run('DELETE FROM aircraft WHERE id = ?', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Aircraft not found' });
  res.json({ success: true });
});

module.exports = router;
