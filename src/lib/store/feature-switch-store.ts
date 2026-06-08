import { create } from "zustand";

interface FeatureSwitchState {
  values: Record<string, boolean>;
  fields: any[];
  isReady: boolean;
  setFeatures: (values: Record<string, boolean>, fields?: any[]) => void;
  getFeature: (apiName: string, defaultValue?: boolean) => boolean;
}

export const useFeatureSwitchStore = create<FeatureSwitchState>((set, get) => ({
  values: {},
  fields: [],
  isReady: false,
  setFeatures: (values, fields = []) => {
    const lowerValues = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k.toLowerCase(), v])
    );
    set({ values: lowerValues, fields, isReady: true });
  },
  getFeature: (apiName, defaultValue = false) => {
    const state = get();
    const key = apiName.toLowerCase();
    if (key in state.values) {
      return state.values[key];
    }
    return defaultValue;
  },
}));
