import React, { Component } from 'react';
import {
  Card,
  Button,
  Form,
  Col,
  Row,
  Input,
  Radio,
  message,
  Table,
  Modal,
  Tooltip,
  Tag,
} from 'antd';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import moment from 'moment';
import router from "umi/router";
import { handleResponse } from '../../utils/globalUtils';
import DateView from './DateView';
import classNames from 'classnames';
import styles from './index.less';
import Ellipsis from '../../components/Ellipsis';
import { noMatch } from '../../utils/authority';
import Authorized from '../../utils/Authorized';

const RadioGroup = Radio.Group;

@connect(({bookPlace,cashier, loading }) => ({
  bookPlace,cashier,
  loading: loading.models.bookPlace,
}))
@Form.create()
class AdvancedForm extends Component {

  action = {
    soprtList: 'bookPlace/sportlist',
    displayTicket: 'bookPlace/displayticket',
    displayCard: 'bookPlace/displaycard',
    remindThen: 'bookPlace/remindthen',
    venueName:'cashier/venuename',
    admissionList:'cashier/admissionlist',
    bookingModal:'bookPlace/bookingmodal',
    admissionIn:'bookPlace/admissionin',
    admissionOut:'cashier/admissionout',
    admissionInSure:'bookPlace/admissioninsure',
    admissionOutSure:'bookPlace/admissionoutsure',
    bookSure:'bookPlace/booksure',
    getPaymentList:'cashier/getpaymentlist',
  };

  state = {
    con:0,
    isMember: 1,
    dataSoure: [],
    couponNo:null,// 票券号码，先模拟
    outVisible: false,// 出场modal
    inVisible:false,// 入场modal
    ticketVisible:false,// 票券modal
    cardVisible:false,// 会员卡modal
    bookVisible:false,// 订场modal
    paymentMode:null,// 支付方式
    cardTableSelect:{},// 会员卡支付
    selectedRows:[],// 票券支付选中list
    bookPriceSum:null,// 订场销售价格总和
    bookSelectIds:[],// 订场销售选中的ids
    bookingModalDateSoure:null,// 订场销售table数据
    startValue: null,
    endValue: null,
    endOpen: false,
    venueType:null,// 场馆id
    sportType:null,// 运动类型id
    radioType:1,// Radio变化时候的值
    choosePayMent:null,// 选择的支付方式的code
    /* ======================================== */
    width: '100%',

  };

