import {
  queryList,
  queryOne,
  venueSave,
  venueEdit,
  venueDeletList,
  felechCloseVenue,
  CloseVenueEdit,
  CloseVenueDelete,
  CloseVenueSave,
} from '@/services/venue';


export default {
  namespace: 'venue',

  state: {
    queryListResult:{},
    queryOneResult:{},
    venueSaveResult:{},
    venueEditResult:{},
    venueDeletListResult:{},
    felechCloseVenueResult:{},
    CloseVenueEditResult:{},
    CloseVenueDeleteResult:{},
    CloseVenueSaveResult:{},
  },

  effects: {
    // 场馆列表多条件查询
    *querylist({ payload }, { call, put }) {
      const response = yield call(queryList, payload);
      yield put({
        type: 'queryList',
        payload: response,
      });
    },

    // 场馆列表单个查询
    *queryone({ payload }, { call, put }) {
      const response = yield call(queryOne, payload);
      yield put({
        type: 'queryOne',
        payload: response,
      });
    },

    // 场馆新增
    *venuesave({ payload }, { call, put }) {
      const response = yield call(venueSave, payload);
      yield put({
        type: 'venueSave',
        payload: response,
      });
    },

    // 场馆修改
    *venueedit({ payload }, { call, put }) {
      const response = yield call(venueEdit, payload);
      yield put({
        type: 'venueEdit',
        payload: response,
      });
    },


    // 场馆删除
    *venuedeletlist({ payload }, { call, put }) {
      const response = yield call(venueDeletList, payload);
      yield put({
        type: 'venueDeletList',
        payload: response,
      });
    },

    // 场馆闭馆初始化
    *felechclosevenue({ payload }, { call, put }) {
      const response = yield call(felechCloseVenue, payload);
      yield put({
        type: 'felechCloseVenue',
        payload: response,
      });
    },



    // 场馆闭馆单个编辑
    *closevenueedit({ payload }, { call, put }) {
      const response = yield call(CloseVenueEdit, payload);
      yield put({
        type: 'CloseVenueEdit',
        payload: response,
      });
    },


    // 场馆闭馆单个删除
    *closevenuedelete({ payload }, { call, put }) {
      const response = yield call(CloseVenueDelete, payload);
      yield put({
        type: 'CloseVenueDelete',
        payload: response,
      });
    },

    // 场馆闭馆添加
    *closevenuesave({ payload }, { call, put }) {
      const response = yield call(CloseVenueSave, payload);
      yield put({
        type: 'CloseVenueSave',
        payload: response,
      });
    },



  },

  reducers: {
    queryList(state, { payload }) {
      return {
        ...state,
        queryListResult: payload,
      };
    },

    queryOne(state, { payload }) {
      return {
        ...state,
        queryOneResult: payload,
      };
    },

    venueSave(state, { payload }) {
      return {
        ...state,
        venueSaveResult: payload,
      };
    },

    venueEdit(state, { payload }) {
      return {
        ...state,
        venueEditResult: payload,
      };
    },


    venueDeletList(state, { payload }) {
      return {
        ...state,
        venueDeletListResult: payload,
      };
    },

    felechCloseVenue(state, { payload }) {
      return {
        ...state,
        felechCloseVenueResult: payload,
      };
    },



    CloseVenueEdit(state, { payload }) {
      return {
        ...state,
        CloseVenueEditResult: payload,
      };
    },

    CloseVenueDelete(state, { payload }) {
      return {
        ...state,
        CloseVenueDeleteResult: payload,
      };
    },


    CloseVenueSave(state, { payload }) {
      return {
        ...state,
        CloseVenueSaveResult: payload,
      };
    },


  },
};
