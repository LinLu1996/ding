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
      // // 获取履历列表
      dispatch({
        type: this.action.getCurriculumTable,
        payload:{ ticketBasicInfoId:query.id }
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

  // 取消
  handleCancel = () => {
    router.go(-1);
  }

  render() {
    const { form: { getFieldDecorator },ticket:{sprotNameList,placeList,stockList,curriculumTable,courtNameList} } = this.props;
    const { peopleNum,manNum,childNum } = this.state;
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
                      label='超时计费金额'
                    >
                      {getFieldDecorator('timeoutValue',{
                        initialValue: stockList && stockList.timeoutValue,
                      })(<Input disabled={true}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='销售时间'
                    >
                      {getFieldDecorator('ticketSaleTime',{
                        initialValue: stockList && `${stockList.applyTimeStart || ''}--${stockList.applyTimeEnd || ''}`,
                      })(<Input disabled={true}/>)}
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
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='售卖平台'
                    >
                      {getFieldDecorator('machineType',{
                        initialValue: stockList && stockList.machineType,
                      })(<Input disabled={true}/>)}
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
                      label={'库存量'}
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
        </Card>
      </PageHeaderWrapper>
    );
  }
}
