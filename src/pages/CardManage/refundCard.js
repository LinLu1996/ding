import React, { Component,Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Card, Row, Col, Button, Table, Select,Input,message,Checkbox,InputNumber,Modal } from 'antd';
import moment from 'moment';
import styles from './index.less';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import {handleResponse} from "../../utils/globalUtils";

const FormItem = Form.Item;
const CheckboxGroup = Checkbox.Group;

@Form.create()
@connect(({ card, loading }) => ({
  card,
  loading: loading.models.reduction,
}))
class Reduction extends Component {
  action = {
    querySaleList: 'card/fetchQuerySaleList',
    getStatus: 'card/fetchGetStatus',
    getCardType: 'card/fetchGetCardType',
    toAddPage: '/card/cardList/add',
    refundCard:'card/refundcard',
    sportList:'card/fetchGetApplicableItems',
    refundSure:'card/refundsure',
  };

  state = {
    current: 1,
    pageSize: 10,
    selectedRow: [],
    checkedList: [],
    loading:false,
    cardNo: undefined,
  };

  componentDidMount() {
    this.getCardNo();
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

    // 获取适用项目
    dispatch({
      type: this.action.sportList,
    });

    const params={
      pageNo:current,
      pageSize,
    };
    dispatch({
      type: this.action.querySaleList,
      payload: params,
    }).then(()=>{
      const {card:{saleList}}=this.props;
      if(saleList && saleList.sportItem && JSON.stringify(saleList.sportItem) !== "[]") {
        const checkedList = [];
        saleList.sportItem.forEach((item) => {
          checkedList.push(parseInt(item,10));
        });
        this.setState({
          checkedList,
        })
      }
    })
  }

