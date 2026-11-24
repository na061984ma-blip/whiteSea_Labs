import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_VENTURES } from './src/data/venturesSeed.ts';
import type { ApartmentVenture, PropertyEnquiry } from './src/types/realEstate.ts';
import { validateVentureIntegrity } from './src/utils/ventureStats.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

const CURRENT_SEED_VERSION = 2;

interface StoreData {
  seedVersion?: number;
  ventures: ApartmentVenture[];
  enquiries: PropertyEnquiry[];
}

function readStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_PATH)) {
      const initial: StoreData = {
        seedVersion: CURRENT_SEED_VERSION,
        ventures: INITIAL_VENTURES,
        enquiries: [],
      };
      fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    const hasOldIds =
      Array.isArray(parsed.ventures) &&
      parsed.ventures.some((v) => v.id === 'first-apartment');
    const needsSeedUpgrade = !parsed.seedVersion || parsed.seedVersion < CURRENT_SEED_VERSION;
    if (hasOldIds || needsSeedUpgrade || !Array.isArray(parsed.ventures) || parsed.ventures.length === 0) {
      const migrated: StoreData = {
        seedVersion: CURRENT_SEED_VERSION,
        ventures: INITIAL_VENTURES,
        enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
      };
      fs.writeFileSync(STORE_PATH, JSON.stringify(migrated, null, 2), 'utf-8');
      return migrated;
    }
    return {
      seedVersion: parsed.seedVersion,
      ventures: parsed.ventures,
      enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
    };
  } catch {
    return {
      seedVersion: CURRENT_SEED_VERSION,
      ventures: INITIAL_VENTURES,
      enquiries: [],
    };
  }
}

function writeStore(data: StoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/ventures', (_req, res) => {
    const store = readStore();
    res.json({ ventures: store.ventures });
  });

  app.put('/api/ventures/:id', (req, res) => {
    const id = String(req.params.id || '').trim();
    const updated = req.body as ApartmentVenture;
    if (!updated || typeof updated !== 'object' || updated.id !== id) {
      res.status(400).json({ error: 'Invalid venture payload or mismatched project ID.' });
      return;
    }

    const errors = validateVentureIntegrity(updated);
    if (errors.length > 0) {
      res.status(400).json({ error: errors[0], validationErrors: errors });
      return;
    }

    const store = readStore();
    const idx = store.ventures.findIndex((v) => v.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Venture project not found.' });
      return;
    }

    // Recompute buildingInfo.totalFloors and flatsPerFloor consistency if floors changed
    const normalized: ApartmentVenture = {
      ...updated,
      buildingInfo: {
        ...updated.buildingInfo,
        totalFloors: updated.floors.length,
        flatsPerFloor:
          updated.floors.length > 0
            ? Math.max(...updated.floors.map((f) => f.flats.length), 1)
            : updated.buildingInfo.flatsPerFloor,
      },
    };

    store.ventures[idx] = normalized;
    writeStore(store);
    res.json({ venture: normalized });
  });

  app.post('/api/ventures', (req, res) => {
    const created = req.body as ApartmentVenture;
    if (!created || typeof created !== 'object' || !created.id) {
      res.status(400).json({ error: 'Invalid venture payload.' });
      return;
    }

    const errors = validateVentureIntegrity(created);
    if (errors.length > 0) {
      res.status(400).json({ error: errors[0], validationErrors: errors });
      return;
    }

    const store = readStore();
    if (store.ventures.some((v) => v.id === created.id)) {
      res.status(409).json({ error: 'A venture with this ID already exists.' });
      return;
    }

    store.ventures.push(created);
    writeStore(store);
    res.status(201).json({ venture: created });
  });

  app.post('/api/ventures/reset', (_req, res) => {
    const store = readStore();
    store.ventures = INITIAL_VENTURES;
    writeStore(store);
    res.json({ ventures: store.ventures });
  });

  app.get('/api/enquiries', (_req, res) => {
    const store = readStore();
    res.json({ enquiries: store.enquiries });
  });

  app.post('/api/enquiries', (req, res) => {
    const body = req.body as Partial<PropertyEnquiry>;
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const phone = String(body.phone || '').trim();
    const message = String(body.message || '').trim();

    if (!name || name.length < 2) {
      res.status(400).json({ error: 'Please provide your full name.' });
      return;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (!phone || phone.replace(/\D/g, '').length < 7) {
      res.status(400).json({ error: 'Please provide a valid contact phone number.' });
      return;
    }
    if (!message || message.length < 5) {
      res.status(400).json({ error: 'Please include a brief enquiry message.' });
      return;
    }

    const entry: PropertyEnquiry = {
      id: `enq-${Date.now()}`,
      name,
      email,
      phone,
      ventureId: body.ventureId ? String(body.ventureId) : undefined,
      ventureName: body.ventureName ? String(body.ventureName) : undefined,
      flatNumber: body.flatNumber ? String(body.flatNumber) : undefined,
      message,
      createdAt: new Date().toISOString(),
    };

    const store = readStore();
    store.enquiries.unshift(entry);
    writeStore(store);
    res.status(201).json({ enquiry: entry });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
