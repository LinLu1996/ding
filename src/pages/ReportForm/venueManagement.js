import React, { Component,Fragment } from 'react';
import { connect } from 'dva';
// import router from 'umi/router';
import { Form, Card, Row, Col, Button,Select,Checkbox,DatePicker,Table } from 'antd';
import { stringify } from 'qs';
import moment from 'moment';
import styles from './index.less';
import Ellipsis from '../../components/Ellipsis';
// import PageHeaderWrapper from '../../components/PageHeaderWrapper';
// import Authorized from '../../utils/Authorized';
// import { noMatch } from '../../utils/authority';

const FormItem = Form.Item;

@Form.create()
@connect(({ reportForm, loading }) => ({
  reportForm,
  loading: loading.models.reduction,
}))
class Reduction extends Component {
  action = {
    queryOperater: 'reportForm/fetchQueryOperater',
    querySport: 'reportForm/fetchQuerySport',
    handleGetTable: 'reportForm/handleGetTable',
  };

  state = {
    checkedList: [],
    isWatch:false,
  };

  componentDidMount() {
    const {current,pageSize} = this.state;
    const {dispatch} = this.props;

    // 获取操作人
    dispatch({
      type: this.action.queryOperater,
    });

    // 获取适用项目
    dispatch({
      type: this.action.querySport,
    });

  }

  componentWillReceiveProps(nextProps) {
    const { reportForm:{activeKey} } = nextProps;
    const { form } = this.props;
    if(this.props.reportForm.activeKey !==activeKey) {
      form.resetFields(['userId','beginDate','endDate','sportItem']);
      this.setState({
        checkedList:[],
        isWatch:false,
      })
    }
  }

  // 分页
  handleTableChange = (current, pageSize) => {
    this.setState(
      {
        current,
        pageSize,
      },
      () => {
        this.checkFormAndSubmit();
      }
    );
  };

