import React, { Component } from 'react';
import { Card, Form, Input, Select, InputNumber, Checkbox, DatePicker, Row, Col, TimePicker, Button } from 'antd';
import moment from "moment";
import PageHeaderWrapper from '../../../components/PageHeaderWrapper';
import request from '../../../utils/request';
import { handleResponse, renderRequired } from '../../../utils/globalUtils';
import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * @author turing
 */

@Form.create()
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      sportItems: [], // 项目类型
      courts: [], // 适用场地
      dates: [], // 适用日期类型
    };
  }

  componentDidMount() {
    this.initialSportItems();
    this.initialCourts();
    this.initialDates();
  }

  /**
   * 项目类型
   */
  initialSportItems = () => {
    request("/venuebooking/sportItem/getSprotName")
      .then(response => {
        if (handleResponse(response)) {
          this.setState({ sportItems: response.data });
        }
      });
  };

  /**
   * 适用日期类型
   */
  initialDates = () => {
    this.initialDictionary(2, response => {
      if (handleResponse(response)) {
        this.setState({ dates: response.data });
      }
    })
  };

  /**
   * 获取字典表内容
   */
  initialDictionary = (type, callBack) => {
    request(`/venuebooking/dictionaries/getDictionaries?type=${type}`)
      .then(response => {
        callBack(response);
      });
  };

  /**
   * 适用场地
   */
  initialCourts = () => {
    request("/venuebooking/court/getCourtName")
      .then(response => {
        if (handleResponse(response)) {
          this.setState({ courts: response.data });
        }
      });
  };

  handleSubmit = (e) => {
    if (e)
      e.preventDefault();
    const { form } = this.props;
    form.validateFieldsAndScroll((errors, values) => {
      if (!errors) {
        this.setState({ loading: true });
        const params = {...values};
        const dateFieldName = ["saleTimeStart", "saleTimeEnd", "applyTimeStart", "applyTimeEnd"];
        dateFieldName.forEach(key => {
          if (params[key]) {
            params[key] = moment(params[key]).format("HH:mm");
          }
        });
        params.applyDateStart = moment(params.range[0]).format("YYYY-MM-DD");
        params.applyDateEnd = moment(params.range[1]).format("YYYY-MM-DD");
        params.applyCourtList = this.getCourts(params.applyCourts);
        delete params.range;
        delete params.applyCourts;
        request("/venuebooking/cashier/saleGroupTicket", {
          method: "POST",
          body: params,
        }).then(response => {
          if (handleResponse(response, true)) {
            form.resetFields();
            // 批量打印
          }
          this.setState({ loading: false });
        });
      }
    });
  };

  /**
   * 获取适用场地名
   * @param ids
   * @returns {*}
   */
  getCourts = (ids) => {
    const { courts } = this.state;
    return courts.filter(court => this.isContains(court.id, ids));
  };

  isContains = (key, ids) => {
    let flag = false;
    ids.forEach(id => {
      if (id === key) {
        flag = true;
      }
    });
    return flag;
  };

  disabledDate = current => !(current && moment(`${moment(current).format("YYYY-MM-DD")} 00:00:00`) >= moment(`${moment().endOf('day').format("YYYY-MM-DD")} 00:00:00`));

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { loading, sportItems, courts, dates } = this.state;

    const format = "HH:mm";
    const formItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 6 }, md: { span: 4 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 18 }, md: { span: 16 }, xl: { span: 12 } },
    };

    return (
      <PageHeaderWrapper>
        <Card>
          <Form onSubmit={this.handleSubmit}>
            <FormItem label='项目类型' {...formItemLayout}>
              {getFieldDecorator('sportId',{
                rules: [{ required: true, message: '请选择项目类型' }],
              })(
                <Select placeholder="请选择项目类型">
                  {sportItems.map(item => <Option key={item.id} value={item.id}>{item.itemName}</Option>)}
                </Select>
              )}
            </FormItem>
            <FormItem label='门票名称' {...formItemLayout}>
              {getFieldDecorator('ticketName',{
                rules: [{ required: true, message: '请输入门票名称' }],
                initialValue: "团体票",
              })(
                <Input maxLength={50} placeholder="请输入门票名称" />
              )}
            </FormItem>
            <FormItem label='门票号码' {...formItemLayout}>
              {getFieldDecorator('ticketNo',{
                rules: [{ required: true, message: '请输入门票号码' }],
              })(
                <Input maxLength={50} placeholder="请输入门票号码" />
              )}
            </FormItem>
            <FormItem label='适用场地' {...formItemLayout}>
              {getFieldDecorator('applyCourts',{
                rules: [{ required: true, message: '请选择适用场地' }],
              })(
                <Checkbox.Group className={styles.formCheckBox}>
                  {courts.map(item => <Checkbox key={item.id} value={item.id}>{item.courtName}</Checkbox>)}
                </Checkbox.Group>
              )}
            </FormItem>
            <FormItem label='票面价格(元)' {...formItemLayout}>
              {getFieldDecorator('ticketOriginalPrice',{
                rules: [{ required: true, message: '请输入票面价格' }],
              })(
                <InputNumber min={0} max={999999999.99} precision={2} style={{ width: '100%' }} placeholder="请输入票面价格" />
              )}
            </FormItem>
            <FormItem label='销售价格(元)' {...formItemLayout}>
              {getFieldDecorator('ticketSalePrice',{
                rules: [{ required: true, message: '请输入销售价格' }],
              })(
                <InputNumber min={0} max={999999999.99} precision={2} style={{ width: '100%' }} placeholder="请输入销售价格" />
              )}
            </FormItem>
            <FormItem label='人数' {...formItemLayout}>
              {getFieldDecorator('counts',{
                rules: [{ required: true, message: '请输入人数' }],
              })(
                <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="请输入人数" />
              )}
            </FormItem>
            <FormItem label='适用日期范围' {...formItemLayout}>
              {getFieldDecorator('range',{
                rules: [{ required: true, message: '请选择适用日期范围' }],
              })(
                <RangePicker style={{width:'100%'}} disabledDate={this.disabledDate} />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="销售时间" style={{ marginBottom: 0 }}>
              <Row gutter={6}>
                <Col span={12}>
                  <FormItem>
                    {getFieldDecorator('saleTimeStart')(
                      <TimePicker style={{ width:'100%' }} format={format} />
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem>
                    {getFieldDecorator('saleTimeEnd')(
                      <TimePicker style={{ width:'100%' }} format={format} />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
            <FormItem {...formItemLayout} label={renderRequired("适用时间")} style={{ marginBottom: 0 }}>
              <Row gutter={6}>
                <Col span={12}>
                  <FormItem>
                    {getFieldDecorator('applyTimeStart',{
                      rules: [{ required: false, message: '请选择适用时间段' }],
                    })(
                      <TimePicker style={{ width:'100%' }} format={format} />
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem>
                    {getFieldDecorator('applyTimeEnd',{
                      rules: [{ required: false, message: '请选择适用时间段' }],
                    })(
                      <TimePicker style={{ width:'100%' }} format={format} />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </FormItem>
            <FormItem {...formItemLayout} label='适用时长(分钟)'>
              {getFieldDecorator('duration',{
                rules: [{ required: true, message: '请输入适用时长' }],
              })(
                <InputNumber min={0} max={999} precision={0} style={{ width: "100%" }} placeholder="请输入适用时长" />
              )}
            </FormItem>
            <FormItem label='适用日期类型' {...formItemLayout}>
              {getFieldDecorator('applyDateTypeList',{
                rules: [{ required: true, message: '请选择适用日期类型' }],
              })(
                <Checkbox.Group className={styles.formCheckBox}>
                  {dates.map(item => <Checkbox key={item.id} value={item.code}>{item.value}</Checkbox>)}
                </Checkbox.Group>
              )}
            </FormItem>
            <FormItem label='超时计费单位(分钟)' {...formItemLayout}>
              {getFieldDecorator('timeoutBillingUnit',{
                rules: [{ required: true, message: '请输入超时计费单位' }],
              })(
                <InputNumber min={0} max={9999} precision={0} style={{ width:"100%" }} placeholder="请输入超时计费单位" />
              )}
            </FormItem>
            <FormItem label='超时计费金额(元)' {...formItemLayout}>
              {getFieldDecorator('timeoutValue',{
                rules: [{ required: true, message: '请输入超时计费金额' }],
              })(
                <InputNumber precision={2} max={99999.99} min={0} style={{ width:"100%" }} placeholder="请输入超时计费金额" />
              )}
            </FormItem>
            {/*<FormItem label='初始库存' {...formItemLayout}>*/}
              {/*{getFieldDecorator('initialStock',{*/}
                {/*rules: [{ required: true, message: '请输入初始库存' }],*/}
              {/*})(*/}
                {/*<InputNumber min={0} max={999999} precision={0} style={{ width:"100%" }} placeholder="请输入初始库存" />*/}
              {/*)}*/}
            {/*</FormItem>*/}
            <FormItem {...{ wrapperCol: { xs: { span: 24 }, sm: { offset: 6, span: 18 }, md: { offset: 4, span: 16 }, xl: { offset: 4, span: 12 } } }}>
              <Button htmlType="submit" type="primary" loading={loading}>确定</Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default index;
