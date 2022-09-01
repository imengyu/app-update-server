export class MemRedis {

  data = new Map<string, unknown>();

  get<T>(redisKey: string, cb: (err: Error|null, v: T) => void) {
    setTimeout(() => {
      if (this.data.has(redisKey))
        cb(null, this.data.get(redisKey) as T);
      else
        cb(null, null);
    }, 200);
  }
  set<T>(redisKey: string, v: T, cb?: (err: Error|null) => void) {
    this.data.set(redisKey, v);
    if (cb)
      cb(null);
  }
  del(redisKey: string, cb?: (err: Error|null) => void) {
    this.data.delete(redisKey);
    if (cb)
      cb(null);
  }
  expire(redisKey: string, sec: number) {
    setTimeout(() => {
      this.data.delete(redisKey);
    }, sec * 1000);
  }
}