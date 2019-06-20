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
  InputNumber,
  Upload,
  message,
  Cascader,
  Table,
  Modal,
} from 'antd';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import FooterToolbar from '@/components/FooterToolbar';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import moment from 'moment';
import router from "umi/router";
import styles from './style.less';
import {handleResponse} from "../../utils/globalUtils";


const { Option } = Select;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;







@connect(({ cashier,bookPlace, loading }) => ({
  cashier,bookPlace,
  loading: loading.models.cashier,
}))
@Form.create()
class AdvancedForm extends Component {

  action = {
    getOneByBasicId:'cashier/getonebybasicid',
    saleAdd:'cashier/saleadd',
    displayCard: 'bookPlace/displaycard',
  };

  state = {
    isMember: 1,
    ticketInfo:{},// 上一个页面带过来的对象
    buyNum:1,// 购买票的数量
    sportType:null,// 运动类型id
    venueType:null,// 场馆id
    ticketBasicType:null,// 票ID
    cardVisible:false,// 会员卡modal
    cardTableSelect:{},// 会员卡支付
    /* ======================================== */
    width: '100%',
  };

  componentDidMount() {
    const { dispatch, location } = this.props;
    const {sportType,venueType}=this.state;
    if (location && location.search) {
      const { query } = location;
      this.setState({
        sportType:query.sportId,
        venueType:query.venueId,
        ticketBasicType:query.record.ticketBasicId,
      })
      const param={
        ticketBasicId:query.record.ticketBasicId,
        sportId:query.sportId,
        venueId:query.venueId,
      };

      dispatch({
        type: this.action.getOneByBasicId,
        payload: param,
      }).then(
        ()=>{
          const {cashier:{getOneByBasicIdResult}}=this.props;
          this.setState({
            ticketInfo:getOneByBasicIdResult&&getOneByBasicIdResult.data,
          })
        }
      )


    }

  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeFooterToolbar);
  }

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

  handleToReturn = () => {
    Modal.confirm({
      title: '提示',
      content: '是否放弃录入的内容？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.handleReturn(),
    });
  }


  handleReturn = () =>{
    const pathname = '/cashier/cashierList';
    router.push({
      pathname,
    });
  };

  onRadioChange = (e) => {
    const { form } =this.props;
    form.resetFields(['memberTel','noMemberTel','noMemberName']);
    this.setState({
      isMember: e.target.value,
    });

  };


  /**
   * @Author luzhijian
   * @Description //购买数量表格变化时
   * @Date 15:06 2019/1/7
   * @Param
   * @return
   * */

 onBuyNumChange=(value)=> {
    this.setState({
      buyNum:value,
    })
  };


 /**
  * @Author luzhijian
  * @Description //确定按钮
  * @Date 15:39 2019/1/7
  * @Param
  * @return
  * */

 validate = () =>{
   const {
     form: { validateFieldsAndScroll },
     dispatch,
   } = this.props;
   const {sportType,venueType,ticketBasicType,ticketInfo}=this.state;
   validateFieldsAndScroll((error, values) => {
     if (error) {
       return false;
     }
     const param={
       memberPhone:values.memberTel,
       travelerPhone:values.noMemberTel,
       travelerName:values.noMemberName,
       customerType:values.IsMember,
       counts:values.num,
       sportId:sportType,
       venueId:venueType,
       basicId:ticketBasicType,
       ticketBasicId:ticketBasicType,
       memberId:1,
       paymentMode:1,
       ticketSalePrice:ticketInfo.ticketSalePrice,
       ticketName:ticketInfo.ticketName,
       applyCourt:ticketInfo.applyCourt,
       duration:ticketInfo.duration,
       ticketUseId:ticketInfo.ticketUseId,
       ticketSalesId:ticketInfo.ticketSalesId,
       applyCourtName:ticketInfo.applyCourtName,
       applyDateStart:ticketInfo.applyDateStart,
       applyDateEnd:ticketInfo.applyDateEnd,
       applyTimeStart:ticketInfo.applyTimeStart,
       applyTimeEnd:ticketInfo.applyTimeEnd,
       applyDateType:ticketInfo.applyDateType,

     }

     dispatch({
       type: this.action.saleAdd,
       payload: param,
     }).then(
       ()=>{
         const {cashier:{saleAddResult}}=this.props;
         if (handleResponse(saleAddResult)){
           message.success("售票成功")
         };
         const pathname = `/cashier/cashierList/index`;
         router.push({
           pathname,
         });
       }
     )

   });

 };

  handleDisplayCard=()=>{
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      cashier:{admissionOutResult},
    } = this.props;

    const {isMember}=this.state;
    this.setState({
      cardVisible:true,
    });
    validateFieldsAndScroll((error, values) => {
      const param={
        paymentMode:1,
        memberTel:isMember===1?values.memberTel:values.noMemberTel,
      };
      dispatch({
        type: this.action.displayCard,
        payload: param,
      });
    });
  };

  handleCardVisibleOk = (e) => {
    const {cardTableSelect}=this.state;
    this.setState({
      cardVisible: false,
      paymentMode:2,
    });

  };

  handleCardVisibleCancel = (e) => {
    this.setState({
      cardVisible: false,
    });
  };

  render() {
    const {
      form: { getFieldDecorator },
      submitting,
      bookPlace:{displayCardResult},
    } = this.props;
    const {width,ticketInfo,buyNum,isMember,cardTableSelect} = this.state;

    /**
     * 定义多选框的数组
     * @type {string[]}
     */
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

    const radioStyle = {
      display: 'block',
      height: '30px',
      lineHeight: '30px',
    };

    const cardColumns = [
      {
        title: 'cardNo',
        dataIndex: 'cardNo',
        key:'cardNo',
      },
      {
        title: 'balance',
        dataIndex: 'balance',
        key:'balance',
        render: (text, record) =>
          <span>
            余额: ￥{record.balance}
          </span>
      }];


    return (
      <PageHeaderWrapper
        title="售票订单信息"
        wrapperClassName={styles.advancedForm}
      >
        {/* 基本信息 */}
        <Card title="基本信息" bordered={false} style={{ height:520 }}>
          <Form hideRequiredMark>
            {/* 票名 */}
            <Row>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="票名">
                  {getFieldDecorator('ticketName', {
                    initialValue:ticketInfo.ticketName,
                  })
                  (
                    <Input
                      disabled
                    />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="适用场地">
                  {getFieldDecorator('applyCourtName', {
                    initialValue:ticketInfo.applyCourtName,
                  })
                  (
                    <Input disabled  />
                  )}
                </Form.Item>
              </Col>
            </Row>
            {/* 适用日期范围 */}
            <Row>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="适用日期范围">
                  {getFieldDecorator('date', {
                    initialValue:(ticketInfo.applyDateStart)+"--"+ticketInfo.applyDateEnd,
                  })(
                    <Input disabled  />
                  )}
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="适用日期类型">
                  {getFieldDecorator('Nationality', {
                    initialValue:ticketInfo.applyDateString,
                  })(
                    <Input disabled  />
                  )}
                </Form.Item>
              </Col>
            </Row>
            {/* 性别 */}
            <Row>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="适用时间范围">
                  {getFieldDecorator('Gender', {
                    initialValue:(ticketInfo.applyTimeStart)+"--"+ticketInfo.applyTimeEnd,
                  })(
                    <Input disabled  />
                  )}
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="使用时长(分钟)">
                  {getFieldDecorator('duration', {
                    initialValue:ticketInfo.duration,
                  })(
                    <Input disabled  />
                  )}
                </Form.Item>
              </Col>
            </Row>
            {/* 价格 */}
            <Row>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="价格（元）">
                  {getFieldDecorator('ticketSalePrice', {
                    initialValue:ticketInfo.ticketSalePrice,
                  })(
                    <Input disabled  />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>




        <FooterToolbar style={{ width }}>
          <Button style={{marginLeft:"55%"}} type="primary" onClick={this.handleReturn}>
            返回
          </Button>
        </FooterToolbar>
      </PageHeaderWrapper>
    );
  }
}

export default AdvancedForm;
