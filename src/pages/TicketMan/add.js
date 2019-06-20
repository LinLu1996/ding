import React, { Component,Fragment } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Form, Card, Input, DatePicker, Select, Col, Row, Table, Button, message,InputNumber,Checkbox,TimePicker,Modal } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import moment from 'moment';
import styles from './index.less';
import { connect } from 'dva';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';

const FormItem = Form.Item;
const {RangePicker} = DatePicker;
const CheckboxGroup = Checkbox.Group;
const timeFormat = 'HH:mm';

@Form.create()
@connect(({ ticket }) => ({
  ticket,
}))

export default class Emply extends Component {

  action = {
    queryList: 'ticket/fetchQueryTicket',
    getSprotName: 'ticket/fetchGetSprotName',
    getCourtName: 'ticket/fetchCourtName',
    getDateType: 'ticket/fetchGetDateType',
    addTicket: 'ticket/fetchAddTicket',
    editTicket: 'ticket/fetchEditTicket',
    machineList:'ticket/machinelist',
    getStockInfo: 'ticket/fetchGetStockInfo',
    clearStockInfo: 'ticket/clearStockInfo',
    toAddPage: '/ticket/ticketList/add',
    startTime: '09:30',
    endTime: '21:30',
  };
  firstFlag=true;
  constructor(props) {
    super(props);
    const { ticket:{dictList} } = this.props;
    this.state = {
      dataSource: [],
      peopleNum:null,
      manNum:null,
      childNum:null,
      value1: '',
      value2: '',
      checkedList:[],
      placeListAll:[],
      machineTypeList:[],
      checkAll: false,
      id:null,
      startTime:'12:09',
      loading:false,
    };
  }

  componentDidMount() {
    const {current,pageSize} = this.state;
    const { dispatch, location } = this.props;
    // 获取适用日期类型
    dispatch({
      type:this.action.getDateType,
      payload:{ type:2 },
    });
    dispatch({
      type:this.action.machineList,
      payload:{ type:12 },
    });
    if (location && location.search) {
      const { query } = location;
      this.setState({ ...query });
    }
    if (location && location.search) {
      const { query } = location;
      this.setState({ ...query });
      dispatch({
        type:this.action.getStockInfo,
        payload:{ id:query.id },
      }).then(() => {
        const { ticket:{stockList} } = this.props;
        const dateTypeList = [];
        const courtList = [];
        let totalNum = null;
        if(stockList) {
          if(stockList.sportItemId) {
            this.editGetApplyCourt(stockList.sportItemId);
          }
          if(stockList.machineTypeList) {
            this.setState({machineTypeList:stockList.machineTypeList})
          }
          if(stockList.courtId) {
            stockList.courtId.forEach((item) => {
              courtList.push(parseInt(item))
            });
          }
          if(stockList.totalNum) {
            totalNum = stockList.totalNum;
          }
          if(stockList.dateType) {
            stockList.dateType.forEach((item) => {
              dateTypeList.push(item)
            });
          }
          this.setState({
            peopleNum:totalNum,
            checkedList:dateTypeList && dateTypeList,
            checkAll:stockList.dateType && stockList.dateType.length===8?true:false,
            value1:stockList.ticketDetails && stockList.ticketDetails,
            value2:stockList.purchaseNotes && stockList.purchaseNotes,
            placeListAll:courtList && courtList,
          })
        }
      })
    } else {
      // 获取项目类型
      dispatch({
        type: this.action.getSprotName,
      });
      // 获取适用场地
      dispatch({
        type: this.action.getCourtName,
      })
      dispatch({
        type:this.action.clearStockInfo,
      })
    }
  }

