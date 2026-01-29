'use client'

import { ReactNode } from 'react'

interface IphoneSimulatorProps {
  children: ReactNode
  className?: string
}

/**
 * iPhone 15 Pro simulator with accurate proportions
 * - Dynamic Island
 * - Status bar with time, signal, battery
 * - Safe area handling
 * - Home indicator
 */
export function IphoneSimulator({ children, className = '' }: IphoneSimulatorProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Device Frame - iPhone 15 Pro proportions */}
      <div className="relative">
        {/* Outer bezel with titanium-like finish */}
        <div
          className="relative rounded-[54px] p-[12px]"
          style={{
            background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.1),
              0 25px 50px -12px rgba(0,0,0,0.5),
              inset 0 1px 0 rgba(255,255,255,0.1)
            `,
          }}
        >
          {/* Screen bezel (black area around screen) */}
          <div
            className="relative overflow-hidden rounded-[44px]"
            style={{
              width: '280px',
              height: '605px', // iPhone 15 Pro aspect ratio ~2.16:1
              backgroundColor: '#000',
            }}
          >
            {/* Screen glass effect */}
            <div
              className="absolute inset-0 z-50 pointer-events-none rounded-[44px]"
              style={{
                background: `
                  linear-gradient(
                    135deg,
                    rgba(255,255,255,0.1) 0%,
                    transparent 40%,
                    transparent 60%,
                    rgba(255,255,255,0.05) 100%
                  )
                `,
              }}
            />

            {/* Dynamic Island */}
            <div className="absolute top-[12px] left-1/2 -translate-x-1/2 z-40">
              <div
                className="rounded-full bg-black"
                style={{
                  width: '90px',
                  height: '28px',
                  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5)',
                }}
              />
            </div>

            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 z-30 flex h-[50px] items-end justify-between px-6 pb-1">
              {/* Left: Time */}
              <span className="text-[14px] font-semibold text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
                9:41
              </span>

              {/* Right: Status icons */}
              <div className="flex items-center gap-1">
                {/* Signal bars */}
                <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
                  <rect x="0" y="8" width="3" height="4" rx="0.5" fill="white" />
                  <rect x="4" y="5" width="3" height="7" rx="0.5" fill="white" />
                  <rect x="8" y="2" width="3" height="10" rx="0.5" fill="white" />
                  <rect x="12" y="0" width="3" height="12" rx="0.5" fill="white" />
                </svg>

                {/* WiFi */}
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="ml-0.5">
                  <path d="M8 2.5C10.5 2.5 12.7 3.5 14.3 5.1L15.7 3.7C13.7 1.7 11 0.5 8 0.5C5 0.5 2.3 1.7 0.3 3.7L1.7 5.1C3.3 3.5 5.5 2.5 8 2.5Z" fill="white" />
                  <path d="M8 6C9.4 6 10.7 6.5 11.7 7.4L13.1 6C11.7 4.7 9.9 4 8 4C6.1 4 4.3 4.7 2.9 6L4.3 7.4C5.3 6.5 6.6 6 8 6Z" fill="white" />
                  <path d="M8 9.5C8.8 9.5 9.5 9.8 10 10.3L11.4 8.9C10.5 8 9.3 7.5 8 7.5C6.7 7.5 5.5 8 4.6 8.9L6 10.3C6.5 9.8 7.2 9.5 8 9.5Z" fill="white" />
                  <circle cx="8" cy="11" r="1" fill="white" />
                </svg>

                {/* Battery */}
                <div className="ml-1 flex items-center">
                  <div
                    className="relative rounded-[3px] border border-white/50"
                    style={{ width: '24px', height: '11px' }}
                  >
                    <div
                      className="absolute inset-[2px] rounded-[1px] bg-white"
                      style={{ width: 'calc(100% - 6px)' }}
                    />
                  </div>
                  <div
                    className="rounded-r-sm bg-white/50"
                    style={{ width: '1.5px', height: '4px', marginLeft: '1px' }}
                  />
                </div>
              </div>
            </div>

            {/* Main content area with safe area padding */}
            <div
              className="absolute inset-0 overflow-hidden rounded-[44px]"
              style={{
                paddingTop: '50px', // Status bar height
                paddingBottom: '34px', // Home indicator area
              }}
            >
              <div className="h-full w-full overflow-hidden">
                {children}
              </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2 z-30">
              <div
                className="rounded-full bg-white/80"
                style={{
                  width: '120px',
                  height: '5px',
                }}
              />
            </div>
          </div>
        </div>

        {/* Side buttons (subtle) */}
        {/* Volume up */}
        <div
          className="absolute left-0 top-[130px] h-[32px] w-[3px] rounded-l-sm"
          style={{ background: 'linear-gradient(90deg, #3a3a3a, #2a2a2a)' }}
        />
        {/* Volume down */}
        <div
          className="absolute left-0 top-[175px] h-[32px] w-[3px] rounded-l-sm"
          style={{ background: 'linear-gradient(90deg, #3a3a3a, #2a2a2a)' }}
        />
        {/* Power button */}
        <div
          className="absolute right-0 top-[160px] h-[48px] w-[3px] rounded-r-sm"
          style={{ background: 'linear-gradient(270deg, #3a3a3a, #2a2a2a)' }}
        />
      </div>
    </div>
  )
}
