const express = require('express');
const { getAll, getOne, run, getDbReady } = require('../db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.use(async (req, res, next) => { await getDbReady(); next(); });

router.get('/', (req, res) => {
  const { prospect_id, contact_id, type, upcoming } = req.query;
  let query = `
    SELECT act.*, c.first_name || ' ' || c.last_name AS contact_name, c.company AS contact_company
    FROM activities act LEFT JOIN contacts c ON act.contact_id = c.id WHERE 1=1
  `;
  const params = [];
  let idx = 1;

  if (prospect_id) { query += ` AND act.prospect_id = ?${idx}`; params.push(prospect_id); idx++; }
  if (contact_id) { query += ` AND act.contact_id = ?${idx}`; params.push(contact_id); idx++; }
  if (type) { query += ` AND act.type = ?${idx}`; params.push(type); idx++; }
  if (upcoming === 'true') {
    query += ` AND act.scheduled_at IS NOT NULL AND act.completed_at IS NULL AND act.scheduled_at >= datetime('now')`;
  }
  query += ' ORDER BY COALESCE(act.scheduled_at, act.completed_at, act.created_at) DESC';
  res.json(getAll(query, params));
});

router.post('/', (req, res) => {
  const { prospect_id, contact_id, type, subject, description, scheduled_at, completed_at } = req.body;
  if (!type || !subject) return res.status(400).json({ error: 'Type and subject required' });
  const id = uuidv4();
  run(`INSERT INTO activities (id,prospect_id,contact_id,type,subject,description,scheduled_at,completed_at) VALUES (?,?,?,?,?,?,?,?)`,
    [id, prospect_id||null, contact_id||null, type, subject, description||null, scheduled_at||null, completed_at||null]);
  res.status(201).json(getOne('SELECT * FROM activities WHERE id = ?', [id]));
});

router.put('/:id', (req, res) => {
  const e = getOne('SELECT * FROM activities WHERE id = ?', [req.params.id]);
  if (!e) return res.status(404).json({ error: 'Activity not found' });
  const { type, subject, description, scheduled_at, completed_at } = req.body;
  run(`UPDATE activities SET type=?,subject=?,description=?,scheduled_at=?,completed_at=? WHERE id=?`,
    [type||e.type, subject||e.subject, description??e.description, scheduled_at??e.scheduled_at, completed_at??e.completed_at, req.params.id]);
  res.json(getOne('SELECT * FROM activities WHERE id = ?', [req.params.id]));
});

router.delete('/:id', (req, res) => {
  const result = run('DELETE FROM activities WHERE id = ?', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Activity not found' });
  res.json({ success: true });
});

module.exports = router;
