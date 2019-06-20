import {
  queryTable,
  queryOperater,
  querySport,
} from '@/services/reportForm';
import { handleResponse } from '../../../utils/globalUtils';


export default {
  namespace: 'reportForm',
  state: {
    activeKey: '0',
    sportList: [],
    operateList:[],
    pageInfo:[],
    operaterList:[],
  },

  effects: {

    // 切换tab
    * onTabsChanged({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      })
    },

    // 查询列表
    * handleGetTable({ payload }, { put, call }) {
      const response = yield call(queryTable, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'updateState',
          payload: {
            pageInfo: response.data,
          },
        });
      }
    },

    // 获取操作人
    * fetchQueryOperater({ payload }, { put, call }) {
      const response = yield call(queryOperater, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'updateState',
          payload: {
            operaterList: response.data,
          },
        });
      }
    },

    // 获取适用项目
    * fetchQuerySport({ payload }, { put, call }) {
      const response = yield call(querySport, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'updateState',
          payload: {
            sportList: response.data,
          },
        });
      }
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
}
