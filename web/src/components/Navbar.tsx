import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-black/30 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/markets" className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                Parity
              </span>
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/markets" className="hover:text-solana-green transition-colors">
                Markets
              </Link>
              <Link href="/portfolio" className="hover:text-solana-green transition-colors">
                Portfolio
              </Link>
            </div>
          </div>
          <WalletMultiButton />
        </div>
      </div>
    </nav>
  );
}

