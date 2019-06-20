import { initialCentralizedCtrl, initialWardrobeNoList } from '../../../services/usageRecordService';
import { handleResponse } from '../../../utils/globalUtils';

export default {
  namespace: 'usageStatus',

  state: {
    initial: {
      centralizedCtrlList: [],
      wardrobeNoList: [],
    },
    paginationProps: {
      // current: 1,
      // pageSize: 10,
      // total: 0,
      defaultCurrent: 1,
      defaultPageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '30', '50', '100'],
    },
  },

  effects: {
    * onStateChange({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
    },
    * initialCentralizedCtrlList(_, { put, call }) {
      const response = yield call(initialCentralizedCtrl);
      if (handleResponse(response)) {
        yield put({
          type: 'updateInitial',
          payload: {
            centralizedCtrlList: response.data.data || [],
          },
        });
      }
    },
    * initialWardrobeNoList({ payload }, { put, call }) {
      const response = yield call(initialWardrobeNoList, payload.centralizedCtrl);
      if (handleResponse(response)) {
        yield put({
          type: 'updateInitial',
          payload: {
            wardrobeNoList: response.data.data || [],
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
    updateInitial(state, { payload }) {
      return {
        ...state,
        initial: {
          ...state.initial,
          ...payload,
        },
      };
    },
  },
};
