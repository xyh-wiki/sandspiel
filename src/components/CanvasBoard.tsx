import React, { useEffect, useMemo, useRef, useState } from 'react';
import { applyBrush, countParticles, createGrid, hydrateGrid, serializeGrid, stepGrid } from '../simulation/engine';
import { ELEMENTS } from '../simulation/elements';
import { useUIStore } from '../state/uiStore';
import { useI18n } from '../i18n';

const GRID_WIDTH = 176;
const GRID_HEIGHT = 118;
const HISTORY_LIMIT = 8;
const NOISE_RANGE = 8;

const CanvasBoard: React.FC = () => {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gridRef = useRef<Uint8Array>(createGrid(GRID_WIDTH, GRID_HEIGHT));
  const bufferRef = useRef<Uint8Array>(createGrid(GRID_WIDTH, GRID_HEIGHT));
  const historyRef = useRef<Uint8Array[]>([]);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const imageDataRef = useRef<ImageData | null>(null);
  const noiseRef = useRef<Uint8Array>(new Uint8Array(GRID_WIDTH * GRID_HEIGHT));
  const [fps, setFps] = useState(0);
  const [particles, setParticles] = useState(0);
  const [status, setStatus] = useState<string>(t('status.ready'));
  const frameRef = useRef(0);
  const playing = useUIStore((s) => s.playing);
  const togglePlaying = useUIStore((s) => s.togglePlaying);
  const selected = useUIStore((s) => s.selected);
  const setSelected = useUIStore((s) => s.setSelected);
  const brushSize = useUIStore((s) => s.brushSize);
  const setBrushSize = useUIStore((s) => s.setBrushSize);
  const lowPower = useUIStore((s) => s.lowPower);
  const setLowPower = useUIStore((s) => s.setLowPower);
  const [saveMessage, setSaveMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const colorLut = useMemo(() => {
    const maxId = Math.max(...Object.values(ELEMENTS).map((e) => e.id));
    const lut = new Uint8ClampedArray((maxId + 1) * 4);
    Object.values(ELEMENTS).forEach((el) => {
      const idx = el.id * 4;
      lut[idx] = el.color[0];
      lut[idx + 1] = el.color[1];
      lut[idx + 2] = el.color[2];
      lut[idx + 3] = el.id === ELEMENTS.empty.id ? 255 : 255;
    });
    return lut;
  }, []);

  useEffect(() => {
    setStatus(t('status.ready'));
  }, [t]);

  const refreshNoise = () => {
    const noise = noiseRef.current;
    for (let i = 0; i < noise.length; i++) {
      noise[i] = Math.floor(Math.random() * NOISE_RANGE);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scale = lowPower ? 3 : 5;
    canvas.width = GRID_WIDTH * scale;
    canvas.height = GRID_HEIGHT * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!offscreenRef.current) {
      const off = document.createElement('canvas');
      off.width = GRID_WIDTH;
      off.height = GRID_HEIGHT;
      offscreenRef.current = off;
      imageDataRef.current = off.getContext('2d')?.createImageData(GRID_WIDTH, GRID_HEIGHT) ?? null;
    }
    const offscreen = offscreenRef.current;
    const offCtx = offscreen.getContext('2d');
    const imageData = imageDataRef.current;
    if (!offCtx || !imageData) return;
    refreshNoise();

    let last = performance.now();
    let raf = 0;
    let accumulator = 0;
    let localParticles = 0;
    let noiseTick = 0;

    const render = (time: number) => {
      const delta = time - last;
      last = time;
      accumulator += delta;
      const frameDuration = lowPower ? 1000 / 28 : 1000 / 58;
      const shouldStep = accumulator >= frameDuration;

      if (playing && shouldStep) {
        accumulator = 0;
        const original = gridRef.current;
        const buffer = bufferRef.current;
        const { next, particles: p } = stepGrid(original, buffer, GRID_WIDTH, GRID_HEIGHT);
        localParticles = p;
        gridRef.current = next;
        bufferRef.current = original; // swap buffers for reuse
      }

      if (noiseTick++ % 10 === 0) refreshNoise();
      drawGrid(ctx, offCtx, imageData);
      frameRef.current += 1;
      raf = requestAnimationFrame(render);
      setParticles(localParticles || countParticles(gridRef.current));
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [playing, lowPower, colorLut]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFps(frameRef.current);
      frameRef.current = 0;
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const drawGrid = (
    viewCtx: CanvasRenderingContext2D,
    offCtx: CanvasRenderingContext2D,
    imageData: ImageData
  ) => {
    const data = imageData.data;
    const grid = gridRef.current;
    const lut = colorLut;
    const noise = noiseRef.current;
    for (let i = 0; i < grid.length; i++) {
      const id = grid[i];
      const lutIdx = id * 4;
      const di = i * 4;
      const n = noise[i] - NOISE_RANGE / 2;
      data[di] = Math.min(255, Math.max(0, lut[lutIdx] + n));
      data[di + 1] = Math.min(255, Math.max(0, lut[lutIdx + 1] + n));
      data[di + 2] = Math.min(255, Math.max(0, lut[lutIdx + 2] + n));
      data[di + 3] = lut[lutIdx + 3];
    }
    offCtx.putImageData(imageData, 0, 0);
    viewCtx.clearRect(0, 0, viewCtx.canvas.width, viewCtx.canvas.height);
    viewCtx.imageSmoothingEnabled = false; // keep cells crisp while retaining color variation
    viewCtx.drawImage(offCtx.canvas, 0, 0, viewCtx.canvas.width, viewCtx.canvas.height);
  };

  const pushHistory = () => {
    historyRef.current.unshift(new Uint8Array(gridRef.current));
    if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.pop();
  };

  const handlePointer = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = GRID_WIDTH / rect.width;
    const scaleY = GRID_HEIGHT / rect.height;
    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);
    if (x < 0 || y < 0 || x >= GRID_WIDTH || y >= GRID_HEIGHT) return;
    const elementId = selected === 'empty' ? ELEMENTS.empty.id : ELEMENTS[selected].id;
    applyBrush(gridRef.current, GRID_WIDTH, GRID_HEIGHT, x, y, brushSize, elementId);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let drawing = false;

    const onPointerDown = (e: PointerEvent) => {
      drawing = true;
      pushHistory();
      handlePointer(e.clientX, e.clientY);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!drawing) return;
      handlePointer(e.clientX, e.clientY);
    };
    const endDrawing = () => {
      drawing = false;
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endDrawing);
    window.addEventListener('pointercancel', endDrawing);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrawing);
      window.removeEventListener('pointercancel', endDrawing);
    };
  }, [brushSize, selected]);

  const resetGrid = () => {
    pushHistory();
    gridRef.current.fill(0);
    setStatus(t('status.updated'));
  };

  const undo = () => {
    const prev = historyRef.current.shift();
    if (prev) {
      gridRef.current = prev;
      setStatus(t('controls.undo'));
    }
  };

  const randomFill = () => {
    pushHistory();
    const grid = gridRef.current;
    for (let i = 0; i < grid.length; i++) {
      const roll = Math.random();
      if (roll > 0.92) grid[i] = ELEMENTS.sand.id;
      else if (roll > 0.88) grid[i] = ELEMENTS.water.id;
      else if (roll > 0.86) grid[i] = ELEMENTS.stone.id;
      else if (roll > 0.845) grid[i] = ELEMENTS.plant.id;
      else if (roll > 0.84) grid[i] = ELEMENTS.fire.id;
    }
    setStatus(t('status.updated'));
  };

  const saveSlot = () => {
    try {
      const serialized = serializeGrid(gridRef.current, GRID_WIDTH, GRID_HEIGHT);
      localStorage.setItem('sandspiel_save', serialized);
      setSaveMessage(t('controls.saveNotice'));
    } catch (err) {
      setSaveMessage(t('controls.saveError'));
    }
  };

  const loadSlot = () => {
    const payload = localStorage.getItem('sandspiel_save');
    if (!payload) {
      setSaveMessage(t('save.empty'));
      return;
    }
    const grid = hydrateGrid(payload, GRID_WIDTH, GRID_HEIGHT);
    if (grid) {
      pushHistory();
      gridRef.current = grid;
      setSaveMessage(t('controls.imported'));
    } else {
      setSaveMessage(t('controls.loadError'));
    }
  };

  const downloadJSON = () => {
    try {
      const serialized = serializeGrid(gridRef.current, GRID_WIDTH, GRID_HEIGHT);
      const blob = new Blob([serialized], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sandspiel-scene.json';
      a.click();
      URL.revokeObjectURL(url);
      setStatus(t('controls.saveLocal'));
    } catch (err) {
      setStatus(t('controls.saveError'));
    }
  };

  const importJSON = (file?: File) => {
    const targetFile = file ?? fileInputRef.current?.files?.[0];
    if (!targetFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result?.toString() ?? '';
      const grid = hydrateGrid(text, GRID_WIDTH, GRID_HEIGHT);
      if (grid) {
        pushHistory();
        gridRef.current = grid;
        setStatus(t('controls.imported'));
      } else {
        setStatus(t('controls.importFailed'));
      }
    };
    reader.onerror = () => setStatus(t('controls.importFailed'));
    reader.readAsText(targetFile);
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'sandspiel.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setStatus(t('controls.exported'));
  };

  const stepOnce = () => {
    const original = gridRef.current;
    const buffer = bufferRef.current;
    const { next, particles: p } = stepGrid(original, buffer, GRID_WIDTH, GRID_HEIGHT);
    gridRef.current = next;
    bufferRef.current = original;
    setParticles(p);
    setStatus(t('status.updated'));
  };

  return (
    <section id="simulator" className="section">
      <div className="container card" style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 className="section-title">{t('workspace.title')}</h2>
            <p className="lead">{t('workspace.description')}</p>
          </div>
          <div className="badge">{t('controls.recommendation')}</div>
        </div>
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: '1fr',
            alignItems: 'start'
          }}
        >
          <div className="card" style={{ padding: '0.5rem' }}>
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                borderRadius: 12,
                border: '1px solid var(--border)',
                touchAction: 'none',
                background: 'radial-gradient(circle at 12% 24%, rgba(34, 197, 94, 0.12), transparent 38%), radial-gradient(circle at 86% 30%, rgba(14, 165, 233, 0.12), transparent 42%), #0b1220',
                boxShadow: '0 15px 40px rgba(0,0,0,0.35)'
              }}
            />
          </div>
          <div className="card" style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={togglePlaying}>{playing ? t('controls.pause') : t('controls.play')}</button>
              <button className="btn" onClick={stepOnce}>{t('controls.step')}</button>
              <button className="btn" onClick={resetGrid}>{t('controls.reset')}</button>
              <button className="btn" onClick={undo}>{t('controls.undo')}</button>
              <button className="btn" onClick={randomFill}>{t('controls.random')}</button>
              <button className="btn" onClick={() => { pushHistory(); gridRef.current.fill(0); }}>{t('controls.clear')}</button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['sand', 'water', 'stone', 'plant', 'fire', 'empty'] as const).map((key) => (
                <button
                  key={key}
                  className="btn"
                  style={{ borderColor: selected === key ? 'var(--accent)' : 'var(--border)' }}
                  onClick={() => setSelected(key)}
                >
                  {t(`palette.${key === 'empty' ? 'eraser' : key}` as const)}
                </button>
              ))}
              <label className="badge" style={{ gap: '0.5rem' }}>
                {t('controls.brush')}
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn" onClick={saveSlot}>{t('controls.saveLocal')}</button>
              <button className="btn" onClick={loadSlot}>{t('controls.loadLocal')}</button>
              <button className="btn" onClick={downloadJSON}>{t('controls.saveFile')}</button>
              <button className="btn" onClick={() => fileInputRef.current?.click()}>{t('controls.loadFile')}</button>
              <button className="btn" onClick={exportPng}>{t('controls.exportPng')}</button>
              <button className="btn" onClick={() => setLowPower(!lowPower)}>
                {t('controls.lowPower')}: {lowPower ? t('stats.lowPowerOn') : t('stats.lowPowerOff')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={(e) => importJSON(e.target.files?.[0])}
              />
            </div>
            <div className="badge" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span>
                {t('stats.fps')}: {fps}
              </span>
              <span>
                {t('stats.particles')}: {particles}
              </span>
              <span>
                {t('stats.grid')}: {GRID_WIDTH}x{GRID_HEIGHT}
              </span>
              <span>{status}</span>
            </div>
            {saveMessage && <div className="badge">{saveMessage}</div>}
            <div className="badge">{t('status.lowPowerHint')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CanvasBoard;
