import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Card, Row, Col, Button, Table, Select,Input,Divider,message } from 'antd';
import moment from 'moment';
import styles from './index.less';
import Ellipsis from '../../components/Ellipsis';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import Authorized from '../../utils/Authorized';
import { noMatch } from '../../utils/authority';
import { renderCardTypeString } from '../../utils/globalUtils';

const FormItem = Form.Item;

@Form.create()
@connect(({ card, loading }) => ({
  card,
  loading: loading.models.reduction,
}))
class Reduction extends Component {
  action = {
    queryList: 'card/fetchQueryCardAdjust',
    getApplicableItems: 'card/fetchGetApplicableItems',
    toAddPage: '/card/cardList/add',
    setSearch: 'card/fetchSetSearch',
  };


  componentDidMount() {
    const {dispatch,card:{pageNo, pageSize,cardType,applySportItem, cartName}} = this.props;
    // 获取适用项目
    dispatch({
      type: this.action.getApplicableItems,
    });

    // 获取列表
    const params = {
      pageNo,
      pageSize,
      cardType:cardType===undefined || cardType==="全部"?null:cardType,
      applySportItem:applySportItem===undefined || applySportItem==="全部"?null:applySportItem,
      cartName:cartName===undefined ?null:cartName,
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
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const params = {
        pageNo:current?current:1,
        pageSize:pageS?pageS:10,
        cardType:values.cardType===undefined || values.cardType==="全部"?null:values.cardType,
        applySportItem:values.applySportItem===undefined || values.applySportItem==="全部"?null:values.applySportItem,
        cartName:values.cartName===undefined ?null:values.cartName,
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
    form.resetFields(['cardType','applySportItem','cartName']);
    const params1 = {
      pageNo:1,
      pageSize:10,
      cardType:"全部",
      applySportItem:"全部",
      cartName:null,
    };
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
        pathname = '/card/stockList/inStock';
        query = {
          id: record.id,
          type:'inStock'
        };
      } else if(name==='out') {
        pathname = '/card/stockList/outStock';
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

  // 新增
  handleToAdd = () => {
    const pathname = '/card/cardList/add';
    router.push({
      pathname,
    });
  }

  // 详情
  handleStockDetail = (record) =>{
    const pathname = '/card/stockList/stockDetail';
    const query = {
      id: record.id,
    };
    router.push({
      pathname,
      query,
    });
  }

  // 表单
  renderSearchForm() {
    const {
      form: { getFieldDecorator },
      card:{applicableItemsList,cardType,applySportItem,cartName},
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
              <Col span={8}>
                <FormItem
                  label='卡类型'
                  {...formItemLayout}
                >
                  {getFieldDecorator('cardType',{
                    initialValue:cardType===null ?'全部':cardType,
                  })(
                    <Select allowClear placeholder='请选择'>
                      <Select.Option key='全部' value='全部'>全部</Select.Option>
                      <Select.Option key={1} value={1}>年卡</Select.Option>
                      <Select.Option key={2} value={2}>储值卡</Select.Option>
                      <Select.Option key={3} value={3}>次卡</Select.Option>
                    </Select>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label='适用项目'
                  {...formItemLayout}
                >
                  {getFieldDecorator('applySportItem',{
                    initialValue:applySportItem===null ?'全部':applySportItem,
                  })(
                    <Select allowClear placeholder='请选择'>
                      <Select.Option key='全部' value='全部'>
                        全部
                      </Select.Option>
                      {applicableItemsList && applicableItemsList.length && applicableItemsList.map(obj => (
                        <Select.Option key={obj.id} value={obj.id}>
                          {obj.itemName}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label='卡名称' {...formItemLayout}>
                  {getFieldDecorator('cartName',{
                    initialValue:cartName,
                  })(
                    <Input placeholder='请输入卡名称' />
                  )}
                </FormItem>
              </Col>
            </Row>
            <div style={{ overflow: 'hidden',width:'100%' }}>
              <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={4} offset={20} style={{textAlign:'right'}}>
                  <Authorized authority='jis_platform_dc_card_stock_query' nomatch={noMatch()}>
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
            </div>
          </Form>
        </div>
      </div>
    );
  }


  render() {
    const { card: { ticketAdjustList,pageSize,pageNo } } = this.props;

    const columns = [
      {
        title: '卡类型',
        dataIndex: 'cardType',
        render: val => renderCardTypeString(val),
      },
      {
        title: '卡名称',
        dataIndex: 'cartName',
        render: val => <Ellipsis tooltip length={8}>{val}</Ellipsis>,
      },
      // {
      //   title: '适用项目',
      //   dataIndex: 'applySportItemName',
      // },
      // {
      //   title: '卡面价格(元)',
      //   dataIndex: 'cardViewPrice',
      // },
      // {
      //   title: '销售价格(元)',
      //   dataIndex: 'cardSalePrice',
      // },
      {
        title: '上下架',
        dataIndex: 'saleStatus',
        render:(text) => (
          <div>{text && text===1?'上架':'下架'}</div>
        )
      },
      {
        title: '累计销量',
        dataIndex: 'totalSalesAmount',
      },
      {
        title: '当前库存',
        dataIndex: 'currentStock',
      },
      {
        title:"操作",
        key:"action",
        dataIndex: 'action',
        width: 200,
        render: (text, record) =>
          <span>
            <Authorized authority='jis_platform_dc_card_stock_in' nomatch={noMatch()}>
              <a onClick={() => this.handleStock('in',record)}>入库</a>
            </Authorized>
            <Divider type="vertical" />
            <Authorized authority='jis_platform_dc_card_stock_out' nomatch={noMatch()}>
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
          <div className={styles.resTable}>
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
