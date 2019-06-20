import request from "./request";
import { handleResponse } from './globalUtils';

export function renderPrintDiv(parmas) {
  console.log(parmas.list);
  return (
    `<div style="color: black">
        <div style="text-align:center;font-size: 0.5cm; color: black">东方体育中心欢迎您!</div>
        <p style="padding-left:1cm;font-size: 0.4cm; color: black;margin-top: 0.5cm" >时段:<span style="font-size: 0.3cm;">${parmas.startValue}~${parmas.endValue}</span><p>
        <p style="padding-left:1cm;font-size: 0.4cm; color: black" >打印操作员:${parmas.creator}<p>
        <p style="padding-left:1cm;font-size: 0.4cm; color: black" >项目收入:${parmas.totalMoney}<p>
        <div>
        ${parmas.list.map(item => (
          `<div style="width: 25cm;height: 2cm; background-color: aqua;font-size: 0.4cm; color: black;margin-top:0.5cm;border-top: 1px dashed #ddd;padding-top: 0.2cm">
          <p style="padding-left:1cm;font-size: 0.4cm; color: black">票名:${item.orderName}<p>
          <p style="padding-left:1cm;font-size: 0.4cm; color: black">数量:${item.count}<p>
          <p style="padding-left:1cm;font-size: 0.4cm; color: black">价格（元）:${item.money}<p>
            </div>
          </div>`
        ))}
      </div>
    </div>`
  );
}


export function doPrint(parmas) {
  console.log(parmas);
  window.document.body.width = 200;
  window.document.body.innerHTML = renderPrintDiv(parmas);
  window.print.width = 200;
  window.print.height = 500;
  setTimeout(() => {
    window.print();
    window.location.reload();
  }, 100);
}


