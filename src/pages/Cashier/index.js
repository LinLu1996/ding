import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import {
  Card,
  Form,
  Button,
  Table,
  Tooltip,
  Tag,
  Divider,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import classNames from 'classnames';
import styles from './index.less';
import Ellipsis from '../../components/Ellipsis';
import { noMatch } from '../../utils/authority';
import Authorized from '../../utils/Authorized';

@Form.create()
@connect(({ cashier,courts, loading }) => ({
  cashier,courts,
  loading: loading.models.cashier,
}))

class PersonalCenter extends Component {
  action = {
    soprtList: 'cashier/sportlist',
    venueName:'cashier/findcourtinfo',
    cashierList:'cashier/cashierlist',
    setSportName:'cashier/handleSetSportName',
  };

  state = {
    current: 1,
    pageSize: 10,
    dataSoure: [],
    flag: true
  };

  componentDidMount() {
    const {
      dispatch,
    } = this.props;
    const p={
      type:1
    };
    dispatch({
      type: this.action.soprtList,
      payload: p,
    }).then(() =>{
      const {cashier:{sportListResult},cashier:{sportType,venueType}}=this.props;
      if (sportListResult&&sportListResult.data&&sportListResult.data.length>0&&sportListResult.data[0].id) {
        if(sportType === null && venueType===0) {
          dispatch({
            type:this.action.setSportName,
            payload:{
              sportType:sportListResult&&sportListResult.data&&sportListResult.data.length>0&&sportListResult.data[0].id,
            }
          });
        }
        const param={
          sportId:sportType?sportType:sportListResult&&sportListResult.data&&sportListResult.data.length>0&&sportListResult.data[0].id,
        };
        dispatch({
          type: this.action.venueName,
          payload: param,
        })
        const params={
          venueId:venueType!==0 ? venueType : null,
          sportId:sportType?sportType:sportListResult&&sportListResult.data&&sportListResult.data.length>0&&sportListResult.data[0].id,
          pageSize:10,
          pageNo:1,
          machineType:1,
        }
        dispatch({
          type: this.action.cashierList,
          payload: params,
        })
      }

    });




  }


  /**
   * @Author luzhijian
   * @Description //列表list
   * @Date 23:21 2019/1/2
   * @Param
   * @return
   * */

  handleVenueClick=(value)=>{
    const {
      dispatch,
      cashier:{sportType}
    } = this.props;
    const param1 = {
      venueType:value,
      sportType,
    }
    dispatch({
      type: this.action.setSportName,
      payload: param1,
    })
    this.setState({
      venueType:value,
      current:1,
    });

    const param={
      venueId:value===0?null:value,
      sportId:sportType,
      pageSize:10,
      pageNo:1,
      machineType:1,
    }

    dispatch({
      type: this.action.cashierList,
      payload: param,
    });
  }


  handleSportClick=(value)=>{
    const {
      dispatch,
    } = this.props;

    const params={
      sportId:value,
    };
    const param1 = {
      sportType:value,
      venueType:0,
    }
    dispatch({
      type: this.action.setSportName,
      payload: param1,
    })
    dispatch({
      type: this.action.venueName,
      payload: params,
    });

    const param={
      venueId:null,
      sportId:value,
      pageSize:10,
      pageNo:1,
      machineType:1,
    }

    dispatch({
      type: this.action.cashierList,
      payload: param,
    });


  };




  handleSale=(record)=>{
    // const {cashier:{sportType,venueType}}=this.props;
    const pathname = `/cashier/cashierList/add`;
    const query = {
      ticketBasicId: record.ticketBasicId,
      // record:re,
      // sportId:sportType,
      // venueId:venueType,
    };
    router.push({
      pathname,
      query,
    });
  }

  handleDetail=(re)=>{
    const {cashier:{sportType,venueType}}=this.props;
    const pathname = `/cashier/cashierList/detail`;
    const query = {
      record:re,
      sportId:sportType,
      venueId:venueType,
    };
    router.push({
      pathname,
      query,
    });
    }


  all=()=>{
    const {venueType}=this.state;
    if(venueType===0){
      return (
        <Button
          onClick={()=>this.handleVenueClick(0)}
          type="primary"
          style={{marginRight:"1%",width:141,marginTop:4,backgroundColor:"#1890ff",marginBottom:24}}
        >
          全部
        </Button>
      )
    }
    else {
      return (
        <Button
          onClick={()=>this.handleVenueClick(0)}
          type="primary"
          style={{marginRight:"1%",width:141,marginTop:4,backgroundColor:"#FFFFFF",border:'1px solid #000000',color:"#000000",marginBottom:24}}
        >
          全部
        </Button>
      )
    }

  };

  // 分页
  handleTableChange = (current, pageSize) => {
    this.setState(
      {
        current,
        pageSize,
      },
      () => {
        this.handleQelect();
      }
    );
  };


  handleQelect=()=>{
    const {
      dispatch,
    } = this.props;

    const {current,pageSize,venueType}=this.state;
    const {cashier:{sportType}}=this.props;
    const param={
      venueId:venueType===0?null:venueType,
      sportId:sportType,
      pageSize,
      pageNo:current,

    };

    dispatch({
      type: this.action.cashierList,
      payload: param,
    });


  };

  render() {
    const selectedTag = classNames(styles.selectedTag, styles.normalTag);
    const defaultTag = classNames(styles.defaultTag, styles.normalTag);
    const { cashier:{sportListResult},cashier:{findCourtInfoResult,cashierListResult,sportType,venueType} } = this.props;
    const {current,pageSize}=this.state;
    const columns = [
      {
      title: '票名',
      dataIndex: 'ticketName',
        key:'ticketName',
        render: (text, record) =>
          <span>
            <a disabled={record.currentStock===0} onClick={() => this.handleSale(record)}>{record.ticketName}</a>
          </span>
      },
      {
        title: '适用时间范围',
        dataIndex: 'applyCourtName',
        key:'applyCourtName',
        render: (text, record) =>
          <span>
            {record.applyDateStart}--{record.applyDateEnd}
          </span>
      },
     //  {
     //  title: '适用日期范围',
     //  dataIndex: 'date',
     //    key:'date',
     //    render: (text, record) => {
     //        return (
     //          <span>
     //            {record.applyDateStart}--{record.applyDateEnd}
     //          </span>
     //        )
     //
     //    }
     // },
     //  {
     //    title: '适用日期类型',
     //    dataIndex: 'applyDateString',
     //    key:'applyDateString',
     //  },
     //  {
     //    title: '适用时间范围',
     //    dataIndex: 'time',
     //    key:'time',
     //    render: (text, record) => {
     //      return (
     //        <span>
     //          {(record.applyTimeStart)&&(record.applyTimeStart).substring(0,record.applyTimeStart.length-3)}--{(record.applyTimeEnd)&&(record.applyTimeEnd).substring(0,record.applyTimeEnd.length-3)}
     //        </span>
     //      )
     //
     //    }
     //  },
      {
        title: '使用时长(分钟)',
        dataIndex: 'duration',
        key:'duration',
      },
      {
        title: '价格（元）',
        dataIndex: 'ticketSalePrice',
        key:'ticketSalePrice',
      },
      // {
      //   title: '库存',
      //   dataIndex: 'currentStock',
      //   key:'currentStock',
      // },
      {
        title:"操作",
        key:"action",
        dataIndex: 'action',
        render: (text, record) =>
          <span>
            <Authorized authority='jis_platform_dc_cashier_sale_ticket' nomatch={noMatch()}>
              <a disabled={record.currentStock===0} onClick={() => this.handleSale(record)}>售票</a>
            </Authorized>
            <Authorized authority='jis_platform_dc_cashier_sale_detail' nomatch={noMatch()}>
              <Divider type="vertical" />
              <a onClick={() => this.handleDetail(record)}>详情</a>
            </Authorized>
          </span>


      }

    ];
    return (
      <PageHeaderWrapper
        title="售票"
      >
        <Card style={{ height: '100%' }}>
          <Authorized authority='jis_platform_dc_cashier_sale_sport' nomatch={noMatch()}>
            <div>
              {
                sportListResult&&sportListResult.data&&sportListResult.data.map(step =>
                {
                  return (
                    <Tooltip key={step.id} placement="topLeft" title={step.itemName && step.itemName.length > 8 ? step.itemName : undefined}>
                      <Tag.CheckableTag
                        className={sportType === step.id ? selectedTag : defaultTag}
                        style={{ marginRight: 5, marginTop: 24 }}
                        checked={sportType === step.id}
                        onChange={() => this.handleSportClick(step.id)}
                      >
                        <Ellipsis length={8}>{step.itemName}</Ellipsis>
                      </Tag.CheckableTag>
                    </Tooltip>
                  )
               })
              }
            </div>
          </Authorized>
          <Authorized authority='jis_platform_dc_cashier_sale_court' nomatch={noMatch()}>
            <div>
              <span>
                <Tooltip key={0} placement="topLeft" title="全部">
                  <Tag.CheckableTag
                    className={venueType === 0 ? selectedTag : defaultTag}
                    style={{ marginRight: 5, marginTop: 4 }}
                    checked={venueType === 0}
                    onChange={() => this.handleVenueClick(0)}
                  >
                    <Ellipsis length={8}>全部</Ellipsis>
                  </Tag.CheckableTag>
                </Tooltip>
              </span>


              {
                findCourtInfoResult&&findCourtInfoResult.data&&findCourtInfoResult.data.map(step =>
                {
                  return (
                    <Tooltip key={step.id} placement="topLeft" title={step.courtName && step.courtName.length > 8 ? step.courtName : undefined}>
                      <Tag.CheckableTag
                        className={venueType === step.id ? selectedTag : defaultTag}
                        style={{ marginRight: 5, marginTop: 4 }}
                        checked={venueType === step.id}
                        onChange={() => this.handleVenueClick(step.id)}
                      >
                        <Ellipsis length={8}>{step.courtName}</Ellipsis>
                      </Tag.CheckableTag>
                    </Tooltip>
                  )
                })
              }
            </div>
          </Authorized>

          <div className={styles.resTable}>
            <Table
              rowKey='ticketBasicId'
              pagination={{
              current,
              pageSize,
              defaultCurrent: current,
              defaultPageSize: pageSize,
              total: cashierListResult&& cashierListResult.data && cashierListResult.data.total,
              onChange: this.handleTableChange,
            }}
              scroll={{x:1200}}
              columns={columns}
              dataSource={cashierListResult&&cashierListResult.data&&cashierListResult.data.list}
            />
          </div>

        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default PersonalCenter;
