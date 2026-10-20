import * as fs from 'fs';
import * as readline from 'readline';
import { SvgDocument } from '../model/SvgDocument';
import { Shape } from '../model/Shape';
import { Group } from '../model/Group';
import { CommandManager } from '../commands/CommandManager';
import { CreateCommand } from '../commands/CreateCommand';
import { DeleteCommand } from '../commands/DeleteCommand';
import { MoveCommand } from '../commands/MoveCommand';
import { ScaleCommand } from '../commands/ScaleCommand';
import { SetCommand } from '../commands/SetCommand';
import { GroupCommand } from '../commands/GroupCommand';
import { UngroupCommand } from '../commands/UngroupCommand';
import { AddToCommand } from '../commands/AddToCommand';
import { FrontBackCommand } from '../commands/FrontBackCommand';
import { tokenize } from './Parser';
import { writeSVG } from '../io/SvgWriter';
import { readSVG } from '../io/SvgReader';

const DOCLESS_ALLOWED = new Set(['init', 'read', 'help']);

/**
 * Repl —— 命令分发与交互（作业的“调用者/界面”角色）。
 * 支持两种用法：交互式（readline）与脚本回放（文件逐行）。
 */
export class Repl {
  private doc: SvgDocument | null = null;
  private manager = new CommandManager();
  private lastPath: string | null = null;

