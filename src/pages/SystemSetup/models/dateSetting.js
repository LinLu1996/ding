import moment from 'moment';

export default {
  namespace: 'dateSetting',

  state: {
    year: moment().year(),
    month: moment().month() + 1,
    modifiedData: {},
  },

  effects: {
    * setState({ payload }, { put }) {
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
