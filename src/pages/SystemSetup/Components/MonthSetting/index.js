import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Table, Row, Col, Button, Icon, message } from 'antd';
import moment from 'moment';
import FooterToolbar from '../../../../components/FooterToolbar';
import { getWeek, getWeekChinese } from '../../customUtils';
import request from '../../../../utils/request';
import { getEnterprise } from '../../../../utils/enterprise';
import {formatterPrice, handleResponse, renderSign} from '../../../../utils/globalUtils';
import styles from './index.less';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * @author jiangt
 */

@connect(({ dateSetting, loading }) => ({
  data: dateSetting,
  loading: loading.models.dateSetting,
}))
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
    };
  }

  componentWillMount() {
    this.fetchList();
  }

  fetchList = () => {
    const { data: { year, month } } = this.props;
    request(`/venuebooking/calendar/saleDateMonthList?yearMonth=${moment(year, 'YYYY').month(month - 1).format('YYYY-MM')}`)
      .then(response => {
        if (handleResponse(response)) {
          this.setState({ list: this.handleDateData(response.data) });
        }
      });
  };

  handleDateData = (dataSource) => {
    const list = [];
    const dates = Object.keys(dataSource);
    let object = { key: 1 };
    dates.forEach((date, i) => {
      const week = getWeek(date);
      object[week] = date;
      object[`${week}status`] = dataSource[date];
      if (week === 'Sunday' || i === dates.length - 1) {
        list.push(object);
        object = {key: object.key + 1};
      }
    });
    return list;
  };

  calculateYearMonth = (num) => {
    const { dispatch, data: { year, month } } = this.props;
    dispatch({
      type: 'dateSetting/setState',
      payload: {
        year: moment(year, 'YYYY').month(month).add(num, 'months').year(),
        month: moment(year, 'YYYY').month(month).add(num, 'months').month(),
      },
    }).then(() => this.fetchList());
  };

  setPrice = (salesDay) => {
    const { list } = this.state;
    const dates = [];
    list.forEach(item => {
      days.forEach(w => {
        if (item[[`${w}selected`]]) {
          dates.push(item[w]);
        }
      });
    });
    if (dates.length > 0) {
      request('/venuebooking/calendar/saleDateMonthSet', {
        method: 'POST',
        body: {
          requestList: dates,
          salesDay,
        },
      }).then(response => {
        if (handleResponse(response, true)) {
          this.fetchList();
        }
      });
    } else {
      message.warning('请选择日期');
    }
  };

  onResetClickStatus = () => {
    const { list } = this.state;
    this.setState({
      list: list.map(item => {
        const newItem = {...item};
        days.forEach(week => {
          if (newItem[`${week}selected`]) {
            delete newItem[`${week}selected`];
          }
        });
        return newItem;
      }),
    });
  };

  goBack = () => {
    const { dispatch, data: { year, month } } = this.props;
    dispatch({
      type: 'dateSetting/setState',
      payload: {
        year: moment(year, 'YYYY').month(month - 1).year(),
        month: moment(year, 'YYYY').month(month - 1).month(),
      },
    }).then(() => {
      router.push('/systemSet/dateSettings');
    })
  };

  renderCardTitle = (year, month) => (
    <Row>
      <Col span={6} align='left'>
        <Button onClick={() => this.calculateYearMonth(-1)} type='primary'><Icon type='left' />上一月</Button>
      </Col>
      <Col span={12} align='center' style={{ marginTop: 4 }}>{moment(year, 'YYYY').month(month - 1).format('YYYY 年 MM 月')}</Col>
      <Col span={6} align='right'>
        <Button onClick={() => this.calculateYearMonth(1)} type='primary'>下一月<Icon type='right' /></Button>
      </Col>
    </Row>
  );

  onCellClick = (record, dataIndex) => {
    const { list } = this.state;
    const newRecord = {...record};
    newRecord[`${dataIndex}selected`] = !newRecord[`${dataIndex}selected`];
    this.setState({ list: list.map(item => item.key === newRecord.key ? newRecord : item) });
  };

  renderBackgroundColor = (record, dataIndex) => {
    let color = null;
    if (record[`${dataIndex}selected`]) {
      color = '#1890FF';
    } else {
      switch (record[`${dataIndex}status`]) {
        // 周一 ~ 周五
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        // 周六 ~ 周日
        case 6:
        case 7:
          color = '#009900';
          break;
        // 节假日
        case 8:
          color = '#FFFF00';
          break;
        // 未设定
        default:
          color = '#FF5757';
          break;
      }
    }
    return color;
  };

  renderCell = (dataIndex, record) => (
    <div className={this.createClassName(`${dataIndex}Selected`, record)} style={{ padding: 16 }}>
      ¥ {formatterPrice(record[dataIndex])}
    </div>
  );

  renderText = (record, dataIndex) => {
    let text;
    if (moment(record[dataIndex]).isoWeekday() !== record[`${dataIndex}status`]) {
      switch (record[`${dataIndex}status`]) {
        // 周一 ~ 周五
        case 1:
          text = '周一价';
          break;
        case 2:
          text = '周二价';
          break;
        case 3:
          text = '周三价';
          break;
        case 4:
          text = '周四价';
          break;
        case 5:
          text = '周五价';
          break;
        // 周六 ~ 周日
        case 6:
          if (moment(record[dataIndex]).isoWeekday() !== 7) {
            text = '周末价';
          }
          break;
        case 7:
          if (moment(record[dataIndex]).isoWeekday() !== 6) {
            text = '周末价';
          }
          break;
        // 节假日
        case 8:
          text = '节假日价';
          break;
        // 未设定
        default:
          break;
      }
    }
    return text;
  };

  render() {
    const { data } = this.props;
    const { list } = this.state;

    const columns = [
      ...days.map(item => ({
        key: item,
        width: 100,
        align: 'center',
        dataIndex: item,
        title: getWeekChinese(item),
        onCell: record => ({
          onClick: () => this.onCellClick(record, item),
        }),
        // render: (value, record) => this.renderCell(item, record),
        render: (value, record) => value && (
          <div style={{ padding: '16px 0', height: 74, backgroundColor: this.renderBackgroundColor(record, item) }}>
            <div style={this.renderText(record, item) ? undefined : { lineHeight: '42px' }}>{moment(value).format('DD')}</div>
            <div>{this.renderText(record, item)}</div>
          </div>
        )
      }))
    ];
    const weeks = [
      { key: 1, name: '周一价' },
      { key: 2, name: '周二价' },
      { key: 3, name: '周三价' },
      { key: 4, name: '周四价' },
      { key: 5, name: '周五价' },
      { key: 6, name: '周六价' },
      { key: 7, name: '周日价' },
      { key: 8, name: '节假日价' },
    ];
    const signList = [
      { key: 1, color: '#009900', label: '周末价' },
      { key: 2, color: '#FFFF00', label: '节假日价' },
      { key: 3, color: null, label: '工作日价' },
      { key: 4, color: '#FF5757', label: '未设定' },
    ];

    return (
      <Row>
        <Col align='center'>
          <div className={styles.globalTable}>
            <Table
              rowKey='key'
              bodyStyle={{ margin: 0 }}
              title={() => this.renderCardTitle(data.year, data.month)}
              bordered
              pagination={false}
              columns={columns}
              dataSource={list}
            />
          </div>
        </Col>
        <Col style={{ padding: '24px 0' }}>{signList.map(item => renderSign(item))}</Col>
        <Col className={styles.paddingTop}>
          {weeks.map((item, i) =>
            <Button key={item.key} onClick={() => this.setPrice(item.key)} style={i !== 0 ? { marginLeft: 24 } : undefined}>{item.name}</Button>
          )}
        </Col>
        <FooterToolbar>
          <div style={{ textAlign: 'center' }}>
            <Button onClick={() => this.onResetClickStatus()}>恢复日期</Button>
            <Button onClick={() => this.goBack()}>返回</Button>
          </div>
        </FooterToolbar>
      </Row>
    );
  }
}

export default index;
