import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Unit } from '../types'
import { DEMO_CONFIG } from '../demo-config'

interface ComparisonState {
  comparisonUnits: Unit[]
  addToComparison: (unit: Unit) => void
  removeFromComparison: (unitId: string) => void
  clearComparison: () => void
  isInComparison: (unitId: string) => boolean
  canAddMore: () => boolean
}

const MAX_COMPARISON_UNITS = 3

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      comparisonUnits: [],
      addToComparison: (unit) => {
        const { comparisonUnits, canAddMore } = get()
        if (!canAddMore()) return
        if (comparisonUnits.some((u) => u.id === unit.id)) return
        set({ comparisonUnits: [...comparisonUnits, unit] })
      },
      removeFromComparison: (unitId) =>
        set((state) => ({
          comparisonUnits: state.comparisonUnits.filter((u) => u.id !== unitId),
        })),
      clearComparison: () => set({ comparisonUnits: [] }),
      isInComparison: (unitId) => get().comparisonUnits.some((u) => u.id === unitId),
      canAddMore: () => get().comparisonUnits.length < MAX_COMPARISON_UNITS,
    }),
    {
      name: `${DEMO_CONFIG.localStoragePrefix}-comparison`,
    }
  )
)

