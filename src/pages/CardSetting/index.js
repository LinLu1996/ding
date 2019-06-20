import React, { Component } from 'react';
import { Card, Form, Input, Button, Table, Row, Col, Spin } from 'antd';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import request from '../../utils/request';
import { handleResponse, renderCardTypeString } from '../../utils/globalUtils';

/**
 * @author turing
 */

@Form.create()
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      list: [],
    };
  }

  handleSubmit = (e) => {
    this.setState({ loading: true });
    if (e)
      e.preventDefault();
    const { form, location: { pathname } } = this.props;
    form.validateFieldsAndScroll((errors, values) => {
      if (!errors) {
        const params = {
          ...values,
          cardType: this.getCardType(pathname),
        };
        request('/venuebooking/memberCard/enteringMemberCard', {
          method: 'POST',
          body: params,
        }).then(response => {
          if (handleResponse(response, true)) {
            const { list } = this.state;
            list.splice(0, 0, response.data);
          }
          form.setFieldsValue({ cardNo: undefined });
          this.setState({ loading: false });
        });
      } else {
        this.setState({ loading: false });
      }
    });
  };

  /**
   * 判断卡类型
   * @param pathname
   * @returns {number}
   */
  getCardType = (pathname) => {
    let cardType = -1;
    if (pathname.indexOf('yearCard') > -1) {
      // 年卡
      cardType = 1;
    }
    if (pathname.indexOf('storedCard') > -1) {
      // 储值卡
      cardType = 2;
    }
    if (pathname.indexOf('subCard') > -1) {
      // 次卡
      cardType = 3;
    }
    return cardType;
  };

  render() {
    const { form } = this.props;
    const { loading, list } = this.state;

    const columns = [
      { title: '卡号', dataIndex: 'cardNo' },
      {
        title: '卡类型',
        dataIndex: 'cardType',
        render: value => renderCardTypeString(value),
      },
      { title: '卡状态', dataIndex: 'cardStatusString' },
    ];

    return (
      <PageHeaderWrapper>
        <Card>
          <Row gutter={8}>
            <Form onSubmit={this.handleSubmit}>
              <Col md={8} sm={12} xs={16}>
                <Form.Item>
                  <Spin spinning={loading}>
                    {form.getFieldDecorator('cardNo')(
                      <Input autoFocus placeholder='请扫描或输入卡号' />
                    )}
                  </Spin>
                </Form.Item>
              </Col>
              <Col md={16} sm={12} xs={8}>
                <Form.Item>
                  <Button loading={loading} htmlType='submit'>确认</Button>
                </Form.Item>
              </Col>
            </Form>
          </Row>
          <Table
            rowKey='cardNo'
            columns={columns}
            pagination={false}
            dataSource={list}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default index;
