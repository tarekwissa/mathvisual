import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { RiemannRectangle, KeyPoint } from '../../utils/mathParser';
import { findKeyPointsInView } from '../../utils/mathParser';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Move,
  Play,
  Gauge,
  Scale,
  ChevronDown,
  Magnet,
  Crosshair
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export interface CompiledFunctionItem {
  id: string;
  name: string;
  expression: string;
  color: string;
  isVisible: boolean;
  fn: (x: number) => number;
  isValid: boolean;
}

export type AxisRatio = '1:1' | '1:2' | '1:3' | '1:5' | '2:1' | '3:1' | 'free';

interface IntegralCanvasGraphProps {
  functionsList: CompiledFunctionItem[];
  primaryFunctionId: string;
  secondFunctionId?: string;
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
  signedIntegral?: number;
  absoluteArea?: number;
  areaBetween?: number;
  riemannSum?: number;
  rootsInInterval?: number[];
}

/**
 * GeoGebra-style dynamic step calculation for clean grid ticks
 */
function getDynamicStep(span: number): number {
  const rawStep = Math.max(0.001, span / 8);
  const power = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const fraction = rawStep / power;
  if (fraction < 1.5) return 1 * power;
  if (fraction < 3.5) return 2 * power;
  if (fraction < 7.5) return 5 * power;
  return 10 * power;
}

function formatTickNumber(val: number, step: number): string {
  if (Math.abs(val) < 1e-6) return '0';
  const decimals = step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0;
  return val.toFixed(decimals);
}

