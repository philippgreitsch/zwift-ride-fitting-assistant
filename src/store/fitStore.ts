import { create } from 'zustand'
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
}

export const useFitStore = create<FitStore>()((set) => ({
  inputs: {},
  skillLevel: null,
  currentStep: 0,
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
}))

export type { SkillLevel }
