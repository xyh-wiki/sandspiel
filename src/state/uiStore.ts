import { create } from 'zustand';
import { ElementKey } from '../simulation/types';

export type DrawElement = Exclude<ElementKey, 'empty'> | 'empty';

interface UIState {
  selected: DrawElement;
  brushSize: number;
  playing: boolean;
  lowPower: boolean;
  setSelected: (element: DrawElement) => void;
  setBrushSize: (size: number) => void;
  togglePlaying: () => void;
  setPlaying: (state: boolean) => void;
  setLowPower: (state: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  selected: 'sand',
  brushSize: 3,
  playing: true,
  lowPower: false,
  setSelected: (selected) => set({ selected }),
  setBrushSize: (brushSize) => set({ brushSize: Math.max(1, Math.min(brushSize, 20)) }),
  togglePlaying: () => set((state) => ({ playing: !state.playing })),
  setPlaying: (state) => set({ playing: state }),
  setLowPower: (state) => set({ lowPower: state })
}));
