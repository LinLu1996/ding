import request from "./request";
import { handleResponse } from './globalUtils';

export function renderPrintDiv(data) {
  return (
    `<div>
      <p style='color:#000;position:relative;height:20px'><span style='position:absolute;left:2px;text-align:right;display:inline-block;transform:scale(0.7)'>订单号:</span><span style='margin-left: 10px;display:inline-block;width:calc(100% - 30px);transform:scale(0.7);position:absolute;right:0;text-align:left;'>${data.orderNo}</span></p>
      <p style='color:#000;position:relative;height:20px'><span style='position:absolute;left:0;text-align:right;display:inline-block;transform:scale(0.7)'>订单类型:</span><span style='margin-left: 10px;transform:scale(0.7);display:inline-block;width:calc(100% - 30px);transform:scale(0.7);position:absolute;right:0;text-align:left;'>${data.orderType}</span></p>
      <p style='color:#000;position:relative;height:20px'><span style='position:absolute;left:0;text-align:right;display:inline-block;transform:scale(0.7)'>支付金额:</span><span style='margin-left: 10px;transform:scale(0.7);display:inline-block;width:calc(100% - 30px);transform:scale(0.7);position:absolute;right:0;text-align:left;'>${data.paymentAmount}</span></p>
      <p style='color:#000;position:relative;height:20px'><span style='position:absolute;left:0;text-align:right;display:inline-block;transform:scale(0.7)'>支付时间:</span><span style='margin-left: 10px;transform:scale(0.7);display:inline-block;width:calc(100% - 30px);transform:scale(0.7);position:absolute;right:0;text-align:left;'>${data.paymentTime}</span></p>
      <p style='width:100%;height:80px;color:#fff;opacity:0'>a</p>
      </div>`
  );
}


export function doPrint(data) {
  window.document.body.width = 200;
  window.document.body.height = 200;
  window.document.body.innerHTML = renderPrintDiv(data);
  window.print.width = 200;
  window.print.height = 500;
  setTimeout(() => {
    window.print();
    window.location.reload();
  }, 100);
}

/**
 * 售票打印
 * @param orderNo
 */
export function printOrder(orderNo) {
  if (orderNo) {
    request(`/venuebooking/order/printReceiptInfo?orderNo=${orderNo}`)
      .then(response => {
        if (handleResponse(response) && response.code === 200 && response.msg === '成功') {
          doPrint(response.data);
        } else {
          // 票券信息获取失败
        }
      });
  }
}

