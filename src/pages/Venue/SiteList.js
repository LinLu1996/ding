import React, { Component, } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {
  Card,
  Form,
  Row,
  Col,
  Button,
  Table,
  message,
  Select,
  Divider,
  TimePicker,
  InputNumber,
  Input,
  Tooltip,
  Tag,
} from 'antd';
import classNames from 'classnames';
import moment from "moment/moment";
import Ellipsis from '../../components/Ellipsis';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import {Modal} from "antd/lib/index";
import {handleResponse} from "../../utils/globalUtils";
import styles from './index.less';
import { noMatch } from '../../utils/authority';
import Authorized from '../../utils/Authorized';

const timeFormat = 'HH:mm';
@Form.create()
@connect(({ court, loading }) => ({
  court,
  loading: loading.models.court,
}))

class PersonalCenter extends Component {
  action = {
    soprtList: 'court/sportlist',
    courtList:'court/courtlist',
    saleTypeList:'court/saletypelist',
    couerSave:'court/courtadd',
    setSearch: 'court/fetchSetSearch',
    handleGetDetail: 'court/handleGetDetail',
  };

  state = {
    newVenueName:null,
    rong:1,
    saleType:'',
    nowSport:{},
    nowSelect:{},
    startValue: null,// 开始时间
    endValue: null,// 结束时间
    expandedRowKeys: [],
    visible:false,
    visibleC:false,
    dataSoure: [],
    flag: true,
    sportType:null,// 选中的运动项目的id
    isEdit:false,
    currentRecord:{}, //当前选中行
  };

  componentDidMount() {
    const {
      dispatch,
    } = this.props;

    dispatch({
      type: this.action.saleTypeList,
    });

    dispatch({
      type: this.action.soprtList,
      payload: {orderType : "1,2"},
    }).then(()=>{
      const {court:{sportListResult}}=this.props;
      dispatch({
        type: this.action.setSearch,
        payload: { sportType:sportListResult&&sportListResult.data&&sportListResult.data.length>0&&sportListResult.data[0].id, },
      });
      this.setState({
        nowSport:sportListResult&&sportListResult.data&&sportListResult.data.length>0&&sportListResult.data[0],
      });
      if (sportListResult&&sportListResult.data&&sportListResult.data.length>0&&sportListResult.data[0].id) {
        const params={
          id:sportListResult&&sportListResult.data&&sportListResult.data.length>0&&sportListResult.data[0].id,
        };
        dispatch({
          type: this.action.courtList,
          payload: params,
        }).then(() =>{
          const {court:{courtListResult}}=this.props;
          this.setState(
            {dataSoure:courtListResult&&courtListResult.data&&courtListResult.data.children || [],
              expandedRowKeys:courtListResult&&courtListResult.data&&courtListResult.data.idsList || [],
            }
            );
        });
      }

    });
  }





  handleCVisibleOk = () => {
    const {dispatch,form,court:{sportType}}=this.props;
    const {rong,saleType,newVenueName,startValue,endValue,nowSelect,expandedRowKeys,isEdit}=this.state;
    form.validateFieldsAndScroll((err, values) =>{
      if (err) {
        return ;
      }
      let param={
        sportItemId:sportType,
        venuesInfoId:nowSelect.venuesInfoId,
        fatherCourtId:nowSelect.id,
        courtName:newVenueName,
        saleType,
        businessTimeStartString:startValue.format("HH:mm:ss"),
        businessTimeEndString:endValue.format("HH:mm:ss"),
        maxCapacity:rong,
        expandedRowKeys,
      };
      dispatch({
        type: this.action.couerSave,
        payload: param,
      }).then(()=>{
        const {court:{courtAddResult}}=this.props
        if (handleResponse(courtAddResult)) {
          message.success("拆分成功");
          this.setState({
            visibleC: false,
          });
          this.setState({expandedRowKeys:courtAddResult.data});
          const params={
            id:sportType,
          };
          dispatch({
            type: this.action.courtList,
            payload: params,
          }).then(() =>{
            this.setState({dataSoure:[]});
            const {court:{courtListResult}}=this.props;
            this.setState({dataSoure:courtListResult&&courtListResult.data&&courtListResult.data.children,
              expandedRowKeys:courtListResult&&courtListResult.data&&courtListResult.data.idsList || [],});
          });
        }
      })
    });
  };

