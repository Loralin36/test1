/**
 * Command —— 命令接口（Command 模式核心）。
 *
 * 每个“图形编辑类”命令都实现该接口：execute() 执行并把成功摘要返回，
 * undo() 反向执行并把撤销摘要返回。undoable 标记它是否进入撤销栈
 * （所有编辑命令都应为 true；文档类/显示类命令不走此接口）。
 */
export interface Command {
  readonly undoable: boolean;
  execute(): string;
  undo(): string;
}
