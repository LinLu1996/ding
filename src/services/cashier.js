import { stringify } from 'qs';
import request from '@/utils/request';


export async function venueName(params) {
  return request(`/venuebooking/venue/selectBySport?${stringify(params)}`);
}

export async function findCourtInfo(params) {
  return request(`/venuebooking/court/findPermissionCourtInfo?${stringify(params)}`);
}


export async function cashierList(params) {
  return request(`/venuebooking/cashier/list?${stringify(params)}`);
}

export async function getOneByBasicId(params) {
  return request(`/venuebooking/cashier/getOneById?${stringify(params)}`);
}

export async function saleAdd(params) {
  return request('/venuebooking/cashier/saleTicket', {
    method: 'POST',
    body: params,
  });
}

export async function admissionList(params) {
  return request(`/venuebooking/cashier/admission/list?${stringify(params)}`);
}

export async function admissionIn(params) {
  return request(`/venuebooking/cashier/admission/in?${stringify(params)}`);
}

export async function admissionOut(params) {
  return request(`/venuebooking/cashier/admission/out?${stringify(params)}`);
}

export async function admissionInSure(params) {
  return request('/venuebooking/cashier/admission/in/sure', {
    method: 'POST',
    body: params,
  });
}

export async function findCapacity(params) {
  return request(`/venuebooking/cashier/findCapacity?${stringify(params)}`);
}

export async function findDictionaries(params) {
  return request(`/venuebooking/dictionaries/getDictionaries?${stringify(params)}`);
}

export async function getPaymentList(params) {
  return request(`/venuebooking/paymentMethod/getPayment?${stringify(params)}`);
}
// 会员卡读卡
export async function handleReadCard(params) {
  return request(`/venuebooking/memberCard/cardMember?${stringify(params)}`);
}

// 授权卡读卡
export async function handleReadPerCard(params) {
  return request(`/venuebooking/cardBasic/getCodePermission?${stringify(params)}`);
}

// 交班统计列表
export async function getCashierlist(params) {
  return request(`/venuebooking/order/totalMoney?${stringify(params)}`);
}
// 支付成功后请求手环信息
export async function printOrderDetail(params) {
  return request(`/venuebooking/order/printOrderInfo?${stringify(params)}`);
}
// 查询操作人
export async function queryOperater() {
  return request(`/venuebooking/report/userList`);
}

// 获取付款方式
export async function getPayList() {
  return request(`/venuebooking/dictionaries/paymentModeList`);
}

export async function sportList(params) {
  return request(`/venuebooking/court/permission/sports?${stringify(params)}&machineType=1`);
}
