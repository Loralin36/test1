import { Command } from './Command';
import { SvgDocument } from '../model/SvgDocument';

/** 平移（增量）。作用于容器时整体平移（递归）。 */
export class MoveCommand implements Command {
  readonly undoable = true;
  private before = '';

  constructor(private doc: SvgDocument, private id: string, private dx: number, private dy: number) {}

  execute(): string {
    const shape = this.doc.lookup(this.id);
    if (!shape) throw new Error(`no such shape: ${this.id}`);
    this.before = shape.positionString();
    shape.move(this.dx, this.dy);
    return `${shape.kind}#${this.id} moved to ${shape.positionString()}`;
  }

  undo(): string {
    const shape = this.doc.lookup(this.id)!;
    shape.move(-this.dx, -this.dy);
    return `${shape.kind}#${this.id} moved back to ${this.before}`;
  }
}
