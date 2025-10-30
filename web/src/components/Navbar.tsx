import Link from 'next/link';

// Fake wallet button for demo - always shows as "connected"
function FakeWalletButton() {
  const mockAddress = '7xKXp2...vB9mZ'; // Realistic Solana address format

  return (
    <button
      className="px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, #512DA8 0%, #1976D2 100%)',
        color: 'white',
        border: 'none',
      }}
    >
      <span className="flex items-center gap-2">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        {mockAddress}
      </span>
    </button>
  );
}

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-black/30 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/markets" className="text-2xl font-bold flex items-center gap-3">
              <span className="bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                Parity
              </span>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500/10 to-green-500/10 border border-purple-500/30 rounded-full">
                <svg width="16" height="16" viewBox="0 0 646 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M108.53 75.6899L90.81 94.6899C88.52 97.2299 84.58 97.4999 81.94 95.2999C79.3 93.0999 78.89 89.1499 81.09 86.5099L98.81 67.5099C101.1 64.9699 105.04 64.6999 107.68 66.8999C110.42 69.0999 110.83 73.1499 108.53 75.6899Z" fill="url(#paint0_linear)"/>
                  <path d="M13.27 75.6899L30.99 94.6899C33.28 97.2299 37.22 97.4999 39.86 95.2999C42.5 93.0999 42.91 89.1499 40.71 86.5099L22.99 67.5099C20.7 64.9699 16.76 64.6999 14.12 66.8999C11.38 69.0999 10.97 73.1499 13.27 75.6899Z" fill="url(#paint1_linear)"/>
                  <path d="M107.68 29.1C105.04 31.3 101.1 31.03 98.81 28.49L81.09 9.48999C78.8 6.94999 79.21 3 81.94 0.799988C84.67 -1.40001 88.61 -1.13001 90.81 1.31999L108.53 20.32C110.83 22.95 110.42 26.9 107.68 29.1Z" fill="url(#paint2_linear)"/>
                  <path d="M14.12 29.1C16.76 31.3 20.7 31.03 22.99 28.49L40.71 9.48999C43 6.94999 42.59 3 39.86 0.799988C37.13 -1.40001 33.19 -1.13001 30.99 1.31999L13.27 20.32C10.97 22.95 11.38 26.9 14.12 29.1Z" fill="url(#paint3_linear)"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="105.7" y1="67.6" x2="83.05" y2="93.85" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00FFA3"/>
                      <stop offset="1" stopColor="#DC1FFF"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear" x1="15.95" y1="67.6" x2="38.75" y2="93.85" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00FFA3"/>
                      <stop offset="1" stopColor="#DC1FFF"/>
                    </linearGradient>
                    <linearGradient id="paint2_linear" x1="83.05" y1="1.85" x2="105.7" y2="28.4" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00FFA3"/>
                      <stop offset="1" stopColor="#DC1FFF"/>
                    </linearGradient>
                    <linearGradient id="paint3_linear" x1="38.75" y1="1.85" x2="15.95" y2="28.4" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#00FFA3"/>
                      <stop offset="1" stopColor="#DC1FFF"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-xs font-medium text-gray-300">Powered by Solana</span>
              </div>
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
          <FakeWalletButton />
        </div>
      </div>
    </nav>
  );
}

