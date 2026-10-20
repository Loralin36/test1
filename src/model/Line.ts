import { Shape } from './Shape';

/** line —— 线段。参数：x1 y1 x2 y2 [stroke]。 */
export class Line extends Shape {
  constructor(id: string, x1: number, y1: number, x2: number, y2: number, stroke?: string) {
    super(id);
    this.attrs.x1 = x1;
    this.attrs.y1 = y1;
    this.attrs.x2 = x2;
    this.attrs.y2 = y2;
    if (stroke !== undefined) this.attrs.stroke = stroke;
  }

  get kind(): string {
    return 'line';
  }

  settableAttrs(): string[] {
    return ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width'];
  }

  move(dx: number, dy: number): void {
    this.attrs.x1 = (this.attrs.x1 as number) + dx;
    this.attrs.y1 = (this.attrs.y1 as number) + dy;
    this.attrs.x2 = (this.attrs.x2 as number) + dx;
    this.attrs.y2 = (this.attrs.y2 as number) + dy;
  }

  scale(f: number): void {
    this.attrs.x1 = (this.attrs.x1 as number) * f;
    this.attrs.y1 = (this.attrs.y1 as number) * f;
    this.attrs.x2 = (this.attrs.x2 as number) * f;
    this.attrs.y2 = (this.attrs.y2 as number) * f;
  }

  toSVG(): string {
    const a = this.attrs;
    let s = `<line id="${this.id}" x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}"`;
    if (a.stroke !== undefined) s += ` stroke="${a.stroke}"`;
    return s + `/>`;
  }

  treeLine(): string {
    const a = this.attrs;
    const stroke = a.stroke !== undefined ? ` stroke=${a.stroke}` : '';
    return `line#${this.id} (${a.x1},${a.y1})-(${a.x2},${a.y2})${stroke}`;
  }

  clone(): Shape {
    const l = new Line(this.id, this.attrs.x1 as number, this.attrs.y1 as number, this.attrs.x2 as number, this.attrs.y2 as number);
    if (this.attrs.stroke !== undefined) l.attrs.stroke = this.attrs.stroke;
    if (this.attrs['stroke-width'] !== undefined) l.attrs['stroke-width'] = this.attrs['stroke-width'];
    return l;
  }
}
