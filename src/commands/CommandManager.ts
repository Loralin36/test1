/**
 * CommandManager —— 撤销/重做管理器（Command 模式的“调用者/历史”角色）。
 *
 * 关键规则（作业 4.3）：
 *  - 一条编辑命令 = 一个撤销单元；
 *  - 文档类命令（init/read/save/canvas 改尺寸）执行后，undo/redo 被禁用，
 *    直到下一次编辑命令将其重新解禁（markIO / run 配合）；
 *  - undo 之后若有新编辑，redo 栈清空（见 run 中重置 redoStack）。
 */
import { Command } from './Command';

export class CommandManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private ioLocked = false;

  /** 执行一个可撤销的编辑命令，并记录到历史。 */
  run(cmd: Command): string {
    const msg = cmd.execute();
    if (cmd.undoable) {
      this.undoStack.push(cmd);
      this.redoStack = [];
      this.ioLocked = false; // 一次新编辑重新解禁 undo/redo
    }
    return msg;
  }

  /** 文档类/IO 命令执行后调用：禁止 undo/redo，直到下一次编辑。 */
  markIO(): void {
    this.ioLocked = true;
  }

  undo(): string {
    if (this.ioLocked) return 'error: undo not allowed after io command';
    const cmd = this.undoStack.pop();
    if (!cmd) return 'error: nothing to undo';
    const msg = cmd.undo();
    this.redoStack.push(cmd);
    return msg;
  }

  redo(): string {
    if (this.ioLocked) return 'error: undo not allowed after io command';
    const cmd = this.redoStack.pop();
    if (!cmd) return 'error: nothing to redo';
    const msg = cmd.execute();
    this.undoStack.push(cmd);
    return msg;
  }

  /** 切换文档（init/read）时清空全部历史。 */
  reset(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.ioLocked = false;
  }
}
