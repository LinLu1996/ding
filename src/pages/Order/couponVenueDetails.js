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
    // ===============================
    financeBillsCourt:'order/financebillscourt'
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
    const { dispatch } = this.props;
    const { location } = this.props;
    // 获取之前页面带来的值
    if (location && location.search) {
      const { query } = location;
      const param={
        couponNo:query.id,
      };
      dispatch({
        type: this.action.financeBillsCourt,
        payload: param,
      }).then(()=>{
        const {order:{financeBillsCourtResult}}=this.props;
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
    const pathname = `/order/coupon/list`;
    router.push({
      pathname,
    });
  };


  render() {
    const {
      form: { getFieldDecorator },
      submitting,
      order:{financeBillsCourtResult},
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


    return (
      <PageHeaderWrapper
        title="订场详情"
        wrapperClassName={styles.advancedForm}
      >

        <Card title="" bordered={false} style={{height:"100%"}}>
          <Form hideRequiredMark>
            {/* 订单号码 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="票券号码:">
                  {getFieldDecorator('couponNo', {
                    initialValue:financeBillsCourtResult&&financeBillsCourtResult.couponNo,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="项目类型:">
                  {getFieldDecorator('sportItemName', {
                    initialValue:financeBillsCourtResult&&financeBillsCourtResult.sportItemName,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="票券类型:">
                  {getFieldDecorator('orderTypeString', {
                    initialValue:financeBillsCourtResult&&financeBillsCourtResult.orderTypeString,
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
                <Form.Item {...formItemLayout} label="票券名称:">
                  {getFieldDecorator('couponName', {
                    initialValue:financeBillsCourtResult&&financeBillsCourtResult.couponName,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="姓名:">
                  {getFieldDecorator('memberName', {
                    initialValue:financeBillsCourtResult&&financeBillsCourtResult.memberName,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="联系方式:">
                  {getFieldDecorator('memberTel', {
                    initialValue:financeBillsCourtResult&&financeBillsCourtResult.memberTel,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
            </Row>
            {/* 适用场地 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="适用场地:">
                  {getFieldDecorator('applyCourtName', {
                    initialValue:financeBillsCourtResult&&financeBillsCourtResult.applyCourtName,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="适用日期:">
                  {getFieldDecorator('applyDateStart', {
                    initialValue:financeBillsCourtResult&&(financeBillsCourtResult.applyDateStart+"--"+financeBillsCourtResult.applyDateEnd),
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="适用时间:">
                  {getFieldDecorator('orderTime', {
                    initialValue:financeBillsCourtResult&&(financeBillsCourtResult.applyTimeStart+"--"+financeBillsCourtResult.applyTimeEnd),
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
            </Row>
            {/* 销售价(元) */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="销售价(元):">
                  {getFieldDecorator('ticketSalePrice', {
                    initialValue:financeBillsCourtResult&&financeBillsCourtResult.ticketSalePrice,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="超时计费单位(分):">
                  {getFieldDecorator('timeoutBillingUnit', {
                    initialValue:financeBillsCourtResult&&financeBillsCourtResult.timeoutBillingUnit,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="消费状态:">
                  {getFieldDecorator('consumeStatus', {
                    initialValue:financeBillsCourtResult&&financeBillsCourtResult.consumeStatusString,
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
                  {getFieldDecorator('consumeDate', {
                    initialValue:financeBillsCourtResult&&financeBillsCourtResult.consumeDate,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="消费时间:">
                  {getFieldDecorator('xiaoTime', {
                    initialValue:financeBillsCourtResult&&financeBillsCourtResult.consumeTimeStart&&(financeBillsCourtResult.consumeTimeStart+"--"+financeBillsCourtResult.consumeTimeEnd),
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
