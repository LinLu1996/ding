import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Form, Select, Table } from 'antd';

/**
 * @author turing
 */

@connect(({ usageStatus, loading }) => ({
  data: usageStatus,
  loading: loading.models.usageStatus,
}))
@Form.create()
class index extends Component {
  componentDidMount() {
    this.initialCentralizedCtrlList();
  }

  /**
   * 初始化集控器列表
   */
  initialCentralizedCtrlList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'usageStatus/initialCentralizedCtrlList',
    }).then(() => {
      // tab：箱子状态
      const { data: { initial: { centralizedCtrlList } } } = this.props;
      if (centralizedCtrlList.length > 0) {
        this.initialWardrobeNoList(centralizedCtrlList[0].id);
      }
    });
  };

  /**
   * 加载衣柜列表
   * @param centralizedCtrl 集控器编号
   */
  initialWardrobeNoList = (centralizedCtrl) => {
    const { dispatch, form } = this.props;
    form.setFieldsValue({ centralizedCtrl });
    dispatch({
      type: 'usageStatus/initialWardrobeNoList',
      payload: { centralizedCtrl },
    });
  };

  render() {
    const { form, data, loading } = this.props;

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
    const pagination = {
      ...data.paginationProps,
      // onChange: this.onPaginationChange,
      // onShowSizeChange: this.onPaginationChange,
    };
    const columns = [
      { title: '衣柜编号', dataIndex: 'name' },
      {
        title: '衣柜状态',
        dataIndex: 'useStatus',
        render: value => value ? '未使用' : '使用中',
      },
      { title: '使用凭证', dataIndex: 'userKey' },
    ];

    return (
      <Fragment>
        <Form onSubmit={this.onSearchParamsChange}>
          <Row>
            <Col span={8}>
              <Form.Item {...formItemLayout} label='集控器'>
                {form.getFieldDecorator('centralizedCtrl')(
                  <Select onChange={this.initialWardrobeNoList} disabled={loading}>
                    {data.initial.centralizedCtrlList.map(item =>
                      <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                    )}
                  </Select>
                )}
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Table
          rowKey='id'
          loading={loading}
          columns={columns}
          pagination={false}
          dataSource={data.initial.wardrobeNoList}
        />
      </Fragment>
    );
  }
}

export default index;
