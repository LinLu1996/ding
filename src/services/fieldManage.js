import request from '../utils/request';

/**
 * initial projects
 * @returns {Promise<void>}
 */

export async function initialProjects() {
  return request(`/venuebooking/sportItem/sportItemList`);
}

/**
 * initial timeUnitList
 * @param sportItemId
 * @returns {Promise<*>}
 */
export async function initialTimeUnits(sportItemId) {
  return request(`/venuebooking/sportItem/minSaleTime?sportItemId=${sportItemId}`);
}

/**
 * initial business time
 * @param sportItemId
 * @returns {*}
 */
export function initialBusinessTime(sportItemId) {
  return request(`/venuebooking/court/getVenueBusinessTime?sportItemId=${sportItemId}`);
}

/**
 * initial courts
 * @param sportItemId
 * @returns {Promise<*>}
 */
export async function initialCourts(sportItemId) {
  return request(`/venuebooking/court/getCourtList?sportItemId=${sportItemId}`);
}

/**
 * get time unit
 * @returns {Promise<void>}
 */
export async function getTableTimeUnit(params) {
  return request('/venuebooking/court/getTimeUnit', {
    method: 'POST',
    body: params,
  });
}

/**
 * submit price settings
 * @param params
 * @returns {Promise<*>}
 */
export async function postPriceSetting(params) {
  return request('/venuebooking/court/saveSetting', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function postModifiedData(params) {
  return request('/venuebooking/court/priceEffect', {
    method: 'POST',
    body: {
      ...params,
    },
  })
}
