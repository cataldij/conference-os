'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface DemoModeContextValue {
  isDemo: boolean;
  // Mutation blockers - always return false/void in demo mode
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  // Helper to show toast/alert when user tries to mutate
  showDemoAlert: () => void;
}

const DemoModeContext = createContext<DemoModeContextValue>({
  isDemo: false,
  canEdit: true,
  canDelete: true,
  canCreate: true,
  showDemoAlert: () => {},
});

export function DemoModeProvider({
  children,
  isDemo = false,
}: {
  children: ReactNode;
  isDemo?: boolean;
}) {
  const showDemoAlert = () => {
    // Simple alert for demo mode - could be replaced with toast
    if (typeof window !== 'undefined') {
      alert('This action is disabled in demo mode. Sign up to create your own conference!');
    }
  };

  const value: DemoModeContextValue = {
    isDemo,
    canEdit: !isDemo,
    canDelete: !isDemo,
    canCreate: !isDemo,
    showDemoAlert,
  };

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}

// HOC to wrap mutation buttons/actions
export function withDemoGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  action: 'edit' | 'delete' | 'create' = 'edit'
) {
  return function DemoGuardedComponent(props: P) {
    const { isDemo, showDemoAlert } = useDemoMode();

    if (isDemo) {
      return (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            showDemoAlert();
          }}
          className="cursor-not-allowed opacity-50"
        >
          <WrappedComponent {...props} />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
