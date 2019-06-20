import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import router from 'umi/router';
import {
  Card,
  Avatar,
  Tabs,
  Form,
  Row,
  Col,
  Button,
  Table,
  message,
  Input,
  Select,
  DatePicker,
  Divider,
  Upload,
  Icon,
  TimePicker,
  Modal,
  LocaleProvider,
} from 'antd';
import zhCN from "antd/lib/locale-provider/zh_CN";
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage, FormattedMessage } from 'umi/locale';
import moment from 'moment';
import styles from './index.less';
import {handleResponse} from "../../utils/globalUtils";
import { isPicture, pictureLimit } from '../../utils/uploadUtils';


const { Meta } = Card;
const TabPane = Tabs.TabPane;
const { RangePicker } = DatePicker;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}
const timeFormat = 'HH:mm';

@Form.create()
@connect(({ venue,court,cards, loading }) => ({
  venue,court,cards,
  loading: loading.models.venue,
}))
class PersonalCenter extends Component {
  action = {
    queryOne: 'venue/queryone',// 单个场馆信息查询
    venueSave:'venue/venuesave',// 新增保存
    venueEdit:'venue/venueedit',// 编辑保存
    getApplicableItems: 'cards/fetchGetApplicableItems',
    soprtList: 'court/sportlist',
  };

  state = {
    selectSport:null,
    loading:false,
    uploadLoading1:false,
    uploadLoading2:false,
    value1: '',
    value2:'',
    value3:'',
    startValue: null,// 开始时间
    endValue: null,// 结束时间
    endOpen: false,// 是否结束
    loading: false,// 上传中
    imageUrl1:null,// 展示图
    imageUrl2:null,// 线路图
    beforeType:1,// 前端页面传来的类型，1：提交，2：编辑
    editData:{},// 点击编辑进来，查询出来的值
    beforeId:null,// 场馆id
    headers: {
      authorization: 'authorization-text',
      product_code : 'jis-platform-venue-booking'
    },
  };

  componentDidMount() {
    const { dispatch,location } = this.props;
    dispatch({
      type: this.action.getApplicableItems,
    });
    dispatch({
      type: this.action.soprtList,
    });
    // 获取之前页面带来的值
    if (location && location.search) {
      const { query } = location;
      if (query.type===2){
        this.setState({
          beforeType:2,
          beforeId:query.id,
        });
        const param={
          id:query.id,
          type:query.type,
        };
        dispatch({
          type: this.action.queryOne,
          payload: param,
        }).then(() =>{
          const {venue:{queryOneResult}, form}=this.props;
          form.setFieldsValue({
            businessTimeStart: moment(queryOneResult.data.businessTimeStart,"HH:mm"),
            businessTimeEnd: moment(queryOneResult.data.businessTimeEnd,"HH:mm")
          });
          this.setState({
            value1:queryOneResult&&queryOneResult.data&&queryOneResult.data.venuesInstruction ||'',
            value2:queryOneResult&&queryOneResult.data&&queryOneResult.data.venuesIntro ||'',
            value3:queryOneResult&&queryOneResult.data&&queryOneResult.data.venuesNotes ||'',
            editData:queryOneResult.data,
          });
          if ( queryOneResult && JSON.stringify(queryOneResult)!=="{}" && queryOneResult.data!==null&&queryOneResult.data.showPicture!=null){
            this.setState({imageUrl1:queryOneResult.data.showPicture})
          }
          if (queryOneResult && JSON.stringify(queryOneResult)!=="{}" && queryOneResult.data!==null&&queryOneResult.data.routePicture!=null) {
            this.setState({imageUrl2:queryOneResult.data.routePicture})
          }
        });
      }

    }
  }

  /**
   * @Author luzhijian
   * @Description //设置开始时间
   * @Date 14:27 2018/12/24
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
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }


  /**
   * @Author luzhijian
   * @Description //上传之前的校验
   * @Date 14:25 2018/12/24
   * @Param
   * @return
   * */

