import { stringify } from 'qs';
import request from '@/utils/request';


export async function sportList(params) {
  return request(`/venuebooking/court/permission/sports?${stringify(params)}&machineType=1`);
}

export async function admissionIn(params) {
  return request(`/venuebooking/cashier/checkNo?${stringify(params)}`);
}

export async function displayTicket(params) {
  return request(`/venuebooking/cashier/getCouponByMoblie?${stringify(params)}`);
}

export async function displayCard(params) {
  return request(`/venuebooking/memberCard/getListByMobile?${stringify(params)}`);
}

export async function remindThen(params) {
  return request(`/venuebooking/cashier/getOvertime?${stringify(params)}`);
}

export async function admissionInSure(params) {
  return request('/venuebooking/cashier/checkSure',{
    method: 'POST',
    body: params,
  });
}

export async function admissionOutSure(params) {
  return request('/venuebooking/cashier/outPay',{
    method: 'POST',
    body: params,
  });
}


export async function bookingModal(params) {
  return request('/venuebooking/cashier/getSelect',{
    method: 'POST',
    body: params,
  });
}

export async function bookSure(params) {
  return request('/venuebooking/cashier/saveCourtSale',{
    method: 'POST',
    body: params,
  });
}

export async function payMethodList(params) {
  return request(`/venuebooking/dictionaries/getDictionaries?${stringify(params)}`);
}











