import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Card, Row, Col, Button, Table, Select,Input,message, Divider, Modal } from 'antd';
import styles from './index.less';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import Ellipsis from '../../components/Ellipsis';
import Authorized from '../../utils/Authorized';
import request from '../../utils/request';
import { noMatch } from '../../utils/authority';
import { handleResponse, renderCardTypeString } from '../../utils/globalUtils';
import { handlePrintYearBracelet } from '../../utils/batchPrint';

const FormItem = Form.Item;

@connect(({ card, loading }) => ({
  card,
  loading: loading.models.card,
}))
@Form.create()
class Reduction extends Component {
  action = {
    querySaleList: 'card/fetchQuerySaleList',
    getStatus: 'card/fetchGetStatus',
    getCardType: 'card/fetchGetCardType',
    toAddPage: '/card/cardList/add',
    lossCard:'card/losscard',
    noLossCard:'card/nolosscard',
    printBracelet:'card/printbracelet',
  };


  state = {
    current: 1,
    pageSize: 10,
    selectedRow: [],
  };

  componentDidMount() {
    const {current,pageSize} = this.state;
    const {dispatch} = this.props;
    // 获取状态
    dispatch({
      type: this.action.getStatus,
      payload:{ type:8 }
    });

    // 获取卡类型
    dispatch({
      type: this.action.getCardType,
      payload:{ type:11 }
    });

    const params={
      pageNo:current,
      pageSize,
    }
    dispatch({
      type: this.action.querySaleList,
      payload: params,
    });
  }

  /**
   * @Description: 门票管理列表查询
   * @author Lin Lu
   * @date 2018/12/13
   */
  handleSearch = e => {
    e.preventDefault();
    this.checkFormAndSubmit();
  };

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

