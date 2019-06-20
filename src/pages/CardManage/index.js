import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Card, Row, Col, Button, Table, Select,Input,Modal,message,Divider } from 'antd';
import styles from './index.less';
import Ellipsis from '../../components/Ellipsis';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import Authorized from '../../utils/Authorized';
import { noMatch } from '../../utils/authority';

const FormItem = Form.Item;

@Form.create()
@connect(({ card, loading }) => ({
  card,
  loading: loading.models.reduction,
}))
class Reduction extends Component {
  action = {
    queryList: 'card/fetchQueryCard',
    getApplicableItems: 'card/fetchGetApplicableItems',
    getUpperList: 'card/fetchGetUpperList',
    getCourtName: 'card/fetchGetCourtName',
    getCardType: 'card/fetchGetCardType',
    handleDelete: 'card/fetchHandleDelete',
    handleUp: 'card/fetchHandleUp',
    toAddPage: '/card/cardList/add',
    printBracelet:'card/printbracelet',
  };


  state = {
    current: 1,
    pageSize: 10,
    selectedRow: [],
    loading1:false,
    loading2:false,
  };

  componentDidMount() {
    const {current,pageSize} = this.state;
    const {dispatch} = this.props;
    // 获取卡类型
    dispatch({
      type: this.action.getCardType,
      payload:{ type:11 }
    });
    // 获取上下架下拉列表
    dispatch({
      type: this.action.getUpperList,
    });
    // 获取适用项目
    dispatch({
      type: this.action.getApplicableItems,
    });

    const params={
      pageNo:current,
      pageSize,
    }
    dispatch({
      type: this.action.queryList,
      payload: params,
    });
  }

  onCheckBoxChange = (checkedList) => {
    this.setState({
      checkedList,
    });
  }

