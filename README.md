# Meridian Estates — Ventures & 360° Property Explorer

A full-stack real estate development platform and interactive 3D virtual property walkthrough application built with **React**, **TypeScript**, **Three.js**, **Tailwind CSS v4**, and **Express**.

Visitors can browse four distinct residential apartment ventures, inspect live floor-by-floor flat availability and charts, explore 8-direction site orientations, and walk through each building's exterior grounds, common areas, and furnished flat interiors in an interactive Google Street View-style 3D environment.

---

## Featured Residential Ventures

| Venture ID | Project Name | Architectural Style & Highlights |
|---|---|---|
| `sky-crest-residences` | **Sky Crest Residences** | Travertine facade, 4 corner flats per floor with dual ventilation, courtyard lap pool & pergola clubhouse |
| `aurelia-heights` | **Aurelia Heights** | Sandstone facade, dual-road corner frontage & fountain plaza, curved corner balconies & acoustic glazing |
| `saffron-quarters` | **Saffron Quarters** | Terracotta facade, 3 expansive residences per floor, stepped sky-terrace planter decks |
| `blue-bay-terrace` | **Blue Bay Terrace** | Limestone facade, double-height concierge reception lobby, wrap-around 270° glass balconies |

---

## Key Features

### 1. Interactive 3D Walkthrough (`Panorama360Viewer` + `src/three/*`)
- **Four Independent 3D Architectural Models**: Each venture constructs its own distinct 3D building geometry, facade palette, balcony profiles, and site layout using procedural PBR `CanvasTexture` materials (`travertine`, `sandstone`, `terracotta`, `limestone`, `oak`, `marble`, `terrazzo`, `slate`, `paving`, `asphalt`, `grass`, `water`, `rug`).
- **Outside Grounds & Amenities**: Explore the building exterior, entrance monument, landscaped gardens, jogging track, swimming pool & loungers, clubhouse pavilion, children's play park, covered EV parking, and surrounding pathways.
- **Floor-by-Floor & Common Area Exploration**: Select any floor to dynamically reposition the active floor level (`3.4m` per floor) and inspect the lift lobby, staircase, and floor corridor—preserving true elevation views over the 3D grounds.
- **Full Flat Interior Walkthrough**: Enter any flat gate into the **Main Hall / Living Room**, **Dining Area**, **Open Kitchen** (right), **Utility Area**, **Master Bedroom** (straight left) with **Attached Bathroom 1** and **Backside Balcony**, plus the **Second Bedroom** (right → straight → left) with **Attached Bathroom 2**.
- **Navigation & Controls**:
  - **Mouse / Touch Drag**: Smooth 360° yaw and vertical pitch look.
  - **On-Screen Controls**: Forward, Backward, Left, Right movement buttons, clickable 3D spatial hotspots, zone tabs (`Outside`, `Floors & Common`, `Inside Flat`), floor/flat selectors, zoom in/out, reset, fullscreen, and Exit Tour.
  - **Keyboard Shortcuts**: `ArrowUp` / `W` (forward), `ArrowDown` / `S` (backward), `ArrowLeft` / `A` (left), `ArrowRight` / `D` (right), `Q` / `E` (turn), `+` / `-` (zoom), `R` (reset view).
  - **Optional 360° Photo Upload**: Load equirectangular panoramic images directly in the viewer.

### 2. Business Archway 3D Preview (`BusinessArch3D`)
- Interactive OrbitControls WebGL showcase of each venture's entrance monument arch with live dynamic signage and one-click launch into the full 360° walkthrough.

