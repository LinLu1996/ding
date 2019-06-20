import React, { Component,PureComponent } from 'react';
import {
  Card,
  Button,
  Form,
  Icon,
  Col,
  Row,
  DatePicker,
  TimePicker,
  Input,
  Select,
  Popover,
  Checkbox,
  Radio,
  InputNumber,
  Upload,
  message,
  Cascader,
  Table,
  Modal,
  Tooltip,
  Tag,
} from 'antd';
import { connect } from 'dva';
import QRCode from 'qrcode.react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import FooterToolbar from '@/components/FooterToolbar';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import moment from 'moment';
import router from "umi/router";
import styles from './style.less';
import {handleResponse} from "../../utils/globalUtils";
import Ellipsis from '../../components/Ellipsis';
import WxPay from '../../components/WxPay';
import BarCode from '../../components/WxPay/BarCode';
import classNames from "classnames";
import order from '../Order/models/order';


const { Option } = Select;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;







@connect(({ cashier,bookPlace, loading }) => ({
  cashier,bookPlace,
  loading: loading.models.cashier,
}))
@Form.create()
class AdvancedForm extends Component {

  action = {
    getOneByBasicId:'cashier/getonebybasicid',
    saleAdd:'cashier/saleadd',
    displayCard: 'bookPlace/displaycard',
    getPaymentList:'cashier/getpaymentlist',
    handleReadCard: 'cashier/fetchHandleReadCard',
    handleReadPerCard: 'cashier/fetchHandleReadPerCard',
    printOrderDetail: 'cashier/fetchPrintOrderDetail',
  };

  state = {
    isMember: 1,
    ticketInfo:{},// 上一个页面带过来的对象
    buyNum:1,// 购买票的数量
    sportType:null,// 运动类型id
    venueType:null,// 场馆id
    ticketBasicType:null,// 票ID
    cardVisible:false,// 会员卡modal
    cardTableSelect:{},// 会员卡支付
    choosePayMent:null,// 选择的支付方式的code
    /* ======================================== */
    width: '100%',
    modal1: false,
    currentNo: '',
    checkedList: [],
    moneyXiu: [],
    isCreate:false,
    customerType:2,
    readHuiCard:{}, // 会员卡信息
    // 支付窗口
    payVisible: false,
    barVisible: false,
    // 订单号
    orderNo: undefined,
    goodsName: undefined,
    deviceCode: undefined,
    payMoney: undefined,
  };

  componentDidMount() {
    const { dispatch, location } = this.props;
    if (location && location.search) {
      const { query } = location;
      this.setState({
        sportType:query.sportId,
        venueType:query.venueId,
        ticketBasicType:query.record.ticketBasicId,
      });
      //  获取支付方式
      dispatch({
        type: this.action.getPaymentList,
        payload: {type:4},
      })
      const param={
        ticketBasicId:query.record.ticketBasicId,
        sportId:query.sportId,
        venueId:query.venueId,
      };

      dispatch({
        type: this.action.getOneByBasicId,
        payload: param,
      }).then(
        ()=>{
          const {cashier:{getOneByBasicIdResult}}=this.props;
          this.setState({
            ticketInfo:getOneByBasicIdResult&&getOneByBasicIdResult.data,
          })
        }
      )
    }
  }

  componentWillUnmount() {
    const {  dispatch } = this.props;
    dispatch({
      type:'cashier/printOrderDetailList',
      payload: [],
    })
    window.removeEventListener('resize', this.resizeFooterToolbar);
  }

  /**
   * @Author luzhijian
   * @Description //获取表单校验信息
   * @Date 14:10 2018/12/7
   * @Param
   * @return
   * */