  // 全选
  onCheckAllChange = (e) => {
    this.setState({
      checkedList: e.target.checked ? [1,2,3,4,5,6,7,8] : [],
      checkAll: e.target.checked,
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
        selectedRow: [],
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
        cardType:values.cardType===undefined || values.cardType==="全部"?null:values.cardType,
        applySportItem:values.applySportItem===undefined || values.applySportItem==="全部"?null:values.applySportItem,
        cartName:values.cartName===undefined ?null:values.cartName,
        saleStatus:values.saleStatus===undefined || values.saleStatus==="全部"?null:values.saleStatus,
      };
      dispatch({
        type: this.action.queryList,
        payload: params,
      });
    });
  };

  /**
   * @Description: 列表项选中取消
   * @author Lin Lu
   * @date 2018/12/14
   */人
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

  // 新增
  handleToAdd = (record) => {
    const pathname = '/card/cardList/add';
    let query = {};
    if(record){
       query = {
        id: record.id,
      };
    }
    router.push({
      pathname,
      query,
    });
  }

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

  // 删除
  handleToDelete = () => {
    const { selectedRow } = this.state;
    Modal.confirm({
      title: '提示',
      content: '是否确定要删除？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => this.executeDelete(),
    });
  }



  executeDelete = () => {
    const { selectedRow } = this.state;
    const { dispatch } = this.props;
    this.setState({
      current:1,
      pageSize:10
    },() => {
      dispatch({
        type: this.action.handleDelete,
        payload:{ids:selectedRow,isDelete:1},
      }).then(() => {
        const {
          card: { code },
        } = this.props;
        if (code === 200) {
          this.setState({
            selectedRow: [],
          });
          message.success('删除成功');
          this.checkFormAndSubmit();
        }
      })
    })
  }

  // 上下架
  handleToUp = (num) => {
    const { selectedRow } = this.state;
    const { card:{pageInfo} } = this.props;
    if(num===1) {
      this.setState({
        loading1: true,
      },() => {
        if(this.state.loading1) {
          for(let i=0; i<selectedRow.length; i++) {
            const currentData = pageInfo && pageInfo.list.filter((item) => item.id===selectedRow[i])[0];
            if(currentData && currentData.saleStatus===1) {
              message.warning('选中项已上架过，不能再继续上架');
              this.setState({
                loading1: false,
              })
              return;
            }
          }
          this.handleTopUp(num);
        }
      })
    } else if(num===0) {
      this.setState({
        loading2: true,
      },() => {
          if (this.state.loading2) {
            for (let i = 0; i < selectedRow.length; i++) {
              const currentData = pageInfo && pageInfo.list.filter((item) => item.id === selectedRow[i])[0];
              if (currentData.saleStatus === 0) {
                message.warning('选中项已下架过，不能再继续下架');
                this.setState({
                  loading2: false,
                })
                return;
              }
            }
            this.handleTopUp(num);
          }
        }
      )
    }
  }

  handleTopUp = (num) => {
    const {dispatch} = this.props;
    const { selectedRow } = this.state;
    const params = {
      ids:selectedRow,
      saleStatus:num===1?1:0,
    };
    this.setState({
      current:1,
      pageSize:10,
    },() => {
      dispatch({
        type: this.action.handleUp,
        payload:params,
      }).then(() => {
        const {
          card: { code },
        } = this.props;
        if (code === 200) {
          this.setState({
            loading1: false,
            loading2: false,
          })
          message.success('成功');
          this.checkFormAndSubmit();
        }
      })
    })
  }

  // 重置
  handleReset = () => {
    const { form,dispatch } = this.props;
    form.resetFields();
    this.setState({
      selectedRow:[]
    });
    const params={
      pageNo:1,
      pageSize:10,
    }
    dispatch({
      type: this.action.queryList,
      payload: params,
    });
  }

  // 表单
  renderSearchForm() {
    const {
      form: { getFieldDecorator },
      card:{applicableItemsList,cardTypeList,upperList},
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
                        <Select.Option key={obj.code} value={obj.code}>
                          {obj.value}
                        </Select.Option>
                      ))}
                    </Select>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label='适用项目'
                  {...formItemLayout}
                >
                  {getFieldDecorator('applySportItem',{
                    initialValue:'全部'
                  })(
                    <Select allowClear placeholder='请选择'>
                      <Select.Option key='全部' value='全部'>
                        全部
                      </Select.Option>
                      {applicableItemsList && applicableItemsList.length && applicableItemsList.map(obj => (
                        <Select.Option key={obj.id} value={obj.id}>
                          {obj.itemName}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label='卡名称' {...formItemLayout}>
                  {getFieldDecorator('cartName')(
                    <Input placeholder='请输入卡名称' />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem
                  label='上下架'
                  {...formItemLayout}
                >
                  {getFieldDecorator('saleStatus',{
                    initialValue: '全部'
                  })(<Select allowClear placeholder='请选择'>
                    <Select.Option key='全部' value='全部'>
                      全部
                    </Select.Option>
                    {upperList && upperList.length && upperList.map(obj => (
                      <Select.Option key={obj.code} value={obj.code}>
                        {obj.value}
                      </Select.Option>
                    ))}
                  </Select>)}
                </FormItem>
              </Col>
              <Col span={12} />
              <Col span={4} style={{textAlign:'right'}}>
                <Authorized authority='jis_platform_dc_card_list_query' nomatch={noMatch()}>
                  <Button htmlType='submit' onClick={this.handleSearch} className={styles.buttonColor}>查询</Button>
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
          </Form>
        </div>
      </div>
    );
  }


  render() {
    const { current, pageSize, selectedRow } = this.state;
    const { card: { pageInfo } } = this.props;
    const columns = [
      // {
      //   title: '卡类型',
      //   dataIndex: 'cardType',
      //   render: (text) => (
      //     <div>{text && text===1? '年卡':'储值卡'}</div>
      //   )
      // },
      {
        title: '卡名称',
        dataIndex: 'cartName',
        // render:(text) => (
        //   <div><Ellipsis length={8} tooltip>{text}</Ellipsis></div>
        // )
      },
      {
        width: 160,
        title: '适用项目',
        dataIndex: 'applySportItemName',
        render: (text) => <Ellipsis length={8} tooltip>{text}</Ellipsis>,
      },
      {
        width: 120,
        title: '票面价格(元)',
        dataIndex: 'cardViewPrice',
      },
      {
        width: 120,
        title: '销售价格(元)',
        dataIndex: 'cardSalePrice',
      },
      {
        width: 80,
        title: '上下架',
        dataIndex: 'saleStatus',
        render: (text) => <div>{ text && text===1 ? '上架' : '下架' }</div>,
      },
      {
        width: 80,
        title:"操作",
        key:"action",
        dataIndex: 'action',
        render: (text, record) =>
          <span>
            <Authorized authority='jis_platform_dc_card_list_edit' nomatch={noMatch()}>
              <a disabled={record.saleStatus === 1} onClick={() => this.handleToAdd(record)}>编辑</a>
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
                <Col span={24}>
                  <Authorized authority='jis_platform_dc_card_list_add' nomatch={noMatch()}>
                    <Button
                      type="primary"
                      onClick={() => this.handleToAdd()}
                      className={styles.buttonColor}>新增</Button>
                  </Authorized>
                  <Authorized authority='jis_platform_dc_card_list_up' nomatch={noMatch()}>
                    <Button
                      disabled={selectedRow.length===0}
                      type="primary"
                      loading={this.state.loading1}
                      onClick={() => this.handleToUp(1)}
                      className={styles.buttonColor}
                      style={{marginLeft:5}}
                    >
                      上架
                    </Button>
                  </Authorized>
                  <Authorized authority='jis_platform_dc_card_list_down' nomatch={noMatch()}>
                    <Button
                      disabled={selectedRow.length===0}
                      type="primary"
                      loading={this.state.loading2}
                      onClick={() => this.handleToUp(0)}
                      className={styles.buttonColor}
                      style={{marginLeft:5}}
                    >
                      下架
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
