/**
 * 把一行命令拆成 token：支持用双引号包裹含空格的参数（如文本内容与 in 子句）。
 * 例：`create text t1 20 40 "My Diagram"` → ["create","text","t1","20","40","My Diagram"]
 */
export function tokenize(line: string): string[] {
  const tokens: string[] = [];
  const re = /"([^"]*)"|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    tokens.push(m[1] !== undefined ? m[1] : m[2]);
  }
  return tokens;
}
