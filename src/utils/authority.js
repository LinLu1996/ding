import React from 'react';

// use localStorage to store the authority info, which might be sent from server in actual project.
export function getAuthority(str) {
  // return localStorage.getItem('antd-pro-authority') || ['admin', 'user'];
  const authorityString =
    typeof str === 'undefined' ? localStorage.getItem('juss-auth') : str;
  // authorityString could be admin, "admin", ["admin"]
  let authority;
  try {
    authority = JSON.parse(authorityString);
  } catch (e) {
    authority = authorityString;
  }
  if (typeof authority === 'string') {
    return [authority];
  }
  return authority || ['admin'];
}

export function setAuthority(authority) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  return localStorage.setItem('juss-auth', JSON.stringify(proAuthority));
}

/**
 * 判断是否具有指定权限
 * @param authority
 * @returns {boolean}
 */
export function hasAuthority(authority) {
  const authList = getAuthority();
  let flag = false;
  authList.forEach(item => {
    if (item === authority) {
      flag = true;
    }
  });
  return flag;
}

/**
 * 无权限占位符
 * @param text
 * @returns {*}
 */
export function noMatch(text) {
  return <div>{text || '无权限'}</div>;
}
