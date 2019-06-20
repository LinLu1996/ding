import React, { Component } from 'react';
import { Row, Col, Button, Icon, Table, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import request from '../../../../utils/request';
import { handleResponse } from '../../../../utils/globalUtils';
import { getEnterprise } from '../../../../utils/enterprise';
import styles from '../../index.less';

const dateFormat = 'YYYY-MM-DD';

/**
 * @author turing
 */

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      year: props.year,
      sportItem: props.sportItem,
      selectedDate: undefined,
      dynamicColumns: {},
      originalList: {},
    };
  }

  componentWillMount() {
    const { onRef } = this.props;
    onRef(this);
    this.initialDate();
  }

  componentWillReceiveProps(nextProps) {
    const { year, sportItem } = this.state;
    if (year !== nextProps.year || sportItem !== nextProps.sportItem) {
      this.setState({
        year: nextProps.year,
        sportItem: nextProps.sportItem,
      }, () => this.fetchDataSource());
    } else {
      this.fetchDataSource();
    }
  }

  initialDate = () => {
    const { year, selectedDate } = this.state;
    if (!selectedDate && year) {
      this.setState({ selectedDate: moment(year, 'YYYY').dayOfYear(1).format(dateFormat) }, () => this.fetchDataSource());
    }
  };

  /**
   * 重置数据列表
   */
  resetOriginalList = () => {
    this.setState({ originalList: {} }, () => this.fetchDataSource());
  };

  fetchDataSource = () => {
    const { sportItem, selectedDate, originalList } = this.state;
    if (!originalList[sportItem] || !originalList[sportItem][selectedDate] || originalList[sportItem][selectedDate].length === 0) {
      request(`/venuebooking/court/datePreviewPrice?sportItemId=${sportItem}&saleDate=${selectedDate}`)
        .then(response => {
          if (handleResponse(response)) {
            this.handleDataSource(response);
            this.handleDynamicColumns(response.data.timeUnitList);
          }
        });
    }
  };

  /**
   * 表格数据处理
   * @param response
   */
  handleDataSource = (response) => {
    const { sportItem, selectedDate, originalList } = this.state;
    const { courtList, dataNap } = response.data;
    const newList = [];
    courtList.forEach(court => {
      const object = {};
      object.id = court.id;
      object.court = court.courtName;
      const temp = dataNap[court.id];
      const keys = Object.keys(temp);
      keys.forEach(key => {
        object[key] = temp[key].price;
        object[`${key}status`] = temp[key].status;
      });
      newList.push(object);
    });
    if (originalList[sportItem]) {
      originalList[sportItem][selectedDate] = newList;
    } else {
      originalList[sportItem] = { [selectedDate]: newList };
    }
    this.setState({ originalList });
  };

  /**
   * 时间段处理
   * @param timeUnitList
   */
  handleDynamicColumns = (timeUnitList) => {
    const { sportItem, selectedDate, dynamicColumns } = this.state;
    const newList = timeUnitList.map(item => ({
      // width: 180,
      dataIndex: item,
      title: item,
      align: 'center',
      render: (value, record) => this.renderCell(item, record),
    }));
    if (dynamicColumns[sportItem]) {
      dynamicColumns[sportItem][selectedDate] = newList;
    } else {
      dynamicColumns[sportItem] = { [selectedDate]: newList };
    }
    this.setState({ dynamicColumns });
  };

  fetchColumns = (columns) => {
    const { sportItem, selectedDate } = this.state;
    return columns[sportItem] && columns[sportItem][selectedDate] || [];
  };

  onInputNumberChanged = (value, dataIndex, record) => {
    const { sportItem, selectedDate, originalList } = this.state;
    originalList[sportItem][selectedDate].forEach(item => {
      if (item.id === record.id) {
        const { onChange } = this.props;
        onChange(sportItem, record.id, selectedDate, dataIndex, value, (Number(item[dataIndex]) === Number(value) ? item[`${dataIndex}status`] : 1))
      }
    });
  };

  renderCell = (dataIndex, record) => (
    <div style={{ padding: 2 }}>
      <div style={{ padding: 14, backgroundColor: this.createBackgroundColor(record[`${dataIndex}status`]) }}>
        <InputNumber onChange={value => this.onInputNumberChanged(value, dataIndex, record)} min={0} precision={2} value={record[dataIndex]} />
      </div>
    </div>
  );

  createBackgroundColor = (status) => {
    switch (status) {
      case -1:
        return '#9ACD32';
      case 1:
        return '#F269D6';
      default:
        return null;
    }
  };

  onSelectedDateChanged = (date) => {
    this.setState({ selectedDate: date.format(dateFormat) }, () => this.fetchDataSource());
  };

  calculateDate = (days) => {
    const { selectedDate } = this.state;
    this.setState({ selectedDate: moment(selectedDate).add(days, 'days').format(dateFormat) }, () => this.fetchDataSource());
  };

  renderTableTitle = (selectedDate) => (
    <Row>
      <Col span={6}>
        <Button onClick={() => this.calculateDate(-1)} disabled={moment(selectedDate).format('MM-DD') === '01-01'} type='primary'>
          <Icon type='left' />前一天
        </Button>
      </Col>
      <Col span={12} align='center'>
        <DatePicker
          allowClear={false}
          disabledDate={this.disabledSelectedDate}
          value={selectedDate ? moment(selectedDate) : undefined}
          onChange={this.onSelectedDateChanged}
        />
      </Col>
      <Col span={6} align='right'>
        <Button onClick={() => this.calculateDate(1)} disabled={moment(selectedDate).format('MM-DD') === '12-31'} type='primary'>
          后一天<Icon type='right' />
        </Button>
      </Col>
    </Row>
  );

  disabledSelectedDate = (date) => {
    const { year } = this.state;
    return moment(date).year() !== Number(year);
  };

  /**
   * 初始数据和修改数据对比
   * @param originalList
   * @param dataSource
   * @returns *
   */
  handleList = (originalList, dataSource) => {
    const { sportItem, selectedDate } = this.state;
    let newList = originalList.map(item => ({...item}));
    const sportItems = Object.keys(dataSource);
    sportItems.forEach(sport => {
      if (Number(sportItem) === Number(sport)) {
        const courts = Object.keys(dataSource[sport]);
        courts.forEach(court => {
          const dates = Object.keys(dataSource[sport][court]);
          dates.forEach(date => {
            if (selectedDate === date) {
              const timeUnits = Object.keys(dataSource[sport][court][date]);
              timeUnits.forEach(timeUnit => {
                const object = dataSource[sport][court][date][timeUnit];
                newList = newList.map(item => {
                  const newItem = {...item};
                  if (Number(newItem.id) === Number(court)) {
                    newItem[timeUnit] = object.price;
                    newItem[`${timeUnit}status`] = object.status;
                  }
                  return newItem;
                });
              });
            }
          });
        });
      }
    });
    return newList;
  };

  render() {
    const { dataSource } = this.props;
    const { sportItem, selectedDate, dynamicColumns, originalList } = this.state;

    const columns = [
      {
        width: 250,
        dataIndex: 'court',
        title: '场地',
        fixed: 'left',
        align: 'center',
        render: value => (
          <div style={{ float: 'left', padding: '0 16px' }}>{value}</div>
        ),
      },
      ...this.fetchColumns(dynamicColumns),
    ];

    return (
      <div className={styles.globalTable}>
        <Table
          bordered
          scroll={{ x: 180 * columns.length + 70 }}
          title={() => this.renderTableTitle(selectedDate)}
          pagination={false}
          rowKey='id'
          columns={columns}
          dataSource={originalList[sportItem] && originalList[sportItem][selectedDate]
            ? this.handleList(originalList[sportItem][selectedDate], dataSource) : []}
        />
      </div>
    );
  }
}

export default index;
