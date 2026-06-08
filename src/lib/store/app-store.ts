import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UnitFilters } from "../types";
import { DEMO_CONFIG } from "../demo-config";

interface AppState {
  // PWA Install
  installPromptEvent: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  showInstallBanner: boolean;
  setInstallPrompt: (event: BeforeInstallPromptEvent | null) => void;
  setShowInstallBanner: (show: boolean) => void;
  dismissInstallBanner: () => void;

  // Search Filters
  filters: UnitFilters;
  setFilters: (filters: UnitFilters) => void;
  clearFilters: () => void;

  // UI State
  isFilterDrawerOpen: boolean;
  setFilterDrawerOpen: (open: boolean) => void;

  // Maintenance Gate
  isMaintenanceAuthorized: boolean;
  authorizeMaintenance: (password: string) => boolean;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const MAINTENANCE_PASSWORD = DEMO_CONFIG.maintenancePassword;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // PWA Install
      installPromptEvent: null,
      isInstallable: false,
      showInstallBanner: true,
      setInstallPrompt: (event) =>
        set({ installPromptEvent: event, isInstallable: event !== null }),
      setShowInstallBanner: (show) => set({ showInstallBanner: show }),
      dismissInstallBanner: () => set({ showInstallBanner: false }),

      // Search Filters
      filters: {},
      setFilters: (filters) => set({ filters }),
      clearFilters: () => set({ filters: {} }),

      // UI State
      isFilterDrawerOpen: false,
      setFilterDrawerOpen: (open) => set({ isFilterDrawerOpen: open }),

      // Maintenance Gate
      isMaintenanceAuthorized: false,
      authorizeMaintenance: (password) => {
        if (password === MAINTENANCE_PASSWORD) {
          set({ isMaintenanceAuthorized: true });
          return true;
        }
        return false;
      },
    }),
    {
      name: `${DEMO_CONFIG.localStoragePrefix}-app-storage`,
      partialize: (state) => ({ 
        isMaintenanceAuthorized: state.isMaintenanceAuthorized,
        showInstallBanner: state.showInstallBanner 
      }),
    }
  )
);

