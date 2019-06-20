import React, { Component,Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Card, Row, Col, Button, Table, Select,Input,Checkbox,Modal,message,  Divider, } from 'antd';
import moment from 'moment';
import styles from './index.less';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import Ellipsis from '../../components/Ellipsis';
import Authorized from '../../utils/Authorized';
import { noMatch } from '../../utils/authority';

const FormItem = Form.Item;

@Form.create()
@connect(({ ticket,card, loading }) => ({
  ticket,card,
  loading: loading.models.reduction,
}))
class Reduction extends Component {
  action = {
    queryList: 'ticket/fetchQueryTicket',
    getSprotName: 'ticket/fetchGetSprotName',
    getCourtName: 'ticket/fetchGetCourtName',
    getDateType: 'ticket/fetchGetDateType',
    getUpperList: 'ticket/fetchGetUpperList',
    handleDelete: 'ticket/fetchHandleDelete',
    handleUp: 'ticket/fetchHandleUp',
    toAddPage: '/ticket/ticketList/add',
    setSearch: 'ticket/fetchSetSearch',
  };


  state = {
    current:1,
    pageSize:10,
    selectedRow: [],
    checkedList:[],
    checkAll: false,
    loading1: false,
    loading2: false,
    codeList:[] // 适用日期类型code集合
  };

  componentDidMount() {
    const {dispatch,ticket:{sportItemId, applyCourt, ticketName, saleStatus}} = this.props;
    const { current,pageSize } = this.state;
    // 获取项目类型
    dispatch({
      type: this.action.getSprotName,
    });

    // 获取场地下拉列表
    dispatch({
      type: this.action.getCourtName,
    });

    // 获取适用日期类型
    dispatch({
      type:this.action.getDateType,
      payload:{ type:2 },
    }).then(() => {
      const { ticket:{dateTypeList} } = this.props;
      if(dateTypeList && dateTypeList.length>0) {
        const codeList = [];
        dateTypeList.forEach(item => {
          codeList.push(parseInt(item.code));
        })
        this.setState({
          codeList,
        })
      }
    })

    // 获取上下架下拉列表
    dispatch({
      type: this.action.getUpperList,
    });
    // 获取列表
    const params = {
      pageNo:current,
      pageSize,
    };
    dispatch({
      type: this.action.queryList,
      payload: params,
    });
  }

  onCheckBoxChange = (checkedList) => {
    const { codeList } = this.state;
    let flag = false;
    if(checkedList.length===codeList.length) {
      flag = true;
    }
    this.setState({
      checkedList,
      checkAll:flag
    });
  }

  // 全选
  onCheckAllChange = (e) => {
    const { codeList } = this.state;
    this.setState({
      checkedList: e.target.checked ? codeList : [],
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
    const { current, pageSize,checkedList } = this.state;
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const dateAll = [1,2,3,4,5,6,7,8];
      const params = {
        pageNo: current,
        pageSize,
        sportItemId:values.sportItemId===undefined || values.sportItemId==="全部"?null:values.sportItemId,
        applyCourt:values.applyCourt===undefined || values.applyCourt==="全部"?null:values.applyCourt,
        ticketName:values.ticketName===undefined ?null:values.ticketName,
        dateType:values.applyDateType===0 ?dateAll:checkedList,
        saleStatus:values.saleStatus===undefined || values.saleStatus==="全部"?null:values.saleStatus,
      };
      dispatch({
        type: this.action.queryList,
        payload: params,
      });
    });
  };

  // 重置
  handleReset = () => {
    const { form,dispatch } = this.props;
    this.setState({
      selectedRow:[],
      checkedList:[],
      checkAll:false,
    })
    form.resetFields();
    const params={
      pageNo:1,
      pageSize:10,
    }
    dispatch({
      type: this.action.queryList,
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

  // 获取适用场地
  getApplyCourt = (e) => {
    const {dispatch, form} = this.props;
    dispatch({
      type:this.action.getCourtName,
      payload:{ sportItemId:e==='全部'? null: e }
    })
    form.setFieldsValue({
      applyCourt: '全部'
    })
  }

  // 编辑
  handleTicketEidt = (record) =>{
    const pathname = '/ticket/ticketList/edit';
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
    const pathname = '/ticket/ticketList/add';
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


  handleToDetail = (record) => {
    const pathname = '/ticket/ticketList/detail';
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
  handleToDelete = () => {
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
        payload:{ids:selectedRow},
      }).then(() => {
        const {
          ticket: { code },
        } = this.props;
        if (code === 200) {
          this.setState({
            selectedRow:[],
          });
          message.success('删除成功');
          this.checkFormAndSubmit();
        }
      })
    })
  };


  handlePrinting=(record)=>{
    const {dispatch}=this.props;
    const params={
      couponNo:record.couponNo,
    };
    dispatch({
      type: this.action.printBracelet,
      payload: params,
    });
  }

  // 上下架
  handleToUp = (num) => {
    const { ticket:{pageInfo} } = this.props;
    const { selectedRow } = this.state;
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
        if(this.state.loading2) {
          for(let i=0; i<selectedRow.length; i++) {
            const currentData = pageInfo && pageInfo.list.filter((item) => item.id===selectedRow[i])[0];
            if(currentData.saleStatus===0) {
              message.warning('选中项已下架过，不能再继续下架');
              this.setState({
                loading2: false,
              })
              return;
            }
          }
          this.handleTopUp(num);
        }
      })
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
          ticket: { code },
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

