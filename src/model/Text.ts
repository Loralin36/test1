import { Shape } from './Shape';
import { withFill } from './Rect';

/** text —— 文本。参数：x y "content" [fill]。文本内容存于 attrs.text。 */
export class Text extends Shape {
  constructor(id: string, x: number, y: number, content: string, fill?: string) {
    super(id);
    this.attrs.x = x;
    this.attrs.y = y;
    this.attrs.text = content;
    if (fill !== undefined) this.attrs.fill = fill;
  }

  get kind(): string {
    return 'text';
  }

  settableAttrs(): string[] {
    return ['x', 'y', 'fill', 'stroke', 'stroke-width', 'text'];
  }

  move(dx: number, dy: number): void {
    this.attrs.x = (this.attrs.x as number) + dx;
    this.attrs.y = (this.attrs.y as number) + dy;
  }

  scale(f: number): void {
    this.attrs.x = (this.attrs.x as number) * f;
    this.attrs.y = (this.attrs.y as number) * f;
  }

  toSVG(): string {
    const a = this.attrs;
    let s = `<text id="${this.id}" x="${a.x}" y="${a.y}"`;
    if (a.fill !== undefined) s += ` fill="${a.fill}"`;
    return `${s}>${a.text}</text>`;
  }

  treeLine(): string {
    const a = this.attrs;
    return `text#${this.id} (${a.x},${a.y}) "${a.text}"` + withFill(a.fill);
  }

  clone(): Shape {
    const t = new Text(this.id, this.attrs.x as number, this.attrs.y as number, this.attrs.text as string);
    if (this.attrs.fill !== undefined) t.attrs.fill = this.attrs.fill;
    if (this.attrs.stroke !== undefined) t.attrs.stroke = this.attrs.stroke;
    if (this.attrs['stroke-width'] !== undefined) t.attrs['stroke-width'] = this.attrs['stroke-width'];
    return t;
  }
}
