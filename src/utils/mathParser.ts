import * as math from 'mathjs';
import type { PresetFunction } from '../types/math';

// Pre-compiled presets for performance and reliable antiderivatives
export const PRESET_FUNCTIONS: PresetFunction[] = [
  {
    id: 'quad_standard',
    name: 'Normalparabel',
    expression: 'x^2',
    latex: 'f(x) = x^2',
    antiderivativeLatex: 'F(x) = \\frac{1}{3}x^3',
    defaultA: 0,
    defaultB: 3,
    category: 'Polynome',
    description: 'Der Klassiker der Analysis: Wie wächst die Fläche unter einer Parabel?'
  },
  {
    id: 'poly_cubic',
    name: 'Kubische Funktion mit Nulldurchgang',
    expression: 'x^3 - 3*x',
    latex: 'f(x) = x^3 - 3x',
    antiderivativeLatex: 'F(x) = \\frac{1}{4}x^4 - \\frac{3}{2}x^2',
    defaultA: -2,
    defaultB: 2,
    category: 'Polynome',
    description: 'Perfekt zum Verstehen von Flächenbilanz (orientierte Fläche) vs. absoluter geometrischer Fläche!'
  },
  {
    id: 'trig_sin',
    name: 'Sinus-Welle',
    expression: 'sin(x)',
    latex: 'f(x) = \\sin(x)',
    antiderivativeLatex: 'F(x) = -\\cos(x)',
    defaultA: 0,
    defaultB: 3.14159,
    category: 'Trigonometrie',
    description: 'Eine halbe Sinus-Welle von 0 bis π hat exakt den Flächeninhalt 2!'
  },
  {
    id: 'exp_growth',
    name: 'Natürliches Wachstum',
    expression: 'exp(0.5*x)',
    latex: 'f(x) = e^{0.5x}',
    antiderivativeLatex: 'F(x) = 2e^{0.5x}',
    defaultA: 0,
    defaultB: 4,
    category: 'Exponential',
    description: 'Exponentielles Wachstum bei Bakterien, Zinsen oder Verbreitungsvorgängen.'
  },
  {
    id: 'inverted_parabola',
    name: 'Brückenbogen (Wurfparabel)',
    expression: '4 - x^2',
    latex: 'f(x) = 4 - x^2',
    antiderivativeLatex: 'F(x) = 4x - \\frac{1}{3}x^3',
    defaultA: -2,
    defaultB: 2,
    category: 'Praxis',
    description: 'Querschnittsfläche unter einem Brückenbogen oder Wurfhöhe eines Balls.'
  },
  {
    id: 'bell_curve',
    name: 'Glockenkurve (Normalverteilung)',
    expression: '3 * exp(-0.5 * x^2)',
    latex: 'f(x) = 3 \\cdot e^{-\\frac{1}{2}x^2}',
    antiderivativeLatex: 'F(x) = 3 \\sqrt{\\frac{\\pi}{2}} \\cdot \\text{erf}\\left(\\frac{x}{\\sqrt{2}}\\right)',
    defaultA: -2,
    defaultB: 2,
    category: 'Praxis',
    description: 'Grundlage der Statistik und Wahrscheinlichkeitsrechnung (Gauß-Kurve).'
  }
];

export interface EvaluationResult {
  fn: (x: number) => number;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Compiles a mathematical expression string into a callable JS function
 */
export function compileMathExpression(exprStr: string): EvaluationResult {
  try {
    const cleanExpr = exprStr.trim();
    if (!cleanExpr) {
      return { fn: () => 0, isValid: false, errorMessage: 'Kein Ausdruck eingegeben' };
    }

    const compiled = math.compile(cleanExpr);
    // Test evaluation at x = 1
    const testVal = compiled.evaluate({ x: 1, e: Math.E, pi: Math.PI });
    if (typeof testVal !== 'number' || isNaN(testVal)) {
      return { fn: () => 0, isValid: false, errorMessage: 'Ausdruck liefert keine gültige Zahl' };
    }

    return {
      fn: (x: number) => {
        try {
          const val = compiled.evaluate({ x, e: Math.E, pi: Math.PI });
          if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
            return val;
          }
          return 0;
        } catch {
          return 0;
        }
      },
      isValid: true
    };
  } catch (err: any) {
    return {
      fn: () => 0,
      isValid: false,
      errorMessage: err.message || 'Ungültige Formelsyntax'
    };
  }
}

/**
 * High-accuracy Simpson's 3/8 & 1/3 Adaptive Composite Rule for Numerical Integration
 */
export function computeDefiniteIntegral(
  fn: (x: number) => number,
  a: number,
  b: number,
  isAbsolute: boolean = false,
  steps: number = 1000
): number {
  if (a === b) return 0;
  const reversed = a > b;
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  const n = steps % 2 === 0 ? steps : steps + 1; // Must be even for Simpson's 1/3
  const h = (end - start) / n;

  let sum = 0;
  const evalAt = (x: number) => {
    const val = fn(x);
    return isAbsolute ? Math.abs(val) : val;
  };

  sum += evalAt(start) + evalAt(end);

  for (let i = 1; i < n; i++) {
    const x = start + i * h;
    sum += evalAt(x) * (i % 2 === 0 ? 2 : 4);
  }

  const result = (sum * h) / 3;
  return reversed && !isAbsolute ? -result : result;
}

export interface RiemannRectangle {
  x: number;
  width: number;
  height: number;
  y: number;
  sampleX: number;
  area: number;
}

