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
    // =======================
    consumeRecordInfo:'order/consumerecordinfo'

  };

  state = {
    startValue: null,
    endValue: null,
    venueType:null,// 场馆id
    sportType:null,// 运动类型id
    radioType:1,// Radio变化时候的值
    /* ======================================== */
    width: '100%',

  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { location } = this.props;
    // 获取之前页面带来的值
    if (location && location.search) {
      const { query } = location;
      const param={
        consumeBasicInfoId:query.id,
      };
      dispatch({
        type: this.action.consumeRecordInfo,
        payload: param,
      }).then(()=>{
        const {order:{consumeRecordInfoResult}}=this.props;
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
    const pathname = `/order/consumeRecord/list`;
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
        const {cashier:{admissionListResult}}=this.props;
      })
    });
  };


  render() {
    const {
      form: { getFieldDecorator },
      submitting,
      order: {consumeRecordInfoResult},
    } = this.props;
    const {width,} = this.state;
    console.log(consumeRecordInfoResult && consumeRecordInfoResult.consumeBoxDtoList)

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
        title: '支付金额',
        dataIndex: 'consumeAmount',
        key: 'consumeAmount',
        width: 150,
      },
      {
        title: '支付方式',
        key: 'paymentModeString',
        dataIndex: 'paymentModeString',
        width: 150,
      },
      {
        title: '订单号码',
        key: 'orderNo',
        dataIndex: 'orderNo',
        width: 150,
      },
      {
        title: '票券号码',
        key: 'couponNo',
        dataIndex: 'couponNo',
        width: 150,
      },
      {
        title: '核销时长(分钟)',
        key: 'duration',
        dataIndex: 'duration',
        width: 150,
      },
      {
        title: '入场票券',
        key: 'isInCouponString',
        dataIndex: 'isInCouponString',
        width: 150,
      },
      {
        title: '备注',
        key: 'memo',
        dataIndex: 'memo',
        width: 150,
      },
      ];


      const columns2 = [
        { title: '衣柜编号', dataIndex: 'boxName', key: 'name', },
        { title: '开箱时间', dataIndex: 'boxBindTime', key: 'type', },
        { title: '释放时间', dataIndex: 'outTime', key: 'boxBindTime', },
        { title: '用户凭证', dataIndex: 'userId', key: 'userId', },
        { title: '集控器', dataIndex: 'boxManagerName', key: 'boxManagerName', },
      ];
      return (
      <PageHeaderWrapper
        title="消费记录详情"
        wrapperClassName={styles.advancedForm}
      >

        <Card title="消费信息" bordered={false} style={{height:"100%"}}>
          <Form hideRequiredMark>
            {/* 姓名 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="姓名:">
                  {getFieldDecorator('number', {
                    initialValue:consumeRecordInfoResult&&consumeRecordInfoResult.memberName,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="联系方式:">
                  {getFieldDecorator('createDate', {
                    initialValue:consumeRecordInfoResult&&consumeRecordInfoResult.memberTel,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="消费金额(元):">
                  {getFieldDecorator('water', {
                    initialValue:consumeRecordInfoResult&&consumeRecordInfoResult.consumeAmount,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
            </Row>
            {/* 消费日期 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="消费日期:">
                  {getFieldDecorator('name', {
                    initialValue:consumeRecordInfoResult&&consumeRecordInfoResult.consumeDate,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="消费时间:">
                  {getFieldDecorator('inTime', {
                    initialValue:consumeRecordInfoResult &&(`${consumeRecordInfoResult.inTime || ''} ${consumeRecordInfoResult.outTime || ''}`),
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="消费时长(分钟):">
                  {getFieldDecorator('duration', {
                    initialValue:consumeRecordInfoResult&&consumeRecordInfoResult.duration,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
            </Row>
            {/* 入场凭证 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="入场凭证:">
                  {getFieldDecorator('orderName', {
                    initialValue:consumeRecordInfoResult&&consumeRecordInfoResult.inEvidence===1?"票券":"年卡",
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="运动项目:">
                  {getFieldDecorator('sportItemName', {
                    initialValue:consumeRecordInfoResult&&consumeRecordInfoResult.sportItemName,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="消费场地:">
                  {getFieldDecorator('consumeCourt', {
                    initialValue:consumeRecordInfoResult&&consumeRecordInfoResult.courtName,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
            </Row>
            {/* 消费状态 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="消费状态:">
                  {getFieldDecorator('consumeStatusString', {
                    initialValue:consumeRecordInfoResult&&consumeRecordInfoResult.consumeStatusString,
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
        <Card title="支付信息" bordered={false} style={{height:"100%"}}>
          <Form hideRequiredMark>
            <Table
              rowKey={record => record.id}
              pagination={false}
              bordered
              columns={columns}
              dataSource={consumeRecordInfoResult&&consumeRecordInfoResult.basicInfoList}
              scroll={{ x: 1500}}
            />
          </Form>
        </Card>

        <Card title="" bordered={false} style={{height:"100%"}}>
          <Table
            rowKey='id'
            columns={columns2}
            pagination={false}
            dataSource={consumeRecordInfoResult && consumeRecordInfoResult.consumeBoxDtoList}
            style={{marginBottom: 50}}
          />
        </Card>
        <FooterToolbar style={{ width }}>
          <Button style={{marginLeft:"52%"}} type="primary" onClick={this.handleReturn} loading={submitting}>
            返回
          </Button>
        </FooterToolbar>
      </PageHeaderWrapper>
    );
  }
}

export default ticketDetails;
