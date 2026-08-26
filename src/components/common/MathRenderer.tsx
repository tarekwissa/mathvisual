import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  latex: string;
  display?: boolean;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  latex,
  display = false,
  className = ''
}) => {
  const html = useMemo(() => {
    try {
      if (!latex || typeof latex !== 'string') return '';
      return katex.renderToString(latex, {
        displayMode: display,
        throwOnError: false,
        output: 'htmlAndMathml',
        strict: false
      });
    } catch {
      return `<span class="text-slate-300 font-mono text-xs">${latex || ''}</span>`;
    }
  }, [latex, display]);

  return (
    <span
      className={`inline-block select-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
