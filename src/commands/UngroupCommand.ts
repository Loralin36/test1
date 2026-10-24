import { Command } from './Command';
import { SvgDocument } from '../model/SvgDocument';
import { Shape } from '../model/Shape';
import { Group } from '../model/Group';

/** 解散容器：子图形提升到原容器的父级、占据原容器的位置。 */
export class UngroupCommand implements Command {
  readonly undoable = true;
  private ungrouped: Group | null = null;
  private parent: Group | null = null;
  private index = -1;
  private children: Shape[] = [];

  constructor(private doc: SvgDocument, private id: string) {}

  execute(): string {
    const shape = this.doc.lookup(this.id);
    if (!shape) throw new Error(`no such shape: ${this.id}`);
    if (!(shape instanceof Group)) throw new Error(`not a container: ${this.id}`);
    if (shape === this.doc.root) {
      throw new Error(`cannot ungroup canvas root`);
    }

    const parent = shape.parent as Group;
    this.parent = parent;
    this.index = parent.children.indexOf(shape);
    this.children = shape.children.slice();
    this.ungrouped = shape;

    parent.remove(shape);
    for (let i = 0; i < this.children.length; i++) {
      const c = this.children[i];
      shape.remove(c);
      parent.insertAt(c, this.index + i);
    }
    this.doc.unregister(shape);
    return `g#${this.id} ungrouped (${this.children.length} children promoted)`;
  }

  undo(): string {
    const g = this.ungrouped!;
    for (const c of this.children) {
      const p = c.parent as Group;
      p.remove(c);
      g.add(c);
    }
    this.parent!.insertAt(g, this.index);
    this.doc.register(g);
    return `g#${this.id} regrouped`;
  }
}
