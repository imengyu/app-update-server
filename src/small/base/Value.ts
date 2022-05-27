import config from "../../config";
import common from "../../utils/common";

export function Value(name?: string) {
  return function(target: Object, key: string | symbol) {

    let configVal = null;

    const getter = () =>  {
      if(!configVal)
        configVal = common.getObjectKey(config, name || key.toString());
      return configVal;
    };

    Object.defineProperty(target, key, {
      get: getter,
      enumerable: true,
      configurable: false,
    });
  };
}