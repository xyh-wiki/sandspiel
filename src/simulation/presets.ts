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

const bandFill = (grid: Uint8Array, width: number, y: number, thickness: number, id: number) => {
  fillRect(grid, width, 0, y, width, Math.min(grid.length / width - 1, y + thickness), id);
};

export const PRESETS: Preset[] = [
  {
    id: 'garden-homestead',
    nameKey: 'preset.garden.name',
    descriptionKey: 'preset.garden.desc',
    build: (width, height) => {
      const grid = new Uint8Array(width * height);
      const base = Math.floor(height * 0.72);
      bandFill(grid, width, base, height - base, ELEMENTS.soil.id);
      // neat soil rows
      bandFill(grid, width, base - 4, 2, ELEMENTS.soil.id);
      bandFill(grid, width, base - 10, 2, ELEMENTS.soil.id);
      bandFill(grid, width, base - 16, 2, ELEMENTS.soil.id);
      // water pond
      fillRect(grid, width, Math.floor(width * 0.1), base - 2, Math.floor(width * 0.4), base, ELEMENTS.water.id);
      // wooden fence
      for (let x = Math.floor(width * 0.55); x < Math.floor(width * 0.9); x++) {
        const y = base - 6 + (x % 3 === 0 ? -1 : 0);
        if (y >= 0) grid[y * width + x] = ELEMENTS.wood.id;
      }
      // seeds aligned on rows
      for (let x = Math.floor(width * 0.15); x < Math.floor(width * 0.85); x += 3) {
        const y = base - 5 - (x % 6 === 0 ? 1 : 0);
        grid[y * width + x] = ELEMENTS.seed.id;
      }
      // plants near water edge
      sprinkle(grid, width, Math.floor(width * 0.2), ELEMENTS.plant.id);
      return grid;
    }
  },
  {
    id: 'river-delta',
    nameKey: 'preset.delta.name',
    descriptionKey: 'preset.delta.desc',
    build: (width, height) => {
      const grid = new Uint8Array(width * height);
      const ground = Math.floor(height * 0.78);
      fillRect(grid, width, 0, ground, width, height - 1, ELEMENTS.sand.id);
      // river main channel
      const riverY = ground - 4;
      for (let x = 0; x < width; x++) {
        const offset = Math.floor(5 * Math.sin(x / 7));
        const y = riverY + offset;
        if (y >= 0 && y < height) {
          grid[y * width + x] = ELEMENTS.water.id;
          if (y + 1 < height) grid[(y + 1) * width + x] = ELEMENTS.water.id;
        }
      }
      // sandbanks and greenery
      sprinkle(grid, width, Math.floor(width * 0.25), ELEMENTS.plant.id);
      sprinkle(grid, width, Math.floor(width * 0.15), ELEMENTS.stone.id);
      return grid;
    }
  },
  {
    id: 'desert-dunes',
    nameKey: 'preset.desert.name',
    descriptionKey: 'preset.desert.desc',
    build: (width, height) => {
      const grid = new Uint8Array(width * height);
      const base = Math.floor(height * 0.68);
      for (let x = 0; x < width; x++) {
        const offset = Math.floor(10 * Math.sin(x / 8) + 4 * Math.sin(x / 3));
        for (let y = base + offset; y < height; y++) {
          grid[y * width + x] = ELEMENTS.sand.id;
        }
      }
      sprinkle(grid, width, Math.floor(width * 0.12), ELEMENTS.stone.id);
      sprinkle(grid, width, Math.floor(width * 0.06), ELEMENTS.fire.id);
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
      for (let x = Math.floor(width * 0.2); x < Math.floor(width * 0.8); x += 5) {
        const ventY = ridge - 2 - Math.floor(2 * Math.sin(x / 5));
        grid[ventY * width + x] = ELEMENTS.fire.id;
        grid[(ventY - 1) * width + x] = ELEMENTS.steam.id;
      }
      sprinkle(grid, width, Math.floor(width * 0.06), ELEMENTS.fire.id);
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
      const ground = Math.floor(height * 0.7);
      fillRect(grid, width, 0, ground, width, height - 1, ELEMENTS.soil.id);
      // dense plant canopy
      sprinkle(grid, width, Math.floor(width * 0.7), ELEMENTS.plant.id);
      // moisture pockets
      sprinkle(grid, width, Math.floor(width * 0.35), ELEMENTS.water.id);
      // seeds scattered
      sprinkle(grid, width, Math.floor(width * 0.15), ELEMENTS.seed.id);
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
