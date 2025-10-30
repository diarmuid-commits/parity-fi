// Mock oracle service for fetching LST/SOL ratios
// In production, this would fetch from Pyth Network or other oracle providers

export interface RatioData {
  ratio: number;
  confidence: number;
  timestamp: number;
}

const USE_MOCK = true; // Set to false when using real Pyth integration

// Generate unique mock ratio patterns for each market
function getMockRatio(pairIndex: number): RatioData {
  const baseTime = Date.now() / 1000;
  const seed = Math.sin(baseTime / 10 + pairIndex * 137.5) * 10000;
  const microSeed = Math.sin((baseTime * 10) + pairIndex * 89.3) * 1000;
  
  // Create more volatile movements (0.98 to 1.02 range with occasional spikes)
  let baseRatio = 1.0;
  const volatility = 0.015 + (Math.abs(Math.sin(seed)) * 0.007); // 1.5% - 2.2% volatility
  const trend = Math.sin(seed / 2) * volatility;
  const noise = Math.sin(microSeed) * (volatility * 0.5);
  
  // Add occasional spikes
  const spike = Math.abs(Math.sin(seed * 3)) > 0.95 ? Math.sin(seed * 7) * volatility * 2 : 0;
  
  baseRatio = baseRatio + trend + noise + spike;
  
  // Clamp between reasonable bounds
  baseRatio = Math.max(0.97, Math.min(1.03, baseRatio));

  return {
    ratio: baseRatio,
    confidence: 0.99 + Math.random() * 0.01,
    timestamp: Date.now(),
  };
}

export async function fetchRatio(lstMint: string, solMint: string, pairIndex: number = 0): Promise<RatioData> {
  if (USE_MOCK) {
    // Return mock data directly
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network delay
    return getMockRatio(pairIndex);
  }

  // Real implementation would fetch from Pyth
  // For now, return mock data
  return getMockRatio(pairIndex);
}

