const express = require('express');
const { getAll, getOne, run, getDbReady } = require('../db');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.use(async (req, res, next) => { await getDbReady(); next(); });

router.get('/', (req, res) => {
  const { search } = req.query;
  if (search) {
    const term = `%${search}%`;
    res.json(getAll(
      `SELECT * FROM contacts WHERE first_name LIKE ?1 OR last_name LIKE ?1 OR company LIKE ?1 OR email LIKE ?1 ORDER BY last_name, first_name`,
      [term]
    ));
  } else {
    res.json(getAll('SELECT * FROM contacts ORDER BY last_name, first_name'));
  }
});

router.get('/:id', (req, res) => {
  const contact = getOne('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json(contact);
});

router.post('/', (req, res) => {
  const { first_name, last_name, email, phone, company, title, notes } = req.body;
  if (!first_name || !last_name) return res.status(400).json({ error: 'First and last name required' });
  const id = uuidv4();
  run(`INSERT INTO contacts (id,first_name,last_name,email,phone,company,title,notes) VALUES (?,?,?,?,?,?,?,?)`,
    [id, first_name, last_name, email||null, phone||null, company||null, title||null, notes||null]);
  res.status(201).json(getOne('SELECT * FROM contacts WHERE id = ?', [id]));
});

router.put('/:id', (req, res) => {
  const { first_name, last_name, email, phone, company, title, notes } = req.body;
  const e = getOne('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
  if (!e) return res.status(404).json({ error: 'Contact not found' });
  run(`UPDATE contacts SET first_name=?,last_name=?,email=?,phone=?,company=?,title=?,notes=?,updated_at=datetime('now') WHERE id=?`,
    [first_name||e.first_name, last_name||e.last_name, email??e.email, phone??e.phone, company??e.company, title??e.title, notes??e.notes, req.params.id]);
  res.json(getOne('SELECT * FROM contacts WHERE id = ?', [req.params.id]));
});

router.delete('/:id', (req, res) => {
  const result = run('DELETE FROM contacts WHERE id = ?', [req.params.id]);
  if (result.changes === 0) return res.status(404).json({ error: 'Contact not found' });
  res.json({ success: true });
});

module.exports = router;
