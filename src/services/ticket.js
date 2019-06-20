import { stringify } from 'qs';
import request from '@/utils/request';

// 获取项目类型下拉列表
export async function getSprotName() {
  return request(`/venuebooking/sportItem/getSprotName`);
}

// 获取上下架下拉列表
export async function getUpperList(params) {
  return request(`/venuebooking/dictionaries/shelf?${stringify(params)}`);
}

// 获取适用日期类型
export async function getDateType(params) {
  return request(`/venuebooking/dictionaries/getDictionaries?${stringify(params)}`);
}

// 获取场馆下拉列表
export async function getCourtName(params) {
  return request(`/venuebooking/court/getCourtName?${stringify(params)}`);
}

// 获取门票列表
export async function queryList(params) {
  return request(`/venuebooking/ticketBasic/ticketList?${stringify(params)}`);
}

// 删除门票
export async function handleDelete(params) {
  return request(`/venuebooking/ticketBasic/deleteTicket?${stringify(params)}`);
}

// 上下架
export async function handleUp(params) {
  return request(`/venuebooking/ticketBasic/saleStatus?${stringify(params)}`);
}

// 新增门票
export async function addTicket(params) {
  return request('/venuebooking/ticketBasic/addTicket',{
    method: 'POST',
    body: params,
  });
}

// 编辑门票
export async function editTicket(params) {
  return request('/venuebooking/ticketBasic/editTicket',{
    method: 'POST',
    body: params,
  });
}
// 门票调整列表查询
export async function queryTicketAdjust(params) {
  return request(`/venuebooking/ticketBasic/ticketStock?${stringify(params)}`);
}

// 出库入库详情
export async function getStockInfo(params) {
  return request(`/venuebooking/ticketBasic/getById?${stringify(params)}`);
}

// 履历列表
export async function getCurriculumTable(params) {
  return request(`/venuebooking/ticketStock/stockList?${stringify(params)}`);
}

// 出库入库提交
export async function handleSocket(params) {
  return request(`/venuebooking/ticketStock/addStock?${stringify(params)}`);
}

// 获取可售平台list
export async function machineList(params) {
  return request(`/venuebooking/dictionaries/getDictionaries?${stringify(params)}`);
}



