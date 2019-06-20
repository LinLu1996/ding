import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {
  Card,
  Tabs,
  Form,
  Row,
  Col,
  Button,
  Table,
  message,
  Input,
  DatePicker,
  Divider,
  Modal,
  Icon,
} from 'antd';
import moment from 'moment';
import styles from './index.less';
import FooterToolbar from '@/components/FooterToolbar';
import {handleResponse} from "../../utils/globalUtils";
import Authorized from '../../utils/Authorized';
import { noMatch } from '../../utils/authority';

@Form.create()
@connect(({ court, loading }) => ({
  court,
  loading: loading.models.court,
}))
class PersonalCenter extends Component {
  action = {
    // queryIndex: 'personalCenter/fetchQueryIndex',
    felechCloseVenue:'court/felechclosevenue',
    CloseVenueEdit:'court/closevenueedit',
    CloseVenueDelete:'court/closevenuedelete',
    CloseVenueSave:'court/closevenuesave',
  };

  state = {
    visible: false, // 是否弹窗
    dataSource:[
    ],// 列表数据
    beforeId:null,// 上个页面传过来的record.id
    dataSoure:null,// 页面加载，列表数据
    modalReaord:{},// modal弹窗里面的record
  };

  componentDidMount() {
    const { dispatch, location } = this.props;
    if (location && location.search) {
      const { query } = location;
      this.setState({
        beforeId:query.id,
      });
      const param={
        id:query.id,
      };
        dispatch({
          type: this.action.felechCloseVenue,
          payload: param,
        }).then(() =>{
          const {court:{felechCloseVenueResult}}=this.props;
          if (handleResponse(felechCloseVenueResult)){
              this.setState({
                dataSource:felechCloseVenueResult&&felechCloseVenueResult.data&&felechCloseVenueResult.data.list
              })
          }
        });

    }
  }

  /**
   * @Author luzhijian
   * @Description //显示弹窗
   * @Date 16:52 2018/12/24
   * @Param
   * @return
   * */

  showModal = (record) => {
    this.setState({
      visible: true,
      modalReaord:record,
    });
  }


  /**
   * @Author luzhijian
   * @Description //判断是否为整数
   * @Date 17:21 2019/1/2
   * @Param
   * @return
   * */

  isInteger=(obj)=> {
    return obj%1 === 0
  }

  /**
   * @Author luzhijian
   * @Description //删除
   * @Date 16:24 2018/12/29
   * @Param
   * @return
   * */

  handleToDelete = (record) => {
    const { selectedRow } = this.state;
    if (JSON.stringify(selectedRow) === '[]') {
      message.warning('请选择一条数据');
      return;
    }
    Modal.confirm({
      title: '提示',
      content: '确定删除所选项吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.handleCloseInfoDelete(record),
    });
  }

  handleCloseInfoDelete =(record) =>{
    const { dispatch, location } = this.props;
    const {dataSource} =this.state;
    if (record.id!==undefined){
      const param={
        id:record.id,
      }
      dispatch({
        type: this.action.CloseVenueDelete,
        payload: param,
      }).then(() =>{
        const {court:{CloseVenueDeleteResult}}=this.props;
        if (handleResponse(CloseVenueDeleteResult)){
          message.success("删除成功")
        }

        if (location && location.search) {
          const { query } = location;
          this.setState({
            beforeId:query.id,
          });
          const paramFresh={
            id:query.id,
          };
          dispatch({
            type: this.action.felechCloseVenue,
            payload: paramFresh,
          }).then(() =>{
            const {court:{felechCloseVenueResult}}=this.props;
            if (handleResponse(felechCloseVenueResult)){
              this.setState({
                dataSource:felechCloseVenueResult&&felechCloseVenueResult.data&&felechCloseVenueResult.data.list
              })
            }
          });
        }
      });
    }
    else {
      for(let i=0;i<dataSource.length;i+=1)
      {
        if (dataSource[i].recordType ===2 && dataSource[i].key===record.key) {
          dataSource.splice(i,1);
          this.setState({dataSource})
        }
      }
    }
  }

