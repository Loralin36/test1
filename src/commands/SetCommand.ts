import { Command } from './Command';
import { SvgDocument } from '../model/SvgDocument';

const NUMERIC_ATTRS = new Set([
  'x', 'y', 'width', 'height', 'cx', 'cy', 'r', 'rx', 'ry', 'x1', 'y1', 'x2', 'y2', 'stroke-width',
]);

/** 设置属性：受各类型白名单约束（作业 4.1）。 */
export class SetCommand implements Command {
  readonly undoable = true;
  private oldValue: string | number | undefined;
  private hadAttr = false;

  constructor(private doc: SvgDocument, private id: string, private attr: string, private value: string) {}

  execute(): string {
    const shape = this.doc.lookup(this.id);
    if (!shape) throw new Error(`no such shape: ${this.id}`);
    if (!shape.settableAttrs().includes(this.attr)) throw new Error(`unknown attribute: ${this.attr}`);

    this.hadAttr = shape.getAttr(this.attr) !== undefined;
    this.oldValue = shape.getAttr(this.attr);

    if (this.attr === 'text') {
      shape.setAttr('text', this.value);
    } else if (NUMERIC_ATTRS.has(this.attr)) {
      const n = Number(this.value);
      if (Number.isNaN(n)) throw new Error(`invalid number: ${this.value}`);
      shape.setAttr(this.attr, n);
    } else {
      shape.setAttr(this.attr, this.value);
    }
    return `${shape.kind}#${this.id} updated: ${this.attr}="${this.value}"`;
  }

  undo(): string {
    const shape = this.doc.lookup(this.id)!;
    if (this.hadAttr) shape.setAttr(this.attr, this.oldValue!);
    else shape.removeAttr(this.attr);
    const shown = this.hadAttr ? this.oldValue : '';
    return `${shape.kind}#${this.id} updated: ${this.attr}="${shown}"`;
  }
}
