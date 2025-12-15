import { ElementConfig, ElementKey } from './types';

export const ELEMENTS: Record<ElementKey, ElementConfig> = {
  empty: {
    id: 0,
    name: 'Empty',
    color: [12, 18, 30],
    density: 0,
    isStatic: true
  },
  sand: {
    id: 1,
    name: 'Sand',
    color: [228, 181, 92],
    density: 4
  },
  water: {
    id: 2,
    name: 'Water',
    color: [64, 156, 255],
    density: 1,
    fluidity: 2
  },
  stone: {
    id: 3,
    name: 'Stone',
    color: [90, 105, 120],
    density: 8,
    isStatic: true
  },
  plant: {
    id: 4,
    name: 'Plant',
    color: [96, 168, 92],
    density: 3,
    flammable: true
  },
  fire: {
    id: 5,
    name: 'Fire',
    color: [255, 112, 64],
    density: 0,
    drift: -1,
    coolDown: 24
  }
};

export const ELEMENT_BY_ID: Record<number, ElementKey> = Object.entries(ELEMENTS).reduce(
  (acc, [key, config]) => {
    acc[config.id] = key as ElementKey;
    return acc;
  },
  {} as Record<number, ElementKey>
);

export const PALETTE: ElementKey[] = ['sand', 'water', 'stone', 'plant', 'fire', 'empty'];
