import React, { Component } from 'react';
import { Modal, Form, Row, Col, Input, Tag } from 'antd';
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
      payment: [],
      paymentMode: undefined,
    };
  }

  componentDidMount() {
    this.initialPayment();
  }

  /**
   * 获取付款方式
   */
  initialPayment = () => {
    request("/venuebooking/paymentMethod/getPayment?type=2")
      .then(response => {
        if (handleResponse(response)) {
          this.setState({
            payment: response.data,
            paymentMode: response.data.length > 0 ? response.data[0].code : undefined,
          });
        }
      });
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
    const { form, visible, params, onCancel } = this.props;
    const { payment, paymentMode } = this.state;

    const formItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 8 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
    };
    const payItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 8 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
    };

    return (
      <Modal
        width={860}
        destroyOnClose
        title="出场核销"
        visible={visible}
        onOk={() => this.handleSubmit()}
        onCancel={onCancel}
      >
        <Row>
          <Form onSubmit={this.handleSubmit}>
            <Col span={12}>
              <FormItem label="姓名" {...formItemLayout}>
                <span>{params.memberName}</span>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="联系方式" {...formItemLayout}>
                <span>{params.memberTel}</span>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="入场时间" {...formItemLayout}>
                <span>{params.inTime}</span>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="消费时长(分钟)" {...formItemLayout}>
                <span>{params.duration}</span>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="实际结束时间" {...formItemLayout}>
                <span>{params.outTime}</span>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="超时金额(元)" {...formItemLayout}>
                <span>{params.overConsumeAmount || 0}</span>
              </FormItem>
            </Col>
            {params.overConsumeAmount && params.overConsumeAmount > 0 && (
              <Col span={12}>
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
                    {form.getFieldDecorator("payCardNo", {
                      rules: [{ required: true, message: "请输入会员卡号" }],
                    })(
                      <Input placeholder="请输入会员卡号" />
                    )}
                  </FormItem>
                )}
              </Col>
            )}
          </Form>
        </Row>
      </Modal>
    );
  }
}

export default index;
