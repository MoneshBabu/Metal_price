import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cache: Record<string, { data: any; timestamp: number }> = {};
const pendingRequests: Record<string, Promise<any> | null> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST
  app.get("/api/metal/:id", async (req, res) => {
    const { id } = req.params;
    const apiKey = process.env.GOLD_API_KEY;
    
    // Check cache first
    if (cache[id] && (Date.now() - cache[id].timestamp < CACHE_DURATION)) {
      return res.json(cache[id].data);
    }

    // If there's already a request in progress for this ID, wait for it
    if (pendingRequests[id]) {
      try {
        const data = await pendingRequests[id];
        return res.json(data);
      } catch (err) {
        // If the pending request failed, we'll try again below
      }
    }

    const symbols: Record<string, string> = {
      gold: 'XAU',
      silver: 'XAG',
      platinum: 'XPT',
      palladium: 'XPD',
    };

    const symbol = symbols[id];
    if (!symbol) {
      return res.status(400).json({ error: 'Invalid metal ID' });
    }

    if (!apiKey) {
      // Fallback to mock data if key is missing, but log it
      console.warn(`GOLD_API_KEY is missing. Returning mock data for ${id}.`);
      return res.json(getMockData(id));
    }

    // Create the request promise
    const fetchPromise = (async () => {
      try {
        const response = await fetch(`https://www.goldapi.io/api/${symbol}/INR`, {
          headers: {
            'x-access-token': apiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('API rate limit exceeded (Too Many Requests)');
          }
          throw new Error(`API error: ${response.statusText} (${response.status})`);
        }

        const data = await response.json();
        
        // Transform to our MetalData format
        const now = new Date();
        const currentPrice = data.price;
        
        // Mock history for now as most free APIs don't provide it easily in one call
        const history = Array.from({ length: 24 }).map((_, i) => {
          const time = new Date(now.getTime() - (23 - i) * 3600000);
          return {
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: Number((currentPrice * (1 + (Math.random() * 0.01 - 0.005))).toFixed(2)),
          };
        });

        const result = {
          id,
          name: id.charAt(0).toUpperCase() + id.slice(1),
          symbol,
          price: currentPrice,
          purity: id === 'gold' ? '24K' : '99.9% Pure',
          prevOpen: data.open_price || currentPrice,
          prevClose: data.prev_close_price || currentPrice,
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
          unit: 'g',
          currency: 'INR',
          history,
        };

        // Update cache
        cache[id] = { data: result, timestamp: Date.now() };

        return result;
      } catch (error) {
        console.error(`Error fetching ${id} from API:`, error);
        
        // If we have any cached data (even expired), return it on error
        if (cache[id]) {
          console.log(`Returning stale cached data for ${id} due to API error.`);
          return cache[id].data;
        }
        
        return getMockData(id);
      } finally {
        // Clear the pending request
        pendingRequests[id] = null;
      }
    })();

    pendingRequests[id] = fetchPromise;
    const finalData = await fetchPromise;
    res.json(finalData);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

const getMockData = (id: string) => {
  const basePrices: Record<string, number> = {
    gold: 6250.45,
    silver: 78.85,
    platinum: 2520.10,
    palladium: 3050.30,
  };
  const base = basePrices[id] || 1000;
  const getRandomPrice = (b: number) => Number((b + (Math.random() - 0.5) * (b * 0.05)).toFixed(2));
  const currentPrice = getRandomPrice(base);
  const now = new Date();
  
  const history = Array.from({ length: 24 }).map((_, i) => {
    const time = new Date(now.getTime() - (23 - i) * 3600000);
    return {
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: getRandomPrice(base),
    };
  });

  return {
    id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    symbol: id === 'gold' ? 'XAU' : id === 'silver' ? 'XAG' : id === 'platinum' ? 'XPT' : 'XPD',
    price: currentPrice,
    purity: id === 'gold' ? '24K' : '99.9% Pure',
    prevOpen: Number((currentPrice * (1 - (Math.random() * 0.02))).toFixed(2)),
    prevClose: Number((currentPrice * (1 + (Math.random() * 0.01))).toFixed(2)),
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    unit: 'g',
    currency: 'INR',
    history,
  };
};

startServer();
