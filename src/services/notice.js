import { stringify } from 'qs';
import request from '@/utils/request';


export async function queryList(params) {
  return request(`/venuebooking/notice/list?${stringify(params)}`);
}


export async function detailsInfo(params) {
  return request(`/venuebooking/notice/one?${stringify(params)}`);
}


export async function noticeAdd(params) {
  return request('/venuebooking/notice/add', {
    method: 'POST',
    body: params,
  });
}

export async function deleteList(params) {
  return request('/venuebooking/notice/delete', {
    method: 'PUT',
    body: params.deleteList,
  });
}

