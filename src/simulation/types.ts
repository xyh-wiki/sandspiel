export type ElementKey =
  | 'empty'
  | 'sand'
  | 'water'
  | 'stone'
  | 'plant'
  | 'fire'
  | 'soil'
  | 'wood'
  | 'seed'
  | 'steam';

export interface ElementConfig {
  id: number;
  name: string;
  color: [number, number, number];
  density: number;
  fluidity?: number;
  isStatic?: boolean;
  flammable?: boolean;
  drift?: number;
  coolDown?: number;
}
