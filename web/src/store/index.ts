import api from '@/api'
import common from '@/utils/common';
import { createStore } from 'vuex'

export default createStore({
  state: {
    authStatus: false,
    authExpireAt: new Date(),
    authKName: '',
    authKVal: '',
    userInfo: null,
  },
  getters: {
    isAuthed(state) {
      return state.authStatus && !common.isNullOrEmpty(state.authKVal);
    },
    userInfo(state) {
      return state.authStatus && state.userInfo;
    },
  },
  mutations: {
    updateAuthStatus(state, payload) { state.authStatus = payload; },
    updateAuthExpireAt(state, payload) { state.authExpireAt = payload; },
    updateAuthKName(state, payload) { state.authKName = payload; },
    updateAuthKVal(state, payload) { state.authKVal = payload; },
    updateUserInfo(state, payload) { state.userInfo = payload; },
  },
  actions: {
    requestAuthStatus(store) {
      return new Promise<void>((resolve, reject) => {
        api.login.getLoginStatus().then((result) => {
          store.commit('updateAuthStatus', result.data?.authStatus);
          store.commit('updateAuthExpireAt', result.data?.expireAt);
          resolve();
        }).catch((e) => reject(e));
      });
    },
    requestUserInfo(store) {
      return new Promise<void>((resolve, reject) => {
        api.user.getUserInfo().then((result) => {
          store.commit('updateUserInfo', result.data);
          resolve();
        }).catch((e) => reject(e));
      });
    },
    clearAuthKey(store) {
      store.commit('updateAuthStatus', false);
      store.commit('updateAuthKName', '');
      store.commit('updateAuthKVal', '');
      store.commit('updateAuthExpireAt', new Date());
    },
  },
  modules: {
  }
})
