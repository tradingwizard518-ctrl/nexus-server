require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ============================================
// MARKET DATA ENDPOINTS
// ============================================

// Get live prices from Yahoo Finance
app.get('/api/prices', async (req, res) => {
  try {
    const symbols = ['^IXIC', '^DJI', 'GC=F', 'CL=F'];
    const prices = {};
    
    for (const symbol of symbols) {
      try {
        const response = await axios.get(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
          { timeout: 5000 }
        );
        
        const data = response.data.chart.result[0];
        const meta = data.meta;
        const quote = data.indicators.quote[0];
        
        const currentPrice = meta.regularMarketPrice;
        const previousClose = meta.previousClose;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;
        
        let name = symbol;
        if (symbol === '^IXIC') name = 'nasdaq';
        if (symbol === '^DJI') name = 'dow';
        if (symbol === 'GC=F') name = 'gold';
        if (symbol === 'CL=F') name = 'oil';
        
        prices[name] = {
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
        };
      } catch (e) {
        console.log(`Error fetching ${symbol}: ${e.message}`);
      }
    }
    
    // Add timestamp
    prices.timestamp = new Date().toISOString();
    
    res.json(prices);
  } catch (error) {
    console.error('Price fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

// Get last saved report
app.get('/api/report', (req, res) => {
  try {
    const fs = require('fs');
    const reportPath = process.env.REPORT_PATH || './report.json';
    
    if (fs.existsSync(reportPath)) {
      const data = fs.readFileSync(reportPath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json({ message: 'No report available yet' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read report' });
  }
});

// Save report (called by agent)
app.post('/api/report', express.json(), (req, res) => {
  try {
    const fs = require('fs');
    const reportPath = process.env.REPORT_PATH || './report.json';
    
    const report = {
      ...req.body,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    res.json({ success: true, message: 'Report saved' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save report' });
  }
});

// Get live market updates history
app.get('/api/updates', (req, res) => {
  try {
    const fs = require('fs');
    const updatesPath = './updates.json';
    
    if (fs.existsSync(updatesPath)) {
      const data = fs.readFileSync(updatesPath, 'utf8');
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (error) {
    res.json([]);
  }
});

// Save market update
app.post('/api/updates', express.json(), (req, res) => {
  try {
    const fs = require('fs');
    const updatesPath = './updates.json';
    
    let updates = [];
    if (fs.existsSync(updatesPath)) {
      updates = JSON.parse(fs.readFileSync(updatesPath, 'utf8'));
    }
    
    updates.unshift(req.body);
    if (updates.length > 20) updates = updates.slice(0, 20);
    
    fs.writeFileSync(updatesPath, JSON.stringify(updates, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save update' });
  }
});

// ============================================
// VOICE ENDPOINT (Jarvis)
// ============================================

app.post('/api/voice', async (req, res) => {
  try {
    const { text, voiceId } = req.body;
    
    // This is where we'd use ElevenLabs
    // For now, return the text that would be spoken
    res.json({ 
      success: true, 
      message: 'Voice response would play here',
      text: text
    });
  } catch (error) {
    res.status(500).json({ error: 'Voice processing failed' });
  }
});

// ============================================
// AGENTS / BOARDROOM ENDPOINTS
// ============================================

// Get all agents
app.get('/api/agents', (req, res) => {
  res.json([
    { id: 'kyro', name: 'Kyro', role: 'General Assistant', emoji: '⚡' },
    { id: 'sakura', name: 'Sakura', role: 'Financial Research', emoji: '🌸' },
    { id: 'hashirama', name: 'Hashirama', role: 'Property Investment', emoji: '🏠' },
    { id: 'tobirama', name: 'Tobirama', role: 'iOS Developer', emoji: '💻' },
    { id: 'itachi', name: 'Itachi', role: 'Security', emoji: '🛡️' }
  ]);
});

// Send message to specific agent
app.post('/api/agent/:id', express.json(), (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  // This would integrate with the OpenClaw agents
  res.json({
    agent: id,
    message: message,
    response: `This would route to ${id} agent. Response generated based on their expertise.`
  });
});

// ============================================
// PROPERTY TRACKING ENDPOINTS
// ============================================

// Get property goals
app.get('/api/property/goals', (req, res) => {
  const fs = require('fs');
  const goalsPath = './property_goals.json';
  
  if (fs.existsSync(goalsPath)) {
    res.json(JSON.parse(fs.readFileSync(goalsPath, 'utf8')));
  } else {
    res.json([]);
  }
});

// Save property goals
app.post('/api/property/goals', express.json(), (req, res) => {
  const fs = require('fs');
  const goalsPath = './property_goals.json';
  
  fs.writeFileSync(goalsPath, JSON.stringify(req.body, null, 2));
  res.json({ success: true });
});

// Get property quests
app.get('/api/property/quests', (req, res) => {
  const fs = require('fs');
  const questsPath = './property_quests.json';
  
  if (fs.existsSync(questsPath)) {
    res.json(JSON.parse(fs.readFileSync(questsPath, 'utf8')));
  } else {
    res.json([]);
  }
});

// Toggle quest completion
app.post('/api/property/quests/:id', express.json(), (req, res) => {
  const fs = require('fs');
  const questsPath = './property_quests.json';
  
  let quests = [];
  if (fs.existsSync(questsPath)) {
    quests = JSON.parse(fs.readFileSync(questsPath, 'utf8'));
  }
  
  const { id } = req.params;
  const quest = quests.find(q => q.id === id);
  
  if (quest) {
    quest.completed = !quest.completed;
    fs.writeFileSync(questsPath, JSON.stringify(quests, null, 2));
  }
  
  res.json({ success: true, quests });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Nexus Server running on port ${PORT}`);
});
