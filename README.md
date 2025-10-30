# Parity - Bet on LST/SOL Peg Deviations

A prediction market platform built on Solana for betting on Liquid Staking Token (LST) peg deviations.

## What is Parity?

Parity allows users to bet on whether Liquid Staking Tokens (like JitoSOL, mSOL, bSOL, stSOL) will trade above or below their peg to SOL. Users take BULL (above peg) or BEAR (below peg) positions with dynamic odds based on pool sizes.

## Features

- **Multiple LST Markets**: Bet on JitoSOL/SOL, mSOL/SOL, bSOL/SOL, and stSOL/SOL
- **Dynamic Odds**: Pool-based odds that adjust in real-time
- **Live Price Feeds**: Real-time ratio tracking with volatility
- **Wallet Integration**: Solana wallet adapter support
- **Modern UI**: Sleek, responsive interface built with Next.js and Tailwind CSS

## Tech Stack

- **Smart Contract**: Anchor Framework (Rust)
- **Frontend**: Next.js, React, TypeScript
- **Blockchain**: Solana
- **Styling**: Tailwind CSS
- **Price Feeds**: Pyth Network (oracle integration)

## Quick Start

See [GET_STARTED.md](./GET_STARTED.md) for detailed setup instructions.

### Prerequisites

- Node.js 16+ and npm
- Rust and Solana CLI (for smart contract development)
- Anchor CLI

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd timetocook

# Install frontend dependencies
cd web
npm install

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Project Structure

```
timetocook/
├── anchor/          # Anchor program (Solana smart contract)
│   ├── programs/
│   │   └── parity/
│   └── tests/
├── web/             # Next.js frontend
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   └── public/
└── README.md
```

## How It Works

1. **Connect Wallet**: Connect your Solana wallet
2. **Select Market**: Choose an LST/SOL pair to bet on
3. **Take Position**: Place BULL (above peg) or BEAR (below peg) bets
4. **Track PnL**: Monitor your profit/loss based on live odds
5. **Claim Winnings**: Collect payouts when markets resolve

## License

MIT