  editGetApplyCourt = (e) => {
    const {dispatch} = this.props;
    dispatch({
      type:this.action.getCourtName,
      payload:{ sportItemId:e==='全部'? null: e }
    })
  }
  // componentWillReceiveProps(nextProps) {
  //   const { ticket:{stockList} } = nextProps;
  //   const courtList = [];
  //   const dateTypeList = [];
  //   if(this.firstFlag && stockList && stockList.courtId && stockList.dateType || stockList.ticketDetails || stockList.purchaseNotes) {
  //     stockList.courtId.forEach((item) => {
  //         courtList.push(parseInt(item))
  //       });
  //     stockList.dateType.forEach((item) => {
  //       dateTypeList.push(parseInt(item))
  //     });
  //     this.setState({
  //       checkedList:dateTypeList,
  //       placeListAll:courtList,
  //       checkAll:stockList.dateType.length===8?true:false,
  //       value1:stockList.ticketDetails,
  //       value2:stockList.purchaseNotes
  //     })
  //     this.firstFlag = false;
  //   }
  // }

  handlePeople = e => {
    if(e) {
      this.setState({
        peopleNum:e,
        manNum:0,
        childNum:0,
      })
    }
  }

  // 取消
  handleCancel = () => {
    Modal.confirm({
      title: '提示',
      content: '是否放弃保存录入的内容？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.handleTolist(),
    });
  }
  handleTolist = () => {
    const pathname = `/ticket/ticketList/list`;
    router.push({
      pathname,
    });
  }

  handleChange = (value) => {
    this.setState({
      value1:value,
    })
  };

  handleChange2 = (value) => {
    this.setState({
      value2:value,
    })
  };

  // 全选
  onCheckAllChange = (e) => {
    const { form } = this.props;
    this.setState({
      checkedList: e.target.checked ? ['1','2','3','4','5','6','7','8'] : [],
      checkAll: e.target.checked,
    });
    form.setFieldsValue({
      'applyDateType': e.target.checked ? ['1','2','3','4','5','6','7','8'] : []
    })
  }

  onCheckBoxChange = (checkedList) => {
    const { form } = this.props;
    let flag = false;
    if(checkedList.length===8) {
      flag = true;
    }
    this.setState({
      checkedList,
      checkAll:flag,
    });
    form.setFieldsValue({
      'applyDateType': checkedList
    })
  }

  // 修改时间
  onTimeChanged = (field, value) => {
    let newValue = value;
    if (field === 'startTime') {
      const { endTime } = this.state;
      if (moment(value, timeFormat).isAfter(moment(endTime, timeFormat))) {
        newValue = endTime;
      }
    }
    if (field === 'endTime') {
      const { startTime } = this.state;
      if (moment(value, timeFormat).isBefore(moment(startTime, timeFormat))) {
        newValue = startTime;
      }
    }
    this.setState({ [field]: newValue });
  };

  disabledStartMinutes = () => {
    const { startTime, endTime } = this.state;
    const list = [];
    if (moment(startTime, timeFormat).hour() === moment(endTime, timeFormat).hour()) {
      for (let i = 0; i < 60; i++) {
        if (moment(endTime, timeFormat).minute() < i) {
          list.push(i);
        }
      }
    }
    return list;
  };

  disabledStartHours = () => {
    const { endTime } = this.state;
    const list = [];
    for (let i = 0; i < 24; i++) {
      if (moment(endTime, timeFormat).hour() < i) {
        list.push(i);
      }
    }
    return list;
  };

  disabledEndMinutes = () => {
    const { startTime, endTime } = this.state;
    const list = [];
    if (moment(startTime, timeFormat).hour() === moment(endTime, timeFormat).hour()) {
      for (let i = 0; i < 60; i++) {
        if (moment(startTime, timeFormat).minute() > i) {
          list.push(i);
        }
      }
    }
    return list;
  };

  disabledEndHours = () => {
    const { startTime } = this.state;
    const list = [];
    for (let i = 0; i < 24; i++) {
      if (moment(startTime, timeFormat).hour() > i) {
        list.push(i);
      }
    }
    return list;
  };

