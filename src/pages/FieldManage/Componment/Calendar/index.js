import React, { Component } from 'react';
import { Table } from 'antd';
import moment from 'moment';
import { dateFormat, monthFormat } from '../../utils';
import styles from './index.less';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * @author turing
 */

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      yearMonth: undefined,
      list: [],
    };
  }

  componentWillMount() {
    const { dataSource } = this.props;
    this.createYearMonth(dataSource);
  }

  componentWillReceiveProps(nextProps) {
    const { yearMonth } = this.state;
    if (
      nextProps.dataSource
      && Object.keys(nextProps.dataSource).length > 0
      && yearMonth !== moment(moment(nextProps.year, 'YYYY').month(Object.keys(nextProps.dataSource)[0])).format(monthFormat)
    ) {
      this.createYearMonth(nextProps.dataSource);
    }
  }

  createYearMonth = (dataSource) => {
    const { year} = this.props;
    const key = Object.keys(dataSource)[0] - 1;
    this.setState({
      yearMonth: moment(moment(year, 'YYYY').month(key)).format(monthFormat),
    }, () => this.initialDataSource(Object.values(dataSource)[0]));
  };

  initialDataSource = (list) => {
    const { yearMonth } = this.state;
    this.setState({ list: list.length > 0 ? list : this.getDaysOfMonth(yearMonth) })
  };

  getDaysOfMonth = (yearMonth) => {
    const list = [];
    for (let i = 1; i < 32; i++) {
      const day = moment(yearMonth, monthFormat).set('date', i);
      if (this.isContainDay(yearMonth, day)) {
        const object = {};
        object.saleDate = moment(day).format(dateFormat);
        object.status = -1;
        list.push(object);
      }
    }
    return list;
  };

  renderCancelTitle = (yearMonth) => <div className={styles.textAlignCenter}>{yearMonth}</div>;

  onClickMonthPreview = (yearMonth) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'preview/onTabsChanged',
      payload: {
        activeKey: 'fieldView',
        month: yearMonth,
      },
    });
  };

  handleDataSource = (list) => {
    const newList = [];
    let object = {key: 1};
    list.forEach((item, index) => {
      const week = this.getWeek(item.saleDate);
      object[week] = moment(item.saleDate).format('DD');
      object[`${week}Status`] = item.status;
      if (week === 'Sunday' || index === list.length - 1) {
        newList.push(object);
        object = {key: object.key + 1};
      }
    });
    return newList;
  };

  /**
   * 颜色显示编码
   * @param status
   * @returns {string}
   */
  createBackGroundColor = (status) => {
    switch (status) {
      case 0:
        // 已生效
        return 'white';
      case 1:
        // 未生效
        return '#F269D6';
      default:
        // 未设定 -1
        return '#CC3300';
    }
  };

  isContainDay = (month, day) => moment(month).format(monthFormat) === moment(day).format(monthFormat);

  getWeekChinese = (day) => {
    switch (day) {
      case 'Monday':
        return '一';
      case 'Tuesday':
        return '二';
      case 'Wednesday':
        return '三';
      case 'Thursday':
        return '四';
      case 'Friday':
        return '五';
      case 'Saturday':
        return '六';
      case 'Sunday':
        return '日';
      default:
        return '节假日';
    }
  };

  getWeek = (day) => {
    switch (moment(day).isoWeekday()) {
      case 1:
        return 'Monday';
      case 2:
        return 'Tuesday';
      case 3:
        return 'Wednesday';
      case 4:
        return 'Thursday';
      case 5:
        return 'Friday';
      case 6:
        return 'Saturday';
      case 7:
        return 'Sunday';
      default:
        return 'Holiday';
    }
  };

  render() {
    const { list, yearMonth } = this.state;

    const columns = [
      ...days.map(item => ({
        key: item,
        align: 'center',
        width: 39,
        dataIndex: item,
        title: this.getWeekChinese(item),
        render: (value, record) => (
          <div style={{ backgroundColor: this.createBackGroundColor(Number(record[`${item}Status`])) }}>{value}</div>
        )
      }))
    ];

    return (
      <div className={styles.globalTable} onClick={() => this.onClickMonthPreview(yearMonth)}>
        <Table
          size='small'
          rowKey='key'
          bodyStyle={{ margin: 0 }}
          style={{ width: 300, height: 305 }}
          title={() => this.renderCancelTitle(yearMonth)}
          bordered
          pagination={false}
          columns={columns}
          dataSource={this.handleDataSource(list)}
        />
      </div>
    );
  }
}

export default Index;
