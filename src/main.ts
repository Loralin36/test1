import { Repl } from './repl/Repl';

/**
 * 入口：
 *  - 不带参数 → 交互式 REPL（终端里一行行输入）；
 *  - 带一个文件路径参数 → 脚本回放（便于把命令序列存成 .session 反复演练）。
 */
const repl = new Repl();
const arg = process.argv[2];

if (arg && arg !== '-h' && arg !== '--help') {
  repl.runFile(arg);
} else if (arg === '-h' || arg === '--help') {
  console.log('Usage: svg-editor [script.session]');
} else {
  repl.runInteractive();
}
