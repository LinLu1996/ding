import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Row, Col, Form, Radio, Checkbox, DatePicker, Button, Divider, Table, InputNumber, TimePicker, Modal } from 'antd';
import moment from 'moment';
import PageHeaderWrapper from '../../../components/PageHeaderWrapper';
import Projects from '../Componment/SportItems';
import SetPrice from '../Componment/SetPrice';
// import Authorized from '../../../components/Authorized';
import Authorized from '../../../utils/Authorized';
import { noMatch } from '../../../utils/authority';
import { formatterPrice, renderRequired, renderTitle } from '../../../utils/globalUtils';
import styles from '../index.less';
import { getIsModified, setIsModified } from '../utils';

const { MonthPicker } = DatePicker;
const timeFormat = 'HH:mm';

/**
 * @author turing
 */

@connect(({ priceSetting, fieldManage, loading }) => ({
  data: priceSetting,
  fieldManage,
  loading: loading.models.priceSetting,
}))
@Form.create()
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      indeterminate: false,
      checkAll: false,
      endOpen: false,
      saleTimeUnitOther: undefined,
      // 营业时间段
      startTime: undefined,
      endTime: undefined,
    };
  }

  componentWillUnmount() {
    const { form } = this.props;
    setIsModified(false);
    form.resetFields();
    // this.initialTimeUnitList();
    // this.initialBusinessTime();
    // this.initialFieldList();
    // 清空时间单位数据
    this.clearState('saleTimeUnit', []);
    // 清空开闭关时间
    this.clearState('businessTime', {});
    // 清空场地
    this.clearState('fieldList', []);
    // 清空表单数据
    this.clearState('formData', {});
    // 清空基础价格
    this.clearState('list', []);
  }

  /**
   * 项目切换未保存提醒
   */
  confirmChange = (selectedProject) => {
    const isModified = getIsModified();
    if (isModified) {
      Modal.confirm({
        title: '提示',
        content: '存在没有保存的价格设定, 确定要放弃重新设置吗?',
        okText: '确定',
        cancelText: '取消',
        onOk: () => { this.onProjectChange(selectedProject) },
        onCancel: () => {},
      });
    } else {
      this.onProjectChange(selectedProject);
    }
  };

  /**
   * 运动项目切换
   */
  onProjectChange = (selectedProject) => {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'fieldManage/onProjectSelected',
      payload: {
        selectedProject,
      },
    }).then(() => {
      setIsModified(false);
      form.resetFields();
      this.initialTimeUnitList();
      this.initialBusinessTime();
      this.initialFieldList();
      this.clearState('list', []);
    });
  };

  /**
   * 重置
   */
  resetFormFields = () => {
    const { form } = this.props;
    form.resetFields();
    this.setInitialSaleTimeUnitValue();
    this.setInitialBusinessTimeValue();
    this.onCourtChange([]);
    this.clearState('list', []);
  };

  /**
   * 订场时间
   */
  initialTimeUnitList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'priceSetting/initialTimeUnitList',
    }).then(() => {
      this.setInitialSaleTimeUnitValue();
    });
  };

  setInitialSaleTimeUnitValue = () => {
    const { form, data: { saleTimeUnit } } = this.props;
    this.setState({ saleTimeUnitOther: saleTimeUnit });
    form.setFieldsValue({
      saleTimeUnit,
    });
  };

  /**
   * 开/闭馆时间
   */
  initialBusinessTime = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'priceSetting/initialBusinessTime',
    }).then(() => {
      this.setInitialBusinessTimeValue();
    });
  };

  setInitialBusinessTimeValue = () => {
    const { data: { businessTime } } = this.props;
    if (businessTime.businessTimeStart && businessTime.businessTimeEnd) {
      const { form } = this.props;
      this.setState({
        startTime: businessTime.businessTimeStart,
        endTime: businessTime.businessTimeEnd,
      }, () => {
        form.setFieldsValue({
          businessTime: `${businessTime.businessTimeStart} - ${businessTime.businessTimeEnd}`,
        });
      });
    }
  };

  /**
   * 场馆/场地
   */
  initialFieldList = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'priceSetting/initialFieldList',
    }).then(() => {
      const { form } = this.props;
      form.resetFields(['courtList']);
      this.setState({
        indeterminate: false,
        checkAll: false,
      });
    });
  };

  clearState = (field, value) => {
    if (field === 'fieldList') {
      const { form } = this.props;
      form.resetFields(['courtList']);
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'priceSetting/clearState',
      payload: {
        [field]: value,
      },
    });
  };

  onSaleTimeUnitChanged = (e) => {
    if (e.target.value && e.target.value !== 'other') {
      this.setState({ saleTimeUnitOther: e.target.value });
    }
  };

  /**
   * 订场时间单位自定义
   */
  onSaleTimeUnitOtherChanged = (value) => {
    this.setState({ saleTimeUnitOther: value }, () => {
      this.validateSaleTimeUnit();
    });
  };

  validateSaleTimeUnit = () => {
    const { form } = this.props;
    const { saleTimeUnitOther } = this.state;
    let error = false;
    if (form.getFieldsValue(['saleTimeUnit']).saleTimeUnit === 'other') {
      if (!Number(saleTimeUnitOther) > 0) {
        error = true;
        form.setFields({
          saleTimeUnit: {
            value: 'other',
            errors: [new Error('订场时间单位必须大于0')],
          }
        });
      } else {
        form.setFields({
          saleTimeUnit: {
            value: 'other',
          }
        });
      }
    } else if (form.getFieldsValue(['saleTimeUnit']).saleTimeUnit === undefined) {
      error = true;
      form.setFields({
        saleTimeUnit: {
          errors: [new Error('请选择订场时间单位')],
        }
      });
    }
    return error;
  };

  onCheckAllChanged = (e) => {
    this.setState({
      indeterminate: false,
      checkAll: e.target.checked,
    }, () => {
      const { form, data: { fieldList } } = this.props;
      form.setFieldsValue({
        courtList: e.target.checked ? fieldList.map(item => item.id) : [],
      });
    });
  };

  onCourtChange = (ids) => {
    const { data: { fieldList } } = this.props;
    this.setState({
      indeterminate: !!ids.length && (ids.length < fieldList.length),
      checkAll: ids.length === fieldList.length,
    });
  };

  onCellClick = (record, field) => {
    const { dispatch, data: { list } } = this.props;
    const object = {...record};
    object[`${field}Selected`] = !object[`${field}Selected`];
    dispatch({
      type: 'priceSetting/onListChanged',
      payload: {
        list: list.map(item => item.timeUnit === object.timeUnit ? object : item),
      },
    });
  };

  onCreatePriceClick = () => {
    const { form, dispatch } = this.props;
    const { saleTimeUnitOther, startTime, endTime } = this.state;
    form.validateFieldsAndScroll(['businessTime', 'basePrice'], (errors, values) => {
      if (!this.validateSaleTimeUnit() && !errors) {
        dispatch({
          type: 'priceSetting/onCreatePriceClick',
          payload: {
            params: {
              saleTimeUnit: form.getFieldValue('saleTimeUnit') === 'other' ? saleTimeUnitOther : form.getFieldValue('saleTimeUnit'),
              businessTime: form.getFieldValue('businessTime') === 'other' ? `${startTime} - ${endTime}` : form.getFieldValue('businessTime'),
              basePrice: values.basePrice,
            },
          },
        });
      }
    });
  };

  onSubmitPriceSetting = (isRedirect = false) => {
    const { dispatch, form, data } = this.props;
    const { saleTimeUnitOther, startTime, endTime } = this.state;
    form.validateFieldsAndScroll(['businessTime', 'startMonth', 'endMonth', 'basePrice'], (errors, values) => {
      if (!this.validateSaleTimeUnit() && !errors) {
        dispatch({
          type: 'priceSetting/onSubmitPriceSetting',
          payload: {
            ...values,
            courtList: data.fieldList.map(item => item.id),
            saleTimeUnit: form.getFieldValue('saleTimeUnit') === 'other' ? saleTimeUnitOther : form.getFieldValue('saleTimeUnit'),
            businessTime: form.getFieldValue('businessTime') === 'other' ? `${startTime} - ${endTime}` : form.getFieldValue('businessTime'),
            isRedirect,
          }
        });
      }
    });
  };

  onSetPriceVisibleChanged = (visible) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'priceSetting/onSetPriceVisibleChanged',
      payload: {
        visible,
      },
    });
  };

  onSetPriceChanged = (price) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'priceSetting/onSetPriceChanged',
      payload: {
        price,
      },
    }).then(() => {
      this.onSetPriceVisibleChanged(false);
    });
  };

  disabledStartDate = (startValue) => {
    const { form } = this.props;
    const endValue = form.getFieldValue('endMonth');
    if (!startValue || !endValue) {
      return false;
    }
    return moment(startValue.format('YYYYMM')).valueOf() > moment(endValue.format('YYYYMM')).valueOf() || moment(startValue.format('YYYY')).valueOf() < moment(moment(endValue).format('YYYY'));
  };

  disabledEndDate = (endValue) => {
    const { form } = this.props;
    const startValue = form.getFieldValue('startMonth');
    if (!endValue || !startValue) {
      return false;
    }
    return endValue.valueOf() < startValue.valueOf() || moment(endValue.format('YYYY')).valueOf() > moment(moment(startValue).format('YYYY'));
  };

  handleStartOpenChange = (open) => {
    if (!open) {
      this.setState({ endOpen: true });
    }
  };

  handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
  };

  onTimeChanged = (field, value) => {
    let newValue = value;
    if (field === 'startTime') {
      const { endTime } = this.state;
      if (moment(value, timeFormat).isAfter(moment(endTime, timeFormat))) {
        newValue = endTime;
      }
    }
    if (field === 'endTime') {
      const { startTime } = this.state;
      if (moment(value, timeFormat).isBefore(moment(startTime, timeFormat))) {
        newValue = startTime;
      }
    }
    this.setState({ [field]: newValue });
  };

  disabledStartMinutes = () => {
    const { startTime, endTime } = this.state;
    const list = [];
    if (moment(startTime, timeFormat).hour() === moment(endTime, timeFormat).hour()) {
      for (let i = 0; i < 60; i++) {
        if (moment(endTime, timeFormat).minute() < i) {
          list.push(i);
        }
      }
    }
    return list;
  };

  disabledStartHours = () => {
    const { endTime } = this.state;
    const list = [];
    for (let i = 0; i < 24; i++) {
      if (moment(endTime, timeFormat).hour() < i) {
        list.push(i);
      }
    }
    return list;
  };

  disabledEndMinutes = () => {
    const { startTime, endTime } = this.state;
    const list = [];
    if (moment(startTime, timeFormat).hour() === moment(endTime, timeFormat).hour()) {
      for (let i = 0; i < 60; i++) {
        if (moment(startTime, timeFormat).minute() > i) {
          list.push(i);
        }
      }
    }
    return list;
  };

  disabledEndHours = () => {
    const { startTime } = this.state;
    const list = [];
    for (let i = 0; i < 24; i++) {
      if (moment(startTime, timeFormat).hour() > i) {
        list.push(i);
      }
    }
    return list;
  };

  renderCell = (dataIndex, record) => (
    <div className={this.createClassName(`${dataIndex}Selected`, record)} style={{ padding: 16 }}>
      ¥ {formatterPrice(record[dataIndex])}
    </div>
  );

  createClassName = (field, record) => record[field] ? styles.selectedCell : undefined;

  createColumns = (column) => ({
    key: column.dataIndex,
    align: 'center',
    title: column.title,
    dataIndex: column.dataIndex,
    onCell: record => ({
      onClick: () => this.onCellClick(record, column.dataIndex),
    }),
    render: (value, record) => this.renderCell(column.dataIndex, record),
  });

  hasChosenCells = (dataSource, originalColumns) => {
    let flag = false;
    dataSource.forEach(item => {
      originalColumns.forEach(column => {
        if (item[`${column.dataIndex}Selected`]) {
          flag = true;
        }
      });
    });
    return flag;
  };

  render() {
    const { form, data, loading } = this.props;
    const { endOpen, indeterminate, checkAll, saleTimeUnitOther, startTime, endTime } = this.state;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
        md: { span: 3 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
        md: { span: 21 },
      },
    };
    const originalColumns = [
      { key: 1, title: '周一', dataIndex: 'Monday' },
      { key: 2, title: '周二', dataIndex: 'Tuesday' },
      { key: 3, title: '周三', dataIndex: 'Wednesday' },
      { key: 4, title: '周四', dataIndex: 'Thursday' },
      { key: 5, title: '周五', dataIndex: 'Friday' },
      { key: 6, title: '周六', dataIndex: 'Saturday' },
      { key: 7, title: '周日', dataIndex: 'Sunday' },
      { key: 8, title: '节假日', dataIndex: 'Holiday' },
    ];
    const columns = [
      { align: 'center', title: '价格设定', dataIndex: 'timeUnit', render: text => <div style={{ padding: 16 }}>{text}</div> },
      ...originalColumns.map(column => this.createColumns(column)),
    ];
    const hasChosen = this.hasChosenCells(data.list, originalColumns);

    return (
      <PageHeaderWrapper>
        <Card>
          <Row gutter={5}>
            <Col>{renderTitle('选择项目')}</Col>
            <Projects onChange={this.confirmChange} />
          </Row>
          <Row>
            <Col style={{ padding: '24px 0' }}>{renderTitle('选择设定对象')}</Col>
            <Col>
              <Form>
                <Form.Item label='订场时间单位' {...formItemLayout}>
                  {form.getFieldDecorator('saleTimeUnit', {
                    rules: [{ required: true, message: '请选择订场时间单位' }],
                  })(
                    <Radio.Group onChange={this.onSaleTimeUnitChanged}>
                      <Radio value={data.saleTimeUnit}>{`${data.saleTimeUnit} 分钟`}</Radio>
                      <Radio value='other'>
                        其他&nbsp;&nbsp;
                        <InputNumber
                          disabled={form.getFieldsValue(['saleTimeUnit']).saleTimeUnit !== 'other'}
                          value={saleTimeUnitOther}
                          onChange={this.onSaleTimeUnitOtherChanged}
                          min={0}
                          precision={0}
                        />分钟
                      </Radio>
                    </Radio.Group>
                  )}
                </Form.Item>
                <Form.Item label='开/闭馆时间' {...formItemLayout}>
                  {form.getFieldDecorator('businessTime', {
                    rules: [{ required: true, message: '请选择开/闭馆时间' }],
                  })(
                    <Radio.Group>
                      {data.businessTime.businessTimeStart && data.businessTime.businessTimeEnd && (
                        <Radio value={`${data.businessTime.businessTimeStart} - ${data.businessTime.businessTimeEnd}`}>
                          {`${moment(data.businessTime.businessTimeStart, 'HH:mm:ss').format('HH:mm')} - ${moment(data.businessTime.businessTimeEnd, 'HH:mm:ss').format('HH:mm')}`}
                        </Radio>
                      )}
                      <Radio value='other'>
                        其他&nbsp;&nbsp;
                        <TimePicker
                          disabled={form.getFieldsValue(['businessTime']).businessTime !== 'other'}
                          allowEmpty={false}
                          format={timeFormat}
                          value={startTime ? moment(startTime, timeFormat) : null}
                          disabledMinutes={this.disabledStartMinutes}
                          disabledHours={this.disabledStartHours}
                          onChange={(time, timeString) => this.onTimeChanged('startTime', timeString)}
                        />
                        <TimePicker
                          disabled={form.getFieldsValue(['businessTime']).businessTime !== 'other'}
                          style={{ marginLeft: 5 }}
                          allowEmpty={false}
                          format={timeFormat}
                          disabledMinutes={this.disabledEndMinutes}
                          disabledHours={this.disabledEndHours}
                          value={endTime? moment(endTime, timeFormat):null}
                          onChange={(time, timeString) => this.onTimeChanged('endTime', timeString)}
                        />
                      </Radio>
                    </Radio.Group>
                  )}
                </Form.Item>
                <Form.Item label={renderRequired('场地')} {...formItemLayout}>
                  {data.fieldList.length > 0 ?
                    data.fieldList.map(item => <Checkbox key={item.id} value={item.id} disabled defaultChecked>{item.courtName}</Checkbox>)
                    : <div style={{ color: '#d9d9d9' }}>暂无场地</div>
                  }
                </Form.Item>
                {/* <Form.Item label={renderRequired('场地')} {...formItemLayout}>
                  {data.fieldList.length > 0 &&
                  <Checkbox
                    onChange={this.onCheckAllChanged}
                    indeterminate={indeterminate}
                    checked={checkAll}
                  >
                    全部
                  </Checkbox>
                  }
                  <Form.Item>
                    {form.getFieldDecorator('courtList', {
                      rules: [{ required: true, message: '请选择场地' }],
                    })(
                      <Checkbox.Group onChange={this.onCourtChange}>
                        {data.fieldList.map(item => <Checkbox key={item.id} value={item.id}>{item.courtName}</Checkbox>)}
                      </Checkbox.Group>,
                    )}
                  </Form.Item>
                </Form.Item> */}
                <Form.Item label={renderRequired('月份')} {...formItemLayout}>
                  <Row gutter={5}>
                    <Col span={6}>
                      <Form.Item>
                        {form.getFieldDecorator('startMonth', {
                          rules: [{ required: true, message: '请选择起始日期' }],
                        })(
                          <MonthPicker
                            style={{ width: '100%' }}
                            disabledDate={this.disabledStartDate}
                            onOpenChange={this.handleStartOpenChange}
                            placeholder='请选择起始月份'
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item>
                        {form.getFieldDecorator('endMonth', {
                          rules: [{ required: true, message: '请选择结束日期' }],
                        })(
                          <MonthPicker
                            style={{ width: '100%' }}
                            disabledDate={this.disabledEndDate}
                            open={endOpen}
                            onOpenChange={this.handleEndOpenChange}
                            placeholder='请选择结束月份'
                          />
                        )}
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Button onClick={() => this.resetFormFields()}>重置</Button>
                    </Col>
                  </Row>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Divider style={{ margin: '0 0 24px 0' }} />
          <Row gutter={5}>
            <Form>
              <Col span={6}>
                <Form.Item>
                  {form.getFieldDecorator('basePrice', {
                    rules: [{ required: true, message: '请输入基础价格' }],
                  })(
                    <InputNumber min={0} precision={2} placeholder='请输入基础价格' style={{ width: '100%' }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item>
                  <Authorized authority='jis_platform_dc_booking_price_generate' nomatch={noMatch()}>
                    <Button onClick={() => this.onCreatePriceClick()} type='primary'>价格生成</Button>
                  </Authorized>
                  <Authorized authority='jis_platform_dc_booking_price_set' nomatch={noMatch()}>
                    <Button onClick={() => this.onSetPriceVisibleChanged(true)} disabled={!hasChosen} style={{ marginLeft: 5 }}>
                      价格设定
                    </Button>
                  </Authorized>
                  <Authorized authority='jis_platform_dc_booking_price_save' nomatch={noMatch()}>
                    <Button onClick={() => this.onSubmitPriceSetting()} disabled={!data.list.length > 0} type='primary' style={{ marginLeft: 5, float: 'right' }}>
                      保存设定
                    </Button>
                  </Authorized>
                  <Authorized authority='jis_platform_dc_booking_price_preview' nomatch={noMatch()}>
                    <Button onClick={() => this.onSubmitPriceSetting(true)} disabled={!data.list.length > 0} type='primary' style={{ float: 'right' }}>
                      预览/生效
                    </Button>
                  </Authorized>
                </Form.Item>
              </Col>
            </Form>
          </Row>
          <div className={styles.globalTable}>
            <Table
              loading={loading}
              bordered
              rowKey='timeUnit'
              pagination={false}
              columns={columns}
              dataSource={data.list}
            />
          </div>
        </Card>
        <SetPrice
          visible={data.setPrice.visible}
          onOk={this.onSetPriceChanged}
          onCancel={() => this.onSetPriceVisibleChanged(false)}
        />
      </PageHeaderWrapper>
    );
  }
}

export default index;
