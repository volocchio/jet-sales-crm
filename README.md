# JetSales CRM ✈️

Aviation sales tracking and prospect management system. A focused CRM for jet/aircraft sales — track prospects through the pipeline, manage aircraft inventory, log activities, and monitor sales performance.

## Quick Start

```bash
# Install all dependencies (server + client)
npm run install:all

# Seed the database with sample data
npm run seed

# Start both server and client
npm run dev
```

- **API Server**: http://localhost:4000
- **React App**: http://localhost:3000

## Features

- **Dashboard** — Sales KPIs, pipeline value, upcoming activities
- **Pipeline Board** — Kanban-style view of deals by stage
- **Prospect Management** — Track leads from inquiry to close
- **Aircraft Inventory** — Fleet management with status tracking
- **Contact Management** — Customer database with search
- **Activity Logging** — Calls, meetings, demos, tours, follow-ups

## Tech Stack

- **Backend**: Node.js, Express, SQLite (better-sqlite3)
- **Frontend**: React, React Router
- **Database**: SQLite (file-based, zero config)