### 3. Property Dashboard, Floor Matrix & Comparison
- **Ventures & Comparison Views**: Responsive venture cards and a side-by-side comparison matrix (`ProjectsComparePage`).
- **Live Availability Charts (`AvailabilityCharts`)**: Dynamic counts and percentage distributions for `Available`, `Sold`, `Rented`, and `Reserved` units computed directly from floor inventory.
- **Floor & Flat Explorer (`FloorExplorer`)**: Interactive floor selector with flat configurations, square footage, pricing, facing, and status indicators.
- **8-Direction Site Compass (`DirectionalCompassExplorer`)**: Inspect North, North-East, East, South-East, South, South-West, West, and North-West orientations synced with the 3D viewer.
- **Admin Portal (`AdminPortalPage`)**: Manage venture records, flat statuses, and submitted buyer enquiries persisted via Express JSON storage.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Motion (`motion/react`), Lucide React
- **3D Rendering**: Three.js (`WebGLRenderer`, `PMREMGenerator`, `RoomEnvironment`, `OrbitControls`, `InstancedMesh`, procedural `CanvasTexture`)
- **Backend**: Node.js, Express 4 (`tsx server.ts` serving Vite middleware in dev and static `dist/` in production)
- **Persistence**: File-backed JSON store (`data/store.json`) with automatic seed migration (`CURRENT_SEED_VERSION`)

---

## Project Structure

```text
├── index.html
├── metadata.json
├── package.json
├── server.ts                          # Express API server & Vite SSR/SPA middleware
├── tsconfig.json
├── vite.config.ts
├── data/
│   └── store.json                     # Persisted ventures & enquiries store (generated at runtime)
└── src/
    ├── App.tsx                        # Client router & top-level state
    ├── index.css                      # Tailwind v4 import & custom design tokens
    ├── main.tsx
    ├── components/
    │   ├── AvailabilityCharts.tsx     # Dynamic inventory breakdown & bar/donut charts
    │   ├── BusinessArch3D.tsx         # Interactive 3D entrance arch showcase
    │   ├── DirectionalCompassExplorer.tsx
    │   ├── EnquiryForm.tsx            # Buyer enquiry & site visit form
    │   ├── FloorExplorer.tsx          # Floor & unit status explorer
    │   ├── Footer.tsx
    │   ├── Navbar.tsx
    │   ├── Panorama360Viewer.tsx      # 3D Street-View walkthrough & hotspot HUD
    │   ├── PropertyGallery.tsx
    │   └── SafeImage.tsx
    ├── data/
    │   └── venturesSeed.ts            # Initial data for all 4 apartment ventures
    ├── pages/
    │   ├── AdminPortalPage.tsx
    │   ├── HomePage.tsx
    │   ├── ProjectsComparePage.tsx
    │   ├── VentureDetailPage.tsx
    │   └── VenturesPage.tsx
    ├── three/
    │   ├── architecturalModels.ts     # 4 distinct 3D building & site scene builders
    │   ├── proceduralTextures.ts      # Procedural CanvasTexture generators
    │   └── walkthroughGraph.ts        # 22-node connected 3D navigation graph
    ├── types/
    │   └── realEstate.ts
    └── utils/
        └── ventureStats.ts            # Dynamic flat statistics & integrity validation
```

---

## Getting Started

### Prerequisites
- Node.js 20+ (tested on Node.js 22)
- npm

### Installation
```bash
npm install
```

### Environment Variables
Copy `.env.example` to `.env` if needed for local configuration:
```env
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
```

### Available Scripts
| Command | Description |
|---|---|
| `npm run dev` | Starts Express + Vite dev server on port `3000` (`tsx server.ts`) |
| `npm run build` | Builds the Vite production bundle into `dist/` |
| `npm start` | Runs `server.ts` (`NODE_ENV=production` serves `dist/` and API routes) |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run preview` | Previews the built Vite bundle |
| `npm run clean` | Removes `dist` and `server.js` |

---

## Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check (`{ ok: true }`) |
| `GET` | `/api/ventures` | Fetch all apartment ventures |
| `POST` | `/api/ventures` | Create a new venture (validated via `validateVentureIntegrity`) |
| `PUT` | `/api/ventures/:id` | Update a venture and synchronize floor counts |
| `POST` | `/api/ventures/reset` | Reset ventures to initial seed data |
| `GET` | `/api/enquiries` | Retrieve submitted buyer enquiries |
| `POST` | `/api/enquiries` | Validate and store a new property enquiry |
