import { deleteAdvertisements, fetchList } from '../../../services/adv';
import { handleResponse } from '../../../utils/globalUtils';

/**
 * @author jiangt
 */

export default {
  namespace: 'adv',

  state: {
    list: [],
    paginationProps: {
      total: 0,
      current: 1,
      pageSize: 10,
    },
    advForm: {
      visible: false,
      id: undefined,
    },
    deleteResponse: undefined,
  },

  effects: {
    * onStateChange({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
    },
    * onPaginationPropsChange({ payload }, { put }) {
      yield put({
        type: 'updatePaginationProps',
        payload,
      });
    },
    * fetchList({ payload }, { put, call }) {
      const response = yield call(fetchList, payload);
      const flag = handleResponse(response);
      yield put({
        type: 'updateList',
        payload: {
          list: flag ? response.data.list : [],
          total: flag ? response.data.total : 0,
        },
      });
    },
    * onAdvFormChange({ payload }, { put }) {
      yield put({
        type: 'updateAdvForm',
        payload,
      });
    },
    * onDeleteAdvertisements({ payload }, { put, call }) {
      const response = yield call(deleteAdvertisements, payload.ids);
      if (handleResponse(response, true)) {
        yield put({
          type: 'updateDeleteResponse',
          payload: { deleteResponse: response },
        });
      }
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
        deleteResponse: undefined,
      };
    },
    updatePaginationProps(state, { payload }) {
      return {
        ...state,
        paginationProps: {
          ...state.paginationProps,
          ...payload,
        },
        deleteResponse: undefined,
      };
    },
    updateList(state, { payload }) {
      return {
        ...state,
        list: payload.list,
        paginationProps: {
          ...state.paginationProps,
          total: payload.total,
        },
        deleteResponse: undefined,
      };
    },
    updateAdvForm(state, { payload }) {
      return {
        ...state,
        advForm: {
          ...state.advForm,
          visible: payload.visible,
          id: payload.id,
        },
        deleteResponse: undefined,
      };
    },
    updateDeleteResponse(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
