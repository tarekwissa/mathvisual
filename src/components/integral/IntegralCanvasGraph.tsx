import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { RiemannRectangle } from '../../utils/mathParser';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Move, Play } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface IntegralCanvasGraphProps {
  fn: (x: number) => number;
  secondFn?: (x: number) => number;
  a: number;
  b: number;
  onUpdateBounds: (newA: number, newB: number) => void;
  areaType: 'signed' | 'absolute';
  riemannType: 'left' | 'right' | 'midpoint' | 'trapezoid' | 'none';
  riemannRectangles?: RiemannRectangle[];
  showAntiderivative?: boolean;
  antiderivativeFn?: (x: number) => number;
  xAccumulator?: number;
  onUpdateAccumulator?: (newX: number) => void;
  mode: 'single' | 'between' | 'riemann' | 'hdi_accumulator';
}

export const IntegralCanvasGraph: React.FC<IntegralCanvasGraphProps> = ({
  fn,
  secondFn,
  a,
  b,
  onUpdateBounds,
  areaType,
  riemannType,
  riemannRectangles = [],
  showAntiderivative = false,
  antiderivativeFn,
  xAccumulator,
  onUpdateAccumulator,
  mode
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Math viewport coordinates
  const [xMin, setXMin] = useState<number>(-4);
  const [xMax, setXMax] = useState<number>(4);
  const [yMin, setYMin] = useState<number>(-3);
  const [yMax, setYMax] = useState<number>(6);

  // Drawing Animation (Point travelling along graph)
  const [drawProgress, setDrawProgress] = useState<number>(1); // 0 to 1
  const [isDrawingAnim, setIsDrawingAnim] = useState<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  // Dragging / Pan state
  const [draggingMode, setDraggingMode] = useState<'a' | 'b' | 'acc' | 'pan' | null>(null);
  const [panStart, setPanStart] = useState<{ mx: number; my: number; xMin: number; xMax: number; yMin: number; yMax: number } | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);

  // Start animated point-draw effect
  const startDrawingAnimation = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsDrawingAnim(true);
    setDrawProgress(0);

    const startTime = performance.now();
    const duration = 1200; // 1.2s smooth draw

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      setDrawProgress(progress);

      // Sound sweep
      if (Math.random() < 0.25) {
        sounds.playGraphTraceSound(progress);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsDrawingAnim(false);
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  // Trigger draw animation when function changes
  useEffect(() => {
    startDrawingAnimation();
  }, [fn, startDrawingAnimation]);

  // Auto-fit view to current integration bounds
  const handleResetView = useCallback(() => {
    sounds.playPop();
    const minBound = Math.min(a, b);
    const maxBound = Math.max(a, b);
    const span = Math.max(2, maxBound - minBound);
    const margin = span * 0.5;
    
    let minVal = 0;
    let maxVal = 0;
    const testPoints = 40;
    for (let i = 0; i <= testPoints; i++) {
      const curX = (minBound - margin) + (i / testPoints) * (span + 2 * margin);
      const val = fn(curX);
      if (isFinite(val) && !isNaN(val)) {
        minVal = Math.min(minVal, val);
        maxVal = Math.max(maxVal, val);
      }
    }

    const ySpan = Math.max(3, maxVal - minVal);
    setXMin(parseFloat((minBound - margin).toFixed(1)));
    setXMax(parseFloat((maxBound + margin).toFixed(1)));
    setYMin(parseFloat((Math.min(-1, minVal - ySpan * 0.25)).toFixed(1)));
    setYMax(parseFloat((Math.max(2, maxVal + ySpan * 0.25)).toFixed(1)));
  }, [a, b, fn]);

  // Coordinate transforms
  const mathToCanvas = useCallback(
    (mx: number, my: number, width: number, height: number) => {
      const cx = ((mx - xMin) / (xMax - xMin)) * width;
      const cy = height - ((my - yMin) / (yMax - yMin)) * height;
      return { cx, cy };
    },
    [xMin, xMax, yMin, yMax]
  );

  const canvasToMath = useCallback(
    (cx: number, cy: number, width: number, height: number) => {
      const mx = xMin + (cx / width) * (xMax - xMin);
      const my = yMin + ((height - cy) / height) * (yMax - yMin);
      return { mx, my };
    },
    [xMin, xMax, yMin, yMax]
  );

  // Zoom Handler
  const handleZoom = (zoomFactor: number, centerMathX?: number, centerMathY?: number) => {
    sounds.playPop();
    const currentCenterX = centerMathX !== undefined ? centerMathX : (xMin + xMax) / 2;
    const currentCenterY = centerMathY !== undefined ? centerMathY : (yMin + yMax) / 2;

    const currentSpanX = xMax - xMin;
    const currentSpanY = yMax - yMin;

    const newSpanX = currentSpanX * zoomFactor;
    const newSpanY = currentSpanY * zoomFactor;

    if (newSpanX < 0.5 || newSpanX > 60) return;

    const ratioLeft = (currentCenterX - xMin) / currentSpanX;
    const ratioBottom = (currentCenterY - yMin) / currentSpanY;

    setXMin(parseFloat((currentCenterX - ratioLeft * newSpanX).toFixed(2)));
    setXMax(parseFloat((currentCenterX + (1 - ratioLeft) * newSpanX).toFixed(2)));
    setYMin(parseFloat((currentCenterY - ratioBottom * newSpanY).toFixed(2)));
    setYMax(parseFloat((currentCenterY + (1 - ratioBottom) * newSpanY).toFixed(2)));
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const mathPt = canvasToMath(clickX, clickY, rect.width, rect.height);

    const zoomFactor = e.deltaY < 0 ? 0.85 : 1.18;
    handleZoom(zoomFactor, mathPt.mx, mathPt.my);
  };

  const toggleFullscreen = () => {
    sounds.playPop();
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Main Canvas Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 1. Grid
    const spanX = xMax - xMin;
    const spanY = yMax - yMin;

    let xStep = 1;
    if (spanX > 25) xStep = 5;
    else if (spanX > 12) xStep = 2;
    else if (spanX < 3) xStep = 0.2;
    else if (spanX < 6) xStep = 0.5;

    let yStep = 1;
    if (spanY > 25) yStep = 5;
    else if (spanY > 12) yStep = 2;
    else if (spanY < 3) yStep = 0.2;
    else if (spanY < 6) yStep = 0.5;

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';

    const startGridX = Math.floor(xMin / xStep) * xStep;
    for (let x = startGridX; x <= xMax; x += xStep) {
      const { cx } = mathToCanvas(x, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      if (Math.abs(x) > 0.01) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Fira Code, monospace';
        const { cy: originY } = mathToCanvas(0, 0, width, height);
        const textY = Math.min(Math.max(originY + 14, 15), height - 8);
        ctx.fillText(x.toFixed(xStep < 1 ? 1 : 0), cx - 6, textY);
      }
    }

    const startGridY = Math.floor(yMin / yStep) * yStep;
    for (let y = startGridY; y <= yMax; y += yStep) {
      const { cy } = mathToCanvas(0, y, width, height);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      if (Math.abs(y) > 0.01) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Fira Code, monospace';
        const { cx: originX } = mathToCanvas(0, 0, width, height);
        const textX = Math.min(Math.max(originX + 6, 6), width - 28);
        ctx.fillText(y.toFixed(yStep < 1 ? 1 : 0), textX, cy + 4);
      }
    }

    // 2. Axes
    const origin = mathToCanvas(0, 0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#94a3b8';

    ctx.beginPath();
    ctx.moveTo(0, origin.cy);
    ctx.lineTo(width, origin.cy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(origin.cx, 0);
    ctx.lineTo(origin.cx, height);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px Outfit, sans-serif';
    ctx.fillText('x', width - 15, Math.min(Math.max(origin.cy - 8, 15), height - 8));
    ctx.fillText('y', Math.min(Math.max(origin.cx + 8, 8), width - 20), 15);

    // 3. Shaded Area Under Curves
    const lower = Math.min(a, b);
    const upper = Math.max(a, b);

    if (mode !== 'riemann' || riemannType === 'none') {
      const samplePoints = 400;
      const step = (upper - lower) / samplePoints;

      if (mode === 'between' && secondFn) {
        ctx.beginPath();
        const startPt = mathToCanvas(lower, fn(lower), width, height);
        ctx.moveTo(startPt.cx, startPt.cy);

        for (let i = 1; i <= samplePoints; i++) {
          const x = lower + i * step;
          const pt = mathToCanvas(x, fn(x), width, height);
          ctx.lineTo(pt.cx, pt.cy);
        }

        for (let i = samplePoints; i >= 0; i--) {
          const x = lower + i * step;
          const pt = mathToCanvas(x, secondFn(x), width, height);
          ctx.lineTo(pt.cx, pt.cy);
        }
        ctx.closePath();

        ctx.fillStyle = 'rgba(99, 102, 241, 0.35)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        for (let i = 0; i < samplePoints; i++) {
          const x1 = lower + i * step;
          const x2 = lower + (i + 1) * step;
          const y1 = fn(x1);
          const y2 = fn(x2);

          const p1 = mathToCanvas(x1, y1, width, height);
          const p2 = mathToCanvas(x2, y2, width, height);
          const base1 = mathToCanvas(x1, 0, width, height);
          const base2 = mathToCanvas(x2, 0, width, height);

          ctx.beginPath();
          ctx.moveTo(base1.cx, base1.cy);
          ctx.lineTo(p1.cx, p1.cy);
          ctx.lineTo(p2.cx, p2.cy);
          ctx.lineTo(base2.cx, base2.cy);
          ctx.closePath();

          const isPositive = (y1 + y2) / 2 >= 0;
          if (areaType === 'signed') {
            ctx.fillStyle = isPositive ? 'rgba(16, 185, 129, 0.38)' : 'rgba(244, 63, 94, 0.38)';
          } else {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.38)';
          }
          ctx.fill();
        }
      }
    }

    // 4. Riemann Rectangles
    if (mode === 'riemann' && riemannType !== 'none' && riemannRectangles.length > 0) {
      riemannRectangles.forEach((rectItem) => {
        const pTopLeft = mathToCanvas(rectItem.x, Math.max(0, rectItem.height), width, height);
        const pBottomRight = mathToCanvas(rectItem.x + rectItem.width, Math.min(0, rectItem.height), width, height);

        const rectW = Math.abs(pBottomRight.cx - pTopLeft.cx);
        const rectH = Math.abs(pBottomRight.cy - pTopLeft.cy);

        ctx.fillStyle = rectItem.height >= 0 ? 'rgba(59, 130, 246, 0.45)' : 'rgba(239, 68, 68, 0.45)';
        ctx.fillRect(pTopLeft.cx, Math.min(pTopLeft.cy, pBottomRight.cy), rectW, rectH);

        ctx.strokeStyle = rectItem.height >= 0 ? '#60a5fa' : '#f87171';
        ctx.lineWidth = 1;
        ctx.strokeRect(pTopLeft.cx, Math.min(pTopLeft.cy, pBottomRight.cy), rectW, rectH);
      });
    }

    // 5. Draw Primary Function f(x) with Live Drawing Tracer Progress
    ctx.beginPath();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#38bdf8'; // Sky blue neon

    const plotSteps = width * 1.5;
    const currentMaxStep = Math.floor(plotSteps * drawProgress);
    const dx = (xMax - xMin) / plotSteps;
    let started = false;
    let tracerPt: { cx: number; cy: number; mx: number; my: number } | null = null;

    for (let i = 0; i <= currentMaxStep; i++) {
      const x = xMin + i * dx;
      const y = fn(x);

      if (isFinite(y) && !isNaN(y)) {
        const pt = mathToCanvas(x, y, width, height);
        if (!started) {
          ctx.moveTo(pt.cx, pt.cy);
          started = true;
        } else {
          ctx.lineTo(pt.cx, pt.cy);
        }
        if (i === currentMaxStep) {
          tracerPt = { cx: pt.cx, cy: pt.cy, mx: x, my: y };
        }
      }
    }
    ctx.stroke();

    // Draw the Glowing Traveling Point / Tracer Particle
    if (tracerPt && (drawProgress < 1 || isDrawingAnim)) {
      // Glow pulse
      const glowGrad = ctx.createRadialGradient(tracerPt.cx, tracerPt.cy, 2, tracerPt.cx, tracerPt.cy, 18);
      glowGrad.addColorStop(0, 'rgba(56, 189, 248, 1)');
      glowGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.6)');
      glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.beginPath();
      ctx.arc(tracerPt.cx, tracerPt.cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Sharp center core
      ctx.beginPath();
      ctx.arc(tracerPt.cx, tracerPt.cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }

    // 6. Draw Second Function g(x) if present
    if (secondFn && mode === 'between') {
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#f43f5e'; // Rose

      started = false;
      for (let i = 0; i <= plotSteps; i++) {
        const x = xMin + i * dx;
        const y = secondFn(x);

        if (isFinite(y) && !isNaN(y)) {
          const pt = mathToCanvas(x, y, width, height);
          if (!started) {
            ctx.moveTo(pt.cx, pt.cy);
            started = true;
          } else {
            ctx.lineTo(pt.cx, pt.cy);
          }
        }
      }
      ctx.stroke();
    }

    // 7. Draw Antiderivative F(x)
    if (showAntiderivative && antiderivativeFn) {
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = '#c084fc';

      started = false;
      for (let i = 0; i <= plotSteps; i++) {
        const x = xMin + i * dx;
        const y = antiderivativeFn(x);

        if (isFinite(y) && !isNaN(y)) {
          const pt = mathToCanvas(x, y, width, height);
          if (!started) {
            ctx.moveTo(pt.cx, pt.cy);
            started = true;
          } else {
            ctx.lineTo(pt.cx, pt.cy);
          }
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 8. Integration Boundary Markers (a and b)
    const drawBoundaryLine = (val: number, label: string, color: string) => {
      const ptX = mathToCanvas(val, 0, width, height).cx;

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = color;
      ctx.setLineDash([5, 5]);
      ctx.moveTo(ptX, 0);
      ctx.lineTo(ptX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(ptX - 22, 10, 44, 24, 7);
      ctx.fill();

      ctx.fillStyle = '#090d16';
      ctx.font = 'bold 12px Fira Code, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${label}=${val.toFixed(1)}`, ptX, 26);

      ctx.beginPath();
      ctx.arc(ptX, origin.cy, 7, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    drawBoundaryLine(a, 'a', '#34d399');
    drawBoundaryLine(b, 'b', '#fbbf24');

    // 9. Live Accumulator marker for HDI
    if (mode === 'hdi_accumulator' && xAccumulator !== undefined) {
      const accX = mathToCanvas(xAccumulator, 0, width, height).cx;
      const accY = mathToCanvas(xAccumulator, fn(xAccumulator), width, height).cy;

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#e879f9';
      ctx.moveTo(accX, 0);
      ctx.lineTo(accX, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(accX, accY, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#e879f9';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 10. Hover tooltip indicator
    if (hoveredPoint) {
      ctx.beginPath();
      ctx.arc(hoveredPoint.canvasX, hoveredPoint.canvasY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }, [
    fn,
    secondFn,
    a,
    b,
    xMin,
    xMax,
    yMin,
    yMax,
    mathToCanvas,
    areaType,
    riemannType,
    riemannRectangles,
    showAntiderivative,
    antiderivativeFn,
    xAccumulator,
    hoveredPoint,
    mode,
    drawProgress,
    isDrawingAnim
  ]);

  // Handle Dragging bounds or Pan View
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const ptA = mathToCanvas(a, 0, width, height).cx;
    const ptB = mathToCanvas(b, 0, width, height).cx;

    if (Math.abs(clickX - ptA) < 24) {
      setDraggingMode('a');
      sounds.playPop();
    } else if (Math.abs(clickX - ptB) < 24) {
      setDraggingMode('b');
      sounds.playPop();
    } else if (mode === 'hdi_accumulator' && xAccumulator !== undefined) {
      const ptAcc = mathToCanvas(xAccumulator, 0, width, height).cx;
      if (Math.abs(clickX - ptAcc) < 24) {
        setDraggingMode('acc');
      }
    } else {
      setDraggingMode('pan');
      const mathPt = canvasToMath(clickX, clickY, width, height);
      setPanStart({
        mx: mathPt.mx,
        my: mathPt.my,
        xMin,
        xMax,
        yMin,
        yMax
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const mathPt = canvasToMath(mouseX, mouseY, width, height);

    if (draggingMode === 'a') {
      const newA = parseFloat(mathPt.mx.toFixed(1));
      onUpdateBounds(newA, b);
    } else if (draggingMode === 'b') {
      const newB = parseFloat(mathPt.mx.toFixed(1));
      onUpdateBounds(a, newB);
    } else if (draggingMode === 'acc' && onUpdateAccumulator) {
      const newAcc = parseFloat(mathPt.mx.toFixed(2));
      onUpdateAccumulator(newAcc);
    } else if (draggingMode === 'pan' && panStart) {
      const deltaX = mathPt.mx - panStart.mx;
      const deltaY = mathPt.my - panStart.my;
      setXMin(parseFloat((panStart.xMin - deltaX).toFixed(2)));
      setXMax(parseFloat((panStart.xMax - deltaX).toFixed(2)));
      setYMin(parseFloat((panStart.yMin - deltaY).toFixed(2)));
      setYMax(parseFloat((panStart.yMax - deltaY).toFixed(2)));
    } else {
      const curY = fn(mathPt.mx);
      if (isFinite(curY) && !isNaN(curY)) {
        const pt = mathToCanvas(mathPt.mx, curY, width, height);
        setHoveredPoint({ x: mathPt.mx, y: curY, canvasX: pt.cx, canvasY: pt.cy });
      } else {
        setHoveredPoint(null);
      }
    }
  };

  const handleMouseUp = () => {
    setDraggingMode(null);
    setPanStart(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none h-screen w-screen border-none'
          : 'aspect-[16/10] sm:aspect-[16/9]'
      }`}
    >
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setDraggingMode(null);
          setPanStart(null);
          setHoveredPoint(null);
        }}
        className={`w-full h-full touch-none select-none ${
          draggingMode === 'pan' ? 'cursor-grabbing' : 'cursor-crosshair'
        }`}
      />

      {/* Floating View Controls Toolbar (Re-Draw, Zoom, Fullscreen, Reset) */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-xl z-20">
        <button
          onClick={startDrawingAnimation}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-600 hover:text-white transition-all shadow-sm"
          title="Graph mit Leuchtpunkt neu zeichnen"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Zeichnen</span>
        </button>
        <div className="w-[1px] h-5 bg-slate-700 mx-1" />
        <button
          onClick={() => handleZoom(0.8)}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          title="Vergrößern (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(1.25)}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          title="Verkleinern (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          title="Ansicht zurücksetzen (Auto-Fit)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-5 bg-slate-700 mx-1" />
        <button
          onClick={toggleFullscreen}
          className={`p-2 rounded-xl transition-all ${
            isFullscreen
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
          title={isFullscreen ? 'Vollbild beenden' : 'Vollbildmodus (Fullscreen)'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Floating Info Tooltip */}
      {hoveredPoint && (
        <div
          className="absolute pointer-events-none bg-slate-900/95 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-mono shadow-2xl backdrop-blur z-10"
          style={{
            left: Math.min(window.innerWidth > 640 ? hoveredPoint.canvasX + 14 : 10, window.innerWidth - 180),
            top: Math.max(10, hoveredPoint.canvasY - 40)
          }}
        >
          <span className="text-cyan-400 font-bold">x</span> = {hoveredPoint.x.toFixed(2)} │ <span className="text-emerald-400 font-bold">f(x)</span> = {hoveredPoint.y.toFixed(2)}
        </div>
      )}

      {/* Control hints overlay */}
      <div className="absolute bottom-3 left-4 text-[11px] text-slate-400 font-mono flex flex-wrap items-center gap-3 pointer-events-none bg-slate-950/85 backdrop-blur px-3.5 py-1.5 rounded-xl border border-slate-800/90 shadow-lg">
        <span className="flex items-center gap-1">
          <Move className="w-3.5 h-3.5 text-indigo-400" />
          Klicken & Ziehen zum Verschieben
        </span>
        <span>•</span>
        <span>Mausrad / Buttons zum Zoomen</span>
        <span>•</span>
        <span>🟢 [a] & 🟡 [b] ziehen für Grenzen</span>
      </div>
    </div>
  );
};
