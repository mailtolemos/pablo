import { useState, useEffect } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: '> PABLO TERMINAL v2.0.0', delay: 0 },
  { text: '> Initializing secure connection...', delay: 150 },
  { text: '> Loading market intelligence layer...', delay: 300 },
  { text: '> Connecting to CoinGecko API...', delay: 450 },
  { text: '> Syncing global market data...', delay: 600 },
  { text: '> Calibrating Fear & Greed sensors...', delay: 750 },
  { text: '> Establishing signal feed...', delay: 900 },
  { text: '> Loading dashboard modules...', delay: 1050 },
  { text: '', delay: 1200 },
  { text: '  ████████╗  ██████╗ █████████╗ ██╗      ██████╗', delay: 1300 },
  { text: '  ██╔═══██╗██╔═══██╗██╔═════╝██╗     ██╔═════██╗', delay: 1340 },
  { text: '  ██████████╝██████████╗██████████╗██║     ██║   ██║', delay: 1380 },
  { text: '  ██╔════╩╝ ██╔════██║██╔════██║     ██║   ██║', delay: 1420 },
  { text: '  ██║     ██║  ██║██████████╗██████████╗╚██████████╝', delay: 1460 },
  { text: '  ╚═╝     ╚═╝  ╚═╝╚════════════╩════════════╝ ╚════════╩═╝', delay: 1500 },
  { text: '', delay: 1600 },
  { text: '  All signal. No noise.', delay: 1700 },
  { text: '', delay: 1900 },
  { text: '> System ready. Welcome.', delay: 2100 },
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

    const completeTimer = window.setTimeout(onComplete, 2800);
    timers.push(completeTimer);

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-pablo-black z-[100] flex items-center justify-center">
      <div className="crt-vignette" />
      <div className="scanline-overlay" />
      <div className="w-full max-w-2xl px-8">
        <div className="font-mono text-sm leading-relaxed">
          {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              className={`${
                line.text.startsWith('>') ? 'text-pablo-green' :
                line.text.includes('█') ? 'text-pablo-green glow-green' :
                line.text.includes('All signal') ? 'text-pablo-gold text-center' :
                'text-pablo-muted'
              }`}
              style={{ animation: 'fadeIn 0.2s ease-out' }}
            >
              {line.text || ' '}
            </div>
          ))}
          <span className="inline-block w-2 h-4 bg-pablo-green ml-0.5" style={{ animation: 'flicker 0.5s infinite' }} />
        </div>
      </div>
    </div>
  );
}
