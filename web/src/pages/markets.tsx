import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { fetchRatio, RatioData } from '@/lib/oracle';

const MARKETS = [
  { id: 'jitosol-sol', name: 'JitoSOL/SOL', description: 'Jito liquid staking token' },
  { id: 'msol-sol', name: 'mSOL/SOL', description: 'Marinade staked SOL' },
  { id: 'bsol-sol', name: 'bSOL/SOL', description: 'BlazeStake staked SOL' },
  { id: 'stsol-sol', name: 'stSOL/SOL', description: 'Lido staked SOL' },
];

export default function Markets() {
  const [ratios, setRatios] = useState<Record<string, RatioData>>({});

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

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
              Active Markets
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            Bet on LST/SOL peg deviations across multiple liquid staking tokens
          </p>
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