  runInteractive(): void {
    console.log('svg-editor 0.1 — type \'help\' for commands\n');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: 'svg> ' });
    rl.prompt();
    rl.on('line', (line) => {
      const out = this.process(line);
      if (out !== null) console.log(out);
      rl.prompt();
    });
    rl.on('close', () => process.exit(0));
  }

  runFile(path: string): void {
    if (!fs.existsSync(path)) {
      console.error(`error: cannot read file: ${path}`);
      process.exit(1);
    }
    const lines = fs.readFileSync(path, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) continue;
      console.log(`svg> ${line}`);
      const out = this.process(line);
      if (out !== null) console.log(out);
    }
  }

  /** 处理一行命令，返回要打印的输出；返回 null 表示无需输出（空行/注释）。 */
  process(line: string): string | null {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('#')) return null;

    const tokens = tokenize(trimmed);
    const cmd = tokens[0];
    const args = tokens.slice(1);

    if (!this.doc && !DOCLESS_ALLOWED.has(cmd)) {
      return 'error: no document. use \'init\' or \'read\' first';
    }

    try {
      switch (cmd) {
        case 'init':
          return this.doInit(args);
        case 'read':
          return this.doRead(args);
        case 'save':
          return this.doSave(args);
        case 'canvas':
          return this.doCanvas(args);
        case 'create':
          return this.doCreate(args);
        case 'delete':
          return this.manager.run(new DeleteCommand(this.doc!, args[0]));
        case 'move':
          return this.manager.run(new MoveCommand(this.doc!, args[0], Number(args[1]), Number(args[2])));
        case 'scale':
          return this.manager.run(new ScaleCommand(this.doc!, args[0], Number(args[1])));
        case 'set':
          return this.manager.run(new SetCommand(this.doc!, args[0], args[1], args.slice(2).join(' ')));
        case 'group':
          return this.manager.run(new GroupCommand(this.doc!, args[0], args.slice(1)));
        case 'ungroup':
          return this.manager.run(new UngroupCommand(this.doc!, args[0]));
        case 'addto':
          return this.manager.run(new AddToCommand(this.doc!, args[0], args[1]));
        case 'front':
          return this.manager.run(new FrontBackCommand(this.doc!, args[0], true));
        case 'back':
          return this.manager.run(new FrontBackCommand(this.doc!, args[0], false));
        case 'tree':
          return this.doTree(args);
        case 'show':
          return this.doShow(args);
        case 'undo':
          return this.manager.undo();
        case 'redo':
          return this.manager.redo();
        case 'help':
          return HELP_TEXT;
        default:
          return `error: unknown command: ${cmd}`;
      }
    } catch (e) {
      return `error: ${(e as Error).message}`;
    }
  }

  private doInit(args: string[]): string {
    const w = args.length >= 2 ? Number(args[0]) : 800;
    const h = args.length >= 2 ? Number(args[1]) : 600;
    if (Number.isNaN(w) || Number.isNaN(h)) throw new Error('invalid canvas size');
    this.doc = new SvgDocument(w, h);
    this.manager.reset();
    this.lastPath = null;
    this.manager.markIO();
    return `canvas ${w}x${h} created`;
  }

  private doRead(args: string[]): string {
    const file = args[0];
    if (!file) throw new Error('usage: read <file.svg>');
    if (!fs.existsSync(file)) throw new Error(`cannot read file: ${file}`);
    const warnings: string[] = [];
    const res = readSVG(fs.readFileSync(file, 'utf8'), (msg) => warnings.push(msg));
    this.doc = new SvgDocument(res.width, res.height);
    this.doc.load(res.root, res.width, res.height);
    this.manager.reset();
    this.lastPath = file;
    this.manager.markIO();
    const warn = warnings.map((w) => `warning: ${w}`).join('\n');
    return `${warn ? warn + '\n' : ''}read ${file} (${res.elementCount} elements)`;
  }

  private doSave(args: string[]): string {
    if (!this.doc) throw new Error('no document. use \'init\' or \'read\' first');
    const file = args[0] ?? this.lastPath ?? 'output.svg';
    fs.writeFileSync(file, writeSVG(this.doc), 'utf8');
    this.lastPath = file;
    this.manager.markIO();
    return `saved to ${file} (${this.doc.countElements()} elements)`;
  }

  private doCanvas(args: string[]): string {
    if (!this.doc) throw new Error('no document. use \'init\' or \'read\' first');
    if (args.length === 0) return `canvas ${this.doc.width}x${this.doc.height}`;
    if (args.length === 2) {
      const w = Number(args[0]);
      const h = Number(args[1]);
      if (Number.isNaN(w) || Number.isNaN(h)) throw new Error('invalid canvas size');
      this.doc.width = w;
      this.doc.height = h;
      this.manager.markIO();
      return `canvas ${w}x${h}`;
    }
    throw new Error('usage: canvas [w] [h]');
  }

  private doCreate(args: string[]): string {
    const type = args[0];
    const id = args[1];
    if (!type || !id) throw new Error('usage: create <type> <id> [params…] [in <containerId>]');
    let rest = args.slice(2);
    let containerId: string | undefined;
    const inIdx = rest.indexOf('in');
    if (inIdx >= 0) {
      containerId = rest[inIdx + 1];
      rest = rest.slice(0, inIdx);
    }
    return this.manager.run(new CreateCommand(this.doc!, type, id, rest, containerId));
  }

  private doTree(args: string[]): string {
    if (!this.doc) throw new Error('no document. use \'init\' or \'read\' first');
    if (args[0]) {
      const start = this.doc.lookup(args[0]);
      if (!start) throw new Error(`no such shape: ${args[0]}`);
      const lines = [start.treeLine()];
      if (start instanceof Group) this.appendTree(start, '', true, lines);
      return lines.join('\n');
    }
    const lines = [`svg (${this.doc.width}x${this.doc.height})`];
    this.doc.root.children.forEach((c, i) => this.appendTree(c, '', i === this.doc!.root.children.length - 1, lines));
    return lines.join('\n');
  }

  private appendTree(shape: Shape, prefix: string, isLast: boolean, lines: string[]): void {
    const connector = isLast ? '└── ' : '├── ';
    lines.push(prefix + connector + shape.treeLine());
    if (shape instanceof Group) {
      const childPrefix = prefix + (isLast ? '    ' : '│   ');
      shape.children.forEach((c, i) => this.appendTree(c, childPrefix, i === shape.children.length - 1, lines));
    }
  }

  private doShow(args: string[]): string {
    if (!this.doc) throw new Error('no document. use \'init\' or \'read\' first');
    const shape = this.doc.lookup(args[0]);
    if (!shape) throw new Error(`no such shape: ${args[0]}`);
    const parentLabel =
      shape.parent === null ? 'none' : shape.parent.id === 'svg' ? 'svg' : `g#${shape.parent.id}`;
    const lines = [`${shape.kind}#${shape.id}  parent=${parentLabel}`];
    for (const [k, v] of Object.entries(shape.getAttrs())) {
      lines.push(`  ${k}=${v}`);
    }
    return lines.join('\n');
  }
}

const HELP_TEXT = [
  'Commands:',
  '  init [w] [h]              new empty canvas (default 800x600)',
  '  read <file.svg>           load an SVG file as the current document',
  '  save [file.svg]           save document (defaults to last read path)',
  '  canvas [w] [h]            show or change canvas size',
  '  create <type> <id> [..] [in <c>]   create shape (rect/circle/ellipse/line/text/g)',
  '  delete <id>               delete a shape (and its descendants)',
  '  move <id> <dx> <dy>       translate by delta',
  '  scale <id> <factor>       uniform scale (factor > 0)',
  '  set <id> <attr> <value>   set an attribute (within whitelist)',
  '  group <gid> <id>…         new container collecting existing shapes',
  '  ungroup <gid>             dissolve a container, promote children',
  '  addto <gid> <id>          move an existing shape into a container',
  '  front <id> / back <id>    z-order (top / bottom of its siblings)',
  '  tree [id]                 show structure tree',
  '  show <id>                 show attribute details',
  '  undo / redo               undo / redo last edit command',
  '  help                      this message',
].join('\n');
