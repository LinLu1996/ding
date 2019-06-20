import { message } from 'antd';
import { handleResponse } from '../../../utils/globalUtils';
import {
  queryList,handleDelete,getListDetail,addProject
} from '../../../services/advertisement';


export default {
  namespace: 'advertisement',

  state: {
    pageInfo: [],
    code:undefined,
    listDetail:{},
  },

  effects: {
    // 广告列表
    * fetchQueryCard({ payload }, { call, put }) {
      const response = yield call(queryList, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'detail',
          payload: {
            pageInfo:response.data || {}
          },
        });
      }
    },

    // 删除列表
    * fetchHandleDelete({ payload }, { call, put }) {
      const response = yield call(handleDelete, payload);
      handleResponse(response,true);
      yield put({
        type: 'detail',
        payload: {
          code:response.code
        },
      });
    },

    // 编辑列表获取详情
    * fetchGetListDetail({ payload }, { call, put }) {
      const response = yield call(getListDetail, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'detail',
          payload: {
            listDetail:response.data,
          },
        });
      }
    },

    // 保存修改内容
    * fetchAddProject({ payload }, { call, put }) {
      const response = yield call(addProject, payload);
      handleResponse(response, true);
      yield put({
        type: 'detail',
        payload: {
          code:response.code
        },
      });
    },

  },

  reducers: {
    detail(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
