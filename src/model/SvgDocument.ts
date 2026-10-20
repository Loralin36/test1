/**
 * SvgDocument —— 当前文档模型（画布 + 全局 id 注册表）。
 *
 * 职责：
 *  - 持有画布根节点（id 固定为 "svg"），以及画布尺寸；
 *  - 维护 id → Shape 的全局注册表，保证 id 唯一、可被任意命令按 id 定位；
 *  - 注册/反注册会递归处理容器内的子孙；
 *  - 提供层级查询（isDescendant）供 group/addto 做合法性校验。
 */
import { Shape } from './Shape';
import { Group } from './Group';

export class SvgDocument {
  width: number;
  height: number;
  root: Group;
  private readonly registry = new Map<string, Shape>();

  constructor(width = 800, height = 600) {
    this.width = width;
    this.height = height;
    this.root = new Group('svg');
    this.registry.set('svg', this.root);
  }

  /** read 命令使用：用解析得到的根节点与尺寸替换当前文档内容。 */
  load(root: Group, width: number, height: number): void {
    this.registry.clear();
    this.root = root;
    this.width = width;
    this.height = height;
    this.register(root);
  }

  lookup(id: string): Shape | undefined {
    return this.registry.get(id);
  }

  isRegistered(id: string): boolean {
    return this.registry.has(id);
  }

  /** 递归注册一个子树（含其自身）。 */
  register(shape: Shape): void {
    this.registry.set(shape.id, shape);
    if (shape instanceof Group) {
      for (const c of shape.children) this.register(c);
    }
  }

  /** 递归反注册一个子树。 */
  unregister(shape: Shape): void {
    this.registry.delete(shape.id);
    if (shape instanceof Group) {
      for (const c of shape.children) this.unregister(c);
    }
  }

  /** 把 shape 作为 child 加入指定容器（按 id 查找）。返回是否成功。 */
  addToContainer(shape: Shape, containerId: string): boolean {
    const parent = this.lookup(containerId);
    if (!parent || !(parent instanceof Group)) return false;
    parent.add(shape);
    this.register(shape);
    return true;
  }

  /** 判断 descendant 是否为 ancestor 的子孙（含自身）。 */
  isDescendant(ancestor: Shape, descendant: Shape): boolean {
    if (ancestor === descendant) return true;
    if (ancestor instanceof Group) {
      for (const c of ancestor.children) {
        if (this.isDescendant(c, descendant)) return true;
      }
    }
    return false;
  }

  /** 元素总数（不含画布根自身），用于 save/read 的计数回显。 */
  countElements(): number {
    let n = 0;
    const walk = (s: Shape): void => {
      if (s !== this.root) n++;
      if (s instanceof Group) s.children.forEach(walk);
    };
    this.root.children.forEach(walk);
    return n;
  }
}
