import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const MARKETS: Record<string, string> = {
  'jitosol-sol': 'JitoSOL/SOL',
  'msol-sol': 'mSOL/SOL',
  'bsol-sol': 'bSOL/SOL',
  'stsol-sol': 'stSOL/SOL',
};

interface Position {
  marketId: string;
  marketName: string;
  bull: number;
  bear: number;
  bullPool: number;
  bearPool: number;
  bullOdds: number;
  bearOdds: number;
  bullPnLIfWins: number;
  bearPnLIfWins: number;
  expectedValue: number;
}

export default function Portfolio() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    // Load all positions with pool data
    const loadPositions = () => {
      const allPositions: Position[] = [];
      let totalInvested = 0;

      Object.keys(MARKETS).forEach((marketId) => {
        const storedPosition = localStorage.getItem(`mockPositions_${marketId}`);
        const storedPools = localStorage.getItem(`mockPools_${marketId}`);

        if (storedPosition && storedPools) {
          const position = JSON.parse(storedPosition);
          const pools = JSON.parse(storedPools);

          // Only include if user has a position
          if (position.bull > 0 || position.bear > 0) {
            const totalPool = pools.bull + pools.bear;
            const bullOdds = totalPool / pools.bull;
            const bearOdds = totalPool / pools.bear;

            // Calculate conditional PnL
            const bullPnLIfWins = (position.bull * bullOdds) - position.bull - position.bear;
            const bearPnLIfWins = (position.bear * bearOdds) - position.bear - position.bull;
            
            // Calculate implied probabilities from odds (accounting for overround)
            const bullImpliedProb = 1 / bullOdds;
            const bearImpliedProb = 1 / bearOdds;
            const totalProb = bullImpliedProb + bearImpliedProb;
            
            // Normalize probabilities to sum to 1
            const bullProb = bullImpliedProb / totalProb;
            const bearProb = bearImpliedProb / totalProb;
            
            // Expected value weighted by probability
            const expectedValue = (bullProb * bullPnLIfWins) + (bearProb * bearPnLIfWins);

            allPositions.push({
              marketId,
              marketName: MARKETS[marketId],
              bull: position.bull,
              bear: position.bear,
              bullPool: pools.bull,
              bearPool: pools.bear,
              bullOdds,
              bearOdds,
              bullPnLIfWins,
              bearPnLIfWins,
              expectedValue,
            });

            totalInvested += position.bull + position.bear;
          }
        }
      });

      setPositions(allPositions);
      setTotalValue(totalInvested);
    };

    loadPositions();
    
    // Update every 3 seconds to reflect changing odds
    const interval = setInterval(loadPositions, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalExpectedValue = positions.reduce((sum, pos) => sum + pos.expectedValue, 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">My Portfolio</h1>
          
          {/* Portfolio Summary */}
          {positions.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400">Total Invested</div>
                <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400">Expected Value</div>
                <div className={`text-2xl font-bold ${totalExpectedValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalExpectedValue >= 0 ? '+' : ''}${totalExpectedValue.toFixed(2)}
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400">Active Positions</div>
                <div className="text-2xl font-bold">{positions.length}</div>
              </div>
            </div>
          )}
        </div>
        
        {positions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400 text-lg">No positions yet. Start betting on markets!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {positions.map((pos) => (
              <div key={pos.marketId} className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">{pos.marketName}</h3>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Expected Value</div>
                    <div className={`text-xl font-bold ${pos.expectedValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pos.expectedValue >= 0 ? '+' : ''}${pos.expectedValue.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Position Sizes */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">🐂 BULL Position</div>
                    <div className="text-3xl font-bold text-green-400">${pos.bull.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">at {pos.bullOdds.toFixed(2)}× odds</div>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">🐻 BEAR Position</div>
                    <div className="text-3xl font-bold text-red-400">${pos.bear.toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">at {pos.bearOdds.toFixed(2)}× odds</div>
                  </div>
                </div>

                {/* Conditional PnL */}
                <div className="border-t border-gray-700 pt-4">
                  <div className="text-sm text-gray-400 mb-3">Projected Outcomes:</div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">If BULL wins:</span>
                      <span className={`text-lg font-bold ${pos.bullPnLIfWins >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pos.bullPnLIfWins >= 0 ? '+' : ''}${pos.bullPnLIfWins.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">If BEAR wins:</span>
                      <span className={`text-lg font-bold ${pos.bearPnLIfWins >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {pos.bearPnLIfWins >= 0 ? '+' : ''}${pos.bearPnLIfWins.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warning for hedged positions */}
                {pos.bull > 0 && pos.bear > 0 && (
                  <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="text-yellow-400 text-sm font-medium">⚠️ Hedged Position</div>
                    <div className="text-gray-400 text-xs mt-1">
                      You're betting on both sides. Only one side can win.
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

