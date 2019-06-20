import { message } from 'antd';
import { handleResponse } from '../../../utils/globalUtils';
import {
  queryList,
  getApplicableItems,
  handleDelete,
  handleUp,
  addCard,
  queryCardAdjust,
  getCardInfo,
  editCard,
  getCurriculumTable,
  getStockInfo,
  handleSocket,
  getStatus,
  querySaleList,
  handleReadCard,
  getCardName,
  getYearInfo,
  activateCard,
  getRechargeInfo,
  handleRecharge,
  getReplacementInfo,
  replacementReadCard,
  submitReplacement,
  queryTransactionList,
} from '@/services/card';


export default {
  namespace: 'cards',

  state: {
    pageInfo:{},
    applicableItemsList:[],
    cardList:{},
    stockList:{},
    statusList:[],
    saleList:{},
    code:null,
    readCardStatus:{},
    cardNameList:[],
    yearInfoList:{},
    rechargeInfo:{},
    replacementInfo:{},
    replacementReadCardList:{},
    transactionList:{},
  },

  effects: {

    // 获取适用项目
    *fetchGetApplicableItems({ payload }, { call, put }) {
      const response = yield call(getApplicableItems, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'applicableItemsList',
        payload: response,
      });
    },

    // 卡管理列表
    *fetchQueryCard({ payload }, { call, put }) {
      const response = yield call(queryList, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'detail',
        payload: response,
      });
    },

    // 删除卡管理列表数据
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

    // 卡管理上下架
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

    // 新增卡
    *fetchAddCard({ payload }, { call, put }) {
      const response = yield call(addCard, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'code',
        payload: response,
      });
    },

    // 编辑卡
    *fetchEditCard({ payload }, { call, put }) {
      const response = yield call(editCard, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'code',
        payload: response,
      });
    },

    // 卡管理调整列表
    *fetchQueryCardAdjust({ payload }, { call, put }) {
      const response = yield call(queryCardAdjust, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'ticketAdjustList',
        payload: response,
      });
    },

    // 卡编辑详情
    *fetchGetCardInfo({ payload }, { call, put }) {
      const response = yield call(getCardInfo, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'cardList',
        payload: response,
      });
    },

    // 获取卡管理履历列表
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

    // 卡管理出入库详情
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

    // 销售管理获取状态
    *fetchGetStatus({ payload }, { call, put }) {
      const response = yield call(getStatus, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'statusList',
        payload: response,
      });
    },

    // 销售管理列表
    *fetchQuerySaleList({ payload }, { call, put }) {
      const response = yield call(querySaleList, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'salesList',
        payload: response,
      });
    },

    // 销售管理开卡读卡
    *fetchHandleReadCard({ payload }, { call, put }) {
      const response = yield call(handleReadCard, payload);
      if(handleResponse(response,true)) {
        yield put({
          type: 'readCard',
          payload: response,
        });
      }
    },

    // 销售管理获取卡名称
    *fetchGetCardName({ payload }, { call, put }) {
      const response = yield call(getCardName, payload);
      if(handleResponse(response)) {
        yield put({
          type: 'cardName',
          payload: response,
        });
      }
    },

    // 销售管理根据卡名称获取卡详情
    *fetchGetYearInfo({ payload }, { call, put }) {
      const response = yield call(getYearInfo, payload);
      if(handleResponse(response)) {
        yield put({
          type: 'yearInfoList',
          payload: response,
        });
      }
    },

    // 销售管理会员开卡
    *fetchActivateCard({ payload }, { call, put }) {
      const response = yield call(activateCard, payload);
      if(handleResponse(response,true)) {
        yield put({
          type: 'code',
          payload: response,
        });
      }
    },

    // 销售管理充值详细信息获取
    *fetchGetRechargeInfo({ payload }, { call, put }) {
      const response = yield call(getRechargeInfo, payload);
      if(handleResponse(response)) {
        yield put({
          type: 'rechargeInfo',
          payload: response,
        });
      }
    },

    // 销售管理充值提交
    *fetchHandleRecharge({ payload }, { call, put }) {
      const response = yield call(handleRecharge, payload);
      if(handleResponse(response,true)) {
        yield put({
          type: 'code',
          payload: response,
        });
      }
    },

    // 销售管理会员补换卡详细信息获取
    *fetchGetReplacementInfo({ payload }, { call, put }) {
      const response = yield call(getReplacementInfo, payload);
      if(handleResponse(response)) {
        yield put({
          type: 'replacementInfo',
          payload: response,
        });
      }
    },

    // 销售管理会员补换卡卡号读取
    *fetchReplacementReadCard({ payload }, { call, put }) {
      const response = yield call(replacementReadCard, payload);
      if(handleResponse(response,true)) {
        yield put({
          type: 'replacementReadCardList',
          payload: response,
        });
      }
    },

    // 销售管理会员补换卡提交
    *fetchSubmitReplacement({ payload }, { call, put }) {
      const response = yield call(submitReplacement, payload);
      if(handleResponse(response,true)) {
        yield put({
          type: 'code',
          payload: response,
        });
      }
    },

    // 销售管理查询交易记录列表
    *fetchQueryTransactionList({ payload }, { call, put }) {
      const response = yield call(queryTransactionList, payload);
      if(handleResponse(response)) {
        yield put({
          type: 'transactionList',
          payload: response,
        });
      }
    },
  },

  reducers: {
    detail(state, { payload }) {
      return {
        ...state,
        pageInfo: payload && payload.data,
      };
    },

    applicableItemsList(state, { payload }) {
      return {
        ...state,
        applicableItemsList: payload && payload.data,
      };
    },

    cardList(state, { payload }) {
      return {
        ...state,
        cardList: payload && payload.data,
      };
    },

    stockList(state, { payload }) {
      return {
        ...state,
        stockList: payload && payload.data,
      };
    },

    ticketAdjustList(state, { payload }) {
      return {
        ...state,
        ticketAdjustList: payload && payload.data,
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
        cardList: [],
      };
    },

    statusList(state, { payload }) {
      return {
        ...state,
        statusList: payload && payload.data,
      };
    },

    salesList(state, { payload }) {
      return {
        ...state,
        saleList: payload && payload.data,
      };
    },

    readCard(state, { payload }) {
      return {
        ...state,
        readCardStatus: payload && payload.data,
      };
    },

    cardName(state, { payload }) {
      return {
        ...state,
        cardNameList: payload && payload.data,
      };
    },

    yearInfoList(state, { payload }) {
      return {
        ...state,
        yearInfoList: payload && payload.data,
      };
    },

    rechargeInfo(state, { payload }) {
      return {
        ...state,
        rechargeInfo: payload && payload.data,
      };
    },

    replacementInfo(state, { payload }) {
      return {
        ...state,
        replacementInfo: payload && payload.data,
      };
    },

    replacementReadCardList(state, { payload }) {
      return {
        ...state,
        replacementReadCardList: payload && payload.data,
      };
    },

    transactionList(state, { payload }) {
      return {
        ...state,
        transactionList: payload && payload.data,
      };
    },

  },
};
