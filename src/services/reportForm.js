import { stringify } from 'qs';
import request from '@/utils/request';

// 查询列表
export async function queryTable(params) {
  return request(`/venuebooking/global/report/courtReport/view?${stringify(params)}`);
}

// 查询操作人
export async function queryOperater() {
  return request(`/venuebooking/report/userList`);
}

// 获取适用项目
export async function querySport() {
  return request(`/venuebooking/sportItem/getSprotName`);
}

// 新增门票
export async function addTicket(params) {
  return request('/venuebooking/ticketBasic/addTicket',{
    method: 'POST',
    body: params,
  });
}

// 出库入库详情
export async function getStockInfo(params) {
  return request(`/venuebooking/ticketBasic/getById?${stringify(params)}`);
}

