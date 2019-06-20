import React, { Component } from 'react';
import { Modal, Form, InputNumber } from 'antd';

/**
 * @author turing
 */

@Form.create()
class SetPrice extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onOk = (form) => {
    const { onOk } = this.props;
    form.validateFieldsAndScroll(['price'], (errors, values) => {
      if (!errors) {
        onOk(values.price);
      }
    });
  };

  onCancel = (form) => {
    const { onCancel } = this.props;
    form.resetFields();
    onCancel();
  };

  render() {
    const { form, visible } = this.props;

    return (
      <Modal
        destroyOnClose
        title='价格设定'
        bodyStyle={{ paddingBottom: 0 }}
        visible={visible}
        okText='设定'
        onOk={() => this.onOk(form)}
        onCancel={() => this.onCancel(form)}
      >
        <Form>
          <Form.Item>
            {form.getFieldDecorator('price', {
              rules: [{ required: true, message: '请输入价格' }],
            })(
              <InputNumber min={0} precision={2} placeholder='请输入价格' style={{ width: '100%' }} />
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export default SetPrice;