  componentDidMount() {

    const {
      dispatch,
    } = this.props;

    const param={
      saleType:2,
    };
    dispatch({
      type: this.action.soprtList,
      payload: param,
    }).then(() => {
      const {bookPlace: {sportListResult}} = this.props;

      if (sportListResult && sportListResult.data && sportListResult.data.length && sportListResult.data.length>0 && sportListResult.data[0].id) {
        this.setState({
          sportType:sportListResult && sportListResult.data && sportListResult.data.length>0 && sportListResult.data[0].id,
        });
        const params = {
          sportItemId: sportListResult && sportListResult.data && sportListResult.data.length>0 &&sportListResult.data[0].id,
        };
        //  到时提醒
        dispatch({
          type: this.action.remindThen,
          payload: params,
        })
      }

    });

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
   * @Description //入场检票，出场核销modal调用方法开始
   * @Date 17:34 2019/1/3
   * @Param
   * @return
   * */

  showinVisibleModal = () => {
    const {form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return ;
      }

    });
    const {couponNo}=this.state;
    if (couponNo!==null&&couponNo!==""){
      const { dispatch } = this.props;
      const { sportType } = this.state;
      const param={
        couponNo,
        sportItemId:sportType,
      };
      dispatch({
        type: this.action.admissionIn,
        payload: param,
      }).then(()=>{
        const { bookPlace:{admissionInResult} }=this.props;
        if (handleResponse(admissionInResult)) {
          this.setState({
            inVisible: true,
          });
        }
      })
    }


  };

  showOutVisibleModal = () => {
    const {couponNo}=this.state;
    if (couponNo!==null&&couponNo!==""){
      const { dispatch } = this.props;

      dispatch({
        type: this.action.getPaymentList,
        payload: {type:3},
      })
      const param={
        couponNo,
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


    const { bookPlace:{admissionInResult},dispatch }=this.props;
    const {couponNo,sportType}=this.state;
    const param={
      id:admissionInResult&&admissionInResult.data&&admissionInResult.data.id,
      memberName:admissionInResult&&admissionInResult.data&&admissionInResult.data.memberName,
      memberTel:admissionInResult&&admissionInResult.data&&admissionInResult.data.memberTel,
      couponNo,
      sportItemId:sportType,
      consumeCourt:admissionInResult&&admissionInResult.data&&admissionInResult.data.applyCourt,
      duration:admissionInResult&&admissionInResult.data&&admissionInResult.data.duration,
    };
    dispatch({
      type: this.action.admissionInSure,
      payload: param,
    }).then(()=>{
      const {bookPlace:{admissionInSureResult}}=this.props;
      if (handleResponse(admissionInSureResult)) {
        message.success("检票成功!");
        this.setState({
          inVisible: false,
        });
        const params = {
          sportItemId: sportType,
        };
        //  到时提醒
        dispatch({
          type: this.action.remindThen,
          payload: params,
        })
      }
    })
  };

  handleinVisibleCancel = (e) => {
    this.setState({
      inVisible: false,
    });

  };

  handleoutVisibleOk = (e) => {

    const {cardTableSelect,sportType,couponNo,paymentMode,selectedRows}=this.state;
    const {cashier:{admissionOutResult},dispatch}=this.props;
    if ((admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.overConsumeAmount&&(paymentMode===null||paymentMode===undefined))){
      message.error("请选择支付方式");
      return ;
    }
    const param={
      consumeCourt:admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.id,
      outTime:admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.outTime,
      duration:admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.duration,
      inTime:admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.inTime,
      paymentAmount:admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.overConsumeAmount,
      overDuration:admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.timeInterval,
      sportItemId:sportType,
      cardNO:couponNo,
      overStatus:admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.timeInterval>0?1:0,
      paymentMode,
    };
    if (paymentMode===2){
      param.cardBasicInfoId=cardTableSelect&&cardTableSelect.cardNo;
    }
    else if (paymentMode===4){
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
        message.success("出场核销成功!");

        this.setState({
          outVisible: false,
        });
        const params = {
          sportItemId: sportType,
        };
        //  到时提醒
        dispatch({
          type: this.action.remindThen,
          payload: params,
        })
      }
    })


  };

  handleoutVisibleCancel = (e) => {
    this.setState({
      outVisible: false,
    });
  };

  handleDisplayTicket=(value)=>{
    const {
      dispatch,
      cashier:{admissionOutResult},
      form: { validateFieldsAndScroll },
    } = this.props;


    this.setState({
      ticketVisible:true,
    });

    const {sportType}=this.state;

    if (value===1){
      const param={
        memberTel:admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.memberTel,
        sportItemId:sportType,
      };
      dispatch({
        type: this.action.displayTicket,
        payload: param,
      });
    }
    else {
      validateFieldsAndScroll((error, values) => {
        const param={
          memberTel:values.bookNoMemberTel,
          sportItemId:sportType,
        };
        dispatch({
          type: this.action.displayTicket,
          payload: param,
        });
      });
    }





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

    if (value===1){
      const param={
        memberTel:admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.memberTel,
      };
      dispatch({
        type: this.action.displayCard,
        payload: param,
      });
    }
    else {
      validateFieldsAndScroll((error, values) => {
        const param={
          memberTel:isMember===1?values.bookMemberTel:values.bookNoMemberTel,
        };
        dispatch({
          type: this.action.displayCard,
          payload: param,
        });
      });


    }


  };

  handlePayList=(e,type)=>{
    const { dispatch } = this.props;
    this.setState({
      choosePayMent:e.code,
    });
    const { continuePayRecord } = this.state;
    if (e.code==="2"){
      this.handleDisplayCard(type)
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
      this.handleDisplayTicket(type)
    }

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

  // 订场
  handleDisplayBook=()=>{
    const {
      dispatch,
      cashier:{admissionOutResult},
    } = this.props;

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

  handleBookVisibleOk = (e) => {

    const {dispatch,   form: { validateFieldsAndScroll },cashier:{admissionOutResult},}=this.props;

    const {isMember,paymentMode,cardTableSelect,selectedRows,sportType,bookPriceSum,bookSelectIds,con}=this.state;
    validateFieldsAndScroll(['bookMemberTel','bookNoMemberTel','noMemberName'],(error, values) => {
      if(error){
        return;
      }
      if (admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.overConsumeAmount&&(paymentMode===null||paymentMode==undefined)){
        message.error("请选择支付方式");
        return ;
      }
      const param={
        customerType:isMember,
        paymentMode,
        sportItemId:sportType,
        paymentAmount:bookPriceSum,
        ids:bookSelectIds,
        memberTel:isMember===1?values.bookMemberTel:values.bookNoMemberTel,
        merberName:values.noMemberName
      };
      if (paymentMode===2){
        if (cardTableSelect&&cardTableSelect.id){
          param.cardBasicInfoId=cardTableSelect&&cardTableSelect.id;

        }
        else {
          message.error("没有会员卡，请选择其他支付方式");
          return ;
        }

      }
      else if (paymentMode===4){
        const arr=[];
        for(let i=0;i<selectedRows.length;i++){
          arr.push(selectedRows[i])
        };
        param.couponNoList=arr;
      }

      dispatch({
        type: this.action.bookSure,
        payload: param,
      }).then(()=>{
        const {bookPlace:{bookSureResult}}=this.props;
        if (handleResponse(bookSureResult)) {
          message.success("支付成功");
          this.setState({
            bookVisible: false,
          });
          const p=con+1;
          this.setState({
            con:p,
            bookSelectIds:[]
          })
        }
      })
    });


  };

  handleBookVisibleCancel = () => {
    const {form} = this.props;
    form.resetFields(['bookMemberTel','bookNoMemberTel','noMemberName']);
    this.setState({
      bookVisible: false,
    });
  };


  onRadioChange = (e) => {
    this.setState({
      isMember: e,
    });
    const { dispatch }=this.props
    if (e===1){
      dispatch({
        type: this.action.getPaymentList,
        payload: {type:3},
      })
    }
    else {
      dispatch({
        type: this.action.getPaymentList,
        payload: {type:5},
      })
    }
  };

  cardTableOnRow=(record)=>{
    this.setState({
      cardTableSelect:record,
    })
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
    this.setState({
      radioType:value.target.value,
    })

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
    const {startValue,endValue,sportType,venueType,radioType,isMember}=this.state;
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
      })
    });
  };



  handleSportChange=(value)=>{
    const {
      dispatch,
    } = this.props;
      this.setState({
        sportType:value,
        venueType:null,
      });
    const params={
      sportItemId:value,
    };
    dispatch({
      type: this.action.remindThen,
      payload: params,
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

    const {
      dispatch,
      form,
    } = this.props;
    const {sportType,venueType}=this.state;
    form.resetFields();
    const param={
      pageNo:1,
      pageSize:10,
      sportId:sportType,
      venueId:venueType,
      type:1,
    };
    dispatch({
      type: this.action.admissionList,
      payload: param,
    });

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

  /**
   * @Author luzhijian
   * @Description //显示票券
   * @Date 11:40 2019/1/15
   * @Param
   * @return
   * */


  /**
   * @Author luzhijian
   * @Description //选中订场销售
   * @Date 17:14 2019/1/16
   * @Param
   * @return
   * */

  handleBookSelect=()=>{

    this.setState({
      bookVisible:true,
    });

    const {bookSelectIds}=this.state;
    const {
      dispatch,
      form,
    } = this.props;
    form.resetFields();
    const param={
      ids:bookSelectIds
    };
    dispatch({
      type: this.action.bookingModal,
      payload: param,
    }).then(()=>{
      const {bookPlace:{bookingModalResult}}=this.props;
      let sum=0;
      for(let i=0;i<bookingModalResult.length;i++){
        sum+=bookingModalResult[i].salePrice;
      }
      this.setState({
        bookingModalDateSoure:bookingModalResult,
        bookPriceSum:sum,
      })
    })


  };

  /**
   * @Author luzhijian
   * @Description //订场销售多选之后，删除按钮
   * @Date 19:12 2019/1/16
   * @Param
   * @return
   * */

  handleBookDelete=(record)=>{

    const {bookingModalDateSoure,bookSelectIds,bookPriceSum}=this.state;
    for(let i=0;i<bookingModalDateSoure.length;i++){
      if (record.id===bookingModalDateSoure[i].id){
        bookingModalDateSoure.splice(i,1);
        this.setState({bookingModalDateSoure})
      }
    }

    for(let i=0;i<bookSelectIds.length;i++){
      if (record.id===bookSelectIds[i]){
        bookSelectIds.splice(i,1);
        const p=bookPriceSum-record.salePrice;
        this.setState({
          bookSelectIds,
          bookPriceSum:p,
        })
      }
    }



  };

  handleValue = (id) => {
    const { dispatch }=this.props;
    const {bookSelectIds,isMember}=this.state;
    if (isMember===1){
      dispatch({
        type: this.action.getPaymentList,
        payload: {type:3},
      })
    }
    else {
      dispatch({
        type: this.action.getPaymentList,
        payload: {type:5},
      })
    }

    let flag=false;
    for(let i=0;i<bookSelectIds.length;i++){
      if (id===bookSelectIds[i]){
        flag=true;
        break;
      }
    }
    if (!flag){
      bookSelectIds.push(id);
      this.setState({bookSelectIds})
    }

  };


  handleValueDelete = (id) => {
    const {bookSelectIds}=this.state;
    let flag=false;
    for(let i=0;i<bookSelectIds.length;i++){
      if (id===bookSelectIds[i]){
        bookSelectIds.splice(i,1);
        this.setState({bookSelectIds})
        break;
      }
    }
  };


  handleDoubleValue = (id) => {
    this.setState({
      bookVisible:true,
    });

    const { isMember }=this.state;
    const selectIds=[];
    selectIds.push(id);
    this.setState({bookSelectIds:selectIds})
    const {
      dispatch,
      form,
    } = this.props;
    if (isMember===1){
      dispatch({
        type: this.action.getPaymentList,
        payload: {type:3},
      })
    }
    else {
      dispatch({
        type: this.action.getPaymentList,
        payload: {type:5},
      })
    }
    form.resetFields();
    const param={
      ids:selectIds
    };
    dispatch({
      type: this.action.bookingModal,
      payload: param,
    }).then(()=>{
      const {bookPlace:{bookingModalResult}}=this.props;
      let sum=0;
      for(let i=0;i<bookingModalResult.length;i++){
        sum+=bookingModalResult[i].salePrice;
      }
      this.setState({
        bookingModalDateSoure:bookingModalResult,
        bookPriceSum:sum,
      })
    })

  };

  handleZhiPay=()=>{
    this.setState({
      paymentMode:4
    })
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



  render() {
    const selectedTag = classNames(styles.selectedTag, styles.normalTag);
    const defaultTag = classNames(styles.defaultTag, styles.normalTag);
    const {
      form: { getFieldDecorator },
      bookPlace:{sportListResult,admissionInResult,displayTicketResult,displayCardResult,remindThenResult,bookingModalResult},
      cashier:{admissionOutResult,getPaymentListResult},
    } = this.props;
    const {sportType,cardTableSelect,isMember,bookingModalDateSoure,bookPriceSum,bookSelectIds,couponNo,con,choosePayMent} = this.state;
    console.log(admissionOutResult,"QQQQQQQQQQQQQss");
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
        title: '姓名',
        key: 'memberName',
        dataIndex: 'memberName',
      },
      {
        title: '联系方式',
        key: 'memberTel',
        dataIndex: 'memberTel',
      },
      {
        title: '入场时间',
        dataIndex: 'inTime',
        key: 'inTime',
      },
      {
        title: '使用时长(分钟)',
        key: 'duration',
        dataIndex: 'duration',
      },
      {
        title: '应结束时间',
        key: 'saleTimeEnd',
        dataIndex: 'saleTimeEnd',
      },
      {
        title: '剩余时长(分钟)',
        key: 'timeInterval',
        dataIndex: 'timeInterval',

      },
      {
        title: '订单金额(元)',
        key: 'orderAmount',
        dataIndex: 'orderAmount',
      },
      {
      title: '场地',
      dataIndex: 'applyCourtName',
      key: 'applyCourtName',
      },
      ];

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

    const bookColumns = [
      {
        title: '日期',
        dataIndex: 'saleDate',
        key:'saleDate',
      },
      {
        title: '场地',
        dataIndex: 'courtName',
        key:'courtName',
      },
      {
        title: '场次',
        dataIndex: 'saleTimeEnd',
        key:'saleTimeEnd',
      },
      {
        title: '价格',
        dataIndex: 'salePrice',
        key:'salePrice',
      },
      {
        title: '操作',
        dataIndex: 'action',
        key:'action',
        render: (text, record) =>
          <a onClick={()=>this.handleBookDelete(record)}>删除</a>
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




    return (
      <PageHeaderWrapper
        title="订场"
        wrapperClassName={styles.advancedForm}
      >

        <Card title="入场出场" bordered={false}>
          {/* 基本信息 */}
          <Authorized authority='jis_platform_dc_cashier_order_sport' nomatch={noMatch()}>
            <div className={styles.buttonFlex} >
              {
                sportListResult&&sportListResult.data&&sportListResult.data.map(step =>
                {
                  return (
                    <Tooltip key={step.id} placement="topLeft" title={step.itemName && step.itemName.length > 8 ? step.itemName : undefined}>
                      <Tag.CheckableTag
                        className={sportType === step.id ? selectedTag : defaultTag}
                        style={{ marginRight: 5 }}
                        checked={sportType === step.id}
                        onChange={() => this.handleSportChange(step.id)}
                      >
                        <Ellipsis length={8}>{step.itemName}</Ellipsis>
                      </Tag.CheckableTag>
                    </Tooltip>
                  )
                })
              }
            </div>
          </Authorized>
          <Form>
            {/* 入场出场 */}
            <Row style={{ marginTop:24 }}>
              <Col span={10}>
                <Form.Item {...formItemLayout} label="">
                  {getFieldDecorator('couponNo', {
                    // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                    rules: [{ required: false, message: "请扫描票号或者刷卡" }],
                  })
                  (
                    <Input placeholder="请扫描票号或者刷卡" onChange={(value)=>this.couponNoChange(value)} />
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
                      <Authorized authority='jis_platform_dc_cashier_order_admission' nomatch={noMatch()}>
                        <Button type="primary" disabled={couponNo===null} onClick={this.showinVisibleModal}>
                         入场检票
                        </Button>
                      </Authorized>
                      <Authorized authority='jis_platform_dc_cashier_order_Appearance' nomatch={noMatch()}>
                        <Button type="primary" disabled={couponNo===null} style={{marginLeft:8}} onClick={this.showOutVisibleModal}>
                          出场核销
                        </Button>
                      </Authorized>
                      {/* 入场modal */}
                      <Modal
                        width="60%"
                        title="入场检票"
                        visible={this.state.inVisible}
                        onOk={this.handleinVisibleOk}
                        onCancel={this.handleinVisibleCancel}
                      >
                        <Row>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="验票结果">
                              <Input disabled value={admissionInResult&&admissionInResult.msg} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="场地">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.applyCourtName} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="订场日期">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.bookingDate}/>
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="场次">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.saleTimeStart+"--"+admissionInResult&&admissionInResult.data&&admissionInResult.data.saleTimeEnd} />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="金额（元）">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.ticketSalePrice} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="姓名">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.memberName}/>
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="联系方式">
                              <Input disabled value={admissionInResult&&admissionInResult.data&&admissionInResult.data.memberTel}/>
                            </Form.Item>
                          </Col>
                        </Row>
                      </Modal>

                      {/* 出场modal */}
                      <Modal
                        width="60%"
                        title="出场核销"
                        visible={this.state.outVisible}
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
                              <Input disabled value={admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.memberTel}/>
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
                            <Form.Item {...formItemLayout} label="使用时长(分钟):">
                              <Input disabled value={admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.duration} />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={12}>
                            <Form.Item {...formItemLayout} label="实际结束时间:">
                              <Input disabled value={admissionOutResult&&admissionOutResult.data&&(admissionOutResult.data.timeInterval===0?admissionOutResult.data.outTime:(admissionOutResult.data.outTime)+"(超时"+(admissionOutResult.data.timeInterval)+"分钟)")} />
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
                                              onChange={() => this.handlePayList(step,1)}
                                            >
                                              <Ellipsis length={8}>{step.name}</Ellipsis>
                                            </Tag.CheckableTag>
                                          </Tooltip>
                                        )
                                      })
                                    }
                                  </div>
                                  /* <span>
                                    <Button onClick={()=>this.handleCashPay()}>
                                      现金
                                    </Button>
                                    <Button style={{marginLeft:5}} onClick={()=>this.handleDisplayCard(1)}>
                                      会员卡
                                    </Button>
                                    <Button style={{marginLeft:5}} onClick={()=>this.handleWeiPay()}>
                                      微信/支付宝
                                    </Button>
                                    <Button style={{marginLeft:5}} onClick={()=>this.handleDisplayTicket(1)}>
                                      票券
                                    </Button>
                                  </span> */
                                )
                                }
                              </Form.Item>
                            }

                          </Col>
                        </Row>
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

                      {/* 会员卡 */}
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
                                  this.setState({
                                    cardTableSelect: {},
                                  });
                                } else {
                                  this.setState({
                                    cardTableSelect: record,
                                  });
                                }
                              },
                            };
                          }}
                        />
                      </Modal>


                    </span>

                  )}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* 到时提醒 */}
        <Card title="到时提醒" bordered={false}>
          <Form>
            <Table
              rowKey={record => record.id}
              bordered
              columns={columns}
              dataSource={remindThenResult&&remindThenResult.data}
              pagination={false}
            />

            {/* 订场 */}
            <Modal
              width="60%"
              title=""
              visible={this.state.bookVisible}
              onOk={this.handleBookVisibleOk}
              onCancel={this.handleBookVisibleCancel}
            >

              <Row>
                <Col span={4} style={{ width:"22%" }}>
                  <Form.Item {...formItemLayout} label="客户类型">
                    <RadioGroup value={isMember} onChange={()=>this.onRadioChange(1)}>
                      <Radio value={1}>会员</Radio>
                    </RadioGroup>
                  </Form.Item>
                </Col>

                <Col span={5} style={{marginLeft:'-6%'}}>
                  <Form.Item {...formItemLayout} label="">
                    {getFieldDecorator('bookMemberTel', {
                      rules: [{
                        required: isMember===1,
                        message: "请输入手机号码",
                          pattern: new RegExp("^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-8])|(18[0-9])|166|198|199|(147))\\d{8}$",'g'),
                        }
                    ],
                    })(
                      <Input placeholder="输入会员手机" />
                    )}
                  </Form.Item>
                </Col>

                <Col span={1} style={{marginLeft:'-6%',marginTop:10}}>
                  <span style={{color: '#f5222d',fontSize: '14px'}}>* </span>
                </Col>

                <Col span={5}>
                  <Form.Item {...formItemLayout} label="">
                    <RadioGroup value={isMember} onChange={()=>this.onRadioChange(2)}>
                      <Radio
                        value={2}
                      >
                        散客
                      </Radio>
                    </RadioGroup>

                  </Form.Item>
                </Col>
                <Col span={5} style={{marginLeft:'-12%'}}>
                  <Form.Item {...formItemLayout} label="">
                    {getFieldDecorator('bookNoMemberTel', {
                      rules: [{
                        required:isMember===2,
                        message: "请输入正确手机号码",
                          pattern: new RegExp("^((13[0-9])|(14[5,7])|(15[0-3,5-9])|(17[0,3,5-8])|(18[0-9])|166|198|199|(147))\\d{8}$",'g'),
                      }],
                    })(
                      <Input placeholder="输入手机号码" />
                    )}
                  </Form.Item>
                </Col>
                <Col span={4} style={{marginLeft:'-4%' }}>
                  <Form.Item {...formItemLayout} label="">
                    {getFieldDecorator('noMemberName', {
                      // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.nation!==null)?selectOneResult.nation:formatMessage({ id: 'app.common.select' }),
                      // rules: [{
                      //   required:false,
                      //   message: formatMessage({ id: 'Please.choose',
                      //   }) }],
                    })(
                      <Input placeholder="输入姓名" style={{width:140}} />
                    )}
                  </Form.Item>
                </Col>
              </Row>

              <Table
                rowKey={record => record.id}
                style={{marginTop:"3%"}}
                columns={bookColumns}
                dataSource={bookingModalDateSoure}
                pagination={false}
              />
              <Row>
                <Col span={12} style={{marginLeft:-50}}>
                  <Form.Item {...formItemLayout} label="订单金额（元）">

                    <span>{bookPriceSum}</span>

                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={24} style={{marginLeft:"-17%"}}>
                  <Form.Item {...formItemLayout} label="支付方式:">
                    {getFieldDecorator('paymentMethod', {
                      initialValue:admissionOutResult&&admissionOutResult.data&&admissionOutResult.data.paymentMethod,
                      // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                      rules: [{ required: false, message: "请输入" }],
                    })
                    (

                      <div>
                        {
                          getPaymentListResult&&getPaymentListResult.data&&getPaymentListResult.data.map(step =>
                          {
                            return (
                              <Tooltip key={step.code} placement="topLeft" title={step.name && step.name.length > 8 ? step.name : undefined}>
                                <Tag.CheckableTag
                                  className={choosePayMent === step.code ? selectedTag : defaultTag}
                                  style={{ marginRight: 5, marginTop: 24 }}
                                  checked={choosePayMent === step.code}
                                  onChange={() => this.handlePayList(step,2)}
                                >
                                  <Ellipsis length={8}>{step.name}</Ellipsis>
                                </Tag.CheckableTag>
                              </Tooltip>
                            )
                          })
                        }
                      </div>
                     /* <span>
                        <Button onClick={()=>this.handleCashPay()}>
                          现金
                        </Button>
                        <Button style={{marginLeft:5}} onClick={()=>this.handleDisplayCard(2)}>
                          会员卡
                        </Button>
                        <Button style={{marginLeft:5}} onClick={()=>this.handleWeiPay()}>
                          微信/支付宝
                        </Button>
                        <Button style={{marginLeft:5}} onClick={()=>this.handleDisplayTicket(2)}>
                          票券
                        </Button>
                      </span> */
                    )
                    }
                  </Form.Item>
                </Col>
              </Row>
            </Modal>
            {
              sportType && <DateView
                sportItem={sportType}
                con={{con}}
                handleValue={this.handleValue}
                handleValueDelete={this.handleValueDelete}
                handleDoubleValue={this.handleDoubleValue}
                bookSelectIds={bookSelectIds}
                year={moment(new Date()).format('YYYY-MM-DD')}
              />
            }
            <Authorized authority='jis_platform_dc_cashier_order_sale' nomatch={noMatch()}>
              <Button disabled={bookSelectIds.length===0} onClick={()=>bookSelectIds.length>0&&this.handleBookSelect()}>确定售票</Button>
            </Authorized>
          </Form>
        </Card>

      </PageHeaderWrapper>
    );
  }
}

export default AdvancedForm;
