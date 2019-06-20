import React, { Component } from 'react';
import { connect } from 'dva';
import router from "umi/router";
import { Card, Button, Form, Col, Row, DatePicker, Input, Select, Modal, Radio, Table, Divider, Tabs } from 'antd';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import Ellipsis from '../../components/Ellipsis';
import styles from './style.less';
import { hasAuthority, noMatch } from '../../utils/authority';
import Authorized from '../../utils/Authorized';
import request from '../../utils/request';
import { handleResponse } from '../../utils/globalUtils';
import { doPrint } from '../../utils/batchPrint';
import Credentials from './Credentials';

@connect(({ order, card, loading }) => ({
  order, card,
  loading: loading.models.order,
}))
@Form.create()
class saleOrder extends Component {
  action = {
    financeBillsList: 'order/financebillslist',
    printBracelet: 'order/printbracelet',
    getTicketType: 'order/fetchGetTicketType',
  };

  state = {
    sportItems: [],
    current: 1,
    pageSize: 10,
    isMember: 1,
    dataSoure: [],
    outVisible: false,// 出场modal
    inVisible: false,// 入场modal
    startValue: null,
    endValue: null,
    endOpen: false,
    venueType: null,// 场馆id
    sportType: null,// 运动类型id
    radioType: 1,// Radio变化时候的值
    /* ======================================== */
    width: '100%',
    // 选择性别后打印
    formModal: {
      visible: false,
      couponNo: undefined,
    },
    key: "1", // 当前查询选项卡
    credentials: {}, // 凭证查询信息
  };

  componentDidMount() {
    this.initialSportItems();
    const { dispatch } = this.props;
    // 获取票券类型
    dispatch({
      type: this.action.getTicketType,
      payload: { type: 'SALE_TYPE' }
    });

    const param = {
      pageNo: 1,
      pageSize: 10,
      // consumeDateStart:moment(moment().subtract(7, 'days').calendar(),"YYYY-MM-DD").format("YYYY-MM-DD"),
      // consumeDateEnd:moment(new Date(),"YYYY-MM-DD").format("YYYY-MM-DD"),
    };
    dispatch({
      type: this.action.financeBillsList,
      payload: param,
    }).then(() => {
      const { order: { financeBillsListResult } } = this.props;
      this.setState({
        dataSoure: financeBillsListResult && financeBillsListResult.data && financeBillsListResult.data.list,
      });
    })
  }

  /*  componentWillUnmount() {
      window.removeEventListener('resize', this.resizeFooterToolbar);
    } */

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

