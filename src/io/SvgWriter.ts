import { SvgDocument } from '../model/SvgDocument';

/** 把文档序列化为 SVG 文本（可直接在浏览器打开）。 */
export function writeSVG(doc: SvgDocument): string {
  const body = doc.root.children
    .map((c) => c.toSVG())
    .join('\n  ');
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${doc.width}" height="${doc.height}" viewBox="0 0 ${doc.width} ${doc.height}">\n` +
    `  ${body}\n` +
    `</svg>\n`
  );
}
