import { useState, useEffect } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: '> PABLO TERMINAL v1.0.0', delay: 0 },
  { text: '> Initializing secure connection...', delay: 200 },
  { text: '> Loading market intelligence layer...', delay: 400 },
  { text: '> Connecting to CoinGecko API...', delay: 600 },
  { text: '> Syncing global market data...', delay: 800 },
  { text: '> Scanning news sources...', delay: 1000 },
  { text: '> Calibrating Fear & Greed sensors...', delay: 1200 },
  { text: '> Establishing signal feed...', delay: 1400 },
  { text: '', delay: 1600 },
  { text: '  ██████╗  █████╗ ██████╗ ██╗      ██████╗', delay: 1700 },
  { text: '  ██╔══██╗██╔══██╗██╔══██╗██║     ██╔═══██╗', delay: 1750 },
  { text: '  ██████╔╝███████║██████╔╝██║     ██║   ██║', delay: 1800 },
  { text: '  ██╔═══╝ ██╔══██║██╔══██╗██║     ██║   ██║', delay: 1850 },
  { text: '  ██║     ██║  ██║██████╔╝███████╗╚██████╔╝', delay: 1900 },
  { text: '  ╚═╝     ╚═╝  ╚═╝╚═════╝ ╚══════╝ ╚═════╝', delay: 1950 },
  { text: '', delay: 2000 },
  { text: '  All signal. No noise.', delay: 2100 },
  { text: '', delay: 2300 },
  { text: '> System ready. Welcome.', delay: 2500 },
];

export function BootScreen({ onComplete }: BootScreenProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    const timers: number[] = [];

    BOOT_LINES.forEach((line, i) => {
      const timer = window.setTimeout(() => {
        setVisibleLines(i + 1);
      }, line.delay);
      timers.push(timer);
    });

    const completeTimer = window.setTimeout(onComplete, 3200);
    timers.push(completeTimer);

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-pablo-black z-[100] flex items-center justify-center">
      <div className="w-full max-w-2xl px-8">
        <div className="font-mono text-sm leading-relaxed">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              className={`animate-fadeIn ${
                line.text.startsWith('>') ? 'text-pablo-green' :
                line.text.includes('██') ? 'text-pablo-green glow-green' :
                line.text.includes('All signal') ? 'text-pablo-gold text-center' :
                'text-pablo-muted'
              }`}
            >
              {line.text || '\u00A0'}
            </div>
          ))}
          <span className="inline-block w-2 h-4 bg-pablo-green animate-flicker ml-0.5" />
        </div>
      </div>
    </div>
  );
}
