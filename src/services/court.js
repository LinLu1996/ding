import { stringify } from 'qs';
import request from '@/utils/request';


export async function queryList(params) {
  return request(`/venuebooking/court/list?${stringify(params)}`);
}


export async function queryOne(params) {
  return request(`/venuebooking/court/getbyid?${stringify(params)}`);
}

export async function venueSave(params) {
  return request('/venuebooking/court/save', {
    method: 'POST',
    body: params,
  });
}

export async function venueEdit(params) {
  return request('/venuebooking/court/update', {
    method: 'POST',
    body: params,
  });
}


export async function venueDeletList(params) {
  return request('/venuebooking/court/delete', {
    method: 'POST',
    body: params,
  });
}


export async function felechCloseVenue(params) {
  return request(`/venuebooking/court/close/list?${stringify(params)}`);

}


export async function CloseVenueEdit(params) {
  return request('/venuebooking/court/close/edit', {
    method: 'POST',
    body: params,
  });
}


export async function CloseVenueDelete(params) {
  return request(`/venuebooking/court/close/delete?${stringify(params)}`);
}


export async function CloseVenueSave(params) {
  return request('/venuebooking/court/close/save', {
    method: 'POST',
    body: params,
  });
}


// ========================场地


export async function sportList(params) {
  return request(`/venuebooking/court/close/sports?${stringify(params)}&machineType=1`);
}

export async function courtList(params) {
  return request(`/venuebooking/court/list?${stringify(params)}`);
}


export async function courtDelete(params) {
  return request('/venuebooking/court/delete', {
    method: 'POST',
    body: params,
  });
}

export async function saleTypeList(params) {
  return request(`/venuebooking/dictionaries/saleTypeList`);
}


export async function courtAdd(params) {
  return request('/venuebooking/court/save', {
    method: 'POST',
    body: params,
  });
}

export async function getDetail(params) {
  return request(`/venuebooking/court/getById?${stringify(params)}`);
}




