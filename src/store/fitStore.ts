import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { FitInputs } from '../types/fit'

type SkillLevel = 'beginner' | 'pro'

interface FitStore {
  inputs: FitInputs
  skillLevel: SkillLevel | null
  currentStep: number // 0 = skill selector, 1-4 = wizard steps, 5 = results
  setSkillLevel: (level: SkillLevel) => void
  updatePhysical: (patch: Partial<NonNullable<FitInputs['physical']>>) => void
  updateBody: (patch: Partial<NonNullable<FitInputs['body']>>) => void
  updateFrame: (patch: Partial<NonNullable<FitInputs['frame']>>) => void
  updateFitReport: (patch: Partial<NonNullable<FitInputs['fitReport']>>) => void
  setCurrentStep: (step: number) => void
  resetStore: () => void
}

const initialState = {
  inputs: {} as FitInputs,
  skillLevel: null as SkillLevel | null,
  currentStep: 0,
}

export const useFitStore = create<FitStore>()(
  persist(
    (set) => ({
      ...initialState,
      setSkillLevel: (level) => set({ skillLevel: level }),
      updatePhysical: (patch) =>
        set((s) => ({ inputs: { ...s.inputs, physical: { ...s.inputs.physical, ...patch } } })),
      updateBody: (patch) =>
        set((s) => ({ inputs: { ...s.inputs, body: { ...s.inputs.body, ...patch } } })),
      updateFrame: (patch) =>
        set((s) => ({ inputs: { ...s.inputs, frame: { ...s.inputs.frame, ...patch } } })),
      updateFitReport: (patch) =>
        set((s) => ({ inputs: { ...s.inputs, fitReport: { ...s.inputs.fitReport, ...patch } } })),
      setCurrentStep: (step) => set({ currentStep: step }),
      resetStore: () => {
        useFitStore.persist.clearStorage()
        set(initialState)
      },
    }),
    {
      name: 'zwift-fit-profile',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        inputs: state.inputs,
        skillLevel: state.skillLevel,
        currentStep: state.currentStep,
      }),
    }
  )
)

export type { SkillLevel }
