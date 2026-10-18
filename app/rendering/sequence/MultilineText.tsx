import type { SVGProps } from "react";

const LINE_HEIGHT = 16;

/** Line breaks of every kind the model may hold. */
const BREAKS = /\r\n|[\n\r\u2028\u2029]/;

/** Text in an SVG drawing with one `tspan` per line, since a line break does not break a line there. */
export function MultilineText({ text, x, y, ...rest }: Readonly<{ text: string; x: number; y: number } & Omit<SVGProps<SVGTextElement>, "x" | "y">>) {
  const lines = text.split(BREAKS);
  return (
    <text x={x} y={y} {...rest}>
      {lines.map((line, index) => (
        // The lines of one text never change position independently, so the index is a stable key.
        <tspan key={index} x={x} dy={index === 0 ? 0 : LINE_HEIGHT} data-testid="line">
          {line}
        </tspan>
      ))}
    </text>
  );
}
