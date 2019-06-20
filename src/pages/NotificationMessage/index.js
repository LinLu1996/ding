import React, { Component,PureComponent } from 'react';
import {
  Card,
  Button,
  Form,
  Col,
  Row,
  DatePicker,
  TimePicker,
  Input,
  Select,
  Popover,
  Checkbox,
  Radio,
  Upload,
  message,
  Cascader,
  Table,
  Modal,
  Divider,
} from 'antd';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import FooterToolbar from '@/components/FooterToolbar';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import moment from 'moment';
import router from "umi/router";
import styles from './style.less';
import {handleResponse} from "../../utils/globalUtils";
import { noMatch } from '../../utils/authority';
import Authorized from '../../utils/Authorized';








@connect(({ notice, loading }) => ({
  notice,
  loading: loading.models.notice,
}))
@Form.create()
class AdvancedForm extends Component {

  action = {
    queryList:'notice/querylist',
    deleteList:'notice/deletelist',
  };

  state = {
    current: 1,
    pageSize: 10,
    dataSoure: [],
    startValue: null,
    endValue: null,
    endOpen: false,
    selectedRowKeys:[],
    selectedRow:[],
    /* ======================================== */
    width: '100%',

  };

  componentDidMount() {

    const {
      dispatch,
    } = this.props;
    const param={
      pageNo:1,
      pageSize:10,
      publishDateEnd:moment(new Date(),"YYYY-MM-DD").format("YYYY-MM-DD"),
      publishDateStart:moment(moment().subtract(7, 'days').calendar(),"YYYY-MM-DD").format("YYYY-MM-DD"),
    };
    dispatch({
      type: this.action.queryList,
      payload: param,
    }).then(()=>{
      const {notice:{queryListResult}}=this.props;
      this.setState({
        dataSoure:queryListResult&&queryListResult.data&&queryListResult.data.list,
      });
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
   * @Description //查看，页面跳转
   * @Date 10:57 2019/1/9
   * @Param
   * @return
   * */

  handleDetailNotice=(record)=>{

    const pathname = `/notificationMessage/details`;
    const query = {
        id:record.id,
    };
    router.push({
      pathname,
      query,
    });
  };


  /**
   * @Author luzhijian
   * @Description //编辑跳转
   * @Date 15:39 2019/1/9
   * @Param
   * @return
   * */

  handleEditNotice=(record)=>{
    const pathname = `/notificationMessage/edit`;
    const query = {
      id:record.id,
    };
    router.push({
      pathname,
      query,
    });
  };




  /**
   * @Author luzhijian
   * @Description //新增跳转
   * @Date 15:37 2019/1/9
   * @Param
   * @return
   * */

  handleAddNotice=()=>{
    const pathname = `/notificationMessage/add`;
    router.push({
      pathname,

    });
  };





  /**
   * @Author luzhijian
   * @Description //查询
   * @Date 13:33 2019/1/9
   * @Param
   * @return
   * */

  handleQelect=()=>{
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;
    const {current}=this.state;
    validateFieldsAndScroll((error, values) => {
      const param = {
        pageSize: 10,
        pageNo: current,
        noticeTitle: values.noticeTitle,
        noticeStatus: values.noticeStatus,
        publishDateStart: values.publishDateStart !== undefined &&values.publishDateStart !==null? values.publishDateStart.format("YYYY-MM-DD") : undefined,
        publishDateEnd: values.publishDateEnd !== undefined &&values.publishDateEnd !==null? values.publishDateEnd.format("YYYY-MM-DD") : undefined,
      };
      dispatch({
        type: this.action.queryList,
        payload: param,
      }).then(() => {
        const {notice: {queryListResult}} = this.props;
        this.setState({
          dataSoure: queryListResult&&queryListResult.data&&queryListResult.data.list,
        })


      });
    })

  };

  // 分页
  handleTableChange = (current, pageSize) => {
    this.setState(
      {
        current,
        pageSize,
      },
      () => {
        this.handleQelect();
      }
    );
  };



  /**
   * @Author luzhijian
   * @Description //作废按钮
   * @Date 17:39 2019/1/9
   * @Param
   * @return
   * */


  handleToDelete = () => {
    const { selectedRow } = this.state;
    if (JSON.stringify(selectedRow) === '[]') {
      message.warning('请选择一条数据');
      return;
    }
    Modal.confirm({
      title: '提示',
      content: '确定要作废该通知？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.handleDeleteList(),
    });
  }

  handleDeleteList=()=>{
    const {
      dispatch,
    } = this.props;
    const {selectedRowKeys}=this.state;
    const deleteList=selectedRowKeys;
    const param={deleteList};
    dispatch({
      type: this.action.deleteList,
      payload: param,
    }).then(() =>{
      const {notice:{deleteListResult}}=this.props;
      if (handleResponse(deleteListResult)){
        message.success("作废成功")
        const freash={
          pageNo:1,
          pageSize:10,
        }
        dispatch({
          type: this.action.queryList,
          payload: freash,
        }).then(()=>{
          const {notice: {queryListResult}} = this.props;
          this.setState({
            dataSoure: queryListResult&&queryListResult.data&&queryListResult.data.list,
            selectedRowKeys:[],
          })

        })
      }
    });

  };

    hanleOnChange=(selectedRowKeys,selectedRow) => {
        this.setState({
          selectedRowKeys:selectedRowKeys,
          selectedRow:selectedRow,
      })
  };


/**
 * @Author luzhijian
 * @Description //重置
 * @Date 16:14 2019/1/10
 * @Param
 * @return
 * */
    handleReset=()=>{

      const {
        dispatch,
        form,
      } = this.props;
      form.resetFields();
      const param={
        pageNo:1,
        pageSize:10,
      };
      dispatch({
        type: this.action.queryList,
        payload: param,
      }).then(()=>{
        const {notice:{queryListResult}}=this.props;
        this.setState({
          dataSoure:queryListResult&&queryListResult.data&&queryListResult.data.list,
        });
      });
    }




  render() {
    const {
      form: { getFieldDecorator },
      notice:{queryListResult}
    } = this.props;
    const {startValue, endValue, endOpen,dataSoure,selectedRowKeys,current,pageSize,selectedRow} = this.state;
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
        title: '通知标题',
        dataIndex: 'noticeTitle',
        key: 'noticeTitle',
      },
      {
        title: '发布人',
        dataIndex: 'publisherName',
        key: 'publisherName',
      },
      {
        title: '创建时间',
        dataIndex: 'createDate',
        key: 'createDate',
      },
      {
        title: '发布时间',
        key: 'publishDate',
        dataIndex: 'publishDate',
      },
      {
        title: '截止日期',
        key: 'endDate',
        dataIndex: 'endDate',
      },
      {
        title: '状态',
        key: 'noticeStatus',
        dataIndex: 'noticeStatus',
        render: (text, record) =>
          <span>
            {record.noticeStatus===1?"未发布":(record.noticeStatus===2?"发布中":"作废")}
          </span>

      },
      {
        title:"操作",
        key:"action",
        dataIndex: 'action',
        render: (text, record) =>
          <span>
            <Authorized authority='jis_platform_dc_notice_detail' nomatch={noMatch()}>
              <a onClick={() => this.handleDetailNotice(record)}>查看</a>
            </Authorized>
            <Authorized authority='jis_platform_dc_notice_edit' nomatch={noMatch()}>
              <Divider type="vertical" />
              <a disabled={record.noticeStatus!==1} onClick={() => this.handleEditNotice(record)}>编辑</a>
            </Authorized>
          </span>


      }

    ];


    const rowSelection = {
      selectedRowKeys,
      onChange: this.hanleOnChange,
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),


    };


    return (
      <PageHeaderWrapper
        wrapperClassName={styles.advancedForm}
      >

        {/* 通知列表 */}
        <Card title="通知列表" bordered={false}>
          <Form hideRequiredMark>
            {/* 数量 */}
            <Row>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="通知标题">
                  {getFieldDecorator('noticeTitle', {
                    // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                    rules: [{ required: false, message: "请选择" }],
                  })
                  (
                    <Input placeholder="输入通知标题" style={{width:"90%"}}/>
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="发布状态">
                  {getFieldDecorator('noticeStatus', {
                    // initialValue: (selectOneResult!==null&&selectOneResult.size>0&&selectOneResult.certificateType!==null)?selectOneResult.certificateType:formatMessage({ id: 'app.common.select' }),
                    initialValue:"0",
                    rules: [{ required: false, message: "请选择" }],
                  })
                  (
                    <Select style={{width:"90%"}}>
                      <Select.Option value="0" key="0">
                        全部
                      </Select.Option>
                      <Select.Option value="1" key="1">
                        未发布
                      </Select.Option>
                      <Select.Option value="2" key="2">
                        发布中
                      </Select.Option>
                      <Select.Option value="3" key="3">
                        作废
                      </Select.Option>
                    </Select>
                  )
                  }
                </Form.Item>
              </Col>

            </Row>
            <Row>

              <Col span={8}>
                <Form.Item {...formItemLayout} label="发布日期">
                  {getFieldDecorator('publishDateStart', {
                    initialValue:moment(moment().subtract(7, 'days').calendar(),"YYYY-MM-DD"),
                    rules: [{ required: false, message: "请选择" }],
                  })
                  (
                    <DatePicker
                      disabledDate={this.disabledStartDate}
                      style={{width:"90%"}}
                      format="YYYY-MM-DD"
                      placeholder="开始日期"
                      onChange={this.onStartChange}
                      onOpenChange={this.handleStartOpenChange}
                    />
                  )
                  }
                </Form.Item>

              </Col>
              <Col span={8}>
                <Form.Item {...formItemLayout} label="">
                  {getFieldDecorator('publishDateEnd', {
                    initialValue: moment(new Date(),"YYYY-MM-DD"),
                    rules: [{ required: false, message: "请选择" }],
                  })
                  (
                    <DatePicker
                      disabledDate={this.disabledEndDate}
                      style={{width:"90%"}}
                      format="YYYY-MM-DD"
                      placeholder="结束日期"
                      onChange={this.onEndChange}
                      open={endOpen}
                      onOpenChange={this.handleEndOpenChange}
                    />
                  )
                  }
                </Form.Item>
              </Col>
              <Col span={8} style={{textAlign:'right'}}>
                <Authorized authority='jis_platform_dc_notice_query' nomatch={noMatch()}>
                  <Button type="primary" onClick={this.handleQelect}>
                    查询
                  </Button>
                </Authorized>
                <Button type="primary" style={{marginLeft:5}} onClick={this.handleReset}>
                  重置
                </Button>
              </Col>

            </Row>
            <Row>
              <Col span={4}>
                <Authorized authority='jis_platform_dc_notice_add' nomatch={noMatch()}>
                  <Button type="primary" onClick={this.handleAddNotice}>
                    新增
                  </Button>
                </Authorized>
                <Authorized authority='jis_platform_dc_notice_delete' nomatch={noMatch()}>
                  <Button disabled={JSON.stringify(selectedRow) === '[]'} type="primary" style={{marginLeft:5,marginBottom:24}} onClick={this.handleToDelete}>
                    作废
                  </Button>
                </Authorized>
              </Col>
            </Row>
            <div className={styles.resTable}>
              <Table
                pagination={{
                  current,
                  pageSize,
                  defaultCurrent: 1,
                  defaultPageSize: 10,
                  total: queryListResult&& queryListResult.data && queryListResult.data.total,
                  onChange: this.handleTableChange,
                }}
                rowKey={record=>record.id}
                bordered
                rowSelection={rowSelection}
                columns={columns}
                dataSource={dataSoure}
              />
            </div>

          </Form>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default AdvancedForm;
