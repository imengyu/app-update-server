/**
 * 通用分页返回
 */
export class CommonPageResult<T> implements ICommonPageResult<T> {
  public items : T[];
  public pageIndex : number;
  public pageSize : number;
  public allCount : number;
  public allPage : number;
  public empty : boolean;

  public constructor(data : T[], pageIndex : number, pageSize : number, allCount : number) {
    this.items = data;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.allCount = allCount;
    this.allPage = Math.ceil(allCount / pageSize);
    this.empty = data.length == 0;
  }
}

/**
 * 通用分页返回结构
 */
export interface ICommonPageResult<T> {
  items : T[];
  pageIndex : number;
  pageSize : number;
  allCount : number;
  allPage : number;
  empty : boolean;
}