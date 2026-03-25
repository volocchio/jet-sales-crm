const { initDb, run, getOne } = require('./db');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  await initDb();

  const count = getOne('SELECT COUNT(*) as cnt FROM contacts').cnt;
  if (count > 0) { console.log('Database already seeded. Skipping.'); return; }

  console.log('Seeding database...');

  const contacts = [
    { id: uuidv4(), first_name: 'Richard', last_name: 'Thornton', email: 'r.thornton@thorntonaviation.com', phone: '+1-305-555-0142', company: 'Thornton Aviation Group', title: 'CEO' },
    { id: uuidv4(), first_name: 'Sarah', last_name: 'Chen', email: 'schen@pacificventures.com', phone: '+1-415-555-0198', company: 'Pacific Ventures Capital', title: 'Managing Partner' },
    { id: uuidv4(), first_name: 'Marcus', last_name: 'Webb', email: 'mwebb@webbholdings.com', phone: '+1-212-555-0167', company: 'Webb Holdings LLC', title: 'Chairman' },
    { id: uuidv4(), first_name: 'Elena', last_name: 'Rodriguez', email: 'elena.r@globallogistics.mx', phone: '+52-55-555-0134', company: 'Global Logistics SA', title: 'VP Operations' },
    { id: uuidv4(), first_name: 'James', last_name: 'Patterson', email: 'jp@pattersongroup.co.uk', phone: '+44-20-7555-0189', company: 'Patterson Group', title: 'Director' },
    { id: uuidv4(), first_name: 'Aisha', last_name: 'Al-Rashid', email: 'aisha@rashidenterprises.ae', phone: '+971-4-555-0145', company: 'Rashid Enterprises', title: 'Chief Procurement Officer' },
    { id: uuidv4(), first_name: 'David', last_name: 'Kim', email: 'dkim@techsummitinc.com', phone: '+1-650-555-0112', company: 'TechSummit Inc', title: 'CTO' },
    { id: uuidv4(), first_name: 'Catherine', last_name: 'Dupont', email: 'cdupont@aerofrance.fr', phone: '+33-1-5555-0176', company: 'AeroFrance Charter', title: 'Fleet Manager' },
  ];
  for (const c of contacts) {
    run(`INSERT INTO contacts (id,first_name,last_name,email,phone,company,title) VALUES (?,?,?,?,?,?,?)`,
      [c.id, c.first_name, c.last_name, c.email, c.phone, c.company, c.title]);
  }

  const aircraft = [
    { id: uuidv4(), make: 'Gulfstream', model: 'G650ER', year: 2022, sn: 'GS-6421', reg: 'N650GS', hours: 820, price: 65000000, status: 'available', desc: 'Ultra-long-range business jet. Pristine condition, full maintenance history.' },
    { id: uuidv4(), make: 'Bombardier', model: 'Global 7500', year: 2023, sn: 'BD-9102', reg: 'N7500B', hours: 340, price: 72000000, status: 'available', desc: 'Flagship ultra-long-range jet. Four living spaces, low hours.' },
    { id: uuidv4(), make: 'Dassault', model: 'Falcon 8X', year: 2021, sn: 'DA-8X55', reg: 'N8XDF', hours: 1150, price: 48000000, status: 'reserved', desc: 'Tri-engine super-long-range. Excellent runway performance.' },
    { id: uuidv4(), make: 'Cessna', model: 'Citation Longitude', year: 2023, sn: 'CS-5678', reg: 'N560CL', hours: 210, price: 28000000, status: 'available', desc: 'Super-midsize jet. Flat-floor cabin, low operating costs.' },
    { id: uuidv4(), make: 'Embraer', model: 'Praetor 600', year: 2022, sn: 'EM-P600', reg: 'N600EP', hours: 580, price: 21000000, status: 'available', desc: 'Super-midsize with intercontinental range. Full fly-by-wire.' },
    { id: uuidv4(), make: 'Gulfstream', model: 'G280', year: 2020, sn: 'GS-2801', reg: 'N280GS', hours: 1890, price: 18500000, status: 'sold', desc: 'Super-midsize. Excellent short-field performance.' },
    { id: uuidv4(), make: 'Boeing', model: 'BBJ 737 MAX', year: 2024, sn: 'BJ-MAX1', reg: 'N737BJ', hours: 50, price: 95000000, status: 'available', desc: 'Boeing Business Jet. VIP configured, virtually new.' },
    { id: uuidv4(), make: 'Pilatus', model: 'PC-24', year: 2023, sn: 'PI-2401', reg: 'N24PC', hours: 420, price: 11500000, status: 'available', desc: 'Light jet with cargo door. Unpaved runway capable.' },
  ];
  for (const a of aircraft) {
    run(`INSERT INTO aircraft (id,make,model,year,serial_number,registration,total_hours,price,status,description) VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [a.id, a.make, a.model, a.year, a.sn, a.reg, a.hours, a.price, a.status, a.desc]);
  }

  const prospects = [
    { id: uuidv4(), cid: contacts[0].id, aid: aircraft[0].id, stage: 'negotiation', source: 'referral', bmin: 55000000, bmax: 70000000, pri: 'high', rep: 'Mike Torres', close: '2026-04-15', notes: 'Very interested in G650ER. Needs delivery by Q2.' },
    { id: uuidv4(), cid: contacts[1].id, aid: aircraft[1].id, stage: 'proposal', source: 'trade_show', bmin: 60000000, bmax: 80000000, pri: 'high', rep: 'Mike Torres', close: '2026-05-01', notes: 'Looking for fleet expansion. Global 7500 demo scheduled.' },
    { id: uuidv4(), cid: contacts[2].id, aid: aircraft[6].id, stage: 'qualified', source: 'website', bmin: 80000000, bmax: 100000000, pri: 'urgent', rep: 'Lisa Chang', close: '2026-06-30', notes: 'Wants BBJ for private use. Budget approved.' },
    { id: uuidv4(), cid: contacts[3].id, aid: aircraft[3].id, stage: 'inquiry', source: 'cold_call', bmin: 20000000, bmax: 35000000, pri: 'medium', rep: 'Lisa Chang', close: '2026-07-15', notes: 'Initial inquiry for mid-range jet for executive travel.' },
    { id: uuidv4(), cid: contacts[4].id, aid: aircraft[2].id, stage: 'negotiation', source: 'referral', bmin: 40000000, bmax: 55000000, pri: 'high', rep: 'Mike Torres', close: '2026-04-01', notes: 'Finalizing Falcon 8X deal. Legal review in progress.' },
    { id: uuidv4(), cid: contacts[5].id, aid: aircraft[4].id, stage: 'proposal', source: 'trade_show', bmin: 18000000, bmax: 25000000, pri: 'medium', rep: 'Lisa Chang', close: '2026-05-20', notes: 'Multiple aircraft interest. Praetor 600 is top choice.' },
    { id: uuidv4(), cid: contacts[6].id, aid: aircraft[7].id, stage: 'inquiry', source: 'website', bmin: 10000000, bmax: 15000000, pri: 'low', rep: 'Mike Torres', close: '2026-08-01', notes: 'Tech exec looking for first private jet. PC-24 fits budget.' },
    { id: uuidv4(), cid: contacts[7].id, aid: aircraft[5].id, stage: 'closed_won', source: 'referral', bmin: 16000000, bmax: 20000000, pri: 'medium', rep: 'Lisa Chang', close: '2026-02-15', notes: 'Deal closed! G280 delivered to AeroFrance Charter.' },
  ];
  for (const p of prospects) {
    run(`INSERT INTO prospects (id,contact_id,aircraft_id,stage,source,budget_min,budget_max,priority,assigned_to,expected_close_date,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [p.id, p.cid, p.aid, p.stage, p.source, p.bmin, p.bmax, p.pri, p.rep, p.close, p.notes]);
  }

  const activities = [
    { id: uuidv4(), pid: prospects[0].id, cid: contacts[0].id, type: 'meeting', sub: 'Aircraft tour - G650ER', desc: 'In-person tour at hangar. Client very impressed with cabin.', comp: '2026-03-10T14:00:00' },
    { id: uuidv4(), pid: prospects[0].id, cid: contacts[0].id, type: 'call', sub: 'Follow up on pricing', desc: 'Discussed pricing structure and financing options.', comp: '2026-03-18T10:30:00' },
    { id: uuidv4(), pid: prospects[1].id, cid: contacts[1].id, type: 'demo', sub: 'Global 7500 demo flight', desc: 'Demo flight SFO to LAX. Client brought CFO along.', sched: '2026-03-28T09:00:00' },
    { id: uuidv4(), pid: prospects[2].id, cid: contacts[2].id, type: 'email', sub: 'BBJ configuration options', desc: 'Sent interior configuration brochure and VIP layout options.', comp: '2026-03-20T16:00:00' },
    { id: uuidv4(), pid: prospects[4].id, cid: contacts[4].id, type: 'meeting', sub: 'Contract review meeting', desc: 'Met with legal teams to review purchase agreement.', comp: '2026-03-22T11:00:00' },
    { id: uuidv4(), pid: prospects[4].id, cid: contacts[4].id, type: 'follow_up', sub: 'Final terms confirmation', desc: 'Awaiting signed LOI. Expected by end of week.', sched: '2026-03-27T09:00:00' },
    { id: uuidv4(), pid: prospects[3].id, cid: contacts[3].id, type: 'call', sub: 'Initial discovery call', desc: 'Discussed fleet needs, routes, and budget range.', comp: '2026-03-15T13:00:00' },
    { id: uuidv4(), pid: prospects[5].id, cid: contacts[5].id, type: 'tour', sub: 'Praetor 600 walkthrough', desc: 'Scheduled hangar visit for Praetor 600 inspection.', sched: '2026-04-02T10:00:00' },
  ];
  for (const a of activities) {
    run(`INSERT INTO activities (id,prospect_id,contact_id,type,subject,description,scheduled_at,completed_at) VALUES (?,?,?,?,?,?,?,?)`,
      [a.id, a.pid, a.cid, a.type, a.sub, a.desc, a.sched||null, a.comp||null]);
  }

  console.log('Database seeded successfully!');
  console.log(`  ${contacts.length} contacts, ${aircraft.length} aircraft, ${prospects.length} prospects, ${activities.length} activities`);
}

seed().catch(console.error);
