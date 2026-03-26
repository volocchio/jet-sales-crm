const express = require('express');
const cors = require('cors');
const path = require('path');

const contactsRouter = require('./routes/contacts');
const aircraftRouter = require('./routes/aircraft');
const prospectsRouter = require('./routes/prospects');
const activitiesRouter = require('./routes/activities');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/contacts', contactsRouter);
app.use('/api/aircraft', aircraftRouter);
app.use('/api/prospects', prospectsRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/dashboard', dashboardRouter);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Jet Sales CRM API running on http://localhost:${PORT}`);
});
