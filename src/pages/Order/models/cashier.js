import {
  venueName,
  cashierList,
  getOneByBasicId,
  saleAdd,
  admissionList,
  admissionIn,
  admissionOut,
  admissionInSure,
  findDictionaries,
  getPaymentList,
} from '@/services/cashier';



export default {
  namespace: 'cashiers',

  state: {
    venueNameResult:{},
    cashierListResult:{},
    getOneByBasicIdResult:{},
    saleAddResult:{},
    admissionListResult:{},
    admissionInResult:{},
    admissionOutResult:{},
    admissionInSureResult:{},
    findDictionariesResult:{},
    getPaymentListResult:{},
  },

  effects: {

    // 获取字典
    *finddictionaries({ payload }, { call, put }) {
      const response = yield call(findDictionaries, payload);
      yield put({
        type: 'findDictionaries',
        payload: response,
      });
    },

    // 支付方式
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
      yield put({
        type: 'saleAdd',
        payload: response,
      });
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
      console.log(payload,"payload----in");
      const response = yield call(admissionIn, payload);
      yield put({
        type: 'admissionIn',
        payload: response,
      });
    },


    // 入场验证确认
    *admissioninsure({ payload }, { call, put }) {
      console.log(payload,"payload----in666");
      const response = yield call(admissionInSure, payload);
      console.log(response,"payload----in888");
      yield put({
        type: 'admissionInSure',
        payload: response,
      });
    },

    // 出场核销查询信息
    *admissionout({ payload }, { call, put }) {
      console.log(payload,"payload----out");
      const response = yield call(admissionOut, payload);
      yield put({
        type: 'admissionOut',
        payload: response,
      });
    },



  },

  reducers: {
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
        admissionInResult: payload.data,
      };
    },

    admissionOut(state, { payload }) {
      return {
        ...state,
        admissionOutResult: payload.data,
      };
    },

    admissionInSure(state, { payload }) {
      return {
        ...state,
        admissionInSureResult: payload,
      };
    },

    findDictionaries(state, { payload }) {
      return {
        ...state,
        findDictionariesResult: payload.data,
      };
    },

    getPaymentList(state, { payload }) {
      return {
        ...state,
        getPaymentListResult: payload,
      };
    },






  },
};
