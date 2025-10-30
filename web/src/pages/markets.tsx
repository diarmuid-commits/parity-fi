import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import WelcomeAnimation from '@/components/WelcomeAnimation';
import { fetchRatio, RatioData } from '@/lib/oracle';

const MARKETS = [
  { id: 'jitosol-sol', name: 'JitoSOL/SOL', description: 'Jito liquid staking token' },
  { id: 'msol-sol', name: 'mSOL/SOL', description: 'Marinade staked SOL' },
  { id: 'bsol-sol', name: 'bSOL/SOL', description: 'BlazeStake staked SOL' },
  { id: 'stsol-sol', name: 'stSOL/SOL', description: 'Lido staked SOL' },
];

// Mock recent activity with realistic Solana wallet addresses
const MOCK_ACTIVITIES = [
  { user: '7xKL9...mPq8', amount: 5000, side: 'BULL', market: 'JitoSOL/SOL', time: '2m ago' },
  { user: '3mPq8...kD4j', amount: 2500, side: 'BEAR', market: 'mSOL/SOL', time: '5m ago' },
  { user: '9nF3x...vB2w', amount: 10000, side: 'BULL', market: 'bSOL/SOL', time: '8m ago' },
  { user: '5jH8k...pL9z', amount: 1500, side: 'BEAR', market: 'JitoSOL/SOL', time: '12m ago' },
  { user: 'AeK4m...wR3q', amount: 7500, side: 'BULL', market: 'stSOL/SOL', time: '15m ago' },
  { user: '2vT6n...xQ7p', amount: 3200, side: 'BEAR', market: 'mSOL/SOL', time: '18m ago' },
  { user: '8pW2z...sN5v', amount: 4800, side: 'BULL', market: 'JitoSOL/SOL', time: '22m ago' },
  { user: '4hL9m...cK8t', amount: 6000, side: 'BEAR', market: 'bSOL/SOL', time: '25m ago' },
];

export default function Markets() {
  const [ratios, setRatios] = useState<Record<string, RatioData>>({});
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  useEffect(() => {
    const updateRatios = async () => {
      const newRatios: Record<string, RatioData> = {};
      for (let i = 0; i < MARKETS.length; i++) {
        const market = MARKETS[i];
        const ratio = await fetchRatio('LST_MINT', 'SOL_MINT', i);
        newRatios[market.id] = ratio;
      }
      setRatios(newRatios);
    };

    updateRatios();
    const interval = setInterval(updateRatios, 3000);
    return () => clearInterval(interval);
  }, []);

  // Rotate activity feed
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentActivityIndex((prev) => (prev + 1) % MOCK_ACTIVITIES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  if (showWelcome) {
    return <WelcomeAnimation onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
              Active Markets
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            Bet on LST/SOL peg deviations across multiple liquid staking tokens
          </p>

          {/* 24h Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-500">24h Volume</div>
              <div className="text-2xl font-bold text-solana-green">$2.4M</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Active Traders</div>
              <div className="text-2xl font-bold text-solana-purple">847</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Total Markets</div>
              <div className="text-2xl font-bold text-blue-400">4</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-card max-w-2xl mx-auto p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">⚡</span>
                <div className="text-left">
                  <div className="text-sm">
                    <span className="font-bold text-white">{MOCK_ACTIVITIES[currentActivityIndex].user}</span>
                    {' '}bet{' '}
                    <span className="font-bold text-solana-green">${MOCK_ACTIVITIES[currentActivityIndex].amount.toLocaleString()}</span>
                    {' '}
                    <span className={`font-bold ${MOCK_ACTIVITIES[currentActivityIndex].side === 'BULL' ? 'text-green-400' : 'text-red-400'}`}>
                      {MOCK_ACTIVITIES[currentActivityIndex].side}
                    </span>
                    {' on '}
                    <span className="text-gray-300">{MOCK_ACTIVITIES[currentActivityIndex].market}</span>
                  </div>
                  <div className="text-xs text-gray-500">{MOCK_ACTIVITIES[currentActivityIndex].time}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 animate-pulse">LIVE</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {MARKETS.map((market) => {
            const ratio = ratios[market.id];
            const deviation = ratio ? ((ratio.ratio - 1) * 100).toFixed(3) : '0.000';
            const isAbovePeg = ratio && ratio.ratio > 1;

            return (
              <Link
                key={market.id}
                href={`/market/${market.id}`}
                className="glass-card p-6 hover:glow-effect cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{market.name}</h2>
                    <p className="text-gray-400 text-sm">{market.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">Current Ratio</div>
                    <div className="text-xl font-mono">
                      {ratio ? ratio.ratio.toFixed(6) : '-.------'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                  <div>
                    <div className="text-sm text-gray-400">Deviation</div>
                    <div className={`text-lg font-bold ${isAbovePeg ? 'text-green-400' : 'text-red-400'}`}>
                      {isAbovePeg ? '+' : ''}{deviation}%
                    </div>
                  </div>
                  <div className="text-sm bg-solana-purple/20 text-solana-purple px-3 py-1 rounded-full">
                    Active
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

