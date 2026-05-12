# TBD Agent Command Center

Internal AI Agent performance tracker and live update command center for **Teams by Design (TBD)**.

Built with React + Vite, Tailwind CSS, Framer Motion, Recharts, Lucide, and Zustand.

---

## Quick Start

```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

## Production Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Import in vercel.com — no env vars needed
3. Or drag the `dist/` folder onto Vercel's dashboard after `npm run build`

The included `vercel.json` handles SPA routing automatically.

---

## How to Add a New Agent

Open `src/data/seedData.js` and add an entry to `SEED_AGENTS`:

```js
{
  id: 'agent-5',
  name: 'My New Agent',
  role: 'Description of what it does',
  status: 'healthy',          // 'healthy' | 'warning' | 'critical'
  phone: '+61 XXX XXX XXX',
  weeklyHistory: generateWeeklyHistory(85, 10),  // (baseRate, variance)
  currentWeekTests: {
    callSuccess:         { passed: false, notes: '', timestamp: null },
    emailToPM:           { passed: false, notes: '', timestamp: null },
    streetcoIntegration: { passed: false, notes: '', timestamp: null },
  },
  notes: [],
  passRate: 85,
}
```

## How to Add a New Update (in code)

Add to `SEED_UPDATES` in `src/data/seedData.js`:

```js
{
  id: 'upd-5',
  type: 'platform',           // 'platform' | 'agent'
  agentId: null,
  agentName: null,
  priority: 'info',           // 'info' | 'important' | 'critical'
  title: 'Update title',
  description: 'Detailed description...',
  author: 'Your Name',
  createdAt: new Date().toISOString(),
}
```

Or use the **"+ Post Update"** button in the Updates view — no code needed.

---

## Project Structure

```
src/
  store/useStore.js          Zustand store — all state + actions
  data/seedData.js           Seed agents + updates
  components/
    Sidebar.jsx              Collapsible nav sidebar
    AgentCard.jsx            Dashboard grid card
    TestRow.jsx              Checklist test row with notes
    UpdateCard.jsx           Update feed card
    charts/
      AgentLineChart.jsx     12-week area chart
      AgentBarChart.jsx      Pass-rate bar chart
    modals/
      PostUpdateModal.jsx    New update modal
    ui/
      Toast.jsx              Toast notification system
      Confetti.jsx           Celebration confetti burst
  views/
    Dashboard.jsx            Overview + stat cards + agent grid
    AgentDetail.jsx          Per-agent tests, chart, notes
    Updates.jsx              Two-column update feed + post modal
    WeeklyReport.jsx         Auto-generated weekly summary
  App.jsx                    Root layout + view switcher
```