  beforeUpload = (file) => {
    return isPicture(file) && pictureLimit(file,2);
  };


  /**
   * @Author luzhijian
   * @Description //上传处理
   * @Date 14:26 2018/12/24
   * @Param
   * @return
   * */

  handleUpload = (info,index) => {
    if (info.file.status === 'uploading') {
      if (index===1){
        this.setState({ uploadLoading1: true });
        return;
      }
      else if (index===2){
        this.setState({ uploadLoading2: true });
        return;
      }
    }
    if (info.file.status === 'done') {
      if(info.file.response.code===200) {
        const data = info.file.response.data || {};
        const path = data.path || '';
        data.status = 'done';
        if (index===1){
          // const {}=this.props;
          getBase64(info.file.originFileObj, imageUrl => this.setState({
            imageUrl1:path,
            uploadLoading1: false,
          }));
        }
        else if (index===2){
          getBase64(info.file.originFileObj, imageUrl => this.setState({
            imageUrl2:path,
            uploadLoading2: false,
          }));
        }
      } else {
        if (index===1) {
          this.setState({uploadLoading1:false})
        }
        else if (index===2) {
          this.setState({uploadLoading2:false})
        }
        message.error(info.file.response.msg);
      }


    }
  };


  /**
   * @Author luzhijian
   * @Description //返回按钮
   * @Date 15:20 2018/12/24
   * @Param
   * @return
   * */

  handleToReturn = () => {
    Modal.confirm({
      title: '提示',
      content: '是否放弃录入的内容？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.handleButtonBack(),
    });
  }

  handleButtonBack =() =>{
    const pathname = `/venue/venueList/list`;
    router.push({
      pathname,
    });
  };


  /**
   * @Author luzhijian
   * @Description //保存按钮
   * @Date 15:46 2018/12/28
   * @Param
   * @return
   * */

  handleButtonSave=()=>{

    const pathname = `/venue/venueList/list`;
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const { startValue, endValue, beforeType,beforeId,value1,value2,value3,imageUrl1,imageUrl2} = this.state;
    validateFieldsAndScroll((error, values) => {
      if (!error) {
        this.setState({
          loading:true,
        });
        const param={
          id:beforeId,
          venuesName:values.venuesName,
          itemId:values.itemId,
          showPicture:imageUrl1,
          routePicture:imageUrl2,
          businessTimeStartString:values.businessTimeStart.format('HH:mm:ss'),
          businessTimeEndString:values.businessTimeEnd.format('HH:mm:ss'),
          detailedAddress:values.detailedAddress,
          longitude:values.longitude,
          latitude:values.latitude,
          venuesInstruction:value1,
          venuesIntro:value2,
          venuesNotes:value3,
        }
        if (beforeType===1) {
          dispatch({
            type: this.action.venueSave,
            payload: param,
          }).then(() =>{
            this.setState({
              loading:false,
            });
            const {venue:{venueSaveResult}}=this.props;
            if (handleResponse(venueSaveResult)){
              message.success("保存成功")
              router.push({
                pathname,
              });
            }
          });
        }
        else if (beforeType===2) {
          dispatch({
            type: this.action.venueEdit,
            payload: param,
          }).then(() =>{
            this.setState({
              loading:false,
            });
            const {venue:{venueEditResult}}=this.props;
            if (handleResponse(venueEditResult)){
              message.success("修改成功");
              router.push({
                pathname,
              });
            }
          });
        }
      }
    });
  };




  handleFuChange1 = (value) => {
    this.setState({
      value1:value,
    })
  };

  handleFuChange2 = (value) => {
    this.setState({
      value2:value,
    })
  };

  handleFuChange3 = (value) => {
    this.setState({
      value3:value,
    })
  };

