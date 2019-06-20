import React, { Component } from 'react';
import router from 'umi/router';
import { Card, message, Form, Row, Col, Input, Select, Checkbox, DatePicker, Button, Radio } from 'antd';
import moment from 'moment';
import numeral from 'numeral';
import PageHeaderWrapper from '../../../components/PageHeaderWrapper';
import StockRechargeRecord from './StockRechargeRecord';
import request from '../../../utils/request';
import { handleResponse } from '../../../utils/globalUtils';
import Camera from '../../../components/Camera';
import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;

/**
 * @author turing
 */

@Form.create()
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editable: false, // 是否为编辑页面
      replaceBracelet: false, // 是否为更换手铐页面
      cardNameList: [],
      sportItems: [],
      formData: {},
      imageBase64: null,
    };
  }

  componentDidMount() {
    this.getPageEditable();
    this.initialCardInformation();
    this.initialSportItems();
  }

  componentWillUnmount() {
    this.setState({
      editable: false,
      replaceBracelet: false,
      cardNameList: [],
      sportItems: [],
      formData: {},
    });
  }

  getPageEditable = () => {
    const { location: { pathname } } = this.props;
    if (pathname.indexOf('/cashier/saleList/edit') > -1) {
      this.setState({ editable: true });
    }
    if (pathname.indexOf('/cashier/saleList/replaceBracelet') > -1) {
      this.setState({ replaceBracelet: true });
    }
  };

  /**
   * 初始化卡信息
   */
  initialCardInformation = () => {
    const { location: { query, pathname } } = this.props;
    if (query.id) {
      request(`/venuebooking/memberCard/cardStatus/detail?id=${query.id}`)
        .then(response => {
          if (handleResponse(response)) {
            const { data } = response;
            data.applySportItem = data.applySportItem.split(',').map(id => id !== '' ? Number(id) : null).filter(id => id !== null);
            if (pathname.indexOf('/cashier/saleList/detail') > -1) {
              this.initialUsableSportItems(data.applySportItem);
            }
            this.setState({ formData: data });
          }
        });
    } else {
      message.warning('未获取到卡信息');
    }
  };

  /**
   * 获取所有适用项目
   */
  initialSportItems = () => {
    request('/venuebooking/sportItem/getAllSportItems')
      .then(response => {
        if (handleResponse(response)) {
          this.setState({ sportItems: response.data });
        }
      });
  };

  /**
   * 获取该卡可用适用项目
   */
  initialUsableSportItems = (ids) => {
    let requestUrl = "/venuebooking/sportItem/getListByIds";
    ids.forEach((id, i) => {requestUrl += `${i === 0 ? "?" : "&"}ids=${id}`});
    request(requestUrl)
      .then(response => {
        if (handleResponse(response)) {
          this.setState({ sportItems: response.data });
        }
      });
  };

  calculateAllMoney = (formData) => {
    let total = 0;
    switch (formData.cardType) {
      case 1:
        total = numeral(formData.cardSalePrice).add(formData.cardDeposit);
        break;
      case 2:
        total = formData.balance;
        break;
      default:
        break;
    }
    return numeral(total).value();
  };

  handleSubmit = () => {
    const { form } = this.props;
    const { formData, imageBase64 } = this.state;
    form.validateFieldsAndScroll((errors, values) => {
      if (!errors) {
        const params = {
          ...formData,
          ...values,
          wristStrapNo: form.getFieldValue("wristStrapNo") && form.getFieldValue("wristStrapNo").trim() !== "" ? form.getFieldValue("wristStrapNo").trim() : undefined,
          imageBase64,
        };
        params.applySportItem = params.applySportItem.toString();
        delete params.createDate;
        this.putCardInformation(params);
      }
    });
  };

  putCardInformation = (params) => {
    request('/venuebooking/memberCard/editCardMember', {
      method: 'PUT',
      body: params,
    }).then(response => {
      if (handleResponse(response, true)) {
        this.goBack();
      }
    });
  };

  goBack = () => {
    const pathname = '/cashier/saleList/list';
    router.push({ pathname });
  };

  onPush = (imgData) => {
    this.setState({
      imageBase64: imgData
    });
  }

  render() {
    const { form: { getFieldDecorator }, form } = this.props;
    const { editable, replaceBracelet, cardNameList, sportItems, formData } = this.state;

    const isYearCard = formData.cardType === 1;
    const isStockCard = formData.cardType === 2;
    const formItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 6 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
    };
    const sportsItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 3 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 20 } },
    };

    return (
      <PageHeaderWrapper>
        <Card>
          <Row>
            <Form>
              <Col span={12}>
                <FormItem {...formItemLayout} label='卡号'>
                  {getFieldDecorator('cardNo', {
                    initialValue: formData.cardNo,
                  })(
                    <Input disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label='状态'>
                  {getFieldDecorator('cardStatusString',{
                    initialValue: formData.cardStatusString,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label='卡类型'>
                  {getFieldDecorator('cardType',{
                    initialValue: formData.cardType,
                  })(
                    <Select disabled>
                      <Select.Option key={1} value={1}>年卡</Select.Option>
                      <Select.Option key={2} value={2}>储值卡</Select.Option>
                      <Select.Option key={3} value={3}>次卡</Select.Option>
                    </Select>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label='卡名称'>
                  {getFieldDecorator('cartName',{
                    initialValue: formData.cartName,
                  })(
                    <Select disabled>
                      {cardNameList.map(item => <Option key={item.id} value={item.id}>{item.cartName}</Option>)}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={24} className={styles.checkboxMargin}>
                <FormItem {...sportsItemLayout} label='适用项目'>
                  {getFieldDecorator('sportItem',{
                    initialValue: formData.applySportItem,
                  })(
                    <Checkbox.Group disabled style={{ display:'inline' }}>
                      {sportItems.map((item) => <Checkbox key={item.id} value={item.id}>{item.itemName}</Checkbox>)}
                    </Checkbox.Group>
                  )}
                </FormItem>
              </Col>
              {isYearCard && (
                <span>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='卡面价格(元)'>
                      {getFieldDecorator('cardViewPrice',{
                        initialValue: formData.cardViewPrice,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='销售价格(元)'>
                      {getFieldDecorator('cardSalePrice',{
                        initialValue: formData.cardSalePrice,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='押金'>
                      {getFieldDecorator('cardDeposit',{
                        initialValue: formData.cardDeposit,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='日消费次数'>
                      {getFieldDecorator('consumeTimes',{
                        initialValue: formData.consumeTimes,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='超时价格(元)'>
                      {getFieldDecorator('timeoutBillingPrice',{
                        initialValue: formData.timeoutBillingPrice,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='超时计费单位(分钟)'>
                      {getFieldDecorator('timeoutBillingUnit',{
                        initialValue: formData.timeoutBillingUnit,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='性别'>
                      {getFieldDecorator('sex',{
                        rules: [{ required: editable, message: '请选择性别' }],
                        initialValue: formData.sex,
                      })(
                        <Radio.Group disabled={!editable}>
                          <Radio value={1}>男</Radio>
                          <Radio value={2}>女</Radio>
                        </Radio.Group>
                      )}
                    </FormItem>
                  </Col>
                </span>
              )}
              {/* {isStockCard && (
                <Fragment>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='充值金额(元)'>
                      {getFieldDecorator('paymentAmount',{
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='到账金额(元)'>
                      {getFieldDecorator('arrivalAmount',{
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                </Fragment>
              )} */}
              <Col span={12}>
                <FormItem {...formItemLayout} label='姓名'>
                  {getFieldDecorator('memberName',{
                    rules: [{ required: editable, message: '请输入姓名' }],
                    initialValue: formData.memberName,
                  })(<Input disabled={!editable} maxLength={10} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label='联系方式'>
                  {getFieldDecorator('memberTel',{
                    rules: [
                      { required: editable, message: '请输入联系方式' },
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入11位手机号' }
                    ],
                    initialValue: formData.memberTel,
                  })(<Input disabled={!editable} maxLength={11} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label='证件类型'>
                  {getFieldDecorator('certificateType',{
                    rules: [{ required: editable, message: '请选择证件类型' }],
                    initialValue: formData.certificateType,
                  })(
                    <Select disabled={!editable} onChange={() => { form.setFieldsValue({ certificateNo: undefined }) }}>
                      <Select.Option value={1}>身份证</Select.Option>
                      <Select.Option value={2}>其他</Select.Option>
                    </Select>)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label='证件号码'>
                  {getFieldDecorator('certificateNo',{
                    rules: [
                      { required: editable, message: '请输入证件号码' },
                      {
                        // pattern: form.getFieldValue("certificateType") === 1 ? /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/ : /^[a-zA-Z0-9]{5,20}$/,
                        pattern: form.getFieldValue("certificateType") === 1 ? /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}$)/ : /^[a-zA-Z0-9]{5,20}$/,
                        message: form.getFieldValue("certificateType") === 1 ? '请输入正确的身份证号码': '请输入正确的格式',
                      },
                    ],
                    initialValue: formData.certificateNo,
                  })(<Input disabled={!editable} maxLength={20} />)}
                </FormItem>
              </Col>
              <Col span={24}>
                <FormItem {...sportsItemLayout} label='常住地址'>
                  {getFieldDecorator('address',{
                    rules: [{ required: editable, message: '请输入常住地址' }],
                    initialValue: formData.address,
                  })(<Input disabled={!editable} maxLength={100} />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label='发行日期'>
                  {getFieldDecorator('issueDate',{
                    initialValue: formData.issueDate,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label='有效期限'>
                  {getFieldDecorator('validDate',{
                    rules: [{ required: editable, message: '请选择有效期限' }],
                    initialValue: formData.validDate && moment(formData.validDate),
                  })(<DatePicker disabled={!editable} style={{width:'100%'}} />)}
                </FormItem>
              </Col>
              {isYearCard && (
                <Col span={12}>
                  <FormItem {...formItemLayout} label='合计收款(元)'>
                    {getFieldDecorator('allMoney', {
                      initialValue: this.calculateAllMoney(formData),
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              )}
              {isStockCard && (
                <span>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='账面余额(元)'>
                      {getFieldDecorator('allMoney', {
                        initialValue: this.calculateAllMoney(formData),
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='押金'>
                      {getFieldDecorator('cardDeposit',{
                        initialValue: formData.cardDeposit,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                </span>
              )}
              {isYearCard && (
                <Col span={12}>
                  <FormItem {...formItemLayout} label='手环号'>
                    {getFieldDecorator('wristStrapNo',{
                      initialValue: formData.wristStrapNo,
                    })(<Input disabled={!(editable || replaceBracelet)} />)}
                  </FormItem>
                </Col>
              )}
            </Form>
          </Row>
          <Row>
            <Col span={24}>
              <Camera onPush={this.onPush} img={this.state.imageBase64} />
            </Col>
          </Row>
          <Row>
            {isStockCard && <Col><StockRechargeRecord visible={isStockCard} cardNo={formData.cardNo} /></Col>}
            <Col align='center' style={{ marginTop: isStockCard ? 24 : 0 }}>
              <Button onClick={() => this.goBack()}>取消</Button>
              {(editable || (replaceBracelet && formData.cardType === 1)) && (
                <Button onClick={() => this.handleSubmit()} style={{ marginLeft: 5 }}>确定</Button>
              )}
            </Col>
          </Row>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default index;