  getErrorInfo = () => {
    const {
      form: { getFieldsError },
    } = this.props;
    const errors = getFieldsError();
    const errorCount = Object.keys(errors).filter(key => errors[key]).length;
    if (!errors || errorCount === 0) {
      return null;
    }
    const scrollToField = fieldKey => {
      const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
      if (labelNode) {
        labelNode.scrollIntoView(true);
      }
    };
    const errorList = Object.keys(errors).map(key => {
      if (!errors[key]) {
        return null;
      }
      return (
        <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
          <Icon type="cross-circle-o" className={styles.errorIcon} />
          <div className={styles.errorMessage}>{errors[key][0]}</div>
        </li>
      );
    });




    return (
      <span className={styles.errorIcon}>
        <Popover
          title="表单校验信息"
          content={errorList}
          overlayClassName={styles.errorPopover}
          trigger="click"
          getPopupContainer={trigger => trigger.parentNode}
        >
          <Icon type="exclamation-circle" />
        </Popover>
        {errorCount}
      </span>
    );
  };

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

  /**
   * @Author luzhijian
   * @Description //返回按钮
   * @Date 19:17 2018/12/8
   * @Param
   * @return
   * */

  handleToReturn = () => {
    Modal.confirm({
      title: '提示',
      content: '是否放弃录入的内容？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.handleReturn(),
    });
  }


  handleReturn = () =>{
    const pathname = '/cashier/cashierList';
    router.push({
      pathname,
    });
  };

  onRadioChange = (e) => {
    const { form ,dispatch} =this.props;
    form.resetFields(['memberTel','noMemberTel','noMemberName']);
    this.setState({
      isMember: e.target.value,
    });
    if (e.target.value===1) {
      const param={type:1};
      dispatch({
        type: this.action.getPaymentList,
        payload: param,
      })
    }
    else {
      const param={type:4};
      dispatch({
        type: this.action.getPaymentList,
        payload: param,
      })
    }



  };


  /**
   * @Author luzhijian
   * @Description //购买数量表格变化时
   * @Date 15:06 2019/1/7
   * @Param
   * @return
   * */

  onBuyNumChange=(value)=> {
    this.setState({
      buyNum:value,
      isCreate: false,
    })
  };


 /**
  * @Author luzhijian
  * @Description //确定按钮
  * @Date 15:39 2019/1/7
  * @Param
  * @return
  * */

  validate = () => {
   const {
     form,
     form: { validateFieldsAndScroll },
     dispatch,
   } = this.props;
   const {sportType,venueType,ticketBasicType,ticketInfo,choosePayMent,customerType,readHuiCard}=this.state;
   validateFieldsAndScroll((error, values) => {
     if (error) {
       return false;
     }
     if(choosePayMent === null) {
       message.warning('请选择支付方式');
       return false;
     }
     const param={
       customerType,
       counts:values.num,
       sportId:sportType,
       venueId:venueType,
       basicId:ticketBasicType,
       ticketBasicId:ticketBasicType,
       memberId:1,
       paymentMode: choosePayMent && choosePayMent===null ?null:choosePayMent,
       ticketSalePrice:ticketInfo.ticketSalePrice,
       ticketName:ticketInfo.ticketName,
       applyCourt:ticketInfo.applyCourt,
       duration:ticketInfo.duration,
       ticketUseId:ticketInfo.ticketUseId,
       ticketSalesId:ticketInfo.ticketSalesId,
       applyCourtName:ticketInfo.applyCourtName,
       applyDateStart:ticketInfo.applyDateStart,
       applyDateEnd:ticketInfo.applyDateEnd,
       applyTimeStart:ticketInfo.applyTimeStart,
       applyTimeEnd:ticketInfo.applyTimeEnd,
       applyDateType:ticketInfo.applyDateType,
       cardNo: readHuiCard && readHuiCard.cardNo
     }
     const card = form.getFieldValue('permitCardNo');
     if(card) {
       dispatch({
         type:this.action.handleReadPerCard,
         payload:{ code: card }
       }).then(() => {
         const { cashier: {readPerCard} } = this.props;
         if(readPerCard && readPerCard.type) {
           this.handleSure(param);
         } else {
           message.warning('授权卡号错误');
         }
       })
     } else {
       this.handleSure(param);
     }
   });

 };

