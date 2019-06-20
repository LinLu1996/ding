import {
  venueName,
  cashierList,
  getOneByBasicId,
  saleAdd,
  admissionList,
  admissionIn,
  admissionOut,
  admissionInSure,
  findCourtInfo,
  findCapacity,
  getPaymentList,
  findDictionaries,
  handleReadCard,
  handleReadPerCard,
  getCashierlist,
  printOrderDetail,
  queryOperater,
  getPayList,
  sportList,
} from '@/services/cashier';
import { handleResponse } from '../../../utils/globalUtils';


export default {
  namespace: 'cashier',

  state: {
    venueNameResult:{},
    cashierListResult:{},
    getOneByBasicIdResult:{},
    saleAddResult:{},
    admissionListResult:{},
    admissionInResult:{},
    admissionOutResult:{},
    admissionInSureResult:{},
    findCourtInfoResult:{},
    findCapacityResult:{},
    getPaymentListResult:{},
    findDictionariesResult:{},
    orderUrl: null,
    payStatus: null,
    readHuiCard:{},
    readPerCard:{},
    cashierList:{},
    printOrderDetailList:[],
    sportType:null,
    venueType:0,
    paymentTypeList:[], //支付方式
    operaterList:[], //操作人
    sportListResult:{},
  },

  effects: {

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

    // 運動項目
    *sportlist({ payload }, { call, put }) {
      const response = yield call(sportList, payload);
      yield put({
        type: 'sportList',
        payload: response,
      });
    },

    // 获取付款方式
    * fetchGetPayList({ payload }, { put, call }) {
      const response = yield call(getPayList, payload);
      if (handleResponse(response)) {
        yield put({
          type: 'updateState',
          payload: {
            paymentTypeList: response.data,
          },
        });
      }
    },

    // 保存查询条件
    *handleSetSportName({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
    },

    *fetchPrintOrderDetail({ payload }, { call, put }) {
      const response = yield call(printOrderDetail, payload);
      yield put({
        type: 'printOrderDetailList',
        payload: response && response.data,
      });
    },

    *getpaymentlist({ payload }, { call, put }) {
      const response = yield call(getPaymentList, payload);
      yield put({
        type: 'getPaymentList',
        payload: response,
      });
    },

    // 根据运动ID获取场馆list
    *venuename({ payload }, { call, put }) {
      const response = yield call(venueName, payload);
      yield put({
        type: 'venueName',
        payload: response,
      });
    },

    *findcourtinfo({ payload }, { call, put }) {
      const response = yield call(findCourtInfo, {...payload, machineType: 1 });
      yield put({
        type: 'findCourtInfo',
        payload: response,
      });
    },


    // 收银台list
    *cashierlist({ payload }, { call, put }) {
      const response = yield call(cashierList, payload);
      yield put({
        type: 'cashierList',
        payload: response,
      });
    },

    // 根据票id查询单个信息
    *getonebybasicid({ payload }, { call, put }) {
      const response = yield call(getOneByBasicId, payload);
      yield put({
        type: 'getOneByBasicId',
        payload: response,
      });
    },

    // 售票确认
    *saleadd({ payload }, { call, put }) {
      const response = yield call(saleAdd, payload);
      if(handleResponse(response,true)) {
        yield put({
          type: 'saleAdd',
          payload: response,
        });
      }
    },
    // 入场出场列表查询
    *admissionlist({ payload }, { call, put }) {
      const response = yield call(admissionList, payload);
      yield put({
        type: 'admissionList',
        payload: response,
      });
    },

    // 入场验证查询信息
    *admissionin({ payload }, { call, put }) {
      const response = yield call(admissionIn, payload);
      yield put({
        type: 'admissionIn',
        payload: response,
      });
    },


    // 入场验证确认
    *admissioninsure({ payload }, { call, put }) {
      const response = yield call(admissionInSure, payload);
      yield put({
        type: 'admissionInSure',
        payload: response,
      });
    },

    // 出场核销查询信息
    *admissionout({ payload }, { call, put }) {
      const response = yield call(admissionOut, payload);
      yield put({
        type: 'admissionOut',
        payload: response,
      });
    },

    // 获取最大容量，在馆人数
    *findcapacity({ payload }, { call, put }) {
      const response = yield call(findCapacity, payload);
      yield put({
        type: 'findCapacity',
        payload: response,
      });
    },

    *finddictionaries({ payload }, { call, put }) {
      const response = yield call(findDictionaries, payload);
      yield put({
        type: 'findDictionaries',
        payload: response,
      });
    },

    // 会员卡读卡
    *fetchHandleReadCard({ payload }, { call, put }) {
      const response = yield call(handleReadCard, payload);
      if(handleResponse(response,true)) {
        yield put({
          type: 'readCard',
          payload: response && response.data || {},
        });
      } else {
        yield put({
          type: 'readCard',
          payload: {},
        });
      }
    },

    // 授权卡号读取
    *fetchHandleReadPerCard({ payload }, { call, put }) {
      const response = yield call(handleReadPerCard, payload);
      if(handleResponse(response)) {
        yield put({
          type: 'readPerCard',
          payload: response,
        });
      }
    },

    *fetchCashierlist({ payload }, { call, put }) {
      const response = yield call(getCashierlist, payload);
      if(handleResponse(response)) {
        yield put({
          type: 'handleCashierlist',
          payload: response.data || {},
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
    sprotNameList(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    findCourtInfo(state, { payload }) {
      return {
        ...state,
        findCourtInfoResult: payload,
      };
    },

    venueName(state, { payload }) {
      return {
        ...state,
        venueNameResult: payload,
      };
    },

    cashierList(state, { payload }) {
      return {
        ...state,
        cashierListResult: payload,
      };
    },


    getOneByBasicId(state, { payload }) {
      return {
        ...state,
        getOneByBasicIdResult: payload,
      };
    },


    saleAdd(state, { payload }) {
      return {
        ...state,
        saleAddResult: payload,
      };
    },

    admissionList(state, { payload }) {
      return {
        ...state,
        admissionListResult: payload,
      };
    },

    admissionIn(state, { payload }) {
      return {
        ...state,
        admissionInResult: payload,
      };
    },

    admissionOut(state, { payload }) {
      return {
        ...state,
        admissionOutResult: payload,
      };
    },

    admissionInSure(state, { payload }) {
      return {
        ...state,
        admissionInSureResult: payload,
      };
    },

    findCapacity(state, { payload }) {
      return {
        ...state,
        findCapacityResult: payload.data,
      };
    },



    getPaymentList(state, { payload }) {
      return {
        ...state,
        getPaymentListResult: payload,
      };
    },

    findDictionaries(state, { payload }) {
      return {
        ...state,
        findDictionariesResult: payload.data,
      };
    },

    readCard(state, { payload }) {
      return {
        ...state,
        readHuiCard: payload,
      };
    },

    readPerCard(state, { payload }) {
      return {
        ...state,
        readPerCard: payload && payload.data,
      };
    },

    handleCashierlist(state, { payload }) {
      return {
        ...state,
        cashierList: payload,
      };
    },

    printOrderDetailList(state, { payload }) {
      return {
        ...state,
        printOrderDetailList:payload
      };
    },

    sportList(state, { payload }) {
      return {
        ...state,
        sportListResult: payload,
      };
    },
  },
};
