
export interface SqlPlaceholder {
  index: number,
  length: number,
  name: string
}

/**
 * SQL静态参数的结构
 */
export interface SqlStatcParams {
  [index: string]: any;
}

/**
 * 分割sql中的参数占位符
 * @param sql 原始sql
 * @returns 
 */
export function solveSqlPlaceholders(sql : string) {
  let result = new Array<SqlPlaceholder>();

  let currentBracketsStart = -1;
  let currentBracketsEnd = -1;
  let chr = '';

  for(let i = 0; i < sql.length; i++) {
    chr = sql.charAt(i);
    if(currentBracketsStart < 0) {
      if(chr === '{') currentBracketsStart = i;
    } else {
      if(chr === '}') {
        currentBracketsEnd = i;
        if(currentBracketsEnd - currentBracketsStart > 0) {
          result.push({
            index: currentBracketsStart,
            length: currentBracketsEnd - currentBracketsStart + 1,
            name: sql.substring(currentBracketsStart + 1, currentBracketsEnd)
          });
        } else { 
          console.warn('Bad sql placeholder, the brackets dose not contains a name , at ' + currentBracketsStart);
        }
        currentBracketsEnd = -1;
        currentBracketsStart = -1;
      }
    }

    if(i === sql.length - 1 && currentBracketsStart >= 0) {
      console.warn('Bad sql placeholder, not found end brackets, at ' + currentBracketsStart);
    }
  }

  return result;
}
/**
 * 按占位符和参数拼接最终sql
 * @param sql 原始sql
 * @param placeholders 占位符数据
 * @param args 传入参数
 * @returns 
 */
export function splicingSQL(sql : string, placeholders : SqlPlaceholder[], args: any[], fn : Function, staticParams : SqlStatcParams) {
  let result = '';
  let startOffset = 0;
  let funcArgNames = fn ? null : fn.toString()
    .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,'')
    .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
    .split(/,/);

  for(let i = 0; i < placeholders.length; i++) {
    let p = placeholders[i];
    let index = p.name === '?' ? i : parseInt(p.name);
    let argval = null;
    if(index >= 0) argval = args[index];
    else {
      let ii = funcArgNames ? funcArgNames.indexOf(p.name) : -1;
      argval = ii >= 0 ? args[ii] : staticParams[p.name];
    }

    result = result.concat(sql.substring(startOffset, p.index), (argval !== null ? argval : ''));
    startOffset = p.index + p.length;

    if(i === placeholders.length - 1) {
      result = result.concat(sql.substring(startOffset));
    }
  }

  return result;
}