import {
  salesOrderList,
  detailsInfo,
  refundDetails,
  handleRefund,
  consumeRecordList,
  soprtList,
  consumeState,
  qelectList,
  consumeRecordInfo,
  financeBillsList,
  financeBillsTicket,
  financeBillsCourt,
  paymentModeList,
  paymentStatusList,
  orderTypeList,
  cancelPay,
  handleReadCard,
  continuePay,
  printBracelet,
  getTicketType,
} from '@/services/order';
import {message} from 'antd';
import { handleResponse } from '../../../utils/globalUtils';


export default {
  namespace: 'order',

  state: {
    salesOrderListResult:{},
    detailsInfoResult:{},
    readCardInfo:{},
    refundDetailsResult:{},
    handleRefundResult:{},
    consumeRecordListResult:{},
    soprtListResult:{},
    consumeStateResult:{},
    qelectListResult:{},
    consumeRecordInfoResult:{},
    financeBillsListResult:{},
    financeBillsTicketResult:{},
    financeBillsCourtResult:{},
    paymentModeListResult:{},
    paymentStatusListResult:{},
    orderTypeListResult:{},
    cancelPayResult:{},
    continuePayResult:{},
    printBraceletResult:{},
    ticketTypeList:[],
  },

  effects: {

    *fetchGetTicketType({ payload }, { call, put }) {
      const response = yield call(getTicketType, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'ticketType',
          payload: response.data,
        });
      }
    },

    // 打印手环
    *printbracelet({ payload }, { call, put }) {
      const response = yield call(printBracelet, payload);
      if (response.code !== 200) {
        message.error(response.msg);
      }
      yield put({
        type: 'printBracelet',
        payload: response,
      });
    },

    *cancelpay({ payload }, { call, put }) {
      const response = yield call(cancelPay, payload);
      yield put({
        type: 'cancelPay',
        payload: response,
      });
    },

    *continuepay({ payload }, { call, put }) {
      const response = yield call(continuePay, payload);
      yield put({
        type: 'continuePay',
        payload: response,
      });
    },


    // 列表多条件查询
    *salesorderlist({ payload }, { call, put }) {
      const response = yield call(salesOrderList, payload);
      yield put({
        type: 'salesOrderList',
        payload: response,
      });
    },

    // 详情
    *detailsinfo({ payload }, { call, put }) {
      const response = yield call(detailsInfo, payload);
      yield put({
        type: 'detailsInfo',
        payload: response,
      });
    },

    // 退款详情
    *refunddetails({ payload }, { call, put }) {
      const response = yield call(refundDetails, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'refundDetails',
          payload: response,
        });
      }
    },

    // 退款
    *handlerefund({ payload }, { call, put }) {
      const response = yield call(handleRefund, payload);
      yield put({
        type: 'handleRefund',
        payload: response,
      });
    },

    // 列表多条件查询
    *consumerecordlist({ payload }, { call, put }) {
      const response = yield call(consumeRecordList, payload);
      yield put({
        type: 'consumeRecordList',
        payload: response,
      });
    },

    // 运动项目
    *sportlist({ payload }, { call, put }) {
      const response = yield call(soprtList, payload);
      yield put({
        type: 'soprtList',
        payload: response,
      });
    },

    // 消费状态
    *consumestate({ payload }, { call, put }) {
      const response = yield call(consumeState, payload);
      yield put({
        type: 'consumeState',
        payload: response,
      });
    },

    // 查询
    *qelectlist({ payload }, { call, put }) {
      const response = yield call(qelectList, payload);
      yield put({
        type: 'qelectList',
        payload: response,
      });
    },

    // 消费详细
    *consumerecordinfo({ payload }, { call, put }) {
      const response = yield call(consumeRecordInfo, payload);
      yield put({
        type: 'consumeRecordInfo',
        payload: response,
      });
    },

    // 票券列表
    *financebillslist({ payload }, { call, put }) {
      const response = yield call(financeBillsList, payload);
      yield put({
        type: 'financeBillsList',
        payload: response,
      });
    },

    *financebillsticket({ payload }, { call, put }) {
      const response = yield call(financeBillsTicket, payload);
      yield put({
        type: 'financeBillsTicket',
        payload: response,
      });
    },

    *financebillscourt({ payload }, { call, put }) {
      const response = yield call(financeBillsCourt, payload);
      yield put({
        type: 'financeBillsCourt',
        payload: response,
      });
    },

    *paymentmodelist({ payload }, { call, put }) {
      const response = yield call(paymentModeList, payload);
      yield put({
        type: 'paymentModeList',
        payload: response,
      });
    },

    *paymentstatuslist({ payload }, { call, put }) {
      const response = yield call(paymentStatusList, payload);
      yield put({
        type: 'paymentStatusList',
        payload: response,
      });
    },

    *ordertypelist({ payload }, { call, put }) {
      const response = yield call(orderTypeList, payload);
      yield put({
        type: 'orderTypeList',
        payload: response,
      });
    },

    // 读卡
    *fetchHandleReadCard({ payload }, { call, put }) {
      const response = yield call(handleReadCard, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'readCard',
          payload: response && response || {},
        });
      }
    },








  },

  reducers: {
    salesOrderList(state, { payload }) {
      return {
        ...state,
        salesOrderListResult: payload,
      };
    },

    detailsInfo(state, { payload }) {
      return {
        ...state,
        detailsInfoResult: payload.data,
      };
    },

    refundDetails(state, { payload }) {
      return {
        ...state,
        refundDetailsResult: payload.data || {},
      };
    },


    handleRefund(state, { payload }) {
      return {
        ...state,
        handleRefundResult: payload,
      };
    },


    consumeRecordList(state, { payload }) {
      return {
        ...state,
        consumeRecordListResult: payload,
      };
    },

    soprtList(state, { payload }) {
      return {
        ...state,
        soprtListResult: payload.data,
      };
    },

    consumeState(state, { payload }) {
      return {
        ...state,
        consumeStateResult: payload,
      };
    },

    qelectList(state, { payload }) {
      return {
        ...state,
        qelectListResult: payload,
      };
    },

    consumeRecordInfo(state, { payload }) {
      return {
        ...state,
        consumeRecordInfoResult: payload.data,
      };
    },

    financeBillsList(state, { payload }) {
      return {
        ...state,
        financeBillsListResult: payload,
      };
    },

    financeBillsTicket(state, { payload }) {
      return {
        ...state,
        financeBillsTicketResult: payload.data,
      };
    },

    financeBillsCourt(state, { payload }) {
      return {
        ...state,
        financeBillsCourtResult: payload.data,
      };
    },


    paymentModeList(state, { payload }) {
      return {
        ...state,
        paymentModeListResult: payload.data,
      };
    },

    paymentStatusList(state, { payload }) {
      return {
        ...state,
        paymentStatusListResult: payload.data,
      };
    },

    orderTypeList(state, { payload }) {
      return {
        ...state,
        orderTypeListResult: payload.data,
      };
    },

    cancelPay(state, { payload }) {
      return {
        ...state,
        cancelPayResult: payload,
      };
    },

    readCard(state, { payload }) {
      return {
        ...state,
        readCardInfo: payload && payload,
      };
    },
    continuePay(state, { payload }) {
      return {
        ...state,
        continuePayResult: payload,
      };
    },

    printBracelet(state, { payload }) {
      return {
        ...state,
        printBraceletResult: payload,
      };
    },

    ticketType(state, { payload }) {
      return {
        ...state,
        ticketTypeList: payload,
      };
    },





  },
};
