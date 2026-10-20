import { Shape } from './Shape';
import { withFill } from './Rect';

/** ellipse —— 椭圆。参数：cx cy rx ry [fill]。 */
export class Ellipse extends Shape {
  constructor(id: string, cx: number, cy: number, rx: number, ry: number, fill?: string) {
    super(id);
    this.attrs.cx = cx;
    this.attrs.cy = cy;
    this.attrs.rx = rx;
    this.attrs.ry = ry;
    if (fill !== undefined) this.attrs.fill = fill;
  }

  get kind(): string {
    return 'ellipse';
  }

  settableAttrs(): string[] {
    return ['cx', 'cy', 'rx', 'ry', 'fill', 'stroke', 'stroke-width'];
  }

  move(dx: number, dy: number): void {
    this.attrs.cx = (this.attrs.cx as number) + dx;
    this.attrs.cy = (this.attrs.cy as number) + dy;
  }

  scale(f: number): void {
    this.attrs.cx = (this.attrs.cx as number) * f;
    this.attrs.cy = (this.attrs.cy as number) * f;
    this.attrs.rx = (this.attrs.rx as number) * f;
    this.attrs.ry = (this.attrs.ry as number) * f;
  }

  toSVG(): string {
    const a = this.attrs;
    let s = `<ellipse id="${this.id}" cx="${a.cx}" cy="${a.cy}" rx="${a.rx}" ry="${a.ry}"`;
    if (a.fill !== undefined) s += ` fill="${a.fill}"`;
    return s + `/>`;
  }

  treeLine(): string {
    const a = this.attrs;
    return `ellipse#${this.id} cx=${a.cx} cy=${a.cy} rx=${a.rx} ry=${a.ry}` + withFill(a.fill);
  }

  clone(): Shape {
    const e = new Ellipse(this.id, this.attrs.cx as number, this.attrs.cy as number, this.attrs.rx as number, this.attrs.ry as number);
    if (this.attrs.fill !== undefined) e.attrs.fill = this.attrs.fill;
    if (this.attrs.stroke !== undefined) e.attrs.stroke = this.attrs.stroke;
    if (this.attrs['stroke-width'] !== undefined) e.attrs['stroke-width'] = this.attrs['stroke-width'];
    return e;
  }
}
