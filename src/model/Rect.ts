import { Shape } from './Shape';

/** rect —— 矩形。参数：x y width height [fill]。 */
export class Rect extends Shape {
  constructor(id: string, x: number, y: number, width: number, height: number, fill?: string) {
    super(id);
    this.attrs.x = x;
    this.attrs.y = y;
    this.attrs.width = width;
    this.attrs.height = height;
    if (fill !== undefined) this.attrs.fill = fill;
  }

  get kind(): string {
    return 'rect';
  }

  settableAttrs(): string[] {
    return ['x', 'y', 'width', 'height', 'fill', 'stroke', 'stroke-width'];
  }

  move(dx: number, dy: number): void {
    this.attrs.x = (this.attrs.x as number) + dx;
    this.attrs.y = (this.attrs.y as number) + dy;
  }

  scale(f: number): void {
    this.attrs.x = (this.attrs.x as number) * f;
    this.attrs.y = (this.attrs.y as number) * f;
    this.attrs.width = (this.attrs.width as number) * f;
    this.attrs.height = (this.attrs.height as number) * f;
  }

  toSVG(): string {
    const a = this.attrs;
    let s = `<rect id="${this.id}" x="${a.x}" y="${a.y}" width="${a.width}" height="${a.height}"`;
    if (a.fill !== undefined) s += ` fill="${a.fill}"`;
    return s + `/>`;
  }

  treeLine(): string {
    const a = this.attrs;
    return `rect#${this.id} x=${a.x} y=${a.y} w=${a.width} h=${a.height}` + withFill(a.fill);
  }

  clone(): Shape {
    const r = new Rect(this.id, this.attrs.x as number, this.attrs.y as number, this.attrs.width as number, this.attrs.height as number);
    if (this.attrs.fill !== undefined) r.attrs.fill = this.attrs.fill;
    if (this.attrs.stroke !== undefined) r.attrs.stroke = this.attrs.stroke;
    if (this.attrs['stroke-width'] !== undefined) r.attrs['stroke-width'] = this.attrs['stroke-width'];
    return r;
  }
}

export function withFill(fill: unknown): string {
  return fill !== undefined ? ` fill=${fill}` : '';
}
