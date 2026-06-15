import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LayoutState {
  isSidebarExpanded: boolean;
  isMobileMenuOpen: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      isSidebarExpanded: true,
      isMobileMenuOpen: false,
      toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
      setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    }),
    {
      name: 'layout-storage',
      partialize: (state) => ({
        isSidebarExpanded: state.isSidebarExpanded,
      }),
    }
  )
);
