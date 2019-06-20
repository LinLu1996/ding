import React, { Component,Fragment } from 'react';
import { Form, Card, Input, DatePicker, Select, Col, Row, Table, Button, message,InputNumber,Checkbox,TimePicker } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import moment from 'moment';
import styles from './index.less';
import { connect } from 'dva';
import { renderTitle } from '../../utils/globalUtils';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import Ellipsis from '../../components/Ellipsis';

const FormItem = Form.Item;
const {MonthPicker} = DatePicker;
const {RangePicker} = DatePicker;
const CheckboxGroup = Checkbox.Group;
const { TextArea } = Input;

@Form.create()
@connect(({ card }) => ({
  card,
}))

export default class Stack extends Component {
  action = {
    queryList: 'card/fetchQueryTicket',
    getApplicableItems: 'card/fetchGetApplicableItems',
    getStockInfo: 'card/fetchGetStockInfo',
    getCurriculumTable: 'card/fetchGetCurriculumTable',
    handleSocket: 'card/fetchHandleSocket',
    toAddPage: '/card/cardList/add',
  };

  constructor(props) {
    super(props);
    const { card:{dictList} } = this.props;
    this.state = {
      dataSource: [],
      peopleNum:null,
      checkedList:[],
      loading:false
    };
  }

  componentDidMount() {
    const { dispatch, location } = this.props;
    // 获取适用项目
    dispatch({
      type: this.action.getApplicableItems,
    })

    if (location && location.search) {
      const { query } = location;
      this.setState({ ...query });
      // 获取卡管理履历列表
      dispatch({
        type: this.action.getCurriculumTable,
        payload:{ cardBasicInfoId:query.id,operatingType:query.type==='outStock'?2:1 }
      });

      // 获取出库入库详情
      dispatch({
        type:this.action.getStockInfo,
        payload:{ id:query.id },
      }).then((item) => {
        const { card:{stockList} } = this.props;
        const courtList = [];
        if(stockList && stockList.sportItem) {
          stockList.sportItem.forEach((item) => {
            courtList.push(parseInt(item))
          });
          this.setState({
            checkedList:courtList,
          })
        }
      })
    }
  }


  // 取消
  handleCancel = () => {
    router.go(-1);
  }


  render() {
    const { form: { getFieldDecorator },card:{applicableItemsList,stockList,curriculumTable} } = this.props;
    const { id } = this.state;
    const columns = [
      {
        title: '日期',
        dataIndex: 'operatingDate',
      },
      {
        title: '数量',
        dataIndex: 'operatingAmount',
        render: value => Number(value) > 0 ? `+${value}` : value,
      },
      {
        title: '库存量',
        dataIndex: 'latestAmount',
      },
      {
        title: '操作人',
        dataIndex: 'creator',
      },
      {
        title: '备注',
        dataIndex: 'remarks',
        render: value => <Ellipsis length={8} tooltip>{value}</Ellipsis>
      },
    ];
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
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.stockTableListForm}>
              <Row gutter={24}>
                <Col style={{ paddingBottom: 8 }}>{renderTitle('卡信息')}</Col>
              </Row>
              <Form layout='inline'>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='卡类型'
                    >
                      {getFieldDecorator('cardType',{
                        initialValue:stockList && stockList.cardType
                      })(
                        <Select disabled={true} allowClear placeholder='请选择' onChange={this.handleCartType}>
                          <Select.Option key={1} value={1}>
                            年卡
                          </Select.Option>
                          <Select.Option key={2} value={2}>
                            储值卡
                          </Select.Option>
                        </Select>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='卡名称'>
                      {getFieldDecorator('cartName',{
                        initialValue:stockList && stockList.cartName
                      })(
                        <Input disabled={true}/>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24}>
                    <FormItem
                      {...formItemLayout}
                      label='适用项目'
                    >
                      {getFieldDecorator('sportItem',{
                        initialValue:this.state.checkedList
                      })(
                        <Fragment>
                          <Checkbox.Group disabled={true} style={{display:'inline'}} value={this.state.checkedList}>
                            {
                              applicableItemsList && applicableItemsList.length>0 && applicableItemsList.map((item) => (
                                <Checkbox key={item.id} value={item.id}>{item.itemName}</Checkbox>
                              ))
                            }
                          </Checkbox.Group>
                        </Fragment>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='卡面价格(元)'
                    >
                      {getFieldDecorator('cardViewPrice',{
                        initialValue: stockList && stockList.cardViewPrice,
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='销售价格(元)'
                    >
                      {getFieldDecorator('cardSalePrice',{
                        initialValue: stockList && stockList.cardSalePrice,
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                </Row>
                {
                  stockList && stockList.cardType === 1 &&
                  <div>
                    <Row gutter={24}>
                      <Col span={12}>
                        <FormItem
                          {...formItemLayout}
                          label='日消费次数'
                        >
                          {getFieldDecorator('consumeTimes',{
                            initialValue: stockList && stockList.consumeTimes,
                          })(<Input disabled={true}/>)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem
                          {...formItemLayout}
                          label='次消费时长(分钟)'
                        >
                          {getFieldDecorator('duration',{
                            initialValue: stockList && stockList.duration,
                          })(<Input disabled={true}/>)}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={24}>
                      <Col span={12}>
                        <FormItem
                          {...formItemLayout}
                          label='超时价格(元)'
                        >
                          {getFieldDecorator('timeoutBillingPrice',{
                            initialValue: stockList && stockList.timeoutBillingPrice,
                          })(<Input disabled={true}/>)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem
                          {...formItemLayout}
                          label='超时计费单位(分钟)'
                        >
                          {getFieldDecorator('timeoutBillingUnit',{
                            initialValue: stockList && stockList.timeoutBillingUnit,
                          })(<Input disabled={true}/>)}
                        </FormItem>
                      </Col>
                    </Row>
                  </div>
                }
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label={'库存量'}
                    >
                      {getFieldDecorator('currentStock',{
                        initialValue: stockList && stockList.currentStock,
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={18} offset={3}>
                    <div className={styles.resTable}>
                      <Table
                        loading={false}
                        columns={columns}
                        scroll={{ x: 800 }}
                        rowKey={record => record.id}
                        dataSource={curriculumTable && curriculumTable.data}
                        pagination={false}
                      />
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
          <div className={styles.reductionTableListForm}>
            <div style={{ overflow: 'hidden',width:'100%' }}>
              <Row gutter={24} style={{ marginBottom: 24, marginTop: 24 }}>
                <Col span={14} offset={10}>
                  <Button
                    type="primary"
                    onClick={this.handleCancel}
                    className={styles.buttonColor}
                  >
                    返回
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