  handleVisibleOk = () => {
    const {dispatch,form,court:{sportType}}=this.props;
    const {rong,saleType,newVenueName,startValue,endValue,nowSelect,expandedRowKeys,isEdit}=this.state;
    form.validateFieldsAndScroll((err, values) =>{
      if(err) {
        return;
      }
      const param = {
          sportItemId:sportType,
          venuesInfoId:nowSelect.id,
          fatherCourtId:null,
          courtName:newVenueName,
          saleType,
          businessTimeStartString:startValue.format("HH:mm:ss"),
          businessTimeEndString:endValue.format("HH:mm:ss"),
          maxCapacity:rong,
          expandedRowKeys,
        }
      dispatch({
        type: this.action.couerSave,
        payload: param,
      }).then(()=>{
        const {court:{courtAddResult}}=this.props
        if (handleResponse(courtAddResult)) {
          message.success("添加成功");
          this.setState({expandedRowKeys:courtAddResult.data});
          form.resetFields();
          this.setState({
            visible: false,
            isEdit:false,
          });
          const params={
            id:sportType,
          };
          dispatch({
            type: this.action.courtList,
            payload: params,
          }).then(() =>{
            this.setState({dataSoure:[]});
            const {court:{courtListResult}}=this.props;
            this.setState({dataSoure:courtListResult&&courtListResult.data&&courtListResult.data.children,
              expandedRowKeys:courtListResult&&courtListResult.data&&courtListResult.data.idsList || [],});
          });
        }
      })
    });

  };

  handleEditVisibleOk = () => {
    const {dispatch,form,court:{sportType}}=this.props;
    const { currentRecord } = this.state;
    form.validateFieldsAndScroll((err, values) =>{
      if(err) {
        return;
      }
       const param={
          courtName:values.courtName===undefined?null:values.courtName,
          saleType:values.saleType,
          businessTimeStartString:values.businessTimeStartString === undefined?null:moment(values.businessTimeStartString).format('HH:mm:ss'),
          businessTimeEndString:values.businessTimeEndString === undefined?null:moment(values.businessTimeEndString).format('HH:mm:ss'),
          maxCapacity:values.maxCapacity===undefined?null:values.maxCapacity,
          id:currentRecord.id,
        };
        dispatch({
        type: this.action.couerSave,
        payload: param,
      }).then(()=>{
        const {court:{courtAddResult}}=this.props;
        if (handleResponse(courtAddResult,true)) {
          // this.setState({ expandedRowKeys: courtAddResult.data });
          form.resetFields();
          this.setState({
            isEdit: false,
          });
          const params={
            id:sportType,
          };
          dispatch({
            type: this.action.courtList,
            payload: params,
          }).then(() =>{
            this.setState({dataSoure:[]});
            const {court:{courtListResult}}=this.props;
            this.setState({dataSoure:courtListResult&&courtListResult.data&&courtListResult.data.children,
              expandedRowKeys:courtListResult&&courtListResult.data&&courtListResult.data.idsList || [],});
          });
        }
      });
    });
  }


