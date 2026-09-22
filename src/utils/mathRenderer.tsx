import React from 'react';
import katex from 'katex';

/**
 * Safely render LaTeX string to HTML
 */
export function renderLatexToHtml(latex: string, displayMode: boolean = false): string {
  try {
    return katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError: false
    });
  } catch (err) {
    return `<span class="text-red-400 font-mono text-xs">[Lỗi công thức: ${latex}]</span>`;
  }
}

/**
 * Render mixed text and LaTeX ($...$, $$...$$, \(...\), \[...\]) into React elements.
 * Guarantees that formulas remain strictly INLINE with surrounding text on the same line,
 * and only breaks lines where the user explicitly inserted a newline ('\n').
 */
export function renderMixedMathContent(content: string): React.ReactNode {
  if (!content) return null;

  // Quick exit if no math syntax
  if (!content.includes('$') && !content.includes('\\(') && !content.includes('\\[') && !content.includes('\\begin')) {
    return content;
  }

  // Regex to match LaTeX expressions:
  // 1. $$ ... $$
  // 2. $ ... $
  // 3. \[ ... \]
  // 4. \( ... \)
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\$]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g;

  // Split content by explicit user newlines first so user Enter keys are strictly respected
  const lines = content.split('\n');

  return (
    <>
      {lines.map((line, lineIdx) => {
        // If line contains no math delimiters, render standard text
        if (!line.includes('$') && !line.includes('\\(') && !line.includes('\\[')) {
          return (
            <React.Fragment key={lineIdx}>
              {lineIdx > 0 && '\n'}
              {line}
            </React.Fragment>
          );
        }

        const parts = line.split(mathRegex);

        // Check if this entire line is ONLY a standalone block equation with no surrounding text
        const trimmed = line.trim();
        const isStandaloneBlock =
          (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4 && parts.filter(p => p.trim()).length === 1) ||
          (trimmed.startsWith('\\[') && trimmed.endsWith('\\]') && trimmed.length > 4 && parts.filter(p => p.trim()).length === 1);

        const renderedLine = parts.map((part, partIdx) => {
          let formula = '';
          let isMath = false;

          if (part.startsWith('$$') && part.endsWith('$$')) {
            formula = part.slice(2, -2);
            isMath = true;
          } else if (part.startsWith('$') && part.endsWith('$')) {
            formula = part.slice(1, -1);
            isMath = true;
          } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
            formula = part.slice(2, -2);
            isMath = true;
          } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
            formula = part.slice(2, -2);
            isMath = true;
          }

          if (isMath) {
            // If the line has other text on it (like "giả sử $v$ là vận tốc"),
            // ALWAYS force displayMode: false so it never breaks the sentence into multiple lines!
            const displayMode = isStandaloneBlock;
            const html = renderLatexToHtml(formula, displayMode);

            return (
              <span
                key={partIdx}
                className={
                  isStandaloneBlock
                    ? "inline-block w-full text-center my-1 select-none"
                    : "inline-block px-0.5 align-baseline select-none"
                }
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }

          return <React.Fragment key={partIdx}>{part}</React.Fragment>;
        });

        return (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && '\n'}
            {renderedLine}
          </React.Fragment>
        );
      })}
    </>
  );
}
