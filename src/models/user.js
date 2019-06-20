import { query as queryUsers, queryCurrent,queryAuthorites } from '@/services/user';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
    authority:[],
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: { user: response.data},
      });
      },
    *fetchFunction(_, { call, put }) {
      const authorityResponse = yield call(queryAuthorites);
      yield put({
        type: 'saveFunction',
        payload: {  authority: authorityResponse.data },
      });
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      const { user } = action.payload;
      return {
        ...state,
        currentUser: user,
      };
    },
    saveFunction(state, action) {
      const {  authority } = action.payload;
      return {
        ...state,
        authority,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};
