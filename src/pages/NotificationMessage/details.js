import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Form, Select, Row, Col, DatePicker, Input, Button, Table, message } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import FooterToolbar from '@/components/FooterToolbar';
import styles from './index.less';


@Form.create()
@connect(({ notice, loading }) => ({
  notice,
  loading: loading.models.notice,
}))
class employManagement extends Component {
  action = {
    detailsInfo:'notice/detailsinfo',

  };

  state = {
    fuValue:'',
    width: '100%',
  };

  /**
   * @Author luzhijian
   * @Description //项目初始化
   * @Date
   * @Param
   * @return
   * */
  componentDidMount() {
    const { dispatch } = this.props;
    const { location } = this.props;
    // 获取之前页面带来的值
    if (location && location.search) {
      const { query } = location;
      const param={
        id:query.id,
      };
      dispatch({
        type: this.action.detailsInfo,
        payload: param,
      }).then(()=>{
        const {notice:{detailsInfoResult}}=this.props;
        if (detailsInfoResult&&detailsInfoResult.noticeContent) {
          this.setState({fuValue:detailsInfoResult.noticeContent})
        }
      })
    }
  }

  /**
   * @Author luzhijian
   * @Description //返回按钮
   * @Date 16:07 2018/11/30
   * @Param
   * @return
   * */

  handleReturn = () => {
    const pathname = `/notificationMessage`;
    router.push({
      pathname,
    });
  };

  render() {
    const { form,notice:{detailsInfoResult}  } = this.props;
    const {width } = this.state;
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

    return (
      <PageHeaderWrapper>
        <Card style={{ height: 600 }}>
          <Form style={{ marginTop: 8 }} className={styles.noticeForm}>
            {/* 创建人 */}
            <Row>
              <Col span={12}>
                <Form.Item {...formItemLayout} label="创建人:">
                  {form.getFieldDecorator('creator',{
                    // rules: [{ required: false, message: formatMessage({ id: 'Please.choose' }) }],
                    initialValue:detailsInfoResult&&detailsInfoResult.creator,
                  })(<Input style={{ width: '100%' }} disabled />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...formItemLayout} label="创建时间:">
                  {form.getFieldDecorator('createDate', {
                    initialValue:detailsInfoResult&&detailsInfoResult.createDate,
                    // rules: [{ required: false, message: formatMessage({ id: 'form.weight.placeholder' }) }],
                  })(
                    <Input disabled />
                  )}
                </Form.Item>
              </Col>
            </Row>

            {/* 截止日期 */}
            <Row>
              <Col span={12}>
                <Form.Item {...formItemLayout} label="截止日期:">
                  {form.getFieldDecorator('endDate',{
                    rules: [{ required: true, message: "请选择截止日期"}],
                    initialValue:detailsInfoResult&&detailsInfoResult.endDate,
                  })(<Input disabled style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
            </Row>

            {/* 通知标题 */}
            <Row>
              <Col span={12}>
                <Form.Item {...formItemLayout} label="通知标题:">
                  {form.getFieldDecorator('noticeTitle',{
                    rules: [{ required: true, message: "请填写通知标题"}],
                    initialValue:detailsInfoResult&&detailsInfoResult.noticeTitle,
                  })(<Input disabled style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
            </Row>



            {/* 消息内容 */}
            <Row>
              <Col span={12}>
                <Form.Item
                  {...formItemLayout}
                  label="通知内容:"
                >
                  {form.getFieldDecorator('noticeContent', {
                    rules: [{ required: true}],
                    initialValue:1
                  })(
                    <span style={{visibility:'hidden'}}></span>
                  )}
                </Form.Item>

              </Col>
              <Col span={12} style={{marginLeft:"-37.5%"}}>
                <ReactQuill readOnly value={this.state.fuValue} style={{width:"166%",background:"#f5f5f5"}} />
              </Col>
            </Row>
          </Form>

        </Card>
        <FooterToolbar style={{ width }}>
          <Button style={{marginLeft:"55%"}} type="primary" onClick={() => this.handleReturn()}>
            返回
          </Button>
        </FooterToolbar>
      </PageHeaderWrapper>
    );
  }
}

export default employManagement;