  // 表单
  renderSearchForm() {
    const { form: { getFieldDecorator }, ticket: { sprotNameList, courtNameList, dateTypeList, upperList } } = this.props;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 17 },
        md: { span: 15 },
      },
    };
    return (
      <div className={styles.tableList}>
        <div>
          <Form className={styles.reductionFrom} layout="inline">
            <Row gutter={24}>
              <Col span={8}>
                <FormItem
                  label='项目类型'
                  {...formItemLayout}
                >
                  {getFieldDecorator('sportItemId',{
                    initialValue:'全部',
                  })(
                    <Select allowClear placeholder='请选择' onChange={this.getApplyCourt}>
                      <Select.Option key='全部' value='全部'>
                        全部
                      </Select.Option>
                      {sprotNameList && sprotNameList.length && sprotNameList.map(obj => (
                        <Select.Option key={obj.id} value={obj.id}>
                          {obj.itemName}
                        </Select.Option>
                      ))}
                    </Select>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label='适用场地'
                  {...formItemLayout}
                >
                  {getFieldDecorator('applyCourt',{
                    initialValue:'全部',
                  })(
                    <Select allowClear placeholder='请选择'>
                      <Select.Option key='全部' value='全部'>
                        全部
                      </Select.Option>
                      {courtNameList && courtNameList.length && courtNameList.map(obj => (
                        <Select.Option key={obj.id} value={obj.id}>
                          {obj.courtName}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label='门票名称' {...formItemLayout}>
                  {getFieldDecorator('ticketName')(
                    <Input placeholder='请输入门票名称' />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={8}>
                <FormItem label='适用日期类型' {...formItemLayout}>
                  {getFieldDecorator('applyDateType')(
                    <Fragment>
                      <Checkbox value={0} onChange={this.onCheckAllChange} checked={this.state.checkAll}>全部</Checkbox>
                      <Checkbox.Group style={{display:'inline'}} value={this.state.checkedList} onChange={this.onCheckBoxChange}>
                        {
                          dateTypeList && dateTypeList.length>0 && dateTypeList.map((item) => (
                            <Checkbox key={item.id} value={parseInt(item.code)}>{item.value}</Checkbox>
                          ))
                        }
                      </Checkbox.Group>
                    </Fragment>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label='上下架'
                  {...formItemLayout}
                >
                  {getFieldDecorator('saleStatus',{
                    initialValue: '全部',
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
              <Col span={8} style={{textAlign:'right'}}>
                <Authorized authority='jis_platform_dc_ticket_list_query' nomatch={noMatch()}>
                  <Button
                    htmlType='submit'
                    onClick={this.handleSearch}
                    className={styles.buttonColor}
                  >查询</Button>
                </Authorized>
                <Button
                  type="primary"
                  onClick={this.handleReset}
                  className={styles.buttonColor}
                  style={{marginLeft:'5px'}}
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
    console.log('aa');
    const { ticket: { pageInfo } } = this.props;
    const { current, pageSize, selectedRow } = this.state;

    const columns = [
      { title: '项目类型', dataIndex: 'sportItemName', render: val => <Ellipsis tooltip length={8}>{val}</Ellipsis> },
      { title: '门票名称', dataIndex: 'ticketName', render: val => <Ellipsis tooltip length={8}>{val}</Ellipsis> },
      { title: '票面价格(元)', dataIndex: 'ticketViewPrice' },
      { title: '销售价格(元)', dataIndex: 'ticketSalePrice' },
      {
        title: '适用日期范围',
        dataIndex: 'applyDateStart',
        render:(text,record) => (
          <div>{`${moment(record.applyDateStart).format('YYYY-MM-DD')}~${moment(record.applyDateEnd).format('YYYY-MM-DD')}`}</div>
        )
      },
      { title: '上下架', dataIndex: 'saleStatus', render:(text) => text && text===1?'上架':'下架',
      },
      {
        title:"操作",
        key:"action",
        dataIndex: 'action',
        render: (text, record) =>
          <span>
            <Authorized authority='jis_platform_dc_ticket_list_edit' nomatch={noMatch()}>
              <a disabled={record.saleStatus && record.saleStatus===1?true:false} onClick={() => this.handleToAdd(record)}>编辑</a>
            </Authorized>
            <Authorized authority='jis_platform_dc_ticket_list_detail' nomatch={noMatch()}>
              <Divider type="vertical" />
              <a onClick={() => this.handleToDetail(record)}>查看</a>
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
                  <Authorized authority='jis_platform_dc_ticket_list_add' nomatch={noMatch()}>
                    <Button type="primary" onClick={() => this.handleToAdd()} className={styles.buttonColor}>
                      新增
                    </Button>
                  </Authorized>
                  <Authorized authority='jis_platform_dc_ticket_list_up' nomatch={noMatch()}>
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
                  <Authorized authority='jis_platform_dc_ticket_list_down' nomatch={noMatch()}>
                    <Button
                      disabled={selectedRow.length===0}
                      loading={this.state.loading2}
                      type="primary"
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
                // defaultCurrent: current,
                // defaultPageSize: pageSize,
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