  /**
   * @Description: 查询
   * @author Lin Lu
   * @date 2019/1/2
   */
  checkFormAndSubmit = () => {
    const { current, pageSize } = this.state;
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const params = {
        pageNo: current,
        pageSize,
        cardNo:values.cardNo===undefined || values.cardNo==="全部"?null:values.cardNo,
        cardType:values.cardType===undefined || values.cardType==="全部"?null:values.cardType,
        cardStatus:values.cardStatus===undefined || values.cardStatus==="全部"?null:values.cardStatus,
        memberName:values.memberName===undefined ?null:values.memberName,
        memberTel:values.memberTel===undefined ?null:values.memberTel,
        certificateNo:values.IdentificationNo===undefined ?null:values.IdentificationNo,
        wristStrapNo:values.BraceletNo===undefined ?null:values.BraceletNo,
      };
      this.setState({
        selectedRow:[]
      },() => {
        dispatch({
          type: this.action.querySaleList,
          payload: params,
        });
      });
    });
  };

  // 重置
  handleReset = () => {
    const { form,dispatch } = this.props;
    form.resetFields();
    const params={
      pageNo:1,
      pageSize:10,
    }
    dispatch({
      type: this.action.querySaleList,
      payload: params,
    });
  }

  /**
   * @Description: 列表项选中取消
   * @author Lin Lu
   * @date 2018/12/14
   */
  handleSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRow:selectedRowKeys});
  };

  // 编辑
  handleTicketEidt = (record) =>{
    const pathname = '/card/cardList/edit';
    const query = {
      id: record.id,
    };
    router.push({
      pathname,
      query,
    });
  }

  // 销售管理开卡
  handleActivateCard = (record) => {
    const pathname = '/cashier/saleList/activateCard';
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

  // 销售管理储值卡
  handleRechargeCard = () => {
    const { selectedRow } = this.state;
    const { card:{ saleList } } = this.props;
    if (JSON.stringify(selectedRow) === '[]') {
      message.warning('请选择一条数据');
      return;
    }
    if (selectedRow.length>1) {
      message.warning('只能选择一条数据');
      return;
    }
    const currentData = saleList && saleList.list.filter((item) => item.id===selectedRow[0])[0];
    const pathname = '/cashier/saleList/rechargeCard';
    let query = {};
    if(selectedRow) {
       query = {
         cardNo: currentData && currentData.cardNo,
      };
    }
    router.push({
      pathname,
      query,
    });
  }

  // 销售管理会员补换卡
  handleReplacement = () => {
    const { selectedRow } = this.state;
    const { card:{ saleList } } = this.props;
    if (JSON.stringify(selectedRow) === '[]') {
      message.warning('请选择一条数据');
      return;
    }
    if (selectedRow.length>1) {
      message.warning('只能选择一条数据');
      return;
    }
    const currentData = saleList && saleList.list.filter((item) => item.id===selectedRow[0])[0];
    if (currentData.cardStatus === 1) {
      message.warning('不能补换未销售的卡');
      return;
    }
    const pathname = '/cashier/saleList/replacement';
    let query = {};
    if(selectedRow) {
      query = {
        cardNo: currentData && currentData.cardNo,
      };
    }
    router.push({
      pathname,
      query,
    });
  }

// 销售管理会员交易记录
  handleTransaction = () => {
    const { selectedRow } = this.state;
    const { card:{ saleList } } = this.props;
    if (JSON.stringify(selectedRow) === '[]') {
      message.warning('请选择一条数据');
      return;
    }
    if (selectedRow.length>1) {
      message.warning('只能选择一条数据');
      return;
    }
    const currentData = saleList && saleList.list.filter((item) => item.id===selectedRow[0])[0];
    let query = {};
    if(selectedRow) {
      query = {
        id: currentData && currentData.id,
      };
    }
    const pathname = '/cashier/saleList/transaction';
    router.push({
      pathname,
      query,
    });
  }


  // 退卡
  handleToRefund = () => {
    const { card:{ saleList } } = this.props;
    const { selectedRow } = this.state;
    if (selectedRow.length>1) {
      message.warning('只能选择一条数据');
      return;
    }
    const pathname = '/cashier/saleList/refund';
    let object;
    if (selectedRow.length === 1) {
      object = saleList.list.filter(item => item.id === selectedRow[0])[0];
      if (object.cardStatus !== 2) {
        message.warning('只能对已销售的卡进行退卡');
        return;
      }
    }
    router.push({
      pathname,
      query: {
        cardNo: object ? object.cardNo : undefined,
      },
    });
  };

  handleLossCard = () => {
    const { selectedRow,current,pageSize } = this.state;
    const { dispatch, card:{ saleList } } = this.props;
    if (JSON.stringify(selectedRow) === '[]') {
      message.warning('请选择一条数据');
      return;
    }
    let flag = true;
    saleList.list.forEach(item => {
      selectedRow.forEach(row => {
        if (item.id === row && item.cardStatus === 1) {
          flag = false;
        }
      });
    });
    if (!flag) {
      message.warning('不能挂失未销售的卡');
      return;
    }
    const param={
      ids:selectedRow,
    };
    dispatch({
      type: this.action.lossCard,
      payload: param,
    }).then(()=>{
      const { card: { lossCardResult } }=this.props;
      if (handleResponse(lossCardResult)) {
        message.success("挂失成功!");
        const params={
          pageNo:current,
          pageSize,
        }
        dispatch({
          type: this.action.querySaleList,
          payload: params,
        });
      }
    })

  };

  handlePrinting=(record)=>{
    const {dispatch}=this.props;
    const params={
      cardNo :record.cardNo,
    };
    dispatch({
      type: this.action.printBracelet,
      payload: params,
    });
  }

  redirectToEdit = (record) => {
    const pathname = '/cashier/saleList/edit';
    router.push({
      pathname,
      query: { id: record.id },
    });
  };


  handleToDetail=(record)=>{
    const pathname = `/cashier/saleList/detail`;
    const query = {
      id:record.id,
    };
    router.push({
      pathname,
      query,
    });

  };

  redirectToReplaceBracelet = (record) => {
    const pathname = '/cashier/saleList/replaceBracelet';
    router.push({
      pathname,
      query: { id: record.id },
    });
  };

  handleNoLossCard = () => {
    const { selectedRow,current,pageSize } = this.state;
    const { dispatch, card:{ saleList } } = this.props;
    if (JSON.stringify(selectedRow) === '[]') {
      message.warning('请选择一条数据');
      return;
    }
    let flag = true;
    saleList.list.forEach(item => {
      selectedRow.forEach(row => {
        if (item.id === row && item.cardStatus !== 5) {
          flag = false;
        }
      });
    });
    if (!flag) {
      message.warning('不能解挂未挂失的卡');
      return;
    }
    const param={
      ids:selectedRow,
    };
    dispatch({
      type: this.action.noLossCard,
      payload: param,
    }).then(()=>{
      const { card: { noLossCardResult } }=this.props;
      if (handleResponse(noLossCardResult)) {
        message.success("解挂成功!");
        const params={
          pageNo:current,
          pageSize,
        }
        dispatch({
          type: this.action.querySaleList,
          payload: params,
        });
      }
    })
  };


  // 表单
  renderSearchForm() {
    const {
      form: { getFieldDecorator },
      card:{statusList,cardTypeList},
    } = this.props;
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
    return (
      <div className={styles.tableList}>
        <div>
          <Form className={styles.reductionFrom} layout="inline">
            <Row gutter={24}>
              <Col span={8}>
                <FormItem label='卡号' {...formItemLayout}>
                  {getFieldDecorator('cardNo')(
                    <Input placeholder='请输入卡号' />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label='手环' {...formItemLayout}>
                  {getFieldDecorator('BraceletNo')(
                    <Input placeholder='请输入手环号' />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label='卡类型'
                  {...formItemLayout}
                >
                  {getFieldDecorator('cardType',{
                    initialValue:'全部'
                  })(
                    <Select allowClear placeholder='请选择'>
                      <Select.Option key='全部' value='全部'>
                        全部
                      </Select.Option>
                      {cardTypeList && cardTypeList.length && cardTypeList.map(obj => (
                        <Select.Option key={obj.id} value={obj.code}>
                          {obj.value}
                        </Select.Option>
                      ))}
                    </Select>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem
                  label='姓名'
                  {...formItemLayout}
                >
                  {getFieldDecorator('memberName',{
                    initialValue: ''
                  })(<Input placeholder='请输入姓名' />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label='联系方式'
                  {...formItemLayout}
                >
                  {getFieldDecorator('memberTel',{
                    initialValue: ''
                  })(<Input placeholder='请输入联系方式' />)}
                </FormItem>
              </Col>
              <Col span={4} offset={4} style={{textAlign:'right'}}>
                <Authorized authority='jis_platform_dc_card_sale_query' nomatch={noMatch()}>
                  <Button
                    htmlType='submit'
                    onClick={this.handleSearch}
                    className={styles.buttonColor}>查询</Button>
                </Authorized>
                <Button
                  type="primary"
                  onClick={this.handleReset}
                  className={styles.buttonColor}
                  style={{marginLeft:5}}
                >
                  重置
                </Button>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem label='证件号码' {...formItemLayout}>
                  {getFieldDecorator('IdentificationNo')(
                    <Input placeholder='请输入证件号码' />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label='状态'
                  {...formItemLayout}
                >
                  {getFieldDecorator('cardStatus',{
                    initialValue:'全部'
                  })(
                    <Select allowClear placeholder='请选择'>
                      <Select.Option key='全部' value='全部'>
                        全部
                      </Select.Option>
                      {statusList && statusList.length && statusList.map(obj => (
                        <Select.Option key={obj.id} value={obj.code}>
                          {obj.value}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }

  confirmPrintBracelet = (msg, cardNo) => {
    Modal.confirm({
      title: '确认打印',
      content: msg,
      okText: "确定",
      cancelText: "取消",
      onOk: () => handlePrintYearBracelet(cardNo),
    });
  };

  /**
   * 打印手环前检查手环已打印次数
   */
  checkPrintBraceletNum = (cardNo) => {
    request(`/venuebooking/cardBasic/findPrintWristNum?cardNo=${cardNo}`)
      .then(response => {
        if (handleResponse(response)) {
          if (response.msg) {
            this.confirmPrintBracelet(response.msg, cardNo);
          } else {
            handlePrintYearBracelet(cardNo);
          }
        }
      });
  };

  render() {
    const { current, pageSize, selectedRow } = this.state;
    const { card: { saleList } } = this.props;
    let currentData = {};
    if(selectedRow.length>0) {
      currentData = saleList.list.filter(item => item.id === selectedRow[0])[0];
    }
    const columns = [
      { title: '卡号', dataIndex: 'cardNo', render:(text) => <Ellipsis length={15} tooltip>{text}</Ellipsis> },
      // {
      //   title: '导入日期',
      //   dataIndex: 'createDate',
      //   render:(text) => (
      //     <div>{text}</div>
      //   )
      // },
      {
        title: '卡类型',
        dataIndex: 'cardType',
        render: val => renderCardTypeString(val),
      },
      { title: "卡名称", dataIndex: "cartName", render: val => <Ellipsis tooltip length={8}>{val}</Ellipsis> },
      { title: '姓名', dataIndex: 'memberName' },
      { title: '联系方式', dataIndex: 'memberTel' },
      // { title: '发行日期', dataIndex: 'issueDate' },
      // { title: '有效期限', dataIndex: 'validDate' },
      { title: '余额(元)', dataIndex: 'balance', render: (text, record) => record.cardType === 2 ? text : "-" },
      // { title: '押金(元)', dataIndex: 'cardDeposit' },
      // { title: '状态', dataIndex: 'cardStatusName' },
      {
        width: 260,
        title:"操作",
        key:"action",
        dataIndex: 'action',
        // 打印手环:onClick={() => this.handlePrinting(record)}
        render: (text, record) =>
          <span>
            <Authorized authority='jis_platform_dc_card_sale_edit' nomatch={noMatch()}>
              <a onClick={() => this.redirectToEdit(record)}>编辑</a>
            </Authorized>
            <Divider type='vertical' />
            <Authorized authority='jis_platform_dc_card_sale_detail' nomatch={noMatch()}>
              <a onClick={() => this.handleToDetail(record)}>详情</a>
            </Authorized>
            <Divider type='vertical' />
            <Authorized authority='jis_platform_dc_card_sale_print' nomatch={noMatch()}>
              <a disabled={record && record.cardType!==1} onClick={() => this.redirectToReplaceBracelet(record)}>更换手环</a>
            </Authorized>
            <Divider type='vertical' />
            <Authorized authority='jis_platform_dc_card_sale_print' nomatch={noMatch()}>
              <a disabled={record && record.cardType !== 1} onClick={() => this.checkPrintBraceletNum(record.cardNo)}>打印手环</a>
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
            <div className={styles.tableListForm}>{this.renderSearchForm()}</div>
            <div style={{ overflow: 'hidden',width:'100%' }}>
              <Row gutter={24} style={{ marginBottom: 24 }}>
                {/*<Col span={2}>*/}
                {/*<Button type="primary" className={styles.buttonColor}>导入</Button>*/}
                {/*</Col>*/}
                {/*<Col span={2}>*/}
                {/*<Button type="primary" className={styles.buttonColor}>模板下载</Button>*/}
                {/*</Col>*/}
                <Col span={24}>
                  <Authorized authority='jis_platform_dc_card_sale_new' nomatch={noMatch()}>
                    <Button
                      disabled={selectedRow.length > 0}
                      className={styles.buttonColor}
                      type="primary"
                      onClick={this.handleActivateCard}
                    >
                      开卡
                    </Button>
                  </Authorized>
                  <Authorized authority='jis_platform_dc_card_sale_replace' nomatch={noMatch()}>
                    <Button
                      type="primary"
                      className={styles.buttonColor}
                      disabled={selectedRow.length === 0 || currentData.cardType!==1 || currentData.cardStatus===3 || currentData.cardStatus===4 || currentData.cardStatus===6}
                      onClick={this.handleReplacement}
                      style={{marginLeft:5}}
                    >
                      补换卡
                    </Button>
                  </Authorized>
                  <Authorized authority='jis_platform_dc_card_sale_recharge' nomatch={noMatch()}>
                    <Button
                      type="primary"
                      className={styles.buttonColor}
                      disabled={selectedRow.length===0 || currentData.cardType===3 || currentData.cardType===1 || currentData.cardStatus===3 || currentData.cardStatus===4 || currentData.cardStatus===6}
                      onClick={this.handleRechargeCard}
                      style={{marginLeft:5}}
                    >
                      充值
                    </Button>
                  </Authorized>
                  <Authorized authority='jis_platform_dc_card_sale_record' nomatch={noMatch()}>
                    <Button
                      type="primary"
                      className={styles.buttonColor}
                      disabled={selectedRow.length===0}
                      onClick={this.handleTransaction}
                      style={{marginLeft:5}}
                    >
                      交易记录
                    </Button>
                  </Authorized>
                  <Authorized authority='jis_platform_dc_card_sale_loss' nomatch={noMatch()}>
                    <Button
                      type="primary"
                      onClick={this.handleLossCard}
                      disabled={selectedRow.length===0 || currentData.cardStatus===3 || currentData.cardStatus===4 || currentData.cardStatus===6}
                      className={styles.buttonColor}
                      style={{marginLeft:5}}
                    >
                      挂失
                    </Button>
                  </Authorized>
                  <Authorized authority='jis_platform_dc_card_sale_retrieve' nomatch={noMatch()}>
                    <Button
                      type="primary"
                      onClick={this.handleNoLossCard}
                      disabled={selectedRow.length===0 || currentData.cardStatus===3 || currentData.cardStatus===4 || currentData.cardStatus===6}
                      className={styles.buttonColor}
                      style={{marginLeft:5}}
                    >
                      解挂
                    </Button>
                  </Authorized>
                  <Authorized authority='jis_platform_dc_card_sale_refund' nomatch={noMatch()}>
                    <Button
                      type="primary"
                      disabled={selectedRow.length===0 || currentData.cardStatus===3 || currentData.cardStatus===4 || currentData.cardStatus===6}
                      onClick={this.handleToRefund}
                      className={styles.buttonColor}
                      style={{marginLeft:5}}
                    >
                      退卡
                    </Button>
                  </Authorized>
                </Col>
              </Row>
            </div>
          </div>
          <div>
            <Table
              loading={false}
              columns={columns}
              rowSelection={rowSelection}
              rowKey={record => record.id}
              dataSource={saleList && saleList.list}
              pagination={{
                current,
                pageSize,
                defaultCurrent: current,
                defaultPageSize: pageSize,
                total: saleList && saleList.total,
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
