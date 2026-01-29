'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IPhoneMockupProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  showNotch?: boolean;
  frameColor?: 'black' | 'silver' | 'gold' | 'blue' | 'purple';
}

const frameColors = {
  black: {
    frame: 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-black',
    bezel: 'bg-black',
    button: 'bg-zinc-700',
  },
  silver: {
    frame: 'bg-gradient-to-b from-zinc-300 via-zinc-200 to-zinc-300',
    bezel: 'bg-zinc-900',
    button: 'bg-zinc-400',
  },
  gold: {
    frame: 'bg-gradient-to-b from-amber-200 via-amber-100 to-amber-200',
    bezel: 'bg-zinc-900',
    button: 'bg-amber-300',
  },
  blue: {
    frame: 'bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600',
    bezel: 'bg-zinc-900',
    button: 'bg-blue-300',
  },
  purple: {
    frame: 'bg-gradient-to-b from-purple-400 via-purple-500 to-purple-600',
    bezel: 'bg-zinc-900',
    button: 'bg-purple-300',
  },
};

export function IPhoneMockup({
  children,
  className,
  scale = 1,
  showNotch = true,
  frameColor = 'black',
}: IPhoneMockupProps) {
  const colors = frameColors[frameColor];

  return (
    <div
      className={cn('relative', className)}
      style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
    >
      {/* iPhone Frame */}
      <div
        className={cn(
          'relative rounded-[3rem] p-[0.75rem] shadow-2xl',
          colors.frame,
          // Outer highlight
          'before:absolute before:inset-0 before:rounded-[3rem] before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none'
        )}
        style={{
          width: 375,
          boxShadow: `
            0 0 0 1px rgba(0,0,0,0.1),
            0 25px 50px -12px rgba(0,0,0,0.5),
            0 0 100px -20px rgba(0,0,0,0.3),
            inset 0 1px 0 rgba(255,255,255,0.1)
          `,
        }}
      >
        {/* Side buttons - Volume */}
        <div
          className={cn(
            'absolute -left-[3px] top-[120px] h-8 w-[3px] rounded-l-sm',
            colors.button
          )}
        />
        <div
          className={cn(
            'absolute -left-[3px] top-[160px] h-14 w-[3px] rounded-l-sm',
            colors.button
          )}
        />
        <div
          className={cn(
            'absolute -left-[3px] top-[220px] h-14 w-[3px] rounded-l-sm',
            colors.button
          )}
        />
        {/* Side button - Power */}
        <div
          className={cn(
            'absolute -right-[3px] top-[180px] h-20 w-[3px] rounded-r-sm',
            colors.button
          )}
        />

        {/* Screen bezel */}
        <div
          className={cn(
            'relative overflow-hidden rounded-[2.4rem]',
            colors.bezel
          )}
        >
          {/* Dynamic Island / Notch */}
          {showNotch && (
            <div className="absolute left-1/2 top-3 z-50 -translate-x-1/2">
              <div className="flex h-[34px] w-[126px] items-center justify-center rounded-full bg-black">
                {/* Camera */}
                <div className="absolute left-[76px] h-[12px] w-[12px] rounded-full bg-zinc-900 ring-[2px] ring-zinc-800">
                  <div className="absolute left-1/2 top-1/2 h-[4px] w-[4px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-900/50" />
                </div>
              </div>
            </div>
          )}

          {/* Screen content */}
          <div
            className="relative bg-white"
            style={{
              width: 351,
              height: 759,
              overflow: 'hidden',
            }}
          >
            {/* Status bar space */}
            <div className="h-[54px] w-full" />

            {/* Scrollable content area */}
            <div className="h-[calc(100%-54px-34px)] overflow-y-auto overflow-x-hidden">
              {children}
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-black/20" />
          </div>
        </div>
      </div>

      {/* Reflection effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/10 via-transparent to-transparent"
        style={{ mixBlendMode: 'overlay' }}
      />
    </div>
  );
}

// Status bar component for inside the mockup
export function IPhoneStatusBar({ time = '9:41', dark = false }: { time?: string; dark?: boolean }) {
  const textColor = dark ? 'text-white' : 'text-black';

  return (
    <div className={cn('absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-3', textColor)}>
      <span className="text-[14px] font-semibold">{time}</span>
      <div className="flex items-center gap-1">
        {/* Cellular */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="0.5" />
          <rect x="5" y="5" width="3" height="7" rx="0.5" />
          <rect x="10" y="2" width="3" height="10" rx="0.5" />
          <rect x="15" y="0" width="3" height="12" rx="0.5" />
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" className="ml-1">
          <path d="M8 2.4c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1-.3.3-.7.3-1 0C12.1 4.7 10.1 3.9 8 3.9S3.9 4.7 2.5 6c-.3.3-.7.3-1 0-.3-.3-.3-.7 0-1C3.2 3.4 5.5 2.4 8 2.4zm0 3c1.7 0 3.2.7 4.3 1.8.3.3.3.7 0 1-.3.3-.7.3-1 0-.8-.8-2-1.3-3.3-1.3s-2.5.5-3.3 1.3c-.3.3-.7.3-1 0-.3-.3-.3-.7 0-1C4.8 6.1 6.3 5.4 8 5.4zm0 3c.8 0 1.6.3 2.1.9.3.3.3.7 0 1-.3.3-.7.3-1 0-.3-.3-.7-.5-1.1-.5s-.8.2-1.1.5c-.3.3-.7.3-1 0-.3-.3-.3-.7 0-1 .5-.6 1.3-.9 2.1-.9z" />
        </svg>
        {/* Battery */}
        <svg width="27" height="12" viewBox="0 0 27 12" fill="currentColor" className="ml-1">
          <rect x="0" y="0" width="24" height="12" rx="3" stroke="currentColor" strokeWidth="1" fill="none" />
          <rect x="2" y="2" width="19" height="8" rx="1.5" />
          <rect x="25" y="3.5" width="2" height="5" rx="1" />
        </svg>
      </div>
    </div>
  );
}
