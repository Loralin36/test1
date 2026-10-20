/**
 * ShapeFactory —— 图形工厂。作业允许的“两处按名字分派”之一（类型名 → 类）。
 *
 * 内核内置六种类型：rect / circle / ellipse / line / text / g。
 * 其它类型（如后续插件化阶段的 box）在此报 `unknown shape type`，
 * 由调用方负责报出与插件相关的提示。
 */
import { Shape } from './Shape';
import { Rect } from './Rect';
import { Circle } from './Circle';
import { Ellipse } from './Ellipse';
import { Line } from './Line';
import { Text } from './Text';
import { Group } from './Group';

export type ShapeBuilder = (id: string, args: string[]) => Shape;

const BUILDERS: Record<string, ShapeBuilder> = {
  rect: (id, a) => new Rect(id, reqNum(a, 0), reqNum(a, 1), reqNum(a, 2), reqNum(a, 3), a[4]),
  circle: (id, a) => new Circle(id, reqNum(a, 0), reqNum(a, 1), reqNum(a, 2), a[3]),
  ellipse: (id, a) => new Ellipse(id, reqNum(a, 0), reqNum(a, 1), reqNum(a, 2), reqNum(a, 3), a[4]),
  line: (id, a) => new Line(id, reqNum(a, 0), reqNum(a, 1), reqNum(a, 2), reqNum(a, 3), a[4]),
  text: (id, a) => new Text(id, reqNum(a, 0), reqNum(a, 1), reqText(a, 2), a[3]),
  g: (id) => new Group(id),
};

export function knownTypes(): string[] {
  return Object.keys(BUILDERS);
}

export function isKnownType(type: string): boolean {
  return type in BUILDERS;
}

export function createShape(type: string, id: string, args: string[]): Shape {
  const builder = BUILDERS[type];
  if (!builder) {
    throw new Error(`unknown shape type: ${type} (is the plugin loaded?)`);
  }
  return builder(id, args);
}

function reqNum(args: string[], i: number): number {
  const v = args[i];
  if (v === undefined) throw new Error(`missing numeric argument at position ${i + 1}`);
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`invalid number: ${v}`);
  return n;
}

function reqText(args: string[], i: number): string {
  const v = args[i];
  if (v === undefined) throw new Error('missing text content (quote it)');
  return v;
}
