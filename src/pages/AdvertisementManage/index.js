import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Card, Row, Col, Button, Table, Input, Modal, message, Upload, Divider } from 'antd';
import moment from 'moment';
import styles from './index.less';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import Authorized from '../../utils/Authorized';
import Ellipsis from '../../components/Ellipsis';
import { noMatch } from '../../utils/authority';

const FormItem = Form.Item;

@Form.create()
@connect(({ advertisement, loading }) => ({
  advertisement,
  loading: loading.models.reduction,
}))
class Reduction extends Component {
  state = {
    current: 1,
    pageSize: 10,
    previewVisible:false,
  };

  componentDidMount() {
    this.getTableList();
  }

  getTableList = () => {
    const {dispatch} = this.props;
    const { current, pageSize } = this.state;
    // 查询列表
    const params={
      pageNo:current,
      pageSize,
    }
    dispatch({
      type: 'advertisement/fetchQueryCard',
      payload: params,
    });
  }

  /**
   * @Description: 查询
   * @author Lin Lu
   * @date 2019/4/1
  */
  checkFormAndSubmit = () => {
    const { current, pageSize } = this.state;
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const params = {
        pageNo: current,
        pageSize,
        cardType:values.cardType===undefined || values.cardType==="全部"?null:values.cardType,
        applySportItem:values.applySportItem===undefined || values.applySportItem==="全部"?null:values.applySportItem,
        cartName:values.cartName===undefined ?null:values.cartName,
        saleStatus:values.saleStatus===undefined || values.saleStatus==="全部"?null:values.saleStatus,
      };
      dispatch({
        type: 'advertisement/fetchQueryCard',
        payload: params,
      });
    });
  };

  // 新增
  handleToAdd = () => {
    const pathname = '/Advertisement/AdvertisementList/add';
    router.push({
      pathname,
    });
  }

  // 编辑
  handleToEdit = (record) => {
    const pathname = '/Advertisement/AdvertisementList/add';
    let query = {};
    if(record) {
      query = {
        id: record.id,
      };
    }
    router.push({
      pathname,
      query,
    });
  }

  // 删除
  handleToDelete = (record) => {
    Modal.confirm({
      title: '提示',
      content: '确定删除所选项吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.executeDelete(record),
    });
  }

  executeDelete = (record) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'advertisement/fetchHandleDelete',
      payload:{ id:record.id },
    }).then(() => {
      const {
        advertisement: { code },
      } = this.props;
      if (code === 200) {
        this.setState({
          current:1,
          pageSize:10,
        },() => {
          this.getTableList();
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
        this.getTableList();
      }
    );
  };


  render() {
    const { previewVisible, previewImage,current,pageSize} = this.state;
    const { advertisement:{pageInfo} } = this.props;
    const propsUpload = {
      name: 'file',
      accept: 'image/jpg,image/jpeg,image/png,image/bmp',
      action: '/api/dcAdmin/uploadflle/upload',
      listType: "picture-card",
      headers: {
        authorization: 'authorization-text',
        product_code : 'jis-platform-venue-booking'
      }
    };
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        // width:100,
        // render:(tetx,record) => (
        //   <div><Ellipsis length={8} tooltip>{record.itemName}</Ellipsis></div>
        // )
      },
      {
        title: '图片',
        dataIndex: 'picture',
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
            <a onClick={() => this.handleToEdit(record)}>编辑</a>
            <Divider type="vertical" />
            <a onClick={() => this.handleToDelete(record)}>删除</a>
          </span>
      }
    ];
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div style={{ overflow: 'hidden',width:'100%' }}>
              <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={4}>
                  <Button
                    type="primary"
                    onClick={() => this.handleToAdd()}
                    className={styles.buttonColor}
                  >
                    新增
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
          <div className={styles.resTableVenue}>
            <Table
              loading={false}
              columns={columns}
              rowKey={record => record.id}
              dataSource={pageInfo && pageInfo.list}
              pagination={{
                current,
                pageSize,
                defaultCurrent: current,
                defaultPageSize: pageSize,
                total: pageInfo && pageInfo.total,
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
