import vconstants from "./vconstants";

export default {
  api: {
    dev: {
      API_ROOT: 'http://localhost:3012/',
      API_KEY: '52c710ad727bb9344b3ed1125d5431f1',
    },
    prod: {
      API_ROOT: '/',
      API_KEY: '52c710ad727bb9344b3ed1125d5431f1',
    },
  },
  logApiData: false,
  consts: vconstants
}