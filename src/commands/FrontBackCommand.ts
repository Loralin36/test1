import { Command } from './Command';
import { SvgDocument } from '../model/SvgDocument';
import { Group } from '../model/Group';

/** 调整 z-order：同级最前（front）或最后（back）。 */
export class FrontBackCommand implements Command {
  readonly undoable = true;
  private oldIndex = -1;

  constructor(private doc: SvgDocument, private id: string, private toFront: boolean) {}

  execute(): string {
    const shape = this.doc.lookup(this.id);
    if (!shape) throw new Error(`no such shape: ${this.id}`);
    const parent = shape.parent as Group;
    const i = parent.children.indexOf(shape);
    parent.children.splice(i, 1);
    if (this.toFront) parent.children.push(shape);
    else parent.children.unshift(shape);
    this.oldIndex = i;
    return `${shape.kind}#${this.id} moved to ${this.toFront ? 'front' : 'back'}`;
  }

  undo(): string {
    const shape = this.doc.lookup(this.id)!;
    const parent = shape.parent as Group;
    const cur = parent.children.indexOf(shape);
    parent.children.splice(cur, 1);
    parent.insertAt(shape, this.oldIndex);
    return `${shape.kind}#${this.id} z-order restored`;
  }
}
