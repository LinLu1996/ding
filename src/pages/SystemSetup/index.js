import React, { Component,Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Card, Row, Col, Button, Table,Input,Modal,message,Switch,Upload } from 'antd';
import moment from 'moment';
import styles from './index.less';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import Authorized from '../../utils/Authorized';
import Ellipsis from '../../components/Ellipsis';
import { noMatch } from '../../utils/authority';

const FormItem = Form.Item;

@Form.create()
@connect(({ systemSet, loading }) => ({
  systemSet,
  loading: loading.models.reduction,
}))
class Reduction extends Component {
  action = {
    queryList: 'systemSet/fetchQuerySystem',
    handleDelete: 'systemSet/fetchHandleDelete',
    changeStatus: 'systemSet/fetchChangeStatus',
  };


  state = {
    current: 1,
    pageSize: 10,
    dataList:{},
    selectedRow: [],
    previewVisible:false,
    previewImage:{}
  };

  componentDidMount() {
   this.checkFormAndSubmit();
  }


  /**
   * @Description: 查询
   * @author Lin Lu
   * @date 2019/1/2
   */
  checkFormAndSubmit = () => {
    const {dispatch} = this.props;
    const {current,pageSize} = this.state;
    dispatch({
      type: this.action.queryList,
      payload: {orderType : "1,2",pageNo:current, pageSize},
    }).then(() => {
      const { systemSet:{pageInfo} } = this.props;
      if(pageInfo) {
        this.setState({
          dataList:pageInfo
        })
      }
    });
  };

  /**
   * @Description: 列表项选中取消
   * @author Lin Lu
   * @date 2018/12/14
   */
  handleSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRow:selectedRowKeys});
  };


  // 新增
  handleToAdd = () => {
    const pathname = '/systemSet/systemSetList/add';
    const query = {
      enterpriseId: 1,
    };
    router.push({
      pathname,
      query,
    });
  }

  // 编辑
  handleToEdit = (record) => {
    const pathname = '/systemSet/systemSetList/edit';
    let query = {};
    if(record) {
       query = {
        id: record.id,
         enterpriseId: 1,
      };
    }
    router.push({
      pathname,
      query,
    });
  }

  // 删除
  handleToDelete = () => {
    Modal.confirm({
      title: '提示',
      content: '确定删除所选项吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.executeDelete(),
    });
  }

  executeDelete = () => {
    const { selectedRow } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: this.action.handleDelete,
      payload:selectedRow,
    }).then(() => {
      const {
        systemSet: { code },
      } = this.props;
      if (code === 200) {
        this.setState({
          current:1,
          pageSize:10,
          selectedRow:[],
        },() => {
          this.checkFormAndSubmit();
        })
      }
    })
  }

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

  // 分页
  handleTableChange = (current, pageSize) => {
    this.setState(
      {
        current,
        pageSize,
      },
      () => {
        this.checkFormAndSubmit();
      }
    );
  };

  // 改变状态
  handleStatus = (record) => {
    const { dispatch } = this.props;
    let status = '';
    status = record.status===1?2:1;
    dispatch({
      type: this.action.changeStatus,
      payload: { id: record.id, status}
    }).then(() => {
      const { systemSet:{code} } = this.props;
      if(code===200) {
        this.checkFormAndSubmit();
      }
    })
  }

  render() {
    const { selectedRow,previewVisible, previewImage,dataList,current,pageSize} = this.state;
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
      {
        title: '项目名称',
        dataIndex: 'itemName',
        width:100,
        render:(tetx,record) => (
          <div><Ellipsis length={8} tooltip>{record.itemName}</Ellipsis></div>
        )
      },
      {
        title: '营业时间',
        dataIndex: 'cartName',
        width:100,
        render:(tetx,record) => (
          <div>{record.businessTimeStart && record.businessTimeEnd && `${record.businessTimeStart.substring(0,5)}-${record.businessTimeEnd.substring(0,5)}`}</div>
        )
      },
      {
        title: '销售时间单位（分钟）',
        dataIndex: 'saleUnit',
        width:150,
      },
      {
        title: '提前预定天数',
        dataIndex: 'bookDays',
        width:100,
      },
      {
        title: '超时计费单位(分钟)',
        dataIndex: 'timeoutBillingUnit',
        width:150,
      },
      {
        title: '项目状态',
        dataIndex: 'status',
        width:100,
        render:(text,record) => (
          <span>
            <Authorized authority='jis_platform_dc_system_list_enable' nomatch={noMatch()}>
              <div onClick={this.handleStatus.bind(this,record)} style={{color:'blue',cursor:'pointer'}}>{text && text===1?'启用':'停用'}</div>
            </Authorized>
          </span>
        )

      },
      {
        title: '项目图片',
        dataIndex: 'picture',
        width:150,
        render:(text) => {
          if(text) {
            const cuList = {};
            cuList.uid = 1;
            cuList.url = text;
            return <div className={styles.imgList}>
              <Upload {...propsUpload} fileList={[cuList]} showUploadList={{showPreviewIcon : true, showRemoveIcon: false}} onPreview={this.handlePicturePreview} />
              <Modal visible={previewVisible} footer={null} onCancel={this.handlePictureCancel}>
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
              </Modal>
            </div>;
          }
        }
      },
      {
        title:"操作",
        key:"action",
        dataIndex: 'action',
        width:100,
        render: (text, record) =>
          <span>
            <Authorized authority='jis_platform_dc_system_list_edit' nomatch={noMatch()}>
              <a onClick={() => this.handleToEdit(record)}>编辑</a>
            </Authorized>
          </span>
      }
    ];
    const rowSelection = {
      selectedRowKeys: selectedRow,
      onChange: this.handleSelectChange,
    };
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div style={{ overflow: 'hidden',width:'100%' }}>
              <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={4}>
                  <Authorized authority='jis_platform_dc_system_list_add' nomatch={noMatch()}>
                    <Button
                      type="primary"
                      onClick={() => this.handleToAdd()}
                      className={styles.buttonColor}>新增</Button>
                  </Authorized>
                  <Authorized authority='jis_platform_dc_system_list_delete' nomatch={noMatch()}>
                    <Button
                      disabled={selectedRow.length===0}
                      type="primary"
                      onClick={this.handleToDelete}
                      className={styles.buttonColor}
                      style={{marginLeft:5}}
                    >
                      删除
                    </Button>
                  </Authorized>
                </Col>
              </Row>
            </div>
          </div>
          <div className={styles.resTableVenue}>
            <Table
              loading={false}
              columns={columns}
              rowSelection={rowSelection}
              rowKey={record => record.id}
              dataSource={dataList && dataList.list}
              scroll={{x:1100}}
              pagination={{
                current,
                pageSize,
                defaultCurrent: current,
                defaultPageSize: pageSize,
                total: dataList && dataList.total,
                onChange: this.handleTableChange,
              }}
            />
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Reduction;
