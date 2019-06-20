import React, { Component,Fragment } from 'react';
import { Form, Card, Input, DatePicker, Col, Row, Button, message,Checkbox,Radio,Tooltip,Tag } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import moment from 'moment';
import classNames from "classnames";
import { handleResponse, renderCardTypeString, renderTitle } from '../../utils/globalUtils';
import styles from './index.less';
import { connect } from 'dva';
import Ellipsis from '../../components/Ellipsis';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import WxPay from '../../components/WxPay/BarCode';
import request from '../../utils/request';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

@connect(({ card }) => ({
  card,
}))
@Form.create()
export default class Emply extends Component {

  action = {
    getApplicableItems: 'card/fetchGetApplicableItems',
    getReplacementInfo: 'card/fetchGetReplacementInfo',
    replacementReadCard: 'card/fetchReplacementReadCard',
    submitReplacement: 'card/fetchSubmitReplacement',
    getPayType: 'card/fetchGetPayType',
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      checkedList:[],
      cardNo:null,
      radioType:null,
      loading:false,
      currentPayType:1,
      currentPay:'1',
      choosePayMent:null,// 选择的支付方式的code
      replacementReadCardList:{},
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
      payload: { type:5 },
    })
    // 获取适用项目
    dispatch({
      type: this.action.getApplicableItems,
    })

    if (location && location.search) {
      const { query } = location;
      this.setState({ ...query });
      dispatch({
        type:this.action.getReplacementInfo,
        payload: { cardNo: query.cardNo}
      }).then(() => {
        const { card:{ replacementInfo } } = this.props;
        if(replacementInfo && replacementInfo.sportItem && JSON.stringify(replacementInfo.sportItem) !== "[]") {
          const checkedList = [];
          replacementInfo.sportItem.forEach((item) => {
            checkedList.push(parseInt(item));
          });
          this.setState({
            checkedList,
          })
        }
      });
    }
  }

  // 会员补换卡卡号读取
  handleReadCard = () => {
    const { dispatch,form } = this.props;
    const newNo = form.getFieldValue('newCardNO');
    const oldNo = form.getFieldValue('cardNo');
    request(`/venuebooking/memberCard/checkTwoCards?oldCardNo=${oldNo}&newCardNo=${newNo}`)
      .then(response => {
        if (handleResponse(response)) {
          this.handleReadCardSuccess();
        }
      })
  }

  handleReadCardSuccess = () => {
    const { dispatch,form } = this.props;
    const card = form.getFieldValue('newCardNO');
    dispatch({
      type:this.action.replacementReadCard,
      payload:{ cardNO: card }
    }).then(() => {
      const { card:{replacementReadCardList} } = this.props;
      if(replacementReadCardList) {
        form.setFieldsValue({
          cardType2:replacementReadCardList && replacementReadCardList.cardType && replacementReadCardList.cardType===1?'年卡': replacementReadCardList.cardType===2 ? '储值卡':''
        })
        this.setState({
          replacementReadCardList,
        })
      }
    })
  }

  // 会员补换卡旧卡的处理方式
  handleRadio = (e) => {
    if(e) {
      this.setState({
        radioType:e.target.value,
      })
    }
  }
  // 取消
  handleCancel = () => {
    router.go(-1);
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
    const { cardNo,currentPay,choosePayMent,radioType } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return ;
      }
      if (radioType!==4 && choosePayMent === null) {
        message.warning('请选择支付方式');
        return ;
      }
      this.setState({
        loading:true,
      });
      const params = {
        ...values,
        // cardNo:cardNo && cardNo,
        // cardDeposit:values && values.cardDeposit==='undefined'?null:values.cardDeposit,
        // newCardNO:values && values.newCardNO==='undefined'?null:values.newCardNO,
        // cardStatus:values && values.cardStatus==='undefined'?null:values.cardStatus,
        issueDate:values && values.issueDate==='undefined'?null:moment(values.issueDate,'YYYY-MM-DD'),
        validDate:values && values.validDate==='undefined'?null:moment(values.validDate,'YYYY-MM-DD'),
        paymentMode: choosePayMent,
      };
      dispatch({
        type:this.action.submitReplacement,
        payload:params
      }).then(() => {
        const { card: { replaceResponse } } = this.props;
        this.setState({ loading:false, });
        if (handleResponse(replaceResponse, (params.paymentMode !== "3" && params.paymentMode !== "4"))) {
          if ((params.paymentMode === "3" || params.paymentMode === "4") && replaceResponse.data) {
            this.onBarVisibleChange(true, replaceResponse.data.orderNo, replaceResponse.data.goodsName, replaceResponse.data.deviceCode, response.data.methodCode, response.data.version);
          } else {
            this.handleCancel();
          }
        }
      })
    });
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
      cardType2:''
    })
    this.setState({
      replacementReadCardList:{}
    })
  }

  onBarVisibleChange = (barVisible, orderNo, goodsName, deviceCode, methodCode, version) => {
    this.setState({ barVisible, orderNo, goodsName, deviceCode, methodCode, version });
  };

  goBack = () => {
    const pathname = `/card/saleList/list`;
    router.push({ pathname });
  };

  render() {
    const { form: { getFieldDecorator },card:{applicableItemsList,payTypeList,replacementInfo } } = this.props;
    const { id,radioType,currentPayType,choosePayMent,replacementReadCardList } = this.state;
    const { barVisible, orderNo, goodsName, deviceCode, methodCode, version} = this.state;
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
              <Row gutter={24}>
                <Col style={{ paddingBottom: 8 }}>{renderTitle('原卡信息')}</Col>
              </Row>
              <Form>
                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='卡号'>
                      {getFieldDecorator('cardNo',{
                        initialValue:replacementInfo && replacementInfo.cardNo
                      })(
                        <Input disabled={true}/>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='卡类型'
                    >
                      {getFieldDecorator('cardTypeString',{
                        initialValue: renderCardTypeString(replacementInfo && replacementInfo.cardType),
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={20}>
                    <FormItem
                      {...formItemLayout}
                      label='适用项目'
                    >
                      {getFieldDecorator('sportItem',{
                        initialValue:this.state.checkedList
                      })(
                        <Fragment>
                          <Checkbox.Group disabled={true} style={{display:'inline'}} value={this.state.checkedList}>
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
                <Row>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='卡面价格(元)'
                    >
                      {getFieldDecorator('cardViewPrice',{
                        initialValue:replacementInfo && replacementInfo.cardViewPrice,
                      })(<Input disabled={true} />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='销售价格(元)'
                    >
                      {getFieldDecorator('cardSalePrice',{
                        initialValue:replacementInfo && replacementInfo.cardSalePrice,
                      })(<Input disabled={true} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='姓名'
                    >
                      {getFieldDecorator('memberName',{
                        initialValue:replacementInfo && replacementInfo.memberName,
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='联系方式'
                    >
                      {getFieldDecorator('memberTel',{
                        initialValue:replacementInfo && replacementInfo.memberTel,
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='发行日期'
                    >
                      {getFieldDecorator('issueDate1',{
                        initialValue:replacementInfo && replacementInfo.issueDate,
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='有效期限'
                    >
                      {getFieldDecorator('validDate1',{
                        initialValue:replacementInfo && replacementInfo.validDate,
                      })(<Input disabled={true} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='余额'
                    >
                      {getFieldDecorator('balance',{
                        initialValue:replacementInfo && replacementInfo.balance,
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
          <div className={styles.tableList}>
            <div className={styles.reductionTableListForm}>
              <Row gutter={24}>
                <Col style={{ paddingBottom: 8 }}>{renderTitle('新卡信息')}</Col>
              </Row>
              <Form>
                <Row>
                  <Col span={12}>
                    <Row gutter={24}>
                      <Col span={20}>
                        <FormItem {...formItemLayout} label='卡号'>
                          {getFieldDecorator('newCardNO',{
                            rules: [
                              {
                                required: true,
                                message:'请输入卡号'
                              },
                            ],
                            initialValue:''
                          })(
                            <Input placeholder='请输入卡号' maxLength={50} onChange={this.handleRead}/>
                          )}
                        </FormItem>
                      </Col>
                      <Col span={2} style={{paddingTop:'3px'}}>
                        <Button
                          type="primary"
                          onClick={this.handleReadCard}
                          className={styles.buttonColor}>读取</Button>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='卡类型'
                    >
                      {getFieldDecorator('cardType2',{
                        rules: [
                          {
                            required: true,
                            message:'请获取卡类型'
                          },
                        ],
                        initialValue:''
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={20}>
                    <FormItem
                      {...formItemLayout}
                      label='适用项目'
                    >
                      {getFieldDecorator('sportItem',{
                        initialValue:this.state.checkedList
                      })(
                        <Fragment>
                          <Checkbox.Group disabled={true} style={{display:'inline'}} value={this.state.checkedList}>
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
                <Row>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='姓名'
                    >
                      {getFieldDecorator('memberName',{
                        initialValue:replacementInfo && replacementInfo.memberName
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='联系方式'
                    >
                      {getFieldDecorator('memberTel',{
                        initialValue:replacementInfo && replacementInfo.memberTel
                      })(<Input disabled={true} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='发行日期'
                    >
                      {getFieldDecorator('issueDate',{
                        rules: [
                          {
                            required: true,
                            message:'请选择发行日期'
                          },
                        ],
                        initialValue: null,
                      })(<DatePicker style={{width:'100%'}} />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='有效期限'
                    >
                      {getFieldDecorator('validDate',{
                        rules: [
                          {
                            required: true,
                            message:'请选择有效期限'
                          },
                        ],
                        initialValue: null,
                      })(<DatePicker style={{width:'100%'}}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='余额'
                    >
                      {getFieldDecorator('balance',{
                        initialValue: replacementInfo && replacementInfo.balance,
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='旧卡处理方式'>
                      {getFieldDecorator('cardStatus',{
                        rules: [{ required: true, message:'请选择旧卡处理方式' }],
                        initialValue: '',
                      })(
                        <RadioGroup onChange={this.handleRadio}>
                          <Radio value={3}>丢失</Radio>
                          <Radio value={4}>回收</Radio>
                        </RadioGroup>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='备注'>
                      {getFieldDecorator('remark',{
                        // rules: [{ required: true, message: '' }],
                      })(
                        <Input />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                {
                  radioType===3 && <Row>
                    <Col span={12}>
                      <FormItem
                        {...formItemLayout}
                        label='押金'
                      >
                        {getFieldDecorator('cardDeposit',{
                          initialValue: '',
                        })(<Input />)}
                      </FormItem>
                    </Col>
                  </Row>
                }
                {
                  radioType!==4 && <Row>
                    <Col span={12}>
                      <FormItem
                        {...formItemLayout}
                        label='支付方式'
                      >
                        {getFieldDecorator('pay',{
                          initialValue: '',
                        })(<div>
                          {
                            payTypeList && payTypeList.length > 0 && payTypeList.map((step) => (
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
                            ))
                          }
                        </div>)}
                      </FormItem>
                    </Col>
                  </Row>
                }
              </Form>
            </div>
          </div>
          <div style={{ overflow: 'hidden',width:'100%' }}>
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={4} offset={10}>
                <Button
                  type="primary"
                  onClick={this.handleCancel}
                  className={styles.buttonColor}
                >
                  取消
                </Button>
                <Button
                  htmlType="submit"
                  onClick={this.handleSubmit}
                  loading={this.state.loading}
                  style={{marginLeft:5}}
                  className={styles.buttonColor}>确认</Button>
              </Col>
            </Row>
          </div>
        </Card>
        <WxPay
          visible={barVisible}
          param={{ orderNo, goodsName, deviceCode, methodCode, version }}
          onOk={() => {
            this.onBarVisibleChange(false);
            this.goBack();
          }}
          onCancel={() => this.onBarVisibleChange(false)}
        />
      </PageHeaderWrapper>
    );
  }
}
