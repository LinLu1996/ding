import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Form, Row, Col, Button, Table, message, Input, Select, Divider, Modal, Upload } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Ellipsis from '../../components/Ellipsis';
import styles from './index.less';
import { noMatch } from '../../utils/authority';
import Authorized from '../../utils/Authorized';
import {handleResponse} from "../../utils/globalUtils";

@connect(({ venue,cards, loading }) => ({
  venue,cards,
  loading: loading.models.venue,
}))
@Form.create()
class PersonalCenter extends Component {
  action = {
    queryList: 'venue/querylist',
    venueDeletList:'venue/venuedeletlist',
    getApplicableItems: 'cards/fetchGetApplicableItems',
  };

  state = {
    previewImage:{},
    previewVisible:false,
    current: 1,
    pageSize: 10,
    venuesNameForm:null,// 场馆名称
    stateForm:null,// 状态
    selectedRow:[],// 多选list
    selectedRowKeys:[],
  };

  componentDidMount() {
    const {
      dispatch,
    } = this.props;
    dispatch({
      type: this.action.getApplicableItems,
    });
    const param={
      pageNo:1,
      pageSize:10,
    }
    dispatch({
      type: this.action.queryList,
      payload: param,
    })
  }

  /**
   * @Author luzhijian
   * @Description // 新增场馆信息
   * @Date 11:51 2018/12/24
   * @Param
   * @return
   * */
  handleVenueAdd= () =>{
    const pathname = `/venue/venueList/list/add`;
    const query = {
      type:1,
    };
    router.push({
      pathname,
      query,
    });
  };

  /**
   * @Author luzhijian
   * @Description //删除按钮
   * @Date 20:01 2018/12/28
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
      content: '你确定删除该场馆吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.handleDeleteList(),
    });
  }

  handleDeleteList=()=>{
    const {
      dispatch,
    } = this.props;
    const {selectedRow}=this.state;
    const deleteList=[];
    for(let i=0;i<selectedRow.length;i++){
      deleteList.push(selectedRow[i].id);
    }
    const param={deleteList};
    dispatch({
      type: this.action.venueDeletList,
      payload: param,
    }).then(() =>{
      const {venue:{venueDeletListResult}}=this.props;
      if (handleResponse(venueDeletListResult,true)){
        const freash={
          pageNo:1,
          pageSize:10,
        }
        dispatch({
          type: this.action.queryList,
          payload: freash,
        }).then(()=>{
          this.setState({
            selectedRowKeys:[],
          })
        })
      }
    });

  }

  /**
   * @Author luzhijian
   * @Description //编辑按钮
   * @Date 15:42 2018/12/24
   * @Param
   * @return
   * */

  handleVenueEidt = (record) =>{
    const pathname = `/venue/venueList/list/add`;
    const query = {
      id: record.id,
      type:2,
    };
    router.push({
      pathname,
      query,
    });
  }

  /**
   * @Author luzhijian
   * @Description //闭馆
   * @Date 16:09 2018/12/24
   * @Param
   * @return
   * */
  handleVenueClose = (record) =>{
    const pathname = `/venue/venueList/list/close`;
    const query = {
      id: record.id,
      closeType:1,// closeType:1,场馆闭馆，2，场地闭馆
    };
    router.push({
      pathname,
      query,
    });
  };

  /**
   * @Author luzhijian
   * @Description //查询按钮
   * @Date 10:29 2018/12/28
   * @Param
   * @return
   * */

  handleSelect = () =>{
    const {
      form: { validateFieldsAndScroll },
      dispatch,
    } = this.props;

    const {current,pageSize}=this.state;
    validateFieldsAndScroll((error, values) => {
      const param={
        venuesName:values.venuesName,
        sportItemId:values.itemId==="6"?null:values.itemId,
        state:values.state==="6"?null:values.state,
        pageNo:current,
        pageSize,
      }
      if (!error) {
        dispatch({
          type: this.action.queryList,
          payload: param,
        }).then(() =>{
        });
      }
    });
  };

  // 分页
  handleTableChange = (current, pageSize) => {
    this.setState(
      {
        current,
        pageSize,
      },
      () => {
        this.handleSelect();
      }
    );
  };

