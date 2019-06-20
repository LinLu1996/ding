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
      type:'inStock',
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

  handleSubmit = () => {
    const { form, dispatch,card:{stockList} } = this.props;
    const { type,id } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return ;
      }
      if(type==='outStock') {
        if(parseInt(values.operatingAmount)> parseInt(stockList && stockList.currentStock)) {
          message.warning('出库数量不能大于入库前库存数量');
          return ;
        }
      }
      this.setState({
        loading:true
      })
      const params = {
        operatingType:type==='inStock'?1:2,
        cardBasicInfoId:id,
        operatingAmount:values.operatingAmount===undefined ?null:values.operatingAmount,
        remarks:values.remark===undefined ?null:values.remark,
      };
      dispatch({
        type:this.action.handleSocket,
        payload:params
      }).then(() => {
        const {
          card: { code },
        } = this.props;
        this.setState({
          loading:false
        })
        if (code === 200) {
          message.success('成功');
          this.handleCancel();
        }
      })
    });
  };

  render() {
    const { form: { getFieldDecorator },card:{applicableItemsList,stockList,curriculumTable} } = this.props;
    const { type,id } = this.state;
    console.log('checkedList',this.state.checkedList);
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
            <div className={styles.reductionTableListForm}>
              <Row gutter={24}>
                {type==='inStock' ? <Col style={{ paddingBottom: 8 }}>{renderTitle('本次入库信息')}</Col>:
                  <Col style={{ paddingBottom: 8 }}>{renderTitle('本次出库信息')}</Col>}
              </Row>
              <Form>
                <FormItem {...formItemLayout} label="当前库存">
                  {getFieldDecorator('currentStock', {
                    initialValue: stockList && stockList.currentStock,
                  })(<Input disabled />)}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={type==='inStock'?'入库数量':'出库数量'}
                >
                  {getFieldDecorator('operatingAmount',{
                    rules: [
                      {
                        required: true,
                        message:'请输入数量'
                      },
                      {
                        pattern: /^[0-9]\d{0,5}$/,
                        message: '必须为整数，且最大值为999999',
                      },
                    ],
                    initialValue: '',
                  })(<InputNumber placeholder='请输入希望入库的数量' style={{width:'100%'}}/>)}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={type==='inStock'?'入库备注':'出库备注'}
                >
                  {getFieldDecorator('remark',{
                    rules: [
                      {
                        required: true,
                        message:'请输入备注信息'
                      },
                    ],
                    initialValue: '',
                  })(<TextArea placeholder='请输入备注' rows={4} maxLength={100} />)}
                </FormItem>
              </Form>
              <div style={{ overflow: 'hidden',width:'100%' }}>
                <Row gutter={24} style={{ marginBottom: 24 }}>
                  <Col span={4} offset={10}>
                    <Button
                      htmlType="submit"
                      onClick={this.handleSubmit}
                      loading={this.state.loading}
                      className={styles.buttonColor}>{type==='inStock'? '入库' : '出库'}</Button>
                    <Button
                      type="primary"
                      onClick={this.handleCancel}
                      className={styles.buttonColor}
                      style={{marginLeft:5}}
                    >
                      返回
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
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
                          <Select.Option key={3} value={3}>
                            次卡
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
                      label={type==='inStock'? '入库前库存量' : '出库前库存量'}
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
        </Card>
      </PageHeaderWrapper>
    );
  }
}
