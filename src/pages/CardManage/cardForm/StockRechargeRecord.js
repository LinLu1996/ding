import React, { Component } from 'react';
import { Table } from 'antd';
import numeral from 'numeral';
import request from '../../../utils/request';
import { handleResponse } from '../../../utils/globalUtils';

const priceFormatter = '0,0.00';

/**
 * @author turing
 */

class StockRechargeRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.cardNo) {
      this.fetchList(nextProps.cardNo);
    } else {
      this.setState({ list: [] });
    }
  }

  fetchList = (cardNo) => {
    request(`/venuebooking/memberCard/chargeRecord?cardNo=${cardNo}`)
      .then(response => {
        if (handleResponse(response)) {
          this.setState({ list: response.data });
        }
      });
  };

  render() {
    const { list } = this.state;

    const columns = [
      { dataIndex: "transactionAmount", title: "充值金额", render: value => numeral(value).format(priceFormatter) },
      { dataIndex: "accountAmount", title: "到账金额", render: value => numeral(value).format(priceFormatter) },
      { dataIndex: "transactionAmountBalance", title: "充值后余额", render: value => numeral(value).format(priceFormatter) },
      { dataIndex: "createDate", title: "充值日期" },
    ];

    return (
      <Table
        bordered
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={list}
        pagination={{
          defaultCurrent: 1,
          defaultPageSize: 5,
          // showQuickJumper: true,
          // showSizeChanger: true,
          // pageSizeOptions: ["5", "10", "20", "30", "50"],
        }}
      />
    );
  }
}

export default StockRechargeRecord;
