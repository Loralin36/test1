import { Command } from './Command';
import { SvgDocument } from '../model/SvgDocument';
import { Group } from '../model/Group';

/** 把已有图形移入容器（作为最后一个子节点）。 */
export class AddToCommand implements Command {
  readonly undoable = true;
  private oldParent: Group | null = null;
  private oldIndex = -1;

  constructor(private doc: SvgDocument, private gid: string, private id: string) {}

  execute(): string {
    const container = this.doc.lookup(this.gid);
    if (!container) throw new Error(`no such container: ${this.gid}`);
    if (!(container instanceof Group)) throw new Error(`not a container: ${this.gid}`);
    const shape = this.doc.lookup(this.id);
    if (!shape) throw new Error(`no such shape: ${this.id}`);

    // 不能把容器移入它自身或它已有的子孙（会形成环）。
    if (shape === container || this.doc.isDescendant(shape, container)) {
      throw new Error(`cannot group a container into its own descendant: ${this.gid}`);
    }

    this.oldParent = shape.parent as Group;
    this.oldIndex = this.oldParent.children.indexOf(shape);
    this.oldParent.remove(shape);
    container.add(shape);
    return `${shape.kind}#${this.id} added to g#${this.gid}`;
  }

  undo(): string {
    const shape = this.doc.lookup(this.id)!;
    const container = this.doc.lookup(this.gid)! as Group;
    container.remove(shape);
    this.oldParent!.insertAt(shape, this.oldIndex);
    return `${shape.kind}#${this.id} removed from g#${this.gid}`;
  }
}
