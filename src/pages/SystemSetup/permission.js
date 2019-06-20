import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Card, Row, Col, Button, Table,Input } from 'antd';
import styles from './index.less';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import Authorized from '../../utils/Authorized';
import { noMatch } from '../../utils/authority';

const FormItem = Form.Item;

@Form.create()
@connect(({ systemSet, loading }) => ({
  systemSet,
  loading: loading.models.reduction,
}))
class Reduction extends Component {
  componentDidMount() {
    this.onPaginationPropsChange(1, 10);
  }

  onPaginationPropsChange = (current, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'systemSet/onPaginationPropsChange',
      payload: {
        current,
        pageSize,
      },
    }).then(() => {
      this.fetchList();
    });
  };

  onSearchParamsChange = () => {
    const { dispatch, form } = this.props;
    form.validateFields((errors, values) => {
      if (!errors) {
        dispatch({
          type: 'systemSet/onSearchParamsChange',
          payload: { ...values },
        }).then(() => {
          this.onPaginationPropsChange(1, 10);
        });
      }
    });
  };

  onFormFieldsReset = () => {
    const { dispatch, form } = this.props;
    form.resetFields();
    dispatch({
      type: 'systemSet/onSearchParamsChange',
      payload: { name: undefined, contactTel: undefined },
    }).then(() => {
      this.onPaginationPropsChange(1, 10);
    });
  };

  fetchList = () => {
    const { dispatch, systemSet: { searchParams: { name, contactTel }, paginationProps: { current, pageSize } } } = this.props;
    dispatch({
      type: 'systemSet/fetchQueryPermission',
      payload: { name, contactTel, pageNo: current, pageSize },
    });
  };

  /**
   * @Description: 门票管理列表查询
   * @author Lin Lu
   * @date 2018/12/13
   */
  handleSearch = e => {
    e.preventDefault();
    this.checkFormAndSubmit();
  };

  // 分页
  // handleTableChange = (current, pageSize) => {
  //   this.setState(
  //     {
  //       current,
  //       pageSize,
  //     },
  //     () => {
  //       this.checkFormAndSubmit();
  //     }
  //   );
  // };

  /**
   * @Description: 查询
   * @author Lin Lu
   * @date 2019/1/2
   */
  checkFormAndSubmit = () => {
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const params = {
        ...values,
        enterpriseId:1
      };
      dispatch({
        type: this.action.queryList,
        payload: params,
      });
    });
  };

  // 重置
  handleReset = () => {
    const { form,dispatch } = this.props;
    form.resetFields();
    dispatch({
      type: this.action.queryList,
      payload: { enterpriseId:1 },
    });
  };

  // 编辑
  handleToSet = (record) => {
    const pathname = '/systemSet/permission/set';
    let query = {};
    if(record) {
       query = {
        id: record.id,
         name:record.fullname,
         contactTel:record.mobile,
      };
    }
    router.push({
      pathname,
      query,
    });
  }

  // 表单
  renderSearchForm() {
    const { form: { getFieldDecorator }, systemSet: { searchParams: { name, contactTel } } } = this.props;
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
    return (
      <div className={styles.tableList}>
        <div>
          <Form className={styles.reductionFrom} layout="inline">
            <Row gutter={24}>
              <Col span={8}>
                <FormItem label='姓名' {...formItemLayout}>
                  {getFieldDecorator('name',{
                    initialValue: name,
                  })(<Input placeholder='请输入姓名' />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label='联系方式' {...formItemLayout}>
                  {getFieldDecorator('contactTel',{
                    initialValue: contactTel,
                  })(<Input placeholder='请输入联系方式' />)}
                </FormItem>
              </Col>
              <Col span={4} offset={4} style={{textAlign:'right'}}>
                <Authorized authority='jis_platform_dc_system_power_query' nomatch={noMatch()}>
                  <Button onClick={() => this.onSearchParamsChange()} className={styles.buttonColor}>查询</Button>
                </Authorized>
                <Button
                  onClick={() => this.onFormFieldsReset()}
                  className={styles.buttonColor}
                  style={{marginLeft:5}}
                >
                  重置
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }


  render() {
    const { systemSet: { permissionList, paginationProps, list } } = this.props;

    const pagination = {
      ...paginationProps,
      onChange: this.onPaginationPropsChange,
      onShowSizeChange: this.onPaginationPropsChange,
    };
    const columns = [
      { title: '姓名', dataIndex: 'fullname' },
      { title: '联系方式', dataIndex: 'mobile' },
      {
        title:"权限",
        key:"action",
        dataIndex: 'action',
        render: (text, record) =>
          <span>
            <Authorized authority='jis_platform_dc_system_power_set' nomatch={noMatch()}>
              <a onClick={() => this.handleToSet(record)}>设置</a>
            </Authorized>
          </span>
      }
    ];
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSearchForm()}</div>
          </div>
          <div className={styles.resTable}>
            <Table
              loading={false}
              columns={columns}
              rowKey={record => record.id}
              dataSource={list}
              pagination={pagination}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Reduction;
