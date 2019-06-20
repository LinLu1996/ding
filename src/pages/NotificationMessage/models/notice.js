import {
  queryList,
  detailsInfo,
  noticeAdd,
  deleteList,

} from '@/services/notice';


export default {
  namespace: 'notice',

  state: {
    queryListResult:{},
    detailsInfoResult:{},
    noticeAddResult:{},
    deleteListResult:{},

  },

  effects: {
    // 场馆列表多条件查询
    *querylist({ payload }, { call, put }) {
      const response = yield call(queryList, payload);
      yield put({
        type: 'queryList',
        payload: response,
      });
    },

    // 查看按钮
    *detailsinfo({ payload }, { call, put }) {
      const response = yield call(detailsInfo, payload);
      yield put({
        type: 'detailsInfo',
        payload: response,
      });
    },

    // 新增编辑
    *noticeadd({ payload }, { call, put }) {
      const response = yield call(noticeAdd, payload);
      yield put({
        type: 'noticeAdd',
        payload: response,
      });
    },

    // 作废
    *deletelist({ payload }, { call, put }) {
      const response = yield call(deleteList, payload);
      yield put({
        type: 'deleteList',
        payload: response,
      });
    },


  },

  reducers: {
    queryList(state, { payload }) {
      return {
        ...state,
        queryListResult: payload,
      };
    },

    detailsInfo(state, { payload }) {
      return {
        ...state,
        detailsInfoResult: payload.data,
      };
    },

    noticeAdd(state, { payload }) {
      return {
        ...state,
        noticeAddResult: payload,
      };
    },


    deleteList(state, { payload }) {
      return {
        ...state,
        deleteListResult: payload,
      };
    },






  },
};
