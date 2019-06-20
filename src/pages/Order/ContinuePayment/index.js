import React, { Component } from 'react';
import { Modal, Form, Input, Tag } from 'antd';
import request from '../../../utils/request';
import { handleResponse } from '../../../utils/globalUtils';

const FormItem  = Form.Item;

/**
 * @author turing
 */

@Form.create()
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPayType: undefined,
      payment: [],
      paymentMode: undefined,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.type) {
      this.initialPayment(this.getPaymentType(nextProps.type));
    }
  }

  componentWillUnmount() {
    this.setState({
      payment: [],
      paymentMode: undefined,
    });
  }

  /**
   * 获取付款方式
   * @param type 订单类型()
   */
  initialPayment = (type) => {
    const { currentPayType } = this.state;
    if (type && type !== currentPayType) {
      this.setState({ currentPayType: type });
      request(`/venuebooking/paymentMethod/getPayment?type=${type}`)
        .then(response => {
          if (handleResponse(response)) {
            this.setState({
              payment: response.data,
              paymentMode: response.data.length > 0 ? response.data[0].code : undefined,
            });
          }
        });
    }
  };

  getPaymentType = (orderType) => {
    switch (orderType) {
      case 1:
        // 购票
        return 1;
      case 2:
        // 订场
        return null;
      case 3:
        // 购卡
        return 3;
      case 4:
        // 押金
        return null;
      case 5:
        // 超时
        return 2;
      case 6:
        // 充值
        return 4;
      case 7:
        // 退卡
        return 1;
      case 8:
        // 团体票
        return null;
      case 9:
        // 补卡
        return 5;
      default:
        return null;
    }
  };

  onPayMethodChange = (code) => {
    this.setState({ paymentMode: code });
  };

  handleSubmit = (e) => {
    if (e)
      e.preventDefault();
    const { form, onOk } = this.props;
    const { paymentMode } = this.state;
    form.validateFieldsAndScroll((errors, values) => {
      if (!errors) {
        const params = {...values, paymentMode};
        onOk(params);
      }
    });
  };

  render() {
    const { form, visible, onCancel } = this.props;
    const { payment, paymentMode } = this.state;

    const payItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 4 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 20 } },
    };

    return (
      <Modal
        title="继续支付"
        closable={false}
        destroyOnClose
        visible={visible}
        onOk={() => this.handleSubmit()}
        onCancel={onCancel}
      >
        <Form onSubmit={this.handleSubmit}>
          <FormItem {...payItemLayout} label="支付方式">
            {payment.map(item =>
              <Tag.CheckableTag
                style={{ padding: "15px 19px", fontWeight: 500, lineHeight: 0, fontSize: 14, border: '1px solid #d9d9d9' }}
                key={item.id}
                checked={paymentMode === item.code}
                onChange={() => this.onPayMethodChange(item.code)}
              >
                {item.name}
              </Tag.CheckableTag>
            )}
          </FormItem>
          {paymentMode === "2" && (
            <FormItem {...payItemLayout} label="会员卡号">
              {form.getFieldDecorator("cardNo", {
                rules: [{ required: true, message: "请输入会员卡号" }],
              })(
                <Input placeholder="请输入会员卡号" />
              )}
            </FormItem>
          )}
        </Form>
      </Modal>
    );
  }
}

export default index;
