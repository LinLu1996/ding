import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Card, Row, Col, Button, Table, Select,Input,Divider } from 'antd';
import moment from 'moment';
import styles from './index.less';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import Authorized from '../../utils/Authorized';
import { noMatch } from '../../utils/authority';
import {message} from "antd/lib/index";
import Ellipsis from '../../components/Ellipsis';

const FormItem = Form.Item;

@Form.create()
@connect(({ ticket, loading }) => ({
  ticket,
  loading: loading.models.reduction,
}))
class Reduction extends Component {
  action = {
    queryList: 'ticket/fetchQueryTicketAdjust',
    getSprotName: 'ticket/fetchGetSprotName',
    getCourtName: 'ticket/fetchGetCourtName',
    getUpperList: 'ticket/fetchGetUpperList',
    setSearch: 'ticket/fetchSetSearch',
    toAddPage: '/ticket/ticketList/add',
  };

  componentDidMount() {
    const {dispatch,ticket:{pageNo, pageSize, sportItemId, applyCourt, ticketName, saleStatus}} = this.props;
    // 获取项目类型
    dispatch({
      type: this.action.getSprotName,
    });

    // 获取场地下拉列表
    dispatch({
      type: this.action.getCourtName,
    });

    // 获取上下架下拉列表
    dispatch({
      type: this.action.getUpperList,
    });

    // 获取列表
    const params = {
      pageNo,
      pageSize,
      sportItemId:sportItemId===undefined || sportItemId==="全部"?null:sportItemId,
      applyCourt:applyCourt===undefined || applyCourt==="全部"?null:applyCourt,
      ticketName:ticketName===undefined ?null:ticketName,
      saleStatus:saleStatus===undefined || saleStatus==="全部"?null:saleStatus,
    };
    dispatch({
      type: this.action.queryList,
      payload: params,
    });
  }

  /**
   * @Description: 减免项及扣除列表查询
   * @author Lin Lu
   * @date 2018/12/13
   */
  handleSearch = e => {
    e.preventDefault();
    this.checkFormAndSubmit();
  };

  // 分页
  handleTableChange = (current, pageSize) => {
    this.checkFormAndSubmit(current, pageSize);
  };

