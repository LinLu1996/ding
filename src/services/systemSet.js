import { stringify } from 'qs';
import request from '@/utils/request';

// 系统设置项目列表查询
export async function queryList(params) {
  return request(`/venuebooking/sportItem/list?${stringify(params)}`);
}

// 系统设置项目列表改变状态启用停用
export async function changeStatus(params) {
  return request('/venuebooking/sportItem/sportItemSave',{
    method: 'POST',
    body: params,
  });
}

// 系统设置项目权限列表查询
export async function queryPermission(params) {
  return request(`/venuebooking/userItemPermission/list?${stringify(params)}`);
}

// 销售管理会员开卡
export async function activateCard(params) {
  return request('/venuebooking/memberCard/addCardMember',{
    method: 'POST',
    body: params,
  });
}

// 销售管理项目列表新增项目
export async function addProject(params) {
  return request('/venuebooking/sportItem/sportItemSave',{
    method: 'POST',
    body: params,
  });
}

// 销售管理项目列表新增项目
export async function editProject(params) {
  return request(`/venuebooking/cardBasic/getById?${stringify(params)}`);
}

// 销售管理项目列表删除项目
export async function handleDelete(params) {
  return request('/venuebooking/sportItem/soprtItemBatchDelete',{
    method: 'PUT',
    body: params,
  });
}

// 销售管理项目列表获取权限
export async function getPermission(params) {
  return request(`/venuebooking/userItemPermission/permissionGet?${stringify(params)}`);
}


// 销售管理项目列表获取所有权限
export async function getPermissionAll(params) {
  return request(`/venuebooking/userItemPermission/permissionList?${stringify(params)}`);
}

// 销售管理公司信息获取
export async function getCompanyInfo(params) {
  return request(`/venuebooking/enterprise/enterpriseGet?${stringify(params)}`);
}

// 销售管理公司信息保存
export async function editCompanyInfo(params) {
  return request('/venuebooking/enterprise/enterpriseSave',{
    method: 'POST',
    body: params,
  });
}

// 销售管理项目权限设置
export async function setPermission(params) {
  return request('/venuebooking/userItemPermission/permissionSave',{
    method: 'POST',
    body: params,
  });
}


// 销售管理项目列表编辑获取详情
export async function getListDetail(params) {
  return request(`/venuebooking/sportItem/sportItemGet?${stringify(params)}`);
}