  handleSure = (param) => {
    const { dispatch } = this.props;
    const { choosePayMent } = this.state;
    dispatch({
      type: this.action.saleAdd,
      payload: param,
    }).then(
      ()=>{
        const {cashier:{saleAddResult}}=this.props;
          // this.setState({ isCreate:true });
        if(saleAddResult && saleAddResult.data) {
          switch (choosePayMent) {
            // 微信支付
            case '4':
              // 商户扫码
              this.onBarVisibleChange(true, saleAddResult.data.orderNo, saleAddResult.data.goodsName, saleAddResult.data.deviceCode);
              // 客户扫码
              // this.onPayVisibleChange(true, saleAddResult.data);
              break;
            // 现金、会员卡、票券
            case '1':
              // 商户扫码
              this.printOrderDetail(saleAddResult.data.orderNo);
              // 客户扫码
              // this.onPayVisibleChange(true, saleAddResult.data);
              break;
            default:
              this.goBack();
              break;
          }
        }
      }
    )
  };

  onBarVisibleChange = (barVisible, orderNo, goodsName, deviceCode) => {
    this.setState({ barVisible, orderNo, goodsName, deviceCode });
  };

  handleDisplayCard=()=> {
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      cashier:{admissionOutResult},
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

  handlePayList=(e)=>{
    const { dispatch } = this.props;
    this.setState({
      choosePayMent:e.code,
    });
    const { continuePayRecord } = this.state;
    // if (e.code==="2"){
    //   this.handleDisplayCard();
    // }

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

  onPayVisibleChange = (payVisible, orderNo, payMoney) => {
    this.setState({
      payVisible,
      orderNo,
      payMoney,
    });
  };

  goBack = () => {
    const pathname = `/cashier/cashierList/index`;
    router.push({ pathname });
  };

  // 关闭弹窗
  onClose = () => {
    this.setState({
      modal1: false,
    });
  }

  handleUserType = (e) => {
    this.setState({
      checkedList: e.target.checked ? [1] : [],
      choosePayMent:null,
      isCreate: false,
      customerType: e.target.checked ? 1 : 2,
      readHuiCard:{}
    },() => {
      this.getPayList()
    });
  }

  handleMoneyChecked = (e) => {
    const { buyNum,ticketInfo } = this.state;
    const { form, } = this.props;
    this.setState({
      moneyXiu: e.target.checked ? [1] : [],
    },() => {
      if(this.state.moneyXiu.length===0) {
        form.setFieldsValue({
          totalMoney: buyNum * (ticketInfo.ticketSalePrice && ticketInfo.ticketSalePrice),
        });
        this.getPayList();
      }
    });
  }

  // 会员卡卡号读取
  handleReadCard = () => {
    const { dispatch,form } = this.props;
    form.validateFieldsAndScroll(['cardNo'], (errors, values) => {
      if (!errors) {
        const card = values.cardNo;
        // const card = form.getFieldValue('cardNo');
        dispatch({
          type:this.action.handleReadCard,
          payload:{ cardNo: card }
        }).then(() => {
          const {cashier:{readHuiCard}} = this.props;
          this.setState({
            readHuiCard,
          },() => {
            if(readHuiCard && readHuiCard.cardType && readHuiCard.cardType===1) {
              message.info('年卡用户无需购买门票，可直接入场');
            } else if(readHuiCard && readHuiCard.cardType && readHuiCard.cardType===2) {
              this.getPayList();
            } else if(JSON.stringify(readHuiCard) === "{}") {
              form.setFieldsValue({
                cardNo: '',
              });
              this.getPayList();
            }
          });
        })
      }
    });
  };

  // 授权卡号读取
  handleReadPerCard = () => {
    const { dispatch,form } = this.props;
    const card = form.getFieldValue('permitCardNo');
    dispatch({
      type:this.action.handleReadPerCard,
      payload:{ code: card }
    })
  }

  getPayList = () => {
    const {dispatch,form} = this.props;
    const { checkedList,readHuiCard } = this.state;
    const money = form.getFieldValue('totalMoney');
    if(checkedList.length === 1 && readHuiCard && readHuiCard.balance && readHuiCard.balance >= money) {
      dispatch({
        type: this.action.getPaymentList,
        payload: {type:6},
      }).then(() => {
        const { cashier:{getPaymentListResult} } = this.props;
        if(getPaymentListResult && getPaymentListResult.data && getPaymentListResult.data.length >0) {
          this.setState({
            choosePayMent:getPaymentListResult.data[0].code,
          });
        }
      })
    } else {
      if(JSON.stringify(readHuiCard) !=="{}"){
        message.info('此张卡的余额小于应付金额，请使用现金或微信支付');
      }
      dispatch({
        type: this.action.getPaymentList,
        payload: {type:4},
      })
    }
  }

  setCreate = () => {
    this.setState({
      isCreate: false,
    })
  }

  printOrderDetail = (value) => {
    const {dispatch} = this.props;
    const {orderNo} = this.state;
    dispatch({
      type: this.action.printOrderDetail,
      payload: {orderNo:value!==undefined ? value:orderNo},
    }).then(() => {
      const {cashier:{printOrderDetailList}} = this.props;
      if(printOrderDetailList && printOrderDetailList.length>0) {
        this.goBack();
      }
    })
  }


  render() {
    const {
      form: { getFieldDecorator },
      submitting,
      bookPlace:{displayCardResult},
      cashier:{getPaymentListResult,printOrderDetailList}
    } = this.props;
    const selectedTag = classNames(styles.selectedTag, styles.normalTag);
    const defaultTag = classNames(styles.defaultTag, styles.normalTag);
    const {width,ticketInfo,buyNum,cardTableSelect,choosePayMent,checkedList,moneyXiu,
      payVisible, barVisible,orderNo, goodsName, deviceCode,payMoney} = this.state;
    /**
     * 定义多选框的数组
     * @type {string[]}
     */
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

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
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


    return (
      <PageHeaderWrapper
        title="售票订单信息"
        wrapperClassName={styles.advancedForm}
      >
        {/* 基本信息 */}
        <Card title="基本信息" bordered={false}>
          <Form hideRequiredMark>
            {/* 票名 */}
            <Row>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="票名">
                  {getFieldDecorator('ticketName', {
                    initialValue:ticketInfo.ticketName,
                  })
                  (
                    <Input
                      disabled
                    />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="适用场地">
                  {getFieldDecorator('applyCourtName', {
                    initialValue:ticketInfo.applyCourtName,
                  })
                  (
                    <Input disabled  />
                  )}
                </Form.Item>
              </Col>
            </Row>
            {/* 适用日期范围 */}
            <Row>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="适用日期范围">
                  {getFieldDecorator('date', {
                    initialValue:(ticketInfo.applyDateStart)+"--"+ticketInfo.applyDateEnd,
                  })(
                    <Input disabled  />
                  )}
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="适用日期类型">
                  {getFieldDecorator('Nationality', {
                    initialValue:ticketInfo.applyDateString,
                  })(
                    <Input disabled  />
                  )}
                </Form.Item>
              </Col>
            </Row>
            {/* 性别 */}
            <Row>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="适用时间范围">
                  {getFieldDecorator('Gender', {
                    initialValue:(ticketInfo.applyTimeStart)+"--"+ticketInfo.applyTimeEnd,
                  })(
                    <Input disabled  />
                  )}
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="使用时长(分钟)">
                  {getFieldDecorator('duration', {
                    initialValue:ticketInfo.duration,
                  })(
                    <Input disabled  />
                  )}
                </Form.Item>
              </Col>
            </Row>
            {/* 价格 */}
            <Row>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="价格（元）">
                  {getFieldDecorator('ticketSalePrice', {
                    initialValue:ticketInfo.ticketSalePrice,
                  })(
                    <Input disabled  />
                  )}
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item {...formItemLayout} label='用户类型'>
                  {getFieldDecorator('userType', {
                    rules: [
                      {
                        required: false,
                      },
                    ],
                  })(
                    <Checkbox onChange={this.handleUserType}>储值卡</Checkbox>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* 购票信息 */}
        <Card title="购票信息" bordered={false}>
          <Form>
            {/* 数量 */}
            <Row gutter={24}>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="数量">
                  {getFieldDecorator('num', {
                    initialValue:1,
                    rules: [{ required: true, message: "请输入" }],
                  })
                  (
                    <InputNumber min={1} max={ticketInfo.currentStock > 10? 10:ticketInfo.currentStock} onChange={this.onBuyNumChange} />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={9}>
                <Form.Item {...formItemLayout} label="金额">
                  {getFieldDecorator('totalMoney', {
                    initialValue:buyNum * ticketInfo.ticketSalePrice,
                  })
                  (
                    <InputNumber disabled={moneyXiu && moneyXiu.length>0 && moneyXiu[0] === 1 ? false:true} onBlur={this.getPayList} style={{width:"100%"}} />
                  )}
                </Form.Item>
              </Col>
              <Col span={3} className={styles.saleCol3}>
                <Form.Item>
                  {getFieldDecorator('xiu')
                  (
                    <Checkbox onChange={this.handleMoneyChecked}>修改金额</Checkbox>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="性别">
                  {getFieldDecorator('sex', {
                    initialValue:1,
                    rules: [{ required: false, message: "请输入" }],
                  })
                  (
                    <RadioGroup>
                      <Radio value={1}>男</Radio>
                      <Radio value={2}>女</Radio>
                    </RadioGroup>
                  )
                  }
                </Form.Item>
              </Col>
            </Row>
            {
              moneyXiu && moneyXiu.length>0 && moneyXiu[0] === 1 &&
              <Row gutter={24}>
                <Col span={10}>
                  <Form.Item {...formItemLayout} label="授权卡号">
                    {getFieldDecorator('permitCardNo',{
                      rules: [
                        {
                          required: true,
                          message:'请输入卡号'
                        },
                        {
                          pattern: /^[A-Za-z0-9]{0,50}$/,
                          message: '卡号长度为50',
                        },
                      ],
                      initialValue:''
                    })(
                      <Input placeholder='请输入卡号' type="password" onChange={this.setCreate} />
                    )}
                  </Form.Item>
                </Col>
                {/*<Col span={2} style={{paddingTop:'3px'}}>*/}
                  {/*<Button*/}
                    {/*type="primary"*/}
                    {/*onClick={this.handleReadPerCard}*/}
                    {/*className={styles.buttonColor}>读取卡片</Button>*/}
                {/*</Col>*/}
              </Row>
            }
            {
              checkedList && checkedList.length>0 && checkedList[0] === 1 &&
              <Row gutter={24}>
                <Col span={10}>
                  <Form.Item {...formItemLayout} label="储值卡号">
                    {getFieldDecorator('cardNo',{
                      rules: [
                        {
                          required: true,
                          message:'请输入卡号'
                        },
                        {
                          pattern: /^[A-Za-z0-9]{0,50}$/,
                          message: '请输入正确的格式(卡号长度为50)',
                        },
                      ],
                      initialValue:''
                    })(
                      <Input placeholder='请输入卡号' onChange={this.setCreate} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={2} style={{paddingTop:'3px'}}>
                  <Button
                    type="primary"
                    onClick={this.handleReadCard}
                    className={styles.buttonColor}>读取卡片</Button>
                </Col>
              </Row>
            }
          </Form>
        </Card>

        {/* 支付信息 */}
        <Card title="支付信息" bordered={false}>
          <Form hideRequiredMark>
            {/* 支付方式 */}
            {
              getPaymentListResult&&getPaymentListResult.data&&getPaymentListResult.data.length>0 &&
              <Row gutter={24}>
                <Col span={10}>
                  <Form.Item {...formItemLayout} label="支付方式">
                    {getFieldDecorator('certificateType', {
                      // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                      rules: [{ required: false, message: "请输入" }],
                    })
                    (

                      <div>
                        {
                          getPaymentListResult&&getPaymentListResult.data&&getPaymentListResult.data.map(step =>
                          {
                            return (
                              <Tooltip key={step.code} placement="topLeft" title={step.name && step.name.length > 8 ? step.name : undefined}>
                                <Tag.CheckableTag
                                  className={choosePayMent === step.code ? selectedTag : defaultTag}
                                  style={{ marginRight: 5 }}
                                  checked={choosePayMent === step.code}
                                  onChange={() => this.handlePayList(step)}
                                >
                                  <Ellipsis length={8}>{step.name}</Ellipsis>
                                </Tag.CheckableTag>
                              </Tooltip>
                            )
                          })
                        }
                      </div>
                    )
                    }
                  </Form.Item>
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
                </Col>
              </Row>
            }
          </Form>
        </Card>

        {
          printOrderDetailList && printOrderDetailList.length>0 && printOrderDetailList.map(item => (
            <div style={{width: '30cm',height: '1.8cm',backgroundColor: 'aqua',fontSize: '0.2cm',border: 'black 1px solid' }}>
              <div style={{width: '1.8cm',height: '1.8cm',borderRight: 'black 1px solid',marginLeft: '5cm', float: 'left'}}>
                <QRCode style={{width: '1.6cm',height: '1.6cm',marginLeft:'0.1cm',marginTop: '0.1cm'}} value={item.base64WristStrapNo} />
              </div>
              <div style={{width: '4.2cm',height: '1.6cm',marginTop: '0.1cm', float: 'left'}}>
                <div style={{width: '4.5cm',height: '0.4cm',marginLeft: '0.1cm'}}>上海东方体育中心-{item && item.courtName}</div>
                <div style={{width: '4.5cm',height: '0.4cm',marginLeft: '0.1cm'}}>{item && item.couponName}</div>
                <div style={{width: '4.5cm',height: '0.4cm',marginLeft: '0.1cm'}}>场次：</div>
                <div style={{width: '4.5cm',height: '0.4cm',marginLeft: '0.1cm'}}>限{item && item.applyDateStart}{item && item.applyTimeStart}{item && item.applyDateEnd}{item && item.applyTimeEnd}使用</div>
              </div>
              <div style={{width: '1.3cm',height: '1.6cm',marginTop: '0.1cm', float: 'left'}}>
                <div style={{width: '1.3cm',height: '0.4cm'}}>室内馆</div>
                <div style={{width: '1.3cm',height: '0.4cm'}}>楼上男更</div>
              </div>
            </div>
          ))
        }



        <FooterToolbar style={{ width }}>
          {this.getErrorInfo()}
          <Button style={{marginLeft:"50%"}} disabled={!ticketInfo.currentStock > 0} type="primary" onClick={this.validate} loading={submitting}>
            确定
          </Button>
          <Button style={{marginLeft:"1%"}} type="primary" onClick={this.handleToReturn} loading={submitting}>
            取消
          </Button>
        </FooterToolbar>
        <BarCode
          visible={barVisible}
          orderNo={orderNo}
          goodsName={goodsName}
          deviceCode={deviceCode}
          onOk={() => {
            this.printOrderDetail();
            this.onBarVisibleChange(false);
          }}
          onCancel={() => this.onBarVisibleChange(false)}
        />
        <WxPay
          visible={payVisible}
          orderNo={orderNo}
          payMoney={payMoney}
          onOk={() => {
            this.onPayVisibleChange(false);
            this.goBack();
          }}
          onCancel={() => this.onPayVisibleChange(false)}
        />
      </PageHeaderWrapper>
    );
  }
}

export default AdvancedForm;
