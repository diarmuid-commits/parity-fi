# Quick Start Guide

## Prerequisites
- Node.js 16+ installed
- A code editor (VS Code recommended)

## Steps to Run Locally

### 1. Clone or Download
```bash
git clone <your-repo-url>
cd timetocook
```

### 2. Install Dependencies
```bash
cd web
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

If port 3000 is busy, use:
```bash
PORT=3001 npm run dev
```

### 4. Open in Browser
Visit: `http://localhost:3000` (or `http://localhost:3001`)

## What You'll See
- **Markets Page**: Browse all available LST/SOL markets
- **Market Detail**: Place BULL/BEAR bets and track your P&L
- **Portfolio**: View all your positions

## Demo Features
- Mock wallet connection (no real wallet needed for demo)
- Simulated transactions with fake signatures
- Local storage for demo balance and positions
- Live price ratio updates (mocked data)

## Troubleshooting

**Port already in use?**
```bash
PORT=3001 npm run dev
```

**Module not found errors?**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Want to reset your demo balance?**
Open browser console and run:
```javascript
localStorage.clear()
```
Then refresh the page.

## Project Structure
```
timetocook/
├── web/                    # Next.js frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── lib/            # Utilities (oracle, anchor client)
│   │   └── styles/         # Global styles
│   └── public/             # Static assets
└── README.md
```

## Need Help?
Check the main README.md for more detailed information.

