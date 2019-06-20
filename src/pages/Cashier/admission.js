import React, { Component } from 'react';
import { connect } from 'dva';
import router from "umi/router";
import { Card, Button, Form, Icon, Col, Row, DatePicker, Input, Select, Popover, Checkbox,
  Radio, message, Table, Modal, Tooltip, Tag } from 'antd';
import classNames from 'classnames';
import moment from "moment/moment";
import OvertimePayment from "./OvertimePayment";
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import BarCode from '../../components/WxPay/BarCode';
import Ellipsis from '../../components/Ellipsis';
import {handleResponse} from "../../utils/globalUtils";
import { noMatch } from '../../utils/authority';
import Authorized from '../../utils/Authorized';
import styles from './index.less';

const RadioGroup = Radio.Group;

var formatDate = function (date,e) {
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  if (e===1){
    return y + '-' + m + '-' + d+' '+'08:00:00';
  }
  else {
    return y + '-' + m + '-' + d+' '+'23:59:59';
  }

};

@connect(({cashier, courts,bookPlace, loading }) => ({
  cashier, courts,bookPlace,
  loading: loading.models.cashier,
}))
@Form.create()
class AdvancedForm extends Component {
  action = {
    displayTicket: 'bookPlace/displayticket',
    displayCard: 'bookPlace/displaycard',
    soprtList: 'cashier/sportlist',
    venueName:'cashier/findcourtinfo',
    admissionList:'cashier/admissionlist',
    admissionIn:'cashier/admissionin',
    admissionOut:'cashier/admissionout',
    admissionInSure:'cashier/admissioninsure',
    admissionOutSure:'bookPlace/admissionoutsure',
    findCapacity:'cashier/findcapacity',
    findDictionaries:'cashier/finddictionaries',
    getPaymentList:'cashier/getpaymentlist',

  };

  state = {
    couponNo:null,// 票券号码，先模拟
    outVisible: false,// 出场modal
    inVisible:false,// 入场modal
    inVisibleYear:false,// 入场modal
    startValue: moment(formatDate(new Date(),1),"YYYY-MM-DD HH:mm:ss"),
    endValue: moment(formatDate(new Date(),2),"YYYY-MM-DD HH:mm:ss"),
    endOpen: false,
    venueType:null,// 场馆id
    sportType:null,// 运动类型id
    radioType:1,// Radio变化时候的值
    date:new Date(),
    dataSource:null,
    choosePayMent:null,// 选择的支付方式的code
    cardTableSelect:{},// 会员卡支付
    paymentMode:null,// 支付方式
    /* ======================================== */
    width: '100%',

    barVisible: false,
    orderNo: undefined,
    goodsName: undefined,
    deviceCode: undefined,
  };

  componentDidMount() {
    const { venueType }=this.state;

    const {
      dispatch,
    } = this.props;


    const p={
      type:1
    };
    dispatch({
      type: this.action.soprtList,
      payload: p,
    }).then(() =>{
      const {cashier:{sportListResult}}=this.props;
      this.setState({
        sportType:sportListResult&&sportListResult.data&&sportListResult.data.length&&sportListResult.data.length>0&&sportListResult.data[0].id,
      });

      const {sportType,startValue,endValue}=this.state;
      const param={
        sportId:sportListResult&&sportListResult.data&&sportListResult.data.length&&sportListResult.data.length>0&&sportListResult.data[0].id,
      };
      if (sportListResult&&sportListResult.data&&sportListResult.data.length&&sportListResult.data.length>0&&sportListResult.data[0].id){
        dispatch({
          type: this.action.findDictionaries,
          payload: {type:3},
        });
        this.venueListDid(param,sportListResult)
      }
    });



  }

  // 获取场地
  venueListDid =(param,sportListResult)=>{
    const {dispatch}=this.props;
    const {startValue,endValue,radioType}=this.state;
    dispatch({
      type: this.action.venueName,
      payload: param,
    }).then(()=>{
        const {cashier:{findCourtInfoResult}}=this.props;
        this.setState({
          venueType:findCourtInfoResult&&findCourtInfoResult.data&&findCourtInfoResult.data.length>0&&findCourtInfoResult.data[0].id
        });
        if (findCourtInfoResult&&findCourtInfoResult.data && findCourtInfoResult.data.length>0 && findCourtInfoResult.data[0].id) {
          dispatch({
            type: this.action.findCapacity,
            payload: {venuesCourtId:findCourtInfoResult&&findCourtInfoResult.data&&findCourtInfoResult.data.length&&findCourtInfoResult.data.length>0&&findCourtInfoResult.data[0].id},
          });
          const params={
            pageSize:10,
            pageNo:1,
            type:radioType,
            sportId:sportListResult&&sportListResult.data&&sportListResult.data.length&&sportListResult.data.length>0&&sportListResult.data[0].id,
            venueId:findCourtInfoResult&&findCourtInfoResult.data&&findCourtInfoResult.data.length&&findCourtInfoResult.data.length>0&&findCourtInfoResult.data[0].id,
            admissionStartTimeString:startValue!==null?startValue.format("YYYY-MM-DD HH:mm:ss"):null,
            admissionStartEndString:endValue!==null?endValue.format("YYYY-MM-DD HH:mm:ss"):null,
          };
          dispatch({
            type: this.action.admissionList,
            payload: params,
          }).then(()=>{
            const {cashier:{admissionListResult}}=this.props;
            this.setState({
              dataSource:admissionListResult&&admissionListResult.data&&admissionListResult.data.list
            })
          })
        }
        else {
          message.error("服务器异常!")
        }

      }
    );
  }

/*  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeFooterToolbar);
  } */


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

