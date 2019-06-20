import React, { Component,Fragment } from 'react';
import router from 'umi/router';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Form, Card, Input, DatePicker, Select, Col, Row, Table, Button, message,InputNumber,TimePicker,Upload,Modal,Icon,LocaleProvider } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import zhCN from "antd/lib/locale-provider/zh_CN";
import moment from 'moment';
import styles from './index.less';
import { connect } from 'dva';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import { isPicture, pictureLimit } from '../../utils/uploadUtils';

const FormItem = Form.Item;
const timeFormat = 'HH:mm';

@Form.create()
@connect(({ systemSet }) => ({
  systemSet,
}))

export default class Emply extends Component {

  action = {
    queryList: 'systemSet/fetchQueryTicket',
    clearStockInfo: 'systemSet/clearStockInfo',
    addProject: 'systemSet/fetchAddProject',
    editProject: 'systemSet/fetchEditProject',
    getListDetail: 'systemSet/fetchGetListDetail',
  };
  firstFlag=true;
  firstUid=1;
  constructor(props) {
    super(props);
    const { systemSet:{dictList} } = this.props;
    this.state = {
      dataSource: [],
      id:null,
      enterpriseId:null,
      fileList:[],
      previewVisible: false,  //照片弹出框
      previewImage: '',   //弹出的照片
      startTime: '09:30',
      endTime: '21:30',
      loading:false
    };
  }

  componentDidMount() {
    const { dispatch, location } = this.props;
    if (location && location.search) {
      const { query } = location;
      this.setState({ ...query });
      if (query.id!=null) {
        dispatch({
          type:this.action.getListDetail,
          payload:{ sportItemId:query.id }
        }).then(() => {
          const {systemSet:{ listDetail }} = this.props;
          const {fileList} = this.state;
          if(listDetail && listDetail.picture) {
            const obj={
              uid:1,
              url:listDetail.picture,
            }
            fileList.push(obj);
            this.setState({
              fileList,
            })
          }
        })
      } else {
        dispatch({
          type:this.action.clearStockInfo,
        })
      }
    }
  }


  // 取消
  handleCancel = () => {
    const { form } = this.props;
    const values = form.getFieldsValue();
    Modal.confirm({
      title: '提示',
      content: '是否放弃保存录入的内容？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.handleCloseInfoDelete(),
    });
  }
  handleCloseInfoDelete = () => {
    const pathname = `/systemSet/systemSetList/list`;
    router.push({
      pathname,
    });
  }

  //改变照片数组
  handleChange = (file) => {
    const files_ = this.state.fileList;
    const index = files_.length - 1;
    files_.splice(index, 1);
    const obj = {
      uid: this.firstUid,
      url:file,
      status:'done',
    };
    this.firstUid++;
    files_.push(obj);
    this.setState({
      fileList: files_
    });
  }

  handleDeleteImg = (file) => {
    const files_ = this.state.fileList;
    const index = files_.length - 1;
    files_.splice(index, 1);
    this.setState({
      fileList: files_
    });
  }

