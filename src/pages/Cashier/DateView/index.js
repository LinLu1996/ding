import React, { Component } from 'react';
import { Row, Col, Button, Icon, Table, DatePicker, InputNumber } from 'antd';
import moment from 'moment';
import request from '../../../utils/request';
import { handleResponse } from '../../../utils/globalUtils';
import { getEnterprise } from '../../../utils/enterprise';
import styles from '../index.less';
import { noMatch } from '../../../utils/authority';
import Authorized from '../../../utils/Authorized';

const dateFormat = 'YYYY-MM-DD';

/**
 * @author turing
 */

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      con:props.con,
      year: props.year,
      sportItem: props.sportItem,
      selectedDate: props.year,
      dynamicColumns: [],
      originalList: {},
      list: {},
      divFlag:false,
      bookSelectIds:[],// 订场销售选中的ids
    };
  }

  componentWillMount() {
    this.initialDate();
  }

  componentWillReceiveProps(nextProps) {
    const {sportItem,con}=this.state;
    if (nextProps.year && nextProps.sportItem && (sportItem!==nextProps.sportItem ||con!== nextProps.con)) {

      this.setState({
        con:nextProps.con,
        year: nextProps.year,
        sportItem: nextProps.sportItem,
        bookSelectIds:nextProps.bookSelectIds,
      }, () => this.fetchDataSource());
    }
  }

  initialDate = () => {
    const { year, selectedDate } = this.state;
    // if (!selectedDate && year) {
    //   this.setState({ selectedDate: moment(year, 'YYYY').dayOfYear(1).format(dateFormat) }, () => this.fetchDataSource());
    this.fetchDataSource()
    // }
  };

  fetchDataSource = () => {
    const { sportItem, selectedDate, originalList,year} = this.state;

      request(`/venuebooking/cashier/courtBook?sportItemId=${sportItem}&saleDate=${selectedDate}`)
        .then(response => {
          if (response&&response.data==="无可用场地") {
            this.setState({dynamicColumns:[]});
          }
          else {
            if (handleResponse(response)) {
              // 放table数据
              this.handleDataSource(response);
              // 放dates
              if (response.data&&response.data.timeUnitList) {
                this.handleDynamicColumns(response.data.timeUnitList);
              }

            }
          }

        });
    // }
  };

  /**
   * 表格数据处理
   * @param response
   */

  handleDataSource = (response) => {
    const { sportItem, selectedDate, originalList, list } = this.state;
    const { courtList, dataNap } = response.data;
    const newList = [];
    if (courtList&&courtList.length>0){
      courtList.forEach(court => {
        const object = {};
        object.id = court.id;
        object.court = court.courtName;
        const temp = dataNap[court.id];
        const keys = Object.keys(temp);
        keys.forEach(key => {
          object[key] = temp[key];
          object[`${key}status`] = temp[key].status;
        });
        newList.push(object);
      });
    }


    if (originalList[sportItem]) {
      originalList[sportItem][selectedDate] = newList;
      list[sportItem][selectedDate] = newList;
    } else {
      originalList[sportItem] = { [selectedDate]: newList };
      list[sportItem] = { [selectedDate]: newList };
    }
    this.setState({ originalList, list });
  };

  /**
   * 时间段处理
   * @param timeUnitList
   */
  handleDynamicColumns = (timeUnitList) => {

    this.setState({
      dynamicColumns: timeUnitList.map(item => ({
        width: 180,
        dataIndex: item,
        title: item,
        align: 'center',
        render: (value, record) => this.renderCell(item, record),
      })),
    });
  };

  replaceRecord = (object) => {
    const { sportItem, selectedDate, list } = this.state;
    list[sportItem][selectedDate].map(item => item.id === object.id ? {...object} : {...item});
    this.setState({ list });
  };

  onInputNumberChanged = (value, dataIndex, record) => {
    const { sportItem, selectedDate, originalList } = this.state;
    const object = {...record};
    originalList[sportItem][selectedDate].forEach(item => {
      if (item.court === record.court) {
        object[`${dataIndex}status`] = (Number(item[dataIndex]) === Number(value) ? item[`${dataIndex}status`] : 1);
        object[dataIndex] = value;
      }
    });
    this.replaceRecord(object);
  };

  handleValueToFather=(id,status,dataIndex)=>{
    const { sportItem, selectedDate, dynamicColumns, bookSelectIds,list, originalList } = this.state;

    const newList = {...list};

    const list3 = newList[sportItem][selectedDate];
    for(let i=0;i<list3.length;i++){
      if (list3[i][`${dataIndex}`].courtSaleId===id&&(list3[i][`${dataIndex}status`]===0)) {
        let f=false;
        for (let j=0;j<bookSelectIds.length;j+=1){
          if (bookSelectIds[j]===id){
            f=true
          }
        }
        if (!f){
          this.props.handleValue(id);
        }
        else {
          this.props.handleValueDelete(id);
        }
      }
    }

    this.setState({list: newList});

};

  handleDoubleValueToFather=(id)=>{
    this.props.handleDoubleValue(id);
  };

  renderDiv=(dataIndex,record,bookSelectIds)=>{
    if (bookSelectIds.length>0) {
        let flag = false;
        for(let i = 0;i < bookSelectIds.length; i+=1) {
        if (bookSelectIds[i]===record[dataIndex].courtSaleId) {
          flag=true;
           break;
        }
      }

      if(flag){
        return (
          <div
            style={{ padding: 14, backgroundColor:this.createBackgroundColor(8)}}
            onClick={()=>record[`${dataIndex}status`]===0&&this.handleValueToFather(record[dataIndex].courtSaleId,record[`${dataIndex}status`],dataIndex)}
            onDoubleClick={()=>record[`${dataIndex}status`]===0&&this.handleDoubleValueToFather(record[dataIndex].courtSaleId)}
          >
            {
              record[dataIndex].tip==="空"&&
              <span>
              空
                    </span>
            }
            {
              record[dataIndex].tip==="闭"&&
              <span>
              闭
                    </span>
            }
            {
              record[dataIndex].tip==="核"&&
              <span>
              核
                {record[dataIndex].memberTel}
                    </span>
            }
            {
              record[dataIndex].tip==="订"&&
              <span>
              订
                {record[dataIndex].memberTel}
                    </span>
            }
          </div>
        )
      }

      return (
        <div
          style={{ padding: 14, backgroundColor: this.createBackgroundColor(record[`${dataIndex}status`]) }}
          onClick={()=>record[`${dataIndex}status`]===0&&this.handleValueToFather(record[dataIndex].courtSaleId,record[`${dataIndex}status`],dataIndex)}
          onDoubleClick={()=>record[`${dataIndex}status`]===0&&this.handleDoubleValueToFather(record[dataIndex].courtSaleId)}
        >
          {
            record[dataIndex].tip==="空"&&
            <span>
              空
                    </span>
          }
          {
            record[dataIndex].tip==="闭"&&
            <span>
              闭
                    </span>
          }
          {
            record[dataIndex].tip==="核"&&
            <span>
              核
              {record[dataIndex].memberTel}
                    </span>
          }
          {
            record[dataIndex].tip==="订"&&
            <span>
              订
              {record[dataIndex].memberTel}
                    </span>
          }
        </div>
      );
    }
    else {
      return (
        <div
          style={{ padding: 14, backgroundColor: this.createBackgroundColor(record[`${dataIndex}status`]) }}
          onClick={()=>record[`${dataIndex}status`]===0&&this.handleValueToFather(record[dataIndex].courtSaleId,record[`${dataIndex}status`],dataIndex)}
          onDoubleClick={()=>record[`${dataIndex}status`]===0&&this.handleDoubleValueToFather(record[dataIndex].courtSaleId)}
        >
          {
            record[dataIndex].tip==="空"&&
            <span>
              空
                </span>
          }
          {
            record[dataIndex].tip==="闭"&&
            <span>
              闭
                </span>
          }
          {
            record[dataIndex].tip==="核"&&
            <span>
              核
              {record[dataIndex].memberTel}
                </span>
          }
          {
            record[dataIndex].tip==="订"&&
            <span>
              订
              {record[dataIndex].memberTel}
                </span>
          }
        </div>
      )
    }
  };




  renderCell = (dataIndex, record) =>{
    const {bookSelectIds}=this.state;
    return  (
      <div style={{ padding: 2 }}>
        {
          this.renderDiv(dataIndex,record,bookSelectIds)

        }


      </div>
    );
  }

  createBackgroundColor = (status) => {
    switch (status) {
      case 1:
        return '#FF0000';
      case 2:
        return '#0080C0';
      case 3:
        return '#CCCCCC';
      case 4:
        return '#CCCCCC';
      case 5:
        return '#CCCCCC';
      case 6:
        return '#99FFFF';
      case 7:
        return '#CCCCCC';
      case 8:
        return '#FF1493';
      default:
        return 'white';
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
        <Authorized authority='jis_platform_dc_cashier_order_yesterday' nomatch={noMatch()}>
          <Button onClick={() => this.calculateDate(-1)} disabled={moment(selectedDate).format('MM-DD') === '01-01'} type='primary'>
            <Icon type='left' />前一天
          </Button>
        </Authorized>
      </Col>
      <Col span={12} align='center'>
        <DatePicker
          allowClear={false}
          // disabledDate={this.disabledSelectedDate}
          value={selectedDate ? moment(selectedDate) : undefined}
          onChange={this.onSelectedDateChanged}
        />
      </Col>
      <Col span={6} align='right'>
        <Authorized authority='jis_platform_dc_cashier_order_tomorrow' nomatch={noMatch()}>
          <Button onClick={() => this.calculateDate(1)} disabled={moment(selectedDate).format('MM-DD') === '12-31'} type='primary'>
            后一天<Icon type='right' />
          </Button>
        </Authorized>
      </Col>
    </Row>
  );

  disabledSelectedDate = (date) => {
    const { year } = this.state;
    return date.format('YYYY') !== year;
  };

  render() {
    const { sportItem, selectedDate, dynamicColumns, list } = this.state;
    const columns = [
      {
        width: 250,
        dataIndex: 'court',
        title: '场地',
         fixed: dynamicColumns.length>6?"left":false,
        align: 'center',
        render: value => (
          <div style={{ padding: '0 16px' }}>{value}</div>
        ),
      },
      ...dynamicColumns,
    ];
    return (
      <div className={styles.globalTable}>
        <Table
          bordered
          scroll={{ x: 180 * columns.length+ 80 }}
          title={() => this.renderTableTitle(selectedDate)}
          pagination={false}
          rowKey='id'
          columns={columns}
          dataSource={list[sportItem] && list[sportItem][selectedDate] ? list[sportItem][selectedDate] : []}
        />
      </div>
    );
  }
}

export default Index;
