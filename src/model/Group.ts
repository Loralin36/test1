/**
 * Group —— 复合图形节点（容器），Composite 模式中的“组合”角色。
 *
 * 与叶子图形一样继承自 Shape，因此其自身也能被 move / scale / delete，
 * 且这些操作会递归下沉到所有子孙 —— 调用方无需区分“容器”与“叶子”。
 */
import { Shape } from './Shape';

export class Group extends Shape {
  children: Shape[] = [];

  constructor(id: string) {
    super(id);
  }

  get kind(): string {
    return 'g';
  }

  settableAttrs(): string[] {
    // 容器本身没有几何/样式属性可设置（业务约束）。
    return [];
  }

  add(child: Shape): void {
    child.parent = this;
    this.children.push(child);
  }

  remove(child: Shape): void {
    const i = this.children.indexOf(child);
    if (i >= 0) {
      this.children.splice(i, 1);
      child.parent = null;
    }
  }

  /** 把 child 插入到指定索引位置（撤销时还原层级用）。 */
  insertAt(child: Shape, index: number): void {
    child.parent = this;
    this.children.splice(index, 0, child);
  }

  move(dx: number, dy: number): void {
    for (const c of this.children) c.move(dx, dy);
  }

  scale(factor: number): void {
    for (const c of this.children) c.scale(factor);
  }

  toSVG(): string {
    const inner = this.children.map((c) => c.toSVG()).join('');
    return `<g id="${this.id}">${inner}</g>`;
  }

  treeLine(): string {
    return `g#${this.id}`;
  }

  clone(): Shape {
    const g = new Group(this.id);
    g.attrs = { ...this.attrs };
    g.children = this.children.map((c) => {
      const cc = c.clone();
      cc.parent = g;
      return cc;
    });
    return g;
  }
}
