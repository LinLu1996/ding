import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Card, Table, Button, Row, Col, Divider } from 'antd';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import AdvForm from './AdvForm';
import styles from './index.less';

/**
 * @author jiangt
 */

@connect(({ adv, loading }) => ({
  data: adv,
  loading: loading.models.adv,
}))
class index extends Component {
  componentDidMount() {
    this.onPaginationPropsChange(1, 10);
  }

  onPaginationPropsChange = (current, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'adv/onPaginationPropsChange',
      payload: { current, pageSize },
    }).then(() => {
      this.fetchList();
    });
  };

  fetchList = () => {
    const { dispatch, data: { paginationProps: { current, pageSize } } } = this.props;
    dispatch({
      type: 'adv/fetchList',
      payload: { pageNum: current, pageSize },
    });
  };

  onAdvFormChange = (visible, id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'adv/onAdvFormChange',
      payload: { visible, id },
    });
  };

  /**
   * 删除
   * @param ids
   */
  onDeleteAdvertisements = (ids) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'adv/onDeleteAdvertisements',
      payload: { ids },
    }).then(() => {
      const { data: { deleteResponse } } = this.props;
      if (deleteResponse && deleteResponse.code === 200) {
        this.onPaginationPropsChange(1, 10);
      }
    });
  };

  render() {
    const { data, loading } = this.props;

    const pagination = {
      ...data.pagination,
      onChange: this.onPaginationPropsChange,
    };
    const columns = [
      { dataIndex: 'imgName', title: '图片名称' },
      {
        dataIndex: 'imgUrl',
        title: '广告图片',
        render: value => <img alt="" src={value} style={{ width: 80, height: 80 }} />
      },
      { dataIndex: 'sort', title: '排序索引' },
      {
        width: 150,
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <a onClick={() => this.onAdvFormChange(true, record.id)}>编辑</a>
            <Divider type="vertical" />
            <a onClick={() => this.onDeleteAdvertisements([record.id])}>删除</a>
          </Fragment>
        )
      }
    ];

    return (
      <PageHeaderWrapper>
        <Card title="广告列表" bordered={false}>
          <Row>
            <Col><Button onClick={() => this.onAdvFormChange(true)}>新增</Button></Col>
          </Row>
          <Table
            className={styles.tableMarginTop}
            loading={loading}
            rowKey="id"
            pagination={pagination}
            columns={columns}
            dataSource={data.list}
          />
        </Card>
        <AdvForm
          visible={data.advForm.visible}
          id={data.advForm.id}
          onOk={() => {
            this.onAdvFormChange(false);
            this.fetchList();
          }}
          onCancel={() => this.onAdvFormChange(false)}
        />
      </PageHeaderWrapper>
    );
  }
}

export default index;
