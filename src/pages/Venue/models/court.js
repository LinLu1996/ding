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
  sportList,
  courtList,
  courtDelete,
  courtAdd,
  saleTypeList,
  getDetail,
} from '@/services/court';


export default {
  namespace: 'court',

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
    // ==============
    sportListResult:{},
    courtListResult:{},
    courtDeleteResult:{},
    courtAddResult:{},
    saleTypeListResult:{},
    sportType:null,
    detailList:{},
  },

  effects: {

   // 编辑获取详情
    *handleGetDetail({ payload }, { call, put }) {
      const response = yield call(getDetail, payload);
      yield put({
        type: 'updateState',
        payload: {
          detailList:response.data
        }
      });
    },

    // 保存查询条件
    *fetchSetSearch({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
    },

    // 销售类型
    *saletypelist({ payload }, { call, put }) {
      const response = yield call(saleTypeList, payload);
      yield put({
        type: 'saleTypeList',
        payload: response,
      });
    },

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

    // ==================================================================

    // 運動項目
    *sportlist({ payload }, { call, put }) {
      const response = yield call(sportList, payload);
      yield put({
        type: 'sportList',
        payload: response,
      });
    },

    // 场地列表
    *courtlist({ payload }, { call, put }) {
      const response = yield call(courtList, payload);
      yield put({
        type: 'courtList',
        payload: response,
      });
    },

    *courtdelete({ payload }, { call, put }) {
      const response = yield call(courtDelete, payload);
      yield put({
        type: 'courtDelete',
        payload: response,
      });
    },


    *courtadd({ payload }, { call, put }) {
      const response = yield call(courtAdd, payload);
      yield put({
        type: 'courtAdd',
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

    sportList(state, { payload }) {
      return {
        ...state,
        sportListResult: payload,
      };
    },

    CloseVenueSave(state, { payload }) {
      return {
        ...state,
        CloseVenueSaveResult: payload,
      };
    },

    courtList(state, { payload }) {
      return {
        ...state,
        courtListResult: payload,
      };
    },


    courtDelete(state, { payload }) {
      return {
        ...state,
        courtDeleteResult: payload,
      };
    },

    courtAdd(state, { payload }) {
      return {
        ...state,
        courtAddResult: payload,
      };
    },

    saleTypeList(state, { payload }) {
      return {
        ...state,
        saleTypeListResult: payload.data,
      };
    },



  },
};
