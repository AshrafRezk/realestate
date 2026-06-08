import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_CONFIG } from '../demo-config'

interface FavoritesState {
  favoriteUnitIds: string[]
  addFavorite: (unitId: string) => void
  removeFavorite: (unitId: string) => void
  toggleFavorite: (unitId: string) => void
  isFavorite: (unitId: string) => boolean
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteUnitIds: [],
      addFavorite: (unitId) =>
        set((state) => ({
          favoriteUnitIds: state.favoriteUnitIds.includes(unitId)
            ? state.favoriteUnitIds
            : [...state.favoriteUnitIds, unitId],
        })),
      removeFavorite: (unitId) =>
        set((state) => ({
          favoriteUnitIds: state.favoriteUnitIds.filter((id) => id !== unitId),
        })),
      toggleFavorite: (unitId) => {
        const { isFavorite, addFavorite, removeFavorite } = get()
        if (isFavorite(unitId)) {
          removeFavorite(unitId)
        } else {
          addFavorite(unitId)
        }
      },
      isFavorite: (unitId) => get().favoriteUnitIds.includes(unitId),
      clearFavorites: () => set({ favoriteUnitIds: [] }),
    }),
    {
      name: `${DEMO_CONFIG.localStoragePrefix}-favorites`,
    }
  )
)

