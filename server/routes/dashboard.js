const express = require('express');
const { getAll, getOne, getDbReady } = require('../db');
const router = express.Router();

router.use(async (req, res, next) => { await getDbReady(); next(); });

router.get('/', (req, res) => {
  const totalProspects = getOne('SELECT COUNT(*) as count FROM prospects').count;
  const activeProspects = getOne(`SELECT COUNT(*) as count FROM prospects WHERE stage NOT IN ('closed_won','closed_lost')`).count;
  const closedWon = getOne(`SELECT COUNT(*) as count FROM prospects WHERE stage = 'closed_won'`).count;
  const closedLost = getOne(`SELECT COUNT(*) as count FROM prospects WHERE stage = 'closed_lost'`).count;

  const pipelineValue = getOne(`
    SELECT COALESCE(SUM(a.price), 0) as total FROM prospects p
    LEFT JOIN aircraft a ON p.aircraft_id = a.id WHERE p.stage NOT IN ('closed_won','closed_lost')
  `).total;

  const wonValue = getOne(`
    SELECT COALESCE(SUM(a.price), 0) as total FROM prospects p
    LEFT JOIN aircraft a ON p.aircraft_id = a.id WHERE p.stage = 'closed_won'
  `).total;

  const byStage = getAll(`
    SELECT p.stage, ps.display_name, ps.color, COUNT(*) as count, COALESCE(SUM(a.price), 0) as value
    FROM prospects p LEFT JOIN aircraft a ON p.aircraft_id = a.id
    LEFT JOIN pipeline_stages ps ON p.stage = ps.stage GROUP BY p.stage ORDER BY ps.sort_order
  `);

  const byPriority = getAll(`
    SELECT priority, COUNT(*) as count FROM prospects WHERE stage NOT IN ('closed_won','closed_lost') GROUP BY priority
  `);

  const upcomingActivities = getAll(`
    SELECT act.*, c.first_name || ' ' || c.last_name AS contact_name, c.company AS contact_company
    FROM activities act LEFT JOIN contacts c ON act.contact_id = c.id
    WHERE act.scheduled_at IS NOT NULL AND act.completed_at IS NULL ORDER BY act.scheduled_at ASC LIMIT 10
  `);

  const recentActivities = getAll(`
    SELECT act.*, c.first_name || ' ' || c.last_name AS contact_name, c.company AS contact_company
    FROM activities act LEFT JOIN contacts c ON act.contact_id = c.id
    WHERE act.completed_at IS NOT NULL ORDER BY act.completed_at DESC LIMIT 10
  `);

  const totalAircraft = getOne('SELECT COUNT(*) as count FROM aircraft').count;
  const availableAircraft = getOne(`SELECT COUNT(*) as count FROM aircraft WHERE status = 'available'`).count;
  const inventoryValue = getOne(`SELECT COALESCE(SUM(price), 0) as total FROM aircraft WHERE status = 'available'`).total;

  res.json({
    summary: { totalProspects, activeProspects, closedWon, closedLost,
      winRate: totalProspects > 0 ? Math.round((closedWon / (closedWon + closedLost || 1)) * 100) : 0,
      pipelineValue, wonValue, totalAircraft, availableAircraft, inventoryValue },
    byStage, byPriority, upcomingActivities, recentActivities,
  });
});

module.exports = router;
