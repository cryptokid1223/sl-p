import { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const CRYPTOS = [
  { name: 'SlöpCoin', symbol: 'SLP' },
  { name: 'Dogeshit', symbol: 'DOGS' },
  { name: 'QuantumPepe', symbol: 'QPEPE' },
  { name: 'MoonJuice', symbol: 'MOONJ' },
  { name: 'FomoFi', symbol: 'FOMO' },
  { name: 'WAGMI', symbol: 'WAGMI' },
  { name: 'RugPull', symbol: 'RUG' },
  { name: 'ShillToken', symbol: 'SHILL' },
  { name: 'ApeX', symbol: 'APEX' },
  { name: 'PumpETH', symbol: 'PETH' },
];

function getRandomPrice(base: number) {
  return (base + (Math.random() - 0.5) * base * 0.1).toFixed(2);
}

function getRandomChange() {
  return Math.random() > 0.5 ? 1 : -1;
}

export default function CryptoTicker() {
  const [prices, setPrices] = useState(() =>
    CRYPTOS.map(() => ({ price: getRandomPrice(100), change: getRandomChange() }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prices =>
        prices.map(({ price }) => {
          const change = getRandomChange();
          const base = parseFloat(price);
          const newPrice = getRandomPrice(base);
          return { price: newPrice, change };
        })
      );
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Duplicate the crypto list for seamless looping
  const displayCryptos = [...CRYPTOS, ...CRYPTOS];
  const displayPrices = [...prices, ...prices];

  return (
    <div className="w-full overflow-hidden bg-gray-900 border-b border-gray-800">
      <div className="flex animate-marquee whitespace-nowrap py-2 gap-8">
        {displayCryptos.map((crypto, i) => {
          const { price, change } = displayPrices[i % prices.length] || { price: '0.00', change: 1 };
          return (
            <div
              key={crypto.symbol + '-' + i}
              className="flex items-center gap-2 px-4 py-1 rounded-full bg-gray-800/80 shadow text-sm font-mono text-gray-100 border border-gray-700 min-w-max"
            >
              <span className="font-bold text-green-400">{crypto.symbol}</span>
              <span className="text-gray-200">${price}</span>
              {change > 0 ? (
                <span className="flex items-center text-green-400">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              ) : (
                <span className="flex items-center text-red-400">
                  <ArrowDownRight className="w-4 h-4" />
                </span>
              )}
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
} 