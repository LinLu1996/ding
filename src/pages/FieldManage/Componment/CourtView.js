import React, { Component } from 'react';
import { Row, Col, Button, Icon, DatePicker, Table, InputNumber } from 'antd';
import moment from 'moment';
import request from '../../../utils/request';
import { dateFormat, monthFormat, nextMonth, prevMonth, getWeekChinese } from '../utils';
import { handleResponse } from '../../../utils/globalUtils';
import styles from '../index.less';

const { MonthPicker } = DatePicker;

/**
 * @author turing
 */

class CourtView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      year: props.year,
      month: props.month,
      court: props.court,
      monthList: [],
      // 项目-场地-年月 初始数据
      originalList: {},
    };
  }

  componentWillMount() {
    const { onRef } = this.props;
    onRef(this);
    const { month } = this.state;
    this.setState({ monthList: this.getDaysOfMonth(month).map(item => this.createColumns(item)) });
  }

  componentWillReceiveProps(nextProps) {
    const { court, month } = this.state;
    if (nextProps.court !== court || month !== nextProps.month) {
      this.setState({
        court: nextProps.court,
        month: nextProps.month,
        monthList: this.getDaysOfMonth(nextProps.month).map(item => this.createColumns(item)),
      }, () => this.fetchList());
    } else {
      this.fetchList();
    }
  }

  setMonth = (month) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'preview/setMonth',
      payload: { month },
    });
  };

  /**
   * 重置数据列表
   */
  resetOriginalList = () => {
    this.setState({ originalList: {} }, () => this.fetchList());
  };

  fetchList = () => {
    const { month, court } = this.state;
    if (!this.hasCache(court, month)) {
      this.setState({ loading: true });
      request(`/venuebooking/court/pricePreview?courtId=${court}&yearMonth=${month}`)
        .then(response => {
          if (handleResponse(response) && response.data.list.length > 0) {
            const { originalList } = this.state;
            const dataSource = this.handleFetchListResponse(response.data);
            if (originalList[court]) {
              originalList[court][month] = dataSource;
            } else {
              originalList[court] = { [month] : dataSource };
            }
            this.setState({ originalList });
          }
          this.setState({ loading: false });
        });
    }
  };

  hasCache = (court, month) => {
    const { originalList } = this.state;
    return originalList[court] && originalList[court][month];
  };

  handleFetchListResponse = (data) => {
    const { list, timeList } = data;
    const newList = [];
    list.forEach((item, index) => {
      const object = {timeUnit: timeList[index].replace('-', ' - ')};
      item.forEach(it => {
        object[it.saleDate] = it.salePrice;
        object[`${it.saleDate}status`] = it.status;
      });
      newList.push(object);
    });
    return newList;
  };

  calculateMonth = (flag) => {
    const { month } = this.state;
    // this.setState({
    //   month: flag ? nextMonth(month) : prevMonth(month),
    //   monthList: this.getDaysOfMonth(flag ? nextMonth(month) : prevMonth(month)).map(item => this.createColumns(item)),
    // }, () => this.fetchList());
    this.setMonth(flag ? nextMonth(month) : prevMonth(month));
  };

  onMonthChanged = (date) => {
    // this.setState({
    //   month: moment(date).format(monthFormat),
    //   monthList: this.getDaysOfMonth(moment(date).format(monthFormat)).map(item => this.createColumns(item)),
    // }, () => this.fetchList());
    this.setMonth(moment(date).format(monthFormat));
  };

  /**
   * filter editable dataSource by court & month from list
   * @returns {Array}
   */
  fetchTableDataSource = (court, month, originalList, dataSource) => {
    const { sportItem } = this.props;
    let list = originalList.map(item => ({...item}));
    if (dataSource[sportItem] && dataSource[sportItem][court]) {
      const object = dataSource[sportItem][court];
      const dates = Object.keys(object);
      dates.forEach(date => {
        const timeUnits = Object.keys(object[date]);
        timeUnits.forEach(timeUnit => {
          list = list.map(item => {
            const newItem = {...item};
            if (timeUnit === newItem.timeUnit) {
              newItem[date] = object[date][timeUnit].price;
              newItem[`${date}status`] = object[date][timeUnit].status;
            }
            return newItem;
          });
        });
      });
    }
    return list;
  };

  createClassName = (status) => {
    switch (status) {
      case -1:
        return '#9ACD32';
      case 1:
        return '#F269D6';
      default:
        return null;
    }
  };

  onInputNumberChanged = (value, dataIndex, record) => {
    const { sportItem } = this.props;
    const { originalList, court, month } = this.state;
    // 创建颜色编码 已修改1 未生效-1 已生效0
    originalList[court][month].forEach(item => {
      if (item.timeUnit === record.timeUnit) {
        const { onChange } = this.props;
        onChange(sportItem, court, dataIndex, record.timeUnit, value, (Number(item[dataIndex]) === Number(value) ? item[`${dataIndex}status`] : 1));
      }
    });
  };

  renderCell = (dataIndex, record) => (
    <div style={{ padding: 2 }}>
      <div style={{ padding: 14, backgroundColor: this.createClassName(record[`${dataIndex}status`]) }}>
        <InputNumber onChange={value => this.onInputNumberChanged(value, dataIndex, record)} value={record[dataIndex]} min={0} precision={2} />
      </div>
    </div>
  );

  createColumns = (column) => ({
    key: column.date,
    align: 'center',
    width: 150,
    title: <div><div>{column.date}</div><div>{column.week}</div></div>,
    dataIndex: column.date,
    render: (value, record) => this.renderCell(column.date, record),
  });

  getDaysOfMonth = (month) => {
    const list = [];
    for (let i = 1; i < 32; i++) {
      const day = moment(month).set('date', i);
      if (this.isContainDay(month, day)) {
        const object = {};
        object.date = moment(day).format(dateFormat);
        object.week = getWeekChinese(moment(day).isoWeekday());
        list.push(object);
      }
    }
    return list;
  };

  disabledSelectedDate = (date) => {
    const { year } = this.props;
    return moment(date).year() !== Number(year);
  };

  isContainDay = (month, day) => moment(month).format(monthFormat) === moment(day).format(monthFormat);

  render() {
    const { dataSource } = this.props;
    const { year, court, month, monthList, originalList, loading } = this.state;

    const columns = [
      { width: 180, dataIndex: 'timeUnit', title: year, align: 'center', fixed: 'left', render: text => <div style={{ padding: 16 }}>{text}</div> },
      ...monthList,
    ];

    return (
      <Row>
        <Col>
          <Button.Group>
            <Button onClick={() => this.calculateMonth(false)} disabled={moment(month).month() < 1} type="primary">
              <Icon type="left" />上一月
            </Button>
            <Button onClick={() => this.calculateMonth(true)} disabled={moment(month).month() > 10} type="primary">
              下一月<Icon type="right" />
            </Button>
          </Button.Group>
          <MonthPicker
            allowClear={false}
            style={{ marginLeft: 5 }}
            disabledDate={this.disabledSelectedDate}
            value={moment(month)}
            onChange={this.onMonthChanged}
          />
        </Col>
        <Col style={{ marginTop: 16 }} className={styles.globalTable}>
          <Table
            bordered
            rowKey='timeUnit'
            loading={loading}
            scroll={{ x: 150 * columns.length + 30 }}
            columns={columns}
            dataSource={this.fetchTableDataSource(court, month, (originalList[court] && originalList[court][month] ? originalList[court][month] : []), dataSource)}
            pagination={false}
            locale={{ emptyText: '暂无数据, 如需设置请前往 订场管理-价格设定' }}
          />
        </Col>
      </Row>
    );
  }
}

export default CourtView;
