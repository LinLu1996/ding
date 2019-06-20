import router from 'umi/router';
import {
  getTableTimeUnit, initialBusinessTime, initialCourts, initialTimeUnits, postPriceSetting,
} from '../../../services/fieldManage';
import {
  days,
  handleTimeUnit,
  handleTableDataSource,
  handleWeekPriceData,
  getMonthBetween,
  getYear,
  setIsModified,
} from '../utils';
import { handleResponse } from '../../../utils/globalUtils';

export default {
  namespace: 'priceSetting',

  state: {
    // 是否修改数据
    isModified: false,
    // 订场时间单位
    saleTimeUnit: [],
    // 开关/闭馆时间段
    businessTime: {},
    // 场地
    fieldList: [],
    formData: {},
    list: [],
    setPrice: {
      visible: false,
    },
  },

  effects: {
    * initialTimeUnitList(_, { put, call, select }) {
      const sportItemId = yield select(state => state.fieldManage.selectedProject);
      const response = yield call(initialTimeUnits, sportItemId);
      if (handleResponse(response)) {
        yield put({
          type: 'updateState',
          payload: {
            saleTimeUnit: response.data.saleUnit,
          },
        });
      }
    },
    * initialBusinessTime(_, { put, call, select }) {
      const sportItemId = yield select(state => state.fieldManage.selectedProject);
      const response = yield call(initialBusinessTime, sportItemId);
      if (handleResponse(response)) {
        yield put({
          type: 'updateState',
          payload: {
            businessTime: response.data,
          },
        });
      }
    },
    * initialFieldList(_, { put, call, select }) {
      const sportItemId = yield select(state => state.fieldManage.selectedProject);
      const response = yield call(initialCourts, sportItemId);
      if (handleResponse(response)) {
        yield put({
          type: 'updateState',
          payload: {
            fieldList: response.data,
          },
        });
      }
    },
    * clearState({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
    },
    * onListChanged({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
    },
    * onCreatePriceClick({ payload }, { put, call }) {
      const response = yield call(getTableTimeUnit, payload.params);
      if (handleResponse(response)) {
        setIsModified(true);
        yield put({
          type: 'updateState',
          payload: {
            list: handleTableDataSource(handleTimeUnit(response.data), payload.params.basePrice),
          },
        });
      }
    },
    * onSetPriceVisibleChanged({ payload }, { put }) {
      yield put({
        type: 'updateSetPriceVisible',
        payload,
      });
    },
    * onSetPriceChanged({ payload }, { put, select }) {
      // let isModified = false;
      let list = yield select(state => state.priceSetting.list);
      list = list.map(item => {
        const newItem = { ...item };
        days.forEach(day => {
          if (newItem[`${day}Selected`]) {
            // isModified = isModified || Number(newItem[day]) !== Number(payload.price);
            newItem[day] = payload.price;
            delete newItem[`${day}Selected`];
          }
        });
        return newItem;
      });
      yield put({
        type: 'updateState',
        payload: {
          // isModified,
          list,
        },
      });
    },
    * onSubmitPriceSetting({ payload }, { call, select }) {
      const sportItemId = yield select(state => state.fieldManage.selectedProject);
      const originalList = yield select(state => state.priceSetting.list);
      const dataMap = handleWeekPriceData(originalList);
      const params = {
        ...payload,
        sportItemId,
        monthList: getMonthBetween(payload.startMonth, payload.endMonth),
        dataMap,
      };
      delete params.isRedirect;
      delete params.startMonth;
      delete params.endMonth;
      const response = yield call(postPriceSetting, params);
      if (handleResponse(response, true)) {
        setIsModified(false);
        if (payload.isRedirect) {
          router.push({
            pathname: '/fieldManage/priceSetting/preview',
            query: {
              year: getYear(payload.startMonth, payload.endMonth),
            },
          });
        }
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
    updateSetPriceVisible(state, { payload }) {
      return {
        ...state,
        setPrice: {
          ...state.setPrice,
          ...payload,
        },
      };
    },
  },
};
