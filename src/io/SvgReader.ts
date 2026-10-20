import { Group } from '../model/Group';
import { Rect } from '../model/Rect';
import { Circle } from '../model/Circle';
import { Ellipse } from '../model/Ellipse';
import { Line } from '../model/Line';
import { Text } from '../model/Text';
import { Shape } from '../model/Shape';

export interface ReadResult {
  width: number;
  height: number;
  root: Group;
  elementCount: number;
}

function parseAttrs(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([\w:-]+)\s*=\s*"([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) out[m[1]] = m[2];
  return out;
}

/**
 * 解析 SVG 文本为文档模型。
 *  - 仅识别 svg / g / rect / circle / ellipse / line / text 七种标签；
 *  - 其它标签（defs、style、注释等）被忽略；
 *  - 缺 id 的元素按 `标签名+序号` 自动分配并打印警告（作业 4.2）。
 */
export function readSVG(text: string, emitWarning: (msg: string) => void): ReadResult {
  const root = new Group('svg');
  let width = 800;
  let height = 600;
  let autoCounter = 0;
  const stack: Shape[] = [];
  const nextId = (tag: string): string => `${tag}${++autoCounter}`;

  const tagRe = /<(\/?)([a-zA-Z]+)([^>]*?)(\/?)>/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(text)) !== null) {
    const closing = m[1] === '/';
    const tag = m[2];
    const attrStr = m[3];
    const selfClose = m[4] === '/';

    if (closing) {
      if (tag === 'svg' && stack[stack.length - 1] === root) {
        stack.pop();
      } else if (
        stack.length > 0 &&
        stack[stack.length - 1] instanceof Group &&
        (stack[stack.length - 1] as Group).kind === tag &&
        tag !== 'svg'
      ) {
        stack.pop();
      }
      continue;
    }

    const parent = stack.length > 0 ? (stack[stack.length - 1] as Group) : root;

    if (tag === 'svg') {
      const a = parseAttrs(attrStr);
      if (a.width !== undefined) width = Number(a.width);
      if (a.height !== undefined) height = Number(a.height);
      stack.push(root);
      continue;
    }

    if (tag === 'g') {
      const a = parseAttrs(attrStr);
      let id = a.id;
      if (id === undefined) {
        id = nextId('g');
        emitWarning(`assigned id ${id} to unnamed <g>`);
      }
      const g = new Group(id);
      parent.add(g);
      stack.push(g);
      continue;
    }

    const shape = buildLeaf(tag, attrStr, emitWarning, nextId);
    if (shape) {
      parent.add(shape);
      if (tag === 'text' && !selfClose) {
        const after = tagRe.lastIndex;
        const rest = text.slice(after);
        const endIdx = rest.indexOf('</text>');
        const content = endIdx >= 0 ? rest.slice(0, endIdx) : '';
        shape.setAttr('text', content);
        tagRe.lastIndex = after + (endIdx >= 0 ? endIdx + '</text>'.length : 0);
      }
    }
  }

  let elementCount = 0;
  const walk = (s: Shape): void => {
    if (s !== root) elementCount++;
    if (s instanceof Group) s.children.forEach(walk);
  };
  root.children.forEach(walk);

  return { width, height, root, elementCount };
}

function buildLeaf(
  tag: string,
  attrStr: string,
  emitWarning: (msg: string) => void,
  nextId: (tag: string) => string,
): Shape | null {
  const a = parseAttrs(attrStr);
  let id = a.id;
  if (id === undefined) {
    id = nextId(tag);
    emitWarning(`assigned id ${id} to unnamed <${tag}>`);
  }
  switch (tag) {
    case 'rect':
      return new Rect(id, num(a.x), num(a.y), num(a.width), num(a.height), a.fill);
    case 'circle':
      return new Circle(id, num(a.cx), num(a.cy), num(a.r), a.fill);
    case 'ellipse':
      return new Ellipse(id, num(a.cx), num(a.cy), num(a.rx), num(a.ry), a.fill);
    case 'line':
      return new Line(id, num(a.x1), num(a.y1), num(a.x2), num(a.y2), a.stroke);
    case 'text':
      return new Text(id, num(a.x), num(a.y), '', a.fill);
    default:
      return null;
  }
}

function num(v: string | undefined): number {
  return v === undefined ? 0 : Number(v);
}
