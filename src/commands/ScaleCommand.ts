import { Command } from './Command';
import { SvgDocument } from '../model/SvgDocument';

/** 等比缩放：factor 同乘到图形的全部几何属性。容器递归到每个子孙。 */
export class ScaleCommand implements Command {
  readonly undoable = true;

  constructor(private doc: SvgDocument, private id: string, private factor: number) {}

  execute(): string {
    const shape = this.doc.lookup(this.id);
    if (!shape) throw new Error(`no such shape: ${this.id}`);
    if (this.factor <= 0) throw new Error(`scale factor must be positive`);
    shape.scale(this.factor);
    return `${shape.kind}#${this.id} scaled by ${this.factor}`;
  }

  undo(): string {
    const shape = this.doc.lookup(this.id)!;
    shape.scale(1 / this.factor);
    return `${shape.kind}#${this.id} scaled by ${1 / this.factor}`;
  }
}
