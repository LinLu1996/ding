export default {
  namespace: 'tabs',

  state: {
    activeKey: undefined,
  },

  effects: {
    * onStateChange({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
