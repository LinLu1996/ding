import { message } from 'antd';
import { handleResponse } from '../../../utils/globalUtils';
import {
  queryList, queryPermission, addProject, editProject, handleDelete, getPermission, getPermissionAll,
  editCompanyInfo, setPermission, getListDetail, getCompanyInfo, changeStatus,
} from '../../../services/systemSet';


export default {
  namespace: 'systemSet',

  state: {
    pageInfo: [],
    permissionList: [],
    getPermissionList: [],
    getPermissionAllList: [],
    stockList: [],
    listDetail: {},
    companyInfo: {},
    list: [],
    searchParams: {
      name: undefined,
      contactTel: undefined,
    },
    paginationProps: {
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '30', '50', '100'],
    },
  },

  effects: {
    * onPaginationPropsChange({ payload }, { put }) {
      yield put({
        type: 'updatePaginationProps',
        payload,
      });
    },
    * onSearchParamsChange({ payload }, { put }) {
      yield put({
        type: 'updateSearchParams',
        payload,
      });
    },
    // 销售管理查询交易记录列表
    * fetchQuerySystem({ payload }, { call, put }) {
      const response = yield call(queryList, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'detail',
          payload: response,
        });
      }
    },

    // 销售管理改变状态启用停用
    * fetchChangeStatus({ payload }, { call, put }) {
      const response = yield call(changeStatus, payload);
      if (handleResponse(response, true)) {
        yield put({
          type: 'code',
          payload: response,
        });
      }
    },

    // 销售管理查询交易记录列表
    * fetchQueryPermission({ payload }, { call, put }) {
      const response = yield call(queryPermission, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'updateList',
          payload: {
            list: response.data.list,
            total: response.data.total,
          },
        });
      }
    },

    // 销售管理项目列表新增项目
    * fetchAddProject({ payload }, { call, put }) {
      const response = yield call(addProject, payload);
      if (handleResponse(response, true)) {
        yield put({
          type: 'code',
          payload: response,
        });
      }
    },

    // 销售管理项目列表编辑项目
    * fetchEditProject({ payload }, { call, put }) {
      const response = yield call(editProject, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'code',
          payload: response,
        });
      }
    },

    // 销售管理项目列表删除项目
    * fetchHandleDelete({ payload }, { call, put }) {
      const response = yield call(handleDelete, payload);
      if (handleResponse(response, true)) {
        yield put({
          type: 'code',
          payload: response,
        });
      }
    },

    // 销售管理项目权限设置获取所有权限
    * fetchGetPermissionAll({ payload }, { call, put }) {
      const response = yield call(getPermissionAll, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'getPermissionAllList',
          payload: response,
        });
      }
    },

    // 销售管理项目权限设置获取权限
    * fetchGetPermission({ payload }, { call, put }) {
      const response = yield call(getPermission, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'getPermissionList',
          payload: response,
        });
      }
    },

    // 销售管理公司信息获取
    * fetchGetCompanyInfo({ payload }, { call, put }) {
      const response = yield call(getCompanyInfo, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'companyInfo',
          payload: response,
        });
      }
    },

    // 销售管理公司信息提交
    * fetchEditCompanyInfo({ payload }, { call, put }) {
      const response = yield call(editCompanyInfo, payload);
      if (handleResponse(response, true)) {
        yield put({
          type: 'code',
          payload: response,
        });
      }
    },

    // 销售管理项目权限设置
    * fetchSetPermission({ payload }, { call, put }) {
      const response = yield call(setPermission, payload);
      if (handleResponse(response, true)) {
        yield put({
          type: 'code',
          payload: response,
        });
      }
    },

    // 销售管理项目列表编辑获取详情
    * fetchGetListDetail({ payload }, { call, put }) {
      const response = yield call(getListDetail, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'listDetail',
          payload: response,
        });
      }
    },

  },

  reducers: {
    updatePaginationProps(state, { payload }) {
      return {
        ...state,
        paginationProps: {
          ...state.paginationProps,
          ...payload,
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
    detail(state, { payload }) {
      return {
        ...state,
        pageInfo: payload && payload.data,
      };
    },

    code(state, { payload }) {
      return {
        ...state,
        code: payload.code,
      };
    },

    clearStockInfo(state) {
      return {
        ...state,
        listDetail: {},
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
      };
    },

    getPermissionList(state, { payload }) {
      return {
        ...state,
        getPermissionList: payload && payload.data,
      };
    },

    getPermissionAllList(state, { payload }) {
      return {
        ...state,
        getPermissionAllList: payload && payload.data,
      };
    },

    listDetail(state, { payload }) {
      return {
        ...state,
        listDetail: payload && payload.data,
      };
    },

    companyInfo(state, { payload }) {
      return {
        ...state,
        companyInfo: payload && payload.data,
      };
    },

  },
};
