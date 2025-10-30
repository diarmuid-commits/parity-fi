import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import TransactionModal from '@/components/TransactionModal';
import { fetchRatio, RatioData } from '@/lib/oracle';
import toast from 'react-hot-toast';

const MARKETS: Record<string, { name: string; description: string; index: number }> = {
  'jitosol-sol': { name: 'JitoSOL/SOL', description: 'Jito liquid staking token', index: 0 },
  'msol-sol': { name: 'mSOL/SOL', description: 'Marinade staked SOL', index: 1 },
  'bsol-sol': { name: 'bSOL/SOL', description: 'BlazeStake staked SOL', index: 2 },
  'stsol-sol': { name: 'stSOL/SOL', description: 'Lido staked SOL', index: 3 },
};

interface PoolState {
  bull: number;
  bear: number;
}

// Mock recent bets for this market with realistic Solana addresses
const generateMarketActivity = (marketName: string) => [
  { user: '6rX3k...mW9p', amount: 3500, side: 'BULL', time: '1m ago' },
  { user: 'BnQ7v...hF4x', amount: 1800, side: 'BEAR', time: '4m ago' },
  { user: '5wP8z...jK2n', amount: 5200, side: 'BULL', time: '7m ago' },
  { user: '9mL4t...pV6r', amount: 2100, side: 'BEAR', time: '11m ago' },
  { user: 'CqR2h...sT8w', amount: 4700, side: 'BULL', time: '14m ago' },
];

