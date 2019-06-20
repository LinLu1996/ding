import React, { Component } from 'react';
import { Row, Col, Button, Icon, DatePicker, Table } from 'antd';
import moment from 'moment';
import request from '../../../utils/request';
import { getDay, dateFormat, monthFormat, nextMonth, prevMonth, getWeekChinese } from '../utils';
import { getEnterprise } from '../../../utils/enterprise';
import { handleResponse } from '../../../utils/globalUtils';

const { MonthPicker } = DatePicker;

/**
 * @author turing
 */

class CourtView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: props.year,
      // 所有场地全年数据
      list: [],
      month: undefined,
    };
  }

  componentWillMount() {
    this.fetchList();
  }

  componentWillReceiveProps(nextProps) {
    const { year } = this.state;
    if (year !== nextProps.year) {
      this.setState({ year: nextProps.year }, () => this.fetchList());
    }
  }

  fetchList = () => {
    const { year } = this.state;
    if (year) {
      // request(`/venuebooking/court/calendarList?enterpriseId=${getEnterprise()}&year=${year}`)
      //   .then(response => {
      //     if (handleResponse(response)) {
      //       console.log(`response: ${JSON.stringify(response)}`);
      //     }
      //   });
    }
  };

  calculateMonth = (flag) => {
    const { month } = this.state;
    this.setState({ month: flag ? nextMonth(month) : prevMonth(month) });
  };

  onMonthChanged = (date) => {
    this.setState({ month: moment(date).format(monthFormat) });
  };

  /**
   * filter editable dataSource by court & month from list
   * @param month
   * @returns {Array}
   */
  fetchTableDataSource = (month) => {
    const { sportItem, court } = this.props;
    const { list } = this.state;
    return [];
  };

  disabledSelectedDate = (date) => {
    const { year } = this.props;
    return moment(date).year() !== year;
  };

  createColumns = (column) => ({
    key: column.dataIndex,
    align: 'center',
    width: 150,
    title: <div><div>{column.date}</div><div>{column.week}</div></div>,
    dataIndex: column.dataIndex,
    onCell: record => ({
      onClick: () => this.onCellClick(record, column.dataIndex),
    }),
    render: (value, record) => this.renderCell(column.dataIndex, record),
  });

  getDaysOfMonth = (month) => {
    const list = [];
    for (let i = 1; i < 32; i++) {
      const day = moment(month).set('date', i);
      if (this.isContainDay(month, day)) {
        const object = {};
        object.key = moment(day).format(dateFormat);
        object.date = moment(day).format(dateFormat);
        object.week = getWeekChinese(moment(day).day());
        object.dataIndex = moment(day).format('YYYYMMDD');
        list.push(object);
      }
    }
    return list;
  };

  isContainDay = (month, day) => moment(month).format(monthFormat) === moment(day).format(monthFormat);

  render() {
    const { year, month } = this.state;

    const columns = [
      { width: 150, dataIndex: 'timeUnit', title: year, align: 'center', fixed: 'left', render: text => <div style={{ padding: 16 }}>{text}</div> },
      ...this.getDaysOfMonth(month).map(item => this.createColumns(item))
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
            style={{ marginLeft: 24 }}
            disabledDate={this.disabledSelectedDate}
            value={month ? moment(month) : getDay(year, 1)}
            onChange={this.onMonthChanged}
          />
        </Col>
        <Col style={{ marginTop: 16 }}>
          <Table
            rowKey='id'
            scroll={{ x: 150 * columns.length }}
            columns={columns}
            dataSource={this.fetchTableDataSource(month)}
            pagination={false}
          />
        </Col>
      </Row>
    );
  }
}

export default CourtView;
