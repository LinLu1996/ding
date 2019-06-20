import { stringify } from 'qs';
import request from '@/utils/request';

// 获取适用项目
export async function getApplicableItems(params) {
  return request(`/venuebooking/sportItem/getSprotNameByCard?${stringify(params)}`);
}

/**
 * 获取所有适用项目
 * @param params
 * @returns {Promise<void>}
 */
export async function getAllSportItems(params) {
  return request(`/venuebooking/sportItem/getAllSportItems?${stringify(params)}`);
}

// 获取场馆下拉列表
export async function getCourtName() {
  return request(`/venuebooking/court/getCourtName`);
}

// 获取卡列表
export async function queryList(params) {
  return request(`/venuebooking/cardBasic/cardList?${stringify(params)}`);
}

// 删除门票
export async function handleDelete(params) {
  return request(`/venuebooking/cardBasic/deleteCard?${stringify(params)}`);
}

// 卡上下架
export async function handleUp(params) {
  return request(`/venuebooking/cardBasic/saleStatus?${stringify(params)}`);
}

// 新增卡
export async function addCard(params) {
  return request('/venuebooking/cardBasic/addCard',{
    method: 'POST',
    body: params,
  });
}

// 编辑卡详情
export async function getCardInfo(params) {
  return request(`/venuebooking/cardBasic/getById?${stringify(params)}`);
}

// 编辑卡
export async function editCard(params) {
  return request('/venuebooking/cardBasic/editCard',{
    method: 'POST',
    body: params,
  });
}
// 卡管理调整列表查询
export async function queryCardAdjust(params) {
  return request(`/venuebooking/cardBasic/cardList?${stringify(params)}`);
}

// 卡管理出入库详情
export async function getStockInfo(params) {
  return request(`/venuebooking/cardBasic/getById?${stringify(params)}`);
}

// 卡管理履历列表
export async function getCurriculumTable(params) {
  return request(`/venuebooking/cardStock/stockList?${stringify(params)}`);
}

// 出库入库提交
export async function handleSocket(params) {
  return request(`/venuebooking/cardStock/addStock?${stringify(params)}`);
}

// 销售管理获取状态
export async function getStatus(params) {
  return request(`/venuebooking/dictionaries/getDictionaries?${stringify(params)}`);
}

// 卡列表获取上下架
export async function getUpperList(params) {
  return request(`/venuebooking/dictionaries/shelf?${stringify(params)}`);
}

// 销售管理列表
export async function querySaleList(params) {
  return request(`/venuebooking/memberCard/getList?${stringify(params)}`);
}

// 销售管理开卡读卡
export async function handleReadCard(params) {
  return request(`/venuebooking/memberCard/cardStatus?${stringify(params)}`);
}


export async function handleReadCardDetail(params) {
  return request(`/venuebooking/memberCard/cardStatus/detail?${stringify(params)}`);
}

// 销售管理获取卡名称
export async function getCardName(params) {
  return request(`/venuebooking/cardBasic/cardByType?${stringify(params)}`);
}

// 销售管理根据卡名称获取卡详情
export async function getYearInfo(params) {
  return request(`/venuebooking/cardBasic/getById?${stringify(params)}`);
}

// 销售管理会员开卡
export async function activateCard(params) {
  return request('/venuebooking/memberCard/addCardMember',{
    method: 'POST',
    body: params,
  });
}

// 销售管理会员充值获取支付方式
export async function getPayType(params) {
  return request(`/venuebooking/paymentMethod/getPayment?${stringify(params)}`);
}

// 销售管理会员充值详情
export async function getRechargeInfo(params) {
  return request(`/venuebooking/memberCard/cardMember?${stringify(params)}`);
}

// 销售管理会员充值提交
export async function handleRecharge(params) {
  return request('/venuebooking/memberCard/recharge',{
    method: 'POST',
    body: params,
  });
}

// 销售管理会员补换卡详情
export async function getReplacementInfo(params) {
  return request(`/venuebooking/memberCard/cardMemberInfo?${stringify(params)}`);
}

// 销售管理会员补换卡读取卡号
export async function replacementReadCard(params) {
  return request(`/venuebooking/memberCard/cardStatus?${stringify(params)}`);
}

// 销售管理会员补换卡提交
export async function submitReplacement(params) {
  return request('/venuebooking/memberCard/replace',{
    method: 'POST',
    body: params,
  });
}

// 销售管理查询交易记录
export async function queryTransactionList(params) {
  // return request(`/venuebooking/memberCard/getList?${stringify(params)}`);
  return request(`/venuebooking/memberCard/getRecordList?${stringify(params)}`);
}

export async function displayCard(params) {
  return request(`/venuebooking/memberCard/getListByMobile?${stringify(params)}`);
}
// 挂失
export async function lossCard(params) {
  console.log(params,"???");
  return request('/venuebooking/memberCard/reportLoss',{
    method: 'POST',
    body: params,
  });
}

// 解挂
export async function noLossCard(params) {
  console.log(params,"???!!");
  return request('/venuebooking/memberCard/solution',{
    method: 'POST',
    body: params,
  });
}


export async function refundCard(params) {
  return request(`/venuebooking/memberCard/cardMemberByCardNo?${stringify(params)}`);
}

// 退卡确认
export async function refundSure(params) {
    return request('/venuebooking/memberCard/refundCard',{
    method: 'POST',
    body: params,
  });
}
export async function printBracelet(params) {
  return request(`/venuebooking/cardBasic/printWristSrap?${stringify(params)}`);
}

/**
 * 编辑卡
 * @returns {Promise<void>}
 */
export async function handleSubmitEdit(params) {
  return request('/venuebooking/memberCard/editCardMember', {
    method: 'PUT',
    body: params,
  });
}
