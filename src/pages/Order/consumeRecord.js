import React, { Component } from 'react';
import { connect } from 'dva';
import router from "umi/router";
import { Card, Button, Form, Tabs, Col, Row, DatePicker, Input, Select, Checkbox, Radio, Table } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Credentials from './Credentials';
import Ellipsis from '../../components/Ellipsis';
import { hasAuthority, noMatch } from '../../utils/authority';
import Authorized from '../../utils/Authorized';
import styles from './style.less';

@connect(({order, loading }) => ({
  order,
  loading: loading.models.order,
}))
@Form.create()
class saleOrder extends Component {
  action = {
    // venueName:'cashiers/venuename',
    // admissionList:'cashiers/admissionlist',
    // admissionIn:'cashiers/admissionin',
    // admissionOut:'cashiers/admissionout',
    // admissionInSure:'cashiers/admissioninsure',
    // =================================
    consumeRecordList:'order/consumerecordlist',
    soprtList: 'order/sportlist',
    consumeState: 'order/consumestate',
    qelectList: 'order/qelectlist',
  };

  state = {
    current: 1,
    pageSize: 10,
    isMember: 1,
    dataSoure: [],
    couponNo:1,// 票券号码，先模拟
    outVisible: false,// 出场modal
    inVisible:false,// 入场modal
    startValue: null,
    endValue: null,
    endOpen: false,
    venueType:null,// 场馆id
    sportType:null,// 运动类型id
    radioType:1,// Radio变化时候的值
    /* ======================================== */
    width: '100%',
    key: "1", // 当前查询选项卡
    credentials: {}, // 凭证查询信息
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: this.action.soprtList,
    });
    dispatch({
      type: this.action.consumeState,
    });
    const param={
      pageNo:1,
      pageSize:10,
      // consumeDateStart:moment(moment().subtract(7, 'days').calendar(),"YYYY-MM-DD").format("YYYY-MM-DD"),
      // consumeDateEnd:moment(new Date(),"YYYY-MM-DD").format("YYYY-MM-DD"),
    };
    dispatch({
      type: this.action.consumeRecordList,
      payload: param,
    }).then(()=>{
        const {order:{consumeRecordListResult}}=this.props;
        this.setState({
          dataSoure:consumeRecordListResult&&consumeRecordListResult.data&&consumeRecordListResult.data.list,
        })
      }
    )
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeFooterToolbar);
  }

  resizeFooterToolbar = () => {
    requestAnimationFrame(() => {
      const sider = document.querySelectorAll('.ant-layout-sider')[0];
      if (sider) {
        const width = `calc(100% - ${sider.style.width})`;
        const { width: stateWidth } = this.state;
        if (stateWidth !== width) {
         this.setState({ width });
        }
      }
    });
  };

  /**
   * @Author luzhijian
   * @Description //时间空间调用方法开始
   * @Date 17:22 2019/1/3
   * @Param
   * @return
   * */
  disabledStartDate = (startValue) => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }

  disabledEndDate = (endValue) => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  onStartChange = (value) => {
    this.onChange('startValue', value);
  }

  onEndChange = (value) => {
    this.onChange('endValue', value);
  }

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  }

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  }

  /**
   * @Author luzhijian
   * @Description //时间空间调用方法结束
   * @Date 17:22 2019/1/3
   * @Param
   * @return
   * */


  /**
   * @Author luzhijian
   * @Description //查询按钮
   * @Date 17:41 2019/1/7
   * @Param
   * @return
   * */
  handleQelect=()=>{
    const { form: { validateFieldsAndScroll }, dispatch } = this.props;
    const {startValue,endValue,sportType,venueType,radioType,current,pageSize}=this.state;
    validateFieldsAndScroll((error, values) => {
      const param={
        pageSize:10,
        pageNo:current,
        orderNo:values.orderNo,
        memberTel:values.memberTel,
        memberName:values.memberName,
        consumeStatus:values.consumeStatus===0?null:values.consumeStatus,
        cardNo:values.cardNo?values.cardNo:null, //卡号
        wristStrapNo: values.wristStrapNo?values.wristStrapNo:null, // 手环号
        sportItemId:values.sportItemId,
        consumeDateStart:values.consumeDateStart?values.consumeDateStart.format("YYYY-MM-DD"):null,
        consumeDateEnd:values.consumeDateEnd?values.consumeDateEnd.format("YYYY-MM-DD"):null,
      }
      dispatch({
        type: this.action.consumeRecordList,
        payload: param,
      }).then(()=>{
        const {order:{consumeRecordListResult}}=this.props;
        this.setState({
          dataSoure:consumeRecordListResult&&consumeRecordListResult.data&&consumeRecordListResult.data.list,
        })
      })
    });
  }

  /**
   * 凭证查询
   * @param values
   * @author jiangt
   */
  handleCredentials = (values) => {
    this.setState({ credentials: values }, () => { this.fetchList() });
  };

  fetchList = () => {
    const { dispatch } = this.props;
    const { credentials, current, pageSize }=this.state;
    const params = { ...credentials, pageNo: current, pageSize };
    dispatch({
      type: this.action.consumeRecordList,
      payload: params,
    }).then(() => {
      const { order: { consumeRecordListResult } }=this.props;
      this.setState({
        dataSoure: consumeRecordListResult && consumeRecordListResult.data && consumeRecordListResult.data.list,
      });
    });
  };

  /**
   * @Author luzhijian
   * @Description //详情
   * @Date 13:38 2019/1/10
   * @Param
   * @return
   * */
  handleRecordDetail=(record)=>{
    const pathname= `/order/consumeRecord/details`;
    const query = { id: record.id };
    router.push({
      pathname,
      query,
    });
  };


  /**
   * @Author luzhijian
   * @Description //退款
   * @Date 14:42 2019/1/10
   * @Param
   * @return
   * */
  handleRefund=(record)=>{
    const pathname = `/order/saleOrder/refund`;
    const query = { id: record.id };
    router.push({
      pathname,
      query,
    });
  };

  // 分页
  handleTableChange = (current, pageSize) => {
    this.setState({ current, pageSize }, () => {
      const { key } = this.state;
      if (key === '1') {
        this.handleQelect();
        return;
      }
      if (key === '2') {
        this.fetchList();
      }
    });
  };

  handleReset=()=>{
    const { dispatch, form } = this.props;
    form.resetFields();
    const param={
      pageNo:1,
      pageSize:10,
    }
    dispatch({
      type: this.action.consumeRecordList,
      payload: param,
    }).then(()=>{
      const {order:{consumeRecordListResult}}=this.props;
      this.setState({
        dataSoure:consumeRecordListResult&&consumeRecordListResult.data&&consumeRecordListResult.data.list,
      })
    })
  };

  render() {
    const { form: { getFieldDecorator }, order:{soprtListResult,consumeStateResult,consumeRecordListResult} } = this.props;
    const {isMember, width,startValue, endValue, endOpen,current,pageSize,dataSoure, key} = this.state;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    const hasAuth = hasAuthority("jis_platform_dc_record_detail");
    const columns = [
      {
        title: '票券号码',
        dataIndex: 'couponNo',
        key: 'couponNo',
        width: 190,
        // render: (text, record) => hasAuth ? <a onClick={() => this.handleRecordDetail(record)}>{text}</a> : text,
        render: (text) => text,
      },
      {
        title: '订单号码',
        dataIndex: 'orderNo',
        key: 'orderNo',
        width: 230,
        render: value => value || "-"
      },
      {
        title: '消费日期',
        dataIndex: 'consumeDate',
        key: 'consumeDate',
        width: 110,
        render: (text, record) =>
          <span>
            {record.consumeDate.substring(0,10)}
          </span>
      },
      { title: '运动项目', dataIndex: 'sportItemName', width: 160, render: val => <Ellipsis tooltip length={8}>{val}</Ellipsis> },
      // { title: '入场时间', dataIndex: 'inTime', key: 'inTime' },
      // { title: '出场时间', dataIndex: 'outTime', key: 'outTime' },
      // { title: '姓名', key: 'memberName', dataIndex: 'memberName' },
      // { title: '联系方式', key: 'memberTel', dataIndex: 'memberTel' },
      { title: '消费时长(分钟)',dataIndex: 'duration', key: 'duration', width: 130 },
      // { title: '消费金额(元)', key: 'consumeAmount', dataIndex: 'consumeAmount' },
      // {
      //   title: '入场凭证',
      //   key: 'inEvidence',
      //   dataIndex: 'inEvidence',
      //   width: 100,
      //   render: (text, record) =>
      //     <span>
      //       {record.inEvidence===1?"票券":"年卡"}
      //     </span>
      // },
      // { title: '消费流水号', key: 'consumeNo', dataIndex: 'consumeNo' },
      { title: '消费状态',dataIndex: 'consumeStatusString', key: 'consumeStatusString', width: 100 },
      {
        title: '操作',
        key: 'action',
        dataIndex: 'action',
        width: 80,
        render: (text, record) =>
          <span>
            <Authorized authority='jis_platform_dc_record_detail' nomatch={noMatch()}>
              <a onClick={() => this.handleRecordDetail(record)}>详情</a>
            </Authorized>
          </span>
      },
    ];

    return (
      <PageHeaderWrapper wrapperClassName={styles.advancedForm}>
        {/* 消费记录 */}
        <Card bordered={false} style={{height:"100%"}} title="消费记录">
          <Tabs type='card' activeKey={key} onChange={value => { this.setState({ key: value }) }}>
            <Tabs.TabPane tab='条件查询' key="1">
              <Form hideRequiredMark>
                {/* 订单号码 */}
                <Row>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="订单号码">
                      {getFieldDecorator('orderNo', {
                        // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                        // rules: [{ required: false, message: "请选择" }],
                      })
                      (<Input placeholder="输入订单号码" />)}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="联系方式">
                      {getFieldDecorator('memberTel', {
                        // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                        // rules: [{ required: false, message: "请选择" }],
                      })
                      (<Input placeholder="输入联系方式" />)}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="姓名">
                      {getFieldDecorator('memberName', {
                        // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                        // rules: [{ required: false, message: "请选择" }],
                      })
                      (<Input placeholder="输入姓名" />)}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="运动项目">
                      {getFieldDecorator('sportItemId', {
                        // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                        initialValue:"0",
                        // rules: [{ required: false, message: "请选择" }],
                      })
                      (
                        <Select allowClear placeholder='请选择'>
                          <Select.Option value="0" key="0">全部</Select.Option>
                          {soprtListResult.length>0&&soprtListResult.map(obj => (
                            <Select.Option key={obj.id} value={obj.id}>{obj.itemName}</Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                </Row>

                {/* 消费日期 */}
                <Row>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="消费日期">
                      {getFieldDecorator('consumeDateStart', {
                        // initialValue:moment(moment().subtract(7, 'days').calendar(),"YYYY-MM-DD"),
                        rules: [{ required: false, message: "请选择" }],
                      })
                      (
                        <DatePicker
                          disabledDate={this.disabledStartDate}
                          format="YYYY-MM-DD"
                          style={{width:"100%"}}
                          placeholder="开始日期"
                          onChange={this.onStartChange}
                          onOpenChange={this.handleStartOpenChange}
                        />
                      )
                      }
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="">
                      {getFieldDecorator('consumeDateEnd', {
                        // initialValue: moment(new Date(),"YYYY-MM-DD"),
                        rules: [{ required: false, message: "请选择" }],
                      })
                      (
                        <DatePicker
                          disabledDate={this.disabledEndDate}
                          format="YYYY-MM-DD"
                          style={{width:"100%",marginLeft:"6%"}}
                          placeholder="结束日期"
                          onChange={this.onEndChange}
                          open={endOpen}
                          onOpenChange={this.handleEndOpenChange}
                        />
                      )
                      }
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="消费状态">
                      {getFieldDecorator('consumeStatus', {
                        // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                        initialValue:"0",
                        // rules: [{ required: false, message: "请选择" }],
                      })
                      (
                        <Select allowClear placeholder='请选择'>
                          <Select.Option value="0" key="0">全部</Select.Option>
                          {consumeStateResult&&consumeStateResult.data&&consumeStateResult.data.map(obj => (
                            <Select.Option key={obj.code} value={obj.code}>{obj.value}</Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={6} style={{textAlign:'right'}}>
                    <Authorized authority='jis_platform_dc_record_query' nomatch={noMatch()}>
                      <Button type="primary" onClick={this.handleQelect} style={{ marginLeft:"10%" }}>
                        查询
                      </Button>
                    </Authorized>
                    <Button type="primary" onClick={() => this.handleReset()} style={{marginLeft:5}}>
                      重置
                    </Button>
                  </Col>
                </Row>
                {/* 卡号 */}
                <Row>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="卡号">
                      {getFieldDecorator('cardNo', {
                        // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                        // rules: [{ required: false, message: "请选择" }],
                      })(<Input placeholder="输入卡号" />)}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="手环号">
                      {getFieldDecorator('wristStrapNo', {
                        // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                        // rules: [{ required: false, message: "请选择" }],
                      })(<Input placeholder="输入手环号" />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Tabs.TabPane>
            <Tabs.TabPane tab='凭证查询' key="2">
              <Credentials onOk={values => this.handleCredentials(values)} />
            </Tabs.TabPane>
          </Tabs>
          <div>
            <Table
              rowKey={record=>record.id}
              pagination={{
                current,
                pageSize,
                defaultCurrent: 1,
                defaultPageSize: 10,
                total: consumeRecordListResult&& consumeRecordListResult.data && consumeRecordListResult.data.total,
                onChange: this.handleTableChange,
              }}
              bordered
              columns={columns}
              dataSource={dataSoure}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default saleOrder;
