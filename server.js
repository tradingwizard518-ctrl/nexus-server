require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Store prices in memory
let cachedPrices = {
  nasdaq: { price: 0, change: 0, changePercent: 0, direction: 'neutral' },
  dow: { price: 0, change: 0, changePercent: 0, direction: 'neutral' },
  gold: { price: 0, change: 0, changePercent: 0, direction: 'neutral' },
  oil: { price: 0, change: 0, changePercent: 0, direction: 'neutral' },
  timestamp: new Date().toISOString()
};

// Fetch live prices from Yahoo
async function fetchYahooPrices() {
  const symbols = {
    nasdaq: '^IXIC',
    dow: '^DJI', 
    gold: 'GC=F',
    oil: 'CL=F'
  };
  
  for (const [key, symbol] of Object.entries(symbols)) {
    try {
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
        { timeout: 10000, headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      
      const data = response.data.chart.result[0];
      const meta = data.meta;
      const currentPrice = meta.regularMarketPrice;
      const previousClose = meta.previousClose || currentPrice;
      const change = currentPrice - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
      
      cachedPrices[key] = {
        price: currentPrice,
        change: change,
        changePercent: changePercent,
        direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
      };
    } catch (error) {
      cachedPrices[key] = { price: 15000, change: 0, changePercent: 0, direction: 'neutral' };
    }
  }
  
  cachedPrices.timestamp = new Date().toISOString();
}

// Fetch on startup and every 2 minutes
fetchYahooPrices();
setInterval(fetchYahooPrices, 120000);

app.get('/api/prices', (req, res) => res.json(cachedPrices));
app.get('/api/agents', (req, res) => res.json([
  { id: 'kyro', name: 'Kyro', role: 'General Assistant', emoji: '⚡️' },
  { id: 'sakura', name: 'Sakura', role: 'Financial Research', emoji: '🌸' },
  { id: 'hashirama', name: 'Hashirama', role: 'Property Investment', emoji: '🏠' },
  { id: 'tobirama', name: 'Tobirama', role: 'iOS Developer', emoji: '💻' },
  { id: 'itachi', name: 'Itachi', role: 'Security', emoji: '🛡️' }
]));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => console.log(`🚀 Nexus Server running on port ${PORT}`));
