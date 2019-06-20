import React, { Component } from 'react';
import { Form, Card, Input, DatePicker, Col, Row, Button, message, Modal, Tooltip, Tag, InputNumber } from 'antd';
import router from 'umi/router';
import moment from 'moment';
import { connect } from 'dva';
import classNames from 'classnames';
import styles from './index.less';
import Ellipsis from '../../components/Ellipsis';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import WxPay from '../../components/WxPay/BarCode';
import { handleResponse, renderCardTypeString } from '../../utils/globalUtils';

const FormItem = Form.Item;

@connect(({ card }) => ({
  card,
}))
@Form.create()
class replacement extends Component {
  action = {
    getRechargeInfo: 'card/fetchGetRechargeInfo',
    handleRecharge: 'card/fetchHandleRecharge',
    getPayType: 'card/fetchGetPayType',
  };

  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      cardNo: null,
      loading: false,
      currentPayType: 0,
      currentPay: '0',
      choosePayMent: null,// 选择的支付方式的code
      barVisible: undefined,
      orderNo: undefined,
      goodsName: undefined,
      deviceCode: undefined,
    };
  }

  componentDidMount() {
    const { dispatch, location } = this.props;
    if (location && location.search) {
      const { query } = location;
      this.setState({ ...query });
      // 获取支付方式
      dispatch({
        type: this.action.getPayType,
        payload: { type: 4 },
      });
      dispatch({
        type: this.action.getRechargeInfo,
        payload: { cardNo: query.cardNo },
      });
    }
  }

  // 取消
  handleCancel = () => {
    Modal.confirm({
      title: '提示',
      content: '是否放弃保存录入的内容？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.handleTolist(),
    });
  };

  handleTolist = () => {
    const pathname = `/cashier/saleList/list`;
    router.push({
      pathname,
    });
  };

  // 处理支付方式
  handlePayList = (e) => {
    this.setState({
      choosePayMent: e.code,
    });
  };

  handleSubmit = () => {
    const { form, dispatch, card: { applicableItemsList } } = this.props;
    const { checkedList, yearCard, cardNo, choosePayMent } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      if (choosePayMent === null) {
        message.warning('请选择支付方式');
        return;
      }
      this.setState({ loading: true });
      const params = {
        cardNo,
        paymentMode: choosePayMent,
        paymentAmount: values && values.paymentAmount,
        rechargeDeposit: values && values.rechargeDeposit,
        validDate: (values && values.validDate) ? moment(values.validDate).format('YYYY-MM-DD') : undefined,
      };
      dispatch({
        type: this.action.handleRecharge,
        payload: params,
      }).then(() => {
        this.setState({ loading: false });
        const { card: { chargeResponse } } = this.props;
        if (handleResponse(chargeResponse, choosePayMent !== "4")) {
          if (choosePayMent === "4") {
            this.onBarVisibleChange(true, chargeResponse.data.orderNo, chargeResponse.data.goodsName, chargeResponse.data.deviceCode);
          } else {
            this.handleTolist();
          }
        }
      });
    });
  };

  /**
   * 微信支付
   */
  onBarVisibleChange = (barVisible, orderNo, goodsName, deviceCode) => {
    this.setState({ barVisible, orderNo, goodsName, deviceCode });
  };

  render() {
    const { form, form: { getFieldDecorator }, card: { rechargeInfo, payTypeList } } = this.props;
    const { id, yearCard, currentPayType, choosePayMent, cardTableSelect } = this.state;
    const { barVisible, orderNo, goodsName, deviceCode } = this.state;
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
                      {getFieldDecorator('cardNo', {
                        initialValue: rechargeInfo && rechargeInfo.cardNo,
                      })(
                        <Input disabled />,
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='卡类型'>
                      {getFieldDecorator('cardType', {
                        initialValue:  renderCardTypeString(rechargeInfo && rechargeInfo.cardType),
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='姓名'>
                      {getFieldDecorator('memberName', {
                        initialValue: rechargeInfo && rechargeInfo.memberName,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='联系方式'>
                      {getFieldDecorator('memberTel', {
                        initialValue: rechargeInfo && rechargeInfo.memberTel,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='发行日期'>
                      {getFieldDecorator('issueDate', {
                        initialValue: rechargeInfo && rechargeInfo.issueDate,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='有效期限'>
                      {getFieldDecorator('validDate1', {
                        initialValue: rechargeInfo && rechargeInfo.validDate,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='当前余额'>
                      {getFieldDecorator('balance', {
                        initialValue: rechargeInfo && rechargeInfo.balance,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='充值后余额'>
                      {getFieldDecorator('hou', {
                        initialValue: rechargeInfo && rechargeInfo.balance && form.getFieldValue('paymentAmount') && (Number(form.getFieldValue('paymentAmount')) + Number(rechargeInfo.balance)).toFixed(2),
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='充值金额(元)'>
                      {getFieldDecorator('paymentAmount', {
                        rules: [
                          { required: true, message: '请输入充值金额' },
                          { pattern: /^\d{0,9}(?:\.\d{1,2})?$/, message: '请输入正确的格式(金额应是数字且小于999999999.99)' },
                        ],
                      })(<Input placeholder='请输入充值金额' />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='充值工本费'>
                      {getFieldDecorator('rechargeDeposit', {
                        rules: [{ required: true, message: '请输入充值金额' }],
                        initialValue: rechargeInfo && rechargeInfo.rechargeDeposit,
                      })(<InputNumber min={0} precision={2} style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='充值后有效期限'>
                      {getFieldDecorator('validDate', {
                        rules: [{ required: true, message: '请选择充值后有效期限' }],
                      })(<DatePicker style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <FormItem {...formItemLayout} label='支付方式'>
                      {getFieldDecorator('paymentMode')(
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
                        </div>)}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
          <Row style={{ marginBottom: 24 }}>
            <Col span={24} align="center">
              <Button type="primary" onClick={this.handleCancel} className={styles.buttonColor}>取消</Button>
              <Button
                onClick={() => this.handleSubmit()}
                style={{ marginLeft: 5 }}
                loading={this.state.loading}
                className={styles.buttonColor}
              >
                确认
              </Button>
            </Col>
          </Row>
        </Card>
        <WxPay
          visible={barVisible}
          orderNo={orderNo}
          goodsName={goodsName}
          deviceCode={deviceCode}
          sourceType={1}
          validDate={moment(form.getFieldValue("validDate")).format('YYYY-MM-DD')}
          onOk={() => {
            this.onBarVisibleChange(false);
            this.handleTolist();
          }}
          onCancel={() => this.onBarVisibleChange(false)}
        />
      </PageHeaderWrapper>
    );
  }
}

export default replacement;
