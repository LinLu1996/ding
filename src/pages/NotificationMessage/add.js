import React, { Component,PureComponent } from 'react';
import {
  Card,
  Button,
  Form,
  Icon,
  Col,
  Row,
  DatePicker,
  TimePicker,
  Input,
  Select,
  Popover,
  Checkbox,
  Radio,
  InputNumber,
  Upload,
  message,
  Cascader,
} from 'antd';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import FooterToolbar from '@/components/FooterToolbar';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import moment from 'moment';
import router from "umi/router";
import styles from './index.less';
import {handleResponse} from "../../utils/globalUtils";
import {Modal} from "antd/lib/index";


const { Option } = Select;
const RadioGroup = Radio.Group;
const { RangePicker } = DatePicker;
const CheckboxGroup = Checkbox.Group;







@connect(({ notice, loading }) => ({
  notice,
  loading: loading.models.notice,
}))
@Form.create()
class AdvancedForm extends Component {

  action = {
    detailsInfo:'notice/detailsinfo',
    noticeAdd:'notice/noticeadd',
  };

  state = {
    /* ======================================== */
    width: '100%',
    fuValue:'',
    loading:false,
  };

  componentDidMount() {
    console.log("如果是新增跳转，调用获取当前登录人信息的接口，暂时没有");

  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeFooterToolbar);
  }

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

  handleToReturn = () => {
    Modal.confirm({
      title: '提示',
      content: '是否放弃录入的内容？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.handleReturn(),
    });
  }

  handleReturn = () =>{
    const pathname = `/notificationMessage`;
    router.push({
      pathname,
    });
  };

  handleFuChange = (value) => {
    const con = this.reactQuill;
    this.setState({
      fuValue:value,
    })
  };


  /**
   * @Author luzhijian
   * @Description //确定按钮
   * @Date 15:39 2019/1/7
   * @Param
   * @return
   * */

  validate = (e) =>{
    this.setState({
      loading:true,
    });
    const {fuValue}=this.state;
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    if (fuValue===''){
      message.error("请输入通知内容");
      this.setState({
        loading:false,
      });
      return;
    }
    validateFieldsAndScroll((error, values) => {

      if (error) {
        this.setState({
          loading:false,
        });
        return;
      }



      const param={
        type:e,
        noticeTitle:values.noticeTitle,
        endDateString:values.endDate.format("YYYY-MM-DD"),
        noticeContent:fuValue,
      };

      dispatch({
        type: this.action.noticeAdd,
        payload: param,
      }).then(
        ()=>{
          this.setState({
            loading:false,
          });
          const {notice:{noticeAddResult}}=this.props;
          if (handleResponse(noticeAddResult)){
            message.success("保存成功");
            const pathname = `/notificationMessage`;
            router.push({
              pathname,
            });
          };

        }
      )

    });

  }

  render() {
    const {
      form,
      submitting,
    } = this.props;
    const {width} = this.state;

    /**
     * 定义多选框的数组
     * @type {string[]}
     */
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
      <PageHeaderWrapper
        title="新增"
        wrapperClassName={styles.advancedForm}
      >
        {/* 基本信息 */}
        <Card title="基本信息" bordered={false}>
          <Form className={styles.noticeForm}>
            {/* 创建人 */}
            <Row>
              <Col span={12}>
                <Form.Item {...formItemLayout} label="创建人:">
                  {form.getFieldDecorator('creator',{
                    // rules: [{ required: false, message: formatMessage({ id: 'Please.choose' }) }],
                    // initialValue:detailsInfoResult&&detailsInfoResult.creator,
                  })(<Input style={{ width: '100%' }} disabled />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item {...formItemLayout} label="创建时间:">
                  {form.getFieldDecorator('createDate', {
                    // initialValue: moment(new Date(),"YYYY-MM-DD HH:mm:ss"),
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
                    initialValue:moment(moment().add(15, 'days').calendar(),"YYYY-MM-DD"),
                    rules: [{ required: true, message: "请选择截止日期"}],
                  })(<DatePicker style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
            </Row>

            {/* 通知标题 */}
            <Row>
              <Col span={12}>
                <Form.Item {...formItemLayout} label="通知标题:">
                  {form.getFieldDecorator('noticeTitle',{
                    rules: [{ required: true, message: "请填写通知标题"}],
                  })(<Input style={{ width: '100%' }} />)}
                </Form.Item>
              </Col>
            </Row>

            {/* 消息内容 */}

         {/*   <Row>
              <Col span={24} style={{marginLeft:"4%"}}>
                <Form.Item
                  {...contentFormItemLayout}
                  label="通知内容:"
                >
                  {form.getFieldDecorator('noticeContent', {
                    rules: [{ required: true, message: "请填写通知内容"}],
                  })(<textarea style={{ width: '100%' }} placeholder="请填写通知内容" />)}
                </Form.Item>
              </Col>
            </Row> */}
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
              <Col span={12} style={{marginLeft:"-33.3%"}}>
                <ReactQuill value={this.state.fuValue} ref={ el => this.reactQuill = el} onChange={this.handleFuChange} style={{width:"166%"}} />
              </Col>
            </Row>
          </Form>
        </Card>

        <FooterToolbar style={{ width }}>
          {this.getErrorInfo()}
          <Button style={{marginLeft:"50%"}} type="primary" onClick={() =>this.validate(1)} loading={this.state.loading}>
            保存草稿
          </Button>
          <Button type="primary" onClick={()=>this.validate(2)} loading={this.state.loading}>
            发布
          </Button>
          <Button style={{marginLeft:"1%"}} type="primary" onClick={this.handleToReturn}>
            返回
          </Button>
        </FooterToolbar>
      </PageHeaderWrapper>
    );
  }
}

export default AdvancedForm;
