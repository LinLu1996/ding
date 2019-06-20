import React from 'react';
import { message, Modal } from 'antd';
import number from 'numeral';

/**
 * 接口处理
 * @param response
 * @param showSuccess
 * @returns {boolean}
 */
export function handleResponse(response, showSuccess) {
  let flag = false;
  if (response) {
    if (response.code === 200) {
      if (showSuccess && (response.msg && response.msg.trim().length > 0 || response.message && response.message.trim().length > 0)) {
        message.success(response.msg || response.messages);
      }
      flag = true;
    } else {
      Modal.error({
        title: '错误',
        content: response.msg || response.message,
        okText: '知道了',
      });
    }
  } else {
    message.error('连接超时');
  }
  return flag;
}

/**
 * 灰色背景标题
 * @param title
 * @returns {*}
 */
export function renderTitle(title) {
  const style = {
    height: 36,
    paddingTop: 8,
    paddingLeft: 8,
    backgroundColor: '#F2F2F2',
    borderRadius: 2,
  };
  return <div style={style}>{title}</div>;
}

/**
 * 表单必填星号重写
 * @param title
 * @returns {*}
 */
export function renderRequired(title) {
  return <span><span style={{ color: 'red' }}>* </span>{title}</span>;
}

/**
 * 表格颜色指示
 * @param item
 * @returns {*}
 */
export function renderSign(item) {
  const style = {
    width: 64,
    height: 24,
    float: 'left',
    borderRadius: 4,
    border: '1px solid #D9D9D9',
    backgroundColor: item.color,
  };
  return (
    <div style={{ float: 'left' }} key={item.key}>
      <div style={style} />
      <span style={{ float: 'right', paddingTop: 2, paddingRight: 16, marginLeft: 8 }}>{item.label}</span>
    </div>
  );
}

/**
 * 价格格式化
 * @param price
 * @returns {number}
 */
export function formatterPrice(price) {
  let value;
  try {
    value = Number(price) > 0 ? Number(price) : 0;
  } catch (e) {
    value = 0
  }
  return number(value).format('0,0.00');
}

/**
 * 卡类型名称
 * @param cardType
 */
export function renderCardTypeString(cardType) {
  switch (cardType) {
    case 1:
      return "年卡";
    case 2:
      return "储值卡";
    case 3:
      return "次卡";
    default:
      return "";
  }
}