  handleVisibleCancel = (e) => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      visible: false,
      visibleC: false,
      isEdit: false,
    });
  };

  handleCVisibleCancel = (e) => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      visibleC  : false,
    });
  };

  // 展开行的id
  handleExpandedRowKeys = (type, record) => {
    const { expandedRowKeys, } = this.state;
    let k='';
    if (record.arrangement===0){
      k=`g${record.id}`
    }
    else {
      k=`d${record.id}`
    }
    if(type === 1){ // 新增行
      let exist = false;
      expandedRowKeys.forEach(obj => {

        if(obj === k){
          exist = true;
          return false;
        }
      });
      if(!exist){
        expandedRowKeys.push(k);
      }

    }
    else{ // 删除行
      expandedRowKeys.forEach((item, index) => {
        if(item === k){
          expandedRowKeys.splice(index, 1);
          return false;
        }
      });
    }

    this.setState({expandedRowKeys});
  };


  // 点击行展开、收缩符号

  handleOnExpandClick = (expanded, record) => {
    let type = null;
    if(expanded){
      type = 1;
    }else{
      type = 0;
    }
    this.handleExpandedRowKeys(type, record);
  };

  // 编辑获取详情
  handleGetDetail = (record) => {
    const { dispatch } = this.props;
    this.setState({
      isEdit:true,
      visible:false,
      visibleC:false,
      currentRecord:record,
    })
    dispatch({
      type:this.action.handleGetDetail,
      payload:{ id: record.id}
    })
  }

 NestedTable=()=> {
   const { dataSoure, expandedRowKeys }=this.state;
   const { court: { saleTypeListResult } }=this.props;
   const column = [
     { width: 200, title: '场馆名称', dataIndex: 'venuesName',key:'venuesName',
       render: value => value ? <Ellipsis length={8} tooltip>{value}</Ellipsis> : null,
     },
     { width: 200, title: '场地名称', dataIndex: 'courtName',key:'courtName',
       render: (text, record) =>
         <span style={{ marginLeft: 20 * record.arrangement  }}>
           <Ellipsis length={8} tooltip>{record.courtName}</Ellipsis>
         </span>
     },
     { width: 100, title: '销售类型', dataIndex: 'saleType',key:'saleType',
       render: (text, record) => {
        switch (record.saleType) {
          case 1:
            return "次票";
          case 2:
            return "订场";
          default:
            return "现金";
        }
       }
     },
     { width: 120, title: '营业时间', dataIndex: 'businessTimeStart',key:'businessTimeStart',
       render: (text, record) =>
         <span>{(record.businessTimeStart).substring(0,record.businessTimeStart.length-3)}--{(record.businessTimeEnd).substring(0,record.businessTimeStart.length-3)}</span>
     },
     // @author jiangt 暂不显示
     // { title: '最小销售时间(分钟)', dataIndex: 'saleTimeUnit',key:'saleTimeUnit',width:180, },
     // { title: '提前预定天数', dataIndex: 'bookDays', key:'bookDays',width:130,},
     // { title: '超时计费单位(分钟)', dataIndex: 'timeoutBillingUnit',key:'timeoutBillingUnit',width:180, },
     // { title: '最大容量', dataIndex: 'maxCapacity',key:'maxCapacity',width:100, },
     { width: 80, title: '状态', dataIndex: 'state',key:'state',
       render: (text, record) =>
       {
         if (record.venuesInfoId) {
           return record.state===0?"闭馆":"开馆";
         }
         return "-";
       }
     },
     { width: 200, title: '操作', key: 'action',
       render: (text, record) =>
       {
         if (record.venuesInfoId) {
           return(
             <span>
               <Authorized authority='jis_platform_dc_court_split' nomatch={noMatch()}>
                 <a onClick={()=> this.handleSplit(record)}>拆分</a>
               </Authorized>
               <Authorized authority='jis_platform_dc_court_delete' nomatch={noMatch()}>
                 <Divider type="vertical" />
                 <a disabled={record.children&&record.children.length>0} onClick={()=>this.handleToDelete(record)}>删除</a>
               </Authorized>
               <Authorized authority='jis_platform_dc_court_colse' nomatch={noMatch()}>
                 <Divider type="vertical" />
                 <a onClick={()=> this.handleVenueClose(record)}>闭馆信息</a>
               </Authorized>
               <Divider type="vertical" />
               <a onClick={()=> this.handleGetDetail(record)}>编辑</a>
             </span>
           )
         }
         else {
           return(
             <Authorized authority='jis_platform_dc_court_add' nomatch={noMatch()}>
               <a onClick={()=> this.handleAdd(record)}>添加</a>
             </Authorized>
             )
         }
       }
     },
   ];

    return (
      <div className={styles.resTable}>
        <Table
          indentSize={80}
          style={{marginTop:24}}
          columns={column}
          rowKey={record => record.arrangement===0?(`g${record.id}`) :(`d${record.id}`)}
          onExpand={this.handleOnExpandClick}
          expandedRowKeys={expandedRowKeys}
          dataSource={dataSoure}
          pagination={false}
        />
      </div>
    );
  };

 handleVenueClose= (record)=> {
    const pathname = `/venue/siteList/close`;
    const query = record;
    router.push({
      pathname,
      query
    });
  };


  handleAdd= (record)=> {
    this.setState({
      visible: true,
      nowSelect:record,
      isEdit:false,
      visibleC:false,
    });
  };

  handleSplit= (record)=> {
    this.setState({
      visibleC: true,
      nowSelect:record,
      visible:false,
      isEdit:false,
    });
  };


  /**
   * @Author luzhijian
   * @Description //删除
   * @Date 16:03 2019/1/10
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
      content: '确定删除此场地吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.handleCourtDelete(record),
    });
  }

handleCourtDelete =(record)=> {

    const {
      dispatch,
      court:{sportType}
    } = this.props;
    const {expandedRowKeys}=this.state;
    const param={
      id:record.id,
      expandedRowKeys,
    };
    dispatch({
      type: "court/courtdelete",
      payload: param,
    }).then(()=>{
      const {court:{courtDeleteResult}}=this.props;
      if (handleResponse(courtDeleteResult)){
        message.success("删除成功");
        this.setState({expandedRowKeys:courtDeleteResult.data});
        const params={
          id:sportType,
        };
        dispatch({
          type: this.action.courtList,
          payload: params,
        }).then(() =>{
          this.setState({dataSoure:[]});
          const {court:{courtListResult}}=this.props;
          this.setState({dataSoure:courtListResult&&courtListResult.data&&courtListResult.data.children,
            expandedRowKeys:courtListResult&&courtListResult.data&&courtListResult.data.idsList || [],});
        });

      }
    })
  };

  /**
   * @Author luzhijian
   * @Description //列表list
   * @Date 23:21 2019/1/2
   * @Param
   * @return
   * */

  handleCourtList=(value)=>{
    this.setState({dataSoure:[]});
    const {
      dispatch,
    } = this.props;

    this.setState({
      nowSport:value,
    });
    dispatch({
      type: this.action.setSearch,
      payload: { sportType:value&&value.id, },
    })
    const param={
      id:value&&value.id,
    };

    dispatch({
      type: this.action.courtList,
      payload: param,
    }).then(() =>{
      const {court:{courtListResult}}=this.props;
      this.setState({dataSoure:courtListResult&&courtListResult.data&&courtListResult.data.children,
        expandedRowKeys:courtListResult&&courtListResult.data&&courtListResult.data.idsList || [],});
    });
  };

  // 时间选择框
  disabledStartDate = (startValue) => {
    const {endValue} = this.state;
    if (!startValue || !endValue) {
      return false;
    }
    return startValue.valueOf() > endValue.valueOf();
  }


  disabledStartMinutes = () => {
    const { startValue, endValue,nowSelect} = this.state;
    const list = [];
    if (moment(startValue, timeFormat).hour() === moment(nowSelect.businessTimeStart, timeFormat).hour()) {
      for (let i = 0; i < 60; i++) {
        if (moment(nowSelect.businessTimeStart, timeFormat).minute() > i) {
          list.push(i);
        }
      }
    }
    if (moment(startValue, timeFormat).hour() === moment(nowSelect.businessTimeEnd, timeFormat).hour()) {
      for (let i = 0; i < 60; i++) {
        if (moment(nowSelect.businessTimeEnd, timeFormat).minute() < i) {
          list.push(i);
        }
      }
    }
    return list;
  };

  disabledStartHours = () => {
    const { endValue,nowSelect } = this.state;
    const list = [];
    for (let i = 0; i < 24; i++) {
      if (moment(nowSelect.businessTimeStart, timeFormat).hour() > i || moment(nowSelect.businessTimeEnd, timeFormat).hour() < i ) {
        list.push(i);
      }
    }
    return list;
  };

  disabledEndMinutes = () => {
    const { startValue, endValue,nowSelect } = this.state;
    const list = [];
    if (moment(endValue, timeFormat).hour() === moment(startValue, timeFormat).hour()) {
      for (let i = 0; i < 60; i++) {
        if (moment(startValue, timeFormat).minute() > i || moment(startValue, timeFormat).minute() === i) {
          list.push(i);
        }
      }
    }
    if (moment(endValue, timeFormat).hour() === moment(nowSelect.businessTimeEnd, timeFormat).hour()) {
      for (let i = 0; i < 60; i++) {
        if (moment(nowSelect.businessTimeEnd, timeFormat).minute() < i) {
          list.push(i);
        }
      }
    }
    return list;
  };

  disabledEndHours = () => {
    const { startValue,nowSelect } = this.state;
    const list = [];
    for (let i = 0; i < 24; i++) {
      if (moment(startValue, timeFormat).hour() > i || moment(nowSelect.businessTimeEnd, timeFormat).hour() < i) {
        list.push(i);
      }
    }
    return list;
  };

  onChange = (field, value) => {
    this.setState({
      [field]: value,
    });
  }

  /**
   * @Author luzhijian
   * @Description //开始时间选择框变化
   * @Date 14:28 2018/12/24
   * @Param
   * @return
   * */
  onStartChange = (value) => {
    this.setState({

    })
    this.onChange('startValue', value);
  }

  /**
   * @Author luzhijian
   * @Description //结束时间选择框变化
   * @Date 14:28 2018/12/24
   * @Param
   * @return
   * */
  onEndChange = (value) => {
    this.onChange('endValue', value);
  }

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

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  }

  disabledEndDate = (endValue) => {
    const {startValue} = this.state;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  };

  handleModalChange=(value)=>{
    this.setState({
      rong:value
    })
  };

  handleModalSelectChange=(value)=>{
    this.setState({
      saleType:value
    })
  };

  handleModalVenueChange=(value) => {
    this.setState({
      newVenueName:value.target.value
    })
  };

  handleDayModalChange=(value)=>{
    this.setState({
      beforeDays:value
    })
  };


  render() {
    const selectedTag = classNames(styles.selectedTag, styles.normalTag);
    const defaultTag = classNames(styles.defaultTag, styles.normalTag);
    const {court:{sportListResult,saleTypeListResult,sportType,detailList},form: { getFieldDecorator }, } = this.props;
    const {flag,nowSelect,isEdit,visible,visibleC}=this.state;
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
      <PageHeaderWrapper>
        <Card style={{ height: '100%' }}>
          <Authorized authority='jis_platform_dc_court_sport' nomatch={noMatch()}>
            <div>
              {
                sportListResult&&sportListResult.data&&sportListResult.data.map(step =>
                {
                    return (
                      <Tooltip key={step.id} placement="topLeft" title={step.itemName && step.itemName.length > 8 ? step.itemName : undefined}>
                        <Tag.CheckableTag
                          className={sportType === step.id ? selectedTag : defaultTag}
                          style={{ marginRight: 5, marginTop: 24 }}
                          checked={sportType === step.id}
                          onChange={() => this.handleCourtList(step)}
                        >
                          <Ellipsis length={8}>{step.itemName}</Ellipsis>
                        </Tag.CheckableTag>
                      </Tooltip>
                    )
                })
              }
            </div>
          </Authorized>

          {flag && this.NestedTable()}
          {/* 添加modal */}
          {
            visible && <Modal
              distoryOnClose
              width="30%"
              title="添加"
              visible={this.state.visible}
              onOk={this.handleVisibleOk}
              onCancel={this.handleVisibleCancel}
            >

              <Form onSubmit={this.handleVisibleOk}>
                <Row style={{marginTop:10}}>
                  <Col span={20}>
                    <Form.Item {...formItemLayout} label="场地名称:">
                      {getFieldDecorator('courtName', {
                        initialValue:'',
                        rules: [{ required: true, message: "请填写场地名称" }],
                      })
                      (
                        <Input onChange={(value)=>this.handleModalVenueChange(value)} maxLength={50} />
                      )
                      }
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{marginTop:10}}>
                  <Col span={20}>
                    <Form.Item {...formItemLayout} label="销售类型">
                      {getFieldDecorator('saletype', {
                        rules: [{ required: true, message: "请选择销售类型" }],
                      })
                      (
                        <Select placeholder='请选择' style={{width:'100%'}} onChange={this.handleModalSelectChange}>
                          {saleTypeListResult&&saleTypeListResult.length>0&&saleTypeListResult.map(obj => (
                            <Select.Option key={obj.code} value={obj.code}>
                              {obj.value}
                            </Select.Option>
                          ))}
                        </Select>
                      )
                      }
                    </Form.Item>

                  </Col>
                </Row>
                <Row style={{marginTop:10}}>
                  <Col span={20}>
                    <Form.Item
                      {...formItemLayout}
                      style={{ marginBottom:0 }}
                      label={<span><span style={{color: '#f5222d',fontSize: '14px'}}>* </span>{'营业时间'}</span>}
                    >
                      <Row gutter={5}>
                        <Col span={12}>
                          <Form.Item {...formItemLayout}>
                            {getFieldDecorator('businessTimeStart', {
                              rules: [{ required: true, message: "请填写营业时间" }],
                            })
                            (
                              <TimePicker
                                style={{width:"140%"}}
                                disabledMinutes={this.disabledStartMinutes}
                                disabledHours={this.disabledStartHours}
                                format="HH:mm"
                                placeholder="开始时间"
                                onChange={this.onStartChange}
                                onOpenChange={this.handleStartOpenChange}
                              />
                            )
                            }
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item {...formItemLayout} label="">
                            {getFieldDecorator('businessTimeEnd', {
                              rules: [{ required: true, message: "请填写营业时间" }],
                            })
                            (
                              <TimePicker
                                style={{width:"140%"}}
                                disabledMinutes={this.disabledEndMinutes}
                                disabledHours={this.disabledEndHours}
                                format="HH:mm"

                                placeholder="结束时间"
                                onChange={this.onEndChange}
                                onOpenChange={this.handleEndOpenChange}
                              />
                            )
                            }
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form.Item>
                  </Col>

                </Row>
                {/*<Row>*/}
                {/*<Col span={12}>*/}
                {/*<span>提前预定天数:</span>*/}
                {/*</Col>*/}
                {/*<Col span={12}>*/}
                {/*<InputNumber min={1} max={20} defaultValue={1} onChange={this.handleDayModalChange} />*/}
                {/*</Col>*/}
                {/*</Row>*/}
                <Row style={{marginTop:10}}>
                  <Col span={20}>
                    <Form.Item {...formItemLayout} label="最大容量/人:">
                      {getFieldDecorator('maxCapacity', {
                        rules: [{ required: true, message: "请填写最大容量/人" }],
                      })
                      (
                        <InputNumber min={1} max={nowSelect.maxCapacity} onChange={this.handleModalChange} />
                      )
                      }
                    </Form.Item>

                  </Col>
                </Row>
              </Form>
            </Modal>
          }

          {/* 拆分modal */}
          {
            visibleC && <Modal
              distoryOnClose
              width="30%"
              title="拆分"
              visible={this.state.visibleC}
              onOk={this.handleCVisibleOk}
              onCancel={this.handleCVisibleCancel}
            >
              <Form onSubmit={this.handleCVisibleOk}>
                <Row style={{marginTop:10}}>
                  <Col span={20}>
                    <Form.Item {...formItemLayout} label="场地名称:">
                      {getFieldDecorator('courtName', {
                        initialValue: '',
                        rules: [{ required: true, message: "请填写场地名称" }],
                      })
                      (
                        <Input onChange={(value)=>this.handleModalVenueChange(value)} maxLength={50} />
                      )
                      }
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{marginTop:10}}>
                  <Col span={20}>
                    <Form.Item {...formItemLayout} label="销售类型">
                      {getFieldDecorator('saletype', {
                        initialValue:"",
                        // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                        rules: [{ required: true, message: "请选择销售类型" }],
                      })
                      (
                        <Select placeholder='请选择' style={{width:'100%'}} onChange={this.handleModalSelectChange}>
                          {saleTypeListResult&&saleTypeListResult.length>0&&saleTypeListResult.map(obj => (
                            <Select.Option key={obj.code} value={obj.code}>
                              {obj.value}
                            </Select.Option>
                          ))}
                        </Select>
                      )
                      }
                    </Form.Item>

                  </Col>
                </Row>
                <Row style={{marginTop:10}}>

                  <Col span={20}>
                    <Form.Item
                      {...formItemLayout}
                      label={<span><span style={{color: '#f5222d',fontSize: '14px'}}>* </span>{'营业时间'}</span>}
                    >
                      <Row gutter={5}>
                        <Col span={12}>
                          <Form.Item {...formItemLayout}>
                            {getFieldDecorator('businessTimeStart', {
                              // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                              rules: [{ required: true, message: "请填写营业时间" }],
                            })
                            (
                              <TimePicker
                                style={{width:"140%"}}
                                disabledMinutes={this.disabledStartMinutes}
                                disabledHours={this.disabledStartHours}
                                format="HH:mm"
                                placeholder="开始时间"
                                onChange={this.onStartChange}
                                onOpenChange={this.handleStartOpenChange}
                              />
                            )
                            }
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item {...formItemLayout} label="">
                            {getFieldDecorator('businessTimeEnd', {
                              // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                              rules: [{ required: true, message: "请填写营业时间" }],
                            })
                            (
                              <TimePicker
                                style={{width:"140%"}}
                                disabledMinutes={this.disabledEndMinutes}
                                disabledHours={this.disabledEndHours}
                                format="HH:mm"
                                placeholder="结束时间"
                                onChange={this.onEndChange}
                                onOpenChange={this.handleEndOpenChange}
                              />
                            )
                            }
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form.Item>
                  </Col>

                </Row>
                {/*<Row>*/}
                {/*<Col span={12}>*/}
                {/*<span>提前预定天数:</span>*/}
                {/*</Col>*/}
                {/*<Col span={12}>*/}
                {/*<InputNumber min={1} max={20} defaultValue={1} onChange={this.handleDayModalChange} />*/}
                {/*</Col>*/}
                {/*</Row>*/}
                <Row style={{marginTop:10}}>
                  <Col span={20}>
                    <Form.Item {...formItemLayout} label="最大容量:">
                      {getFieldDecorator('maxCapacity', {
                        initialValue:1,
                        // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                        rules: [{ required: true, message: "请填写最大容量" }],
                      })
                      (
                        <InputNumber min={1} max={nowSelect.maxCapacity} onChange={this.handleModalChange} />
                      )
                      }
                    </Form.Item>

                  </Col>
                </Row>
              </Form>
            </Modal>
          }

        </Card>
        {
          isEdit && <Modal
            distoryOnClose
            width="30%"
            title="编辑"
            visible={this.state.isEdit}
            onOk={this.handleEditVisibleOk}
            onCancel={this.handleVisibleCancel}
          >

            <Form onSubmit={this.handleEditVisibleOk}>
              <Row style={{marginTop:10}}>
                <Col span={20}>
                  <Form.Item {...formItemLayout} label="场地名称:">
                    {getFieldDecorator('courtName', {
                      initialValue: isEdit && detailList&&detailList.courtName,
                      rules: [{ required: true, message: "请填写场地名称" }],
                    })
                    (
                      <Input onChange={(value)=>this.handleModalVenueChange(value)} maxLength={50} />
                    )
                    }
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{marginTop:10}}>
                <Col span={20}>
                  <Form.Item {...formItemLayout} label="销售类型">
                    {getFieldDecorator('saleType', {
                      initialValue:isEdit && detailList&&String(detailList.saleType),
                      rules: [{ required: true, message: "请选择销售类型" }],
                    })
                    (
                      <Select placeholder='请选择' style={{width:'100%'}} onChange={this.handleModalSelectChange}>
                        {saleTypeListResult&&saleTypeListResult.length>0&&saleTypeListResult.map(obj => (
                          <Select.Option key={obj.code} value={obj.code}>
                            {obj.value}
                          </Select.Option>
                        ))}
                      </Select>
                    )
                    }
                  </Form.Item>

                </Col>
              </Row>
              <Row style={{marginTop:10}}>
                <Col span={20}>
                  <Form.Item
                    {...formItemLayout}
                    style={{ marginBottom:0 }}
                    label={<span><span style={{color: '#f5222d',fontSize: '14px'}}>* </span>{'营业时间'}</span>}
                  >
                    <Row gutter={5}>
                      <Col span={12}>
                        <Form.Item {...formItemLayout}>
                          {getFieldDecorator('businessTimeStartString', {
                            initialValue: isEdit && detailList&&detailList.businessTimeStart && moment(detailList.businessTimeStart,'HH:mm') || null,
                            rules: [{ required: true, message: "请填写营业时间" }],
                          })
                          (
                            <TimePicker
                              style={{width:"140%"}}
                              disabledMinutes={this.disabledStartMinutes}
                              disabledHours={this.disabledStartHours}
                              format="HH:mm"
                              placeholder="开始时间"
                              onChange={this.onStartChange}
                              onOpenChange={this.handleStartOpenChange}
                            />
                          )
                          }
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item {...formItemLayout} label="">
                          {getFieldDecorator('businessTimeEndString', {
                            initialValue: detailList&&detailList.businessTimeEnd && moment(detailList.businessTimeEnd,'HH:mm') || null,
                            rules: [{ required: true, message: "请填写营业时间" }],
                          })
                          (
                            <TimePicker
                              style={{width:"140%"}}
                              disabledMinutes={this.disabledEndMinutes}
                              disabledHours={this.disabledEndHours}
                              format="HH:mm"

                              placeholder="结束时间"
                              onChange={this.onEndChange}
                              onOpenChange={this.handleEndOpenChange}
                            />
                          )
                          }
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>

              </Row>
              <Row style={{marginTop:10}}>
                <Col span={20}>
                  <Form.Item {...formItemLayout} label="最大容量/人:">
                    {getFieldDecorator('maxCapacity', {
                      initialValue:isEdit && detailList&&detailList.maxCapacity || 1,
                      rules: [{ required: true, message: "请填写最大容量/人" }],
                    })
                    (
                      <InputNumber min={1} max={nowSelect.maxCapacity} onChange={this.handleModalChange} />
                    )
                    }
                  </Form.Item>

                </Col>
              </Row>
            </Form>
          </Modal>
        }
      </PageHeaderWrapper>
    );
  }
}

export default PersonalCenter;
