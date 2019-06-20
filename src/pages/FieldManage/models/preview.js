import moment from 'moment';
import { postModifiedData } from '../../../services/fieldManage';
import { filterNoDataChange } from '../utils';
import { handleResponse } from '../../../utils/globalUtils';

export default {
  namespace: 'preview',

  state: {
    // 价格预览 年
    year: moment().format('YYYY'),
    // 价格预览-安场地 月份
    month: moment().format('YYYY-MM'),
    activeKey: 'yearView',
    // 场地
    activeTab: undefined,
    modifiedData: {},
    reset: false,
  },

  effects: {
    * setYear({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
    },
    * onTabsChanged({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
    },
    * setMonth({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
    },
    * reset({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
    },
    * onDataChanged({ payload }, { put, select }) {
      const { sportItem, court, date, timeUnit, price, status } = payload;
      const list = yield select(state => state.preview.modifiedData);
      if (list[sportItem]) {
        if (list[sportItem][court]) {
          if (list[sportItem][court][date]) {
            list[sportItem][court][date][timeUnit] = { price, status };
          } else {
            list[sportItem][court][date] = { [timeUnit]: { price, status } };
          }
        } else {
          list[sportItem][court] = { [date]: { [timeUnit]: { price, status } } };
        }
      } else {
        list[sportItem] = { [court]: { [date]: { [timeUnit]: { price, status } } } };
      }
      yield put({
        type: 'updateState',
        payload: {
          modifiedData: filterNoDataChange(list),
        },
      });
    },
    * handleSubmit(_, { put, select, call }) {
      const year = yield select(state => state.preview.year);
      const modifiedData = yield select(state => state.preview.modifiedData);
      const dataMap = {};
      const sportItems = Object.keys(modifiedData);
      sportItems.forEach(sportItem => {
        const courts = Object.keys(modifiedData[sportItem]);
        courts.forEach(court => {
          const dates = Object.keys(modifiedData[sportItem][court]);
          dates.forEach(date => {
            const timeUnits = Object.keys(modifiedData[sportItem][court][date]);
            timeUnits.forEach(timeUnit => {
              // court -> `${sportItem}-${court}`
              if (dataMap[`${sportItem}-${court}`]) {
                if (dataMap[`${sportItem}-${court}`][date]) {
                  dataMap[`${sportItem}-${court}`][date][timeUnit] = modifiedData[sportItem][court][date][timeUnit].price;
                } else {
                  dataMap[`${sportItem}-${court}`][date] = { [timeUnit]: modifiedData[sportItem][court][date][timeUnit].price };
                }
              } else {
                dataMap[`${sportItem}-${court}`] = { [date]: { [timeUnit]: modifiedData[sportItem][court][date][timeUnit].price } };
              }
            });
          });
        });
      });
      const params = { dataMap, year };
      const response = yield call(postModifiedData, params);
      if (handleResponse(response, true)) {
        // 清空对比数据
        yield put({
          type: 'updateState',
          payload: {
            modifiedData: {},
            reset: true,
          },
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
  },
};
