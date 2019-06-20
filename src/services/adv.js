import { stringify } from 'qs';
import request from '../utils/request';

export async function fetchList(params) {
  return request(`/venuebooking/advertisement/list?${stringify(params)}`);
}

export async function deleteAdvertisements(ids) {
  let requestUrl = '/venuebooking/advertisement/delete';
  ids.forEach((id, index) => {
    requestUrl += `${index === 0 ? '?' : '&'}id=${id}`;
  });
  return request(requestUrl, {
    method: 'DELETE',
  });
}
