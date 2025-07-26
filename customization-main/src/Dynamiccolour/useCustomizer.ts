import create from 'zustand'; 

interface Color {
  r: number;
  g: number;
  b: number;
}

interface CustomizerState {
  color: Color;
  setColor: (color: Color) => void;
}

export const useCustomizer = create<CustomizerState>((set) => ({
  color: { r: 1, g: 1, b: 1 }, 
  setColor: (color) => set({ color }),
}));
