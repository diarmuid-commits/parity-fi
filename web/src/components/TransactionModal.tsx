import { useState, useEffect } from 'react';

interface TransactionModalProps {
  onClose: () => void;
  onComplete: () => void;
  type: string;
  amount: number;
}

export default function TransactionModal({ onClose, onComplete, type, amount }: TransactionModalProps) {
  const [step, setStep] = useState<'confirming' | 'processing' | 'complete'>('confirming');
  const [signature, setSignature] = useState<string>('');

  useEffect(() => {
    if (step === 'confirming') {
      // Simulate user confirmation delay
      const timer = setTimeout(() => {
        setStep('processing');
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (step === 'processing') {
      // Simulate transaction processing
      const timer = setTimeout(() => {
        const fakeSig = generateFakeSignature();
        setSignature(fakeSig);
        setStep('complete');
        onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (step === 'complete') {
      // Auto-close after showing complete state
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [step, onClose, onComplete]);

  const generateFakeSignature = () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-card p-8 max-w-md w-full mx-4">
        {step === 'confirming' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-solana-green mx-auto mb-4"></div>
            <h3 className="text-2xl font-bold mb-2">Confirm Transaction</h3>
            <p className="text-gray-400 mb-4">Please approve in your wallet</p>
            <div className="bg-gray-800/50 rounded-lg p-4 text-left">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Type:</span>
                <span className="font-bold">{type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="font-bold">${amount.toLocaleString()} USDC</span>
              </div>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center">
            <div className="animate-pulse mb-4">
              <div className="h-16 w-16 bg-solana-green/20 rounded-full mx-auto flex items-center justify-center">
                <div className="h-8 w-8 bg-solana-green rounded-full"></div>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Processing Transaction</h3>
            <p className="text-gray-400">Waiting for confirmation...</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center">
            <div className="mb-4">
              <div className="h-16 w-16 bg-green-500/20 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-green-500">Transaction Complete!</h3>
            <div className="bg-gray-800/50 rounded-lg p-4 mt-4">
              <div className="text-xs text-gray-400 mb-1">Signature:</div>
              <div className="text-xs font-mono break-all text-gray-300">{signature}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

