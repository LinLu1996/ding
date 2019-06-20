import React, { Component,Fragment } from 'react';
import router from 'umi/router';
import { Form, Card, Input, DatePicker, Select, Col, Row, Table, Button, message,Upload } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './index.less';
import { connect } from 'dva';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import { isPicture, pictureLimit } from '../../utils/uploadUtils';

const FormItem = Form.Item;

@Form.create()
@connect(({ advertisement }) => ({
  advertisement,
}))

export default class Emply extends Component {

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
          type: 'advertisement/fetchGetListDetail',
          payload:{ sportItemId:query.id }
        }).then(() => {
          const {advertisement:{ listDetail }} = this.props;
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
    const pathname = `/Advertisement/AdvertisementList/list`;
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

  handleSubmit = () => {
    const { form, dispatch } = this.props;
    const { id,fileList,enterpriseId } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return ;
      }
      this.setState({
        loading:true
      })
      const params = {
        id:id || null,
        imgName:values.	imgName===undefined ?null:values.imgName,
        sort:values.sort===undefined ?null:values.sort,
        imgUrl:JSON.stringify(fileList)==="[]"?null:fileList[0].url,
      };
      dispatch({
        type:'advertisement/fetchAddProject',
        payload:params
      }).then(() => {
        const {
          advertisement: { code },
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
    const { form: { getFieldDecorator },advertisement:{ listDetail } } = this.props;
    const { previewVisible,previewImage,fileList,id } = this.state;
    const _this=this;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
        md: { span: 18 },
      },
    };
    const propsUpload = {
      name: 'file',
      accept: 'image/jpg,image/jpeg,image/png,image/bmp',
      action: '/api/dcAdmin/uploadflle/upload',
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
            <div>
              <Form>
                <Row gutter={24}>
                  <Col span={24}>
                    <FormItem
                      {...formItemLayout}
                      label='名称'
                    >
                      {getFieldDecorator('name',{
                        rules: [
                          {
                            required: true,
                            message:'请输入项目名称'
                          },
                        ],
                        initialValue:id && listDetail && listDetail.itemName && listDetail.itemName
                      })(<Input disabled={id?true:false} maxLength={50} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col span={24}>
                    <FormItem {...formItemLayout} label='图片'>
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
                <Row gutter={24}>
                  <Col span={24}>
                    <FormItem
                      {...formItemLayout}
                      label='排序字段'
                    >
                      {getFieldDecorator('order',{
                        rules: [
                          {
                            required: true,
                            message:'请输入排序字段'
                          },
                        ],
                        initialValue:id && listDetail && listDetail.itemName && listDetail.itemName
                      })(<Input disabled={id?true:false} maxLength={50} />)}
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