  // 弹出照片
  handlePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    });
  }

  // 删除照片
  handleRemove = (file) => {
    const files_ = this.state.fileList;
    files_.map((item,index) => {
      if (item.path === file.path) {
        files_.splice(index,1);
      }
    });
    this.setState({
      fileList: files_
    });
  }

  // 关闭弹出照片
  handleCloseCancel = () => {
    this.setState({previewVisible: false });
  }

  // 修改时间
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
    const { startTime, endTime } = this.state;
    const list = [];
    if (moment(startTime, timeFormat).hour() === moment(endTime, timeFormat).hour()) {
      for (let i = 0; i < 60; i++) {
        if (moment(endTime, timeFormat).minute() < i) {
          list.push(i);
        }
      }
    }
    return list;
  };

  disabledStartHours = () => {
    const { endTime } = this.state;
    const list = [];
    for (let i = 0; i < 24; i++) {
      if (moment(endTime, timeFormat).hour() < i) {
        list.push(i);
      }
    }
    return list;
  };

  disabledEndMinutes = () => {
    const { startTime, endTime } = this.state;
    const list = [];
    if (moment(startTime, timeFormat).hour() === moment(endTime, timeFormat).hour()) {
      for (let i = 0; i < 60; i++) {
        if (moment(startTime, timeFormat).minute() > i) {
          list.push(i);
        }
      }
    }
    return list;
  };

  disabledEndHours = () => {
    const { startTime } = this.state;
    const list = [];
    for (let i = 0; i < 24; i++) {
      if (moment(startTime, timeFormat).hour() > i) {
        list.push(i);
      }
    }
    return list;
  };

  handleSubmit = () => {
    const { form, dispatch } = this.props;
    const { type,id,fileList,enterpriseId } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return ;
      }
      this.setState({
        loading:true
      })
      const params = {
        itemName:values.itemName===undefined ?null:values.itemName,
        businessTimeStart:values && values.businessTimeStart!==undefined ?`${moment(values.businessTimeStart).format("HH:mm")}:00`:null,
        businessTimeEnd:values && values.businessTimeEnd!==undefined ?`${moment(values.businessTimeEnd).format("HH:mm")}:00`:null,
        saleUnit:values.saleUnit===undefined ?null:values.saleUnit,
        bookDays:values.bookDays===undefined ?null:values.bookDays,
        timeoutBillingUnit:values.timeoutBillingUnit===undefined ?null:values.timeoutBillingUnit,
        picture:JSON.stringify(fileList)==="[]"?null:fileList[0].url,
        enterpriseId,
        id:id || null,
      };
      dispatch({
        type:this.action.addProject,
        payload:params
      }).then(() => {
        const {
          systemSet: { code },
        } = this.props;
        this.setState({
          loading:false
        })
        if (code === 200) {
          this.handleCloseInfoDelete();
        }
      })
    });
  };

  render() {
    const { form: { getFieldDecorator },systemSet:{ listDetail } } = this.props;
    const { previewVisible,previewImage,fileList,id } = this.state;
    const _this=this;
    const format = 'HH:mm';
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
    const propsUpload = {
      name: 'file',
      accept: 'image/jpg,image/jpeg,image/png,image/bmp',
      action: '/api/venuebooking/uploadflle/upload',
      fileList: fileList,
      listType: "picture-card",
      headers: {
        authorization: 'authorization-text',
        product_code : 'jis-platform-venue-booking'
      },
      beforeUpload(file) {
        return isPicture(file) && pictureLimit(file, 2);
      },
      onChange(info) {
        if (info.file.status === 'uploading') {
          const obj = {
            uid: info.file.uid,
            name:'',
            url:'',
          }
          fileList.push(obj);
          _this.setState({
            fileList
          })
        }
        if (info.file.status === 'done') {
          if(info.file.response.code===200) {
            const data = info.file.response.data || {};
            const path = data.path || '';
            data.status = 'done';
            _this.handleChange(path);
          } else {
            _this.handleDeleteImg();
            message.error(info.file.response.message);
          }
        } else if (info.file.status === 'error') {
          message.error('上传失败');
        }
      },
      onPreview(file) {  //展示
        _this.handlePreview(file);
      },
      onRemove(file) {  //删除
        if (file.status === 'removed') {
          _this.handleRemove(file);
        } else if (file.status === 'error') {
          message.error('删除失败');
        }
      }
    };
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.reductionTableListForm}>
              <Form layout='inline'>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='项目名称'
                    >
                      {getFieldDecorator('itemName',{
                        rules: [
                          {
                            required: true,
                            message:'请输入项目名称'
                          },
                        ],
                        initialValue:listDetail && listDetail.itemName && listDetail.itemName
                      })(<Input disabled={id?true:false} maxLength={50} />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label={<span><span style={{color: '#f5222d',fontSize: '14px'}}>* </span>{'营业时间'}</span>}
                    >
                      <Row gutter={5}>
                        <Col span={12}>
                          <FormItem style={{ marginBottom:0 }}>
                            {getFieldDecorator('businessTimeStart', {
                              rules: [{ required: true, message: '请选择起始日期' }],
                              initialValue:listDetail && listDetail.businessTimeStart && moment(listDetail.businessTimeStart,format) || null,
                            })(
                              <TimePicker
                                style={{width:'100%'}}
                                // defaultValue={listDetail && listDetail.businessTimeStart && moment(listDetail.businessTimeStart,format) || null}
                                format={format}
                                onChange={(time, timeString) => this.onTimeChanged('startTime', timeString)}
                                disabledMinutes={this.disabledStartMinutes}
                                disabledHours={this.disabledStartHours}
                              />
                            )}
                          </FormItem>
                        </Col>
                        <Col span={12}>
                          <FormItem style={{ marginBottom:0 }}>
                            {getFieldDecorator('businessTimeEnd', {
                              rules: [{ required: true, message: '请选择结束日期' }],
                              initialValue:listDetail && listDetail.businessTimeEnd && moment(listDetail.businessTimeEnd,format) || null
                            })(
                              <TimePicker
                                style={{width:'100%'}}
                                // defaultValue={listDetail && listDetail.businessTimeEnd && moment(listDetail.businessTimeEnd,format) || null}
                                format={format}
                                onChange={(time, timeString) => this.onTimeChanged('endTime', timeString)}
                                disabledMinutes={this.disabledEndMinutes}
                                disabledHours={this.disabledEndHours}
                              />
                            )}
                          </FormItem>
                        </Col>
                      </Row>
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='销售时间单位(分)'
                    >
                      {getFieldDecorator('saleUnit',{
                        rules: [
                          {
                            required: true,
                            message:'请输入正确的销售时间单位'
                          },
                        ],
                        initialValue: listDetail && listDetail.saleUnit && listDetail.saleUnit,
                      })(<InputNumber maxLength={3} style={{ width: '100%' }}/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='提前预定天数'
                    >
                      {getFieldDecorator('bookDays',{
                        rules: [
                          {
                            required: true,
                            message:'请输入提前预定天数'
                          },
                          {
                            pattern: /^[1-9]\d{0,1}$/,
                            message: '提前预定天数为整数，且最多为99天',
                          },
                        ],
                        initialValue: listDetail && listDetail.bookDays && listDetail.bookDays,
                      })(<Input maxLength={2}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='超时计费单位(分)'
                    >
                      {getFieldDecorator('timeoutBillingUnit',{
                        rules: [
                          {
                            required: true,
                            message:'请输入超时计费单位'
                          },
                          {
                            pattern: /^[1-9]\d{0,2}$/,
                            message: '超时计费单位长度为3，且是整数',
                          },
                        ],
                        initialValue: listDetail && listDetail.timeoutBillingUnit && listDetail.timeoutBillingUnit,
                      })(<Input/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...formItemLayout} label='项目图片'>
                      {getFieldDecorator('file', {
                        initialValue:[],
                      })(
                        <div>
                          <LocaleProvider locale={zhCN}>
                            <Upload {...propsUpload}>
                              {
                                fileList && fileList.length < 1 && <div>
                                  <Icon type="plus" />
                                  <div className="ant-upload-text">图片上传</div>
                                </div>
                              }
                            </Upload>
                          </LocaleProvider>
                          <Modal visible={previewVisible} footer={null} onCancel={this.handleCloseCancel}>
                            <img alt="example" style={{ width: '100%' }} src={previewImage} />
                          </Modal>
                        </div>)}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
          <div style={{ overflow: 'hidden',width:'100%' }}>
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={4} offset={10}>
                <Button
                  htmlType="submit"
                  onClick={this.handleSubmit}
                  loading={this.state.loading}
                  className={styles.buttonColor}>保存</Button>
                <Button
                  type="primary"
                  onClick={this.handleCancel}
                  className={styles.buttonColor}
                  style={{marginLeft:5}}
                >
                  取消
                </Button>
              </Col>
            </Row>
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
