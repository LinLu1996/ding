import React, { Component } from 'react';
import { Row, Col, Form, Radio, Input, Button } from 'antd';
import styles from './index.less';
import Authorized from '../../../utils/Authorized';
import { noMatch } from '../../../utils/authority';

const FormItem = Form.Item;

/**
 * @author jiangt
 */

@Form.create()
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fieldName: undefined,
    };
  }

  componentWillUnmount() {
    this.setState({ fieldName: undefined });
  }

  handleSubmit = (e) => {
    if (e) e.preventDefault();
    const { form } = this.props;
    const { fieldName } = this.state;
    form.validateFieldsAndScroll([fieldName], (errors, values) => {
      if (!errors) {
        const { onOk } = this.props;
        onOk(values);
      }
    });
  };

  resetForm = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({ fieldName: undefined });
  };

  changeFormItemField = (fieldName) => {
    this.setState({ fieldName });
  };

  renderFormLabel = (field, title) => {
    const { fieldName } = this.state;
    return <Radio checked={field === fieldName} onChange={() => this.changeFormItemField(field)}>{title}</Radio>;
  };

  render() {
    const { form } = this.props;

    const formItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 8 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
    };

    return (
      <Row>
        <Form onSubmit={this.handleSubmit}>
          <Col span={6}>
            <FormItem className={styles.globalForm} {...formItemLayout} label={this.renderFormLabel('accurateTicket', '票')}>
              {form.getFieldDecorator('accurateTicket')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem className={styles.globalForm} {...formItemLayout} label={this.renderFormLabel('accurateTicketWristband', '票腕带')}>
              {form.getFieldDecorator('accurateTicketWristband')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem className={styles.globalForm} {...formItemLayout} label={this.renderFormLabel('accurateCard', '卡')}>
              {form.getFieldDecorator('accurateCard')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem className={styles.globalForm} {...formItemLayout} label={this.renderFormLabel('accurateCardWristband', '卡腕带')}>
              {form.getFieldDecorator('accurateCardWristband')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem className={styles.globalForm} {...formItemLayout} label={this.renderFormLabel('accurateWristband', '手环')}>
              {form.getFieldDecorator('accurateWristband')(
                <Input />
              )}
            </FormItem>
          </Col>
          <Col span={18} align='right'>
            <FormItem>
              <Authorized authority='jis_platform_dc_saleorder_query' nomatch={noMatch()}>
                <Button type="primary" htmlType='submit'>查询</Button>
              </Authorized>
              <Button onClick={() => this.resetForm()} style={{ marginLeft: 5 }}>重置</Button>
            </FormItem>
          </Col>
        </Form>
      </Row>
    );
  }
}

export default index;
