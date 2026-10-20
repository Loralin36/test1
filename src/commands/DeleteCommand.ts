import { Command } from './Command';
import { SvgDocument } from '../model/SvgDocument';
import { Group } from '../model/Group';

/** 删除图形（容器则连同全部子孙一并删除）。 */
export class DeleteCommand implements Command {
  readonly undoable = true;
  private removed: import('../model/Shape').Shape | null = null;
  private parent: Group | null = null;
  private index = -1;

  constructor(private doc: SvgDocument, private id: string) {}

  execute(): string {
    const shape = this.doc.lookup(this.id);
    if (!shape) throw new Error(`no such shape: ${this.id}`);
    if (shape === this.doc.root) throw new Error(`cannot delete canvas`);
    this.parent = shape.parent as Group;
    this.index = this.parent.children.indexOf(shape);
    this.removed = shape;
    this.parent.remove(shape);
    this.doc.unregister(shape);
    return `${shape.kind}#${this.id} deleted`;
  }

  undo(): string {
    const shape = this.removed!;
    this.parent!.insertAt(shape, this.index);
    this.doc.register(shape);
    const where = this.parent !== this.doc.root ? ` into g#${this.parent!.id}` : '';
    return `${shape.kind}#${this.id} restored${where}`;
  }
}
