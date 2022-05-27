import BeanFactory from "../factory/BeanFactory";

/**
 * 服务注解。此操作将会将当前类注册至Bean中
 * @param constructorFunction 
 * @returns 
 */
export function Service<T extends { new(...constructorArgs: any[]) }>(constructorFunction: T) {

  let newConstructorFunction: any = function (...args) {
    let func: any = function () { return new constructorFunction(...args); }
    func.prototype = constructorFunction.prototype;

    let result: any = new func();
    BeanFactory.addBean(constructorFunction.name, 'Service', result);//add bean
    return result;
  }
  newConstructorFunction.prototype = constructorFunction.prototype;
  return newConstructorFunction;
}

export class BaseService {
  
}