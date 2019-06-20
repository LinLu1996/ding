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

@connect(({ ticket }) => ({
  ticket,
}))
@Form.create()
export default class Stack extends Component {
  action = {
    queryList: 'ticket/fetchQueryTicket',
    getSprotName: 'ticket/fetchGetSprotName',
    getCourtName: 'ticket/fetchGetCourtName',
    getStockInfo: 'ticket/fetchGetStockInfo',
    getCurriculumTable: 'ticket/fetchGetCurriculumTable',
    handleSocket: 'ticket/fetchHandleSocket',
    toAddPage: '/ticket/ticketList/add',
  };
  firstFlag=true;

  constructor(props) {
    super(props);
    const { ticket: {dictList} } = this.props;
    this.state = {
      dataSource: [],
      peopleNum:null,
      type:'inStock',
      checkedList:[],
      placeListAll:[],
      checkAll: false,
      loading:false
    };
  }

  componentDidMount() {
    const { dispatch, location } = this.props;
    // 获取项目类型
    dispatch({
      type: this.action.getSprotName,
    });

    if (location && location.search) {
      const { query } = location;
      this.setState({ ...query });
      // 获取履历列表
      dispatch({
        type: this.action.getCurriculumTable,
        payload:{ ticketBasicInfoId:query.id,operatingType:query.type==='outStock'?2:1 }
      });
      dispatch({
        type:this.action.getStockInfo,
        payload:{ id:query.id },
      }).then(() => {
        const { ticket:{ stockList} }= this.props;
        if(stockList && stockList.sportItemId) {
          dispatch({
            type:this.action.getCourtName,
            payload:{ sportItemId:stockList.sportItemId }
          })
        }
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { ticket:{stockList} } = nextProps;
    const courtList = [];
    const dateTypeList = [];
    if(this.firstFlag && stockList && stockList.courtId && stockList.dateType) {
      stockList.courtId.forEach((item) => {
        courtList.push(parseInt(item))
      });
      stockList.dateType.forEach((item) => {
        dateTypeList.push(parseInt(item))
      });
      this.setState({
        checkedList:dateTypeList,
        placeListAll:courtList,
      })
      this.firstFlag = false;
    }
  }

  // 全选
  onCheckAllChange = (e) => {
    this.setState({
      checkedList: e.target.checked ? [1,2,3,4,5,6,7,8] : [],
      checkAll: e.target.checked,
    });
  }

  onCheckBoxChange = (checkedList) => {
    let flag = false;
    if(checkedList.length===8) {
      flag = true;
    }
    this.setState({
      checkedList,
      checkAll:flag,
    });
  }

  handlePeople = e => {
    if(e) {
      this.setState({
        peopleNum:e.target.value,
        manNum:0,
        childNum:0,
      })
    }
  }

  // 取消
  handleCancel = () => {
    router.go(-1);
  }

  handleSubmit = () => {
    const { form, dispatch,ticket:{stockList} } = this.props;
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
        ticketBasicInfoId:id,
        operatingAmount:values.operatingAmount===undefined ?null:values.operatingAmount,
        remarks:values.remark===undefined ?null:values.remark,
      };
      dispatch({
        type:this.action.handleSocket,
        payload:params
      }).then(() => {
        const {
          ticket: { code },
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
    const { form: { getFieldDecorator },ticket:{sprotNameList,placeList,stockList,curriculumTable,courtNameList} } = this.props;
    const { peopleNum,manNum,childNum,type } = this.state;
    const format = 'HH:mm';
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
                  })(<InputNumber placeholder='请输入入库数量' style={{width:'100%'}}/>)}
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
                  })(<TextArea placeholder='请输入备注信息' rows={4} maxLength={100} />)}
                </FormItem>
              </Form>
              <div style={{ overflow: 'hidden',width:'100%' }}>
                <Row gutter={24} style={{ marginBottom: 24 }}>
                  <Col span={3} />
                  <Col span={4}>
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
                <Col style={{ paddingBottom: 8 }}>{renderTitle('门票信息')}</Col>
              </Row>
              <Form layout='inline'>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='项目类型'
                    >
                      {getFieldDecorator('sportItemId',{
                        initialValue:stockList && stockList.sportItemName
                      })(
                        <Select allowClear placeholder='请选择' disabled={true}>
                          {sprotNameList && sprotNameList.length && sprotNameList.map(obj => (
                            <Select.Option key={obj.id} value={obj.id}>
                              {obj.itemName}
                            </Select.Option>
                          ))}
                        </Select>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='门票名称'
                    >
                      {getFieldDecorator('ticketName',{
                        initialValue: stockList && stockList.ticketName,
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24}>
                    <FormItem
                      {...formItemLayout}
                      label='适用场地'
                    >
                      {getFieldDecorator('courtId',{
                      })(
                        <Fragment>
                          <Checkbox.Group style={{display:'inline'}} disabled={true} value={this.state.placeListAll} onChange={this.onCheckPlaceChange}>
                            {
                              courtNameList && courtNameList.length>0 && courtNameList.map((item) => (
                                <Checkbox key={item.id} value={item.id}>{item.courtName}</Checkbox>
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
                      label='票面价格(元)'
                    >
                      {getFieldDecorator('ticketViewPrice',{
                        initialValue: stockList && stockList.ticketViewPrice,
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='销售价格(元)'
                    >
                      {getFieldDecorator('ticketSalePrice',{
                        initialValue: stockList && stockList.ticketSalePrice,
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='人数'
                    >
                      <Row gutter={5}>
                        <Col span={8}>
                          <FormItem style={{ marginBottom:0 }}
                          >
                            {getFieldDecorator('totalNum',{
                              initialValue:stockList && stockList.totalNum
                            })(
                              <Input disabled={true} />
                            )}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem style={{ marginBottom:0 }}
                                    label='成人'
                          >
                            {getFieldDecorator('adultNum',{
                              initialValue:stockList && stockList.adultNum
                            })(
                              <Input disabled={true} />
                            )}
                          </FormItem>
                        </Col>
                        <Col span={8}>
                          <FormItem style={{ marginBottom:0 }}
                                    label='儿童'
                          >
                            {getFieldDecorator('childrenNum',{
                              initialValue:stockList && stockList.childrenNum
                            })(
                              <Input disabled={true} />
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label={<span><span style={{color: '#f5222d',fontSize: '14px'}}>* </span>{'适用时间段'}</span>}
                    >
                      <Row gutter={24}>
                        <Col span={12}>
                          <FormItem
                            style={{ marginBottom:0 }}
                          >
                            {getFieldDecorator('applyTimeStart',{
                              initialValue:stockList && moment(stockList.applyTimeStart,'HH:mm') || null
                            })(<TimePicker style={{width:'100%'}} format={format} disabled={true} />)}
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem style={{ marginBottom:0 }}>
                            {getFieldDecorator('applyTimeEnd',{
                              initialValue:stockList && moment(stockList.applyTimeEnd,'HH:mm') || null
                            })(<TimePicker style={{width:'100%'}} format={format} disabled={true} />)}
                          </FormItem>
                        </Col>
                      </Row>
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='使用时长(分钟)'
                    >
                      {getFieldDecorator('duration',{
                        initialValue:stockList && stockList.duration
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='适用日期范围'
                    >
                      {getFieldDecorator('range',{
                        initialValue:stockList && [moment(stockList.applyDateStart && stockList.applyDateStart,'YYYY-MM-DD') || null, moment(stockList.applyDateEnd && stockList.applyDateEnd,'YYYY-MM-DD') || null]
                      })(<RangePicker style={{width:'100%'}} disabled={true}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24}>
                    <FormItem {...formItemLayout} label='适用日期类型'>
                      {getFieldDecorator('applyDateType',{
                      })(
                        <Fragment>
                          <Checkbox.Group  disabled={true} value={this.state.checkedList} style={{display:'inline'}}>
                            <Checkbox value={1}>周一</Checkbox>
                            <Checkbox value={2}>周二</Checkbox>
                            <Checkbox value={3}>周三</Checkbox>
                            <Checkbox value={4}>周四</Checkbox>
                            <Checkbox value={5}>周五</Checkbox>
                            <Checkbox value={6}>周六</Checkbox>
                            <Checkbox value={7}>周日</Checkbox>
                            <Checkbox value={8}>节假日</Checkbox>
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
                      label={type==='inStock'? '入库前库存量' : '出库前库存量'}
                    >
                      {getFieldDecorator('currentStock',{
                        initialValue: stockList && stockList.currentStock,
                      })(<Input  disabled={true}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='超时计费单位(分钟)'
                    >
                      {getFieldDecorator('timeoutBillingUnit',{
                        initialValue: stockList && stockList.timeoutBillingUnit,
                      })(<Input  disabled={true}/>)}
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
