import { Shape } from './Shape';
import { withFill } from './Rect';

/** circle —— 圆。参数：cx cy r [fill]。 */
export class Circle extends Shape {
  constructor(id: string, cx: number, cy: number, r: number, fill?: string) {
    super(id);
    this.attrs.cx = cx;
    this.attrs.cy = cy;
    this.attrs.r = r;
    if (fill !== undefined) this.attrs.fill = fill;
  }

  get kind(): string {
    return 'circle';
  }

  settableAttrs(): string[] {
    return ['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width'];
  }

  move(dx: number, dy: number): void {
    this.attrs.cx = (this.attrs.cx as number) + dx;
    this.attrs.cy = (this.attrs.cy as number) + dy;
  }

  scale(f: number): void {
    this.attrs.cx = (this.attrs.cx as number) * f;
    this.attrs.cy = (this.attrs.cy as number) * f;
    this.attrs.r = (this.attrs.r as number) * f;
  }

  toSVG(): string {
    const a = this.attrs;
    let s = `<circle id="${this.id}" cx="${a.cx}" cy="${a.cy}" r="${a.r}"`;
    if (a.fill !== undefined) s += ` fill="${a.fill}"`;
    return s + `/>`;
  }

  treeLine(): string {
    const a = this.attrs;
    return `circle#${this.id} cx=${a.cx} cy=${a.cy} r=${a.r}` + withFill(a.fill);
  }

  clone(): Shape {
    const c = new Circle(this.id, this.attrs.cx as number, this.attrs.cy as number, this.attrs.r as number);
    if (this.attrs.fill !== undefined) c.attrs.fill = this.attrs.fill;
    if (this.attrs.stroke !== undefined) c.attrs.stroke = this.attrs.stroke;
    if (this.attrs['stroke-width'] !== undefined) c.attrs['stroke-width'] = this.attrs['stroke-width'];
    return c;
  }
}
