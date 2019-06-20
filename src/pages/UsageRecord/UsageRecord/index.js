import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Form, Select, Button, DatePicker, Table, Input } from 'antd';
import moment from 'moment';
import { noMatch } from '../../../utils/authority';
import Authorized from '../../../utils/Authorized';

/**
 * @author turing
 */

@connect(({ usageRecord, loading }) => ({
  data: usageRecord,
  loading: loading.models.usageRecord,
}))
@Form.create()
class index extends Component {
  componentDidMount() {
    this.initialCentralizedCtrlList();
    this.onSearchParamsChange();
  }

  /**
   * 初始化集控器列表
   */
  initialCentralizedCtrlList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'usageRecord/initialCentralizedCtrlList',
    })/* .then(() => {
      // tab：查询箱子使用记录
      const { data: { initial: { centralizedCtrlList } } } = this.props;
      if (centralizedCtrlList.length > 0) {
        this.initialWardrobeNoList(centralizedCtrlList[0].id);
      }
    }) */;
  };

  /**
   * 加载衣柜列表
   * @param centralizedCtrl 集控器编号
   */
  initialWardrobeNoList = (centralizedCtrl) => {
    const { dispatch, form } = this.props;
    form.setFieldsValue({ centralizedCtrl, wardrobeNo: null });
    dispatch({
      type: 'usageRecord/initialWardrobeNoList',
      payload: { centralizedCtrl },
    })/* .then(() => {
      const { data: { initial: { wardrobeNoList } } } = this.props;
      if (wardrobeNoList.length > 0) {
        form.setFieldsValue({ wardrobeNo: wardrobeNoList[0].id });
        this.onSearchParamsChange();
      }
    }) */;
  };

  onSearchParamsChange = (e) => {
    if (e)
      e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFieldsAndScroll((errors, values) => {
      if (!errors) {
        dispatch({
          type: 'usageRecord/onSearchParamsChange',
          payload: { ...values },
        }).then(() => {
          // this.onPaginationChange(1, 10);
          this.fetchList();
        });
      }
    });
  };

  onPaginationChange = (current, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'usageRecord/onPaginationChange',
      payload: { current, pageSize },
    }).then(() => {
      this.fetchList();
    });
  };

  fetchList = () => {
    const { dispatch, data: { paginationProps: { current, pageSize }, searchParams } } = this.props;
    dispatch({
      type: 'usageRecord/fetchList',
      payload: { ...searchParams, current, pageSize },
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
      onChange: this.onPaginationChange,
      onShowSizeChange: this.onPaginationChange,
    };
    const columns = [
      { title: '衣柜编号', dataIndex: 'boxName' },
      { title: '开箱时间', dataIndex: 'boxBindTime' },
      { title: '释放时间', dataIndex: 'outTime' },
      { title: '用户凭证', dataIndex: 'userId' },
    ];

    return (
      <Fragment>
        <Form onSubmit={this.onSearchParamsChange}>
          <Row>
            <Col span={8}>
              <Form.Item {...formItemLayout} label='集控器'>
                {form.getFieldDecorator('centralizedCtrl', {
                  initialValue: data.searchParams.centralizedCtrl,
                })(
                  <Select onChange={this.initialWardrobeNoList}>
                    <Select.Option value={null}>全部</Select.Option>
                    {data.initial.centralizedCtrlList.map(item =>
                      <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                    )}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item {...formItemLayout} label='衣柜编号'>
                {form.getFieldDecorator('wardrobeNo', {
                  initialValue: data.searchParams.wardrobeNo,
                })(
                  <Select>
                    <Select.Option value={null}>全部</Select.Option>
                    {data.initial.wardrobeNoList.map(item =>
                      <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
                    )}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item {...formItemLayout} label='用户凭证'>
                {form.getFieldDecorator('userKey', {
                  initialValue: data.searchParams.userKey,
                })(
                  <Input placeholder='请扫描或输入卡号' />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item {...formItemLayout} label='开始时间'>
                {form.getFieldDecorator('startTime', {
                  initialValue: data.searchParams.startTime ? moment(data.searchParams.startTime) : undefined,
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format='YYYY-MM-DD HH:mm'
                    showTime={{ defaultValue: moment('00:00:00', 'HH:mm') }}
                    allowClear
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item {...formItemLayout} label='结束时间'>
                {form.getFieldDecorator('endTime', {
                  initialValue: data.searchParams.endTime ? moment(data.searchParams.endTime) : undefined,
                })(
                  <DatePicker
                    style={{ width: '100%' }}
                    format='YYYY-MM-DD HH:mm'
                    showTime={{ defaultValue: moment('23:59:59', 'HH:mm') }}
                    allowClear
                  />
                )}
              </Form.Item>
            </Col>
            <Authorized authority='jis_platform_dc_usageRecord_records_query' nomatch={noMatch()}>
              <Col span={8}>
                <Form.Item>
                  <Button loading={loading} htmlType='submit'>查询</Button>
                </Form.Item>
              </Col>
            </Authorized>
          </Row>
        </Form>
        <Table
          rowKey='id'
          loading={loading}
          columns={columns}
          pagination={false}
          dataSource={data.list}
        />
      </Fragment>
    );
  }
}

export default index;
