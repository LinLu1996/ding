import { stringify } from 'qs';
import request from '@/utils/request';


export async function queryList(params) {
  return request(`/venuebooking/venue/list?${stringify(params)}`);
}


export async function queryOne(params) {
  return request(`/venuebooking/venue/getbyid?${stringify(params)}`);
}

export async function venueSave(params) {
  return request('/venuebooking/venue/save', {
    method: 'POST',
    body: params,
  });
}

export async function venueEdit(params) {
  return request('/venuebooking/venue/update', {
    method: 'POST',
    body: params,
  });
}


export async function venueDeletList(params) {
  return request('/venuebooking/venue/delete', {
    method: 'POST',
    body: params,
  });
}


export async function felechCloseVenue(params) {
  return request(`/venuebooking/venue/close/list?${stringify(params)}`);

}


export async function CloseVenueEdit(params) {
  return request('/venuebooking/venue/close/edit', {
    method: 'POST',
    body: params,
  });
}


export async function CloseVenueDelete(params) {
  return request(`/venuebooking/venue/close/delete?${stringify(params)}`);
}


export async function CloseVenueSave(params) {
  return request('/venuebooking/venue/close/save', {
    method: 'POST',
    body: params,
  });
}


// ========================场地


export async function sportList(params) {
  return request(`/venuebooking/court/close/sports?${stringify(params)}&machineType=1`);
}




/*
export async function courtList(params) {
  console.log(params, "params---courtList");
  return request(`/api/court/list?${stringify(params)}`);
}


export async function courtDelete(params) {
  console.log(params, "params---courtDelete");
  return request(`/api/court/list?${stringify(params)}`);
} */





