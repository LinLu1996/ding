import React, { Component,Fragment } from 'react';
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
    financeBillsTicket:'order/financebillsticket',
    consumeState: 'order/consumestate',
  };

  state = {
    checkedList:[1,2,3],
    /* ======================================== */
    width: '100%',

  };

  componentDidMount() {
    const { dispatch } = this.props;
    const { location } = this.props;

    dispatch({
      type: this.action.consumeState,
    });
    // 获取之前页面带来的值
    if (location && location.search) {
      const { query } = location;
      const param={
        couponNo:query.id,
      };
      dispatch({
        type: this.action.financeBillsTicket,
        payload: param,
      }).then(()=>{
        const {order:{financeBillsTicketResult}}=this.props;
        if (financeBillsTicketResult&&financeBillsTicketResult.ticketDetails) {
          this.detail1.innerHTML = financeBillsTicketResult.ticketDetails;
        }
        if (financeBillsTicketResult&&financeBillsTicketResult.purchaseNotes) {
          this.detail2.innerHTML = financeBillsTicketResult.purchaseNotes;
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
    const pathname = `/order/coupon/list`;
    router.push({
      pathname,
    });
  };

  bindRef1 = (body) => {
    this.detail1 = body;
  };

  bindRef2 = (body) => {
    this.detail2 = body;
  };

  render() {
    const {
      form: { getFieldDecorator },
      submitting,
      order:{financeBillsTicketResult},
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
        title="票券详情"
        wrapperClassName={styles.advancedForm}
      >

        <Card title="" bordered={false} style={{height:"100%"}}>
          <div>
            <Form hideRequiredMark>
            {/* 订单号码 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="票券号码:">
                  {getFieldDecorator('couponNo', {
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.couponNo,
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
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.sportItemName,
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
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.orderTypeString,
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
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.couponName,
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
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.memberName,
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
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.memberTel,
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
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.applyCourtName,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="适用日期:">
                  {getFieldDecorator('orderState', {
                    initialValue:financeBillsTicketResult&&(financeBillsTicketResult.applyDateStart+"--"+financeBillsTicketResult.applyDateEnd),
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="适用时间:">
                  {getFieldDecorator('applyTimeStart', {
                    initialValue:financeBillsTicketResult&&(financeBillsTicketResult.applyTimeStart+"--"+financeBillsTicketResult.applyTimeEnd),
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
            </Row>
            {/* 适用日期类型 */}
            <Row>
              <Col span={16}>
                <Form.Item {...formItemLayout} label="适用日期类型:" style={{marginLeft:"-25%"}}>
                  {getFieldDecorator('dateType', {
                    // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                    // rules: [{ required: false, message: "请选择" }],
                  })
                  (
                    <Fragment>
                      <Checkbox.Group style={{display:'inline'}} disabled value={financeBillsTicketResult&&financeBillsTicketResult.applyDateList}>
                        <Checkbox value={1}>周一</Checkbox>
                        <Checkbox value={2}>周二</Checkbox>
                        <Checkbox value={3}>周三</Checkbox>
                        <Checkbox value={4}>周四</Checkbox>
                        <Checkbox value={5}>周五</Checkbox>
                        <Checkbox value={6}>周六</Checkbox>
                        <Checkbox value={7}>周日</Checkbox>
                        <Checkbox value={8}>节假日</Checkbox>
                      </Checkbox.Group>
                    </Fragment>
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="使用时长(分钟):">
                  {getFieldDecorator('duration', {
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.duration,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>

            </Row>
            {/* 人数 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="人数:">
                  {getFieldDecorator('totalNum', {
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.totalNum,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="成人:">
                  {getFieldDecorator('adultNum', {
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.adultNum,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="儿童:">
                  {getFieldDecorator('childrenNum', {
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.childrenNum,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
            </Row>
            {/* 原价(元) */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="原价(元):">
                  {getFieldDecorator('ticketOriginalPrice', {
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.ticketOriginalPrice,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="销售价(元):">
                  {getFieldDecorator('ticketSalePrice', {
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.ticketSalePrice,
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
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.timeoutBillingUnit,
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
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.consumeStatusString,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="消费日期:">
                  {getFieldDecorator('consumeDate', {
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.consumeDate,
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="消费时间:">
                  {getFieldDecorator('consumeTimeStart', {
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.consumeTimeStart&&(financeBillsTicketResult.consumeTimeStart+"--"+financeBillsTicketResult.consumeTimeEnd),
                  })
                  (
                    <Input disabled />
                  )
                  }
                </Form.Item>
              </Col>
            </Row>

              <Row>
                <Col span={24}>
                  <Row gutter={24} style={{marginBottom:'50px',display:'flex'}}>
                    <Col span={3} style={{width:'11%',textAlign:'right',padding:0}}>门票详情:</Col>
                    <Col span={20}>
                      <div style={{backgroundColor: "#EBEBE4",minHeight:120,width:"107%"}} ref={body => this.bindRef1(body)} />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Row gutter={24} style={{marginBottom:'50px',display:'flex'}}>
                    <Col span={3} style={{width:'11%',textAlign:'right',padding:0}}>购买须知:</Col>
                    <Col span={20}>
                      <div style={{backgroundColor: "#EBEBE4",minHeight:120,width:"107%"}} ref={body => this.bindRef2(body)} />
                    </Col>
                  </Row>
                </Col>
              </Row>
{/*            <Row>
              <Col span={24} style={{marginTop:"6%"}}>
                <Form.Item
                  {...contentFormItemLayout}
                  label="门票详情:"
                >
                  {getFieldDecorator('ticketDetail', {
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.ticketDetails,
                  })(
                    <div style={{backgroundColor: "#EBEBE4",minHeight:120}} ref={body => this.bindRef1(body)} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...contentFormItemLayout}
                  label="购买须知:"
                >
                  {getFieldDecorator('purchaseNotes', {
                    initialValue:financeBillsTicketResult&&financeBillsTicketResult.purchaseNotes,
                  })(
                    <div style={{backgroundColor: "#EBEBE4"}} ref={body => this.bindRef2(body)} />
                  )}
                </Form.Item>
              </Col>
            </Row> */}


            </Form>
          </div>
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

export default ticketDetails
