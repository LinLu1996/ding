import moment from 'moment';
import { stringify } from 'qs';
import request from '../utils/request';

/**
 * 初始化集控器
 * @returns {Promise<void>}
 */
export async function initialCentralizedCtrl() {
  return request('/venuebooking/gateAndLocker/getCentralizedDtoList');
}

export async function initialWardrobeNoList(centralizedCtrl) {
  return request(`/venuebooking/gateAndLocker/getBoxList?boxManagerKey=${centralizedCtrl}`)
}

export async function fetchList(params) {
  const newParams = {...params};
  if (params.startTime) {
    newParams.startTime = moment(newParams.startTime).format("YYYY-MM-DD HH:mm:ss");
  }
  if (params.endTime) {
    newParams.endTime = moment(newParams.endTime).format("YYYY-MM-DD HH:mm:ss");
  }
  return request(`/venuebooking/gateAndLocker/getBoxUseRecord?${stringify(newParams)}`)
}
