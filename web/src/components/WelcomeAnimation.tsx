import { useEffect, useState } from 'react';

interface WelcomeAnimationProps {
  onComplete: () => void;
}

export default function WelcomeAnimation({ onComplete }: WelcomeAnimationProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 100),
      setTimeout(() => setStep(2), 800),
      setTimeout(() => setStep(3), 1600),
      setTimeout(() => onComplete(), 3000),
    ];

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div 
          className={`mb-8 transition-all duration-700 ${
            step >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
        >
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-solana-purple to-solana-green flex items-center justify-center glow-effect-strong">
            <div className="text-6xl font-bold">❇️</div>
          </div>
        </div>

        {/* Title */}
        <div 
          className={`transition-all duration-700 delay-300 ${
            step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
              Parity
            </span>
          </h1>
        </div>

        {/* Tagline */}
        <div 
          className={`transition-all duration-700 delay-500 ${
            step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-2xl text-gray-300 mb-2">
            Bet on LST Peg Deviations
          </p>
          <p className="text-lg text-gray-500">
            The newest primitive in DeFi betting
          </p>
        </div>

        {/* Loading indicator */}
        <div 
          className={`mt-12 transition-all duration-500 ${
            step >= 3 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex justify-center space-x-2">
            <div className="w-3 h-3 bg-solana-green rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-solana-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-solana-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

