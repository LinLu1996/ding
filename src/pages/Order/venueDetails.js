import React, { Component,PureComponent } from 'react';
import {
  Card,
  Button,
  Form,
  Icon,
  Col,
  Row,
  DatePicker,
  TimePicker,
  Input,
  Select,
  Popover,
  Checkbox,
  Radio,
  Upload,
  message,
  Cascader,
  Table,
  Modal,
  Divider,
} from 'antd';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import FooterToolbar from '@/components/FooterToolbar';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import moment from 'moment';
import router from "umi/router";
import styles from './style.less';
import Projects from '../FieldManage/Componment/Projects';


const { Option } = Select;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;







@connect(({order, loading }) => ({
  order,
  loading: loading.models.order,
}))
@Form.create()
class ticketDetails extends Component {

  action = {
    // soprtList: 'court/sportlist',
    // venueName:'cashier/venuename',
    // admissionList:'cashier/admissionlist',
    // admissionIn:'cashier/admissionin',
    // admissionOut:'cashier/admissionout',
    // admissionInSure:'cashier/admissioninsure',
    // =====================================
    detailsInfo:'order/detailsinfo',

  };

  state = {
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

  };

  componentDidMount() {
    const {
      dispatch,
      location,
    } = this.props;

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
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
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
      }
      dispatch({
        type: this.action.admissionList,
        payload: param,
      }).then(()=>{
        // const {cashier:{admissionListResult}}=this.props;
      })
    });
  };


  render() {
    const {
      form: { getFieldDecorator },
      submitting,
      order:{detailsInfoResult}
    } = this.props;
    const {width,} = this.state;

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

    const columns = [
      {
        title: '票券号码',
        dataIndex: 'couponNo',
        key: 'couponNo',
        width: 150,
      },
      {
        title: '适用场地',
        key: 'applyCourtName',
        dataIndex: 'applyCourtName',
        width: 150,
      },
      {
        title: '运动项目',
        key: 'sportItemName',
        dataIndex: 'sportItemName',
        width: 150,
      },
      {
        title: '订场日期',
        key: 'bookingDate',
        dataIndex: 'bookingDate',
        width: 150,
      },
      {
        title: '场次',
        key: 'Scene',
        dataIndex: 'Scene',
        width: 150,
        render: (text, record) =>
          <span>
            {record.applyTimeStart}--{record.applyTimeEnd}
          </span>

      },
      {
        title: '价格(元)',
        key: 'ticketSalePrice',
        dataIndex: 'ticketSalePrice',
        width: 150,
      },
      ];


    const contentFormItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
        md: { span: 20 },
      },
    };

    return (
      <PageHeaderWrapper
        title="订场详情信息"
        wrapperClassName={styles.advancedForm}
      >

        <Card title="订单信息" bordered={false} style={{height:"100%"}}>
          <Form hideRequiredMark>
            {/* 订单号码 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="订单号码:">
                  {getFieldDecorator('number', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.orderNo,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="创建时间:">
                  {getFieldDecorator('createDate', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.orderDate,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="支付流水号:">
                  {getFieldDecorator('water', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.paymentNo,
                  })
                  (
                    <Input disabled />
                  )
                  }
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
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="联系方式:">
                  {getFieldDecorator('tel', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.memberTel,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="订单类型:">
                  {getFieldDecorator('orderType', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.orderTypeString,
                  })
                  (
                    <Input disabled />
                  )
                  }
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
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="支付状态:">
                  {getFieldDecorator('orderState', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.paymentStatusString,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="支付时间:">
                  {getFieldDecorator('orderTime', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.paymentTime,
                  })
                  (
                    <Input disabled />
                  )
                  }
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
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="支付金额(元):">
                  {getFieldDecorator('payMoney', {
                    initialValue:detailsInfoResult&&detailsInfoResult.orderBasicInfoListDto&&detailsInfoResult.orderBasicInfoListDto.paymentStatusString!=='已取消'? detailsInfoResult.orderBasicInfoListDto.paymentAmount:'',
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
              scroll={{ x: 900}}
            />
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
