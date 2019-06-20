import React, { Component } from 'react';
import { Card, Button, Form, Col, Row, Input, Table } from 'antd';
import { connect } from 'dva';
import FooterToolbar from '@/components/FooterToolbar';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import router from "umi/router";
import styles from './style.less';

@connect(({order, loading }) => ({
  order,
  loading: loading.models.order,
}))
@Form.create()
class ticketDetails extends Component {
  action = {
    detailsInfo:'order/detailsinfo',
  };

  state = {
    // isMember: 1,
    // dataSoure: [],
    // couponNo:1,// 票券号码，先模拟
    // outVisible: false,// 出场modal
    // inVisible:false,// 入场modal
    startValue: null,
    endValue: null,
    // endOpen: false,
    venueType:null,// 场馆id
    sportType:null,// 运动类型id
    radioType:1,// Radio变化时候的值
    /* ======================================== */
    width: '100%',
  };

  componentDidMount() {
    const { dispatch, location } = this.props;
    if (location && location.search) {
      const { query } = location;
      const param={
        orderBasicInfoId:query.id,
      };
      dispatch({
        type: this.action.detailsInfo,
        payload: param,
      }).then(()=>{
        const {order:{detailsInfoResult}}=this.props;
        if (detailsInfoResult &&
          detailsInfoResult.ticketDetails) {
          this.detail1.innerHTML = detailsInfoResult.ticketDetails;
        }
        if (detailsInfoResult &&
          detailsInfoResult.purchaseNotes) {
          this.detail2.innerHTML = detailsInfoResult.purchaseNotes;
        }
      })
    }
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
   * @Description //返回按钮
   * @Date 19:17 2018/12/8
   * @Param
   * @return
   * */
  handleReturn = () =>{
    const pathname = `/order/saleOrder/list`;
    router.push({
      pathname,
    });
  };

  /**
   * @Author luzhijian
   * @Description //查询按钮
   * @Date 17:41 2019/1/7
   * @Param
   * @return
   * */
  handleQelect=()=>{
    const { form: { validateFieldsAndScroll }, dispatch } = this.props;
    const {startValue,endValue,sportType,venueType,radioType}=this.state;
    validateFieldsAndScroll((error, values) => {
      const param={
        pageSize:10,
        pageNo:1,
        sportId:sportType,
        venueId:venueType,
        type:radioType,
        name:values.name,
        contact:values.contact,
        consumeStatus:values.consumptionState,
        // admissionStartTime:startValue.format("YYYY-MM-DD HH:mm:ss"),
        // admissionStartEnd:endValue.format("YYYY-MM-DD HH:mm:ss"),
        admissionStartTimeString:startValue!==null?startValue.format("YYYY-MM-DD HH:mm:ss"):null,
        admissionStartEndString:endValue!==null?endValue.format("YYYY-MM-DD HH:mm:ss"):null,
      };
      dispatch({
        type: this.action.admissionList,
        payload: param,
      })
    });
  };

  bindRef2 = (body) => {
    this.detail2 = body;
  };

  bindRef1 = (body) => {
    this.detail1 = body;
  };

  render() {
    const { form: { getFieldDecorator }, submitting, order:{detailsInfoResult} } = this.props;
    const {width} = this.state;

    const formItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 9 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 15 } },
    };

    const columns = [
      { title: '票券号码', dataIndex: 'couponNo', key: 'couponNo' },
      { title: '票券名', dataIndex: 'couponName', key: 'couponName' },
      { title: '运动项目', key: 'sportItemName', dataIndex: 'sportItemName' },
      { title: '适用场地', key: 'applyCourtName', dataIndex: 'applyCourtName' },
      { title: '适用日期范围',
        key: 'bookingDate1',
        dataIndex: 'bookingDate1',
        render: (text, record) =>
          <span>
            {record.applyDateStart}--{record.applyDateEnd}
          </span>
      },
      { title: '适用日期类型', key: 'applyDateType', dataIndex: 'applyDateType' },
      {
        title: '适用时间范围',
        key: 'bookingDate3',
        dataIndex: 'bookingDate3',
        render: (text, record) =>
          <span>
            {record.applyTimeStart}--{record.applyTimeEnd}
          </span>
      },
      { title: '使用时长(分钟)', key: 'duration', dataIndex: 'duration' },
      { title: '价格(元)', key: 'ticketSalePrice', dataIndex: 'ticketSalePrice' },
    ];

    // 是否为未支付状态(不显示支付金额)
    const isUnPay = detailsInfoResult && detailsInfoResult.orderBasicInfoListDto && (detailsInfoResult.orderBasicInfoListDto.paymentStatusString === "未支付" || detailsInfoResult.orderBasicInfoListDto.paymentStatusString === "已取消");

    const contentFormItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 3 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 21 } },
    };

    return (
      <PageHeaderWrapper title="购票详情信息" wrapperClassName={styles.advancedForm}>
        <Card title="订单信息" bordered={false} style={{height:"100%"}}>
          <Form hideRequiredMark>
            {/* 订单号码 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="订单号码:">
                  {getFieldDecorator('number', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.orderNo,
                  })
                  (<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="创建时间:">
                  {getFieldDecorator('createDate', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.orderDate,
                  })
                  (<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="支付流水号:">
                  {getFieldDecorator('water', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.paymentNo,
                  })
                  (<Input disabled />)}
                </Form.Item>
              </Col>
            </Row>
            {/* 姓名 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="姓名:">
                  {getFieldDecorator('name', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.memberName,
                  })
                  (<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="联系方式:">
                  {getFieldDecorator('tel', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.memberTel,
                  })
                  (<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="订单类型:">
                  {getFieldDecorator('orderType', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.orderTypeString,
                  })
                  (<Input disabled />)}
                </Form.Item>
              </Col>
            </Row>
            {/* 订单名称 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="订单名称:">
                  {getFieldDecorator('orderName', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.orderName,
                  })
                  (<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="支付状态:">
                  {getFieldDecorator('orderState', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.paymentStatusString,
                  })
                  (<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="支付时间:">
                  {getFieldDecorator('orderTime', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.paymentTime,
                  })
                  (<Input disabled />)}
                </Form.Item>
              </Col>
            </Row>
            {/* 支付方式 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="支付方式:">
                  {getFieldDecorator('payType', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.paymentModeString,
                  })
                  (<Input disabled />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="支付金额(元):">
                  {getFieldDecorator('payMoney', {
                    initialValue: isUnPay ? undefined : detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.paymentAmount,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="退款时间:">
                  {getFieldDecorator('tuiTime', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.refundTime,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
            </Row>
            {/* 退款金额(元) */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="退款金额(元):">
                  {getFieldDecorator('tuiValue', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.refundAmount,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="订单金额(元):">
                  {getFieldDecorator('orderValue', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.orderAmount,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        {/* 销售订单 */}
        <Card title="票券信息" bordered={false} style={{height:"100%"}}>
          <Form hideRequiredMark>
            <Table
              rowKey={record => record.id}
              pagination={false}
              bordered
              columns={columns}
              dataSource={detailsInfoResult&&detailsInfoResult.orderDetailedInfoList}
              scroll={{ x: 1750}}
            />
            <Row>
              <Col span={24} style={{marginTop:"6%"}}>
                <Form.Item {...contentFormItemLayout} label="门票详情:">
                  {getFieldDecorator('ticketDetail', {
                  })(
                    <div style={{backgroundColor: "#EBEBE4",minHeight:150}} ref={body => this.bindRef1(body)} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item {...contentFormItemLayout} label="购买须知:">
                  {getFieldDecorator('instructions', {
                  })(
                    <div style={{backgroundColor: "#EBEBE4",minHeight:150}} ref={body => this.bindRef2(body)} />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        <FooterToolbar style={{ width }}>
          <Button style={{marginLeft:"50%"}} type="primary" onClick={this.handleReturn} loading={submitting}>
            返回
          </Button>
        </FooterToolbar>
      </PageHeaderWrapper>
    );
  }
}

export default ticketDetails;
