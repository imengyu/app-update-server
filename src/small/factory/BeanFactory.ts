let beans = new Map<string, Map<string, any>>();

export default {
  getBean,
  containsBean,
  getBeanByType,
  addBean,
  debug() {
    console.dir(beans);
  }
}

export function getBean<T>(name : string, type: string) {
  let map = beans.get(type);
  if(map) 
    return map.get(name) as T;
  return null;
}
export function getBeanByType(type: string) {
  let map = beans.get(type);
  if(map) 
    return map;
  return null;
}
export function containsBean(name : string, type: string) {
  let map = beans.get(type);
  if(map) 
    return map.has(name);
  return false;
}
export function addBean(name : string, type: string, obj : any) {
  let map = beans.get(type);
  if(!map) {
    map = new Map<string, any>();
    beans.set(type, map);
  }
  map.set(name, obj);
}