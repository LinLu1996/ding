import React, { Component,Fragment } from 'react';
import { Form, Card, Input, DatePicker, Select, Col, Row, InputNumber, Button, message,Checkbox,TimePicker,Modal } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import moment from 'moment';
import styles from './index.less';
import { connect } from 'dva';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';

const FormItem = Form.Item;
const {RangePicker,MonthPicker} = DatePicker;
const CheckboxGroup = Checkbox.Group;
const timeFormat = 'HH:mm';

@connect(({ card }) => ({
  card,
}))
@Form.create()
export default class Emply extends Component {

  action = {
    queryList: 'card/fetchQueryTicket',
    getApplicableItems: 'card/fetchGetApplicableItems',
    addCard: 'card/fetchAddCard',
    editCard: 'card/fetchEditCard',
    getCardInfo: 'card/fetchGetCardInfo',
    clearStockInfo: 'card/clearStockInfo',
    toAddPage: '/card/cardList/add',
  };
  firstFlag=true;
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      checkedList:[],
      checkedTimeList:[],
      checkAll: false,
      id:null,
      yearCard:false,
      loading:false,
      cardUseDateDtoList:[
        {
          startMonth:undefined,
          endMonth:undefined,
          cardUseDateTimeDtoList:[
            {
              startTime:undefined,
              endTime:undefined,
            }
          ]
        }
      ],
    };
  }

  componentDidMount() {
    const {current,pageSize} = this.state;
    const { dispatch, location } = this.props;
    if (location && location.search) {
      const { query } = location;
      this.setState({ ...query });
    }
    // 获取适用项目
    dispatch({
      type: this.action.getApplicableItems,
      payload: {
        type: "online",
      }
    });

    if (location && location.search) {
      const { query } = location;
      this.setState({ ...query });
      dispatch({
        type:this.action.getCardInfo,
        payload:{ id:query.id },
      }).then(() => {
        const { card:{cardList} } = this.props;
        const dateTypeList = [];
        if(cardList && cardList.sportItem) {
          cardList.sportItem.forEach((item) => {
            dateTypeList.push(parseInt(item))
          });
        }
        const { cardUserDateMonthDtoList } = cardList;
        this.setState({
          checkedList:dateTypeList,
          yearCard:cardList && cardList.cardType,
          cardUseDateDtoList: cardUserDateMonthDtoList.map(item => {
            item.cardUseDateTimeDtoList = item.cardUserDateTimeDtoList || [];
            return item;
          }),
        })
      })
    } else {
      dispatch({
        type:this.action.clearStockInfo,
      })
    }
  }


  // 卡类型切换
  handleCartType = (val) => {
    this.setState({
      yearCard: val || 0,
    });
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
    const pathname = `/card/cardList`;
    router.push({
      pathname,
    });
  }


  // 全选
  onCheckAllChange = (e) => {
    const { form,card:{applicableItemsList} } = this.props;
    const arr = [];
    applicableItemsList.forEach((item) => {
      arr.push(item.id);
    })
    form.setFieldsValue({
      sportItem: e.target.checked>0 ? arr:undefined,
    });
    this.setState({
      checkedList: e.target.checked ? arr : [],
      checkAll: e.target.checked,
    });
  }


  // 适用场地复选框
  onCheckPlaceChange = (checkedList) => {
    const { card:{applicableItemsList},form } = this.props;
    let flag = false;
    if(checkedList.length===applicableItemsList.length) {
      flag = true;
    }
    form.setFieldsValue({
      sportItem: checkedList.length>0 ? checkedList:undefined,
    });
    this.setState({
      checkedList,
      checkAll:flag,
    });
  }

  handleConfirm = () => {
    const { form, location: { query } } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      Modal.confirm({
        title: `${(query && query.id) ? "编辑" : "新增"}提醒`,
        content: `${(query && query.id) ? "编辑" : "新增"}成功后，请对该卡进行上架操作`,
        okText: '确认',
        onOk: this.handleSubmit,
        cancelText: '取消',
      });
    })
  };

  handleSubmit = () => {
    const { form, dispatch,card:{applicableItemsList,cardList} } = this.props;
    const { checkedList,checkAll,type,id,yearCard } = this.state;
    let { cardUseDateDtoList } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      this.setState({
        loading:true
      });
      const courtName = [];
      for(let i=0; i<applicableItemsList.length; i++) {
        const cu = applicableItemsList[i];
        checkedList.forEach((item) => {
          if(item===cu.id) {
            courtName.push(cu.itemName);
          }
        })
      }
      const newList = [];
      for(let i=0; i<cardUseDateDtoList.length;i++){
        const item = cardUseDateDtoList[i];
        const newItem = {};
        if (item.startMonth) {
          newItem.startMonth = item.startMonth;
        }
        if (item.endMonth) {
          newItem.endMonth = item.endMonth;
        }
        if (item.cardUseDateTimeDtoList) {
          const newDateTimeList = [];
          item.cardUseDateTimeDtoList.forEach(dateTime => {
            const newDateTime = {};
            if (dateTime.startTime) {
              newDateTime.startTime = dateTime.startTime;
            }
            if (dateTime.endTime) {
              newDateTime.endTime = dateTime.endTime;
            }
            if (Object.keys(newDateTime).length > 0) {
              newDateTimeList.push(newDateTime);
            }
          });
          if (newDateTimeList.length > 0) {
            newItem.cardUseDateTimeDtoList = newDateTimeList;
          }
        }
        if (Object.keys(newItem).length > 0) {
          newList.push(newItem);
        }
      }
      const params1 = {
        ...values,
        sportItem:checkedList,
        sportItemName:courtName,
      };
      const params = {
        cardBaseDto:params1,
        cardUseDateDtoList:newList,
      };
      if(id===null) {
        dispatch({
          type:this.action.addCard,
          payload:params
        }).then(() => {
          const {
            card: { code },
          } = this.props;
          this.setState({
            loading:false
          })
          if (code === 200) {
            this.handleTolist();
          }
        })
      } else if(id) {
        dispatch({
          type:this.action.editCard,
          payload:{...params,id:cardList && cardList.id?cardList.id:null,
            cardUseId:cardList && cardList.cardUseId?cardList.cardUseId:null,
            cardSaleId:cardList && cardList.cardSaleId?cardList.cardSaleId:null,}
        }).then(() => {
          const {
            card: { code },
          } = this.props;
          if (code === 200) {
            this.handleTolist();
          }
        })
      }
    });
  };

  handleAddMonth = () => {
    const { cardUseDateDtoList } = this.state;
    const list = {
      startMonth:undefined,
      endMonth:undefined,
      cardUseDateTimeDtoList:[
        {
          startTime:undefined,
          endTime:undefined,
        }
      ]
    };
    cardUseDateDtoList.push(list);
    this.setState({
      cardUseDateDtoList,
    });
  }

  handleAddTime = (index) => {
    const { cardUseDateDtoList } = this.state;
    const timeLen = cardUseDateDtoList[index].cardUseDateTimeDtoList.length;
    if(timeLen===3) {
      message.warning('一个月份区间最多三个限制时间段');
      return;
    }
    const list = {
      startTime:null,
      endTime:null,
    };
    cardUseDateDtoList[index].cardUseDateTimeDtoList.push(list);
    this.setState({
      cardUseDateDtoList,
    })
  }

  handleDeleteMon = (index) => {
    const { cardUseDateDtoList } = this.state;
    cardUseDateDtoList.splice(index,1);
    this.setState({
      cardUseDateDtoList,
    })
  }

  handleDeleteTime = (index,ins) => {
    const { cardUseDateDtoList } = this.state;
    cardUseDateDtoList[index].cardUseDateTimeDtoList.splice(ins,1);
    this.setState({
      cardUseDateDtoList,
    })
  }

  disabledStartDate = (startValue,index) => {
    const { form } = this.props;
    const endValue = form.getFieldValue(`endMonth${index}`);
    if (!startValue || !endValue) {
      return false;
    }
    return moment(startValue.format('YYYYMM')).valueOf() > moment(endValue.format('YYYYMM')).valueOf() || moment(startValue.format('YYYY')).valueOf() < moment(moment(endValue).format('YYYY'));
  };

  disabledEndDate = (endValue,index) => {
    const { form } = this.props;
    const startValue = form.getFieldValue(`startMonth${index}`);
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() < startValue.valueOf() || moment(endValue.format('YYYY')).valueOf() > moment(moment(startValue).format('YYYY'));
  };

  disabledStartMinutes = (e,index,ins) => {
    const { form } = this.props;
    const startTime = form.getFieldValue(`businessTimeStart${index}${ins}`);
    const endTime = form.getFieldValue(`businessTimeEnd${index}${ins}`);
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

  disabledStartHours = (e,index,ins) => {
    const { form } = this.props;
    const endValue = form.getFieldValue(`businessTimeEnd${index}${ins}`);
    const list = [];
    for (let i = 0; i < 24; i++) {
      if (moment(endValue, timeFormat).hour() < i) {
        list.push(i);
      }
    }
    return list;
  };

  disabledEndMinutes = (e,index,ins) => {
    const { form } = this.props;
    const startTime = form.getFieldValue(`businessTimeStart${index}${ins}`);
    const endTime = form.getFieldValue(`businessTimeEnd${index}${ins}`);
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

  disabledEndHours = (e,index,ins) => {
    const { form } = this.props;
    const startTime = form.getFieldValue(`businessTimeStart${index}${ins}`);
    const list = [];
    for (let i = 0; i < 24; i++) {
      if (moment(startTime, timeFormat).hour() > i) {
        list.push(i);
      }
    }
    return list;
  };

  handleMonth = (type,index,e) => {
    const {cardUseDateDtoList} = this.state;
    const {form} = this.props;
    let mon = undefined;
    if(e) {
      mon = moment(e).format('MM');
    }
    if(type==='start') {
      cardUseDateDtoList.forEach(item => {
        if(item.startMonth === mon) {
          message.warning('同一个月份只能出现一次');
          form.setFieldsValue({
            'startMonth{index}': null
          });
          cardUseDateDtoList[index].startMonth = null;
        }
      })
      cardUseDateDtoList[index].startMonth = e?moment(e).format('MM'):undefined;
    } else if(type==='end') {
      cardUseDateDtoList.forEach(item => {
        if(item.endMonth === mon) {
          message.warning('同一个月份只能出现一次');
          form.setFieldsValue({
            'endMonth{index}': null,
          });
          cardUseDateDtoList[index].endMonth = null;
        }
      })
      cardUseDateDtoList[index].endMonth = e?moment(e).format('MM'):undefined;
    }
    this.setState({
      cardUseDateDtoList,
    })
  }


  handleTime = (type,index,ins,e) => {
    const {cardUseDateDtoList} = this.state;
    if(type==='start') {
      cardUseDateDtoList[index].cardUseDateTimeDtoList[ins].startTime = e?moment(e).format('HH:mm'):undefined;
    } else if(type==='end') {
      cardUseDateDtoList[index].cardUseDateTimeDtoList[ins].endTime = e?moment(e).format('HH:mm'):undefined;
    }
    this.setState({
      cardUseDateDtoList,
    })
  }

  handleSetTime = (e) => {
    this.setState({
      checkedTimeList: e.target.checked ? [1] : [],
    });
  }

  validateConsumeTimes = (rule, value, callback) => {
    const { form } = this.props;
    if (value && form.getFieldValue("consumeTotalTimes")) {
      if (value > form.getFieldValue("consumeTotalTimes")) {
        callback("日最大可用次数必须小于最大可用次数");
      } else {
        form.setFields({
          consumeTotalTimes: {
            value: form.getFieldValue("consumeTotalTimes"),
          },
        });
      }
    }
    callback();
  };

  validateMaxUsage = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value < form.getFieldValue("consumeTimes")) {
      callback("最大可用次数必须大于日最大可用次数");
    }
    if (form.getFieldValue("consumeTimes")) {
      form.setFields({
        consumeTimes: {
          value: form.getFieldValue("consumeTimes"),
        },
      });
    }
    callback();
  };

  render() {
    const { form: { getFieldDecorator },card:{applicableItemsList,cardList, form } } = this.props;
    const { id,yearCard,cardUseDateDtoList,checkedTimeList } = this.state;
    console.log(cardList);
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
    const format='HH:mm';

    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.reductionTableListForm}>
              <Form>
                <Row>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='卡类型'>
                      {getFieldDecorator('cardType',{
                        rules: [{ required: true, message:'请选择卡类型' }],
                        initialValue:cardList && cardList.cardType
                      })(
                        <Select disabled={!!id} placeholder='请选择' onChange={this.handleCartType}>
                          <Select.Option key={1} value={1}>年卡</Select.Option>
                          <Select.Option key={2} value={2}>储值卡</Select.Option>
                          <Select.Option key={3} value={3}>次卡</Select.Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='卡名称'>
                      {getFieldDecorator('cartName',{
                        rules: [
                          {
                            required: true,
                            message:'请输入卡名称'
                          },
                        ],
                        initialValue:cardList && cardList.cartName
                      })(
                        <Input placeholder='请输入卡名称' maxLength={50}/>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={20}>
                    <FormItem
                      {...formItemLayout}
                      label='适用项目'
                    >
                      {getFieldDecorator('sportItem',{
                        rules: [
                          {
                            required: true,
                            message:'请选择适用项目'
                          },
                        ],
                        valuePropName:'checked',
                        initialValue:this.state.checkedList
                      })(
                        <Fragment>
                          <Checkbox value={0} onChange={this.onCheckAllChange} checked={this.state.checkAll}>全部</Checkbox>
                          <Checkbox.Group style={{display:'inline'}} value={this.state.checkedList} onChange={this.onCheckPlaceChange}>
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
                <Row>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='卡面价格(元)'
                    >
                      {getFieldDecorator('cardViewPrice',{
                        rules: [
                          {
                            required: true,
                            message:'请输入卡面价格'
                          },
                          {
                            pattern: /^\d{0,9}(?:\.\d{1,2})?$/,
                            message: '卡面价格只能为数字，且最大为999999999.99',
                          },
                        ],
                        initialValue: cardList && cardList.cardViewPrice,
                      })(<Input style={{width:'100%'}} placeholder='请输入卡面价格' />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='销售价格(元)'
                    >
                      {getFieldDecorator('cardSalePrice',{
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
                        initialValue: cardList && cardList.cardSalePrice,
                      })(<Input style={{width:'100%'}} placeholder='请输入销售价格' />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='押金'
                    >
                      {getFieldDecorator('cardDeposit',{
                        rules: [
                          {
                            required: true,
                            message:'请输入押金'
                          },
                          {
                            pattern: /^\d{0,9}(?:\.\d{1,2})?$/,
                            message: '押金只能为数字，且最大为999999999.99',
                          },
                        ],
                        initialValue: cardList && cardList.cardDeposit,
                      })(<Input style={{width:'100%'}} placeholder='请输入押金' />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
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
                            message: '初始库存必须为整数，且最大值为999999',
                          },
                        ],
                        initialValue: cardList && cardList.initialStock,
                      })(<Input disabled={id} style={{width:'100%'}} placeholder='请输入初始库存' />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                  <FormItem {...formItemLayout} label='有效期限'>
                    {getFieldDecorator('validDay',{
                      rules: [{ required: true, message:'请输入有效期限' }],
                      initialValue: cardList && cardList.validDay,
                    })(<InputNumber style={{width:'100%'}} placeholder='请输入有效期限' />)}
                  </FormItem>
                  </Col>
                </Row>
                {(yearCard === 1 || yearCard === 3) &&
                  <Row>
                    <Col span={12}>
                      <FormItem {...formItemLayout} label="最大使用次数/日">
                        {getFieldDecorator('consumeTimes',{
                          rules: [
                            { required: true, message:'请输入日消费次数' },
                            { validator: this.validateConsumeTimes },
                          ],
                          initialValue: cardList && cardList.consumeTimes,
                        })(<InputNumber min={1} max={9999} precision={0} style={{ width: "100%" }} />)}
                      </FormItem>
                    </Col>
                    {yearCard ===3 && (
                      <Col span={12}>
                        <FormItem {...formItemLayout} label="最大可用次数">
                          {getFieldDecorator('consumeTotalTimes',{
                            rules: [
                              { required: true, message:'请输入最大可用次数' },
                              { validator: this.validateMaxUsage },
                            ],
                            initialValue: cardList && cardList.consumeTotalTimes,
                          })(<InputNumber min={1} max={9999} precision={0} style={{ width: "100%" }} />)}
                        </FormItem>
                      </Col>
                    )}
                    {yearCard === 1 && (
                      <Col span={12}>
                        <FormItem{...formItemLayout} label='消费时间(分钟)/次'>
                          {getFieldDecorator('duration',{
                            rules: [
                              { required: true, message:'请输入次消费时长' },
                              { pattern: /^[0-9]\d{0,2}$/, message: '日消费时长必须为整数，且最大值为999' },
                            ],
                            initialValue: cardList && cardList.duration,
                          })(<Input/>)}
                        </FormItem>
                      </Col>
                    )}
                  </Row>
                }
                {yearCard === 1 &&
                  <Row>
                    <Col span={12}>
                      <FormItem
                        {...formItemLayout}
                        label='超时价格(元)'
                      >
                        {getFieldDecorator('timeoutBillingPrice',{
                          rules: [
                            {
                              required: true,
                              message:'请输入超时价格'
                            },
                            {
                              pattern: /^\d{0,9}(?:\.\d{1,2})?$/,
                              message: '超时价格只能为数字，且最大为999999999.99',
                            },
                          ],
                          initialValue: cardList && cardList.timeoutBillingPrice,
                        })(<Input style={{width:'100%'}} placeholder='请输入超时价格'/>)}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem
                        {...formItemLayout}
                        label='超时计费单位(分钟)'
                      >
                        {getFieldDecorator('timeoutBillingUnit',{
                          rules: [
                            {
                              required: true,
                              message:'请输入超时计费单位'
                            },
                            {
                              pattern: /^[0-9]\d{0,2}$/,
                              message: '超时计费单位必须为整数，且最大值为999',
                            },
                          ],
                          initialValue: cardList && cardList.timeoutBillingUnit,
                        })(<Input />)}
                      </FormItem>
                    </Col>
                  </Row>
                }
                {yearCard === 1 && (
                  <Row>
                    <Col span={2} offset={1}>
                      <Button
                        onClick={this.handleAddMonth}
                        className={styles.buttonColor}>添加限制时段</Button>
                    </Col>
                  </Row>
                )}
                {yearCard ===1 && cardUseDateDtoList && cardUseDateDtoList.length > 0 && cardUseDateDtoList.map((item,index) => (
                    <div key={index}>
                      <Row gutter={5}>
                        <Col span={10}>
                          <FormItem
                            {...formItemLayout}
                            label='开始月份'
                          >
                            {getFieldDecorator(`startMonth${index}`, {
                              // rules: [{ required: true, message: '请选择开始月份' }],
                              initialValue: item.startMonth && moment(item.startMonth, 'MM'),
                            })(
                              <MonthPicker
                                dropdownClassName={styles.calendarCustom}
                                style={{ width: '100%' }}
                                format="MM"
                                disabledDate={(e) => this.disabledStartDate(e,index)}
                                placeholder='请选择起始月份'
                                onChange={(e) => this.handleMonth('start',index, e)}
                              />
                            )}
                          </FormItem>
                        </Col>
                        <Col span={10}>
                          <FormItem
                            {...formItemLayout}
                            label='截止月份'
                          >
                            {getFieldDecorator(`endMonth${index}`, {
                              // rules: [{ required: true, message: '请选择截止月份' }],
                              initialValue: item.endMonth && moment(item.endMonth, 'MM'),
                            })(
                              <MonthPicker
                                dropdownClassName={styles.calendarCustom}
                                style={{ width: '100%' }}
                                format="MM"
                                disabledDate={(e) => this.disabledEndDate(e,index)}
                                placeholder='请选择结束月份'
                                onChange={(e) => this.handleMonth('end',index, e)}
                              />
                            )}
                          </FormItem>
                        </Col>
                        <Col span={2}>
                          <FormItem>
                            <Button className={styles.buttonColor} onClick={() => this.handleAddTime(index)}>添加时间段</Button>
                          </FormItem>
                        </Col>
                        {
                          index >=1 && <Col span={2}>
                            <FormItem>
                              <Button className={styles.buttonColor} onClick={() => this.handleDeleteMon(index)}>删除</Button>
                            </FormItem>
                          </Col>
                        }
                      </Row>
                      <Row>
                        {
                          cardUseDateDtoList[index].cardUseDateTimeDtoList && cardUseDateDtoList[index].cardUseDateTimeDtoList.length > 0 && cardUseDateDtoList[index].cardUseDateTimeDtoList.map((it, ins) => (
                            <Col span={8}  key={ins}>
                              <FormItem {...formItemLayout} label="限制时间段">
                                <Row gutter={5}>
                                  <Col span={11}>
                                    <FormItem style={{ marginBottom: 0 }}>
                                      {getFieldDecorator(`businessTimeStart${index}${ins}`, {
                                        // rules: [{ required: true, message: '请选择起始日期' }],
                                        initialValue: it && it.startTime && moment(it.startTime, "HH:mm"),
                                      })(
                                        <TimePicker
                                          style={{ width: '100%' }}
                                          format={format}
                                          disabledMinutes={(e) => this.disabledStartMinutes(e,index,ins)}
                                          disabledHours={(e) => this.disabledStartHours(e,index,ins)}
                                          onChange={(e) => this.handleTime('start',index,ins, e)}
                                        />
                                      )}
                                    </FormItem>
                                  </Col>
                                  <Col span={11}>
                                    <FormItem style={{ marginBottom: 0 }}>
                                      {getFieldDecorator(`businessTimeEnd${index}${ins}`, {
                                        // rules: [{ required: true, message: '请选择结束日期' }],
                                        initialValue: it && it.endTime && moment(it.endTime, "HH:mm"),
                                      })(
                                        <TimePicker
                                          style={{ width: '100%' }}
                                          format={format}
                                          disabledMinutes={(e) => this.disabledEndMinutes(e,index,ins)}
                                          disabledHours={(e) => this.disabledEndHours(e,index,ins)}
                                          onChange={(e) => this.handleTime('end',index,ins, e)}
                                        />
                                      )}
                                    </FormItem>
                                  </Col>
                                  {
                                    ins >=1 && <Col span={2}>
                                      <Button className={styles.buttonColor} onClick={() => this.handleDeleteTime(index,ins)}>删除</Button>
                                    </Col>
                                  }
                                </Row>
                              </FormItem>
                            </Col>))
                        }
                      </Row>
                    </div>
                  ))
                }
              </Form>
            </div>
          </div>
          <div style={{ overflow: 'hidden',width:'100%' }}>
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={14} offset={10}>
                <Button
                  type="primary"
                  onClick={this.handleCancel}
                  className={styles.buttonColor}
                >
                  取消
                </Button>
                <Button
                  style={{marginLeft:5}}
                  htmlType="submit"
                  onClick={this.handleConfirm}
                  loading={this.state.loading}
                  className={styles.buttonColor}>确认</Button>
              </Col>
            </Row>
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
