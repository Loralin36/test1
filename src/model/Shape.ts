/**
 * Shape —— 所有图形元素的抽象基类（领域模型核心）。
 *
 * 设计说明：
 *  - 这是一个“富领域模型”，每个图形都知道自己的几何与样式属性，
 *    以及如何在自身上执行 move / scale、序列化为 SVG、渲染为树行。
 *  - 叶子图形（rect/circle/...）与容器图形（Group）都继承自 Shape，
 *    对调用方而言是“统一操作”的 —— 这正是 Composite 模式的基础。
 *  - 属性存于 attrs 映射表，既便于 set 命令做白名单校验，也便于撤销时快照。
 */
import type { Group } from './Group';

export type AttrValue = string | number;
export type AttrMap = Record<string, AttrValue>;

export abstract class Shape {
  readonly id: string;
  protected attrs: AttrMap = {};
  parent: Group | null = null;

  constructor(id: string) {
    this.id = id;
  }

  /** 图形类型名（rect / circle / g ...），用于 tree/show 显示与工厂分发。 */
  abstract get kind(): string;

  /** 该类型允许被 `set` 修改的属性白名单（见作业 4.1）。 */
  abstract settableAttrs(): string[];

  getAttr(key: string): AttrValue | undefined {
    return this.attrs[key];
  }

  setAttr(key: string, value: AttrValue): void {
    this.attrs[key] = value;
  }

  /** 公开读取全部属性（供 show 等界面层使用）。 */
  getAttrs(): Readonly<AttrMap> {
    return this.attrs;
  }

  removeAttr(key: string): void {
    delete this.attrs[key];
  }

  /** 几何平移：dx/dy 为增量。容器需递归作用到子孙。 */
  abstract move(dx: number, dy: number): void;

  /** 等比缩放：factor 同乘到全部几何属性。容器需递归作用到子孙。 */
  abstract scale(factor: number): void;

  /** 序列化为 SVG 片段（不含子节点；Group 会自行拼接 children）。 */
  abstract toSVG(): string;

  /** 树形显示中的单行（内联关键几何属性）。 */
  abstract treeLine(): string;

  /** 深拷贝：用于撤销快照与 read 后独立文档。 */
  abstract clone(): Shape;

  /** 主定位点字符串，如 (120,100) 或 (cx,cy)，用于 move 回显。 */
  positionString(): string {
    if ('x' in this.attrs && 'y' in this.attrs) {
      return `(${this.attrs.x},${this.attrs.y})`;
    }
    if ('cx' in this.attrs && 'cy' in this.attrs) {
      return `(${this.attrs.cx},${this.attrs.cy})`;
    }
    if ('x1' in this.attrs && 'y1' in this.attrs) {
      return `(${this.attrs.x1},${this.attrs.y1})`;
    }
    return '';
  }

  /** 撤销 set 时保存/恢复属性快照。 */
  snapshotAttrs(): AttrMap {
    return { ...this.attrs };
  }

  restoreAttrs(snap: AttrMap): void {
    this.attrs = { ...snap };
  }
}
