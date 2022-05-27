let mappings = new Map<string, object>();

export function getMapping(name : string) {
  return mappings.get(name);
}
export function addMapping(name : string, obj : object) {
  return mappings.set(name, obj);
}
export function useMapping<T extends Function>(cls : T) {
  let m = mappings.get(cls.name);
  if(!m) {
    let constructor = <any>cls;
    m = new constructor();
    mappings.set(cls.name, m);
  }
  return m;
}
export function destroyMapping(cls : Function) {
  return mappings.delete(cls.name);
}

export default {
  addMapping,
  getMapping,
  useMapping,
  destroyMapping
}