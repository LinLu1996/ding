import request from '@/utils/request';

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/venuebooking/global/dictionaries/getUserInfo');
}

// 查询当前用户权限
export async function queryAuthorites() {
  return request('/venuebooking/global/dictionaries/function');
}
