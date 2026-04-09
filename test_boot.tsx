import { useState, useEffect } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { text: '> PABLO TERMINAL v1.0.0', delay: 0 },
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
            <div key={i} className="text-pablo-green">{line.text || ' '}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
