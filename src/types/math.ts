export type AppModule = 'prozent' | 'integral' | 'formeln' | 'quiz';

export interface PercentState {
  grundwert: number;      // G (Das Ganze)
  prozentsatz: number;    // p% (z.B. 25 für 25%)
  prozentwert: number;    // W (Der Anteil)
  activeVariable: 'W' | 'G' | 'p';
}

export type RiemannType = 'left' | 'right' | 'midpoint' | 'trapezoid' | 'none';

export interface IntegralConfig {
  functionString: string;
  secondFunctionString?: string;
  mode: 'single' | 'between' | 'riemann' | 'hdi_accumulator';
  a: number;              // Lower bound
  b: number;              // Upper bound
  n: number;              // Subdivisions for Riemann
  riemannType: RiemannType;
  areaType: 'signed' | 'absolute'; // Flächenbilanz vs Geometrische Fläche
  showAntiderivative: boolean;
  showTangents: boolean;
  xAccumulator?: number;
}

export interface PresetFunction {
  id: string;
  name: string;
  latex: string;
  expression: string;
  defaultA: number;
  defaultB: number;
  category: 'Polynome' | 'Trigonometrie' | 'Exponential' | 'Praxis';
  description: string;
  antiderivativeLatex?: string;
}

export interface QuizQuestion {
  id: string;
  category: 'prozent' | 'integral';
  difficulty: 'leicht' | 'mittel' | 'knifflig';
  title: string;
  question: string;
  latexQuestion?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  formulaHint?: string;
  visualData?: any;
}
