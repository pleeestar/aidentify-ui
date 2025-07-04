// path: /stores/useAnalysisStore.ts

'use client';

import { create } from 'zustand';

type Mode = "crop" | "controller" | "auto";

type AnalysisStore = {
  file: File | null;
  scene: string | null;
  mode: Mode;
  sliderValue: number;
  cropRect: { x1: number; y1: number; x2: number; y2: number } | null;
  resultFile: File | null;
  danger: number | null;
  isProcessing: boolean;
  setFile: (f: File | null) => void;
  setScene: (s: string | null) => void;
  setMode: (m: Mode) => void;
  setSliderValue: (v: number) => void;
  setCrop: (r: { x1: number; y1: number; x2: number; y2: number } | null) => void;
  setResult: (file: File | null, danger: number | null) => void;
  setIsProcessing: (isProcessing: boolean) => void;
};

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  file: null,
  scene: null,
  mode: "crop",
  sliderValue: 50,
  cropRect: null,
  resultFile: null,
  danger: null,
  isProcessing: false,
  setFile: (f) => set({ file: f }),
  setScene: (s) => set({ scene: s }),
  setMode: (m) => set({ mode: m }),
  setSliderValue: (v) => set({ sliderValue: v }),
  setCrop: (r) => set({ cropRect: r }),
  setResult: (file, danger) => set({ resultFile: file, danger }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
}));

export const getAnalysisStoreActions = () => ({
  setFile: useAnalysisStore.getState().setFile,
  setScene: useAnalysisStore.getState().setScene,
  setMode: useAnalysisStore.getState().setMode,
  setSliderValue: useAnalysisStore.getState().setSliderValue,
  setCrop: useAnalysisStore.getState().setCrop,
  setResult: useAnalysisStore.getState().setResult,
  setIsProcessing: useAnalysisStore.getState().setIsProcessing,
});