import React, { Component,Fragment } from 'react';
import { Form, Card, Input, DatePicker, Select, Col, Row, Table, Button, message,InputNumber,Checkbox,Tooltip,Tag,Modal } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import moment from 'moment';
import QRCode from 'qrcode.react';
import classNames from "classnames";
import styles from './index.less';
import { connect } from 'dva';
import Ellipsis from '../../components/Ellipsis';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import { noMatch } from '../../utils/authority';
import Authorized from '../../utils/Authorized';

const FormItem = Form.Item;
const {RangePicker} = DatePicker;

@connect(({ card,cashier }) => ({
  card,cashier
}))
@Form.create()
export default class Emply extends Component {

  action = {
    activateCard: 'card/fetchActivateCard',
    editCard: 'card/fetchEditCard',
    getCardInfo: 'card/fetchGetCardInfo',
    // 获取卡信息(读卡)
    handleReadCard: 'card/fetchHandleReadCardDetail',
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
      currentNo: ''
    };
  }

  componentDidMount() {
    this.getApplicableItems();
    const { dispatch } = this.props;
    const { location } = this.props;
    if (location && location.search) {
      const { query } = location;
      dispatch({
        type:this.action.handleReadCard,
        payload:{ id: query.id }
      }).then(() => {
        const {card:{ cardDetail},form} = this.props;
        form.setFieldsValue({
          cardStatus: this.renderCardStatus(cardDetail.cardStatus),
        });
        if (cardDetail.cardType) {
          this.handleCartType(cardDetail.cardType);
        }
        if (cardDetail.cardType === 1 && cardDetail.cardBasicInfoId) {
          this.getYearInfo(cardDetail.cardBasicInfoId);
        }
      })
    }
  }

  getApplicableItems = () => {
    const { dispatch } = this.props;
    dispatch({
      type: this.action.getApplicableItems,
    });
  };

  renderCardStatus = (cardStatus) => {
    switch (cardStatus) {
      case 1:
        return '未销售';
      case 2:
        return '已销售';
      case 3:
        return '已遗失';
      case 4:
        return '已报废';
      case 5:
        return '已挂失';
      case 6:
        return '已退卡';
      default:
        return '';
    }
  };

  // 卡管理卡号读取
  handleReadCard = () => {
    const { dispatch,form } = this.props;
    const card = form.getFieldValue('cardNo');
    dispatch({
      type:this.action.handleReadCard,
      payload:{ cardNO: card }
    }).then(() => {
      const {card:{readCardStatus},form} = this.props;
      if(readCardStatus) {
        form.setFieldsValue({
          cardStatus:readCardStatus && readCardStatus.cardStatus && readCardStatus.cardStatus===1?'未销售':''
        })
      }
    })
  }

  // 销售管理获取卡名称
  handleCartType = (val) => {
    const { dispatch,form } = this.props;
    // if(val) {
    //   form.setFieldsValue({
    //     cartName:'',
    //   });
    // }
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
    const { form,dispatch } = this.props;
    dispatch({
      type:this.action.getYearInfo,
      payload:{ id:val }
    }).then(() => {
      const { card:{ yearInfoList } } = this.props;
      if(yearInfoList && yearInfoList.sportItem && JSON.stringify(yearInfoList.sportItem) !== "[]") {
        const checkedList = [];
        yearInfoList.sportItem.forEach((item) => {
          checkedList.push(parseInt(item));
        });
        this.setState({
          checkedList,
        })
      }
    });
  }

  // 取消
  handleCancel = () => {
    const { card:{readCardStatus} } = this.props;
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
    const { form, dispatch,card:{applicableItemsList, cardDetail} } = this.props;
    const { checkedList,yearCard,choosePayMent } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return ;
      }
      // if (choosePayMent === null) {
      //   message.warning('请选择支付方式');
      //   return ;
      // }
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
        ...cardDetail,
        ...values,
        sportItem:checkedList,
        sportItemName:courtName,
        paymentMode:choosePayMent && choosePayMent===null ?null:choosePayMent,
        validDate:values && values.validDate!==undefined ?moment(values.validDate).format("YYYY-MM-DD"):undefined,
      };
      dispatch({
        // 编辑保存需要新接口
        type: 'card/handleSubmitEdit',
        payload: params,
      });
    });
  };


  // 关闭弹窗
  onClose = () => {
    this.setState({
      modal1: false,
    });
  }

  render() {
    const { form,form: { getFieldDecorator },card:{cardDetail, applicableItemsList,payTypeList,readCardStatus,statusList,cardNameList,yearInfoList } } = this.props;
    const { id,yearCard,currentPayType,choosePayMent,modal1,currentNo } = this.state;
    const cetiType = form.getFieldValue('certificateType');
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

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.reductionTableListForm}>
              <Form>
                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='卡号'>
                      {getFieldDecorator('cardNo',{
                        initialValue: cardDetail && cardDetail.cardNo,
                      })(
                        <Input disabled />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem{...formItemLayout} label='状态'>
                      {getFieldDecorator('cardStatusString',{
                        initialValue: cardDetail && cardDetail.cardStatusString,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                {
                  1===1 &&
                  <Row>
                    <Col span={12}>
                      <FormItem{...formItemLayout} label='卡类型'>
                        {getFieldDecorator('cardType',{
                          // rules: [{ required: true, message:'请选择卡类型' }],
                          initialValue: cardDetail && cardDetail.cardType,
                        })(
                          <Select disabled onChange={this.handleCartType}>
                            <Select.Option key={1} value={1}>
                              年卡
                            </Select.Option>
                            <Select.Option key={2} value={2}>
                              储值卡
                            </Select.Option>
                          </Select>)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...formItemLayout} label='卡名称'>
                        {getFieldDecorator('cartName',{
                          // rules: [{ required: true, message:'请输入卡名称' }],
                          initialValue: cardDetail && cardDetail.cartName,
                        })(
                          <Select disabled onChange={this.getYearInfo}>
                            {cardNameList && cardNameList.length && cardNameList.map(obj => (
                              <Select.Option key={obj.id} value={obj.id}>
                                {obj.cartName}
                              </Select.Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                }
                {cardDetail.cardType === 1 &&
                  <Row>
                    <Col span={20}>
                      <FormItem{...formItemLayout} label='适用项目'>
                        {getFieldDecorator('sportItem',{
                          rules: [{ required: true, message:'请选择适用项目' }],
                          initialValue: this.state.checkedList,
                        })(
                          <Fragment>
                            <Checkbox.Group disabled style={{display:'inline'}} value={this.state.checkedList}>
                              {
                                applicableItemsList && applicableItemsList.length>0 && applicableItemsList.map((item) => (
                                  <Checkbox key={item.id} value={item.id}>{item.itemName}</Checkbox>
                                ))
                              }
                            </Checkbox.Group>
                          </Fragment>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                }
                {
                  cardDetail.cardType === 1 &&
                  <Row>
                    <Col span={12}>
                      <FormItem{...formItemLayout} label='卡面价格(元)'>
                        {getFieldDecorator('cardViewPrice',{
                          // rules: [
                          //   { required: true, message:'请输入卡面价格' },
                          //   { pattern: /^\d{0,9}(?:\.\d{1,2})?$/, message: '卡面价格只能为数字，且最大为999999999.99' }],
                          initialValue: yearInfoList && yearInfoList.cardViewPrice,
                        })(<Input disabled />)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem{...formItemLayout} label='销售价格(元)'>
                        {getFieldDecorator('cardSalePrice',{
                          // rules: [
                          //   { required: true, message:'请输入销售价格' },
                          //   { pattern: /^\d{0,9}(?:\.\d{1,2})?$/, message: '销售价格只能为数字，且最大为999999999.99' }],
                          initialValue: yearInfoList && yearInfoList.cardSalePrice,
                        })(<Input disabled />)}
                      </FormItem>
                    </Col>
                  </Row>
                }
                {
                  cardDetail.cardType === 1 &&
                  <Row>
                    <Col span={12}>
                      <FormItem{...formItemLayout} label='押金'>
                        {getFieldDecorator('cardDeposit',{
                          // rules: [
                          //   { required: true, message:'请输入押金' },
                          //   { pattern: /^\d{0,9}(?:\.\d{1,2})?$/, message: '押金只能为数字，且最大为999999999.99' }],
                          initialValue: yearInfoList && yearInfoList.cardDeposit,
                        })(<Input disabled />)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem{...formItemLayout} label='日消费次数'>
                        {getFieldDecorator('consumeTimes',{
                          initialValue: yearInfoList && yearInfoList.consumeTimes,
                        })(<Input disabled />)}
                      </FormItem>
                    </Col>
                  </Row>
                }
                {
                  cardDetail.cardType === 1 &&
                  <Row>
                    <Col span={12}>
                      <FormItem{...formItemLayout} label='超时价格(元)'>
                        {getFieldDecorator('timeoutBillingPrice',{
                          initialValue: yearInfoList && yearInfoList.timeoutBillingPrice,
                        })(<Input disabled />)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem{...formItemLayout} label='超时计费单位(分钟)'>
                        {getFieldDecorator('timeoutBillingUnit',{
                          initialValue: yearInfoList && yearInfoList.timeoutBillingUnit,
                        })(<Input disabled />)}
                      </FormItem>
                    </Col>
                  </Row>
                }
                {
                  cardDetail.cardStatus === 1 && cardDetail.cardType !== 1 &&
                  <Row>
                    <Col span={12}>
                      <FormItem{...formItemLayout} label='充值金额(元)'>
                        {getFieldDecorator('paymentAmount',{
                          initialValue: '',
                        })(<Input disabled />)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem{...formItemLayout} label='到账金额(元)'>
                        {getFieldDecorator('arrivalAmount',{
                          initialValue: '',
                        })(<Input disabled />)}
                      </FormItem>
                    </Col>
                  </Row>
                }
                {
                  cardDetail.cardType &&
                  <div>
                    <Row>
                      <Col span={12}>
                        <FormItem{...formItemLayout} label='姓名'>
                          {getFieldDecorator('memberName',{
                            rules: [{ required: true, message: '请输入姓名' }],
                            initialValue: cardDetail && cardDetail.memberName,
                          })(<Input maxLength={10}/>)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem{...formItemLayout} label='联系方式'>
                          {getFieldDecorator('memberTel',{
                            rules: [
                              { required: true, message: '请输入联系方式' },
                              { pattern: /^1(3|4|5|7|8)\d{9}$/, message: '请输入正确的手机号' }],
                            initialValue: cardDetail && cardDetail.memberTel,
                          })(<Input />)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12}>
                        <FormItem{...formItemLayout} label='证件类型'>
                          {getFieldDecorator('certificateType',{
                            rules: [{ required: true, message: '请选择证件类型' }],
                            initialValue: cardDetail && cardDetail.certificateType,
                          })(
                            <Select>
                            <Select.Option value={1}>身份证</Select.Option>
                            <Select.Option value={2}>其他</Select.Option>
                          </Select>)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem{...formItemLayout} label='证件号码'>
                          {getFieldDecorator('certificateNo',{
                            rules: [
                              { required: true, message: '请输入证件号码' },
                              {
                                // pattern: form.getFieldValue('certificateType') === 1? /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/ : /^[0-9]\d{0,19}$/,
                                pattern: form.getFieldValue('certificateType') === 1? /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$)/:/^[a-zA-Z0-9]{5,20}$/,
                                message: form.getFieldValue('certificateType') === 1? '请输入正确的身份证号码': '请输入正确的格式',
                              },
                            ],
                            initialValue: cardDetail && cardDetail.certificateNo,
                          })(<Input />)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <FormItem{...formItemLayout} label='常住地址'>
                          {getFieldDecorator('address',{
                            rules: [{ required: true, message: '请输入常住地址' }],
                            initialValue: cardDetail && cardDetail.address,
                          })(<Input maxLength={100}/>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12}>
                        <FormItem{...formItemLayout} label='发行日期'>
                          {getFieldDecorator('issueDate',{
                            initialValue: cardDetail && cardDetail.issueDate,
                          })(<Input disabled />)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem{...formItemLayout} label='有效期限'>
                          {getFieldDecorator('validDate',{
                            initialValue: cardDetail && moment(cardDetail.validDate),
                          })(<DatePicker allowClear={false} style={{width:'100%'}} />)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      {/* <Col span={12}>
                        <FormItem{...formItemLayout} label='合计收款(元)'>
                          {getFieldDecorator('he',{
                            // initialValue: cardDetail && cardDetail.cardType === 1 ? form.getFieldValue('cardDeposit') && form.getFieldValue('cardSalePrice') && Number(form.getFieldValue('cardDeposit')) + Number(form.getFieldValue('cardSalePrice')):form.getFieldValue('paymentAmount') && Number(form.getFieldValue('paymentAmount')),
                          })(<Input disabled />)}
                        </FormItem>
                      </Col> */}
                      <Col span={12}>
                        <FormItem{...formItemLayout} label='手环号'>
                          {getFieldDecorator('wristStrapNo',{
                            initialValue: cardDetail && cardDetail.wristStrapNo,
                          })(<Input />)}
                        </FormItem>
                      </Col>
                    </Row>
                    {/* <Row>
                      <Col span={24}>
                        <FormItem{...formItemLayout} label='支付方式'>
                          {getFieldDecorator('pay',{
                            initialValue: '',
                          })(<div>
                            {
                              payTypeList && payTypeList.length > 0 && payTypeList.map((step) => (
                                <Tooltip key={step.code} placement="topLeft" title={step.name && step.name.length > 8 ? step.name : undefined}>
                                  <Tag.CheckableTag
                                    disabled
                                    className={choosePayMent === step.code ? selectedTag : defaultTag}
                                    style={{ marginRight: 5 }}
                                    checked={choosePayMent === step.code}
                                    onChange={() => this.handlePayList(step)}
                                  >
                                    <Ellipsis length={8}>{step.name}</Ellipsis>
                                  </Tag.CheckableTag>
                                </Tooltip>
                              ))
                            }
                          </div>)}
                        </FormItem>
                      </Col>
                    </Row> */}
                  </div>
                }
              </Form>
            </div>
          </div>
          <div style={{ overflow: 'hidden',width:'100%' }}>
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col align='center'>
                <Button
                  type="primary"
                  onClick={this.handleCancel}
                  className={styles.buttonColor}
                >
                  取消
                </Button>
                <Button
                  style={{marginLeft:5}}
                  htmlType="submit"
                  onClick={this.handleSubmit}
                  loading={this.state.loading}
                  className={styles.buttonColor}>确认</Button>
                <Authorized authority='jis_platform_dc_card_sale_edit' nomatch={noMatch()}>
                  <Button
                    style={{marginLeft:5}}
                    htmlType="submit"
                    onClick={this.handleSubmit}
                    loading={this.state.loading}
                    className={styles.buttonColor}>确认</Button>
                </Authorized>
              </Col>
            </Row>
          </div>
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
