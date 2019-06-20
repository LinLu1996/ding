import { initialCentralizedCtrl, initialWardrobeNoList, fetchList } from '../../../services/usageRecordService';
import { handleResponse } from '../../../utils/globalUtils';

export default {
  namespace: 'usageRecord',

  state: {
    initial: {
      centralizedCtrlList: [],
      wardrobeNoList: [],
    },
    searchParams: {
      centralizedCtrl: null,
      wardrobeNo: null,
      userKey: undefined,
      startTime: undefined,
      endTime: undefined,
    },
    paginationProps: {
      current: 1,
      pageSize: 10,
      total: 0,
      // defaultCurrent: 1,
      // defaultPageSize: 10,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '30', '50', '100'],
    },
    list: [],
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
      if (payload.centralizedCtrl) {
        const response = yield call(initialWardrobeNoList, payload.centralizedCtrl);
        if (handleResponse(response)) {
          yield put({
            type: 'updateWardrobeNoList',
            payload: {
              wardrobeNoList: response.data.data || [],
            },
          });
        }
      } else {
        yield put({
          type: 'updateWardrobeNoList',
          payload: {
            wardrobeNoList: [],
          },
        });
      }
    },
    * onSearchParamsChange({ payload }, { put }) {
      yield put({
        type: 'updateSearchParams',
        payload,
      });
    },
    * onPaginationChange({ payload }, { put }) {
      yield put({
        type: 'updatePagination',
        payload,
      });
    },
    * fetchList({ payload }, { put, call }) {
      const response = yield call(fetchList, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'updateState',
          payload: {
            list: response.data.data,
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
    updateWardrobeNoList(state, { payload }) {
      return {
        ...state,
        initial: {
          ...state.initial,
          wardrobeNoList: payload.wardrobeNoList,
        },
      };
    },
    updateSearchParams(state, { payload }) {
      return {
        ...state,
        searchParams: {
          ...state.searchParams,
          ...payload,
        },
      };
    },
    updatePagination(state, { payload }) {
      return {
        ...state,
        paginationProps: {
          ...state.paginationProps,
          ...payload,
        },
      };
    },
  },
};
