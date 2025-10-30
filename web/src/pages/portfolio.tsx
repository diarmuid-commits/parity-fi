import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function Portfolio() {
  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {
    // Load positions from localStorage
    const stored = localStorage.getItem('mockPositions');
    if (stored) {
      const allPositions = JSON.parse(stored);
      const positionsArray = Object.entries(allPositions).map(([market, pos]: any) => ({
        market,
        ...pos,
      }));
      setPositions(positionsArray);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">My Portfolio</h1>
        
        {positions.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-gray-400 text-lg">No positions yet. Start betting on markets!</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {positions.map((pos, idx) => (
              <div key={idx} className="glass-card p-6">
                <h3 className="text-xl font-bold mb-4">{pos.market}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">🐂 BULL Position</div>
                    <div className="text-2xl font-bold">${pos.bull.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">🐻 BEAR Position</div>
                    <div className="text-2xl font-bold">${pos.bear.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

