import Link from 'next/link';
import { DemoModeProvider } from '@/contexts/demo-mode-context';
import { Sparkles, ArrowRight, Palette, Layout, Settings, Eye } from 'lucide-react';

// Demo navigation - simplified for demo mode
const demoNavItems = [
  { name: 'Design Studio', href: '/demo/design', icon: Palette },
  { name: 'Conference Preview', href: '/demo/preview', icon: Eye },
];

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoModeProvider isDemo={true}>
      <div className="flex min-h-screen flex-col">
        {/* Demo Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-2.5 text-center text-sm font-medium text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>You&apos;re viewing a read-only demo.</span>
            <Link
              href="/register"
              className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-0.5 font-semibold transition-colors hover:bg-white/30"
            >
              Sign up free
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="flex flex-1">
          {/* Sidebar */}
          <div className="flex w-64 flex-col border-r bg-white/80 backdrop-blur-xl">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/demo" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-amber-400 to-teal-400 text-white shadow-md">
                  <span className="text-lg font-bold">C</span>
                </div>
                <div>
                  <div className="text-sm font-semibold">Conference OS</div>
                  <div className="text-xs text-muted-foreground">Demo Mode</div>
                </div>
              </Link>
            </div>

            {/* Demo Conference Info */}
            <div className="border-b p-4">
              <div className="rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 p-3">
                <div className="text-xs font-medium text-muted-foreground">Demo Conference</div>
                <div className="font-semibold">TechSummit 2024</div>
                <div className="mt-1 text-xs text-muted-foreground">Sep 15-17, 2024</div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <div className="space-y-1">
                {demoNavItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>

            {/* CTA */}
            <div className="border-t p-4">
              <Link
                href="/register"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
              >
                Create Your Conference
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Main content */}
          <main className="relative flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            {children}
          </main>
        </div>
      </div>
    </DemoModeProvider>
  );
}
