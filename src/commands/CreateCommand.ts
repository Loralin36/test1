import { Command } from './Command';
import { SvgDocument } from '../model/SvgDocument';
import { Shape } from '../model/Shape';
import { Group } from '../model/Group';
import { createShape, isKnownType } from '../model/ShapeFactory';

/** 创建图形（可挂到指定容器）。 */
export class CreateCommand implements Command {
  readonly undoable = true;
  private created: Shape | null = null;

  constructor(
    private doc: SvgDocument,
    private type: string,
    private id: string,
    private args: string[],
    private containerId?: string,
  ) {}

  execute(): string {
    if (this.doc.isRegistered(this.id)) throw new Error(`id already exists: ${this.id}`);
    if (!isKnownType(this.type)) throw new Error(`unknown shape type: ${this.type} (is the plugin loaded?)`);
    const shape = createShape(this.type, this.id, this.args);
    if (this.containerId !== undefined) {
      const parent = this.doc.lookup(this.containerId);
      if (!parent) throw new Error(`no such container: ${this.containerId}`);
      if (!(parent instanceof Group)) throw new Error(`not a container: ${this.containerId}`);
      parent.add(shape);
      this.doc.register(shape);
      this.created = shape;
      return `${this.type}#${this.id} created in g#${this.containerId}`;
    }
    this.doc.root.add(shape);
    this.doc.register(shape);
    this.created = shape;
    return `${this.type}#${this.id} created`;
  }

  undo(): string {
    const shape = this.created!;
    if (shape.parent) shape.parent.remove(shape);
    this.doc.unregister(shape);
    return `${this.type}#${this.id} removed`;
  }
}
