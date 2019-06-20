import React, { Component,Fragment } from 'react';
import { connect } from 'dva';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Form, Card, Input, Col, Row, Table, Button, message,InputNumber,Upload,Modal,Icon,LocaleProvider } from 'antd';
import zhCN from "antd/lib/locale-provider/zh_CN";
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import moment from 'moment';
import styles from './index.less';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import Authorized from '../../utils/Authorized';
import { noMatch } from '../../utils/authority';
import { isPicture, pictureLimit } from '../../utils/uploadUtils';

const FormItem = Form.Item;

@Form.create()
@connect(({ systemSet }) => ({
  systemSet,
}))

export default class Emply extends Component {

  action = {
    queryList: 'systemSet/fetchQueryTicket',
    editCompanyInfo: 'systemSet/fetchEditCompanyInfo',
    getCompanyInfo: 'systemSet/fetchGetCompanyInfo',
  };
  firstFlag=true;
  firstUid=1;
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      fileList:[],
      id:null,
      previewVisible: false,  //照片弹出框
      previewImage: '',   //弹出的照片
      value1:'',
      loading:false,
    };
  }

  componentDidMount() {
    const {current,pageSize} = this.state;
    const { dispatch, location } = this.props;
    dispatch({
      type: this.action.getCompanyInfo,
    }).then(() => {
      const { systemSet: { companyInfo } } = this.props;
      const { fileList } = this.state;
      if(JSON.stringify(companyInfo !== "{}")) {
        let obj = {};
        if(companyInfo && companyInfo.id){
          this.setState({
            id:companyInfo.id,
          })
        }
        if(companyInfo && companyInfo.showPicture) {
          obj = {
            uid:1,
            url:companyInfo.showPicture
          }
          fileList.push(obj);
        }
        this.setState({
          fileList,
          value1: companyInfo && companyInfo.enterpriseInstruction && companyInfo.enterpriseInstruction || '',
        })
      }
    })
  }


  // 取消
  handleCancel = () => {
    router.go(-1);
  }

  //改变照片数组
  handleImageChange = (file) => {
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

  // 改变富文本框内容
  handleChange = (value) => {
    this.setState({
      value1:value,
    })
  };

  handleSubmit = () => {
    const { form, dispatch,systemSet: { companyInfo }} = this.props;
    const { type,id,value1,fileList } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return;
      }
      this.setState({
        loading:true
      })
      const params = {
        ...companyInfo,
        ...values,
        id,
        showPicture:JSON.stringify(fileList)==="[]"?null:fileList[0].url,
        enterpriseInstruction:value1,
      };
      dispatch({
        type: this.action.editCompanyInfo,
        payload: {
          ...params
        }
      }).then(() => {
        const {
          systemSet: { code },
        } = this.props;
        this.setState({
          loading:false
        })
        if (code === 200) {
          // this.handleCancel();
        }
      })
    })
  };

  render() {
    const { form: { getFieldDecorator },systemSet:{ companyInfo } } = this.props;
    const { previewVisible,previewImage,fileList } = this.state;
    const _this=this;
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
      // multiple: true,
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
            _this.handleImageChange(path);
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
                      label='公司名称'
                    >
                      {getFieldDecorator('enterpriseName',{
                        rules: [
                          {
                            required: true,
                            message:'请输入公司名称'
                          },
                        ],
                        initialValue:companyInfo && companyInfo.enterpriseName,
                      })(<Input maxLength={25} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='经度'
                    >
                      {getFieldDecorator('longitude',{
                        initialValue: companyInfo && companyInfo.longitude,
                        rules:[
                          {pattern: /^([-+]?\d{0,3})(\.\d{0,10})?$/, message:'请输入正确格式'}
                        ]
                      })(<Input/>)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='纬度'
                    >
                      {getFieldDecorator('latitude',{
                        initialValue: companyInfo && companyInfo.latitude,
                        rules:[
                          {pattern: /^([-+]?\d{0,3})(\.\d{0,10})?$/, message:'请输入正确格式'}
                        ]
                      })(<Input/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24}>
                    <FormItem
                      {...formItemLayout}
                      label='详细地址'
                    >
                      {getFieldDecorator('detailedAddress',{
                        rules: [
                          {
                            required: true,
                            message:'请输入地址'
                          },
                        ],
                        initialValue: companyInfo && companyInfo.detailedAddress,
                      })(<Input maxLength={50}/>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='客服电话'
                    >
                      {getFieldDecorator('serviceTel',{
                        rules: [
                          {
                            required: true,
                            message:'请输入客服电话'
                          },
                        ],
                        initialValue: companyInfo && companyInfo.serviceTel,
                      })(<Input maxLength={20} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24}>
                    <FormItem {...formItemLayout} label='展示图'>
                      {getFieldDecorator('showPicture', {})(
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
                <Row gutter={24} style={{display:'flex'}}>
                  <Col span={2} style={{width:'150px',textAlign:'right',padding:0,color:'rgba(0, 0, 0, 0.85)'}}>
                    公司介绍:
                  </Col>
                  <Col span={22} style={{width: 'calc(100% - 150px)'}}>
                    <ReactQuill  value={this.state.value1} onChange={this.handleChange} />
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
          <Authorized authority='jis_platform_dc_system_company_save' nomatch={noMatch()}>
            <div style={{ overflow: 'hidden',width:'100%' }}>
              <Row gutter={24} style={{ marginTop: 24,marginBottom: 24 }}>
                <Col span={2} offset={12}>
                  <Button
                    htmlType="submit"
                    onClick={this.handleSubmit}
                    loading={this.state.loading}
                    className={styles.buttonColor}>保存</Button>
                </Col>
              </Row>
            </div>
          </Authorized>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
