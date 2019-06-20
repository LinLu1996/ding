import { stringify } from 'qs';
import request from '@/utils/request';

// 广告列表查询
export async function queryList(params) {
  return request(`/dcAdmin/advertisement/list?${stringify(params)}`);
}

// 广告列表删除
export async function handleDelete(params) {
  return request(`/dcAdmin/advertisement/delete?${stringify(params)}`);
}

// 编辑列表获取详情
export async function getListDetail(params) {
  return request(`/dcAdmin/sportItem/sportItemGet?${stringify(params)}`);
}

// 新增编辑保存
export async function addProject(params) {
  return request('/dcAdmin/advertisement/save',{
    method: 'POST',
    body: params,
  });
}
