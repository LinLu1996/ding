import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {
  Card,
  Form,
  Button,
  Table,
  Tooltip,
  Tag,
  Divider,
  Row,
  Col,
  DatePicker,
  Select,
  Input, TimePicker,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import classNames from 'classnames';
import styles from './index.less';
import Ellipsis from '../../components/Ellipsis';
import { noMatch } from '../../utils/authority';
import Authorized from '../../utils/Authorized';
import { doPrint } from '../../utils/batchStatisticsPrint';

@Form.create()
@connect(({ cashier,courts, loading }) => ({
  cashier,courts,
  loading: loading.models.cashier,
}))

class PersonalCenter extends Component {
  action = {
    soprtList: 'courts/sportlist',
    venueName:'cashier/findcourtinfo',
    cashierList:'cashier/fetchCashierlist',
    queryOperater: 'cashier/fetchQueryOperater',
    getPayList: 'cashier/fetchGetPayList',
  };

  state = {
    sportType:0,// 运动类型id
    venueType:0,// 场馆id
    startValue: null,
    endValue: null,
    endOpen:false,
  };

  componentDidMount() {
    const {
      dispatch,
    } = this.props;
    const p={
      type:1
    };

    // 获取操作人
    dispatch({
      type: this.action.queryOperater,
    });

    // 获取付款方式
    dispatch({
      type: this.action.getPayList,
    });

    // 获取适用项目
    dispatch({
      type: this.action.soprtList,
      payload: p,
    }).then(() =>{
      const {courts:{sportListResult}}=this.props;
      this.setState({
        sportType:sportListResult&&sportListResult.data&&sportListResult.data.length>0&&sportListResult.data[0].id,
      });
      if (sportListResult&&sportListResult.data&&sportListResult.data.length>0&&sportListResult.data[0].id) {
        const {sportType}=this.state;
        const param={
          sportId:sportListResult&&sportListResult.data&&sportListResult.data.length>0&&sportListResult.data[0].id,
        };
        const params={
          sportItemId:sportType,
        }
        dispatch({
          type: this.action.cashierList,
          payload: params,
        })
      }
    });
  }

  handleSearch = e => {
    e.preventDefault();
    this.checkFormAndSubmit();
  };

  checkFormAndSubmit = () => {
    const { current,pageSize,sportType } = this.state;
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const params = {
        pageNo:current,
        pageSize,
        creator:values.creator===undefined || values.creator==="全部"?null:values.creator,
        paymentMode:values.paymentMode===undefined || values.paymentMode==="全部"?null:values.paymentMode,
        applyDateStart:values.applyDateStart?values.applyDateStart.format("YYYY-MM-DD"):null,
        applyDateEnd:values.applyDateEnd?values.applyDateEnd.format("YYYY-MM-DD"):null,
        sportItemId:sportType,
      };
      dispatch({
        type: this.action.cashierList,
        payload: params,
      })
    });
  };

  /**
   * @Description: 处理适用场地
   * @author Lin Lu
   * @date 2019/2/25
  */
  handleVenueClick=(value)=>{
    this.setState({
      venueType:value,
    },() => {
      this.checkFormAndSubmit()
    });
  }

  /**
   * @Description: 处理适用项目
   * @author Lin Lu
   * @date 2019/2/25
  */
  handleSportClick=(value)=>{
    const {
      dispatch,
    } = this.props;
    const params={
      sportId:value,
    };
    dispatch({
      type: this.action.venueName,
      payload: params,
    })
    this.setState({
      sportType:value,
      venueType:0,
    },() => {
      this.checkFormAndSubmit()
    })
  };

  handleSale=(re)=>{
    const {sportType,venueType}=this.state;
    const pathname = `/cashier/cashierList/add`;
    const query = {
      record:re,
      sportId:sportType,
      venueId:venueType,
    };
    router.push({
      pathname,
      query,
    });
  }

  handleRefund=(record)=>{
    const pathname = `/order/saleOrder/refund`;
    const query = {
      id: record.id,
    };
    router.push({
      pathname,
      query,
    });
  };


  handleDetail=(re)=>{
      const {sportType,venueType}=this.state;
      const pathname = `/cashier/cashierList/detail`;
      const query = {
        record:re,
        sportId:sportType,
        venueId:venueType,
      };
      router.push({
        pathname,
        query,
      });
    }

  // 分页
  handleTableChange = (current, pageSize) => {
    this.setState(
      {
        current,
        pageSize,
      },
      () => {
        this.handleQelect();
      }
    );
  };

  handleQelect=()=>{
    const {
      dispatch,
    } = this.props;
    const {sportType,venueType}=this.state;
    const param={
      courtId:venueType===0?null:venueType,
      sportItemId:sportType,
    };
    dispatch({
      type: this.action.cashierList,
      payload: param,
    });


  };

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  }

  disabledStartDate = (startValue) => {
    const { endValue } = this.state;
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

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  };

  handlePrintOrder = () => {
    const { cashier:{ cashierList, operaterList }, courts: {sportListResult: {data: sportsList} }, form } = this.props;
    const { startValue, endValue, sportType} = this.state;
    // printOrder(item.orderNo);
    console.log(cashierList);
    console.log(this.state);
    console.log(sportsList);
    console.log(form.getFieldValue('creator'));

    let creator;
    operaterList.forEach(element => {
      if (form.getFieldValue('creator') == element.id){
        creator = element.fullname;
      };
    });
    let sportsName = '';
    sportsList.forEach(element => {
      if (sportType === element.id) {
        sportsName = element.itemName;
      }
    });
    const parmas = {
      sportsName,
      startValue: startValue ? startValue.format("YYYY-MM-DD") : '',
      endValue: endValue ? endValue.format("YYYY-MM-DD") : '',
      creator: creator ? creator : '全部',
      list: cashierList.sumAmounts,
      totalMoney: cashierList.totalMoney,
    }
    doPrint(parmas);
    // console.log(startValue.format("YYYY-MM-DD"), endValue.format("YYYY-MM-DD"));
  }

  render() {
    const selectedTag = classNames(styles.selectedTag, styles.normalTag);
    const defaultTag = classNames(styles.defaultTag, styles.normalTag);
    const { form:{ getFieldDecorator },courts:{sportListResult},cashier:{findCourtInfoResult,cashierList,paymentTypeList,operaterList} } = this.props;
    const {sportType,venueType,endOpen}=this.state;
    const columns = [
      {
      title: '票名',
      dataIndex: 'orderName',
      key:'orderName',
      },
      {
        title: '数量',
        dataIndex: 'count',
        key:'count',
      },
      {
        title: '价格（元）',
        dataIndex: 'money',
        key:'money',
      },

    ];
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        md: { span: 16 },
      },
    };

    return (
      <PageHeaderWrapper
        title="交班统计"
      >
        <Card style={{ height: '100%' }}>
          <Authorized authority='jis_platform_dc_cashier_change_sport' nomatch={noMatch()}>
            <div>
              {
                sportListResult&&sportListResult.data&&sportListResult.data.map(step =>
                {
                  return (
                    <Tooltip key={step.id} placement="topLeft" title={step.itemName && step.itemName.length > 8 ? step.itemName : undefined}>
                      <Tag.CheckableTag
                        className={sportType === step.id ? selectedTag : defaultTag}
                        style={{ marginRight: 5, marginTop: 24 }}
                        checked={sportType === step.id}
                        onChange={() => this.handleSportClick(step.id)}
                      >
                        <Ellipsis length={8}>{step.itemName}</Ellipsis>
                      </Tag.CheckableTag>
                    </Tooltip>
                  )
               })
              }
            </div>
          </Authorized>
          {/*<Authorized authority='jis_platform_dc_cashier_change_court' nomatch={noMatch()}>*/}
            {/*<div>*/}
              {/*<span>*/}
                {/*<Tooltip key={0} placement="topLeft" title="全部">*/}
                  {/*<Tag.CheckableTag*/}
                    {/*className={venueType === 0 ? selectedTag : defaultTag}*/}
                    {/*style={{ marginRight: 5, marginTop: 4 }}*/}
                    {/*checked={venueType === 0}*/}
                    {/*onChange={() => this.handleVenueClick(0)}*/}
                  {/*>*/}
                    {/*<Ellipsis length={8}>全部</Ellipsis>*/}
                  {/*</Tag.CheckableTag>*/}
                {/*</Tooltip>*/}
              {/*</span>*/}

              {/*{*/}
                {/*findCourtInfoResult&&findCourtInfoResult.data&&findCourtInfoResult.data.map(step =>*/}
                {/*{*/}
                  {/*return (*/}
                    {/*<Tooltip key={step.id} placement="topLeft" title={step.courtName && step.courtName.length > 8 ? step.courtName : undefined}>*/}
                      {/*<Tag.CheckableTag*/}
                        {/*className={venueType === step.id ? selectedTag : defaultTag}*/}
                        {/*style={{ marginRight: 5, marginTop: 4 }}*/}
                        {/*checked={venueType === step.id}*/}
                        {/*onChange={() => this.handleVenueClick(step.id)}*/}
                      {/*>*/}
                        {/*<Ellipsis length={8}>{step.courtName}</Ellipsis>*/}
                      {/*</Tag.CheckableTag>*/}
                    {/*</Tooltip>*/}
                  {/*)*/}
                {/*})*/}
              {/*}*/}
            {/*</div>*/}
          {/*</Authorized>*/}
          <Form>
            <Row>
              <Col span={6}>
                <Form.Item
                  label='操作人'
                  {...formItemLayout}
                >
                  {getFieldDecorator('creator',{
                    rules: [
                      {
                        required: true,
                        message:'请选择操作员'
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
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item {...formItemLayout} label="开始时间">
                  {getFieldDecorator('applyDateStart', {
                    // initialValue:moment(moment().subtract(7, 'days').calendar(),"YYYY-MM-DD HH:MM:SS"),
                  })
                  (
                    <DatePicker
                      disabledDate={this.disabledStartDate}
                      style={{width:'100%'}}
                      format="YYYY-MM-DD"
                      placeholder="开始时间"
                      onChange={this.onStartChange}
                      onOpenChange={this.handleStartOpenChange}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item {...formItemLayout} label="结束时间">
                  {getFieldDecorator('applyDateEnd', {
                    // initialValue:moment(new Date(),"YYYY-MM-DD HH:MM:SS"),
                  })
                  (
                    <DatePicker
                      disabledDate={this.disabledEndDate}
                      style={{width:'100%'}}
                      format="YYYY-MM-DD"
                      placeholder="结束时间"
                      onChange={this.onEndChange}
                      open={endOpen}
                      onOpenChange={this.handleEndOpenChange}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item {...formItemLayout} label="付款方式">
                  {getFieldDecorator('paymentMode', {
                    initialValue:"全部",
                  })
                  (
                    <Select>
                      <Select.Option value="全部" key="0">全部</Select.Option>
                      {paymentTypeList && paymentTypeList.length>0 && paymentTypeList.map(obj => (
                        <Select.Option key={obj.code} value={obj.code}>{obj.value}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24} style={{textAlign:'right'}} style={{ marginBottom: 20, textAlign: 'right' }}>
                <Button type="primary" onClick={this.handleSearch}>查询</Button>
                <Button type="primary" style={{marginLeft:'5px'}} onClick={() => this.handlePrintOrder()}>打印</Button>
              </Col>
            </Row>
          </Form>
          <div className={styles.resTable}>
            <Table
              rowKey={record => record.id}
              pagination={false}
              scroll={{x:1200}}
              columns={columns}
              dataSource={ cashierList&&cashierList.sumAmounts && cashierList.sumAmounts }
            />
          </div>
          <div>合计：{cashierList&&cashierList.sumAmounts && cashierList.totalMoney}</div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PersonalCenter;
