import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Table } from 'antd';
import moment from 'moment';
import styles from './index.less';
import { transMonthToEn, getWeek, getWeekChinese } from '../../customUtils';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * @author turing
 */

@connect(({ dateSetting, loading }) => ({
  data: dateSetting,
  loading: loading.models.dateSetting,
}))
class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: props.year,
      month: props.month,
      list: [],
    };
  }

  componentDidMount() {
    const { dataSource } = this.props;
    this.setState({ list: this.handleDateData(dataSource) });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      year: nextProps.year,
      month: nextProps.month,
      list: this.handleDateData(nextProps.dataSource),
    });
  }

  handleDateData = (dataSource) => {
    const list = [];
    const dates = Object.keys(dataSource);
    let object = { key: 1 };
    dates.forEach((date, index) => {
      const week = getWeek(date);
      object[week] = moment(date).format('DD');
      object[`${week}Status`] = dataSource[date];
      if (week === 'Sunday' || index === dates.length - 1) {
        list.push(object);
        object = {key: object.key + 1};
      }
    });
    return list;
  };

  onClickCalendar = (month) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'dateSetting/setState',
      payload: {
        month,
      },
    }).then(() => {
      router.push('/systemSet/dateSettings/monthView');
    });
  };

  renderCardTitle = (year, month) => <div className={styles.textAlignCenter}>{`${transMonthToEn(month)} - ${year}`}</div>;

  renderBackgroundColor = (status) => {
    switch (status) {
      // 周一 ~ 周五
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        return null;
      // 周六 ~ 周日
      case 6:
      case 7:
        return '#009900';
      // 节假日
      case 8:
        return '#FFFF00';
      // 未设定
      default:
        return '#FF5757';
    }
  };

  render() {
    const { year, month, list } = this.state;
    const columns = [
      ...days.map(item => ({
        key: item,
        align: 'center',
        width: 39,
        dataIndex: item,
        title: getWeekChinese(item),
        render: (value, record) => (
          <div style={{ backgroundColor: this.renderBackgroundColor(record[`${item}Status`]) }}>{value}</div>
        )
      }))
    ];

    return (
      <div className={styles.globalTable} onClick={() => this.onClickCalendar(month)}>
        <Table
          size='small'
          rowKey='key'
          bodyStyle={{ margin: 0 }}
          style={{ width: 300, height: 305 }}
          title={() => this.renderCardTitle(year, month)}
          bordered
          pagination={false}
          columns={columns}
          dataSource={list}
        />
      </div>
    );
  }
}

export default Calendar;
