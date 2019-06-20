import { stringify } from 'qs';
import request from '@/utils/request';


export async function salesOrderList(params) {
  return request(`/venuebooking/order/salesOrderList?${stringify(params)}`);
}

export async function detailsInfo(params) {
  return request(`/venuebooking/order/salesOrderInfo?${stringify(params)}`);
}

export async function refundDetails(params) {
  return request(`/venuebooking/order/salesRefundInfo?${stringify(params)}`);
}

export async function handleRefund(params) {
  return request(`/venuebooking/order/salesRefund?${stringify(params)}`);
}

export async function consumeRecordList(params) {
  return request(`/venuebooking/order/consumeRecordList?${stringify(params)}`);
}



export async function soprtList(params) {
  return request(`/venuebooking/dictionaries/sportItemList`);
}

export async function consumeState(params) {
  return request(`/venuebooking/dictionaries/consumeStatusList`);
}

export async function consumeRecordInfo(params) {
  return request(`/venuebooking/order/consumeRecordInfo?${stringify(params)}`);
}

export async function financeBillsList(params) {
  return request(`/venuebooking/order/financeBillsList?${stringify(params)}`);
}

export async function financeBillsTicket(params) {
  return request(`/venuebooking/order/financeBillsTicket?${stringify(params)}`);
}

export async function financeBillsCourt(params) {
  return request(`/venuebooking/order/financeBillsCourt?${stringify(params)}`);
}


export async function paymentModeList(params) {
  return request(`/venuebooking/dictionaries/paymentModeList`);
}

export async function paymentStatusList(params) {
  return request(`/venuebooking/dictionaries/paymentStatusList`);
}

export async function orderTypeList(params) {
  return request(`/venuebooking/dictionaries/orderTypeList`);
}

export async function cancelPay(params) {
  return request(`/venuebooking/order/cancelPayment?${stringify(params)}`);
}

export async function continuePay(params) {
  return request(`/venuebooking/order/continuePay?${stringify(params)}`);
}

// 授权读卡
export async function handleReadCard(params) {
  return request(`/venuebooking/cardBasic/getCodePermission?${stringify(params)}`);
}

export async function printBracelet(params) {
  return request(`/venuebooking/order/printWristSrap?${stringify(params)}`);
}

export async function getTicketType(params) {
  return request(`/venuebooking/dictionaries/findEnum?${stringify(params)}`);
}



