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
  InputNumber,
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
import {handleResponse} from "../../utils/globalUtils";


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
    // ========================
    refundDetails:'order/refunddetails',
    handleRefund:'order/handlerefund',
    handleReadCard:'order/fetchHandleReadCard',

  };

  state = {
    startValue: null,
    endValue: null,
    venueType:null,// 场馆id
    sportType:null,// 运动类型id
    radioType:1,// Radio变化时候的值
    BasicInfoId:null,// 上个页面传过来的id
    /* ======================================== */
    width: '100%',
    current: 1,
    pageSize: 10,
    selectedRow: [],
    canRefund:true,
  };

  componentDidMount() {
    const {
      dispatch,
      location,
    } = this.props;
    if (location && location.search) {
      const { query } = location;
      this.setState({
        BasicInfoId:query.id,
      });
      const param={
        orderBasicInfoId:query.id,
      };
      dispatch({
        type: this.action.refundDetails,
        payload: param,
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

  handleRefund=()=>{
    const {form,dispatch,order:{refundDetailsResult} } = this.props;
    const dataAll = refundDetailsResult && refundDetailsResult.orderDetailedInfoList && refundDetailsResult.orderDetailedInfoList || [];
    const {BasicInfoId,selectedRow}=this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const couponNoList = [];
      if(selectedRow.length===0) {
        message.warning('请选择票券');
        return;
      }
      for(let i=0; i<selectedRow.length;i++) {
        const current = dataAll.filter(item => item.id === selectedRow[i])[0];
        couponNoList.push(current.couponNo && current.couponNo);
      }
      const param={
        id:BasicInfoId,
        refundAmount:values.refundAmount,
        refundReason:values.refundReason,
        couponNoList,
      };
      dispatch({
        type: this.action.handleRefund,
        payload: param,
      }).then(()=>{
        const { order:{handleRefundResult} }=this.props;
        if (handleResponse(handleRefundResult,true)) {
          const pathname = `/order/coupon/list`;
          router.push({
            pathname,
          });
        }
      })
    });

  }


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



  /**
   * @Author luzhijian
   * @Description //获取表单校验信息
   * @Date 14:10 2018/12/7
   * @Param
   * @return
   * */

  getErrorInfo = () => {
    const {
      form: { getFieldsError },
    } = this.props;
    const errors = getFieldsError();
    const errorCount = Object.keys(errors).filter(key => errors[key]).length;
    if (!errors || errorCount === 0) {
      return null;
    }
    const scrollToField = fieldKey => {
      const labelNode = document.querySelector(`label[for="${fieldKey}"]`);
      if (labelNode) {
        labelNode.scrollIntoView(true);
      }
    };
    const errorList = Object.keys(errors).map(key => {
      if (!errors[key]) {
        return null;
      }
      return (
        <li key={key} className={styles.errorListItem} onClick={() => scrollToField(key)}>
          <Icon type="cross-circle-o" className={styles.errorIcon} />
          <div className={styles.errorMessage}>{errors[key][0]}</div>
          {/*<div className={styles.errorField}>{fieldLabels[key]}</div>*/}
        </li>
      );
    });




    return (
      <span className={styles.errorIcon}>
        <Popover
          title="表单校验信息"
          content={errorList}
          overlayClassName={styles.errorPopover}
          trigger="click"
          getPopupContainer={trigger => trigger.parentNode}
        >
          <Icon type="exclamation-circle" />
        </Popover>
        {errorCount}
      </span>
    );
  };

  /**
   * @Description: 列表项选中取消
   * @author Lin Lu
   * @date 2018/12/14
   */
  handleSelectChange = selectedRowKeys => {
    const { form,order:{refundDetailsResult} } = this.props;
    const dataAll = refundDetailsResult && refundDetailsResult.orderDetailedInfoList && refundDetailsResult.orderDetailedInfoList || [];
    let moneyAll = 0;
    this.setState({
      selectedRow: selectedRowKeys
    });
    for(let i=0; i<selectedRowKeys.length;i++) {
      const current = dataAll.filter(item => item.id === selectedRowKeys[i])[0];
      moneyAll += current.ticketSalePrice && current.ticketSalePrice || 0;
    }
    form.setFieldsValue({
      refundAmount: moneyAll,
    });
  };

// 授权卡号读取
  handleReadCard = () => {
    const { dispatch,form } = this.props;
    const card = form.getFieldValue('permitCardNo');
    dispatch({
      type:this.action.handleReadCard,
      payload:{ code: card }
    }).then(() => {
      const {order:{readCardInfo}} = this.props;
      if(readCardInfo && readCardInfo.data) {
        message.success('读取成功')
        this.setState({
          canRefund:false,
        })
      }
      else {
        message.error('此授权卡不存在');
      }
    })
  }

  render() {
    const {
      form: { getFieldDecorator },
      submitting,
      order:{refundDetailsResult}
    } = this.props;
    const {width,selectedRow,current,pageSize,canRefund} = this.state;
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
      },
      {
        title: '票券金额',
        key: 'ticketSalePrice',
        dataIndex: 'ticketSalePrice',
        width: 150,
      },
    ];
    const rowSelection = {
      selectedRowKeys: selectedRow,
      onChange: this.handleSelectChange,
    };

    const data=[
      {
        CouponNumber:"123321",
      },
    ];

    const contentFormItemLayout = {
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

    return (
      <PageHeaderWrapper
        title="退款信息"
        wrapperClassName={styles.advancedForm}
      >
        <Card title="订单信息" bordered={false} style={{height:"100%"}}>
          <Form hideRequiredMark>
            {/* 订单号码 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="订单号码:">
                  {getFieldDecorator('number', {
                    initialValue:refundDetailsResult&&refundDetailsResult.orderBasicInfoListDto && refundDetailsResult.orderBasicInfoListDto.orderNo || '',
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
                    initialValue:refundDetailsResult&&refundDetailsResult.orderBasicInfoListDto && refundDetailsResult.orderBasicInfoListDto.orderDate || '',
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
                    initialValue:refundDetailsResult&&refundDetailsResult.orderBasicInfoListDto && refundDetailsResult.orderBasicInfoListDto.paymentNo || '',
                    // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                    // rules: [{ required: false, message: "请选择" }],
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
                    initialValue:refundDetailsResult&&refundDetailsResult.orderBasicInfoListDto && refundDetailsResult.orderBasicInfoListDto.memberName || '',
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
                    initialValue:refundDetailsResult&&refundDetailsResult.orderBasicInfoListDto && refundDetailsResult.orderBasicInfoListDto.memberTel || '',
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
                    initialValue:refundDetailsResult&&refundDetailsResult.orderBasicInfoListDto && refundDetailsResult.orderBasicInfoListDto.orderTypeString || '',
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
                    initialValue:refundDetailsResult&&refundDetailsResult.orderBasicInfoListDto && refundDetailsResult.orderBasicInfoListDto.orderName || '',
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
                    initialValue:refundDetailsResult&&refundDetailsResult.orderBasicInfoListDto && refundDetailsResult.orderBasicInfoListDto.paymentStatusString || '',
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
                    initialValue:refundDetailsResult&&refundDetailsResult.orderBasicInfoListDto && refundDetailsResult.orderBasicInfoListDto.paymentTime || '',
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
                    initialValue:refundDetailsResult&&refundDetailsResult.orderBasicInfoListDto && refundDetailsResult.orderBasicInfoListDto.paymentModeString || '',
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
                    initialValue:refundDetailsResult&&refundDetailsResult.orderBasicInfoListDto && refundDetailsResult.orderBasicInfoListDto.paymentAmount || '',
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
                    initialValue:refundDetailsResult&&refundDetailsResult.orderBasicInfoListDto && refundDetailsResult.orderBasicInfoListDto.orderAmount || '',
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
        <Card title="退款信息" bordered={false} style={{height:"100%"}}>
          <div style={{ width:'800px',marginBottom:'10px' }}>
            <Table
              loading={false}
              columns={columns}
              rowSelection={rowSelection}
              rowKey={record => record.id}
              pagination={false}
              dataSource={refundDetailsResult && refundDetailsResult.orderDetailedInfoList && refundDetailsResult.orderDetailedInfoList}
            />
          </div>
          {
            refundDetailsResult && refundDetailsResult.orderDetailedInfoList && refundDetailsResult.orderDetailedInfoList.length && refundDetailsResult.orderDetailedInfoList.length>0 &&
            <Form>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item {...contentFormItemLayout} label="授权卡号">
                    {getFieldDecorator('permitCardNo',{
                      rules: [
                        {
                          required: true,
                          message:'请输入卡号'
                        },
                        {
                          pattern: /^[A-Za-z0-9]{0,50}$/,
                          message: '卡号长度为50',
                        },
                      ],
                      initialValue:''
                    })(
                      <Input  type="password" placeholder='请输入卡号' />
                    )}
                  </Form.Item>
                </Col>
                <Col span={2} style={{paddingTop:'3px'}}>
                  <Button
                    type="primary"
                    onClick={this.handleReadCard}
                    className={styles.buttonColor}>读取卡片</Button>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    {...contentFormItemLayout}
                    label="退款金额:"
                  >
                    {getFieldDecorator('refundAmount', {
                      // initialValue:detailsInfoResult&&detailsInfoResult.noticeContent,
                      rules: [
                        { required: true, message: "请输入退款金额"},
                        {
                          pattern: /^\d{0,9}(?:\.\d{1,2})?$/,
                          message: '票面价格只能为两位小数，且最大为999999999.99',
                        },
                      ],
                    })(
                      <Input style={{ width: '100%'}} placeholder="请输入退款金额" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    {...contentFormItemLayout}
                    label="退款理由:"
                  >
                    {getFieldDecorator('refundReason', {
                      // initialValue:detailsInfoResult&&detailsInfoResult.noticeContent,
                      rules: [{ required: true, message: "请填写退款理由"}],
                    })(<textarea style={{ width: '100%',height:130 }} placeholder="退款理由" />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          }

        </Card>
        <FooterToolbar style={{ width }}>
          {this.getErrorInfo()}
          <Button style={{marginLeft:"50%"}} disabled={canRefund} type="primary" onClick={this.handleRefund} loading={submitting}>
            退票
          </Button>
          <Button style={{marginLeft:"1%"}} type="primary" onClick={this.handleReturn} loading={submitting}>
            返回
          </Button>
        </FooterToolbar>
      </PageHeaderWrapper>
    );
  }
}

export default ticketDetails;