  /**
   * @Author luzhijian
   * @Description //弹窗里面的确定按钮
   * @Date 16:52 2018/12/24
   * @Param
   * @return
   * */

  handleOk = () => {
    const {form: { validateFieldsAndScroll },dispatch}=this.props;
    const {beforeId,modalReaord}=this.state;
    this.setState({
      visible: false,
    });
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        const param={
          id:beforeId,
          list:[
            {
              id:modalReaord.id,
              closeReason:values.reason,
              closeDays:values.days,
              businessTimeStart:moment(values.closeStart).format('YYYY-MM-DD HH:mm:ss'),
              businessTimeEnd:moment(values.closeEnd).format('YYYY-MM-DD HH:mm:ss'),
            }
          ]
        }
        dispatch({
          type: this.action.CloseVenueEdit,
          payload: param,
        }).then(() =>{
          const {court:{CloseVenueEditResult}}=this.props;
          if (handleResponse(CloseVenueEditResult)){
              message.success("修改成功")
          }
          const { location } = this.props;
          if (location && location.search) {
            const { query } = location;
            this.setState({
              beforeId:query.id,
            });
            const params={
              id:query.id,
            };
              dispatch({
                type: this.action.felechCloseVenue,
                payload: params,
              }).then(() =>{
                const {court:{felechCloseVenueResult}}=this.props;
                if (handleResponse(felechCloseVenueResult)){
                  this.setState({
                    dataSource:felechCloseVenueResult&&felechCloseVenueResult.data&&felechCloseVenueResult.data.list
                  })
                }
              });
          }
        });
      }
    });
  };


  /**
   * @Author luzhijian
   * @Description //弹窗里面的取消按钮
   * @Date 16:52 2018/12/24
   * @Param
   * @return
   * */

  handleCancel = (e) => {
    this.setState({
      visible: false,
    });
  };



  /**
   * @Author luzhijian
   * @Description //提交按钮
   * @Date 11:28 2019/1/2
   * @Param
   * @return
   * */

  handleButtonSubmit =()=>{
    const {form: { validateFieldsAndScroll },dispatch}=this.props;
    const {dataSource,beforeId}=this.state;
    const newData = [];
    for(let i=0;i<dataSource.length;i++)
    {
      if (dataSource[i].recordType ===2 ) {
        dataSource[i].closeDays=dataSource[i].days;
        newData.push(dataSource[i]);
      }
    }
    for(let i=0;i<newData.length;i++){
      if (newData[i].closeReason===null||newData[i].closeReason===''){
        message.error("请填写完成闭馆信息");
        return;
      }
    }
    const param={
      id:beforeId,
      list:newData,
    };
    dispatch({
      type: this.action.CloseVenueSave,
      payload: param,
    }).then(() =>{
      const {court:{CloseVenueSaveResult}}=this.props;
      if (handleResponse(CloseVenueSaveResult)){
          message.success("添加成功");
        const pathname = `/venue/siteList/list`;
        router.push({
          pathname,
        });
      }
    });



  }


  /**
   * @Author luzhijian
   * @Description //返回按钮
   * @Date 15:20 2018/12/24
   * @Param
   * @return
   * */
  handleButtonBack =() =>{
    const pathname = `/venue/siteList/list`;
    router.push({
      pathname,
    });
  };

  /**
   * @Author luzhijian
   * @Description //添加行
   * @Date 10:10 2018/12/25
   * @Param
   * @return
   * */
  handleAddRow = () => {
    const { dataSource } = this.state;
    this.setState({
      startValue:"",
      endValue:"",
    });
    const newData = dataSource.map(item => ({ ...item }));
    const record = {
      recordType:2,
      key: dataSource.length+1,
      name: '',
      closeReason:'',
      project:null ,
      address: '',
      // businessTimeEnd:moment(new Date(),"YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss"),
      // businessTimeStart:moment(new Date(),"YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss"),
      // startTime:moment(new Date(),"YYYY:MM:DD HH:mm"),
      // endTime:moment(new Date(),"YYYY:MM:DD HH:mm"),
      days:1,
    };
    newData.push(record);
    this.index -= 1;
    const { handleRecordRow } = this.props;
    this.setState({ dataSource: newData });
  };



  /**
   * @Author luzhijian
   * @Description //开始时间选择框变化
   * @Date 14:28 2018/12/24
   * @Param
   * @return
   * */
  onStartChange = (value,record) => {
    const {dataSource}=this.state;
    for(let i=0;i<dataSource.length;i++)
    {
      if (dataSource[i].key ===record.key ){
        dataSource[i].startTime=value;
        dataSource[i].businessTimeStart=value && value.format("YYYY-MM-DD HH:mm:ss");
        if (dataSource[i].endTime){
          const days=moment.duration(dataSource[i].endTime - dataSource[i].startTime, 'ms');
          var d=days/1000/3600/24;
          var flag=this.isInteger(d);
          var day=null;
          if (flag){
            day= d+1;
          }
          else {
            day= Math.floor(d)+1;
          }
          dataSource[i].days=day;
        }
        break;
      }
    }
    this.onChange('startValue', value);
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  onStartModalChange = (value,record) =>{
    const {modalReaord}=this.state;
    const days=moment.duration(moment(record.businessTimeEnd,"YYYY-MM-DD HH:mm:ss") - moment(value,"YYYY-MM-DD HH:mm:ss"), 'ms');
    var d=days/1000/3600/24;
    var flag=this.isInteger(d);
    var day=null;
    if (flag){
      day= d+1;
    }
    else {
      day= Math.floor(d)+1;
    }
    modalReaord.businessTimeStart=value.format("YYYY-MM-DD HH:mm:ss");
    modalReaord.closeDays=day;
    this.setState({modalReaord});
  };

  onEndModalChange = (value,record) =>{
    const {modalReaord}=this.state;
    const days=moment.duration(moment(value,"YYYY-MM-DD HH:mm:ss") - moment(record.businessTimeStart,"YYYY-MM-DD HH:mm:ss"), 'ms');
    var d=days/1000/3600/24;
    var flag=this.isInteger(d);
    var day=null;
    if (flag){
      day= d+1;
    }
    else {
      day= Math.floor(d)+1;
    }
    modalReaord.businessTimeEnd=value.format("YYYY-MM-DD HH:mm:ss");
    modalReaord.closeDays=day;
    this.setState({modalReaord});
  };


  /**
   * @Author luzhijian
   * @Description //放入state
   * @Date 14:29 2018/12/24
   * @Param
   * @return
   * */
  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  }


  /**
   * @Author luzhijian
   * @Description //设置开始时间
   * @Date 14:27 2018/12/24
   * @Param
   * @return
   * */

  disabledStartDateModal = (startValue) => {
    var formatDate = function (date) {
      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      m = m < 10 ? ('0' + m) : m;
      var d = date.getDate();
      d = d < 10 ? ('0' + d) : d;
      var h = date.getHours();
      var minute = date.getMinutes();
      minute = minute < 10 ? ('0' + minute) : minute;
      var second= date.getSeconds();
      second = '00';
      return y + '-' + m + '-' + d+' '+h+':'+minute+':'+ second;
    };
    const nowStartValue = new Date();
    if (!startValue || !nowStartValue) {
      return false;
    }
    return startValue.valueOf() < moment(formatDate(nowStartValue),"YYYY-MM-DD HH:mm:ss").valueOf();
  };

  disabledStartDate = (startValue) => {
    const { endValue } = this.state;
    // const nowStartValue = new Date();
    // const nowStartValueString=moment(nowStartValue,'YYYY-MM-DD HH:mm');
    const nowStartValueString=moment(`${moment().format("YYYY-MM-DD")} 00:00:00`);
    if (!endValue) {
      return startValue.valueOf() < nowStartValueString.valueOf();
    }
    return startValue.valueOf() < nowStartValueString.valueOf() || endValue && startValue.valueOf() > moment(`${moment(endValue).format("YYYY-MM-DD")} 00:00:00`).valueOf();
  };

  disabledEndDate = (endValue) => {
    const {startValue}=this.state;
    // const nowStartValue = new Date();
    const nowStartValueString=moment(`${moment().format("YYYY-MM-DD")} 00:00:00`);
    if (!startValue) {
      return endValue.valueOf() < nowStartValueString.valueOf();
    }
    return endValue.valueOf() < nowStartValueString.valueOf() || startValue && startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDateModal = (endValue) => {
    const {modalReaord} = this.state;
    if (!endValue || !modalReaord.businessTimeStart) {
      return false;
    }
    return endValue.valueOf() < moment(modalReaord.businessTimeStart,"YYYY-MM-DD HH:mm:ss").valueOf();
  };

  onEndChange = (value,record) => {

    const {dataSource}=this.state;
    for(let i=0;i<dataSource.length;i++)
    {
      if (dataSource[i].key ===record.key ){
        dataSource[i].endTime=value;
        dataSource[i].businessTimeEnd=value && value.format("YYYY-MM-DD HH:mm:ss");
        if (dataSource[i].startTime){
          const days=moment.duration(dataSource[i].endTime - dataSource[i].startTime, 'ms');
          var d=days/1000/3600/24;
          var flag=this.isInteger(d);
          var day=null;
          if (flag){
            day= d+1;
          }
          else {
            day= Math.floor(d)+1;
          }
          dataSource[i].days=day;
        }
        break;
      }
    }
    this.onChange('endValue', value);
  }

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  }



  /**
   * @Author luzhijian
   * @Description //闭馆原因
   * @Date 15:27 2019/1/2
   * @Param
   * @return
   * */

  handleInputChange=(value,record)=>{
    const {dataSource}=this.state;
    for(let i=0;i<dataSource.length;i+=1)
    {
      if (dataSource[i].key ===record.key ){
        dataSource[i].closeReason=value.target.value;
        break;
      }
    }
  }

  render() {
    const { startValue,dataSource,modalReaord} = this.state;
    const { form,court:{felechCloseVenueResult}} = this.props;
    const formItemLayout = {
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
    const columns = [
      {
      title: '闭馆开始时间',
      dataIndex: 'start',

        render: (text, record) => {
          if (record.businessTimeStart&&!record.recordType){
                return (
                  <span>
                    {record.businessTimeStart}
                  </span>
                )
          }
          else {
            return (
              <DatePicker
                disabledDate={this.disabledStartDate}
                showTime={{format:"HH:mm:ss"}}
                format="YYYY-MM-DD HH:mm:ss"
                // value={record.startTime}
                placeholder="开始时间"
                onChange={(value)=>this.onStartChange(value,record)}
                onOpenChange={this.handleStartOpenChange}
              />
            )
          }
        }

      },
      {
      title: '闭馆结束时间',
      dataIndex: 'end',
        render: (text, record) => {
          if (record.businessTimeEnd&&!record.recordType){
            return (
              <span>
                {record.businessTimeEnd}
              </span>
            )
          }
          else {
            return (
              <DatePicker
                disabledDate={this.disabledEndDate}
                showTime={{format:"HH:mm:ss"}}
                format="YYYY-MM-DD HH:mm:ss"
                // value={record.endTime}
                placeholder="结束时间"
                onChange={(value)=>this.onEndChange(value,record)}
                onOpenChange={this.handleEndOpenChange}
              />
            )
          }
        }
      },
      {
      title: '闭馆天数',
      dataIndex: 'days',
        render: (text, record) => {
          if (record.recordType){
            return (
              <span>
                {record.days}
              </span>
            )
          }
          else{
            return (
              <span>
                {record.closeDays}
              </span>
            )
          }
        }

     },
      {
        title: '闭馆原因',
        dataIndex: 'closeReason',
        render: (text, record) => {
          if (record.closeReason){
            return (
              <span>
                {record.closeReason}
              </span>
            )
          }
          else {
            return (
              <Input
                onChange={(value)=>this.handleInputChange(value,record)}
              />
            )
          }
        }

      },
      {
        title:"操作",
        key:"action",
        dataIndex: 'action',
        render: (text, record) =>
          <span>
            <a disabled={record.recordType && record.recordType===2} onClick={() => this.showModal(record)}>编辑</a>
            <Divider type="vertical" />
            <a onClick={() => this.handleToDelete(record)}>删除</a>
          </span>


      }

    ];



    return (
      <Card>
        <Form style={{ marginTop: 8 }}>
          <Modal
            title="闭馆"
            visible={this.state.visible}
            onOk={(value)=>this.handleOk(value)}
            onCancel={this.handleCancel}
          >
            <Row>
              <Col span={24}>
                <Form.Item
                  {...formItemLayout}
                  label="闭馆开始时间:"
                >
                  {form.getFieldDecorator('closeStart', {

                    initialValue:modalReaord.businessTimeStart && moment(`${modalReaord.businessTimeStart}`,"YYYY-MM-DD HH:mm:ss") || null
                  })(
                    <DatePicker
                      disabled={(new Date()).getTime()>(new Date(modalReaord.businessTimeStart)).getTime()}
                      style={{marginRight:10}}
                      disabledDate={this.disabledStartDateModal}
                      showTime={{format:"HH:mm:ss"}}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="开始时间"
                      onChange={(value)=>this.onStartModalChange(value,modalReaord)}
                      onOpenChange={this.handleStartOpenChange}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  {...formItemLayout}
                  label="闭馆结束时间:"
                >
                  {form.getFieldDecorator('closeEnd', {
                    initialValue:modalReaord.businessTimeEnd && moment(`${modalReaord.businessTimeEnd}`,"YYYY-MM-DD HH:mm:ss") || null
                  })(
                    <DatePicker
                      style={{marginRight:10}}
                      disabledDate={this.disabledEndDateModal}
                      showTime={{format:"HH:mm:ss"}}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder="结束时间"
                      onChange={(value)=>this.onEndModalChange(value,modalReaord)}
                      onOpenChange={this.handleEndOpenChange}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>

              <Col span={24}>
                <Form.Item
                  {...formItemLayout}
                  label="闭馆天数:"
                >
                  {form.getFieldDecorator('days', {
                    initialValue:modalReaord.closeDays,
                  })(
                    <Input
                      disabled
                      style={{width:'62%',marginTop:5}}
                    />
                  )}
                </Form.Item>
              </Col>

            </Row>
            <Row>

              <Col span={24}>
                <Form.Item
                  {...formItemLayout}
                  label="闭馆原因:"
                >
                  {form.getFieldDecorator('reason', {
                    initialValue:modalReaord.closeReason,
                  })(
                    <Input
                      placeholder="请输入"
                      style={{width:'62%',marginTop:5}}
                    />
                  )}
                </Form.Item>
              </Col>

            </Row>
          </Modal>
          <Row>
            <Col span={10}>
              <Form.Item
                {...formItemLayout}
                label="场馆名称"
              >
                {form.getFieldDecorator('venuesName', {
                  initialValue:felechCloseVenueResult&&felechCloseVenueResult.data&&felechCloseVenueResult.data.venuesName,
                  rules: [
                    {
                      required: false,
                      message: "场馆名称",
                    },
                  ],
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                {...formItemLayout}
                label="运动项目"
              >
                {form.getFieldDecorator('companyName', {
                  initialValue:felechCloseVenueResult&&felechCloseVenueResult.data&&felechCloseVenueResult.data.itemName,
                  rules: [
                    {
                      required: false,
                      message: "运动项目",
                    },
                  ],
                })(
                  <Input disabled />
                )}
              </Form.Item>
            </Col>
            <Col span={4} style={{textAlign:'right'}}>
              <Button type="primary" onClick={this.handleAddRow}>
                新增
              </Button>
            </Col>
          </Row>
        </Form>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          // footer={() =>
          //   <div align="center">
          //     <Button type="primary" onClick={this.handleAddRow}>
          //       新增
          //     </Button>
          //   </div>
          // }
        />

        <FooterToolbar>
          <div align="center">
            <Button type="primary" onClick={this.handleButtonSubmit}>
              提交
            </Button>
            <Button onClick={this.handleButtonBack}>
              返回
            </Button>
          </div>
        </FooterToolbar>
      </Card>

    );
  }
}

export default PersonalCenter;