  /**
   * @Description: 查询
   * @author Lin Lu
   * @date 2019/1/2
   */
  checkFormAndSubmit = (current,pageS) => {
    const { dispatch, form,} = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const params = {
        pageNo:current?current:1,
        pageSize:pageS?pageS:10,
        sportItemId:values.sportItemId===undefined || values.sportItemId==="全部"?null:values.sportItemId,
        applyCourt:values.applyCourt===undefined || values.applyCourt==="全部"?null:values.applyCourt,
        ticketName:values.ticketName===undefined ?null:values.ticketName,
        saleStatus:values.saleStatus===undefined || values.saleStatus==="全部"?null:values.saleStatus,
      };
      dispatch({
        type: this.action.setSearch,
        payload: params,
      });
      dispatch({
        type: this.action.queryList,
        payload: params,
      });
    });
  };

  // 重置
  handleReset = () => {
    const { form,dispatch } = this.props;
    form.resetFields(['sportItemId','applyCourt','ticketName','saleStatus']);
    const params1 = {
      pageNo:1,
      pageSize:10,
      sportItemId:"全部",
      applyCourt:"全部",
      ticketName:null,
      saleStatus:"全部",
    };
    this.getApplyCourt("全部");
    dispatch({
      type: this.action.setSearch,
      payload: params1,
    });
    const params={
      pageNo:1,
      pageSize:10,
    }
    dispatch({
      type: this.action.queryList,
      payload: params,
    });
  }

  /**
   * @Description: 列表项选中取消
   * @author Lin Lu
   * @date 2018/12/14
   */
  handleSelectChange = selectedRowKeys => {
    this.setState({ selectedRow: selectedRowKeys});
  };

  // 出库入库
  handleStock = (name,record) =>{
    let pathname = '';
    let query = {};
    if (record.saleStatus===1) {
      message.error("请先下架，再进行出入库操作")
    }
    else {
      if(name==='in') {
        pathname = '/ticket/stockList/inStock';
        query = {
          id: record.id,
          type:'inStock'
        };
      } else if(name==='out') {
        pathname = '/ticket/stockList/outStock';
        query = {
          id: record.id,
          type:'outStock'
        };
      }
      router.push({
        pathname,
        query,
      });
    }

  }

  // 详情
  handleStockDetail = (record) =>{
    const pathname = '/ticket/stockList/stockDetail';
    const query = {
      id: record.id,
    };
    router.push({
      pathname,
      query,
    });
  }

  // 新增
  handleToAdd = () => {
    const pathname = '/ticket/ticketList/add';
    router.push({
      pathname,
    });
  }

  // 根据项目类型获取适用场地
  getApplyCourt = (e) => {
    const {dispatch, form} = this.props;
    dispatch({
      type:this.action.getCourtName,
      payload:{ sportItemId:e==='全部'? null: e }
    })
    form.setFieldsValue({
      applyCourt: '全部'
    })
  }

  // 表单
  renderSearchForm() {
    const {
      form: { getFieldDecorator },
      ticket:{sprotNameList,courtNameList,upperList,sportItemId,
      applyCourt,
      ticketName,
      saleStatus},
    } = this.props;
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
          <Form className={styles.reductionFrom} onSubmit={this.handleSearch} layout="inline">
            <Row gutter={24}>
              <Col span={9}>
                <FormItem
                  label='项目类型'
                  {...formItemLayout}
                >
                  {getFieldDecorator('sportItemId',{
                    initialValue:sportItemId===null ?'全部':sportItemId,
                  })(
                    <Select allowClear placeholder='请选择' onChange={this.getApplyCourt}>
                      <Select.Option key='全部' value='全部'>
                        全部
                      </Select.Option>
                      {sprotNameList && sprotNameList.length && sprotNameList.map(obj => (
                        <Select.Option key={obj.id} value={obj.id}>
                          {obj.itemName}
                        </Select.Option>
                      ))}
                    </Select>)}
                </FormItem>
              </Col>
              <Col span={9}>
                <FormItem
                  label='适用场地'
                  {...formItemLayout}
                >
                  {getFieldDecorator('applyCourt',{
                    initialValue:applyCourt===null ?'全部':applyCourt,
                  })(
                    <Select allowClear placeholder='请选择'>
                      <Select.Option key='全部' value='全部'>
                        全部
                      </Select.Option>
                      {courtNameList && courtNameList.length && courtNameList.map(obj => (
                        <Select.Option key={obj.id} value={obj.id}>
                          {obj.courtName}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={9}>
                <FormItem label='门票名称' {...formItemLayout}>
                  {getFieldDecorator('ticketName',{
                    initialValue:ticketName
                  })(
                    <Input />
                  )}
                </FormItem>
              </Col>
              <Col span={9}>
                <FormItem
                  label='上下架'
                  {...formItemLayout}
                >
                  {getFieldDecorator('saleStatus',{
                    initialValue: saleStatus===null ?'全部':saleStatus,
                  })(<Select allowClear placeholder='请选择'>
                    <Select.Option key='全部' value='全部'>
                      全部
                    </Select.Option>
                    {upperList && upperList.length && upperList.map(obj => (
                      <Select.Option key={obj.code} value={obj.code}>
                        {obj.value}
                      </Select.Option>
                    ))}
                  </Select>)}
                </FormItem>
              </Col>
              <Col span={6} style={{textAlign:'right'}}>
                <Authorized authority='jis_platform_dc_ticket_stock_query' nomatch={noMatch()}>
                  <Button
                    htmlType='submit'
                    onClick={this.handleSearch}
                    className={styles.buttonColor}
                  >查询</Button>
                </Authorized>
                <Button
                  type="primary"
                  onClick={this.handleReset}
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
    const { ticket: { ticketAdjustList, pageSize, pageNo } } = this.props;

    const columns = [
      { width: 160, title: '项目类型', dataIndex: 'sportItemName', render: val => <Ellipsis length={8} tooltip>{val}</Ellipsis> },
      { width: 160, title: '门票名称', dataIndex: 'ticketName', render: val => <Ellipsis length={8} tooltip>{val}</Ellipsis> },
      { width: 160, title: '适用场地', dataIndex: 'applyCourtName', render: val => <Ellipsis lines={1} tooltip>{val}</Ellipsis> },
      { title: '超时计费金额', dataIndex: 'timeoutValue' },
      {
        title: '销售时间',
        dataIndex: 'ticketSalePrice',
        render:(text,record) => (
          <div>{`${record.applyTimeStart || ''}--${record.applyTimeEnd || ''}`}</div>
        )
      },
      { title: '售卖平台', dataIndex: 'machineType' },
      // {
      //   title: '适用日期范围',
      //   dataIndex: 'applyDateStart',
      //   render:(text,record) => (
      //     <div>{`${moment(record.applyDateStart).format('YYYY-MM-DD')}~${moment(record.applyDateEnd).format('YYYY-MM-DD')}`}</div>
      //   )
      // },
      {
        width: 80,
        title: '上下架',
        dataIndex: 'saleStatus',
        render: text => text && text === 1 ? '上架' : '下架',
      },
      // { title: '累计销量', dataIndex: 'totalSalesAmount' },
      { width: 90, title: '当前库存', dataIndex: 'currentStock' },
      {
        width: 200,
        title:"操作",
        key:"action",
        dataIndex: 'action',
        render: (text, record) =>
          <span>
            <Authorized authority='jis_platform_dc_ticket_stock_in' nomatch={noMatch()}>
              <a onClick={() => this.handleStock('in',record)}>入库</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='jis_platform_dc_ticket_stock_out' nomatch={noMatch()}>
              <a onClick={() => this.handleStock('out',record)}>出库</a>
            </Authorized>
            <Divider type="vertical" />
            <a onClick={() => this.handleStockDetail(record)}>详情</a>
          </span>
      }
    ];

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSearchForm()}</div>
          </div>
          <div>
            <Table
              loading={false}
              columns={columns}
              rowKey={record => record.id}
              dataSource={ticketAdjustList && ticketAdjustList.list}
              pagination={{
                current:pageNo,
                pageSize,
                defaultCurrent: pageNo,
                defaultPageSize: pageSize,
                total: ticketAdjustList && ticketAdjustList.total,
                onChange: this.handleTableChange,
              }}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Reduction;