  // 适用场地复选框
  onCheckPlaceChange = (checkedList) => {
    this.setState({
      placeListAll: checkedList,
    });
  };


  onCheckMachineChange = (checkedList) => {
    this.setState({
      machineTypeList: checkedList,
    });
  };

  // 获取适用场地
  getApplyCourt = (e) => {
    const {dispatch} = this.props;
    dispatch({
      type:this.action.getCourtName,
      payload:{ sportItemId:e==='全部'? null: e }
    })
    this.setState({
      placeListAll: []
    })
  }

  // 不可选择的时间段
  disabledDate = current => !(current && moment(`${moment(current).format("YYYY-MM-DD")} 00:00:00`) >= moment(`${moment().endOf('day').format("YYYY-MM-DD")} 00:00:00`));

  handleSubmit = () => {
    const { form, dispatch,ticket:{sprotNameList,placeList,stockList} } = this.props;
    const { placeListAll,checkedList,value1,value2,checkAll,type,id,machineTypeList } = this.state;
    const dateAll = [1,2,3,4,5,6,7,8];
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return ;
      }
      const man = values.adultNum ? values.adultNum:0;
      const child = values.childrenNum ? values.childrenNum:0;
      if(parseInt(values.totalNum) > 1 && parseInt(values.totalNum)!==(parseInt(man)+parseInt(child))) {
        message.warning('成人数和儿童数总和必须等于总人数');
        return;
      }
      this.setState({
        loading:true
      });
      const courtName = [];
      const currentName = sprotNameList.filter((item) => item.id === values.sportItemId)[0];
      for(let i=0; i<placeList.length; i++) {
        const cu = placeList[i];
        placeListAll.forEach((item) => {
          if(item===cu.id) {
            courtName.push(cu.courtName);
          }
        })
      }
      const params = {
        sportItemId:values.sportItemId===undefined ?null:values.sportItemId,
        sportItemName:currentName ? currentName.itemName: null ,
        courtId:placeListAll && JSON.stringify(placeListAll)!=="[]"?placeListAll:null,
        machineTypeList:machineTypeList && JSON.stringify(machineTypeList)!=="[]"?machineTypeList:null,
        courtName:courtName && JSON.stringify(courtName)!=="[]"?courtName:null,
        ticketName:values.ticketName===undefined ?null:values.ticketName,
        dateType:checkAll ?dateAll:checkedList,
        ticketViewPrice:values.ticketViewPrice===undefined ?null:values.ticketViewPrice,
        ticketSalePrice:values.ticketSalePrice===undefined ?null:values.ticketSalePrice,
        totalNum:values.totalNum===undefined ?null:values.totalNum,
        adultNum:parseInt(values.totalNum)===1 ? 1:values.adultNum!==undefined ?values.adultNum:null,
        childrenNum:values.childrenNum===undefined ?null:values.childrenNum,
        applyDateStart:values && values.range!==undefined && JSON.stringify(values.range)!=="[]" ?moment(values.range[0]).format("YYYY-MM-DD"):null,
        applyDateEnd:values && values.range!==undefined && JSON.stringify(values.range)!=="[]" ?moment(values.range[1]).format("YYYY-MM-DD"):null,
        saleTimeStart:values && values.saleTimeStart!==undefined && values.saleTimeStart!==null ?moment(values.saleTimeStart).format("HH:mm"):null,
        saleTimeEnd:values && values.saleTimeEnd!==undefined && values.saleTimeEnd!==null ?moment(values.saleTimeEnd).format("HH:mm"):null,
        applyTimeStart:values && values.applyTimeStart!==undefined ?moment(values.applyTimeStart).format("HH:mm"):null,
        applyTimeEnd:values && values.applyTimeEnd!==undefined ?moment(values.applyTimeEnd).format("HH:mm"):null,
        saleDateStart:values && values.timeRange!==undefined && JSON.stringify(values.timeRange)!=="[]" ?moment(values.timeRange[0]).format("YYYY-MM-DD"):null,
        saleDateEnd:values && values.timeRange!==undefined && JSON.stringify(values.timeRange)!=="[]" ?moment(values.timeRange[1]).format("YYYY-MM-DD"):null,
        duration:values.duration===undefined ?null:values.duration,
        timeoutBillingUnit:values.timeoutBillingUnit===undefined ?null:values.timeoutBillingUnit,
        timeoutValue:values.timeoutValue===undefined ?null:values.timeoutValue,
        initialStock:values.initialStock===undefined ?null:values.initialStock,
        ticketDetails:value1===null ?null:value1,
        purchaseNotes:value2===null ?null:value2,
      };
      if(id===null) {
        dispatch({
          type:this.action.addTicket,
          payload:params
        }).then(() => {
          const {
            ticket: { code },
          } = this.props;
          this.setState({
            loading:false
          })
          if (code === 200) {
            message.success('保存成功');
            this.handleTolist();
          }
        })
      } else if(id) {
        dispatch({
          type:this.action.editTicket,
          payload:{...params,id:stockList && stockList.id?stockList.id:null,
            ticketUseId:stockList && stockList.ticketUseId?stockList.ticketUseId:null,
            ticketSaleId:stockList && stockList.ticketSaleId?stockList.ticketSaleId:null,}
        }).then(() => {
          const {
            ticket: { code },
          } = this.props;
          this.setState({
            loading:false
          })
          if (code === 200) {
            message.success('成功');
            this.handleTolist();
          }
        })
      }
    });
  };

  render() {
    const { form: { getFieldDecorator },ticket:{sprotNameList,placeList,stockList,dateTypeList,machineListResult} } = this.props;
    const { peopleNum,manNum,childNum,id } = this.state;
    const format = 'HH:mm';
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
              <Form>
                <FormItem
                  label='项目类型'
                >
                  {getFieldDecorator('sportItemId',{
                    rules: [
                      {
                        required: true,
                        message:'请选择项目类型'
                      },
                    ],
                    initialValue:stockList && stockList.sportItemId
                  })(
                    <Select disabled={id ? true:false} allowClear placeholder='请选择' onChange={this.getApplyCourt}>
                      {sprotNameList && sprotNameList.length && sprotNameList.map(obj => (
                        <Select.Option key={obj.id} value={obj.id}>
                          {obj.itemName}
                        </Select.Option>
                      ))}
                    </Select>)}
                </FormItem>
                <FormItem
                  label='门票名称'
                >
                  {getFieldDecorator('ticketName',{
                    rules: [
                      {
                        required: true,
                        message:'请输入门票名称'
                      },
                    ],
                    initialValue: stockList && stockList.ticketName,
                  })(<Input maxLength={50}/>)}
                </FormItem>
                <Row>
                  <Col span={24}>
                    <FormItem
                      label='可售卖平台'
                    >
                      {getFieldDecorator('machineTypeList',{
                        rules: [
                          {
                            required: true,
                            message:'请选择可售卖平台'
                          },
                        ],
                        initialValue:this.state.machineTypeList,
                      })(
                        <Checkbox.Group style={{display:'inline'}} value={this.state.machineTypeList} onChange={this.onCheckMachineChange}>
                          {
                            machineListResult && machineListResult.length>0 && machineListResult.map((item) => (
                              <Checkbox key={item.code} value={item.code}>{item.value}</Checkbox>
                            ))
                          }
                        </Checkbox.Group>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <FormItem
                      label='适用场地'
                    >
                      {getFieldDecorator('courtId',{
                        rules: [
                          {
                            required: true,
                            message:'请选择适用场地'
                          },
                        ],
                        initialValue:this.state.placeListAll
                      })(
                        <Checkbox.Group style={{display:'inline'}} value={this.state.placeListAll} onChange={this.onCheckPlaceChange}>
                          {
                            placeList && placeList.length>0 && placeList.map((item) => (
                              <Checkbox key={item.id} value={item.id}>{item.courtName}</Checkbox>
                            ))
                          }
                        </Checkbox.Group>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <FormItem
                  label='票面价格(元)'
                >
                  {getFieldDecorator('ticketViewPrice',{
                    rules: [
                      {
                        required: true,
                        message:'请输入票面价格'
                      },
                      {
                        pattern: /^\d{0,9}(?:\.\d{1,2})?$/,
                        message: '票面价格只能为数字，且最大为999999999.99',
                      },
                    ],
                    initialValue: stockList && stockList.ticketViewPrice,
                  })(<Input/>)}
                </FormItem>
                <FormItem
                  label='销售价格(元)'
                >
                  {getFieldDecorator('ticketSalePrice',{
                    rules: [
                      {
                        required: true,
                        message:'请输入销售价格'
                      },
                      {
                        pattern: /^\d{0,9}(?:\.\d{1,2})?$/,
                        message: '销售价格只能为数字，且最大为999999999.99',
                      },
                    ],
                    initialValue: stockList && stockList.ticketSalePrice,
                  })(<Input/>)}
                </FormItem>
                <Row gutter={24}>
                  <Col span={8}>
                    <FormItem
                      label='人数'
                    >
                      {getFieldDecorator('totalNum',{
                        rules: [
                          {
                            required: true,
                            message:'请输入人数'
                          },
                          // {
                          //   pattern: /^[0-9]\d{0,4}$/,
                          //   message: '人数只能为整数，且最大为99999',
                          // },
                        ],
                        initialValue:id && stockList && stockList.totalNum
                      })(
                        <InputNumber min={0} max={10} style={{width:'100%'}} onChange={this.handlePeople} />
                      )}
                    </FormItem>
                  </Col>
                  {
                    id && peopleNum>1 && <Col span={8}><FormItem
                      label='成人'
                    >
                      {getFieldDecorator('adultNum',{
                        rules: [
                          {
                            required: true,
                            message:'请输入成人数'
                          },
                        ],
                        initialValue:stockList && stockList.adultNum
                      })(
                        <InputNumber min={0} max={10} style={{width:'100%'}}/>
                      )}
                    </FormItem></Col>
                  }
                  {
                    id && peopleNum>1 && <Col span={8}>
                      <FormItem
                        label='儿童'
                      >
                        {getFieldDecorator('childrenNum',{
                          rules:[
                            {
                              required: true,
                              message:'请输入儿童数'
                            },
                          ],
                          initialValue:stockList && stockList.childrenNum
                        })(
                          <InputNumber min={0} max={10} style={{width:'100%'}}/>
                        )}
                      </FormItem>
                    </Col>
                  }
                  {
                    id===null && peopleNum>1 && <Col span={8}>
                      <FormItem
                        label='成人'
                      >
                        {getFieldDecorator('adultNum',{
                          rules: [
                            {
                              required: true,
                              message:'请输入成人数'
                            },
                          ],
                        })(
                          <InputNumber min={0} max={10} style={{width:'100%'}}/>
                        )}
                      </FormItem>
                    </Col>
                  }
                  {
                    id===null && peopleNum >1 && <Col span={8}>
                      <FormItem
                        label='儿童'
                      >
                        {getFieldDecorator('childrenNum',{
                          rules:[
                            {
                              required: true,
                              message:'请输入儿童数'
                            },
                          ]
                        })(
                          <InputNumber min={0} max={10} style={{width:'100%'}}/>
                        )}
                      </FormItem>
                    </Col>
                  }
                </Row>
                <FormItem
                  label='适用日期范围'
                >
                  {getFieldDecorator('range',{
                    rules: [
                      {
                        required: true,
                        message:'请选择适用日期范围'
                      },
                    ],
                    initialValue:id && stockList && stockList.applyDateStart && stockList.applyDateEnd && [moment(stockList.applyDateStart,'YYYY-MM-DD'), moment(stockList.applyDateEnd,'YYYY-MM-DD')] || null
                  })(<RangePicker style={{width:'100%'}} disabledDate={this.disabledDate} />)}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={<span><span style={{color: '#f5222d',fontSize: '14px'}}>* </span>{'适用时间'}</span>}
                >
                  <Row gutter={24}>
                    <Col span={12} className={styles.timeCol}>
                      <FormItem
                        style={{ marginBottom:0 }}
                      >
                        {getFieldDecorator('applyTimeStart',{
                          rules: [
                            {
                              required: true,
                              message:'请选择适用时间段'
                            },
                          ],
                          initialValue:id && stockList && stockList.applyTimeStart && moment(stockList.applyTimeStart,'HH:mm')
                        })(<TimePicker
                          style={{width:'100%'}}
                          format={format}
                          onChange={(time, timeString) => this.onTimeChanged('startTime', timeString)}
                          disabledMinutes={this.disabledStartMinutes}
                          disabledHours={this.disabledStartHours}
                        />)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem style={{ marginBottom:0 }}>
                        {getFieldDecorator('applyTimeEnd',{
                          rules: [
                            {
                              required: true,
                              message:'请选择适用时间段'
                            },
                          ],
                          initialValue:id && stockList && stockList.applyTimeEnd && moment(stockList.applyTimeEnd,'HH:mm')
                        })(<TimePicker
                          style={{width:'100%'}}
                          format={format}
                          onChange={(time, timeString) => this.onTimeChanged('endTime', timeString)}
                          disabledMinutes={this.disabledEndMinutes}
                          disabledHours={this.disabledEndHours}
                        />)}
                      </FormItem>
                    </Col>
                  </Row>
                </FormItem>
                <FormItem
                  label='销售时间范围'
                >
                  {getFieldDecorator('timeRange',{
                    rules: [
                      {
                        required: true,
                        message:'请选择销售时间范围'
                      },
                    ],
                    initialValue:id && stockList && stockList.saleDateStart && stockList.saleDateEnd && [moment(stockList.saleDateStart,'YYYY-MM-DD'), moment(stockList.saleDateEnd,'YYYY-MM-DD')] || null
                  })(<RangePicker style={{width:'100%'}} disabledDate={this.disabledDate} />)}
                </FormItem>
                <FormItem
                  {...formItemLayout}
                  label={<span>销售时间</span>}
                >
                  <Row gutter={24}>
                    <Col span={12} className={styles.timeCol}>
                      <FormItem
                        style={{ marginBottom:0 }}
                      >
                        {getFieldDecorator('saleTimeStart',{
                          rules: [
                            {
                              required: false,
                              message:'请选择销售时间段'
                            },
                          ],
                          initialValue:id && stockList && stockList.saleTimeStart && moment(stockList.saleTimeStart,'HH:mm')
                        })(<TimePicker
                          style={{width:'100%'}}
                          format={format}
                          onChange={(time, timeString) => this.onTimeChanged('startTime', timeString)}
                          disabledMinutes={this.disabledStartMinutes}
                          disabledHours={this.disabledStartHours}
                        />)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem style={{ marginBottom:0 }}>
                        {getFieldDecorator('saleTimeEnd',{
                          rules: [
                            {
                              required: false,
                              message:'请选择销售时间段'
                            },
                          ],
                          initialValue:id && stockList && stockList.saleTimeEnd && moment(stockList.saleTimeEnd,'HH:mm')
                        })(<TimePicker
                          style={{width:'100%'}}
                          format={format}
                          onChange={(time, timeString) => this.onTimeChanged('endTime', timeString)}
                          disabledMinutes={this.disabledEndMinutes}
                          disabledHours={this.disabledEndHours}
                        />)}
                      </FormItem>
                    </Col>
                  </Row>
                </FormItem>
                <FormItem
                  label='适用时长(分钟)'
                >
                  {getFieldDecorator('duration',{
                    rules: [
                      {
                        required: true,
                        message:'请输入适用时长'
                      },
                      {
                        pattern: /^[0-9]\d{0,2}$/,
                        message: '适用时长只能为整数，且最大为999',
                      },
                    ],
                    initialValue:stockList && stockList.duration
                  })(<Input />)}
                </FormItem>
                <FormItem label='适用日期类型'>
                  {getFieldDecorator('applyDateType',{
                    rules: [
                      {
                        required: true,
                        message:'请选择适用日期类型'
                      },
                    ],
                    initialValue:this.state.checkedList
                  })(
                    <Fragment>
                      <Checkbox value={0} onChange={this.onCheckAllChange} checked={this.state.checkAll}>全部</Checkbox>
                      <Checkbox.Group value={this.state.checkedList} onChange={this.onCheckBoxChange} style={{display:'inline'}}>
                        {
                          dateTypeList && dateTypeList.length>0 && dateTypeList.map((item) => (
                            <Checkbox key={item.id} value={item.code}>{item.value}</Checkbox>
                          ))
                        }
                      </Checkbox.Group>
                    </Fragment>
                  )}
                </FormItem>
                <FormItem
                  label='超时计费单位(分钟)'
                >
                  {getFieldDecorator('timeoutBillingUnit',{
                    rules: [
                      {
                        required: true,
                        message:'请输入超时计费单位'
                      },
                    ],
                    initialValue: stockList && stockList.timeoutBillingUnit,
                  })(<InputNumber max={9999} style={{ width:"100%" }} />)}
                </FormItem>
                <FormItem
                  label='超时计费金额(元)'
                >
                  {getFieldDecorator('timeoutValue',{
                    rules: [
                      {
                        required: true,
                        message:'请输入超时计费金额'
                      },
                    ],
                    initialValue: stockList && stockList.timeoutValue,
                  })(<InputNumber precision={2}  max={99999.99}  style={{ width:"100%" }}/>)}
                </FormItem>
                <FormItem
                  label='初始库存'
                >
                  {getFieldDecorator('initialStock',{
                    rules: [
                      {
                        required: true,
                        message:'请输入初始库存'
                      },
                      {
                        pattern: /^[0-9]\d{0,5}$/,
                        message: '初始库存只能为整数，且最大为999999',
                      },
                    ],
                    initialValue: stockList && stockList.initialStock,
                  })(<Input disabled={id ? true:false}/>)}
                </FormItem>
              </Form>
              <div>
                <Row gutter={24} style={{marginBottom:'24px',display:'flex'}}>
                  <Col span={3} style={{width:'150px',textAlign:'right',padding:0,color:'rgba(0, 0, 0, 0.85)'}}>
                    门票详情：
                  </Col>
                  <Col span={20}>
                    <ReactQuill value={this.state.value1} onChange={this.handleChange} />
                  </Col>
                </Row>
                <Row gutter={24} style={{marginBottom:'24px',display:'flex'}}>
                  <Col span={3} style={{width:'150px',textAlign:'right',padding:0}}>
                    购买须知：
                  </Col>
                  <Col span={20}>
                    <ReactQuill value={this.state.value2} onChange={this.handleChange2} />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
          <div style={{ overflow: 'hidden',width:'100%' }}>
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={4} offset={10}>
                <Button
                  type="primary"
                  onClick={this.handleCancel}
                  className={styles.buttonColor}
                >
                  取消
                </Button>
                <Button
                  style={{marginLeft:5}}
                  // type="primary"
                  // htmlType="submit"
                  onClick={this.handleSubmit}
                  loading={this.state.loading}
                  className={styles.buttonColor}>保存</Button>
              </Col>
            </Row>
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