export const IntegralCanvasGraph: React.FC<IntegralCanvasGraphProps> = ({
  functionsList,
  primaryFunctionId,
  secondFunctionId,
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
  mode,
  signedIntegral,
  absoluteArea,
  areaBetween,
  riemannSum,
  rootsInInterval = []
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Math viewport coordinates
  const [xMin, setXMin] = useState<number>(-5);
  const [xMax, setXMax] = useState<number>(5);
  const [yMin, setYMin] = useState<number>(-2.8);
  const [yMax, setYMax] = useState<number>(2.8);

  // GeoGebra-Style Axis Ratio State
  const [axisRatio, setAxisRatio] = useState<AxisRatio>('1:1');

  // Magnetic Snapping to Roots & Intersections Toggle
  const [isMagneticSnap, setIsMagneticSnap] = useState<boolean>(true);
  const [activeSnapInfo, setActiveSnapInfo] = useState<{ x: number; label: string; type: 'root' | 'intersection'; color: string } | null>(null);

  // Show/Hide Mouse Coordinates Toggle
  const [showCoordinates, setShowCoordinates] = useState<boolean>(true);

  // Hover zone: 'x' (hovering near x-axis), 'y' (hovering near y-axis), or null
  const [hoveredAxisZone, setHoveredAxisZone] = useState<'x' | 'y' | null>(null);

  // Drawing Animation
  const [drawProgress, setDrawProgress] = useState<number>(1); // 0 to 1
  const [isDrawingAnim, setIsDrawingAnim] = useState<boolean>(false);
  const [drawSpeed, setDrawSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const animFrameRef = useRef<number | null>(null);

  // Dragging / Pan state
  const [draggingMode, setDraggingMode] = useState<'a' | 'b' | 'acc' | 'pan' | null>(null);
  const [panStart, setPanStart] = useState<{ mx: number; my: number; xMin: number; xMax: number; yMin: number; yMax: number } | null>(null);
  const [hoveredX, setHoveredX] = useState<{ mathX: number; canvasX: number; canvasY: number } | null>(null);

  const primaryItem = functionsList.find((f) => f.id === primaryFunctionId) || functionsList[0];
  const secondItem = functionsList.find((f) => f.id === secondFunctionId);

  // Compute key points (Nullstellen & Schnittpunkte)
  const keyPoints = useMemo(() => {
    return findKeyPointsInView(functionsList, xMin - 2, xMax + 2, 400);
  }, [functionsList, xMin, xMax]);

  // Start animated point-draw effect
  const startDrawingAnimation = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    setIsDrawingAnim(true);
    setDrawProgress(0);

    const startTime = performance.now();
    const duration = drawSpeed === 'slow' ? 4500 : drawSpeed === 'fast' ? 1500 : 3200;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      setDrawProgress(progress);

      if (Math.random() < 0.15) {
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
  }, [drawSpeed]);

  // Trigger draw animation when functions change
  useEffect(() => {
    startDrawingAnimation();
  }, [functionsList, startDrawingAnimation]);

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

  // Ratio multiplier: ratio of Y units to X units in the same physical pixel length
  const getRatioMultiplier = (ratio: AxisRatio): number => {
    switch (ratio) {
      case '1:1': return 1;
      case '1:2': return 2;
      case '1:3': return 3;
      case '1:5': return 5;
      case '2:1': return 0.5;
      case '3:1': return 1 / 3;
      default: return 1;
    }
  };

  // Apply predefined Axis Ratio (1:1, 1:2, 1:3, 2:1, etc.)
  const applyAxisRatio = useCallback((ratio: AxisRatio) => {
    sounds.playPop();
    setAxisRatio(ratio);
    if (ratio === 'free') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const aspect = rect.width > 0 && rect.height > 0 ? rect.width / rect.height : (16 / 9);

    const multiplier = getRatioMultiplier(ratio);
    const currentSpanX = xMax - xMin;
    const newSpanY = (currentSpanX * multiplier) / aspect;
    const centerY = (yMin + yMax) / 2;

    setYMin(parseFloat((centerY - newSpanY / 2).toFixed(2)));
    setYMax(parseFloat((centerY + newSpanY / 2).toFixed(2)));
  }, [xMin, xMax, yMin, yMax]);

  // Initial & Reset View: 1:1 Orthonormal Aspect Ratio
  const handleResetView = useCallback(() => {
    sounds.playPop();
    setAxisRatio('1:1');
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const aspect = (rect.width > 0 && rect.height > 0) ? rect.width / rect.height : (16 / 9);
      const spanX = 10;
      const spanY = spanX / aspect;
      setXMin(-5);
      setXMax(5);
      setYMin(parseFloat((-spanY / 2).toFixed(2)));
      setYMax(parseFloat((spanY / 2).toFixed(2)));
    } else {
      setXMin(-5);
      setXMax(5);
      setYMin(-2.8);
      setYMax(2.8);
    }
  }, []);

  // Sync aspect ratio only on initial mount, window resize, or fullscreen change (NOT resetting on ratio change)
  const isMountedRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isMountedRef.current) {
      isMountedRef.current = true;
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const aspect = rect.width / rect.height;
        const currentSpanX = 10;
        const newSpanY = currentSpanX / aspect;
        setXMin(-5);
        setXMax(5);
        setYMin(parseFloat((-newSpanY / 2).toFixed(2)));
        setYMax(parseFloat((newSpanY / 2).toFixed(2)));
      }
    }

    const observer = new ResizeObserver(() => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const aspect = rect.width / rect.height;
        const currentSpanX = xMax - xMin;
        const currentCenterY = (yMin + yMax) / 2;
        if (axisRatio !== 'free') {
          const multiplier = getRatioMultiplier(axisRatio);
          const newSpanY = (currentSpanX * multiplier) / aspect;
          setYMin(parseFloat((currentCenterY - newSpanY / 2).toFixed(2)));
          setYMax(parseFloat((currentCenterY + newSpanY / 2).toFixed(2)));
        }
      }
    });

    observer.observe(canvas);

    return () => {
      observer.disconnect();
    };
  }, [isFullscreen]);

  // GeoGebra-style Granular Zoom: Both, X-only, or Y-only
  const handleZoomAxis = useCallback(
    (
      axis: 'both' | 'x' | 'y',
      zoomFactor: number,
      centerMathX?: number,
      centerMathY?: number
    ) => {
      sounds.playPop();
      const currentCenterX = centerMathX !== undefined ? centerMathX : (xMin + xMax) / 2;
      const currentCenterY = centerMathY !== undefined ? centerMathY : (yMin + yMax) / 2;

      const currentSpanX = xMax - xMin;
      const currentSpanY = yMax - yMin;

      if (axis === 'both' || axis === 'x') {
        const newSpanX = currentSpanX * zoomFactor;
        if (newSpanX >= 0.2 && newSpanX <= 150) {
          const ratioLeft = (currentCenterX - xMin) / currentSpanX;
          setXMin(parseFloat((currentCenterX - ratioLeft * newSpanX).toFixed(2)));
          setXMax(parseFloat((currentCenterX + (1 - ratioLeft) * newSpanX).toFixed(2)));
        }
      }

      if (axis === 'both' || axis === 'y') {
        const newSpanY = currentSpanY * zoomFactor;
        if (newSpanY >= 0.2 && newSpanY <= 150) {
          const ratioBottom = (currentCenterY - yMin) / currentSpanY;
          setYMin(parseFloat((currentCenterY - ratioBottom * newSpanY).toFixed(2)));
          setYMax(parseFloat((currentCenterY + (1 - ratioBottom) * newSpanY).toFixed(2)));
        }
      }

      if (axis !== 'both') {
        setAxisRatio('free');
      }
    },
    [xMin, xMax, yMin, yMax]
  );

  // Non-passive wheel event listener: Detects hover over X-Axis vs. Y-Axis for independent zooming
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheelZoom = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const mathPt = canvasToMath(clickX, clickY, width, height);

      const origin = mathToCanvas(0, 0, width, height);
      const distToXAxis = Math.abs(clickY - origin.cy);
      const distToYAxis = Math.abs(clickX - origin.cx);

      const zoomFactor = e.deltaY < 0 ? 0.85 : 1.18;

      if (e.shiftKey || (distToXAxis < 35 && distToYAxis >= 35)) {
        // Zoom ONLY X-Axis
        handleZoomAxis('x', zoomFactor, mathPt.mx, mathPt.my);
      } else if (e.ctrlKey || (distToYAxis < 35 && distToXAxis >= 35)) {
        // Zoom ONLY Y-Axis
        handleZoomAxis('y', zoomFactor, mathPt.mx, mathPt.my);
      } else {
        // Zoom Both
        handleZoomAxis('both', zoomFactor, mathPt.mx, mathPt.my);
      }
    };

    canvas.addEventListener('wheel', onWheelZoom, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', onWheelZoom);
    };
  }, [canvasToMath, mathToCanvas, handleZoomAxis]);

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

    // 1. Dynamic GeoGebra-style Grid Step Calculation
    const spanX = xMax - xMin;
    const spanY = yMax - yMin;

    const xStep = getDynamicStep(spanX);
    const yStep = getDynamicStep(spanY);

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';

    const startGridX = Math.floor(xMin / xStep) * xStep;
    for (let x = startGridX; x <= xMax; x += xStep) {
      const { cx } = mathToCanvas(x, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      if (Math.abs(x) > 0.0001) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Fira Code, monospace';
        const { cy: originY } = mathToCanvas(0, 0, width, height);
        const textY = Math.min(Math.max(originY + 14, 15), height - 8);
        ctx.fillText(formatTickNumber(x, xStep), cx - 6, textY);
      }
    }

    const startGridY = Math.floor(yMin / yStep) * yStep;
    for (let y = startGridY; y <= yMax; y += yStep) {
      const { cy } = mathToCanvas(0, y, width, height);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      if (Math.abs(y) > 0.0001) {
        ctx.fillStyle = '#64748b';
        ctx.font = '10px Fira Code, monospace';
        const { cx: originX } = mathToCanvas(0, 0, width, height);
        const textX = Math.min(Math.max(originX + 6, 6), width - 35);
        ctx.fillText(formatTickNumber(y, yStep), textX, cy + 4);
      }
    }

    // 2. Main Axes (Highlighting on Hover)
    const origin = mathToCanvas(0, 0, width, height);
    
    // X Axis
    ctx.lineWidth = hoveredAxisZone === 'x' ? 3.5 : 2;
    ctx.strokeStyle = hoveredAxisZone === 'x' ? '#38bdf8' : '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(0, origin.cy);
    ctx.lineTo(width, origin.cy);
    ctx.stroke();

    // Y Axis
    ctx.lineWidth = hoveredAxisZone === 'y' ? 3.5 : 2;
    ctx.strokeStyle = hoveredAxisZone === 'y' ? '#38bdf8' : '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(origin.cx, 0);
    ctx.lineTo(origin.cx, height);
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px Outfit, sans-serif';
    ctx.fillText('x', width - 15, Math.min(Math.max(origin.cy - 8, 15), height - 8));
    ctx.fillText('y', Math.min(Math.max(origin.cx + 8, 8), width - 20), 15);

    // 3. Shaded Area Under primary function or between two functions
    const lower = Math.min(a, b);
    const upper = Math.max(a, b);

    if (primaryItem && primaryItem.isValid && (mode !== 'riemann' || riemannType === 'none')) {
      const samplePoints = 400;
      const step = (upper - lower) / samplePoints;

      if (mode === 'between' && secondItem && secondItem.isValid) {
        ctx.beginPath();
        const startPt = mathToCanvas(lower, primaryItem.fn(lower), width, height);
        ctx.moveTo(startPt.cx, startPt.cy);

        for (let i = 1; i <= samplePoints; i++) {
          const x = lower + i * step;
          const pt = mathToCanvas(x, primaryItem.fn(x), width, height);
          ctx.lineTo(pt.cx, pt.cy);
        }

        for (let i = samplePoints; i >= 0; i--) {
          const x = lower + i * step;
          const pt = mathToCanvas(x, secondItem.fn(x), width, height);
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
          const y1 = primaryItem.fn(x1);
          const y2 = primaryItem.fn(x2);

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

    // 5. Draw ALL Visible Functions in their individual colors!
    const plotSteps = width * 1.5;
    const currentMaxStep = Math.floor(plotSteps * drawProgress);
    const dx = (xMax - xMin) / plotSteps;

    functionsList.forEach((funcItem) => {
      if (!funcItem.isVisible || !funcItem.isValid) return;

      ctx.beginPath();
      ctx.lineWidth = funcItem.id === primaryFunctionId ? 3.5 : 2.5;
      ctx.strokeStyle = funcItem.color;

      let started = false;
      let tracerPt: { cx: number; cy: number } | null = null;
      const trailPoints: { cx: number; cy: number }[] = [];

      for (let i = 0; i <= currentMaxStep; i++) {
        const x = xMin + i * dx;
        const y = funcItem.fn(x);

        if (isFinite(y) && !isNaN(y)) {
          const pt = mathToCanvas(x, y, width, height);
          if (!started) {
            ctx.moveTo(pt.cx, pt.cy);
            started = true;
          } else {
            ctx.lineTo(pt.cx, pt.cy);
          }
          if (i >= currentMaxStep - 20) {
            trailPoints.push(pt);
          }
          if (i === currentMaxStep) {
            tracerPt = { cx: pt.cx, cy: pt.cy };
          }
        }
      }
      ctx.stroke();

      // Draw Glowing Comet Trail for active drawing
      if (trailPoints.length > 1 && (drawProgress < 1 || isDrawingAnim)) {
        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.strokeStyle = funcItem.color + '66';
        ctx.lineCap = 'round';
        ctx.moveTo(trailPoints[0].cx, trailPoints[0].cy);
        for (let j = 1; j < trailPoints.length; j++) {
          ctx.lineTo(trailPoints[j].cx, trailPoints[j].cy);
        }
        ctx.stroke();
        ctx.restore();
      }

      // Draw Glowing Tracer Particle
      if (tracerPt && (drawProgress < 1 || isDrawingAnim)) {
        const glowGrad = ctx.createRadialGradient(tracerPt.cx, tracerPt.cy, 2, tracerPt.cx, tracerPt.cy, 20);
        glowGrad.addColorStop(0, funcItem.color);
        glowGrad.addColorStop(0.5, funcItem.color + '88');
        glowGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.arc(tracerPt.cx, tracerPt.cy, 20, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(tracerPt.cx, tracerPt.cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
    });

    // 6. Draw Key Points Markers (Nullstellen & Schnittpunkte)
    keyPoints.forEach((kp) => {
      const pt = mathToCanvas(kp.x, kp.y, width, height);
      if (pt.cx < 0 || pt.cx > width || pt.cy < 0 || pt.cy > height) return;

      // Small diamond marker
      ctx.save();
      ctx.translate(pt.cx, pt.cy);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = kp.type === 'root' ? (kp.color || '#38bdf8') : '#e879f9';
      ctx.fillRect(-3.5, -3.5, 7, 7);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(-3.5, -3.5, 7, 7);
      ctx.restore();
    });

    // 7. Draw Antiderivative F(x) if active
    if (showAntiderivative && antiderivativeFn) {
      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = '#c084fc';

      let started = false;
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

      // Check if this boundary matches a key point
      const matchedKeyPoint = keyPoints.find((kp) => Math.abs(kp.x - val) < 0.01);

      ctx.beginPath();
      ctx.lineWidth = matchedKeyPoint ? 3.5 : 2.5;
      ctx.strokeStyle = color;
      ctx.setLineDash(matchedKeyPoint ? [] : [5, 5]);
      ctx.moveTo(ptX, 0);
      ctx.lineTo(ptX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top Tag Badge
      ctx.fillStyle = color;
      ctx.beginPath();
      const badgeText = matchedKeyPoint
        ? `🧲 ${label}=${val.toLocaleString('de-DE', { maximumFractionDigits: 3 })}`
        : `${label}=${val.toFixed(2)}`;
      const badgeWidth = matchedKeyPoint ? 85 : 55;
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(ptX - badgeWidth / 2, 10, badgeWidth, 24, 8);
      } else {
        ctx.rect(ptX - badgeWidth / 2, 10, badgeWidth, 24);
      }
      ctx.fill();

      ctx.fillStyle = '#090d16';
      ctx.font = 'bold 11px Fira Code, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, ptX, 26);

      // Bottom / Axis Knob Point
      ctx.beginPath();
      ctx.arc(ptX, origin.cy, matchedKeyPoint ? 9 : 7, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    drawBoundaryLine(a, 'a', '#34d399');
    drawBoundaryLine(b, 'b', '#fbbf24');

    // 9. Active Snap Floating Notification Overlay
    if (activeSnapInfo) {
      const snapPt = mathToCanvas(activeSnapInfo.x, 0, width, height);
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(snapPt.cx - 90, 42, 180, 26, 8);
      } else {
        ctx.rect(snapPt.cx - 90, 42, 180, 26);
      }
      ctx.fill();
      ctx.strokeStyle = activeSnapInfo.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🧲 ${activeSnapInfo.label}`, snapPt.cx, 58);
    }

    // 10. Live Accumulator marker for HDI
    if (mode === 'hdi_accumulator' && xAccumulator !== undefined && primaryItem) {
      const accX = mathToCanvas(xAccumulator, 0, width, height).cx;
      const accY = mathToCanvas(xAccumulator, primaryItem.fn(xAccumulator), width, height).cy;

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

    // 11. Multi-Function Hover Crosshair & Values (only when showCoordinates is true)
    if (hoveredX && showCoordinates) {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.moveTo(hoveredX.canvasX, 0);
      ctx.lineTo(hoveredX.canvasX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      functionsList.forEach((f) => {
        if (!f.isVisible || !f.isValid) return null;
        const curY = f.fn(hoveredX.mathX);
        if (!isFinite(curY) && !isNaN(curY)) {
          const pt = mathToCanvas(hoveredX.mathX, curY, width, height);
          ctx.beginPath();
          ctx.arc(pt.cx, pt.cy, 5, 0, Math.PI * 2);
          ctx.fillStyle = f.color;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });
    }

    ctx.restore();
  }, [
    functionsList,
    primaryItem,
    secondItem,
    primaryFunctionId,
    a,
    b,
    xMin,
    xMax,
    yMin,
    yMax,
    keyPoints,
    activeSnapInfo,
    showCoordinates,
    hoveredAxisZone,
    mathToCanvas,
    areaType,
    riemannType,
    riemannRectangles,
    showAntiderivative,
    antiderivativeFn,
    xAccumulator,
    hoveredX,
    mode,
    drawProgress,
    isDrawingAnim
  ]);

  // Handle Mouse Dragging / Pan with Magnetic Snap
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
    const origin = mathToCanvas(0, 0, width, height);
    const distToXAxis = Math.abs(mouseY - origin.cy);
    const distToYAxis = Math.abs(mouseX - origin.cx);

    if (distToXAxis < 32 && distToYAxis >= 32) {
      setHoveredAxisZone('x');
    } else if (distToYAxis < 32 && distToXAxis >= 32) {
      setHoveredAxisZone('y');
    } else {
      setHoveredAxisZone(null);
    }

    if (draggingMode === 'a' || draggingMode === 'b') {
      let targetX = mathPt.mx;

      // Magnetic Snapping check: test proximity to any key point in pixel distance
      if (isMagneticSnap) {
        let nearestKP: KeyPoint | null = null;
        let minPixelDist = Infinity;

        keyPoints.forEach((kp) => {
          const kpCanvasX = mathToCanvas(kp.x, 0, width, height).cx;
          const dist = Math.abs(kpCanvasX - mouseX);
          if (dist < 18 && dist < minPixelDist) {
            minPixelDist = dist;
            nearestKP = kp;
          }
        });

        if (nearestKP) {
          const kp = nearestKP as KeyPoint;
          targetX = kp.x;
          if (!activeSnapInfo || activeSnapInfo.x !== kp.x) {
            sounds.playPop();
            setActiveSnapInfo({
              x: kp.x,
              label: kp.label,
              type: kp.type,
              color: kp.type === 'root' ? (kp.color || '#38bdf8') : '#e879f9'
            });
          }
        } else {
          setActiveSnapInfo(null);
          targetX = parseFloat(targetX.toFixed(2));
        }
      } else {
        targetX = parseFloat(targetX.toFixed(2));
        setActiveSnapInfo(null);
      }

      if (draggingMode === 'a') {
        onUpdateBounds(targetX, b);
      } else {
        onUpdateBounds(a, targetX);
      }
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
      setHoveredX({ mathX: mathPt.mx, canvasX: mouseX, canvasY: mouseY });
    }
  };

  const handleMouseUp = () => {
    setDraggingMode(null);
    setPanStart(null);
    setActiveSnapInfo(null);
  };

  // Touch handlers for Tablets, iPads and Touchscreens
  const touchPinchDistRef = useRef<{ dist: number; diffX: number; diffY: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (e.touches.length === 1) {
      // 1 Finger: Boundary Drag or Pan
      const touch = e.touches[0];
      const clickX = touch.clientX - rect.left;
      const clickY = touch.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;

      const ptA = mathToCanvas(a, 0, width, height).cx;
      const ptB = mathToCanvas(b, 0, width, height).cx;

      // Generous hit test for fingers on touch screens (36px radius)
      if (Math.abs(clickX - ptA) < 36) {
        setDraggingMode('a');
        sounds.playPop();
      } else if (Math.abs(clickX - ptB) < 36) {
        setDraggingMode('b');
        sounds.playPop();
      } else if (mode === 'hdi_accumulator' && xAccumulator !== undefined) {
        const ptAcc = mathToCanvas(xAccumulator, 0, width, height).cx;
        if (Math.abs(clickX - ptAcc) < 36) {
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
    } else if (e.touches.length === 2) {
      // 2 Fingers: Pinch to Zoom
      setDraggingMode(null);
      setPanStart(null);
      const diffX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
      const diffY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
      const dist = Math.hypot(diffX, diffY);
      touchPinchDistRef.current = { dist, diffX, diffY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const touchX = touch.clientX - rect.left;
      const touchY = touch.clientY - rect.top;
      const mathPt = canvasToMath(touchX, touchY, width, height);

      if (draggingMode === 'a' || draggingMode === 'b') {
        let targetX = mathPt.mx;

        if (isMagneticSnap) {
          let nearestKP: KeyPoint | null = null;
          let minPixelDist = Infinity;

          keyPoints.forEach((kp) => {
            const kpCanvasX = mathToCanvas(kp.x, 0, width, height).cx;
            const dist = Math.abs(kpCanvasX - touchX);
            if (dist < 26 && dist < minPixelDist) {
              minPixelDist = dist;
              nearestKP = kp;
            }
          });

          if (nearestKP) {
            const kp = nearestKP as KeyPoint;
            targetX = kp.x;
            if (!activeSnapInfo || activeSnapInfo.x !== kp.x) {
              sounds.playPop();
              setActiveSnapInfo({
                x: kp.x,
                label: kp.label,
                type: kp.type,
                color: kp.type === 'root' ? (kp.color || '#38bdf8') : '#e879f9'
              });
            }
          } else {
            setActiveSnapInfo(null);
            targetX = parseFloat(targetX.toFixed(2));
          }
        } else {
          targetX = parseFloat(targetX.toFixed(2));
          setActiveSnapInfo(null);
        }

        if (draggingMode === 'a') {
          onUpdateBounds(targetX, b);
        } else {
          onUpdateBounds(a, targetX);
        }
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
        if (showCoordinates) {
          setHoveredX({ mathX: mathPt.mx, canvasX: touchX, canvasY: touchY });
        }
      }
    } else if (e.touches.length === 2 && touchPinchDistRef.current !== null) {
      // Pinch to Zoom with Axis Direction Detection (X vs Y vs Both)
      const diffX = Math.abs(e.touches[0].clientX - e.touches[1].clientX);
      const diffY = Math.abs(e.touches[0].clientY - e.touches[1].clientY);
      const dist = Math.hypot(diffX, diffY);
      const prev = touchPinchDistRef.current;

      if (prev.dist > 0) {
        const factor = prev.dist / dist;
        if (Math.abs(1 - factor) > 0.015) {
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
          const centerPt = canvasToMath(midX, midY, width, height);

          const zoomFactor = factor > 1 ? 1.05 : 0.95;

          if (diffX > 2.0 * diffY) {
            // Horizontal pinch -> Zoom X only!
            handleZoomAxis('x', zoomFactor, centerPt.mx, centerPt.my);
          } else if (diffY > 2.0 * diffX) {
            // Vertical pinch -> Zoom Y only!
            handleZoomAxis('y', zoomFactor, centerPt.mx, centerPt.my);
          } else {
            // Diagonal pinch -> Zoom both!
            handleZoomAxis('both', zoomFactor, centerPt.mx, centerPt.my);
          }

          touchPinchDistRef.current = { dist, diffX, diffY };
        }
      }
    }
  };

  const handleTouchEnd = () => {
    setDraggingMode(null);
    setPanStart(null);
    setActiveSnapInfo(null);
    setHoveredAxisZone(null);
    touchPinchDistRef.current = null;
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setDraggingMode(null);
          setPanStart(null);
          setHoveredX(null);
          setActiveSnapInfo(null);
          setHoveredAxisZone(null);
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`w-full h-full touch-none select-none ${
          draggingMode === 'pan'
            ? 'cursor-grabbing'
            : hoveredAxisZone === 'x'
            ? 'cursor-ew-resize'
            : hoveredAxisZone === 'y'
            ? 'cursor-ns-resize'
            : 'cursor-crosshair'
        }`}
      />

      {/* Floating View Controls Toolbar */}
      <div className="absolute top-4 right-4 flex flex-wrap items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-xl z-20">
        <button
          onClick={startDrawingAnimation}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-600 hover:text-white transition-all shadow-sm"
          title="Graphen mit Leuchtpunkt und Schweif neu zeichnen"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Neu zeichnen</span>
        </button>

        {/* Speed toggle */}
        <button
          onClick={() => {
            sounds.playPop();
            const nextSpeed = drawSpeed === 'normal' ? 'slow' : drawSpeed === 'slow' ? 'fast' : 'normal';
            setDrawSpeed(nextSpeed);
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-mono transition-all"
          title="Zeichen-Geschwindigkeit umschalten"
        >
          <Gauge className="w-3.5 h-3.5 text-indigo-400" />
          <span>{drawSpeed === 'slow' ? 'Langsam (4.5s)' : drawSpeed === 'fast' ? 'Schnell (1.5s)' : 'Gemächlich (3.2s)'}</span>
        </button>

        {/* Magnetic Snap Toggle */}
        <button
          onClick={() => {
            sounds.playPop();
            setIsMagneticSnap(!isMagneticSnap);
          }}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            isMagneticSnap
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="Magnetisches Einrasten an Nullstellen und Schnittpunkten umschalten"
        >
          <Magnet className="w-3.5 h-3.5 text-amber-400" />
          <span>Magnet: {isMagneticSnap ? 'AN' : 'AUS'}</span>
        </button>

        {/* Show/Hide Mouse Coordinates Toggle */}
        <button
          onClick={() => {
            sounds.playPop();
            setShowCoordinates(!showCoordinates);
          }}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all ${
            showCoordinates
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold'
              : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
          }`}
          title="Maus-Koordinaten und Fadenkreuz ein-/ausblenden"
        >
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>Koordinaten: {showCoordinates ? 'AN' : 'AUS'}</span>
        </button>

        <div className="w-[1px] h-5 bg-slate-700 mx-1 hidden sm:block" />

        {/* Achsenverhältnis Selector Dropdown (GeoGebra Style) */}
        <div className="relative flex items-center">
          <div className="flex items-center gap-1 bg-slate-800/90 hover:bg-slate-700/90 rounded-xl px-2.5 py-1.5 border border-slate-700 text-xs font-mono text-cyan-300 cursor-pointer">
            <Scale className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400 text-[11px] mr-1 hidden sm:inline">Achsen:</span>
            <select
              value={axisRatio}
              onChange={(e) => applyAxisRatio(e.target.value as any)}
              className="appearance-none bg-transparent text-slate-200 text-xs font-mono font-semibold focus:outline-none cursor-pointer pr-4"
              title="Achsenverhältnis (Maßstab X zu Y) wie in GeoGebra einstellen"
            >
              <option value="1:1" className="bg-slate-900 text-white">1 : 1 (Standard)</option>
              <option value="1:2" className="bg-slate-900 text-white">1 : 2 (1x = 2y)</option>
              <option value="1:3" className="bg-slate-900 text-white">1 : 3 (1x = 3y)</option>
              <option value="1:5" className="bg-slate-900 text-white">1 : 5 (1x = 5y)</option>
              <option value="2:1" className="bg-slate-900 text-white">2 : 1 (2x = 1y)</option>
              <option value="3:1" className="bg-slate-900 text-white">3 : 1 (3x = 1y)</option>
              <option value="free" className="bg-slate-900 text-white">Frei / Separat</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
          </div>
        </div>

        <div className="w-[1px] h-5 bg-slate-700 mx-1 hidden sm:block" />

        {/* Zoom In/Out & Reset */}
        <button
          onClick={() => handleZoomAxis('both', 0.8)}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          title="Vergrößern (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoomAxis('both', 1.25)}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          title="Verkleinern (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
          title="Ansicht zurücksetzen (1:1 Auto-Fit)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-700 mx-1" />

        {/* Fullscreen */}
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

      {/* Floating Axis Zoom Tooltip Indicator */}
      {hoveredAxisZone && (
        <div
          className="absolute pointer-events-none bg-indigo-950/95 text-indigo-200 border border-indigo-500/50 px-2.5 py-1 rounded-lg text-[11px] font-mono shadow-xl backdrop-blur z-30 flex items-center gap-1.5 animate-pulse"
          style={{
            left: hoveredX ? Math.min(hoveredX.canvasX + 12, window.innerWidth - 180) : 20,
            top: hoveredX ? Math.max(10, hoveredX.canvasY - 30) : 20
          }}
        >
          {hoveredAxisZone === 'x' && (
            <>
              <span>↔</span>
              <span className="font-bold text-cyan-300">x-Achse zoomen (Mausrad)</span>
            </>
          )}
          {hoveredAxisZone === 'y' && (
            <>
              <span>↕</span>
              <span className="font-bold text-cyan-300">y-Achse zoomen (Mausrad)</span>
            </>
          )}
        </div>
      )}

      {/* Floating Multi-Function Tooltip (only when showCoordinates is true) */}
      {hoveredX && showCoordinates && !hoveredAxisZone && (
        <div
          className="absolute pointer-events-none bg-slate-900/95 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-mono shadow-2xl backdrop-blur z-10 space-y-1"
          style={{
            left: Math.min(window.innerWidth > 640 ? hoveredX.canvasX + 14 : 10, window.innerWidth - 200),
            top: Math.max(10, hoveredX.canvasY - 50)
          }}
        >
          <div className="text-slate-400 font-bold border-b border-slate-800 pb-0.5">
            x = {hoveredX.mathX.toFixed(2)}
          </div>
          {functionsList.map((f) => {
            if (!f.isVisible || !f.isValid) return null;
            const yVal = f.fn(hoveredX.mathX);
            if (!isFinite(yVal) || isNaN(yVal)) return null;
            return (
              <div key={f.id} className="flex items-center justify-between gap-3" style={{ color: f.color }}>
                <span className="font-bold">{f.name}:</span>
                <span className="font-mono">{yVal.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Live Area & Status Scorecard */}
      <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
        {/* Left: Quick navigation hint */}
        <div className="text-[11px] text-slate-400 font-mono hidden sm:flex items-center gap-2 bg-slate-950/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-800/90 shadow-lg">
          <Move className="w-3.5 h-3.5 text-indigo-400" />
          <span>Ziehen: Verschieben</span>
          <span>•</span>
          <span className="text-cyan-300">Achsen scrollen: X/Y separat</span>
          <span>•</span>
          <span className="text-amber-300">🧲 Magnet-Snap</span>
        </div>

        {/* Center / Right: Live Area Scorecard for Fullscreen & Class Presentations */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* Flächenbilanz */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur border border-slate-800 shadow-lg text-xs font-mono">
            <span className="text-slate-400">Flächenbilanz (∫):</span>
            <span
              className={`font-extrabold ${
                (signedIntegral ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {(signedIntegral ?? 0) > 0 ? '+' : ''}
              {(signedIntegral ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
            </span>
          </div>

          {/* Geometrische Fläche */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur border border-emerald-500/30 shadow-lg text-xs font-mono">
            <span className="text-emerald-400 font-semibold">Geom. Fläche (|A|):</span>
            <span className="font-extrabold text-white">
              {(absoluteArea ?? 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
            </span>
            {rootsInInterval && rootsInInterval.length > 0 && (
              <span className="text-[10px] text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 font-bold">
                {rootsInInterval.length} {rootsInInterval.length === 1 ? 'Nullstelle' : 'Nullstellen'}
              </span>
            )}
          </div>

          {/* Mode: Between two functions */}
          {mode === 'between' && areaBetween !== undefined && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur border border-indigo-500/40 shadow-lg text-xs font-mono">
              <span className="text-indigo-300 font-semibold">Fläche zw. Kurven:</span>
              <span className="font-extrabold text-indigo-200">
                {Math.abs(areaBetween).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
              </span>
            </div>
          )}

          {/* Mode: Riemann sums */}
          {mode === 'riemann' && riemannSum !== undefined && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur border border-blue-500/40 shadow-lg text-xs font-mono">
              <span className="text-blue-300 font-semibold">Riemann-Summe:</span>
              <span className="font-extrabold text-white">
                {riemannSum.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
              </span>
              <span className="text-[10px] text-slate-400">
                (Δ = {Math.abs(riemannSum - (signedIntegral ?? 0)).toFixed(3)})
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
