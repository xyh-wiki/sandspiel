import { ELEMENTS } from './elements';

export interface Preset {
  id: string;
  nameKey: string;
  descriptionKey: string;
  build: (width: number, height: number) => Uint8Array;
}

const fillRect = (grid: Uint8Array, width: number, x0: number, y0: number, x1: number, y1: number, id: number) => {
  const startX = Math.max(0, Math.min(x0, x1));
  const endX = Math.min(width - 1, Math.max(x0, x1));
  const startY = Math.max(0, Math.min(y0, y1));
  const endY = Math.min(grid.length / width - 1, Math.max(y0, y1));
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      grid[y * width + x] = id;
    }
  }
};

const sprinkle = (grid: Uint8Array, width: number, count: number, id: number) => {
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * (grid.length / width));
    grid[y * width + x] = id;
  }
};

export const PRESETS: Preset[] = [
  {
    id: 'garden-homestead',
    nameKey: 'preset.garden.name',
    descriptionKey: 'preset.garden.desc',
    build: (width, height) => {
      const grid = new Uint8Array(width * height);
      const ground = Math.floor(height * 0.7);
      fillRect(grid, width, 0, ground, width, height - 1, ELEMENTS.soil.id);
      fillRect(grid, width, Math.floor(width * 0.1), ground - 6, Math.floor(width * 0.9), ground - 4, ELEMENTS.soil.id);
      fillRect(grid, width, Math.floor(width * 0.2), ground - 12, Math.floor(width * 0.8), ground - 10, ELEMENTS.soil.id);
      // Canal
      fillRect(grid, width, Math.floor(width * 0.05), ground - 2, Math.floor(width * 0.95), ground, ELEMENTS.water.id);
      // Seeds sprinkled
      sprinkle(grid, width, Math.floor(width * 0.6), ELEMENTS.seed.id);
      return grid;
    }
  },
  {
    id: 'river-delta',
    nameKey: 'preset.delta.name',
    descriptionKey: 'preset.delta.desc',
    build: (width, height) => {
      const grid = new Uint8Array(width * height);
      const ground = Math.floor(height * 0.75);
      fillRect(grid, width, 0, ground, width, height - 1, ELEMENTS.sand.id);
      for (let x = 0; x < width; x++) {
        const y = ground - Math.floor(4 * Math.sin(x / 9));
        if (y < height && y >= 0) grid[y * width + x] = ELEMENTS.water.id;
      }
      sprinkle(grid, width, Math.floor(width * 0.3), ELEMENTS.plant.id);
      return grid;
    }
  },
  {
    id: 'desert-dunes',
    nameKey: 'preset.desert.name',
    descriptionKey: 'preset.desert.desc',
    build: (width, height) => {
      const grid = new Uint8Array(width * height);
      const base = Math.floor(height * 0.65);
      for (let x = 0; x < width; x++) {
        const offset = Math.floor(8 * Math.sin(x / 6));
        for (let y = base + offset; y < height; y++) {
          grid[y * width + x] = ELEMENTS.sand.id;
        }
      }
      sprinkle(grid, width, Math.floor(width * 0.1), ELEMENTS.stone.id);
      sprinkle(grid, width, Math.floor(width * 0.05), ELEMENTS.fire.id);
      return grid;
    }
  },
  {
    id: 'volcanic-ridge',
    nameKey: 'preset.volcano.name',
    descriptionKey: 'preset.volcano.desc',
    build: (width, height) => {
      const grid = new Uint8Array(width * height);
      const ridge = Math.floor(height * 0.6);
      fillRect(grid, width, 0, ridge, width, height - 1, ELEMENTS.stone.id);
      sprinkle(grid, width, Math.floor(width * 0.08), ELEMENTS.fire.id);
      sprinkle(grid, width, Math.floor(width * 0.05), ELEMENTS.steam.id);
      return grid;
    }
  },
  {
    id: 'rainforest-edge',
    nameKey: 'preset.rainforest.name',
    descriptionKey: 'preset.rainforest.desc',
    build: (width, height) => {
      const grid = new Uint8Array(width * height);
      const ground = Math.floor(height * 0.68);
      fillRect(grid, width, 0, ground, width, height - 1, ELEMENTS.soil.id);
      sprinkle(grid, width, Math.floor(width * 0.5), ELEMENTS.plant.id);
      sprinkle(grid, width, Math.floor(width * 0.3), ELEMENTS.water.id);
      sprinkle(grid, width, Math.floor(width * 0.1), ELEMENTS.seed.id);
      return grid;
    }
  },
  {
    id: 'blank-slate',
    nameKey: 'preset.blank.name',
    descriptionKey: 'preset.blank.desc',
    build: (width, height) => new Uint8Array(width * height)
  }
];
