import request from "./request";
import { handleResponse } from './globalUtils';

export function renderPrintDiv(list) {
  return (
    `<span>
      ${list.map(item => (
        `<div style="width: 25cm;height: 2cm; background-color: aqua;font-size: 0.2cm; color: black">
          <span style="width: 10cm; height: 1.8cm; margin-left: 5.6cm; margin-top: 0.1cm; float: left;">
            <div style="width: 1.8cm; height: 1.8cm; float: left;">
              <img style="width: 100%;height: 100%;" src=${item.base64WristStrapNo} />
            </div>
            <div style="width: 8cm; height: 1.6cm; line-height:0.4cm;letter-spacing: 0.02cm;margin-top: 0.1cm; float: left;">
            ${item.enterRoom && `<div style="width: 7.8cm;margin-left: 0.1cm;"><span>${item.enterRoom}</span><span style="float: right">${item.couponNo.startsWith("T") ? "票号" : "手环号"}: ${item.couponNo}</span></div>`}
              <div style="width: 7.8cm;margin-left: 0.1cm;">${item.enterCourtTip}</div>
              <div style="width: 7.8cm;margin-left: 0.1cm;">${item.enterConsumeCourtTip}</div>
              <div style="width: 7.8cm;margin-left: 0.1cm;">出票时间: ${item.ticketingTime}</div>
            </div>
          </span>
        </div>`
      ))}
    </span>`
  );
}

export function renderTwoQrCode(list) {
  return (
    `<span>
      ${list.map(item => (
      `<div style="width: 25cm;height: 2cm; background-color: aqua;font-size: 0.2cm;">
          <span style="width: 10cm; height: 1.8cm; margin-left: 5.6cm; margin-top: 0.1cm; float: left;">
            <div style="width: 1.8cm; height: 1.8cm; float: left;">
              <img style="width: 100%;height: 100%;" src=${item.base64WristStrapNo} />
            </div>
            <div style="width: 6cm; height: 1.6cm; line-height:0.4cm;letter-spacing: 0.02cm;margin-top: 0.1cm; float: left; overflow: hidden">
            ${item.enterRoom && `<div style="width: 7.8cm;margin-left: 0.1cm;"><span>${item.enterRoom}</span><span style="float: right">${item.couponNo.startsWith("T") ? "票号" : "手环号"}: ${item.couponNo}</span></div>`}
              <div style="width: 7.8cm;margin-left: 0.1cm;">${item.enterCourtTip}</div>
              <div style="width: 7.8cm;margin-left: 0.1cm;">${item.enterConsumeCourtTip}</div>
              <div style="width: 7.8cm;margin-left: 0.1cm;">出票时间: ${item.ticketingTime}</div>
            </div>
            <div style="width: 1.8cm; height: 1.8cm; float: right;">
              <img style="width: 100%;height: 100%;" src=${item.base64WristStrapNo} />
            </div>
          </span>
        </div>`
    ))}
    </span>`
  );
}

export function doPrint(list) {
  window.document.body.width = 20;
  window.document.body.height = 20;
  window.document.body.innerHTML = renderPrintDiv(list).replace(/div>,<div/ig, "div><div");
  window.print.width = 20;
  setTimeout(() => {
    window.print();
    window.location.reload();
  }, 100);
}

/**
 * 售票打印
 * @param orderNo
 */
export function handlePrint(orderNo) {
  if (orderNo) {
    request(`/venuebooking/order/printOrderInfo?orderNo=${orderNo}`)
      .then(response => {
        if (handleResponse(response) && Array.isArray(response.data) && response.data.length > 0) {
          doPrint(response.data);
        } else {
          // 票券信息获取失败
        }
      });
  }
}

/**
 * 票券打印
 * @param couponNo
 */
export function handlePrintBracelet(couponNo) {
  if (couponNo) {
    request(`/venuebooking/order/printWristSrap?couponNo=${couponNo}`)
      .then(response => {
        if (handleResponse(response)) {
          doPrint([response.data]);
        } else {
          // 票券信息获取失败
        }
      });
  }
}

/**
 * 打印年卡票券
 * @param cardNo
 */
export function handlePrintYearBracelet(cardNo) {
  if (cardNo) {
    request(`/venuebooking/cardBasic/printWristSrap?cardNo=${cardNo}`)
      .then(response => {
        if (handleResponse(response)) {
          doPrint([response.data]);
        } else {
          // 票券信息获取失败
        }
      });
  }
}