export default function MarketDetail() {
  const router = useRouter();
  const { id } = router.query;
  const marketId = id as string;
  const market = marketId ? MARKETS[marketId] : null;

  const [ratioData, setRatioData] = useState<RatioData | null>(null);
  const [betAmount, setBetAmount] = useState<string>('100');
  const [mockUSDC, setMockUSDC] = useState<number>(10000);
  const [showTxModal, setShowTxModal] = useState(false);
  const [pendingBet, setPendingBet] = useState<{ side: 'bull' | 'bear'; amount: number } | null>(null);
  const [activityIndex, setActivityIndex] = useState(0);

  // Per-market pool and position states
  const [pools, setPools] = useState<PoolState>({ bull: 50000, bear: 50000 });
  const [position, setPosition] = useState<PoolState>({ bull: 0, bear: 0 });

  // Load from localStorage on mount
  useEffect(() => {
    const storedBalance = localStorage.getItem('mockUSDC');
    if (storedBalance) setMockUSDC(parseFloat(storedBalance));

    if (marketId) {
      const storedPools = localStorage.getItem(`mockPools_${marketId}`);
      if (storedPools) {
        setPools(JSON.parse(storedPools));
      } else {
        // Initialize with REALISTIC depeg economics
        // Peg holding is 95%+ likely → BULL pool dominates (90% of total)
        // Depeg is rare (<5% chance) → BEAR pool tiny (10% of total)
        const baseValue = 50000 + (market?.index || 0) * 10000;
        const totalLiquidity = baseValue * 5; // Much larger total pool
        const initialPools = {
          bull: totalLiquidity * 0.9 + Math.random() * 10000,  // ~90% in BULL (225K-240K)
          bear: totalLiquidity * 0.1 + Math.random() * 5000,   // ~10% in BEAR (25K-30K)
        };
        setPools(initialPools);
        localStorage.setItem(`mockPools_${marketId}`, JSON.stringify(initialPools));
      }

      const storedPositions = localStorage.getItem(`mockPositions_${marketId}`);
      if (storedPositions) {
        setPosition(JSON.parse(storedPositions));
      }
    }
  }, [marketId, market]);

  // Fetch ratio data
  useEffect(() => {
    if (!market) return;

    const updateRatio = async () => {
      const data = await fetchRatio('LST_MINT', 'SOL_MINT', market.index);
      setRatioData(data);
    };

    updateRatio();
    const interval = setInterval(updateRatio, 3000);
    return () => clearInterval(interval);
  }, [market]);

  // Rotate activity
  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalPool = pools.bull + pools.bear;
  const bullOdds = totalPool > 0 ? totalPool / pools.bull : 1;
  const bearOdds = totalPool > 0 ? totalPool / pools.bear : 1;

  const handleBet = (side: 'bull' | 'bear') => {
    const amount = parseFloat(betAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount > mockUSDC) {
      toast.error('Insufficient balance');
      return;
    }

    setPendingBet({ side, amount });
    setShowTxModal(true);
  };

  const completeBet = () => {
    if (!pendingBet || !marketId) return;

    const { side, amount } = pendingBet;

    // Update balance
    const newBalance = mockUSDC - amount;
    setMockUSDC(newBalance);
    localStorage.setItem('mockUSDC', newBalance.toString());

    // Update pools
    const newPools = {
      ...pools,
      [side]: pools[side] + amount,
    };
    setPools(newPools);
    localStorage.setItem(`mockPools_${marketId}`, JSON.stringify(newPools));

    // Update position
    const newPosition = {
      ...position,
      [side]: position[side] + amount,
    };
    setPosition(newPosition);
    localStorage.setItem(`mockPositions_${marketId}`, JSON.stringify(newPosition));

    toast.success(
      `🎉 ${side.toUpperCase()} Bet Placed! You could win $${(amount * (side === 'bull' ? bullOdds : bearOdds) - amount).toFixed(0)} profit!`,
      {
        duration: 4000,
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #14F195',
          padding: '16px',
          fontSize: '14px',
        },
      }
    );
    setPendingBet(null);
  };

  // Calculate conditional PnL
  const calculatePnL = () => {
    const bullStake = position.bull;
    const bearStake = position.bear;

    if (bullStake === 0 && bearStake === 0) {
      return { bullPnLIfWins: 0, bearPnLIfWins: 0, expectedValue: 0 };
    }

    // If BULL wins: user gets bullStake * bullOdds, loses bearStake
    const bullPnLIfWins = (bullStake * bullOdds) - bullStake - bearStake;

    // If BEAR wins: user gets bearStake * bearOdds, loses bullStake
    const bearPnLIfWins = (bearStake * bearOdds) - bearStake - bullStake;

    // Calculate implied probabilities from odds (proper EV calculation)
    const bullImpliedProb = 1 / bullOdds;
    const bearImpliedProb = 1 / bearOdds;
    const totalProb = bullImpliedProb + bearImpliedProb;
    
    // Normalize probabilities to sum to 1
    const bullProb = bullImpliedProb / totalProb;
    const bearProb = bearImpliedProb / totalProb;
    
    // Expected value weighted by market-implied probability
    const expectedValue = (bullProb * bullPnLIfWins) + (bearProb * bearPnLIfWins);

    return { bullPnLIfWins, bearPnLIfWins, expectedValue };
  };

  const { bullPnLIfWins, bearPnLIfWins, expectedValue } = calculatePnL();
  const hasPosition = position.bull > 0 || position.bear > 0;

  if (!market) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{market.name}</h1>
              <p className="text-gray-400">{market.description}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">24h Volume</div>
              <div className="text-2xl font-bold text-solana-green">$847K</div>
            </div>
          </div>

          {/* Recent Activity for this market */}
          <div className="glass-card p-3 bg-gray-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div className="text-sm">
                  <span className="font-bold text-white">{generateMarketActivity(market.name)[activityIndex].user}</span>
                  {' '}just bet{' '}
                  <span className="font-bold text-solana-green">${generateMarketActivity(market.name)[activityIndex].amount.toLocaleString()}</span>
                  {' '}
                  <span className={`font-bold ${generateMarketActivity(market.name)[activityIndex].side === 'BULL' ? 'text-green-400' : 'text-red-400'}`}>
                    {generateMarketActivity(market.name)[activityIndex].side}
                  </span>
                  {' · '}
                  <span className="text-gray-500 text-xs">{generateMarketActivity(market.name)[activityIndex].time}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500 animate-pulse">LIVE</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Market Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Ratio Card */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-4">Current Ratio</h2>
              {ratioData ? (
                <div>
                  <div className="text-5xl font-mono font-bold mb-2">
                    {ratioData.ratio.toFixed(6)}
                  </div>
                  <div className={`text-lg ${ratioData.ratio > 1 ? 'text-green-400' : 'text-red-400'}`}>
                    {ratioData.ratio > 1 ? '▲' : '▼'} {((ratioData.ratio - 1) * 100).toFixed(3)}%
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Updated {new Date(ratioData.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="animate-pulse">Loading...</div>
              )}
            </div>

            {/* Pool Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="glass-card p-4">
                <div className="text-sm text-gray-400 mb-1">🐂 BULL Pool</div>
                <div className="text-2xl font-bold">${pools.bull.toLocaleString()}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {((pools.bull / totalPool) * 100).toFixed(1)}% of total
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="text-sm text-gray-400 mb-1">💰 Total Pool</div>
                <div className="text-2xl font-bold">${totalPool.toLocaleString()}</div>
                <div className="text-sm text-gray-400 mt-1">Total volume</div>
              </div>

              <div className="glass-card p-4">
                <div className="text-sm text-gray-400 mb-1">🐻 BEAR Pool</div>
                <div className="text-2xl font-bold">${pools.bear.toLocaleString()}</div>
                <div className="text-sm text-gray-400 mt-1">
                  {((pools.bear / totalPool) * 100).toFixed(1)}% of total
                </div>
              </div>
            </div>

            {/* Payouts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 bg-green-500/10">
                <div className="text-sm text-gray-400 mb-1">BULL Payout</div>
                <div className="text-3xl font-bold text-green-400">{bullOdds.toFixed(2)}×</div>
              </div>
              <div className="glass-card p-4 bg-red-500/10">
                <div className="text-sm text-gray-400 mb-1">BEAR Payout</div>
                <div className="text-3xl font-bold text-red-400">{bearOdds.toFixed(2)}×</div>
              </div>
            </div>

            {/* PnL Display */}
            {hasPosition && (
              <div className="glass-card p-6 border-2 border-solana-green/30">
                <h3 className="text-xl font-bold mb-4">Your Potential P&L</h3>
                
                {position.bull > 0 && position.bear > 0 && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="text-yellow-400 text-sm font-medium">⚠️ Warning: You are hedged on both sides</div>
                    <div className="text-gray-400 text-xs mt-1">
                      Only one side can win. Your max profit is reduced.
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Your BULL Position</div>
                    <div className="text-2xl font-bold">${position.bull.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 mb-1">Your BEAR Position</div>
                    <div className="text-2xl font-bold">${position.bear.toFixed(2)}</div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">If BULL wins:</span>
                    <span className={`text-xl font-bold ${bullPnLIfWins >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bullPnLIfWins >= 0 ? '+' : ''}${bullPnLIfWins.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">If BEAR wins:</span>
                    <span className={`text-xl font-bold ${bearPnLIfWins >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bearPnLIfWins >= 0 ? '+' : ''}${bearPnLIfWins.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-700 pt-3">
                    <span className="text-gray-300 font-medium">Expected Value:</span>
                    <span className={`text-2xl font-bold ${expectedValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {expectedValue >= 0 ? '+' : ''}${expectedValue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Betting Interface */}
          <div className="space-y-6">
            {/* Hedging Example Card */}
            <div className="glass-card p-6 border-2 border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🛡️</span>
                <h3 className="text-lg font-bold text-blue-400">Hedging Example</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-300 mb-2">
                    <strong>Scenario:</strong> You have 100 {market.name.split('/')[0]} deposited as collateral in a lending protocol.
                  </div>
                  <div className="text-gray-400 text-xs">
                    Current value: ~100 SOL ($10,000)
                  </div>
                </div>

                <div className="border-l-2 border-yellow-500 pl-3">
                  <div className="text-yellow-400 font-medium mb-1">⚠️ Risk</div>
                  <div className="text-gray-400 text-xs">
                    If {market.name.split('/')[0]} depegs by 5%, you could face liquidation or lose $500 in collateral value.
                  </div>
                </div>

                <div className="border-l-2 border-green-500 pl-3">
                  <div className="text-green-400 font-medium mb-1">✅ Solution</div>
                  <div className="text-gray-400 text-xs">
                    Buy BEAR position for $500. If depeg occurs, BEAR pays out ${(500 * bearOdds).toFixed(0)} ({bearOdds.toFixed(2)}×), offsetting your loss.
                  </div>
                </div>

                <div className="bg-gray-800/30 rounded p-2 text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Premium cost:</span>
                    <span className="text-white">$500</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-500">Potential payout:</span>
                    <span className="text-green-400">${(500 * bearOdds).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-1">
                    <span className="text-gray-400 font-medium">Net if depeg:</span>
                    <span className="text-green-400 font-bold">+${(500 * bearOdds - 500).toFixed(0)}</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 italic">
                  💡 This is how DeFi protocols can insure their LST holdings against depeg risk.
                </div>
              </div>
            </div>

            {/* Balance Card */}
            <div className="glass-card p-6">
              <div className="text-sm text-gray-400 mb-1">Your Balance</div>
              <div className="text-3xl font-bold">${mockUSDC.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">USDC (Demo)</div>
            </div>

            {/* Position Descriptions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4">Choose Your Side</h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🐂</span>
                    <span className="font-bold text-green-400">BULL</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Bet the peg holds. Sell protection to hedgers and earn consistent premiums as the likely outcome materializes.
                  </p>
                </div>

                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🐻</span>
                    <span className="font-bold text-red-400">BEAR</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Hedge against peg deviation or speculate on drift events. Pay a premium for protection with amplified upside when deviation occurs.
                  </p>
                </div>
              </div>
            </div>

            {/* Bet Input */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4">Place Your Bet</h3>
              
              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-2">Amount (USDC)</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-lg font-mono focus:outline-none focus:border-solana-green"
                  placeholder="100"
                />
                <div className="flex gap-2 mt-2">
                  {[100, 500, 1000, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(amt.toString())}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded px-2 py-1 text-xs transition-colors"
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Win Preview */}
              {betAmount && parseFloat(betAmount) > 0 && (
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Potential Winnings</div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-lg font-bold text-green-400">
                          ${(parseFloat(betAmount) * bullOdds).toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">if BULL wins</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-400">
                          ${(parseFloat(betAmount) * bearOdds).toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500">if BEAR wins</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => handleBet('bull')}
                  className="bet-button w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-lg transition-all"
                >
                  🐂 BET BULL {bullOdds.toFixed(2)}×
                  {betAmount && parseFloat(betAmount) > 0 && (
                    <span className="block text-sm font-normal mt-1">
                      Win ${(parseFloat(betAmount) * bullOdds - parseFloat(betAmount)).toFixed(0)} profit
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleBet('bear')}
                  className="bet-button w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-lg transition-all"
                >
                  🐻 BET BEAR {bearOdds.toFixed(2)}×
                  {betAmount && parseFloat(betAmount) > 0 && (
                    <span className="block text-sm font-normal mt-1">
                      Win ${(parseFloat(betAmount) * bearOdds - parseFloat(betAmount)).toFixed(0)} profit
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTxModal && pendingBet && (
        <TransactionModal
          onClose={() => {
            setShowTxModal(false);
            setPendingBet(null);
          }}
          onComplete={completeBet}
          type={`${pendingBet.side.toUpperCase()} Bet`}
          amount={pendingBet.amount}
        />
      )}
    </div>
  );
}

