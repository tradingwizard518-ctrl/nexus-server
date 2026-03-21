# Nexus Server

Server for NexusCommand app - handles live market data, reports, and agent communication.

## Quick Deploy to Railway

1. Fork this repo to your GitHub
2. Go to https://railway.app
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repo
5. Done!

## Environment Variables

Create a `.env` file:
```
PORT=3000
REPORT_PATH=./report.json
ELEVENLABS_API_KEY=your_key_here
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/prices` | GET | Live market prices |
| `/api/report` | GET | Latest Sakura report |
| `/api/updates` | GET | Market update history |
| `/api/agents` | GET | List all agents |
| `/api/agent/:id` | POST | Message an agent |
| `/api/property/goals` | GET/POST | Property goals |
| `/api/property/quests` | GET/POST | Property quests |
| `/health` | GET | Server health check |

## Features

- ✅ Live Yahoo Finance prices
- ✅ Sakura market reports
- ✅ Agent/Boardroom system
- ✅ Property tracking
- ✅ Voice ready (ElevenLabs)

---

*Deployed to Railway for NexusCommand*
