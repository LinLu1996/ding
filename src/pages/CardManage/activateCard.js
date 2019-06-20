import React, { Component } from 'react';
import { Form, Card, Input, DatePicker, Select, Col, Row, Table, Button, message,
  InputNumber, Checkbox, Tooltip, Tag, Modal, Radio } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import moment from 'moment';
import QRCode from 'qrcode.react';
import classNames from "classnames";
import styles from './index.less';
import { connect } from 'dva';
import Ellipsis from '../../components/Ellipsis';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import BarCode from '../../components/WxPay/BarCode';
import Camera from '../../components/Camera';
import request from '../../utils/request';
import { handleResponse } from '../../utils/globalUtils';

const FormItem = Form.Item;
const {RangePicker} = DatePicker;


@Form.create()
@connect(({ card,cashier }) => ({
  card,cashier
}))

export default class Emply extends Component {

  action = {
    activateCard: 'card/fetchActivateCard',
    editCard: 'card/fetchEditCard',
    getCardInfo: 'card/fetchGetCardInfo',
    handleReadCard: 'card/fetchHandleReadCard',
    getCardName: 'card/fetchGetCardName',
    getYearInfo: 'card/fetchGetYearInfo', // 获取年卡信息
    getApplicableItems: 'card/fetchGetApplicableItems',
    getPayType: 'card/fetchGetPayType',
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      checkedList:[],
      id:null,
      yearCard:false,
      loading:false,
      currentPayType:1,
      choosePayMent:null,// 选择的支付方式的code
      modal1: false,
      currentNo: '',
      readCardStatus:{},
      barVisible: false,
      orderNo: undefined, // 订单号
      goodsName: undefined, // 产品名
      deviceCode: undefined, // 设备号
      methodCode: undefined, // 支付方式
      version: undefined, // 版本号
    };
  }

  componentDidMount() {
    const {current,pageSize} = this.state;
    const { dispatch, location } = this.props;
    // 获取支付方式
    dispatch({
      type:this.action.getPayType,
      payload: { type: 3 },
    })
    // 获取适用项目
    dispatch({
      type: this.action.getApplicableItems,
    })
  }

  onStateChange = (fieldName, value) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'card/onStateChange',
      payload: {
        [fieldName]: value,
      },
    });
  };


  // 卡管理卡号读取
  handleReadCard = () => {
    console.log(122);
    const { dispatch,form } = this.props;
    // const card = form.getFieldValue('cardNo');
    form.validateFieldsAndScroll(['cardNo'], (errors, values) => {
      form.resetFields();
      form.setFieldsValue({ cardNo: values.cardNo });
      console.log(values.cardNo);
      dispatch({
        type:this.action.handleReadCard,
        payload:{ cardNO: values.cardNo }
      }).then(() => {
        const {card:{readCardStatus},form} = this.props;
        if(readCardStatus) {
          form.setFieldsValue({
            cardStatus:readCardStatus && readCardStatus.cardStatus && readCardStatus.cardStatus===1?'未销售':''
          })
          if(readCardStatus.cardType){
            this.setState({ yearCard: readCardStatus.cardType === 1 });
            // if(readCardStatus.cardType===1) {
            //   this.getYearInfo(readCardStatus.cardType);
            // }
            dispatch({
              type:this.action.getCardName,
              payload:{ cardType: readCardStatus.cardType }
            })
          }
          this.setState({
            readCardStatus,
          })
        } else {
          this.handleTolist();
        }
      })
    })
  }

  // 销售管理获取卡名称
  handleCartType = (val) => {
    const { dispatch,form } = this.props;
    if(val) {
      form.setFieldsValue({
        cartName:'',
      });
    }
    dispatch({
      type:this.action.getCardName,
      payload:{ cardType: val }
    })
    let flag = false;
    if(val && val===1){
      flag = true;
    } else {
      flag = false;
    }
    this.setState({
      yearCard:flag,
    })
  }

  // 获取年卡信息
  getYearInfo = (val) => {
    const { form, dispatch } = this.props;
    form.resetFields(["cardViewPrice",  "cardSalePrice", "cardDeposit", "consumeTimes", "timeoutBillingPrice", "timeoutBillingUnit"]);
    dispatch({
      type:this.action.getYearInfo,
      payload:{ id: val },
    }).then(() => {
      const { card:{ yearInfoList } } = this.props;
      if(yearInfoList && yearInfoList.sportItem && JSON.stringify(yearInfoList.sportItem) !== "[]") {
        const checkedList = [];
        yearInfoList.sportItem.forEach((item) => {
          checkedList.push(parseInt(item));
        });
        console.log(yearInfoList);
        this.setState({
          checkedList,
        })
      }
    });
  }

  // 取消
  handleCancel = () => {
    const { readCardStatus } = this.state;
    if (readCardStatus && readCardStatus.cardStatus===1) {
      Modal.confirm({
        title: '提示',
        content: '是否放弃保存录入的内容？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => this.handleTolist(),
      });
    } else {
      this.handleTolist();
    }
  }

  handleTolist = () => {
    const pathname = `/cashier/saleList/list`;
    router.push({
      pathname,
    });
  }

  // 处理支付方式
  handlePayList=(e)=>{
    const { dispatch } = this.props;
    this.setState({
      choosePayMent:e.code,
    });
  };

  handleSubmit = () => {
    const { form, dispatch,card:{applicableItemsList} } = this.props;
    const { checkedList,yearCard,choosePayMent, imageBase64 } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      if (choosePayMent === null) {
        message.warning('请选择支付方式');
        return ;
      }
      this.setState({
        loading:true
      })
      const courtName = [];
      for(let i=0; i<applicableItemsList.length; i++) {
        const cu = applicableItemsList[i];
        checkedList.forEach((item) => {
          if(item===cu.id) {
            courtName.push(cu.itemName);
          }
        })
      }
      const params = {
        ...values,
        sportItem:checkedList,
        sportItemName:courtName,
        paymentMode:choosePayMent && choosePayMent===null ?null:choosePayMent,
        validDate:values && values.validDate!==undefined ?moment(values.validDate).format("YYYY-MM-DD"):null,
        cardStatus:1,
        code:values.grantCard,
        imageBase64,
      };
      request('/venuebooking/memberCard/addCardMember',{
        method: 'POST',
        body: params,
      }).then(response => {
        this.setState({ loading:false });
        if (handleResponse(response, (params.paymentMode !== "3" && params.paymentMode !== "4"))) {
          if (params.paymentMode === "3" || params.paymentMode === "4") {
            this.onBarVisibleChange(true, response.data.orderNo, response.data.goodsName, response.data.deviceCode, response.data.methodCode, response.data.version);
          } else {
            this.handleTolist();
          }
        }
      });
      // dispatch({
      //   type:this.action.activateCard,
      //   payload:params
      // }).then(() => {
      //   const { card: { code } } = this.props;
      //   this.setState({ loading:false });
      //   if (code === 200) {
      //     if (params.paymentMode === "4") {
      //       this.onBarVisibleChange(true, saleAddResult.data.orderNo, saleAddResult.data.goodsName, saleAddResult.data.deviceCode);
      //     } else {
      //       this.handleTolist();
      //     }
      //   }
      // })
    });
  };

  // 关闭弹窗
  onClose = () => {
    this.setState({
      modal1: false,
    });
  }

  onBarVisibleChange = (barVisible, orderNo, goodsName, deviceCode, methodCode, version) => {
    this.setState({ barVisible, orderNo, goodsName, deviceCode, methodCode, version });
  };

  /**
   * @Description: 修改卡号
   * @author Lin Lu
   * @date 2019/3/6
   */
  handleRead = (e) => {
    const { form } = this.props;
    e.preventDefault();
    form.setFieldsValue({
      cardStatus:''
    });
    this.setState({
      readCardStatus:{},
      yearCard: false,
    });
    this.onStateChange('yearInfoList', {});
  };

  onPush = (imgData) => {
    this.setState({
      imageBase64: imgData
    });
  }

  render() {
    const { form,form: { getFieldDecorator },card:{applicableItemsList,payTypeList,statusList,cardNameList,yearInfoList } } = this.props;
    const { id,yearCard,currentPayType,choosePayMent,modal1,currentNo,readCardStatus } = this.state;
    const { barVisible, orderNo, goodsName, deviceCode, methodCode, version } = this.state;
    console.log(this.props);
    const cetiType = form.getFieldValue('cardSalePrice');
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
        md: { span: 16 },
      },
    };
    const selectedTag = classNames(styles.selectedTag, styles.normalTag);
    const defaultTag = classNames(styles.defaultTag, styles.normalTag);
    // form.getFieldValue('cardDeposit')!==yearInfoList.cardDeposit
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.reductionTableListForm}>
              <Row>
                <Form>
                  <Col span={12}>
                    <Row gutter={24}>
                      <Col span={20}>
                        <FormItem {...formItemLayout} label='卡号'>
                          {getFieldDecorator('cardNo',{
                            rules: [
                              { required: true, message:'请输入卡号' }],
                          })(
                            <Input onPressEnter={this.handleReadCard} placeholder='请输入卡号' maxLength={50} onChange={this.handleRead}/>
                          )}
                        </FormItem>
                      </Col>
                      <Col span={2} style={{paddingTop:'3px'}}>
                        <Button type="primary" onClick={this.handleReadCard} className={styles.buttonColor}>读取</Button>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='状态'>
                      {getFieldDecorator('cardStatusString',{
                        rules: [{ required: true, message:'请查询状态' }],
                        initialValue: readCardStatus && readCardStatus.cardStatusString,
                      })(<Input disabled={true} />)}
                    </FormItem>
                  </Col>
                  {readCardStatus && readCardStatus.cardStatus===1 &&
                    <span>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='卡类型'>
                          {getFieldDecorator('cardType',{
                            rules: [{ required: true, message:'请选择卡类型' }],
                            initialValue: readCardStatus && readCardStatus.cardType,
                          })(
                            <Select disabled placeholder='请选择' onChange={this.handleCartType}>
                              <Select.Option key={1} value={1}>年卡</Select.Option>
                              <Select.Option key={2} value={2}>储值卡</Select.Option>
                              <Select.Option key={3} value={3}>次卡</Select.Option>
                            </Select>)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='卡名称'>
                          {getFieldDecorator('cartName',{
                            rules: [{ required: true, message:'请选择卡名称' }],
                          })(
                            <Select placeholder='请选择' onChange={this.getYearInfo}>
                              {cardNameList && cardNameList.length && cardNameList.map(obj => (
                                <Select.Option key={obj.id} value={obj.id}>{obj.cartName}</Select.Option>
                              ))}
                            </Select>
                          )}
                        </FormItem>
                      </Col>
                    </span>
                  }
                  {form.getFieldValue("cartName") &&
                    <Col span={24}>
                      <FormItem {...formItemLayout} label='适用项目'>
                        {getFieldDecorator('sportItem',{
                          rules: [{ required: false }],
                          initialValue: this.state.checkedList
                        })(
                          <Checkbox.Group disabled={true} style={{display:'inline'}} value={this.state.checkedList}>
                            {applicableItemsList && applicableItemsList.length>0 && applicableItemsList.map((item) => (
                              <Checkbox key={item.id} value={item.id}>{item.itemName}</Checkbox>
                            ))}
                          </Checkbox.Group>
                        )}
                      </FormItem>
                    </Col>
                  }
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='卡面价格(元)'>
                      {getFieldDecorator('cardViewPrice',{
                        rules: [{ required: false, message:'请输入卡面价格' }],
                        initialValue: yearInfoList && yearInfoList.cardViewPrice,
                      })(<Input disabled={true} placeholder='请输入卡面价格'/>)}
                    </FormItem>
                  </Col>
                  {yearCard &&
                    <span>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='日消费次数'>
                          {getFieldDecorator('consumeTimes',{
                            rules: [{ required: false, }],
                            initialValue: yearInfoList && yearInfoList.consumeTimes,
                          })(<Input disabled={true}/>)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='超时价格(元)'>
                          {getFieldDecorator('timeoutBillingPrice',{
                            rules: [{ required: false, message:'请输入超时价格' }],
                            initialValue: yearInfoList && yearInfoList.timeoutBillingPrice,
                          })(<Input disabled={true} placeholder='请输入超时价格'/>)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='超时计费单位(分钟)'>
                          {getFieldDecorator('timeoutBillingUnit',{
                            rules: [{ required: false }],
                            initialValue: yearInfoList && yearInfoList.timeoutBillingUnit,
                          })(<Input disabled={true} />)}
                        </FormItem>
                      </Col>
                    </span>
                  }
                  {/*
                    readCardStatus && readCardStatus.cardStatus===1 && !yearCard && <Row>
                      <Col span={12}>
                        <FormItem
                          {...formItemLayout}
                          label='充值金额(元)'
                        >
                          {getFieldDecorator('paymentAmount',{
                            rules: [
                              {
                                required: true,
                                message:'请输入充值金额'
                              },
                              {
                                pattern: /^\d{0,9}(?:\.\d{1,2})?$/,
                                message: '充值金额只能为数字，且最大为999999999.99',
                              },
                            ],
                            initialValue: '',
                          })(<Input placeholder='请输入充值金额'/>)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem
                          {...formItemLayout}
                          label='到账金额(元)'
                        >
                          {getFieldDecorator('arrivalAmount',{
                            rules: [
                              {
                                required: true,
                                message:'请输入到账金额'
                              },
                              {
                                pattern: /^\d{0,9}(?:\.\d{1,2})?$/,
                                message: '请输入正确的格式(到账金额只能为数字，且最大为999999999.99)',
                              },

                            ],
                            initialValue: '',
                          })(<Input />)}
                        </FormItem>
                      </Col>
                    </Row>
                  */}
                  {
                    readCardStatus && readCardStatus.cardStatus===1 &&
                    <span>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='销售价格(元)'>
                          {getFieldDecorator('cardSalePrice',{
                            rules: [{ required: false, message:'请输入销售价格' }],
                            initialValue: yearInfoList && yearInfoList.cardSalePrice,
                          })(<InputNumber placeholder='请输入销售价格' style={{ width:'100%' }} />)}
                        </FormItem>
                      </Col>
                      {
                        yearInfoList && readCardStatus.cardType === 3 && (
                          <Col span={12}>
                            <FormItem {...formItemLayout} label="最大使用次数/日">
                              {getFieldDecorator('consumeTimes',{
                                rules: [
                                  // { required: true, message:'请输入日消费次数' },
                                  // { validator: this.validateConsumeTimes },
                                ],
                                initialValue: yearInfoList && yearInfoList.consumeTimes,
                              })(<InputNumber disabled={true} min={1} max={9999} precision={0} style={{ width: "100%" }} />)}
                            </FormItem>
                          </Col>
                        )
                      }
                      {
                        yearInfoList && readCardStatus.cardType === 3 && (
                          <Col span={12}>
                            <FormItem {...formItemLayout} label="最大可用次数">
                              {getFieldDecorator('consumeTotalTimes',{
                                rules: [
                                  // { required: true, message:'请输入最大可用次数' },
                                  // { validator: this.validateMaxUsage },
                                ],
                                initialValue: yearInfoList && yearInfoList.consumeTotalTimes,
                              })(<InputNumber disabled={true} min={1} max={9999} precision={0} style={{ width: "100%" }} />)}
                            </FormItem>
                          </Col>
                        )
                      }
                      {readCardStatus.cardType === 1 && (
                        <Col span={12}>
                          <FormItem {...formItemLayout} label='性别'>
                            {getFieldDecorator('sex',{
                              rules: [{ required: true, message:'请选择性别' }],
                              initialValue: 1,
                            })(
                              <Radio.Group>
                                <Radio value={1}>男</Radio>
                                <Radio value={2}>女</Radio>
                              </Radio.Group>
                            )}
                          </FormItem>
                        </Col>
                      )}
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='姓名'>
                          {getFieldDecorator('memberName',{
                            rules: [
                              { required: true, message:'请输入姓名' },
                              {
                                // pattern: /^[\u4e00-\u9fa5A-Za-z0-9]{0,10}$/,
                                message: '姓名最大长度为10',
                              },
                            ],
                            initialValue: yearInfoList && yearInfoList.memberName,
                          })(<Input placeholder='请输入姓名' maxLength={10}/>)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='联系方式'>
                          {getFieldDecorator('memberTel',{
                            rules: [
                              { required: true, message:'请输入联系方式' },
                              { pattern: /^1(3|4|5|7|8)\d{9}$/, message: '请输入正确的手机号' },
                            ],
                          })(<Input />)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='证件类型'>
                          {getFieldDecorator('certificateType',{
                            rules: [{ required: true, message:'请选择证件类型' }],
                          })(<Select>
                            <Select.Option value={1}>身份证</Select.Option>
                            <Select.Option value={2}>其他</Select.Option>
                          </Select>)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='证件号码'>
                          {getFieldDecorator('certificateNo',{
                            rules: [
                              { required: true, message:'请输入证件号码' },
                              {
                                // pattern: form.getFieldValue('certificateType') === 1? /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/ : /^[0-9a-zA-Z]{0,20}$/,
                                pattern: form.getFieldValue('certificateType') === 1?/(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$)/: /^[a-zA-Z0-9]{5,20}$/,
                                message: form.getFieldValue('certificateType') === 1? '请输入正确的身份证号码': '请输入正确的格式（最大长度20位）',
                              },
                            ],
                          })(<Input />)}
                        </FormItem>
                      </Col>
                      <Col span={24}>
                        <FormItem {...formItemLayout} label='常住地址'>
                          {getFieldDecorator('address',{
                            rules: [
                              { required: true, message:'请输入常住地址' },
                              { pattern: /^[\u4e00-\u9fa5A-Za-z0-9]{0,100}$/, message: '请输入正确的格式(常住地址长度为100）' },
                            ],
                          })(<Input maxLength={100}/>)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='发行日期'>
                          {getFieldDecorator('issueDate',{
                            initialValue: readCardStatus && readCardStatus.issueDate,
                          })(<Input disabled={true}/>)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='有效期限'>
                          {getFieldDecorator('validDate',{
                            initialValue: yearInfoList && moment(yearInfoList.validDate),
                          })(<DatePicker disabled style={{width:'100%'}} />)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='押金'>
                          {getFieldDecorator('cardDeposit',{
                            rules: [{ required: false, message:'请输入押金' }],
                            initialValue: yearInfoList && yearInfoList.cardDeposit,
                          })(<InputNumber placeholder='请输入押金' style={{ width:'100%' }} />)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='合计收款(元)'>
                          {getFieldDecorator('he',{
                            initialValue:(form.getFieldValue('cardDeposit')?Number(form.getFieldValue('cardDeposit')) : 0) + (form.getFieldValue('cardSalePrice') ? Number(form.getFieldValue('cardSalePrice')) : 0),
                            // initialValue: yearCard ? form.getFieldValue('cardDeposit') && form.getFieldValue('cardSalePrice') && Number(form.getFieldValue('cardDeposit')) + Number(form.getFieldValue('cardSalePrice')):form.getFieldValue('paymentAmount') && Number(form.getFieldValue('paymentAmount')),
                          })(<Input disabled={true}/>)}
                        </FormItem>
                      </Col>
                      {yearCard && (
                        <Col span={12}>
                          <FormItem {...formItemLayout} label='手环号'>
                            {getFieldDecorator('wristStrapNo',{
                            })(<Input />)}
                          </FormItem>
                        </Col>
                      )}
                      {
                        JSON.stringify(yearInfoList)!=="{}" && (yearInfoList.cardSalePrice && yearInfoList.cardSalePrice !==Number(form.getFieldValue('cardSalePrice')) ||
                          (yearInfoList.cardDeposit===0? true : yearInfoList.cardDeposit) && yearInfoList.cardDeposit !==Number(form.getFieldValue('cardDeposit'))) &&
                        <Col span={12}>
                          <FormItem {...formItemLayout} label='授权卡'>
                            {getFieldDecorator('grantCard',{
                              rules: [
                                { required: true, message:'请输入卡号' },
                                { pattern: /^[A-Za-z0-9]{0,50}$/, message: '请输入正确的卡号' },
                              ],
                              initialValue:'',
                            })(
                              <Input />
                            )}
                          </FormItem>
                        </Col>
                      }
                      <Col span={12}>
                        <FormItem{...formItemLayout} label='支付方式'>
                          {getFieldDecorator('pay',{
                          })(
                            <div>
                              {payTypeList && payTypeList.length > 0 && payTypeList.map((step) => (
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
                              ))}
                            </div>
                          )}
                        </FormItem>
                      </Col>
                    </span>
                  }
                  <Col span={24}>
                    <Camera onPush={this.onPush} imgsrc={this.state.imageBase64} />
                  </Col>
                </Form>
              </Row>
            </div>
          </div>
          <div>
          </div>
          <div style={{ overflow: 'hidden',width:'100%' }}>
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={4} offset={10}>
                <Button
                  type="primary"
                  onClick={this.handleCancel.bind(this)}
                  className={styles.buttonColor}
                >
                  取消
                </Button>
                <Button
                  style={{marginLeft:5}}
                  onClick={this.handleSubmit}
                  loading={this.state.loading}
                  className={styles.buttonColor}>
                  确认
                </Button>
              </Col>
            </Row>
          </div>
          <BarCode
            visible={barVisible}
            param={{ orderNo, goodsName, deviceCode, methodCode, version }}
            onOk={() => {
              this.onBarVisibleChange(false);
              this.handleTolist();
            }}
            onCancel={() => this.onBarVisibleChange(false)}
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
        </Card>
      </PageHeaderWrapper>
    );
  }
}
