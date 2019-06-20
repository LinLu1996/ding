import React, { Component } from 'react';
import { connect } from 'dva';
import router from "umi/router";
import { Card, Button, Form, Col, Row, DatePicker, Input, Select, message, Table, Modal, Tooltip, Tag, Divider, Tabs } from 'antd';
import classNames from "classnames";
import QRCode from 'qrcode.react';
import { stringify } from 'qs';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import Ellipsis from '../../components/Ellipsis';
import WxPay from '../../components/WxPay';
import BarCode from '../../components/WxPay/BarCode';
import ContinuePayment from "./ContinuePayment";
import Credentials from './Credentials';
import { handleResponse } from '../../utils/globalUtils';
import request from '../../utils/request';
import { hasAuthority, noMatch } from '../../utils/authority';
import Authorized from '../../utils/Authorized';
import styles from './style.less';
import { handlePrint } from '../../utils/batchPrint';
import { printOrder } from '../../utils/batchOrderPrint';

@connect(({order,cashiers,bookPlaces, loading }) => ({
  order,cashiers,bookPlaces,
  loading: loading.models.order,
}))
@Form.create()
class saleOrder extends Component {
  action = {
    salesOrderList: 'order/salesorderlist',
    paymentModeList:'order/paymentmodelist',
    paymentStatusList:'order/paymentstatuslist',
    orderTypeList:'order/ordertypelist',
    cancelPay:'order/cancelpay',
    continuePay:'order/continuepay',
    sportList: 'order/sportlist',
    displayCard: 'bookPlaces/displaycard',
    payMethodList: 'bookPlaces/paymethodlist',
    getPaymentList:'cashiers/getpaymentlist'
  };

