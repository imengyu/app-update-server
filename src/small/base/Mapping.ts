import MappingFactory from "../factory/MappingFactory";

export function Mapping<T extends { new(...constructorArgs: any[]) }>(constructorFunction: T) {

  let newConstructorFunction: any = function (...args) {
    let func: any = function () { return new constructorFunction(...args); }
    func.prototype = constructorFunction.prototype;

    let result: any = new func();
    MappingFactory.addMapping(constructorFunction.name, result);//add bean
    return result;
  }
  newConstructorFunction.prototype = constructorFunction.prototype;
  return newConstructorFunction;
}