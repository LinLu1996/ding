import { message } from 'antd';
import {
  queryList,
  getSprotName,
  getCourtName,
  getUpperList,
  getDateType,
  handleDelete,
  handleUp,
  addTicket,
  queryTicketAdjust,
  getStockInfo,
  editTicket,
  getCurriculumTable,
  handleSocket,
  machineList,

} from '@/services/ticket';
import { handleResponse } from '../../../utils/globalUtils';


export default {
  namespace: 'ticket',

  state: {
    pageInfo:{},
    ticketAdjustList:{},
    queryOneResult:{},
    sprotNameList:[],
    courtNameList:[],
    placeList:[],
    upperList:[],
    dateTypeList:[],
    curriculumTable:[],
    stockList:{},
    code:null,
    machineListResult:{},
    pageNo:1,
    pageSize:10,
    sportItemId:null,
    applyCourt:null,
    ticketName:null,
    dateType:[],
    saleStatus:null,
  },

  effects: {
    // 保存查询条件
    *fetchSetSearch({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
    },

    // 获取可售平台list
    *machinelist({ payload }, { call, put }) {
      const response = yield call(machineList, payload);
      yield put({
        type: 'machineList',
        payload: response,
      });
    },

    // 获取项目类型下拉列表
    *fetchGetSprotName({ payload }, { call, put }) {
      const response = yield call(getSprotName, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'sprotNameList',
        payload: response,
      });
    },

    // 获取场馆下拉列表
    *fetchGetCourtName({ payload }, { call, put }) {
      const response = yield call(getCourtName, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'courtNameList',
        payload: response,
      });
    },

    // 获取场地下拉列表
    *fetchCourtName({ payload }, { call, put }) {
      const response = yield call(getCourtName, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'placeList',
        payload: response,
      });
    },

    // 获取适用日期类型
    *fetchGetDateType({ payload }, { call, put }) {
      const response = yield call(getDateType, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'dateTypeList',
        payload: response,
      });
    },

    // 获取上下架下拉列表
    *fetchGetUpperList({ payload }, { call, put }) {
      const response = yield call(getUpperList, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'upperList',
        payload: response,
      });
    },

    // 列表
    *fetchQueryTicket({ payload }, { call, put }) {
      const response = yield call(queryList, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'detail',
        payload: response,
      });
    },

    // 删除门票
    *fetchHandleDelete({ payload }, { call, put }) {
      const response = yield call(handleDelete, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'code',
        payload: response,
      });
    },

    // 上下架
    *fetchHandleUp({ payload }, { call, put }) {
      const response = yield call(handleUp, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'code',
        payload: response,
      });
    },

    // 新增门票
    *fetchAddTicket({ payload }, { call, put }) {
      const response = yield call(addTicket, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'code',
        payload: response,
      });
    },

    // 编辑门票
    *fetchEditTicket({ payload }, { call, put }) {
      const response = yield call(editTicket, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'code',
          payload: response,
        });
      }
      // if (response.code !== 200) {
      //   message.error(response.msg);
      // }
      // yield put({
      //   type: 'code',
      //   payload: response,
      // });
    },

    // 门票调整列表
    *fetchQueryTicketAdjust({ payload }, { call, put }) {
      const response = yield call(queryTicketAdjust, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'ticketAdjustList',
        payload: response,
      });
    },

    // 出库入库详情
    *fetchGetStockInfo({ payload }, { call, put }) {
      const response = yield call(getStockInfo, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'stockList',
        payload: response,
      });
    },

    // 获取履历列表
    *fetchGetCurriculumTable({ payload }, { call, put }) {
      const response = yield call(getCurriculumTable, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'curriculumTable',
        payload: response,
      });
    },

    // 出库入库提交
    *fetchHandleSocket({ payload }, { call, put }) {
      const response = yield call(handleSocket, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'code',
        payload: response,
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
    detail(state, { payload }) {
      return {
        ...state,
        pageInfo: payload && payload.data,
      };
    },

    sprotNameList(state, { payload }) {
      return {
        ...state,
        sprotNameList: payload && payload.data,
      };
    },

    courtNameList(state, { payload }) {
      return {
        ...state,
        courtNameList: payload && payload.data,
      };
    },

    placeList(state, { payload }) {
      return {
        ...state,
        placeList: payload && payload.data,
      };
    },

    upperList(state, { payload }) {
      return {
        ...state,
        upperList: payload && payload.data,
      };
    },

    dateTypeList(state, { payload }) {
      return {
        ...state,
        dateTypeList: payload && payload.data,
      };
    },

    ticketAdjustList(state, { payload }) {
      return {
        ...state,
        ticketAdjustList: payload && payload.data,
      };
    },

    stockList(state, { payload }) {
      return {
        ...state,
        stockList: payload && payload.data,
      };
    },

    curriculumTable(state, { payload }) {
      return {
        ...state,
        curriculumTable: payload,
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
        stockList: [],
      };
    },


    machineList(state, { payload }) {
      return {
        ...state,
        machineListResult: payload && payload.data,
      };
    },


  },
};
