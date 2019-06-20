import React, { Component } from 'react';
import { Modal, Button, Input, Form, Spin, message } from 'antd';
import { stringify } from 'qs';
import request from '../../utils/request';
import { handleResponse } from '../../utils/globalUtils';

/**
 * @param visible
 * @param orderNo
 * @param goodName
 * @param deviceCode
 * @param sourceType （卡充值使用，默认1）
 * @param validDate （卡充值使用，有效期）
 * @function onOk 付款成功回调
 * @function onCancel 取消付款
 *
 * @author turing
 */

@Form.create()
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      times: 0,
      payUrl: '', // 支付请求地址
      payResultQueryUrl: '', // 轮询接口
    };
  }

  componentDidMount() {
    this.getPayUrl();
  }

  /**
   * 生产环境获取支付请求域名
   */
  getPayUrl = () => {
    request("/venuebooking/dictionaries/findPayHead")
      .then(response => {
        if (handleResponse(response)) {
          this.setState({
            payUrl: response.data.payUrl,
            payResultQueryUrl: response.data.payResultQueryUrl,
          });
        }
      });
  };

  handleSubmit = (e) => {
    if (e)
      e.preventDefault();
    const { form, param } = this.props;
    form.validateFields((errors, values) => {
      if (!errors) {
        const params = { ...param, ...values };
        this.toWxPay(params);
      }
    });
  };

  /**
   * 商家扣款
   * @param params (authCode: 微信/支付宝 支付码, orderNo: 久事订单号, goodsName: 商品名称, deviceCode: 设备号)
   */
  toWxPay = (params) => {
    this.setState({ loading: true });
    const { payUrl } = this.state;
    request(`${payUrl}?${stringify(params)}`)
      .then(response => {
        if (response) {
          const { onCancel } = this.props;
          switch (response.code) {
            case 200:
              message.success('交易成功');
              this.paySuccess(params.orderNo);
              break;
            case 70001:
              // 交易失败
              message.error('交易失败');
              // this.signOrder(params.orderNo, 3);
              onCancel();
              break;
            case 70002:
              // 轮询
              this.setState({ times: 0 }, () => this.pollingOrder(params.orderNo, params.methodCode));
              break;
            case 70003:
              // 交易失败，
              message.error("交易失败");
              // this.signOrder(params.orderNo, 3);
              onCancel();
              break;
            default:
              break;
          }
        }
        this.setState({ loading: false });
      });
  };

  /**
   * 扣款成功
   * @param orderNo
   */
  paySuccess = (orderNo) => {
    this.signOrder(orderNo, 2);
    const { onOk } = this.props;
    onOk();
  };

  /**
   * 扣款失败轮询订单
   */
  pollingOrder = (orderNo, methodCode) => {
    const { times } = this.state;
    // 最多轮询5次
    if (times < 6) {
      this.setState({ loading: true, times: Number(times) + 1 });
      const { payResultQueryUrl } = this.state;
      request(`${payResultQueryUrl}?methodCode=${methodCode}&orderNo=${orderNo}`)
        .then(response => {
          let closeLoading = true;
          if (response) {
            switch (response.code) {
              case 200:
                message.success('交易成功');
                this.paySuccess(orderNo);
                break;
              case 70004:
                // message.error("交易失败");
                closeLoading = false;
                setTimeout(() => {
                  this.pollingOrder(orderNo);
                }, 5000);
                break;
              default:
                break;
            }
          }
          if (closeLoading) {
            this.setState({ loading: false });
          }
        });
    } else {
      const { onCancel } = this.props;
      message.error('交易失败');
      // this.signOrder(orderNo, 3);
      onCancel();
    }
  };

  /**
   * 标记订单成功/失败
   * @param orderNo 久事订单号
   * @param paymentStatus 已支付(2) 已取消(3)
   */
  signOrder = (orderNo, paymentStatus) => {
    const { sourceType, validDate } = this.props;
    request(`/venuebooking/order/successByOrderNum?${stringify({ orderNo, paymentStatus, sourceType, validDate })}`);
  };

  render() {
    const { form, onCancel, visible } = this.props;
    const { loading } = this.state;

    return (
      <Modal
        title='扫码支付'
        keyboard={false}
        closable={false}
        maskClosable={false}
        visible={visible}
        destroyOnClose
        footer={[
          <Button onClick={onCancel} disabled={loading}>取消</Button>,
          <Button onClick={() => form.resetFields()} disabled={loading}>重置</Button>,
          <Button onClick={() => this.handleSubmit()} loading={loading}>确定</Button>,
        ]}
      >
        <Spin spinning={loading}>
          <Form onSubmit={this.handleSubmit}>
            <Form.Item>
              {form.getFieldDecorator('authCode', {
                rules: [
                  { required: true, message: '请扫码或输入18位数字条形码' },
                  // { pattern: '^1[0-5]\\d{16}$', message: '条码格式错误' },
                ],
              })(
                <Input maxLength={18} autoFocus placeholder='请扫码或输入18位数字条形码' />
              )}
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    );
  }
}

export default index;