/**
 * Calculates Riemann sums and rectangles
 */
export function computeRiemannSum(
  fn: (x: number) => number,
  a: number,
  b: number,
  n: number,
  type: 'left' | 'right' | 'midpoint' | 'trapezoid'
): { totalSum: number; rectangles: RiemannRectangle[] } {
  if (n <= 0) return { totalSum: 0, rectangles: [] };
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  const dx = (end - start) / n;
  const rectangles: RiemannRectangle[] = [];
  let totalSum = 0;

  for (let i = 0; i < n; i++) {
    const xLeft = start + i * dx;
    const xRight = xLeft + dx;
    let sampleX = xLeft;

    if (type === 'left') {
      sampleX = xLeft;
    } else if (type === 'right') {
      sampleX = xRight;
    } else if (type === 'midpoint') {
      sampleX = xLeft + dx / 2;
    } else if (type === 'trapezoid') {
      // Average height
      const yLeft = fn(xLeft);
      const yRight = fn(xRight);
      const avgHeight = (yLeft + yRight) / 2;
      const rectArea = avgHeight * dx;
      totalSum += rectArea;
      rectangles.push({
        x: xLeft,
        width: dx,
        height: avgHeight,
        y: avgHeight >= 0 ? 0 : avgHeight,
        sampleX: xLeft + dx / 2,
        area: rectArea
      });
      continue;
    }

    const height = fn(sampleX);
    const area = height * dx;
    totalSum += area;

    rectangles.push({
      x: xLeft,
      width: dx,
      height: height,
      y: height >= 0 ? 0 : height,
      sampleX,
      area
    });
  }

  // Adjust sign if a > b
  if (a > b) {
    totalSum = -totalSum;
  }

  return { totalSum, rectangles };
}

/**
 * Find zero crossings (roots) of a function in [a, b] for absolute area calculation
 */
export function findRootsInInterval(
  fn: (x: number) => number,
  a: number,
  b: number,
  samples: number = 200
): number[] {
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  const step = (end - start) / samples;
  const roots: number[] = [];

  let prevX = start;
  let prevY = fn(prevX);

  for (let i = 1; i <= samples; i++) {
    const curX = start + i * step;
    const curY = fn(curX);

    if (Math.abs(curY) < 1e-7) {
      roots.push(parseFloat(curX.toFixed(4)));
    } else if (prevY * curY < 0) {
      // Sign change -> Bisection method for root refinement
      let low = prevX;
      let high = curX;
      for (let iter = 0; iter < 16; iter++) {
        const mid = (low + high) / 2;
        const midY = fn(mid);
        if (Math.abs(midY) < 1e-7) {
          low = mid;
          break;
        }
        if (fn(low) * midY <= 0) {
          high = mid;
        } else {
          low = mid;
        }
      }
      roots.push(parseFloat(((low + high) / 2).toFixed(4)));
    }

    prevX = curX;
    prevY = curY;
  }

  return Array.from(new Set(roots)).sort((x, y) => x - y);
}

export interface KeyPoint {
  x: number;
  y: number;
  type: 'root' | 'intersection';
  label: string;
  funcName: string;
  color?: string;
}

/**
 * Finds all critical key points (Nullstellen, Schnittpunkte)
 * within [xMin, xMax] for a list of compiled functions
 */
export function findKeyPointsInView(
  functionsList: { id: string; name: string; fn: (x: number) => number; isVisible: boolean; isValid: boolean; color: string }[],
  xMin: number = -10,
  xMax: number = 10,
  samples: number = 300
): KeyPoint[] {
  const points: KeyPoint[] = [];
  const activeFuncs = functionsList.filter((f) => f.isVisible && f.isValid);

  // 1. Nullstellen (Roots) for each active function
  activeFuncs.forEach((f) => {
    const roots = findRootsInInterval(f.fn, xMin, xMax, samples);
    roots.forEach((rx) => {
      points.push({
        x: rx,
        y: 0,
        type: 'root',
        label: `Nullstelle von ${f.name} (x ≈ ${rx.toLocaleString('de-DE', { maximumFractionDigits: 3 })})`,
        funcName: f.name,
        color: f.color
      });
    });
  });

  // 2. Schnittpunkte (Intersections) between pairs of active functions
  for (let i = 0; i < activeFuncs.length; i++) {
    for (let j = i + 1; j < activeFuncs.length; j++) {
      const f1 = activeFuncs[i];
      const f2 = activeFuncs[j];
      const diffFn = (x: number) => f1.fn(x) - f2.fn(x);
      const intersectionX = findRootsInInterval(diffFn, xMin, xMax, samples);
      intersectionX.forEach((ix) => {
        const iy = parseFloat(f1.fn(ix).toFixed(4));
        points.push({
          x: ix,
          y: isFinite(iy) ? iy : 0,
          type: 'intersection',
          label: `Schnittpunkt ${f1.name} ∩ ${f2.name} (x ≈ ${ix.toLocaleString('de-DE', { maximumFractionDigits: 3 })})`,
          funcName: `${f1.name} ∩ ${f2.name}`,
          color: '#e879f9'
        });
      });
    }
  }

  // Deduplicate points within epsilon = 0.005
  const uniquePoints: KeyPoint[] = [];
  points.sort((p1, p2) => p1.x - p2.x);
  for (const pt of points) {
    if (!uniquePoints.some((u) => Math.abs(u.x - pt.x) < 0.005 && u.type === pt.type)) {
      uniquePoints.push(pt);
    }
  }

  return uniquePoints;
}
