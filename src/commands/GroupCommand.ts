import { Command } from './Command';
import { SvgDocument } from '../model/SvgDocument';
import { Shape } from '../model/Shape';
import { Group } from '../model/Group';

interface Relocation {
  shape: Shape;
  parent: Group;
  index: number;
}

/** 新建容器并收编若干已有图形（从各自原父容器摘出，保持相对顺序）。 */
export class GroupCommand implements Command {
  readonly undoable = true;
  private createdGroup: Group | null = null;
  private relocations: Relocation[] = [];

  constructor(private doc: SvgDocument, private newGid: string, private ids: string[]) {}

  execute(): string {
    if (this.doc.isRegistered(this.newGid)) throw new Error(`id already exists: ${this.newGid}`);

    for (const id of this.ids) {
      if (!this.doc.lookup(id)) throw new Error(`no such shape: ${id}`);
    }

    // 不能把一个容器和它的某个子孙一起 group（会形成环）。
    for (const id of this.ids) {
      const s = this.doc.lookup(id)!;
      if (s instanceof Group) {
        for (const other of this.ids) {
          if (other === id) continue;
          if (this.doc.isDescendant(s, this.doc.lookup(other)!)) {
            throw new Error(`cannot group a container into its own descendant: ${id}`);
          }
        }
      }
    }

    const g = new Group(this.newGid);
    this.relocations = [];
    for (const id of this.ids) {
      const s = this.doc.lookup(id)!;
      const p = s.parent as Group;
      const idx = p.children.indexOf(s);
      p.remove(s);
      this.relocations.push({ shape: s, parent: p, index: idx });
    }
    for (const r of this.relocations) g.add(r.shape);
    this.doc.root.add(g);
    this.doc.register(g);
    this.createdGroup = g;
    return `g#${this.newGid} created with ${this.ids.length} children`;
  }

  undo(): string {
    const g = this.createdGroup!;
    for (const r of this.relocations) {
      g.remove(r.shape);
      r.parent.insertAt(r.shape, r.index);
    }
    this.doc.root.remove(g);
    this.doc.unregister(g);
    return `g#${this.newGid} dissolved`;
  }
}