  state = {
    current: 1,
    pageSize: 10,
    dataSoure: [],
    startValue: null,
    endValue: null,
    endOpen: false,
    venueType:null,// 场馆id
    sportType:null,// 运动类型id
    radioType:1,// Radio变化时候的值
    cardVisible:false,// 会员卡modal
    payVisible:false,// 支付方式modal
    cardTableSelect:{},// 会员卡支付
    choosePayMent:null,// 选择的支付方式的code
    continuePayRecord:{},
    /* ======================================== */
    currentNo: '',
    checkedList: [],
    moneyXiu: [],
    isCreate:false,
    customerType:2,
    readHuiCard:{}, // 会员卡信息
    modal1: false,
    // 支付窗口
    payVisibleW: false,
    barVisible: false,
    orderNo: undefined, // 订单号
    goodsName: undefined, // 产品名
    deviceCode: undefined, // 设备号
    methodCode: undefined, // 支付方式
    version: undefined, // 版本号
    payMoney: undefined,
    width: '100%',
    orderType: undefined, // 订单类型
    key: "1", // 当前查询选项卡
    credentials: {}, // 凭证查询信息
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: this.action.paymentModeList,
    });
    dispatch({
      type: this.action.payMethodList,
      payload: {type:5},
    });
    dispatch({
      type: this.action.paymentStatusList,
    });
    dispatch({
      type: this.action.sportList,
    });
    dispatch({
      type: this.action.orderTypeList,
    });
    const {current}=this.state;
    const param={
      pageNo:current,
      pageSize:10,
      // orderDateStart:moment(moment().subtract(7, 'days').calendar(),"YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss"),
      // orderDateEnd:moment(new Date(),"YYYY-MM-DD HH:MM:SS").format("YYYY-MM-DD HH:mm:ss"),
    };
    dispatch({
      type: this.action.salesOrderList,
      payload: param,
    }).then(()=>{
      const {order:{salesOrderListResult}}=this.props;
      this.setState({
        dataSoure:salesOrderListResult&&salesOrderListResult.data&&salesOrderListResult.data.list,
      })
    })
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeFooterToolbar);
  }

  resizeFooterToolbar = () => {
    requestAnimationFrame(() => {
      const sider = document.querySelectorAll('.ant-layout-sider')[0];
      if (sider) {
        const width = `calc(100% - ${sider.style.width})`;
        const { width: stateWidth } = this.state;
        if (stateWidth !== width) {
          this.setState({ width });
        }
      }
    });
  };

  handleRefresh=()=>{
    const {dispatch}=this.props;
    const {current}=this.state
    const param={
      pageNo:current,
      pageSize:10,
      // orderDateStart:moment(moment().subtract(7, 'days').calendar(),"YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss"),
      // orderDateEnd:moment(new Date(),"YYYY-MM-DD HH:MM:SS").format("YYYY-MM-DD HH:mm:ss"),
    };
    dispatch({
      type: this.action.salesOrderList,
      payload: param,
    }).then(()=>{
        const {order:{salesOrderListResult}}=this.props;
        this.setState({
          dataSoure:salesOrderListResult&&salesOrderListResult.data&&salesOrderListResult.data.list,
        })
      }
    )
  }

  /**
   * @Author luzhijian
   * @Description //时间空间调用方法开始
   * @Date 17:22 2019/1/3
   * @Param
   * @return
   * */
  disabledStartDate = (startValue) => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = (endValue) => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  };

  onStartChange = (value) => {
    this.onChange('startValue', value);
  };

  onEndChange = (value) => {
    this.onChange('endValue', value);
  };

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  };

  /**
   * @Author luzhijian
   * @Description //时间空间调用方法结束
   * @Date 17:22 2019/1/3
   * @Param
   * @return
   * */


  /**
   * @Author luzhijian
   * @Description //查询按钮
   * @Date 17:41 2019/1/7
   * @Param
   * @return
   */
  handleQelect=()=>{
    const { form: { validateFieldsAndScroll }, dispatch } = this.props;
    const {current,pageSize}=this.state;
    validateFieldsAndScroll((error, values) => {
      const param={
        pageSize,
        pageNo:current,
        orderNo:values.orderNo,
        paymentMode:values.paymentMode===0?null:values.paymentMode,
        memberTel:values.memberTel,
        memberName:values.memberName,
        orderType:values.orderType===0?null:values.orderType,
        paymentStatus:values.paymentStatus===0?null:values.paymentStatus,
        sportItemId:values.sportItemId===0?null:values.sportItemId,
        orderDateStart:values.orderDateStart?values.orderDateStart.format("YYYY-MM-DD HH:mm:ss"):null,
        orderDateEnd:values.orderDateEnd?values.orderDateEnd.format("YYYY-MM-DD HH:mm:ss"):null,
      }
      dispatch({
        type: this.action.salesOrderList,
        payload: param,
      }).then(()=>{
        const {order:{salesOrderListResult}}=this.props;
        this.setState({
          dataSoure:salesOrderListResult&&salesOrderListResult.data&&salesOrderListResult.data.list,
        })
      })
    });
  };

  /**
   * 凭证查询
   * @param values
   * @author jiangt
   */
  handleCredentials = (values) => {
    this.setState({ credentials: values }, () => { this.fetchList() });
  };

  fetchList = () => {
    const { dispatch } = this.props;
    const { credentials, current, pageSize }=this.state;
    const params = { ...credentials, pageNo: current, pageSize };
    dispatch({
      type: this.action.salesOrderList,
      payload: params,
    }).then(() => {
      const {order:{salesOrderListResult}}=this.props;
      this.setState({
        dataSoure: salesOrderListResult && salesOrderListResult.data && salesOrderListResult.data.list,
      });
    });
  };

  // 分页
  handleTableChange = (current, pageSize) => {
    this.setState({ current, pageSize }, () => {
      const { key } = this.state;
      if (key === '1') {
        this.handleQelect();
        return;
      }
      if (key === '2') {
        this.fetchList();
      }
    });
  };

  handleReset=()=>{
    const { dispatch, form } = this.props;
    form.resetFields();
    const param={
      pageNo:1,
      pageSize:10,
    };
    dispatch({
      type: this.action.salesOrderList,
      payload: param,
    }).then(()=>{
      const {order:{salesOrderListResult}}=this.props;
      this.setState({
        dataSoure:salesOrderListResult&&salesOrderListResult.data&&salesOrderListResult.data.list,
      })
    })

  };

  /**
   * @Author luzhijian
   * @Description //详情
   * @Date 13:38 2019/1/10
   * @Param
   * @return
   */
  handleTikectDetail=(record)=>{
    let pathname='';
    // 订票跳转
    if (record.orderTypeString==='购票'){
      pathname= `/order/saleOrder/ticketDetails`;
    }
    // 订场跳转
    else {
      pathname = `/order/saleOrder/venueDetails`;
    }
    const query = {
      id: record.id,
    };
    router.push({
      pathname,
      query,
    });
  };


  /**
   * @Author luzhijian
   * @Description //退款
   * @Date 14:42 2019/1/10
   * @Param
   * @return
   */
  handleRefund=(record)=>{
    const pathname = `/order/saleOrder/refund`;
    const query = {
      id: record.id,
    };
    router.push({
      pathname,
      query,
    });
  };

  continuePay=(record)=>{
    const { dispatch }=this.props;
    this.setState({
      payVisible:true,
      continuePayRecord:record,
      choosePayMent:null,
      orderType: record.orderType,
    });
    // dispatch({
    //   type: this.action.getPaymentList,
    //   payload: {type:1},
    // })
  };

  cancelPay=(record)=>{
    const { dispatch } = this.props;
    const param={
      orderBasicInfoId:record.id,
    };
    dispatch({
      type: this.action.cancelPay,
      payload: param,
    }).then(()=>{
      const {order:{cancelPayResult}}=this.props;
      if (handleResponse(cancelPayResult)) {
        message.success("取消支付成功");
        this.handleQelect();
      }
    });
  };

  handleCardVisibleOk = (e) => {
    const {cardTableSelect}=this.state;
    this.setState({
      cardVisible: false,
      paymentMode:2,
    });
  };

  handleCardVisibleCancel = (e) => {
    this.setState({
      cardVisible: false,
    });
  };

  /**
   * 继续支付请求
   */
  onContinuePayOk = (values) => {
    const { continuePayRecord: { id } } = this.state;
    const params = { ...values, orderId: id };
    request(`/venuebooking/order/continuePay?${stringify(params)}`)
      .then(response => {
        if (handleResponse(response, (params.paymentMode !== "3" && params.paymentMode !== "4"))) {
          if (params.paymentMode === "3" || params.paymentMode === "4") {
            // 微信支付单独处理
            this.onBarVisibleChange(true, response.data.orderNo, response.data.goodsName, response.data.deviceCode, response.data.methodCode, response.data.version);
          } else {
            this.handlePayVisibleCancel();
            this.isPrint(response.data.orderNo);
            this.handleQelect();
          }
        }
      });
  };

  isPrint = (orderNo) => {
    const { continuePayRecord: { orderType } } = this.state;
    if (orderType === 1) {
      handlePrint(orderNo);
    }
  };

  handlePrintOrder = (item) => {
    printOrder(item.orderNo);
    // console.log(item);
  }

  handlePayVisibleOk = (e) => {
    const { dispatch }=this.props;
    const {cardTableSelect,choosePayMent,continuePayRecord}=this.state;
    if(!choosePayMent) {
      message.warning('请选择支付方式');
      return;
    } else {
      if (choosePayMent==="2"){
        dispatch({
          type: this.action.continuePay,
          payload: {
            orderId:continuePayRecord.id,
            memberCardId:cardTableSelect.id,
            paymentMode:choosePayMent,
          },
        }).then(()=>{
          const {order:{continuePayResult} }=this.props;
          if (handleResponse(continuePayResult)) {
            message.success("支付成功！");
            this.setState({
              payVisible: false,
            });
            this.handleQelect();
          }
        })
      } else {
        dispatch({
          type: this.action.continuePay,
          payload: {
            orderId:continuePayRecord.id,
            paymentMode:choosePayMent,
          },
        }).then(()=>{
          const {order:{continuePayResult} }=this.props;
          if (handleResponse(continuePayResult)) {
            if (choosePayMent!=="4"){
              message.success("支付成功！");
            }
            this.setState({
              payVisible: false,
            });
            if (choosePayMent!=="4"){
              this.handleQelect();
            }
            switch (choosePayMent) {
              // 微信支付
              case '4':
                // 商户扫码
                this.onBarVisibleChange(true, continuePayResult.data.orderNo, continuePayResult.data.goodsName, continuePayResult.data.deviceCode);
                // 客户扫码
                // this.onPayVisibleChange(true, saleAddResult.data);
                break;
              // 现金、会员卡、票券
              default:
                this.goBack();
                break;
            }
          }
        })
      }
    }

  };

  handlePayVisibleCancel = (e) => {
    this.setState({
      payVisible: false,
      orderType: undefined,
    });
  };

  handlePayList=(e)=>{
    const { dispatch } = this.props;
    this.setState({
      choosePayMent:e.code,
    });
    const { continuePayRecord } = this.state;
    if (e.code==="2"){
      const param={
        paymentMode:e.code,
        memberTel:continuePayRecord.memberTel!==undefined?continuePayRecord.memberTel:undefined,
      };
      dispatch({
        type: this.action.displayCard,
        payload: param,
      }).then(()=>{
        const {bookPlaces:{displayCardResult},} = this.props
        if (displayCardResult.code===-1){
          message.error("此订单无法使用会员卡支付!")

        }
        else {
          this.setState({
            cardVisible:true,
          });
        }
      });
    }
    // else {
    //   dispatch({
    //     type: this.action.continuePay,
    //     payload: {
    //       orderId:continuePayRecord.id,
    //       paymentMode:e.code,
    //     },
    //   })
    // }

  };


  handleDisplayCard=()=>{
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      cashiers:{admissionOutResult},
    } = this.props;

    const {isMember}=this.state;
    this.setState({
      cardVisible:true,
    });
    validateFieldsAndScroll((error, values) => {
      const param={
        paymentMode:1,
        memberTel:isMember===1?values.memberTel:values.noMemberTel,
      };
      dispatch({
        type: this.action.displayCard,
        payload: param,
      });
    });
  };

  // 关闭弹窗
  onClose = () => {
    this.setState({
      modal1: false,
    });
  };

  onPayVisibleChange = (payVisible, orderNo, payMoney) => {
    this.setState({
      payVisible,
      orderNo,
      payMoney,
    });
  };

  goBack = () => {
    const pathname = `/order/saleOrder/list`;
    router.push({ pathname });
  };


  onPayVisibleWChange = (payVisibleW, orderNo, payMoney) => {
    this.setState({
      payVisibleW,
      orderNo,
      payMoney,
    });
  };


  onBarVisibleChange = (barVisible, orderNo, goodsName, deviceCode, methodCode, version) => {
    this.setState({ barVisible, orderNo, goodsName, deviceCode, methodCode, version });
  };

  render() {
    const { form: { getFieldDecorator }, cashiers:{getPaymentListResult}, order:{paymentModeListResult,
      paymentStatusListResult,orderTypeListResult,salesOrderListResult,soprtListResult},
      bookPlaces:{displayCardResult} } = this.props;
    const selectedTag = classNames(styles.selectedTag, styles.normalTag);
    const defaultTag = classNames(styles.defaultTag, styles.normalTag);
    const { endOpen,dataSoure,current,pageSize,cardTableSelect,choosePayMent,orderType,modal1, payVisibleW, barVisible,orderNo, goodsName, deviceCode, methodCode, version,payMoney,currentNo, key} = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const cardColumns = [
      {
        title: 'cardNo',
        dataIndex: 'cardNo',
        key:'cardNo',
      },
      {
        title: 'balance',
        dataIndex: 'balance',
        key:'balance',
        render: (text, record) =>
          <span>
            余额: ￥{record.balance}
          </span>
      }];
    const hasAuth = hasAuthority("jis_platform_dc_saleorder_detail");
    const columns = [
      {
        title: '订单号码',
        dataIndex: 'orderNo',
        key: 'orderNo',
        render: (text, item) => hasAuth ?
          <a disabled={!!(item.orderTypeString==='购卡'||item.orderTypeString==='押金')} onClick={() => this.handleTikectDetail(item)}>{text}</a>
          : text,
      },
      // { title: '创建时间', dataIndex: 'orderDate', key: 'orderDate', width: 150 },
      // { title: '姓名', key: 'memberName', dataIndex: 'memberName', width: 150 },
      // { title: '联系方式', key: 'memberTel', dataIndex: 'memberTel', width: 150 },
      { title: '订单类型', key: 'orderTypeString', dataIndex: 'orderTypeString', render: val => <Ellipsis length={8} tooltip>{val}</Ellipsis> },
      { title: '运动项目', key: 'sportItemName', dataIndex: 'sportItemName', render: val => <Ellipsis length={8} tooltip>{val}</Ellipsis> },
      { title: '订单名称', key: 'orderName', dataIndex: 'orderName', render: val => <Ellipsis length={8} tooltip>{val}</Ellipsis> },
      // { title: '支付金额(元)', key: 'paymentAmount', dataIndex: 'paymentAmount' },
      { title: '支付状态', key: 'paymentStatusString', dataIndex: 'paymentStatusString' },
      // { title: '支付时间', key: 'paymentTime', dataIndex: 'paymentTime', width: 150 },
      // { title: '支付方式', key: 'paymentModeString', dataIndex: 'paymentModeString', width: 150 },
      // { title: '退款金额(元)', key: 'refundAmount', dataIndex: 'refundAmount', width: 200 },
      // { title: '退款时间', key: 'refundTime', dataIndex: 'refundTime', width: 150 },
      { title: '订单金额(元)', key: 'orderAmount', dataIndex: 'orderAmount' },
      {
        title: '操作',
        key: 'action',
        dataIndex: 'action',
        render: (text, item) =>
          <span>
            <Authorized authority='jis_platform_dc_saleorder_detail' nomatch={noMatch()}>
              <a disabled={(item.orderTypeString==='购卡'||item.orderTypeString==='押金')?true:false} onClick={() => this.handleTikectDetail(item)}>详情</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='jis_platform_dc_saleorder_refund' nomatch={noMatch()}>
              <a disabled={Number(item.paymentStatus) !== 2} onClick={() => this.handleRefund(item)}>退款</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='jis_platform_dc_saleorder_cancel' nomatch={noMatch()}>
              <a disabled={(item.paymentStatusString==='未支付')?false:true} onClick={() =>this.cancelPay(item)}>取消支付</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='jis_platform_dc_saleorder_continue' nomatch={noMatch()}>
              <a disabled={item.orderType===6?true:(item.paymentStatusString==='未支付')? false:true} onClick={() =>this.continuePay(item)}>继续支付</a>
            </Authorized>
            <Divider type="vertical" />
            <a onClick={() => this.handlePrintOrder(item)}>打印</a>
          </span>,
      }
    ];

    return (
      <PageHeaderWrapper wrapperClassName={styles.advancedForm}>
        {/* 销售订单 */}
        <Card title="销售订单" bordered={false} style={{height:"100%"}}>
          <Tabs type='card' activeKey={key} onChange={value => { this.setState({ key: value }) }}>
            <Tabs.TabPane tab='条件查询' key="1">
              <Form hideRequiredMark>
                {/* 订单号码 */}
                <Row>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="订单号码">
                      {getFieldDecorator('orderNo', {
                      })
                      (<Input placeholder="输入订单号码" />)
                      }
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="支付方式">
                      {getFieldDecorator('paymentMode', {
                        initialValue:"0",
                      })
                      (
                        <Select>
                          <Select.Option value="0" key="0">全部</Select.Option>
                          {paymentModeListResult.length>0&&paymentModeListResult.map(obj => (
                            <Select.Option key={obj.code} value={obj.code}>{obj.value}</Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="联系方式">
                      {getFieldDecorator('memberTel', {
                      })
                      (<Input placeholder="输入联系方式" />)}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="姓名">
                      {getFieldDecorator('memberName', {
                      })
                      (<Input placeholder="输入姓名" />)}
                    </Form.Item>
                  </Col>
                </Row>

                {/* 创建时间 */}
                <Row>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="开始时间">
                      {getFieldDecorator('orderDateStart', {
                        // initialValue:moment(moment().subtract(7, 'days').calendar(),"YYYY-MM-DD HH:MM:SS"),
                      })
                      (
                        <DatePicker
                          disabledDate={this.disabledStartDate}
                          showTime
                          style={{width:'100%'}}
                          format="YYYY-MM-DD HH:mm:ss"
                          placeholder="开始时间"
                          onChange={this.onStartChange}
                          onOpenChange={this.handleStartOpenChange}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="结束时间">
                      {getFieldDecorator('orderDateEnd', {
                        // initialValue:moment(new Date(),"YYYY-MM-DD HH:MM:SS"),
                      })
                      (
                        <DatePicker
                          disabledDate={this.disabledEndDate}
                          showTime
                          style={{width:'100%'}}
                          format="YYYY-MM-DD HH:mm:ss"
                          placeholder="结束时间"
                          onChange={this.onEndChange}
                          open={endOpen}
                          onOpenChange={this.handleEndOpenChange}
                        />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="订单类型">
                      {getFieldDecorator('orderType', {
                        initialValue:"0",
                      })
                      (
                        <Select>
                          <Select.Option value="0" key="0">全部</Select.Option>
                          {orderTypeListResult.length>0&&orderTypeListResult.map(obj => (
                            <Select.Option key={obj.code} value={obj.code}>{obj.value}</Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="支付状态">
                      {getFieldDecorator('paymentStatus', {
                        initialValue:"0",
                      })
                      (
                        <Select>
                          <Select.Option value="0" key="0">全部</Select.Option>
                          {paymentStatusListResult.length>0&&paymentStatusListResult.map(obj => (
                            <Select.Option key={obj.code} value={obj.code}>{obj.value}</Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                {/* 运动项目 */}
                <Row>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="运动项目">
                      {getFieldDecorator('sportItemId', {
                        initialValue:"0",
                      })
                      (
                        <Select>
                          <Select.Option value="0" key="0">全部</Select.Option>
                          {soprtListResult && soprtListResult.length>0&&soprtListResult.map(obj => (
                            <Select.Option key={obj.id} value={obj.id}>{obj.itemName}</Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={18} align='right'>
                    <Authorized authority='jis_platform_dc_saleorder_query' nomatch={noMatch()}>
                      <Button type="primary" onClick={this.handleQelect}>查询</Button>
                    </Authorized>
                    <Button type="primary" onClick={() => this.handleReset()} style={{marginLeft:5}}>重置</Button>
                  </Col>
                </Row>
              </Form>
            </Tabs.TabPane>
            <Tabs.TabPane tab='凭证查询' key="2">
              <Credentials onOk={values => this.handleCredentials(values)} />
            </Tabs.TabPane>
          </Tabs>
          {/* 支付方式 */}
          <Modal
            width="30%"
            title=""
            // visible={this.state.payVisible}
            onOk={this.handlePayVisibleOk}
            onCancel={this.handlePayVisibleCancel}
          >
            <div>
              {
                getPaymentListResult&&getPaymentListResult.data&&getPaymentListResult.data.map(step =>
                  <Tooltip key={step.code} placement="topLeft" title={step.name && step.name.length > 8 ? step.name : undefined}>
                    <Tag.CheckableTag
                      className={choosePayMent === step.code ? selectedTag : defaultTag}
                      style={{ marginRight: 5, marginTop: 24 }}
                      checked={choosePayMent === step.code}
                      onChange={() => this.handlePayList(step)}
                    >
                      <Ellipsis length={8}>{step.name}</Ellipsis>
                    </Tag.CheckableTag>
                  </Tooltip>
                )
              }
            </div>
          </Modal>
          {/* 会员卡 */}
          <Modal
            width="30%"
            title=""
            visible={this.state.cardVisible}
            onOk={this.handleCardVisibleOk}
            onCancel={this.handleCardVisibleCancel}
          >
            <Table
              rowKey={record => record.id}
              style={{marginTop:"3%"}}
              columns={cardColumns}
              dataSource={displayCardResult&&displayCardResult.data}
              pagination={false}
              showHeader={false}
              rowClassName={record => {
                if (cardTableSelect != null && cardTableSelect.id === record.id) {
                  return `${styles.selectedColor}`;
                } else {
                  return '';
                }
              }}
              onRow={record => {
                return {
                  onClick: () => {
                    if (cardTableSelect != null && cardTableSelect.id === record.id) {
                      this.setState({
                        cardTableSelect: {},
                      });
                    } else {
                      this.setState({
                        cardTableSelect: record,
                      });
                    }
                  },
                };
              }}
            />
          </Modal>
          {/* <Row gutter={16}>
            {
              dataSoure && dataSoure.length>0 && dataSoure.map(item => (
                <Col span={6} style={{marginBottom:'8px'}}>
                  <Card title={`订单号：${item.orderNo}`}>
                    <p>订单号码:&nbsp;{item.orderNo}</p>
                    <p>创建时间:&nbsp;{item.orderDate}</p>
                    <p>姓名:&nbsp;{item.memberName}</p>
                    <p>联系方式:&nbsp;{item.memberTel}</p>
                    <p>订单类型:&nbsp;{item.orderTypeString}</p>
                    <p>运动项目:&nbsp;{item.sportItemName}</p>
                    <p>订单名称:&nbsp;{item.orderName}</p>
                    <p>支付金额(元):&nbsp;{item.paymentAmount}</p>
                    <p>支付状态:&nbsp;{item.paymentStatusString}</p>
                    <p>支付时间:&nbsp;{item.paymentTime}</p>
                    <p>支付方式:&nbsp;{item.paymentModeString}</p>
                    <p>退款金额(元):&nbsp;{item.refundAmount}</p>
                    <p>退款时间:{item.refundTime}</p>
                    <p>订单金额(元):&nbsp;{item.orderAmount}</p>
                    <p>
                      <Authorized authority='jis_platform_dc_saleorder_detail' nomatch={noMatch()}>
                        <a disabled={(item.orderTypeString==='购卡'||item.orderTypeString==='押金'||item.orderTypeString==='超时')?true:false} onClick={() => this.handleTikectDetail(item)}>详情</a>
                      </Authorized>
                      <Authorized authority='jis_platform_dc_saleorder_refund' nomatch={noMatch()}>
                      &nbsp;
                        <a disabled={(Number(item.paymentStatus)===1 || Number(item.paymentStatus)===3)?true:false} onClick={() => this.handleRefund(item)}>退款</a>
                      </Authorized>
                      <Authorized authority='jis_platform_dc_saleorder_cancel' nomatch={noMatch()}>
                      &nbsp;
                        <a disabled={(item.paymentStatusString==='未支付')?false:true} onClick={() =>this.cancelPay(item)}>取消支付</a>
                      </Authorized>
                      <Authorized authority='jis_platform_dc_saleorder_continue' nomatch={noMatch()}>
                      &nbsp;
                        <a disabled={(item.paymentStatusString==='未支付')?false:true} onClick={() =>this.continuePay(item)}>继续支付</a>
                      </Authorized>
                    </p>
                  </Card>
                </Col>
              ))
            }
          </Row> */}
          {/* {
            dataSoure && dataSoure.length>0 &&
            <Pagination
              className={styles.orderPagination}
              onChange={this.handleTableChange}
              current={current}
              pageSize={pageSize}
              defaultCurrent={1}
              total={salesOrderListResult&& salesOrderListResult.data && salesOrderListResult.data.total}
            />
          } */}
          <Table
            rowKey="id"
            columns={columns}
            dataSource={dataSoure}
            pagination={{
              defaultCurrent: 1,
              current,
              pageSize,
              total: salesOrderListResult&& salesOrderListResult.data && salesOrderListResult.data.total,
              onChange: this.handleTableChange,
            }}
          />
        </Card>
        <BarCode
          visible={barVisible}
          param={{ orderNo, goodsName, deviceCode, methodCode, version }}
          onOk={() => {
            this.onBarVisibleChange(false);
            this.handleQelect();
          }}
          onCancel={() => this.onBarVisibleChange(false)}
        />
        <WxPay
          visible={payVisibleW}
          orderNo={orderNo}
          payMoney={payMoney}
          onOk={() => {
            this.onPayVisibleChange(false);
            this.isPrint(orderNo);
            this.handleQelect();
          }}
          onCancel={() => this.onPayVisibleChange(false)}
        />
        <Modal
          visible={modal1}
          transparent
          closable
          maskClosable
          onClose={() => this.onClose()}
          title="请扫描二维码"
        >
          <div style={{ overflow: 'scroll' }}>
            <QRCode style={{ width: '100%', height: 'auto' }} value={currentNo} />
          </div>
        </Modal>
        <ContinuePayment
          visible={this.state.payVisible}
          type={orderType}
          onOk={this.onContinuePayOk}
          onCancel={this.handlePayVisibleCancel}
        />
      </PageHeaderWrapper>
    );
  }
}

export default saleOrder;