  getCardNo = () => {
    const { location: { query } } = this.props;
    this.setState({ cardNo: query.cardNo }, () => {
      if (query.cardNo) {
        this.handleReadCard();
      }
    });
  };

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
      };
      dispatch({
        type: this.action.querySaleList,
        payload: params,
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
  handleSelectChange = selectedRowKeys => {
    this.setState({ selectedRow: selectedRowKeys});
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
  };


  handleSubmit = () => {
    const { form, dispatch,card:{applicableItemsList} } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return ;
      }
      this.setState({
        loading:true
      });
      const params = {
        ...values,
        id :this.state.memberId,
        paymentAmount:values.refundMoney,
        cardNo:values.grantCard,
      };
      delete params.cardType;

      dispatch({
        type:this.action.refundSure,
        payload:params
      }).then(() => {
        const {
          card: { refundSureResult },
        } = this.props;
        this.setState({
          loading:false
        });
        if (handleResponse(refundSureResult, true)) {
          this.handleTolist();
        }
      })
    });
  };

  // 取消
  handleCancel = () => {
      Modal.confirm({
        title: '提示',
        content: '是否放弃退卡？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => this.handleTolist(),
      });
  };

  handleTolist = () => {
    const pathname = `/cashier/saleList/list`;
    router.push({
      pathname,
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
  };

  // 卡管理卡号读取
  handleReadCard = () => {
    const { dispatch,form } = this.props;
    // const card = form.getFieldValue('cardNo');
    form.validateFieldsAndScroll(['cardNo'], (errors, values) => {
      dispatch({
        type:this.action.refundCard,
        payload:{ cardNo: values.cardNo }
      }).then(()=>{
        const { card: {refundCardResult} }=this.props;
        this.setState({memberId:refundCardResult.data && refundCardResult.data.id})
        if(refundCardResult.data && refundCardResult.data.sportItem && JSON.stringify(refundCardResult.data.sportItem) !== "[]") {
          const checkedList = [];
          refundCardResult.data.sportItem.forEach((item) => {
            checkedList.push(parseInt(item,10));
          });
          this.setState({
            checkedList,
          })
        }
        form.setFieldsValue({ refundMoney: refundCardResult.data && refundCardResult.data.refundMoney });
      })
    })
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
  };


  render() {
    const { card: { saleList ,refundCardResult,applicableItemsList}, form: { getFieldDecorator } } = this.props;
    const { current, pageSize, selectedRow, cardNo } = this.state;

    const formItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 6 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 18 } },
    };
    const sportItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 3 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 21 } },
    };

    return (
      <PageHeaderWrapper>
        <Card bordered={false} title="会员卡退卡">
          <div className={styles.tableList}>
            <div style={{ overflow: 'hidden',width:'100%' }}>
              <Row>
                <Col span={12}>
                  <Row gutter={24}>
                    <Col span={20} style={{marginLeft:"4.3%" }}>
                      <FormItem {...formItemLayout} label='卡号'>
                        {getFieldDecorator('cardNo',{
                          rules: [
                            {
                              required: false,
                              message:'请输入卡号'
                            },
                            // {
                            //   pattern: /^[A-Za-z0-9]{0,50}$/,
                            //   message: '卡号长度为50',
                            // },
                          ],
                          initialValue: cardNo,
                        })(
                          <Input maxLength={50} onPressEnter={this.handleReadCard} placeholder='请输入卡号' />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={2} style={{paddingTop:'3px'}}>
                      <Button
                        type="primary"
                        onClick={this.handleReadCard}
                        className={styles.buttonColor}> 读取 </Button>
                    </Col>
                  </Row>
                </Col>
                <Col span={12}>
                  <FormItem
                    {...formItemLayout}
                    label='卡类型'
                  >
                    {getFieldDecorator('cardType',{
                      initialValue:refundCardResult&&refundCardResult.data&&refundCardResult.data.cardTypeValue,
                      rules: [
                        {
                          required: false,
                          message:'请查询状态'
                        },
                      ],
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <FormItem {...sportItemLayout} label='适用项目'>
                    {getFieldDecorator('applyDateType',{
                      rules: [{ required: false, message:'请选择适用日期类型' }],
                      initialValue: this.state.checkedList
                    })(
                      <Checkbox.Group disabled onChange={this.onCheckBoxChange} style={{display:'inline'}}>
                        {
                          applicableItemsList && applicableItemsList.length>0 && applicableItemsList.map((item) => (
                            <Checkbox style={{ marginLeft: 0 }} key={item.id} value={item.id}>{item.itemName}</Checkbox>
                          ))
                        }
                      </Checkbox.Group>
                    )}
                  </FormItem>
                </Col>
              </Row>
              {
                1===1 &&
                  <div>
                    <Row>
                      <Col span={12}>
                        <FormItem
                          {...formItemLayout}
                          label='姓名'
                        >
                          {getFieldDecorator('Name',{
                            initialValue:refundCardResult&&refundCardResult.data&&refundCardResult.data.memberName,
                            rules: [
                              {
                                required: false,
                                message:'请选择卡类型'
                              },
                            ],
                          })(
                            <Input disabled />)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='联系方式'>
                          {getFieldDecorator('tel',{
                            initialValue:refundCardResult&&refundCardResult.data&&refundCardResult.data.memberTel,
                            rules: [
                              {
                                required: false,
                                message:'有效日期'
                              },
                            ],
                          })(
                            <Input disabled />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12}>
                        <FormItem
                          {...formItemLayout}
                          label='发行日期'
                        >
                          {getFieldDecorator('startDate',{
                            initialValue:refundCardResult&&refundCardResult.data&&refundCardResult.data.issueDate,
                            rules: [
                              {
                                required: false,
                                message:'请选择卡类型'
                              },
                            ],
                          })(
                            <Input disabled />)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='有效日期'>
                          {getFieldDecorator('endDate',{
                            rules: [
                              {
                                required: false,
                                message:'有效日期'
                              },
                            ],
                            initialValue:refundCardResult&&refundCardResult.data&&refundCardResult.data.validDate,
                          })(
                            <Input disabled />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12}>
                        <FormItem
                          {...formItemLayout}
                          label='余额(元)'
                        >
                          {getFieldDecorator('leftMoney',{
                            rules: [
                              {
                                required: false,
                                message:'请选择卡类型'
                              },
                            ],
                            initialValue:refundCardResult&&refundCardResult.data&&refundCardResult.data.balance,
                          })(
                            <Input disabled />)}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='可退金额'>
                          {getFieldDecorator('refundMoney',{
                            rules: [
                              {
                                required: true,
                                message:'可退金额'
                              },
                            ],
                            initialValue:refundCardResult&&refundCardResult.data&&refundCardResult.data.refundMoney,
                          })(
                            <InputNumber style={{ width:"100%" }} />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='备注'>
                          {getFieldDecorator('remark',{
                            initialValue:'',
                          })(
                            <Input />
                            )}
                        </FormItem>
                      </Col>
                      <Col span={12}>
                        <FormItem {...formItemLayout} label='授权卡'>
                          {getFieldDecorator('grantCard',{
                            rules: [{ required: true, message:'请输入授权卡' }],
                            initialValue:'',
                          })(
                            <Input />
                          )}
                        </FormItem>
                      </Col>
                    </Row>
                  </div>

              }
            </div>
            <div style={{ overflow: 'hidden',width:'100%' }}>
              <Row gutter={24} style={{ marginBottom: 24 }}>
                <Col span={4} offset={10}>
                  <Button
                    htmlType="submit"
                    onClick={this.handleSubmit}
                    loading={this.state.loading}
                    className={styles.buttonColor}>确认</Button>
                  <Button
                    type="primary"
                    onClick={this.handleCancel.bind(this)}
                    className={styles.buttonColor}
                    style={{marginLeft:5}}
                  >
                    取消
                  </Button>
                </Col>
              </Row>
            </div>
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Reduction;
