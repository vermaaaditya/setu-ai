<div align="center">

```text
  ___ ___ _____ _   _     _   ___ 
 / __| __|_   _| | | |   /_\ |_ _|
 \__ \ _|  | | | |_| |  / _ \ | | 
 |___/___| |_|  \___/  /_/ \_\___|
```

**Tactical Command HUD for Disaster Response**

</div>

---

## 🌪️ Overview
Setu.AI is a real-time, highly tactical command dashboard designed for emergency incident commanders and field responders. Originally built to simulate flood surges in the Brahmaputra Basin (Majuli/Jorhat region), it now supports multiple river basins including the Ganges and Sutlej. It calculates flood impact, routes evacuations avoiding submerged roads, and tracks field units in real-time.

## 🚀 Core Features
*   **Multi-View System:** 
    *   **HQ Command (`/hq`):** Central dashboard to simulate surge levels, visualize flooded zones, and calculate evacuation routes.
    *   **Field Responder (`/responder`):** Mobile-first view for rescue workers to ping their status (Safe/Stranded) with instant GPS syncing to HQ.
    *   **Navigation (`/navigation`):** Dedicated navigation interface for guided evacuation routing.
    *   **Analytics (`/analytics`):** Real-time analytics and data visualization dashboard.
    *   **Civilian Portal (`/civilian`):** Public-facing portal for civilians to view safe zones and status.
*   **Real-Time Sync:** Firebase Firestore powers instantaneous 2-way data flow between HQ sliders and Field Responder apps.
*   **Spatial Intersection:** `Turf.js` dynamically calculates polygon intersections to determine exactly which real-world roads are flooded.
*   **A* Routing Engine:** `ngraph.path` strips flooded roads from the graph and instantly recalculates the safest evacuation route.
*   **AI Dispatch:** Integrates with Groq/LLaMa to instantly generate urgent evacuation dispatch warnings based on live telemetry, spoken aloud via Web Speech API and exported as a PDF Manifest.
*   **Real OSM Data:** Routes through thousands of real road segments pulled from OpenStreetMap Overpass API.

## 📂 Project Structure

```text
setu-ui/
├── public/                 # Static assets
├── scripts/
│   ├── fetchRealRoads.cjs  # Node script to pull live OSM Overpass data
│   ├── downsampleRoads.cjs # Node script to downsample road data
│   └── optimizeRoads.cjs   # Node script to optimize road geometries
├── src/
│   ├── components/         
│   │   ├── CommandLayout   # Main layout, Firebase context, and Telemetry Panel
│   │   └── CommandMap      # Core Leaflet map rendering logic
│   ├── data/               
│   │   ├── basinRegistry.ts# Registry configuration for multiple river basins
│   │   ├── mockBasin.ts    # Riverbank topography polygons
│   │   ├── mockPopulation  # Population cluster coordinates
│   │   └── realRoads*.json # Real road segments from OSM (Brahmaputra, Ganges, Sutlej)
│   ├── lib/
│   │   ├── aiDispatcher.ts # Groq LLM integration & PDF generation
│   │   ├── exportUtils.ts  # KML generation for flood zones
│   │   ├── firebase.ts     # Firestore initialization
│   │   ├── routingEngine   # ngraph graph building and A* pathfinding
│   │   └── spatialEngine   # Turf.js spatial logic
│   ├── pages/
│   │   ├── AnalyticsRoute.tsx       # Analytics dashboard view
│   │   ├── CivilianPublicRoute.tsx  # Public civilian portal
│   │   ├── FieldResponderRoute.tsx  # Mobile responder view
│   │   ├── HQRoute.tsx              # Desktop commander view
│   │   └── NavigationRoute.tsx      # Navigation route view
│   ├── styles/
│   │   └── tokens.css      # CSS Variables (Dark/Light mode)
│   └── App.tsx             # React Router setup
└── README.md
```

## 🛠️ Setup Instructions

1.  **Install Dependencies**
    ```bash
    npm install
    ```
2.  **Environment Variables**
    Create a `.env` file in the root directory and add your Groq API key:
    ```env
    VITE_GROQ_API_KEY=your_api_key_here
    ```
3.  **Firebase Config**
    Open `src/lib/firebase.ts` and replace the placeholder config with your real Firebase project credentials. Ensure Firestore is enabled.
4.  **Run Dev Server**
    ```bash
    npm run dev
    ```

## 🎨 Theme Support
Includes full support for a high-contrast Light Mode optimized for direct-sunlight viewing by field responders, alongside the default Tactical Dark Mode.

---
*Built with Vite, React, TypeScript, Leaflet, Turf.js, Firebase, and Groq.*