  initialSportItems = () => {
    request("/venuebooking/sportItem/getAllSportItems")
      .then(response => {
        if (handleResponse(response)) {
          this.setState({ sportItems: response.data });
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

  handleQelect = () => {
    const { form: { validateFieldsAndScroll }, dispatch } = this.props;
    const { startValue, endValue, sportType, venueType, current, pageSize } = this.state;
    validateFieldsAndScroll(['couponNo', 'orderNo', 'memberTel', 'memberName', 'consumeStatus', 'orderType', 'consumeDateStart', 'consumeDateEnd', 'couponName', 'sportItemId'], (error, values) => {
      const param = {
        ...values,
        pageSize: 10,
        pageNo: current,
        couponNo: values.couponNo,
        orderNo: values.orderNo,
        memberTel: values.memberTel,
        memberName: values.memberName,
        consumeStatus: values.consumeStatus === "0" ? null : values.consumeStatus,
        consumeDateStart: values.consumeDateStart ? values.consumeDateStart.format("YYYY-MM-DD") : null,
        consumeDateEnd: values.consumeDateEnd ? values.consumeDateEnd.format("YYYY-MM-DD") : null,
        orderType: values.orderType === "全部" ? null : values.orderType,
        machineType: 1,
      }
      dispatch({
        type: this.action.financeBillsList,
        payload: param,
      }).then(() => {
        const { order: { financeBillsListResult } } = this.props;
        this.setState({
          dataSoure: financeBillsListResult && financeBillsListResult.data && financeBillsListResult.data.list,
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
      type: this.action.financeBillsList,
      payload: params,
    }).then(() => {
      const { order: { financeBillsListResult } } = this.props;
      this.setState({
        dataSoure: financeBillsListResult && financeBillsListResult.data && financeBillsListResult.data.list,
      })
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

  /**
   * @Author luzhijian
   * @Description //详情
   * @Date 13:38 2019/1/10
   * @Param
   * @return
   * */
  handleRecordDetail = (record) => {
    let pathname = '';
    // 订票跳转
    if (record.orderTypeString === "购票") {
      pathname = `/order/coupon/couponTicketDetails`;
    }
    // 订场跳转
    else {
      pathname = `/order/coupon/couponVenueDetails`;
    }
    const query = { id: record.couponNo };
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
  handleRefund = (record) => {
    const pathname = `/order/saleOrder/refund`;
    const query = { id: record.id };
    router.push({
      pathname,
      query,
    });
  };

  handlePrinting = (record) => {
    const { dispatch } = this.props;
    const params = {
      couponNo: record.couponNo,
    };
    dispatch({
      type: this.action.printBracelet,
      payload: params,
    });
  }

  handleReset = () => {
    const { dispatch, form } = this.props;
    form.resetFields();
    const param = {
      pageNo: 1,
      pageSize: 10,
    }
    dispatch({
      type: this.action.financeBillsList,
      payload: param,
    }).then(() => {
      const { order: { financeBillsListResult } } = this.props;
      this.setState({
        dataSoure: financeBillsListResult && financeBillsListResult.data && financeBillsListResult.data.list,
      })
    })
  };

  // 退票
  handleRefundTicket = (record) => {
    const pathname = `/order/saleOrder/refundTicket`;
    const query = {
      id: record.orderBasicInfoId,
    };
    router.push({
      pathname,
      query,
    });

  };

  handleSubmit = () => {
    const { form } = this.props;
    const { formModal: { visible, couponNo } } = this.state;
    if (visible && couponNo) {
      form.validateFieldsAndScroll(['sex'], (errors, values) => {
        if (!errors) {
          this.handlePrint(couponNo, values.sex);
        }
      });
    }
  };

  handlePrint = (couponNo, sex) => {
    if (couponNo) {
      request(`/venuebooking/order/printWristSrap?couponNo=${couponNo}${sex ? `&sex=${sex}` : ''}`)
        .then(response => {
          if (response && response.code === 200) {
            doPrint([response.data]);
          } else if (response && response.code === 10000) {
            // 选择性别后再提交
            this.setState({ formModal: { visible: true, couponNo } })
          } else {
            // 票券信息获取失败
          }
        });
    }
  };

  render() {
    const { form: { getFieldDecorator }, order: { financeBillsListResult, ticketTypeList } } = this.props;
    const { sportItems, isMember, width, startValue, endValue, endOpen, dataSoure, current, pageSize, formModal, key } = this.state;
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
    const hasAuth = hasAuthority("jis_platform_dc_couponList_detail");
    const columns = [
      {
        title: '票券号码',
        dataIndex: 'couponNo',
        key: 'couponNo',
        width: 230,
        render: (text, record) => hasAuth ? <a onClick={() => this.handleRecordDetail(record)}>{text}</a> : text,
      },
      { title: '订单号码', dataIndex: 'orderNo', key: 'orderNo', width: 160 },
      { title: '打印时间', dataIndex: 'printDate', key: 'printDate', width: 200 },
      { title: '操作人', dataIndex: 'creator', key: 'creator', width: 160 },
      { title: '项目类型', dataIndex: 'sportItemName', width: 150, render: val => <Ellipsis tooltip length={8}>{val}</Ellipsis> },
      { title: '票券类型', dataIndex: 'orderTypeString', key: 'orderTypeString', width: 120 },
      { title: '票券名称', dataIndex: 'couponName', width: 200, render: val => <Ellipsis tooltip length={8}>{val}</Ellipsis> },
      // { title: '适用场地', key: 'applyCourtName', dataIndex: 'applyCourtName', width: 200 },
      // {
      //   title: '适用日期',
      //   key: 'applyDateStart',
      //   dataIndex: 'applyDateStart',
      //   width: 200,
      //   render:(text,record) => (
      //     <span>
      //       {record.applyDateStart}--{record.applyDateEnd}
      //     </span>
      //   )
      // },
      // {
      //   title: '适用时间',
      //   key: 'applyTimeStart',
      //   dataIndex: 'applyTimeStart',
      //   width: 150,
      //   render:(text,record) => (
      //     <span>
      //       {record.applyTimeStart}--{record.applyTimeEnd}
      //     </span>
      //   )
      // },
      // { title: '价格(元)', key: 'ticketSalePrice', dataIndex: 'ticketSalePrice', width: 150 },
      { title: '消费状态', key: 'consumeStatusString', dataIndex: 'consumeStatusString', width: 120 },
      // { title: '消费日期', key: 'consumeDate', dataIndex: 'consumeDate', width: 150 },
      // {
      //   title: '消费时间',
      //   key: 'consumeTime',
      //   dataIndex: 'consumeTime',
      //   width: 150,
      //   render: (text, record) => record.consumeTimeStart && record.consumeTimeEnd ?
      //     `${record.consumeTimeStart}--${record.consumeTimeEnd}` : null
      //   // {
      //   //   if (record.consumeTimeStart && record.consumeTimeEnd){
      //   //     return (
      //   //       <span>
      //   //         {record.consumeTimeStart}--{record.consumeTimeEnd}
      //   //       </span>
      //   //     )
      //   //   }
      //   // }
      // },
      {
        title: '操作',
        key: 'action',
        dataIndex: 'action',
        width: 230,
        render: (text, record) =>
          <span>
            <Authorized authority='jis_platform_dc_couponList_detail' nomatch={noMatch()}>
              <a onClick={() => this.handleRecordDetail(record)}>详情</a>
            </Authorized>
            {/* <Authorized authority='jis_platform_dc_couponList_ticket' nomatch={noMatch()}>
              <Divider type="vertical" />
              <a>出票</a>
            </Authorized> */}
            <Authorized authority='jis_platform_dc_couponList_print' nomatch={noMatch()}>
              <Divider type="vertical" />
              <a onClick={() => this.handlePrint(record.couponNo)}>打印手环</a>
            </Authorized>
            <Divider type="vertical" />
            <a disabled={Number(record.comsumeStatus) !== 1} onClick={() => this.handleRefundTicket(record)}>退票</a>
          </span>
      },
    ];

    return (
      <PageHeaderWrapper wrapperClassName={styles.advancedForm}>
        {/* 消费记录 */}
        <Card title="销售订单" bordered={false} style={{ height: "100%" }}>
          <Tabs type='card' activeKey={key} onChange={value => { this.setState({ key: value }) }}>
            <Tabs.TabPane tab='条件查询' key="1">
              <Form hideRequiredMark>
                {/* 订单号码 */}
                <Row gutter={6}>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="票券号码">
                      {getFieldDecorator('couponNo', {
                        // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                        // rules: [{ required: false, message: "请选择" }],
                      })
                      (
                        <Input style={{ imeMode: 'disabled' }} placeholder="输入票券号码" />
                      )
                      }
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="订单号码">
                      {getFieldDecorator('orderNo', {
                        // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                        // rules: [{ required: false, message: "请选择" }],
                      })
                      (
                        <Input placeholder="输入订单号码" />
                      )
                      }
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="联系方式">
                      {getFieldDecorator('memberTel', {
                        // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                        // rules: [{ required: false, message: "请选择" }],
                      })
                      (
                        <Input placeholder="输入联系方式" />
                      )
                      }
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="姓名">
                      {getFieldDecorator('memberName', {
                        // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                        // rules: [{ required: false, message: "请选择" }],
                      })
                      (
                        <Input placeholder="输入姓名" />
                      )
                      }
                    </Form.Item>
                  </Col>

                </Row>

                {/* 消费日期 */}
                <Row gutter={6}>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="消费状态">
                      {getFieldDecorator('consumeStatus', {
                        initialValue: "0",
                        // rules: [{ required: false, message: "请选择" }],
                      })
                      (
                        <Select>
                          <Select.Option value="0" key="0">全部</Select.Option>
                          <Select.Option value="1" key="1">待消费</Select.Option>
                          <Select.Option value="2" key="2">消费中</Select.Option>
                          <Select.Option value="3" key="3">已消费</Select.Option>
                        </Select>
                      )
                      }
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="票券类型">
                      {getFieldDecorator('orderType', {
                        initialValue: "全部",
                      })
                      (
                        <Select>
                          <Select.Option value="全部" key="0">全部</Select.Option>
                          {ticketTypeList && ticketTypeList.length > 0 && ticketTypeList.map(obj => (
                            <Select.Option key={obj.code} value={obj.code}>{obj.value}</Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="票券名称">
                      {getFieldDecorator('couponName')(
                        <Input />
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="项目类型">
                      {getFieldDecorator('sportItemId')(
                        <Select allowClear>
                          {sportItems.map(item => <Select.Option key={item.id} value={item.id}>{item.itemName}</Select.Option>)}
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...formItemLayout} label="消费日期">
                      {getFieldDecorator('consumeDateStart', {
                        // initialValue:moment(moment().subtract(7, 'days').calendar(),"YYYY-MM-DD"),
                        rules: [{ required: false, message: "请选择" }],
                      })
                      (
                        <DatePicker
                          disabledDate={this.disabledStartDate}
                          showTime
                          style={{ width: "100%" }}
                          format="YYYY-MM-DD"
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
                          showTime
                          style={{ width: "100%" }}
                          format="YYYY-MM-DD"
                          placeholder="结束日期"
                          onChange={this.onEndChange}
                          open={endOpen}
                          onOpenChange={this.handleEndOpenChange}
                        />
                      )
                      }
                    </Form.Item>
                  </Col>
                  <Col span={12} align="right">
                    <Authorized authority='jis_platform_dc_couponList_query' nomatch={noMatch()}>
                      <Button type="primary" onClick={this.handleQelect}>
                        查询
                      </Button>
                    </Authorized>
                    <Button type="primary" onClick={() => this.handleReset()} style={{ marginLeft: 5 }}>
                      重置
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Tabs.TabPane>
            <Tabs.TabPane tab='凭证查询' key='2'>
              <Credentials onOk={values => this.handleCredentials(values)} />
            </Tabs.TabPane>
          </Tabs>

          <div>
            <Table
              rowKey={record => record.couponNo}
              pagination={{
                current,
                pageSize,
                defaultCurrent: 1,
                defaultPageSize: 10,
                total: financeBillsListResult && financeBillsListResult.data && financeBillsListResult.data.total,
                onChange: this.handleTableChange,
              }}
              bordered
              columns={columns}
              dataSource={dataSoure}
            />
          </div>
        </Card>
        <Modal
          destroyOnClose
          title="选择性别"
          visible={formModal.visible}
          onOk={() => this.handleSubmit()}
          onCancel={() => this.setState({ formModal: { visible: false, couponNo: undefined } })}
        >
          <Form>
            <Form.Item>
              {getFieldDecorator('sex', {
                rules: [{ required: true, message: '请选择性别' }],
                initialValue: 1,
              })(
                <Radio.Group>
                  <Radio value={1}>男</Radio>
                  <Radio value={2}>女</Radio>
                </Radio.Group>
              )}
            </Form.Item>
          </Form>
        </Modal>
      </PageHeaderWrapper>
    );
  }
}

export default saleOrder;
