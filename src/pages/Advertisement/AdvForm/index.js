import React, { Component } from 'react';
import { Modal, Form, Input, Spin, InputNumber, Upload, Icon } from 'antd';
import request from '../../../utils/request';
import { handleResponse } from '../../../utils/globalUtils';

/**
 * @author jiangt
 */

@Form.create()
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      visible: false,
      formData: {},
      fileList: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.fetchRecord(nextProps.id);
    } else {
      this.initialState();
    }
  }

  componentWillUnmount() {
    this.initialState();
  }

  initialState = () => {
    this.setState({
      loading: false,
      visible: false,
      formData: {},
      fileList: [],
    });
  };

  handleUpload = (info) => {
    const fileList = info.fileList.slice();
    fileList.map((file) => {
      if (file.response && handleResponse(file.response)) {
        const { form } = this.props;
        form.setFieldsValue({ imgUrl: file.response.data.path });
        file.thumbUrl = file.response.data.path;
        file.url = file.response.data.path;
        file.id = file.response.data.path;
      }
      return file;
    });
    this.setState({ fileList });
  };

  /**
   * 初始化编辑数据
   * @param id
   */
  fetchRecord = (id) => {
    const { visible } = this.state;
    if (!visible && id) {
      this.setState({ loading: true });
      request(`/venuebooking/advertisement/getById?id=${id}`)
        .then(response => {
          if (handleResponse(response)) {
            let file = null;
            if (response.data.imgUrl) {
              file = {
                uid: response.data.imgUrl,
                id: response.data.imgUrl,
                url: response.data.imgUrl,
                thumbUrl: response.data.imgUrl,
              }
            }
            this.setState({
              visible: true,
              formData: response.data,
              fileList: file ? [file] : [],
            });
          }
          this.setState({ loading: false });
        });
    } else {
      this.setState({ visible: true });
    }
  };

  handleSubmit = (e) => {
    if (e)
      e.preventDefault();
    const { form } = this.props;
    form.validateFieldsAndScroll((errors, values) => {
      if (!errors) {
        const { formData } = this.state;
        request("/venuebooking/advertisement/save", {
          method: "POST",
          body: {
            ...formData,
            ...values,
          },
        }).then(response => {
          if (handleResponse(response)) {
            const { onOk } = this.props;
            onOk();
          }
        })
      }
    });
  };

  render() {
    const { form, onCancel, id } = this.props;
    const { loading, visible, formData, fileList } = this.state;

    const formItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 4 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 20 } },
    };

    return (
      <Modal
        title={`${id ? '编辑' : '新增'}`}
        destroyOnClose
        visible={visible}
        okButtonProps={{ loading }}
        cancelButtonProps={{ disabled: loading }}
        onOk={() => this.handleSubmit()}
        onCancel={onCancel}
      >
        <Spin spinning={loading}>
          <Form>
            <Form.Item label="图片名称" {...formItemLayout}>
              {form.getFieldDecorator("imgName", {
                rules: [{ required: true, message: '请输入图片名称' }],
                initialValue: formData.imgName,
              })(
                <Input />
              )}
            </Form.Item>
            <Form.Item label="广告图片" {...formItemLayout}>
              {form.getFieldDecorator("imgUrl", {
                rules: [{ required: true, message: '请上传广告图片' }],
                initialValue: formData.imgUrl,
              })(
                <span>
                  <Upload
                    name="file"
                    headers={{
                      authorization: 'authorization-text',
                      product_code : 'jis-platform-venue-booking'
                    }}
                    listType="picture-card"
                    action="/api/venuebooking/uploadflle/upload"
                    fileList={fileList}
                    onChange={this.handleUpload}
                  >
                    {fileList.length > 0 ? null : <span><Icon type="upload" />图片上传</span>}
                  </Upload>
                </span>
              )}
            </Form.Item>
            <Form.Item label="排序索引" {...formItemLayout}>
              {form.getFieldDecorator("sort", {
                rules: [{ required: true, message: '请填写排序索引' }],
                initialValue: formData.sort,
              })(
                <InputNumber min={0} precision={0} style={{ width: '100%' }} />
              )}
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    );
  }
}

export default index;
