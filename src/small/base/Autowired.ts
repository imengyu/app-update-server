import BeanFactory from "../factory/BeanFactory";
import MappingFactory from "../factory/MappingFactory";

export function Autowired(type: string, name ?: string) {
  return function(target: Object, key: string | symbol) {

    let bean = null;

    const getter = () =>  {
      if(!bean) {
        if(type === 'Mapping') bean = MappingFactory.getMapping(name || key.toString());//获取bean
        else bean = BeanFactory.getBean(name || key.toString(), type);//获取bean
      }
      return bean;
    };

    Object.defineProperty(target, key, {
      get: getter,
      enumerable: true,
      configurable: false,
    });
  };
}