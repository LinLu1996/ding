import {
  admissionIn,
  sportList,
  displayTicket,
  displayCard,
  remindThen,
  admissionInSure,
  admissionOutSure,
  bookingModal,
  bookSure,
  payMethodList,

} from '@/services/bookPlace';


export default {
  namespace: 'bookPlaces',

  state: {
    admissionInResult:{},
    sportListResult:{},
    displayTicketResult:{},
    displayCardResult:{},
    remindThenResult:{},
    admissionInSureResult:{},
    admissionOutSureResult:{},
    bookingModalResult:{},
    bookSureResult:{},
    payMethodListResult:{},
  },

  effects: {


    // 订场销售确定
    *booksure({ payload }, { call, put }) {
      const response = yield call(bookSure, payload);
      yield put({
        type: 'bookSure',
        payload: response,
      });
    },

    // 入场验证
    *admissionin({ payload }, { call, put }) {
      const response = yield call(admissionIn, payload);
      yield put({
        type: 'admissionIn',
        payload: response,
      });
    },

    // 入场确定
    *admissioninsure({ payload }, { call, put }) {
      const response = yield call(admissionInSure, payload);
      yield put({
        type: 'admissionInSure',
        payload: response,
      });
    },

    // 运动项目
    *sportlist({ payload }, { call, put }) {
      const response = yield call(sportList, payload);
      yield put({
        type: 'sportList',
        payload: response,
      });
    },

    // 显示票券
    *displayticket({ payload }, { call, put }) {
      const response = yield call(displayTicket, payload);
      yield put({
        type: 'displayTicket',
        payload: response,
      });
    },

    // 显示会员卡
    *displaycard({ payload }, { call, put }) {
      const response = yield call(displayCard, payload);
      yield put({
        type: 'displayCard',
        payload: response,
      });
    },

    // 到时提醒
    *remindthen({ payload }, { call, put }) {
      const response = yield call(remindThen, payload);
      yield put({
        type: 'remindThen',
        payload: response,
      });
    },

    // 出场核销确认
    *admissionoutsure({ payload }, { call, put }) {
      const response = yield call(admissionOutSure, payload);
      yield put({
        type: 'admissionOutSure',
        payload: response,
      });
    },

    // 订场modal
    *bookingmodal({ payload }, { call, put }) {
      const response = yield call(bookingModal, payload);
      yield put({
        type: 'bookingModal',
        payload: response,
      });
    },

    // 获取支付方式list
    *paymethodlist({ payload }, { call, put }) {
      const response = yield call(payMethodList, payload);
      yield put({
        type: 'payMethodList',
        payload: response,
      });
    },



  },

  reducers: {
    admissionIn(state, { payload }) {
      return {
        ...state,
        admissionInResult: payload.data,
      };
    },

    sportList(state, { payload }) {
      return {
        ...state,
        sportListResult: payload,
      };
    },


    displayTicket(state, { payload }) {
      return {
        ...state,
        displayTicketResult: payload,
      };
    },

    displayCard(state, { payload }) {
      return {
        ...state,
        displayCardResult: payload,
      };
    },

    remindThen(state, { payload }) {
      return {
        ...state,
        remindThenResult: payload,
      };
    },


    admissionInSure(state, { payload }) {
      return {
        ...state,
        admissionInSureResult: payload,
      };
    },


    admissionOutSure(state, { payload }) {
      return {
        ...state,
        admissionOutSureResult: payload,
      };
    },

    bookingModal(state, { payload }) {
      return {
        ...state,
        bookingModalResult: payload.data,
      };
    },


    bookSure(state, { payload }) {
      return {
        ...state,
        bookSureResult: payload,
      };
    },

    payMethodList(state, { payload }) {
      return {
        ...state,
        payMethodListResult: payload,
      };
    },






  },
};