  onTimeChanged = (field, value) => {
    let newValue = value;
    if (field === 'startTime') {
      const { endTime } = this.state;
      if (moment(value, timeFormat).isAfter(moment(endTime, timeFormat))) {
        newValue = endTime;
      }
    }
    if (field === 'endTime') {
      const { startTime } = this.state;
      if (moment(value, timeFormat).isBefore(moment(startTime, timeFormat))) {
        newValue = startTime;
      }
    }
    this.setState({ [field]: newValue });
  };

  disabledStartMinutes = () => {
    const { startValue, endValue} = this.state;
    const list = [];
    if (moment(startValue, timeFormat).hour() === moment(endValue, timeFormat).hour()) {
      for (let i = 0; i < 60; i++) {
        if (moment(endValue, timeFormat).minute() < i) {
          list.push(i);
        }
      }
    }
    return list;
  };

  disabledStartHours = () => {
    const { endValue } = this.state;
    const list = [];
    for (let i = 0; i < 24; i++) {
      if (moment(endValue, timeFormat).hour() < i) {
        list.push(i);
      }
    }
    return list;
  };

  disabledEndMinutes = () => {
    const { startValue, endValue } = this.state;
    const list = [];
    if (moment(startValue, timeFormat).hour() === moment(endValue, timeFormat).hour()) {
      for (let i = 0; i < 60; i++) {
        if (moment(startValue, timeFormat).minute() > i) {
          list.push(i);
        }
      }
    }
    return list;
  };

  disabledEndHours = () => {
    const { startValue } = this.state;
    const list = [];
    for (let i = 0; i < 24; i++) {
      if (moment(startValue, timeFormat).hour() > i) {
        list.push(i);
      }
    }
    return list;
  };

  handleSelectChange = (value) =>{
    const { court:{sportListResult},form } = this.props;
    sportListResult&&sportListResult.data&&sportListResult.data.map(obj => {
      if (obj.id===value) {
        form.setFieldsValue({
          businessTimeStart: moment(obj.businessTimeStart, 'HH:mm'),
          businessTimeEnd: moment(obj.businessTimeEnd,"HH:mm")
        });
        this.setState({
          selectSport: obj,
        })
      }
    });
  };


