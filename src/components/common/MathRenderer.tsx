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
      return katex.renderToString(latex, {
        displayMode: display,
        throwOnError: false,
        output: 'htmlAndMathml'
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return `<span class="text-rose-400 font-mono text-xs">${latex}</span>`;
    }
  }, [latex, display]);

  return (
    <span
      className={`inline-block select-none ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