  /**
   * @Description: 查询
   * @author Lin Lu
   * @date 2019/1/2
   */
  checkFormAndSubmit = () => {
    const { checkedList } = this.state;
    const { form,reportForm:{sportList,operaterList,activeKey} } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      let userNames = '全部';
      operaterList.forEach(item => {
        if(values.userId && values.userId ==='全部') {
          userNames ='全部';
        } else if(item.id === values.userId) {
          userNames = item.name;
        }
      })
      let params = {
        type:activeKey,
        userId:values.userId===undefined || values.userId==="全部"?null:values.userId,
        userName:userNames,
        beginDate:values.beginDate===null ?null:moment(values.beginDate).format("YYYY-MM-DD HH:mm:ss"),
        endDate:values.endDate===null ?null:moment(values.endDate).format("YYYY-MM-DD HH:mm:ss"),
        sportItems:checkedList,
      }
      let path = '';
      if(activeKey === '0') {
        path = '/venuebooking/global/report/courtReport';
      } else if(activeKey === '2') {
        path = '/venuebooking/global/report/courtReport';
      } else if(activeKey === '1' || activeKey === '3') {
        path = '/venuebooking/global/report/courtReport';
        params={
          type:activeKey,
          userId:values.userId===undefined || values.userId==="全部"?null:values.userId,
          userName:userNames,
          beginDate:values.beginDate===null ?null:moment(values.beginDate).format("YYYY-MM-DD HH:mm:ss"),
          endDate:values.endDate===null ?null:moment(values.endDate).format("YYYY-MM-DD HH:mm:ss"),
        }
      }
      window.location.href=`/api${path}?${stringify(params)}`;
    });
  };

  /**
   * @Description: 改变时间
   * @author Lin Lu
   * @date 2019/3/5
  */
  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  /**
   * @Description: 开始时间
   * @author Lin Lu
   * @date 2019/3/5
  */
  onStartChange = (value) => {
    this.onChange('startValue', value);
  }

  /**
   * @Description: 结束时间
   * @author Lin Lu
   * @date 2019/3/5
  */
  onEndChange = (value) => {
    this.onChange('endValue', value);
  }

  disabledStartDate = (startValue) => {
    const { endValue } = this.state;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
    const { startValue } = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  /**
   * @Description: 选择适用项目
   * @author Lin Lu
   * @date 2019/3/5
  */
  onCheckBoxChange = (checkedList) => {
    const { form,reportForm:{activeKey} } = this.props;
    if(activeKey==='2'){
      form.setFieldsValue({
        sportItem: checkedList.length>0 ? [checkedList[checkedList.length - 1]]:undefined,
      });
      this.setState({
        checkedList:[checkedList[checkedList.length - 1]],
      });
    } else {
      form.setFieldsValue({
        sportItem: checkedList.length>0 ? checkedList:undefined,
      });
      this.setState({
        checkedList,
      });
    }
  }

  /**
   * @Description: 查询列表
   * @author Lin Lu
   * @date 2019/3/5
  */
  handleSearch = () => {
    this.checkFormAndSubmit();
  };

  handleGetTable = () => {
    const { checkedList } = this.state;
    const { form,reportForm:{operaterList,activeKey},dispatch } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      this.setState({
        isWatch:true,
      })
      let userNames = '全部';
      operaterList.forEach(item => {
        if(values.userId && values.userId ==='全部') {
          userNames ='全部';
        } else if(item.id === values.userId) {
          userNames = item.name;
        }
      })
      const params = {
        type:activeKey,
        userId:values.userId===undefined || values.userId==="全部"?null:values.userId,
        userName:userNames,
        beginDate:values.beginDate===null ?null:moment(values.beginDate).format("YYYY-MM-DD HH:mm:ss"),
        endDate:values.endDate===null ?null:moment(values.endDate).format("YYYY-MM-DD HH:mm:ss"),
        sportItems:checkedList,
      }
      dispatch({
        type:this.action.handleGetTable,
        payload: params
      })
    });
  };

  // 表单
  renderSearchForm() {
    const {
      form: { getFieldDecorator },
      reportForm:{sportList,activeKey,operaterList},
    } = this.props;
    const { checkedList } = this.state;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 17 },
        md: { span: 15 },
      },
    };
    return (
      <div className={styles.tableList}>
        <div>
          <Form className={styles.reductionTableListForm} layout="inline">
            <Row gutter={5}>
              <Col span={8}>
                <FormItem
                  label='操作人'
                  {...formItemLayout}
                >
                  {getFieldDecorator('userId',{
                    rules: [
                      {
                        required: true,
                        message:'请选择操作人'
                      },
                    ],
                    initialValue:'全部'
                  })(
                    <Select allowClear={false} placeholder='请选择' onChange={this.getApplyCourt}>
                      <Select.Option key='全部' value='全部'>
                        全部
                      </Select.Option>
                      {operaterList && operaterList.length && operaterList.map(obj => (
                        <Select.Option key={obj.id} value={obj.id}>
                          {obj.fullname}
                        </Select.Option>
                      ))}
                    </Select>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label='开始时间'
                  {...formItemLayout}
                >
                  {getFieldDecorator('beginDate',{
                    rules: [
                      {
                        required: true,
                        message:'请选择开始时间'
                      },
                    ],
                    initialValue:null
                  })(
                    <DatePicker
                      disabledDate={this.disabledStartDate}
                      showTime
                      style={{width:'100%'}}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="开始时间"
                      onChange={this.onStartChange}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label='结束时间' {...formItemLayout}>
                  {getFieldDecorator('endDate',{
                    rules: [
                      {
                        required: true,
                        message:'请选择结束时间'
                      },
                    ],
                    initialValue:null
                  })(
                    <DatePicker
                      disabledDate={this.disabledEndDate}
                      showTime
                      style={{width:'100%'}}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="结束时间"
                      onChange={this.onEndChange}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={5}>
              {
                (activeKey === '0' || activeKey === '2') &&
                <Col span={20}>
                  <FormItem label='适用项目' {...formItemLayout}>
                    {getFieldDecorator('sportItem',{
                      rules: [
                        {
                          required: true,
                          message:'请选择适用项目'
                        },
                      ],
                    })(
                      <Fragment>
                        <Checkbox.Group style={{display:'inline'}} value={checkedList} onChange={this.onCheckBoxChange}>
                          {
                            sportList && sportList.length>0 && sportList.map((item) => (
                              <Checkbox key={item.id} value={item.id}>{item.itemName}</Checkbox>
                            ))
                          }
                        </Checkbox.Group>
                      </Fragment>
                    )}
                  </FormItem>
                </Col>
              }
              <Col span={2}>
                <Button
                  type="primary"
                  onClick={() => this.handleSearch()}
                  className={styles.buttonColor}
                >
                  下载报表
                </Button>
              </Col>
              <Col span={2}>
                <Button
                  type="primary"
                  onClick={() => this.handleGetTable()}
                  className={styles.buttonColor}
                >
                  查看报表
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }


  render() {
    const { reportForm:{activeKey,pageInfo} } = this.props;
    const { isWatch } = this.state;
    const titles = activeKey === '0'? '场馆经营汇总报表' : activeKey === '1'? '会员老卡换卡报表':
      activeKey === '2'? '运动项目销售报表': activeKey === '3'? '支付情况报表': '';
    const columns = [
      { title: '项目名称', dataIndex: 'couponName',width:400,
        render:(text) => (
          <div><Ellipsis length={35} tooltip>{text}</Ellipsis></div>
        )},
      { title: '操作类型', dataIndex: 'orderType'},
      { title: '数量', dataIndex: 'count'},
      { title: '金额', dataIndex: 'money' },
      ];
    const columnsMember = [
      { title: '老卡卡号', dataIndex: 'cardNo'},
      {
        title: '老卡类型',
        dataIndex: 'cardType',
        render: text => (
          <span>{ text===1 ? '年卡':text===2 ? '储值卡': '' }</span>
        )
      },
      { title: '会员姓名', dataIndex: 'memberName'},
      { title: '剩余次数', dataIndex: 'consumeTimes'},
      { title: '到期日期', dataIndex: 'validDate'},
      { title: '换卡时间', dataIndex: 'updateDate'},
      {
        title: '新卡类型',
        dataIndex: 'cardType',
        render: text => (
          <span>{ text===1 ? '年卡':text===2 ? '储值卡': '' }</span>
        )
      },
      { title: '换卡操作员', dataIndex: 'regenerator'},
      ];
    const columnsSport = [
      { title: '票号', dataIndex: 'couponNo'},
      {
        title: '操作员',
        dataIndex: 'regenerator',
      },
      { title: '票务名称', dataIndex: 'couponName'},
      { title: '金额', dataIndex: 'ticketSalePrice'},
      { title: '人数', dataIndex: 'totalNum'},
      { title: '时间', dataIndex: 'createDate'},
      {
        title: '可玩时间',
        dataIndex: 'duration',
      },
      ];
    const columnsPay = [
      { title: '支付类型', dataIndex: 'couponName'},
      {
        title: '金额',
        dataIndex: 'money',
      },
      ];
    return (
      <div>
        <div>{titles}</div>
        <Card bordered>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSearchForm()}</div>
          </div>
        </Card>
        {
          isWatch && <Table
            loading={false}
            columns={activeKey === '1'? columnsMember:activeKey === '2'?columnsSport:activeKey === '3'? columnsPay:columns}
            rowKey={record => record.id}
            dataSource={pageInfo}
            pagination={false}
          />
        }
      </div>
    );
  }
}

export default Reduction;