  handleReturn = () =>{
    const pathname = this.action.toMain;
    router.push({
      pathname,
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
    const nowStartValue = new Date();
    if (!startValue || !nowStartValue) {
      return false;
    }
    const now=new Date();
    return startValue.valueOf() > now.valueOf();
  };

  disabledEndDate = (endValue) => {
    const {startValue}=this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() < startValue.valueOf();
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  onStartChange = (value) => {
    this.onChange('startValue', value);
  };

  onEndChange = (value) => {
    this.onChange('endValue', value);
  };

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  };

  /**
   * @Author luzhijian
   * @Description //时间空间调用方法结束
   * @Date 17:22 2019/1/3
   * @Param
   * @return
   * */



  /**
   * @Author luzhijian
   * @Description //入场检票，出场核销modal调用方法开始
   * @Date 17:34 2019/1/3
   * @Param
   * @return
   * */

  showinVisibleModal = () => {
    const {form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const {couponNo}=this.state;
      if (couponNo!==null&&couponNo!==""){
        const { dispatch } = this.props;
        const { sportType, venueType } = this.state;
        const param={
          couponNo,
          sportItemId:sportType,
          applyCourt:venueType===0?null:venueType,
        };
        dispatch({
          type: this.action.admissionIn,
          payload: param,
        }).then(()=>{
          const { cashier:{admissionInResult} }=this.props;
          if (handleResponse(admissionInResult)) {
            if (admissionInResult.data.cardType===1) {
              this.setState({
                inVisibleYear: true,
              });
            }
            else {
              this.setState({
                inVisible: true,
              });
            }

          }
        })
      }


    });

  };

  showOutVisibleModal = () => {
    const {couponNo, venueType, sportType}=this.state;
    if (couponNo!==null&&couponNo!==""){
      const { dispatch } = this.props;
      dispatch({
        type: this.action.getPaymentList,
        payload: {type:3},
      })
      const param={
        couponNo,
        sportItemId:sportType,
        applyCourt:venueType,
      };
      dispatch({
        type: this.action.admissionOut,
        payload: param,
      }).then(()=>{
        const { cashier:{admissionOutResult} }=this.props;
        if (handleResponse(admissionOutResult)){
          this.setState({
            outVisible: true,
          });
        }
      })
    }



  };

  handleinVisibleOk = (e) => {
    this.setState({
      inVisible: false,
    });

    const { cashier:{admissionInResult},dispatch }=this.props;
    const {couponNo, sportType, venueType, startValue, endValue, radioType}=this.state;
    const param={
      id:admissionInResult.data.id,
      memberId:admissionInResult.data.memberId,
      memberName:admissionInResult.data.memberName,
      memberTel:admissionInResult.data.memberTel,
      couponNo,
      sportItemId:sportType,
      consumeStatus:sportType===4?1:2,
      consumeCourt:venueType,
    };
    dispatch({
      type: this.action.admissionInSure,
      payload: param,
    }).then(()=>{
      const {cashier:{admissionInSureResult}}=this.props;
      if (handleResponse(admissionInSureResult)){
        message.success("检票成功!");
        dispatch({
          type: this.action.findCapacity,
          payload: {venuesCourtId:venueType},
        });
        const params={
          pageSize:10,
          pageNo:1,
          sportId:sportType,
          venueId:venueType,
          type:radioType,
          admissionStartTimeString:startValue!==null?startValue.format("YYYY-MM-DD HH:mm:ss"):null,
          admissionStartEndString:endValue!==null?endValue.format("YYYY-MM-DD HH:mm:ss"):null,
        };
        dispatch({
          type: this.action.admissionList,
          payload: params,
        }).then(()=>{
          const {cashier:{admissionListResult}}=this.props;
          this.setState({
            dataSource:admissionListResult&&admissionListResult.data&&admissionListResult.data.list
          })
        })
      }
    });


  };

  handleinVisibleCancel = (e) => {
    this.setState({
      inVisible: false,
    });
  };

  handleinVisibleYearOk = (e) => {
    this.setState({
      inVisibleYear: false,
    });

    const { cashier:{admissionInResult},dispatch }=this.props;
    const {couponNo,sportType,venueType,startValue,endValue,radioType}=this.state;
    const param={
      id:admissionInResult.data.id,
      memberId:admissionInResult.data.memberId,
      memberName:admissionInResult.data.memberName,
      memberTel:admissionInResult.data.memberTel,
      couponNo,
      sportItemId:sportType,
      consumeStatus:sportType===4?1:2,
      consumeCourt:venueType,

    };
    dispatch({
      type: this.action.admissionInSure,
      payload: param,
    }).then(()=>{
      const {cashier:{admissionInSureResult}}=this.props;
      if (admissionInSureResult!==0){
        message.success("检票成功");
        dispatch({
          type: this.action.findCapacity,
          payload: {venuesCourtId:venueType},
        });
        const params={
          pageSize:10,
          pageNo:1,
          sportId:sportType,
          venueId:venueType,
          type:radioType,
          admissionStartTimeString:startValue!==null?startValue.format("YYYY-MM-DD HH:mm:ss"):null,
          admissionStartEndString:endValue!==null?endValue.format("YYYY-MM-DD HH:mm:ss"):null,
        };
        dispatch({
          type: this.action.admissionList,
          payload: params,
        }).then(()=>{
          const {cashier:{admissionListResult}}=this.props;
          this.setState({
            dataSource:admissionListResult&&admissionListResult.data&&admissionListResult.data.list
          })
        })
      }
    });


  };

  handleinVisibleYearCancel = (e) => {
    this.setState({
      inVisibleYear: false,
    });
  };

  /**
   * 出场核销
   * @param values
   */
  onOvertimePaymentOk = (values) => {
    const { sportType, selectedRows, venueType, couponNo }=this.state;
    const { cashier: { admissionOutResult }, dispatch }=this.props;
    const param={
      applyCourt: venueType,
      consumeCourt: admissionOutResult.data.id,
      outTime: admissionOutResult.data.outTime,
      duration: admissionOutResult.data.duration,
      inTime: admissionOutResult.data.inTime,
      paymentAmount: admissionOutResult.data.overConsumeAmount,
      overDuration: admissionOutResult.data.timeInterval,
      sportItemId: sportType,
      overStatus: admissionOutResult.data.timeInterval > 0 ? 1 : 0,
      cardNO: couponNo,
      ...values,
    };
    if (values.paymentMode === "5"){
      const arr=[];
      for(let i=0; i < selectedRows.length; i++){
        arr.push(selectedRows[i])
      }
      param.couponNoList = arr;
    }
    dispatch({
      type: this.action.admissionOutSure,
      payload: param,
    }).then(()=>{
      const { bookPlace:{admissionOutSureResult} }=this.props;
      if (handleResponse(admissionOutSureResult)) {
        if (values.paymentMode === "4") {
          // 微信支付
          const { orderNo, goodsName, deviceCode } = admissionOutSureResult.data;
          this.onBarVisibleChange(true, orderNo, goodsName, deviceCode)
        } else {
          message.success("出场核销成功!");
          this.handlePaySuccess();
        }
      }
    })
  };

  handleoutVisibleOk = (e) => {

    const {cardTableSelect,sportType,couponNo,paymentMode,selectedRows,venueType,startValue,endValue,radioType}=this.state;
    const {cashier:{admissionOutResult},dispatch}=this.props;
    if ((admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.overConsumeAmount&&(paymentMode===null||paymentMode===undefined))){
      message.error("请选择支付方式");
      return ;
    }
    const param={
      applyCourt:venueType,
      consumeCourt:admissionOutResult.data.id,
      outTime:admissionOutResult.data.outTime,
      duration:admissionOutResult.data.duration,
      inTime:admissionOutResult.data.inTime,
      paymentAmount:admissionOutResult.data.overConsumeAmount,
      overDuration:admissionOutResult.data.timeInterval,
      sportItemId:sportType,
      cardNO:couponNo,
      overStatus:admissionOutResult.data.timeInterval>0?1:0,
      paymentMode,
    };
    if (paymentMode===2){
      param.cardBasicInfoId=cardTableSelect&&cardTableSelect.cardNo;
    }
    else if (paymentMode===5){
      const arr=[];
      for(let i=0;i<selectedRows.length;i++){
        arr.push(selectedRows[i])
      };
      param.couponNoList=arr;
    }
    dispatch({
      type: this.action.admissionOutSure,
      payload: param,
    }).then(()=>{
      const { bookPlace:{admissionOutSureResult} }=this.props;
      if (handleResponse(admissionOutSureResult)) {
        if (paymentMode === 4) {
          // 微信支付
          const { orderNo, goodsName, deviceCode } = admissionOutSureResult;
          this.onBarVisibleChange(true, orderNo, goodsName, deviceCode)
        } else {
          message.success("出场核销成功!");
          this.handlePaySuccess();
        }
      }
    })
  }

  /**
   * 出场核销支付成功
   */
  handlePaySuccess = () => {
    const { dispatch } = this.props;
    const { sportType, venueType, startValue, endValue, radioType }=this.state;
    this.setState({ outVisible: false });
    dispatch({
      type: this.action.findCapacity,
      payload: { venuesCourtId: venueType },
    });
    const params={
      pageSize: 10,
      pageNo: 1,
      sportId: sportType,
      venueId: venueType,
      type: radioType,
      admissionStartTimeString: startValue !== null ? startValue.format("YYYY-MM-DD HH:mm:ss") : null,
      admissionStartEndString: endValue !== null ? endValue.format("YYYY-MM-DD HH:mm:ss") : null,
    };
    dispatch({
      type: this.action.admissionList,
      payload: params,
    }).then(()=>{
      const { cashier: { admissionListResult } } = this.props;
      this.setState({
        dataSource: admissionListResult && admissionListResult.data && admissionListResult.data.list,
      });
    });
  };

  /**
   * 微信支付窗口
   * @param barVisible
   * @param orderNo
   * @param goodsName
   * @param deviceCode
   */
  onBarVisibleChange = (barVisible, orderNo, goodsName, deviceCode) => {
    this.setState({ barVisible, orderNo, goodsName, deviceCode });
  };

  handleoutVisibleCancel = (e) => {
    this.setState({
      outVisible: false,
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

  handleTicketVisibleOk = (e) => {
    this.setState({
      ticketVisible: false,
      paymentMode:4,
    });
  };

  handleTicketVisibleCancel = (e) => {
    this.setState({
      ticketVisible: false,
    });
  };

  /**
   * @Author luzhijian
   * @Description //入场检票，出场核销modal调用方法结束
   * @Date 17:34 2019/1/3
   * @Param
   * @return
   * */


  /**
   * @Author luzhijian
   * @Description //查看当日入场/查看全部入场radio
   * @Date 17:37 2019/1/7
   * @Param
   * @return
   * */
  handleRadioChange=(value)=>{
    const { form } = this.props;
    if (value.target.value === 1) {
      const day = moment().format("YYYY-MM-DD");
      form.setFieldsValue({
        inTime: moment(`${day} 00:00:00`),
        outTime: moment(`${day} 23:59:59`),
      });
    }
    if (value.target.value === 2) {
      form.resetFields(["inTime", "outTime"]);
    }
    this.setState({
      radioType:value.target.value,
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
        consumeStatus:values.consumptionState==="0"?null:values.consumptionState,
        // admissionStartTimeString:startValue!==null?startValue.format("YYYY-MM-DD HH:mm:ss"):null,
        // admissionStartEndString:endValue!==null?endValue.format("YYYY-MM-DD HH:mm:ss"):null,
      };
      if (radioType===1){
        param.admissionStartTimeString=startValue!==null?startValue.format("YYYY-MM-DD HH:mm:ss"):null;
        param.admissionStartEndString=endValue!==null?endValue.format("YYYY-MM-DD HH:mm:ss"):null;
      }
      dispatch({
        type: this.action.admissionList,
        payload: param,
      }).then(()=>{
        const {cashier:{admissionListResult}}=this.props;
        this.setState({
          dataSource:admissionListResult&&admissionListResult.data&&admissionListResult.data.list
        })
      })


    });

  };

  handleSportChange=(value)=>{
    const {
      dispatch,
      form,
    } = this.props;
      this.setState({
        sportType:value,
        venueType:null,
      });
    form.resetFields();
    const params={
      sportId:value,
    };
    dispatch({
      type: this.action.venueName,
      payload: params,
    }).then(()=>{
        const {cashier:{findCourtInfoResult}}=this.props;
        this.setState({
          venueType:findCourtInfoResult&&findCourtInfoResult.data&&findCourtInfoResult.data.length>0&&findCourtInfoResult.data[0].id
        })
        if (findCourtInfoResult&&findCourtInfoResult.data && findCourtInfoResult.data.length>0 && findCourtInfoResult.data[0].id) {
          dispatch({
            type: this.action.findCapacity,
            payload: {venuesCourtId:findCourtInfoResult&&findCourtInfoResult.data&&findCourtInfoResult.data.length>0&&findCourtInfoResult.data[0].id},
          });
          const p={
            pageSize:10,
            pageNo:1,
            sportId:value,
            venueId:findCourtInfoResult&&findCourtInfoResult.data&&findCourtInfoResult.data.length>0&&findCourtInfoResult.data[0].id,
          };
          dispatch({
            type: this.action.admissionList,
            payload: p,
          }).then(()=>{
            const {cashier:{admissionListResult}}=this.props;
            this.setState({
              dataSource:admissionListResult&&admissionListResult.data&&admissionListResult.data.list
            })
          })
        }
      }
    );
  };

  handleVenueChange=(value)=>{
    const { dispatch,form, } = this.props;
    const {sportType}=this.state;
    this.setState({
      venueType:value,
    });
    form.resetFields();
    dispatch({
      type: this.action.findCapacity,
      payload: {venuesCourtId:value},
    })
    const p={
      pageSize:10,
      pageNo:1,
      sportId:sportType,
      venueId:value,
    };
    dispatch({
      type: this.action.admissionList,
      payload: p,
    }).then(()=>{
      const {cashier:{admissionListResult}}=this.props;
      this.setState({
        dataSource:admissionListResult&&admissionListResult.data&&admissionListResult.data.list
      })
    })
  };

  /**
   * @Author luzhijian
   * @Description //重置按钮
   * @Date 13:52 2018/12/28
   * @Param
   * @return
   * */
  handleReset=()=>{

    const { dispatch, form, } = this.props;
    const {sportType,venueType,radioType}=this.state;
    this.setState({
      radioType: 1,
      startValue: moment(formatDate(new Date(),1),"YYYY-MM-DD HH:mm:ss"),
      endValue: moment(formatDate(new Date(),2),"YYYY-MM-DD HH:mm:ss"),
    });
    form.resetFields();
    const param={
      pageNo:1,
      pageSize:10,
      sportId:sportType,
      venueId:venueType,
      type:radioType,
      admissionStartTimeString: moment(formatDate(new Date(),1),"YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss"),
      admissionStartEndString: moment(formatDate(new Date(),2),"YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss"),
    };
    dispatch({
      type: this.action.admissionList,
      payload: param,
    }).then(()=>{
      const {cashier:{admissionListResult}}=this.props;
      this.setState({
        dataSource:admissionListResult&&admissionListResult.data&&admissionListResult.data.list
      })
    })

  };
  /**
   * @Author luzhijian
   * @Description //卡号框输入改变
   * @Date 10:19 2019/1/15
   * @Param
   * @return
   * */

  couponNoChange=(value)=>{
    this.setState({
      couponNo:value.target.value,
    })

  };

  toDayTime = (e) => {
    var formatDate = function (date) {
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      m = m < 10 ? ('0' + m) : m;
      var d = date.getDate();
      d = d < 10 ? ('0' + d) : d;
      if (e===1){
       return y + '-' + m + '-' + d+' '+'00:00:00';
     }
     else {
       return y + '-' + m + '-' + d+' '+'23:59:59';
     }

    };
    return formatDate( new Date());
  };


  handleCashPay=()=>{
    this.setState({
      paymentMode:1
    })
  };

  handleWeiPay=()=>{
    this.setState({
      paymentMode:3
    })
  };

  handleZhiPay=()=>{
    this.setState({
      paymentMode:4
    })
  };

  handlePayList=(e)=>{
    const { dispatch } = this.props;
    this.setState({
      choosePayMent:e.code,
    });
    const { continuePayRecord } = this.state;
    if (e.code==="2"){
      this.handleDisplayCard();
    }
    else if (e.code==="1") {
      this.handleCashPay();
    }
    else if (e.code==="3") {
      this.handleWeiPay()
    }
    else if (e.code==="4") {
      this.handleZhiPay()
    }
    else if (e.code==="5") {
      this.handleDisplayTicket()
    }
  };

  handleDisplayTicket=()=>{
    const {
      dispatch,
      cashier:{admissionOutResult},
      form: { validateFieldsAndScroll },
    } = this.props;
    this.setState({
      ticketVisible:true,
    });
    const {sportType}=this.state;
    if (admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.memberTel){
      const param={
        memberTel:admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.memberTel,
        sportItemId:sportType,
      };
      dispatch({
        type: this.action.displayTicket,
        payload: param,
      });
    }
  };

  handleDisplayCard=(value)=>{
    const {
      form: { validateFieldsAndScroll },
      dispatch,
      cashier:{admissionOutResult},
    } = this.props;

    const {isMember}=this.state;
    this.setState({
      cardVisible:true,
    });

      const param={
        memberTel:admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.memberTel,
      };
      dispatch({
        type: this.action.displayCard,
        payload: param,
      });



  };


  render() {
    const selectedTag = classNames(styles.selectedTag, styles.normalTag);
    const defaultTag = classNames(styles.defaultTag, styles.normalTag);

    const {
      form: { getFieldDecorator },
      cashier:{sportListResult},
      bookPlace:{displayCardResult,displayTicketResult},
      cashier:{findCourtInfoResult,admissionListResult,admissionInResult,admissionOutResult,findCapacityResult,getPaymentListResult,findDictionariesResult},
    } = this.props;
    const {couponNo,startValue, endValue, endOpen,sportType,venueType,radioType,date,dataSource,choosePayMent,cardTableSelect} = this.state;
    const { barVisible, orderNo, goodsName, deviceCode } = this.state;

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
        title: '会员类型',
        dataIndex: 'inEvidenceString',
        key: 'inEvidenceString',
      },
      {
      title: '入场时间',
      dataIndex: 'createDate',
      key: 'createDate',
      },
      {
      title: '更衣箱号',
      key: 'lockerNo',
      dataIndex: 'lockerNo',
       },
      // {
      //   title: '出场时间',
      //   key: 'outTime',
      //   dataIndex: 'outTime',
      // },
      // {
      //   title: '超时时长(分钟)',
      //   key: 'overDuration',
      //   dataIndex: 'overDuration',
      // },
      // {
      //   title: '超时金额(元)',
      //   key: 'overConsumeAmount',
      //   dataIndex: 'overConsumeAmount',
      // },

      ];

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

    const ticketColumns = [
      {
        title: 'couponNo',
        dataIndex: 'couponNo',
        key:'couponNo',
      },
      {
        title: 'duration',
        dataIndex: 'duration',
        key:'duration',
        render: (text, record) =>
          <span>
            {record.duration}分钟
          </span>
      },
      {
        title: 'ticketSalePrice',
        dataIndex: 'ticketSalePrice',
        key:'ticketSalePrice',
        render: (text, record) =>
          <span>
            ￥{record.ticketSalePrice}
          </span>
      }];

    const TicketRowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRows:selectedRows,
        })
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };

    const  title=(
      <div>
        <span>验票信息</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span style={{color:"red",fontSize:20 }}>馆内容量:{findCapacityResult&&findCapacityResult.maxCapacity}人</span>&nbsp;&nbsp;&nbsp;&nbsp;
        <span style={{color:"red",fontSize:20 }}>当前在馆:{findCapacityResult&&findCapacityResult.currentPerson}人</span>&nbsp;&nbsp;&nbsp;&nbsp;
        <span style={{color:"red",fontSize:20 }}>剩余容量:{findCapacityResult&&findCapacityResult.lastPerson}人</span>
      </div>
    );


    return (
      <PageHeaderWrapper
        title="核销"
        wrapperClassName={styles.advancedForm}
      >

        <Card bordered={false}>
          <Authorized authority='jis_platform_dc_cashier_in_out_sport' nomatch={noMatch()}>
            <div>
              {
                sportListResult && sportListResult.data && sportListResult.data.map(step =>
                  <Tooltip key={step.id} placement="topLeft" title={step.itemName && step.itemName.length > 8 ? step.itemName : undefined}>
                    <Tag.CheckableTag
                      className={sportType === step.id ? selectedTag : defaultTag}
                      style={{ marginRight: 5, marginTop: 24 }}
                      checked={sportType === step.id}
                      onChange={venueType!==null && venueType!==undefined&&(() => this.handleSportChange(step.id))}
                    >
                      <Ellipsis length={8}>{step.itemName}</Ellipsis>
                    </Tag.CheckableTag>
                  </Tooltip>
                )
              }
            </div>
          </Authorized>
          <Authorized authority='jis_platform_dc_cashier_in_out_court' nomatch={noMatch()}>
            <div>
              {
                findCourtInfoResult && findCourtInfoResult.data && findCourtInfoResult.data.map(step =>
                  <Tooltip key={step.id} placement="topLeft" title={step.courtName && step.courtName.length > 8 ? step.courtName : undefined}>
                    <Tag.CheckableTag
                      className={venueType === step.id ? selectedTag : defaultTag}
                      style={{ marginRight: 5, marginTop: 4 }}
                      checked={venueType === step.id}
                      onChange={() => this.handleVenueChange(step.id)}
                    >
                      <Ellipsis length={8}>{step.courtName}</Ellipsis>
                    </Tag.CheckableTag>
                  </Tooltip>
                )
              }
            </div>
          </Authorized>
        </Card>
        {/* 验票信息 */}
        <Card title={title} bordered={false} style={{ marginTop:"1%" }}>
          {/* 基本信息 */}
          <Form>
            {/* 验票信息 */}
            <Row style={{marginTop:24}}>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="">
                  {getFieldDecorator('certificateType', {
                    // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                    rules: [{ required: false, message: "请扫描票号或者刷卡" }],
                  })
                  (
                    <Input disabled={venueType===null || venueType===undefined} placeholder="请扫描票号或者刷卡" onChange={(value)=>this.couponNoChange(value)} />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="">
                  {getFieldDecorator('certificateNum', {
                    // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateNum!==null)?selectOneResult.certificateNum:"",
                    // rules: [{ required: false, message: formatMessage({ id: 'enter.ID.number' }) }],
                  })
                  (
                    <span>
                      <Authorized authority='jis_platform_dc_cashier_in_out_admission' nomatch={noMatch()}>
                        <Button type="primary" disabled={couponNo===null|| venueType===null || venueType===undefined} onClick={this.showinVisibleModal}>
                         入场检票
                        </Button>
                      </Authorized>
                      <Authorized authority='jis_platform_dc_cashier_in_out_Appearance' nomatch={noMatch()}>
                        <Button type="primary" disabled={couponNo===null|| venueType===null || venueType===undefined} style={{marginLeft:8}} onClick={this.showOutVisibleModal}>
                          出场核销
                        </Button>
                      </Authorized>
                      {/* 入场modal 非年卡 */}
                      <Modal
                        width="60%"
                        title="入场检票"
                        visible={this.state.inVisible}
                        onOk={this.handleinVisibleOk}
                        onCancel={this.handleinVisibleCancel}
                      >
                        <Row>
                          <Col span={8}>
                            <Form.Item {...formItemLayout} label="验票结果">
                              <span style={{ color: 'red' }}>{admissionInResult&&admissionInResult.msg}</span>
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={8}>
                            <Form.Item {...formItemLayout} label="票名">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.ticketName} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...formItemLayout} label="适用日期范围">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&((admissionInResult.data.applyDateStart)+"--"+(admissionInResult.data.applyDateEnd))} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...formItemLayout} label="适用时间范围">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&((admissionInResult.data.applyTimeStart)+"--"+(admissionInResult.data.applyTimeEnd))} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={8}>
                            <Form.Item {...formItemLayout} label="适用场地">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.applyCourtName} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...formItemLayout} label="适用日期类型">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.applyDateString} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...formItemLayout} label="使用时长(分钟)">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.duration} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={8}>
                            <Form.Item {...formItemLayout} label="姓名">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.memberName} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...formItemLayout} label="联系方式">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.memberTel} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Modal>

                      {/* 入场modal 年卡 */}
                      <Modal
                        width="60%"
                        title="入场检票"
                        visible={this.state.inVisibleYear}
                        onOk={this.handleinVisibleYearOk}
                        onCancel={this.handleinVisibleYearCancel}
                      >
                        <Row>
                          <Col span={8}>
                            <Form.Item {...formItemLayout} label="验票结果">
                              <span style={{ color: 'red' }}>{admissionInResult&&admissionInResult.msg}</span>
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={8}>
                            <Form.Item {...formItemLayout} label="票名">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.ticketName} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...formItemLayout} label="姓名">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.memberName} />
                            </Form.Item>
                          </Col>
                          <Col span={8}>
                            <Form.Item {...formItemLayout} label="联系方式">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.memberTel} />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Modal>

                      {/* 出场modal */}
                      <Modal
                        width="60%"
                        title="出场核销"
                        // visible={this.state.outVisible}
                        visible={false}
                        onOk={this.handleoutVisibleOk}
                        onCancel={this.handleoutVisibleCancel}
                      >
                        <Row>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="姓名:">
                              <Input disabled value={admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.memberName} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="联系方式:">
                              <Input disabled value={admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.memberTel} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="入场时间:">
                              <Input disabled value={admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.inTime} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="消费时长(分钟):">
                              <Input disabled value={admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.duration} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="实际结束时间:">
                              <Input disabled value={admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.outTime} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="超时金额(元):">
                              <Input disabled value={admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.overConsumeAmount} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24} style={{marginLeft:"-17%"}}>
                            {
                              admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.overConsumeAmount&&
                              <Form.Item {...formItemLayout} label="支付方式:">
                                {getFieldDecorator('paymentMethod', {
                                  initialValue:admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.paymentMethod,
                                  // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                                  rules: [{ required: false, message: "请输入" }],
                                })
                                (
                                  <div>
                                    {
                                      admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.overConsumeAmount&&
                                      getPaymentListResult&&getPaymentListResult.data&&getPaymentListResult.data.map(step =>
                                      {
                                        return (
                                          <Tooltip key={step.code} placement="topLeft" title={step.name && step.name.length > 8 ? step.name : undefined}>
                                            <Tag.CheckableTag
                                              className={choosePayMent === step.code ? selectedTag : defaultTag}
                                              style={{ marginRight: 5, marginTop: 24 }}
                                              checked={choosePayMent === step.code}
                                              onChange={() => this.handlePayList(step)}
                                            >
                                              <Ellipsis length={8}>{step.name}</Ellipsis>
                                            </Tag.CheckableTag>
                                          </Tooltip>
                                        )
                                      })
                                    }
                                  </div>
                                )
                                }
                              </Form.Item>
                            }
                          </Col>
                        </Row>
                      </Modal>
                      <Modal
                        width="30%"
                        title=""
                        visible={this.state.cardVisible}
                        onOk={this.handleCardVisibleOk}
                        onCancel={this.handleCardVisibleCancel}
                      >
                        <Table
                          rowKey={record => record.id}
                          style={{marginTop:"3%"}}
                          columns={cardColumns}
                          dataSource={displayCardResult&&displayCardResult.data}
                          pagination={false}
                          showHeader={false}
                          rowClassName={record => {
                            if (cardTableSelect != null && cardTableSelect.id === record.id) {
                              return `${styles.selectedColor}`;
                            } else {
                              return '';
                            }
                          }}
                          onRow={record => {
                            return {
                              onClick: () => {
                                if (cardTableSelect != null && cardTableSelect.id === record.id) {
                                  this.setState({ cardTableSelect: {} });
                                } else {
                                  this.setState({ cardTableSelect: record });
                                }
                              },
                            };
                          }}
                        />
                      </Modal>
                      {/* 票券modal */}
                      <Modal
                        width="30%"
                        title=""
                        visible={this.state.ticketVisible}
                        onOk={this.handleTicketVisibleOk}
                        onCancel={this.handleTicketVisibleCancel}
                      >
                       <Table
                         rowKey={record => record.id}
                         rowSelection={TicketRowSelection}
                         columns={ticketColumns}
                         dataSource={displayTicketResult&&displayTicketResult.data}
                         pagination={false}
                         showHeader={false}
                       />
                      </Modal>
                    </span>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        {/* 入场信息 */}
        <Card title="入场信息" bordered={false} style={{ marginTop:"1%" }}>
          <Form hideRequiredMark>
            <Row>
              <Col span={12}>
                <Form.Item {...formItemLayout} label="">
                  {getFieldDecorator('radio', {
                    initialValue:1,
                    // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                    rules: [{ required: false, message: "请选择" }],
                  })
                  (
                    <RadioGroup disabled={venueType===null || venueType===undefined} name="radiogroup" style={{marginLeft:"5%"}} onChange={this.handleRadioChange}>
                      <Radio value={1}>查看当日入场</Radio>
                      <Radio value={2}>查看全部入场</Radio>
                    </RadioGroup>
                  )
                  }
                </Form.Item>
              </Col>
            </Row>
            {/* 数量 */}
            <Row gutter={24}>
              <Col span={6}>
                <Form.Item {...formItemLayout} label="姓名">
                  {getFieldDecorator('name', {
                    // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                    rules: [{ required: false, message: "请选择" }],
                  })
                  (
                    <Input disabled={venueType===null || venueType===undefined} placeholder="入场人姓名" />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item {...formItemLayout} label="联系方式">
                  {getFieldDecorator('contact', {
                    // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                    rules: [{ required: false, message: "请选择" }],
                  })
                  (
                    <Input disabled={venueType===null || venueType===undefined} placeholder="入场人联系方式" />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item {...formItemLayout} label="入场时间">
                  {getFieldDecorator('inTime', {
                    initialValue:radioType===1 && moment(startValue),
                    rules: [{ required: false, message: "请选择" }],
                  })
                  (
                    <DatePicker
                      style={{width:'100%'}}
                      // disabled={radioType===1}
                      disabledDate={this.disabledStartDate}
                      showTime={{format:"HH:mm:ss"}}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="开始时间"
                      onChange={this.onStartChange}
                      onOpenChange={this.handleStartOpenChange}
                    />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item {...formItemLayout} label="出场时间">
                  {getFieldDecorator('outTime', {
                    initialValue:radioType===1 && moment(endValue),
                    rules: [{ required: false, message: "请选择" }],
                  })
                  (
                    <DatePicker
                      style={{width:'100%'}}
                      // disabled={radioType===1}
                      disabledDate={this.disabledEndDate}
                      showTime={{format:"HH:mm:ss"}}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="结束时间"
                      onChange={this.onEndChange}
                      open={endOpen}
                      onOpenChange={this.handleEndOpenChange}
                    />
                  )
                  }
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={24} style={{textAlign:'right'}}>
                <Authorized authority='jis_platform_dc_cashier_in_out_query' nomatch={noMatch()}>
                  <Button disabled={venueType===null || venueType===undefined} type="primary" onClick={this.handleQelect}>
                    查询
                  </Button>
                </Authorized>
                <Button disabled={venueType===null || venueType===undefined} type="primary" style={{marginLeft:5}} onClick={() => this.handleReset()}>
                  重置
                </Button>
              </Col>
            </Row>
            <div className={styles.resTable} style={{marginTop:"2%"}}>
              <Table
                rowKey={record => record.id}
                bordered
                columns={columns}
                dataSource={dataSource}
              />
            </div>
          </Form>
        </Card>
        <BarCode
          visible={barVisible}
          orderNo={orderNo}
          goodsName={goodsName}
          deviceCode={deviceCode}
          onOk={() => {
            this.handlePaySuccess();
            this.onBarVisibleChange(false);
          }}
          onCancel={() => this.onBarVisibleChange(false)}
        />
        <OvertimePayment
          visible={this.state.outVisible}
          // visible={false}
          params={admissionOutResult && admissionOutResult.data || {}}
          onOk={this.onOvertimePaymentOk}
          onCancel={() => this.handleoutVisibleCancel(false)}
        />
      </PageHeaderWrapper>
    );
  }
}

export default AdvancedForm;