  render() {
    const { form, loading ,cards:{applicableItemsList},court:{sportListResult}} = this.props;
    const { startValue, endValue, endOpen ,editData,selectSport,headers} = this.state;
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


    const uploadButton1 = (
      <div>
        <Icon type={this.state.uploadLoading1 ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传图片</div>
      </div>
    );
    const uploadButton2 = (
      <div>
        <Icon type={this.state.uploadLoading2 ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传图片</div>
      </div>
    );
    const {imageUrl1,imageUrl2} = this.state;
    return (




      <PageHeaderWrapper>
        <Card>
          <div className={styles.reductionTableListForm}>
            <Form style={{ marginTop: 8 }}>
              {/* 场馆名称，运动项目 */}
              <Row>
                <Col span={12}>
                  <Form.Item
                    {...formItemLayout}
                    label="场馆名称:"
                  >
                    {form.getFieldDecorator('venuesName', {
                      initialValue:(editData&&editData.venuesName)?editData.venuesName:null,
                      rules: [
                        {
                          required: true,
                          message: "请填写场馆名称",
                        },
                        // {
                        //   pattern: /^[\u4e00-\u9fa5A-Za-z0-9]{0,25}$/,
                        //   message: '详细地址长度为100',
                        // },
                      ],
                    })(
                      <Input placeholder="请输入" maxLength={25} />
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    {...formItemLayout}
                    label="运动项目:"
                  >
                    {form.getFieldDecorator('itemId', {
                      initialValue:(editData!==null&&editData.itemId!==null)?editData.itemId:"6",
                      rules: [
                        {
                          required: true,
                          message: "请选择运动项目",
                        },
                      ],
                    })(
                      <Select allowClear={false} placeholder='请选择' onChange={(value)=> this.handleSelectChange(value) }>
                        {sportListResult&&sportListResult.data&&sportListResult.data.map(obj => (
                          <Select.Option key={obj.id} value={obj.id}>
                            {obj.itemName}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>

              {/*  营业时间 */}
              <Row>
                <Col span={12}>
                  <Form.Item
                    {...formItemLayout}
                    label={<span><span style={{color: '#f5222d',fontSize: '14px'}}>* </span>{'营业时间'}</span>}
                  >
                    <Row gutter={5}>
                      <Col span={12}>
                        <Form.Item
                          style={{ marginBottom:0 }}
                        >
                          {form.getFieldDecorator('businessTimeStart', {
                            initialValue:selectSport&&selectSport.businessTimeStart&& moment(selectSport.businessTimeStart, 'HH:mm'),
                            rules: [
                              {
                                required: true,
                                message: "请选择营业时间",
                              },
                            ],
                          })(

                            <TimePicker
                              style={{width:'100%'}}
                              disabledMinutes={this.disabledStartMinutes}
                              disabledHours={this.disabledStartHours}
                              format="HH:mm"
                              placeholder="开始时间"
                              onChange={this.onStartChange}
                              onOpenChange={this.handleStartOpenChange}
                            />

                          )}
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          style={{ marginBottom:0 }}
                        >
                          {form.getFieldDecorator('businessTimeEnd', {
                            initialValue:selectSport&&selectSport.businessTimeEnd&&  moment(selectSport.businessTimeEnd, 'HH:mm'),
                            rules: [
                              {
                                required: true,
                                message: "请选择营业时间",
                              },
                            ],
                          })(
                            <TimePicker
                              style={{width:'100%'}}
                              disabledMinutes={this.disabledEndMinutes}
                              disabledHours={this.disabledEndHours}
                              format="HH:mm"
                              placeholder="结束时间"
                              onChange={this.onEndChange}
                              onOpenChange={this.handleEndOpenChange}
                            />
                          )}
                        </Form.Item>
                      </Col>
                    </Row>
                  </Form.Item>
                </Col>

              </Row>

              {/* 详细地址 */}
              <Row>
                <Col span={24}>
                  <Form.Item
                    {...contentFormItemLayout}
                    label="详细地址:"
                  >
                    {form.getFieldDecorator('detailedAddress', {
                      initialValue:(editData!==null&&editData.detailedAddress!==null)?editData.detailedAddress:null,
                      rules: [
                        {
                          required: false,
                          message: "请输入详细地址",
                        },
                        // {
                        //   pattern: /^[\u4e00-\u9fa5A-Za-z0-9]{0,50}$/,
                        //   message: '详细地址长度为200',
                        // },
                      ],
                    })(
                      <Input maxLength={100} />
                    )}
                  </Form.Item>
                </Col>
              </Row>

              {/* 经度，纬度 */}
              <Row>
                <Col span={12}>
                  <Form.Item
                    {...formItemLayout}
                    label="经度:"
                  >
                    {form.getFieldDecorator('longitude', {
                      initialValue:(editData!==null&&editData.longitude!==null)?editData.longitude:null,
                      rules: [
                        {
                          required: false,
                          message: "经度",
                        },
                        {pattern: /^([-+]?\d{0,3})(\.\d{0,10})?$/, message:'请输入正确格式'}
                        // {
                        //   pattern: /^([+-]?[\d]{1,8}[\.][\d]{1,5}$)/,
                        //   message:'经纬度长度为15（只能为小数格式）'
                        // }
                      ],
                    })(
                      <Input placeholder="请输入" />
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    {...formItemLayout}
                    label="纬度:"
                  >
                    {form.getFieldDecorator('latitude', {
                      initialValue:(editData!==null&&editData.latitude!==null)?editData.latitude:null,
                      rules: [
                        {
                          required: false,
                          message: "纬度",
                        },
                        {pattern: /^([-+]?\d{0,3})(\.\d{0,10})?$/, message:'请输入正确格式'}
                        // {
                        //   pattern: /^([+-]?[\d]{1,8}[\.][\d]{1,5}$)/,
                        //   message:'经纬度长度为15（只能为小数格式）'
                        // }
                      ],
                    })(
                      <Input placeholder="请输入" />
                    )}
                  </Form.Item>
                </Col>
              </Row>
              {/* 展示图，线路图 */}
              <Row>
                <Col span={12}>
                  <Form.Item
                    {...formItemLayout}
                    label="展示图:"
                  >
                    {form.getFieldDecorator('showPicture', {
                      // initialValue:(editData!==null&&editData.showPicture!==null)?editData.showPicture:null,
                      rules: [
                        {
                          required: false,
                          message: "展示图",
                        },
                      ],
                    })(
                      <LocaleProvider locale={zhCN}>
                        <Upload
                          name="file"
                          headers={headers}
                          listType="picture-card"
                          className="avatar-uploader"
                          showUploadList={false}
                          action="/api/venuebooking/uploadflle/upload"
                          beforeUpload={this.beforeUpload}
                          onChange={(value) =>this.handleUpload(value,1)}
                        >
                          {imageUrl1 ? <img style={{width:90,height:90}} src={imageUrl1} alt="avatar" /> : uploadButton1}
                        </Upload>
                      </LocaleProvider>
                    )}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    {...formItemLayout}
                    label="线路图:"
                  >
                    {form.getFieldDecorator('routePicture', {
                      // initialValue:(editData!==null&&editData.routePicture!==null)?editData.routePicture:null,
                      rules: [
                        {
                          required: false,
                          message: "线路图",
                        },
                      ],
                    })(

                      <LocaleProvider locale={zhCN}>
                        <Upload
                          name="file"
                          headers={headers}
                          listType="picture-card"
                          className="avatar-uploader"
                          showUploadList={false}
                          action="/api/venuebooking/uploadflle/upload"
                          beforeUpload={this.beforeUpload}
                          onChange={(value) =>this.handleUpload(value,2)}
                        >
                          {imageUrl2 ? <img style={{width:90,height:90}} src={imageUrl2} alt="avatar" /> : uploadButton2}
                        </Upload>
                      </LocaleProvider>
                    )}
                  </Form.Item>
                </Col>
              </Row>

              {/* 场馆介绍 */}
              <Row>
                <Col span={24}>
                  <Row gutter={24} style={{marginBottom:'50px',display:'flex'}}>
                    <Col span={2} style={{width:'150px',textAlign:'right',padding:0}}>场馆介绍:</Col>
                    <Col span={22} style={{width: 'calc(100% - 150px)'}}>
                      <ReactQuill value={this.state.value1} onChange={this.handleFuChange1} style={{minHeight:120}} />
                    </Col>
                  </Row>
                </Col>
              </Row>

              {/* 场地说明 */}
              <Row gutter={24} style={{marginBottom:'50px',display:'flex'}}>
                <Col span={3} style={{width:'150px',textAlign:'right',padding:0}}>场馆说明:</Col>
                <Col span={20} style={{width: 'calc(100% - 150px)'}}>
                  <ReactQuill value={this.state.value2} onChange={this.handleFuChange2} style={{minHeight:120}} />
                </Col>
              </Row>
              {/* 场地须知 */}
              <Row gutter={24} style={{marginBottom:'50px',display:'flex'}}>
                <Col span={3} style={{width:'150px',textAlign:'right',padding:0}}>订馆须知:</Col>
                <Col span={20} style={{width: 'calc(100% - 150px)'}}>
                  <ReactQuill value={this.state.value3} onChange={this.handleFuChange3} style={{minHeight:120}} />
                </Col>
              </Row>

              <div align="center">
                <Button type="primary" onClick={() => this.handleButtonSave()} loading={this.state.loading}>
                  保存
                </Button>
                <Button onClick={() => this.handleToReturn()} style={{marginLeft:5}}>
                  取消
                </Button>
              </div>
            </Form>
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PersonalCenter;
