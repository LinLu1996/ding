import React, { Component,Fragment } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Form, Card, Input, DatePicker, Select, Col, Row, Table, Button, message,InputNumber,TimePicker,Upload,Modal,Icon,Checkbox } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import router from 'umi/router';
import moment from 'moment';
import styles from './index.less';
import { connect } from 'dva';
import list from '../../models/list';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';

const FormItem = Form.Item;
const {RangePicker} = DatePicker;

@Form.create()
@connect(({ systemSet }) => ({
  systemSet,
}))

export default class Emply extends Component {

  action = {
    queryList: 'systemSet/fetchQueryTicket',
    clearStockInfo: 'systemSet/clearStockInfo',
    getPermission: 'systemSet/fetchGetPermission',
    getPermissionAll: 'systemSet/fetchGetPermissionAll',
    setPermission: 'systemSet/fetchSetPermission',
  };
  firstFlag=true;
  constructor(props) {
    super(props);
    const { systemSet:{dictList} } = this.props;
    this.state = {
      dataSource: [],
      id:null,
      name:null,
      contactTel:null,
      checkAll: [],
      listAll:[],
      currentListAll:[],
      checkedAllList:{},
      loading:false
    };
  }

  componentDidMount() {
    const { dispatch, location } = this.props;
    if (location && location.search) {
      const { query } = location;
      this.setState({ ...query });
      dispatch({
        type: this.action.getPermissionAll,
        payload: { enterpriseId: 1 }
      }).then(() => {
        const { systemSet: { getPermissionAllList } } = this.props;
        const { listAll } = this.state;
        if (getPermissionAllList) {
          for (let it in getPermissionAllList) {
            const keys = it.split('$-$');
            const list = {};
            list.id = keys[0];
            list.title = keys[1];
            list.data = getPermissionAllList[it];
            list.length = getPermissionAllList[it].length;
            listAll.push(list);
          }
          this.setState({
            listAll,
          })
        }
        this.getChildList();
      })
    }
  }

  getChildList = () => {
    const {dispatch,location} = this.props;
    const { query } = location;
    dispatch({
      type: this.action.getPermission,
      payload: { userId: query.id }
    }).then(() => {
      const { systemSet: { getPermissionList, getPermissionAllList } } = this.props;
      const { listAll,checkedAllList,checkAll } = this.state;
      if (getPermissionAllList && getPermissionList) {
        for(let i in getPermissionList) {
          const keys = i.split('$-$');
          const it = keys[0];
          const list = [];
          getPermissionList[i].forEach((item) => {
            list.push(item.id);
          })
          checkedAllList[it] = list;
          if(list.length===getPermissionAllList[i].length) {
            checkAll[it] = true;
          }
        }
      }
      this.setState({
        checkedAllList,
        checkAll,
      })
    })
  }


  // 全选
  onCheckAllChange = (item,index,e) => {
    const { listAll,checkedAllList,checkAll } = this.state;
    const arr = [];
    listAll[index].data.forEach((item) => {
      arr.push(item.id);
    })
    checkedAllList[item.id] = e.target.checked ? arr : [];
    // checkAll[index] = e.target.checked;
    checkAll[item.id] = e.target.checked;
    this.setState({
      checkedAllList: checkedAllList,
      checkAll,
    });
  }

  // 适用场地复选框
  onCheckPlaceChange = (item,index,checkedList) => {
    const { listAll,checkedAllList,checkAll } = this.state;
    let flag = false;
    if(checkedList.length===listAll[index].data.length) {
      flag = true;
    }
    checkedAllList[item.id] = checkedList;
    // checkAll[index] = flag;
    checkAll[item.id] = flag;
    this.setState({
      checkedAllList,
      checkAll,
    });
  }

  // 取消
  handleCancel = () => {
    router.go(-1);
  }

  handleSubmit = () => {
    const { form, dispatch} = this.props;
    const { id,checkedAllList,listAll } = this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return ;
      }
      for(let i in checkedAllList) {
        if(JSON.stringify(checkedAllList[i]) ==="[]") {
          delete checkedAllList[i];
        }
      }
      if(JSON.stringify(checkedAllList) === "{}") {
        message.warning('请设置权限');
        return ;
      }
      this.setState({
        loading:true
      })
      const params = {
        enterpriseId:1,
        userId:id,
        map:checkedAllList,
        flag:'edit',
      };
      dispatch({
        type:this.action.setPermission,
        payload:params
      }).then(() => {
        const {
          systemSet: { code },
        } = this.props;
        this.setState({
          loading:false
        })
        if (code === 200) {
          this.handleCancel();
        }
      })
    });
  };

  render() {
    const { form: { getFieldDecorator },systemSet:{} } = this.props;
    const { listAll,checkAll,checkedAllList,name,contactTel } = this.state;
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
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.permissionTableListForm}>
              <Form layout='inline'>
                <Row gutter={24}>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='姓名'
                    >
                      {getFieldDecorator('name',{
                        initialValue:name && name
                      })(<Input disabled={true} />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label='联系方式'
                    >
                      {getFieldDecorator('tel',{
                        initialValue:contactTel && contactTel
                      })(<Input disabled={true} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={168}>
                  {
                    listAll.map((item,index) => (
                      <Col span={12} key={item.id} style={{marginTop:'40px',marginBottom:'40px'}}>
                        <div className={styles.sportList}>
                          <div className={styles.listTitle}>{item.title}</div>
                          {
                            item.data.length>0 && <Checkbox style={{display:'block',marginLeft:'-12px'}} value={0} onChange={this.onCheckAllChange.bind(this,item,index)} checked={checkAll[item.id]}>全部</Checkbox>
                          }
                          <Checkbox.Group style={{display:'block'}} value={checkedAllList[item.id]} onChange={this.onCheckPlaceChange.bind(this,item,index)}>
                            <Row gutter={24} key={item.id}>
                              {
                                item.data.map((item) => (
                                  <Col key={item.id} span={8} style={{marginTop:'20px',padding:0,height: '22px',
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',}}>
                                    <Checkbox key={item.id} value={item.id}>{item.courtName}</Checkbox>
                                  </Col>
                                ))
                              }
                            </Row>
                          </Checkbox.Group>
                        </div>
                      </Col>
                    ))
                  }
                </Row>
              </Form>
            </div>
          </div>
          <div style={{ overflow: 'hidden',width:'100%' }}>
            <Row gutter={24} style={{ marginBottom: 24 }}>
              <Col span={4} offset={10}>
                <Button
                  htmlType="submit"
                  onClick={this.handleSubmit}
                  loading={this.state.loading}
                  className={styles.buttonColor}>保存</Button>
                <Button
                  type="primary"
                  onClick={this.handleCancel}
                  className={styles.buttonColor}
                  style={{marginLeft:5}}
                >
                  返回
                </Button>
              </Col>
            </Row>
          </div>
        </Card>
      </PageHeaderWrapper>
    );
  }
}