  /**
   * @Author luzhijian
   * @Description //重置按钮
   * @Date 13:52 2018/12/28
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
    }
    dispatch({
      type: this.action.queryList,
      payload: param,
    });

  };

  hanleOnChange=(selectedRowKeys,selectedRow) => {
    this.setState({
      selectedRowKeys:selectedRowKeys,
      selectedRow:selectedRow,
    })
  };

  // 单击放大图片
  handlePicturePreview = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    });
  }

  // 关闭图片
  handlePictureCancel = () => {
    this.setState({previewVisible: false });
  }

  render() {
    const { form,venue:{queryListResult},cards:{applicableItemsList}, } = this.props;
    const {venuesNameForm,stateForm,selectedRowKeys,current,pageSize,selectedRow,previewVisible,previewImage}=this.state;
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
      listType: "picture-card",
      headers: {
        authorization: 'authorization-text',
        product_code : 'jis-platform-venue-booking'
      }
    };
    const columns = [
      { title: '场馆名称', dataIndex: 'venuesName', render: value => <Ellipsis length={8} tooltip>{value}</Ellipsis> },
      { title: '运动项目', dataIndex: 'itemName', render: value => <Ellipsis length={8} tooltip>{value}</Ellipsis> },
       // @author jiangt 暂不显示
       //  {
       //  title: '展示图',
       //  dataIndex: 'showPicture',
       //    render:(text) => {
       //      if(text) {
       //        const cuList = {};
       //        cuList.uid = 1;
       //        cuList.url = text;
       //        return <div className={styles.imgList}>
       //          <Upload {...propsUpload} fileList={[cuList]} showUploadList={{showPreviewIcon : true, showRemoveIcon: false}} onPreview={this.handlePicturePreview} />
       //          <Modal visible={previewVisible} footer={null} onCancel={this.handlePictureCancel}>
       //            <img alt="example" style={{ width: '100%' }} src={previewImage} />
       //          </Modal>
       //        </div>;
       //      }
       //    }
       // },
       //  {
       //    title: '线路图',
       //    dataIndex: 'routePicture',
       //    render:(text) => {
       //      if(text) {
       //        const cuList = {};
       //        cuList.uid = 1;
       //        cuList.url = text;
       //        return <div className={styles.imgList}>
       //          <Upload {...propsUpload} fileList={[cuList]} showUploadList={{showPreviewIcon : true, showRemoveIcon: false}} onPreview={this.handlePicturePreview} />
       //          <Modal visible={previewVisible} footer={null} onCancel={this.handlePictureCancel}>
       //            <img alt="example" style={{ width: '100%' }} src={previewImage} />
       //          </Modal>
       //        </div>;
       //      }
       //    }
       //  },
      {
        title: '营业时间',
        dataIndex: 'timeStartEnd',
        render: (text, record) =>
          <span>
            {record.businessTimeStart.substring(0,5)}--{record.businessTimeEnd.substring(0,5)}
          </span>
      },
      { title: '详细地址', dataIndex: 'detailedAddress', render: value => <Ellipsis length={8} tooltip>{value}</Ellipsis> },
      { title: '状态', dataIndex: 'stateString' },
      {
        title:"操作",
        key:"action",
        dataIndex: 'action',
        render: (text, record) =>
          <span>
            <Authorized authority='jis_platform_dc_venue_list_edit' nomatch={noMatch()}>
              <a onClick={() => this.handleVenueEidt(record)}>编辑</a>
            </Authorized>
            <Authorized authority='jis_platform_dc_venue_list_colse' nomatch={noMatch()}>
              <Divider type="vertical" />
              <a onClick={() => this.handleVenueClose(record)}>闭馆信息</a>
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
      <PageHeaderWrapper>
        <Card>
          <Form style={{ marginTop: 8 }}>
            <Row>
              <Col span={6}>
                <Form.Item {...formItemLayout} label="场馆名称">
                  {form.getFieldDecorator('venuesName', {
                    initialValue:venuesNameForm!==null?venuesNameForm:"",
                    rules: [{ required: false, message: "场馆名称" }],
                  })(
                    <Input placeholder="请输入" />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item {...formItemLayout} label="运动项目">
                  {form.getFieldDecorator('itemId',{
                    initialValue:'6'
                  })(
                    <Select allowClear placeholder='请选择'>
                      <Select.Option key='6' value='6'>
                        全部
                      </Select.Option>
                      {applicableItemsList && applicableItemsList.length && applicableItemsList.map(obj => (
                        <Select.Option key={obj.id} value={obj.id}>
                          {obj.itemName}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item {...formItemLayout} label="状态">
                  {form.getFieldDecorator('state', {
                    initialValue:stateForm!==null?stateForm:"6",
                    rules: [{ required: false, message: "状态" }],
                  })(
                    <Select>
                      <Select.Option value="6" key="6">全部</Select.Option>
                      {/* 0:开,1:闭 */}
                      <Select.Option value="1" key="1">开馆</Select.Option>
                      <Select.Option value="0" key="0">闭馆</Select.Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={6} align="right">
                <Authorized authority='jis_platform_dc_venue_list_query' nomatch={noMatch()}>
                  <Button type="primary" onClick={() => this.handleSelect()}>
                    查询
                  </Button>
                </Authorized>
                <Button type="primary" onClick={() => this.handleReset()} style={{marginLeft:5}}>
                  重置
                </Button>
              </Col>
            </Row>
          </Form>
          <div style={{marginBottom:24}}>
            <Authorized authority='jis_platform_dc_venue_list_add' nomatch={noMatch()}>
              <Button type="primary" onClick={() => this.handleVenueAdd()}>
                新增
              </Button>
            </Authorized>
            <Authorized authority='jis_platform_dc_venue_list_delete' nomatch={noMatch()}>
              <Button disabled={selectedRow.length===0} onClick={() => this.handleToDelete()} style={{marginLeft:5}}>
                删除
              </Button>
            </Authorized>
          </div>
          <div className={styles.resTableVenue}>
            <Table
              rowKey={record=>record.id}
              pagination={{
                current,
                pageSize,
                defaultCurrent: 1,
                defaultPageSize: 10,
                total: queryListResult&& queryListResult.data && queryListResult.data.total,
                onChange: this.handleTableChange,
              }}
              rowSelection={rowSelection}
              columns={columns}
              dataSource={queryListResult&&queryListResult.data&&queryListResult.data.list}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PersonalCenter;
