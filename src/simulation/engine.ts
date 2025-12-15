import { ELEMENTS, ELEMENT_BY_ID } from './elements';
import { ElementKey } from './types';

export interface SimulationConfig {
  width: number;
  height: number;
}

export const createGrid = (width: number, height: number) => new Uint8Array(width * height);

const inBounds = (x: number, y: number, width: number, height: number) => x >= 0 && y >= 0 && x < width && y < height;

const setCell = (grid: Uint8Array, width: number, x: number, y: number, value: number) => {
  grid[y * width + x] = value;
};

const getCell = (grid: Uint8Array, width: number, x: number, y: number) => grid[y * width + x];

export const applyBrush = (
  grid: Uint8Array,
  width: number,
  height: number,
  x: number,
  y: number,
  brush: number,
  elementId: number
) => {
  const radius = Math.max(1, brush);
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny, width, height)) continue;
      if (dx * dx + dy * dy <= radius * radius) {
        setCell(grid, width, nx, ny, elementId);
      }
    }
  }
};

const neighbors = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1]
];

interface StepResult {
  next: Uint8Array;
  particles: number;
}

export const stepGrid = (
  grid: Uint8Array,
  buffer: Uint8Array,
  width: number,
  height: number
): StepResult => {
  buffer.fill(0);
  let particles = 0;
  const rand = () => Math.random();

  const tryMove = (fromIdx: number, toX: number, toY: number, id: number) => {
    if (!inBounds(toX, toY, width, height)) return false;
    const targetIdx = toY * width + toX;
    if (buffer[targetIdx] !== 0) return false;
    buffer[targetIdx] = id;
    return true;
  };

  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const id = grid[idx];
      if (id === 0) continue;
      const key = ELEMENT_BY_ID[id] as ElementKey;
      particles++;

      if (buffer[idx] !== 0) continue; // already filled by a falling element above

      switch (key) {
        case 'sand': {
          const belowY = y + 1;
          if (inBounds(x, belowY, width, height) && grid[belowY * width + x] === 0 && buffer[belowY * width + x] === 0) {
            buffer[belowY * width + x] = id;
            continue;
          }
          const dir = rand() > 0.5 ? 1 : -1;
          if (inBounds(x + dir, belowY, width, height) && grid[belowY * width + x + dir] === 0 && buffer[belowY * width + x + dir] === 0) {
            buffer[belowY * width + x + dir] = id;
            continue;
          }
          buffer[idx] = id;
          break;
        }
        case 'water': {
          const below = y + 1;
          if (inBounds(x, below, width, height) && grid[below * width + x] === 0 && buffer[below * width + x] === 0) {
            buffer[below * width + x] = id;
            continue;
          }
          const dir = rand() > 0.5 ? 1 : -1;
          const side = x + dir;
          if (inBounds(side, y, width, height) && grid[y * width + side] === 0 && buffer[y * width + side] === 0) {
            buffer[y * width + side] = id;
            continue;
          }
          const farSide = x + dir * 2;
          if (inBounds(farSide, y, width, height) && grid[y * width + farSide] === 0 && buffer[y * width + farSide] === 0) {
            buffer[y * width + farSide] = id;
            continue;
          }
          buffer[idx] = id;
          break;
        }
        case 'stone':
        case 'soil':
        case 'wood': {
          buffer[idx] = id;
          break;
        }
        case 'plant': {
          let spread = false;
          for (const [dx, dy] of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            if (!inBounds(nx, ny, width, height)) continue;
            const neighborId = grid[ny * width + nx];
            if (neighborId === ELEMENTS.water.id && rand() > 0.7) {
              const tx = x + (rand() > 0.5 ? 1 : -1);
              const ty = y + (rand() > 0.5 ? 1 : -1);
              if (inBounds(tx, ty, width, height) && grid[ty * width + tx] === 0 && buffer[ty * width + tx] === 0) {
                buffer[ty * width + tx] = ELEMENTS.plant.id;
                spread = true;
              }
            }
            if (neighborId === ELEMENTS.fire.id) {
              buffer[idx] = ELEMENTS.fire.id;
              spread = true;
              break;
            }
          }
          if (!spread && buffer[idx] === 0) {
            buffer[idx] = id;
          }
          break;
        }
        case 'seed': {
          const belowY = y + 1;
          if (inBounds(x, belowY, width, height) && grid[belowY * width + x] === 0 && buffer[belowY * width + x] === 0) {
            buffer[belowY * width + x] = id;
            continue;
          }
          const dir = rand() > 0.5 ? 1 : -1;
          if (inBounds(x + dir, belowY, width, height) && grid[belowY * width + x + dir] === 0 && buffer[belowY * width + x + dir] === 0) {
            buffer[belowY * width + x + dir] = id;
            continue;
          }
          let sprout = false;
          for (const [dx, dy] of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            if (!inBounds(nx, ny, width, height)) continue;
            const neighborId = grid[ny * width + nx];
            if (neighborId === ELEMENTS.water.id || neighborId === ELEMENTS.soil.id) {
              sprout = rand() > 0.6;
            }
          }
          buffer[idx] = sprout ? ELEMENTS.plant.id : id;
          break;
        }
        case 'fire': {
          let extinguished = false;
          for (const [dx, dy] of neighbors) {
            const nx = x + dx;
            const ny = y + dy;
            if (!inBounds(nx, ny, width, height)) continue;
            const neighborId = grid[ny * width + nx];
            if (neighborId === ELEMENTS.water.id) {
              extinguished = true;
              break;
            }
            if (
              (neighborId === ELEMENTS.plant.id || neighborId === ELEMENTS.wood.id || neighborId === ELEMENTS.seed.id) &&
              buffer[ny * width + nx] === 0
            ) {
              buffer[ny * width + nx] = ELEMENTS.fire.id;
            }
          }
          if (extinguished || rand() > 0.96) {
            if (extinguished && buffer[idx] === 0) {
              buffer[idx] = ELEMENTS.steam.id;
            }
            continue;
          }
          const upward = y - 1;
          if (inBounds(x, upward, width, height) && grid[upward * width + x] === 0 && buffer[upward * width + x] === 0) {
            buffer[upward * width + x] = id;
          } else {
            buffer[idx] = id;
          }
          break;
        }
        case 'steam': {
          if (rand() > 0.98) {
            continue;
          }
          const upward = y - 1;
          const dir = rand() > 0.5 ? 1 : -1;
          const sideways = x + dir;
          if (inBounds(x, upward, width, height) && grid[upward * width + x] === 0 && buffer[upward * width + x] === 0) {
            buffer[upward * width + x] = id;
          } else if (
            inBounds(sideways, upward, width, height) &&
            grid[upward * width + sideways] === 0 &&
            buffer[upward * width + sideways] === 0
          ) {
            buffer[upward * width + sideways] = id;
          } else {
            buffer[idx] = id;
          }
          break;
        }
        default:
          buffer[idx] = id;
      }
    }
  }

  return { next: buffer, particles };
};

export const serializeGrid = (grid: Uint8Array, width: number, height: number) =>
  JSON.stringify({ width, height, data: Array.from(grid) });

export const hydrateGrid = (
  payload: string,
  currentWidth: number,
  currentHeight: number
): Uint8Array | null => {
  try {
    const parsed = JSON.parse(payload) as { width: number; height: number; data: number[] };
    if (parsed.width !== currentWidth || parsed.height !== currentHeight) return null;
    return Uint8Array.from(parsed.data);
  } catch (err) {
    return null;
  }
};

export const countParticles = (grid: Uint8Array) => grid.reduce((acc, val) => (val === 0 ? acc : acc + 1), 0);
