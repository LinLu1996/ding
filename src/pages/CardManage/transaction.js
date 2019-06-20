import React, { Component,Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Card, Row, Col, Button, Table,Input,message,DatePicker,Radio } from 'antd';
import moment from 'moment';
import styles from './index.less';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import { renderCardTypeString } from '../../utils/globalUtils';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const RadioGroup = Radio.Group;


@Form.create()
@connect(({ card, loading }) => ({
  card,
  loading: loading.models.reduction,
}))
class Reduction extends Component {
  action = {
    queryTransactionList: 'card/fetchQueryTransactionList',
  };


  state = {
    current: 1,
    pageSize: 10,
    id: null,
  };

  componentDidMount() {
    const {current,pageSize} = this.state;
    const {dispatch,location} = this.props;
    if (location && location.search) {
      const { query } = location;
      this.setState({ ...query });
      const params={
        pageNo:current,
        pageSize,
        id: query.id
      }
      dispatch({
        type: this.action.queryTransactionList,
        payload: params,
      });
    }
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
    const { current, pageSize, id } = this.state;
    const { dispatch, form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const params = {
        pageNo: current,
        pageSize,
        id,
        transactionType:values.transactionType===undefined || values.transactionType===0?null:values.transactionType,
        startDate:values && values.date && JSON.stringify(values.date)!=="[]" ?moment(values.date[0]).format("YYYY-MM-DD"):null,
        endDate:values && values.date && JSON.stringify(values.date)!=="[]" ?moment(values.date[1]).format("YYYY-MM-DD"):null,
      };
      dispatch({
        type: this.action.queryTransactionList,
        payload: params,
      });
    });
  };

  // 重置
  handleReset = () => {
    const { form,dispatch } = this.props;
    const { id } = this.state;
    form.resetFields();
    const params={
      pageNo:1,
      pageSize:10,
      id,
    }
    dispatch({
      type: this.action.queryTransactionList,
      payload: params,
    });
  }

  // 返回
  handleToSaleList = () => {
    const pathname = '/cashier/saleList/list';
    router.push({
      pathname,
    });
  }


  // 表单
  renderSearchForm() {
    const {
      form: { getFieldDecorator },
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
              <Col span={9}>
                <FormItem label='交易日期' {...formItemLayout}>
                  {getFieldDecorator('date',{
                    initialValue:null
                  })(
                    <RangePicker />
                  )}
                </FormItem>
              </Col>
              <Col span={9}>
                <FormItem
                  label='交易类型'
                  {...formItemLayout}
                >
                  {getFieldDecorator('transactionType',{
                    initialValue:0
                  })(<RadioGroup>
                    <Radio value={0}>全部</Radio>
                    <Radio value={1}>充值</Radio>
                    <Radio value={2}>消费</Radio>
                    <Radio value={3}>退款</Radio>
                    <Radio value={4}>开卡</Radio>
                  </RadioGroup>)}
                </FormItem>
              </Col>
              <Col span={6} style={{textAlign:'right'}}>
                <Button
                  htmlType='submit'
                  onClick={this.handleSearch}
                  className={styles.buttonColor}>查询</Button>
                <Button
                  type="primary"
                  onClick={this.handleReset}
                  className={styles.buttonColor}
                  style={{marginLeft:5}}
                >
                  重置
                </Button>
                <Button
                  type="primary"
                  onClick={this.handleToSaleList}
                  className={styles.buttonColor}
                  style={{marginLeft:5}}
                >
                  返回
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    );
  }


  render() {
    const { current, pageSize } = this.state;
    const {
      card: { transactionList },
    } = this.props;
    const columns = [
      {
        title: '卡号',
        dataIndex: 'cardNo',
      },
      {
        title: '卡类型',
        dataIndex: 'cardType',
        render: val => renderCardTypeString(val),
      },
      {
        title: '卡名称',
        dataIndex: 'cartName',
      },
      {
        title: '姓名',
        dataIndex: 'memberName',
      },
      {
        title: '联系方式',
        dataIndex: 'memberTel',
      },
      {
        title: '交易时间',
        dataIndex: 'transactionDateEnd',
        render:(text,record) => (
          <div>{ `${text} ${record.transactionTimeStart}` }</div>
        )
      },
      {
        title: '交易类型',
        dataIndex: 'transactionType',
        render: value => {
          switch (value) {
            case 1:
              return "充值";
            case 2:
              return "消费";
            case 3:
              return "退款";
            case 4:
              return "开卡";
            default:
              return null;
          }
        }
      },
      {
        title: '支付方式',
        dataIndex: 'paymentModeName',
      },
      {
        title: '交易金额(元)',
        dataIndex: 'transactionAmount',
      },
      {
        title: '交易备注',
        dataIndex: 'transactionMemo',
      },
      {
        title: '余额(元)',
        dataIndex: 'balance',
        render: (text, record) => record.cardType === 2 ? text : "-",
      },
    ];
    return (
      <PageHeaderWrapper>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderSearchForm()}</div>
          </div>
          <Table
            loading={false}
            columns={columns}
            rowKey={record => record.id}
            dataSource={transactionList && transactionList.list}
            scroll={{x:1700}}
            pagination={{
              current,
              pageSize,
              defaultCurrent: current,
              defaultPageSize: pageSize,
              total: transactionList && transactionList.total,
              onChange: this.handleTableChange,
            }}
          />
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Reduction;
