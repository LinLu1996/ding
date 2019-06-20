import React, { Component } from 'react';
import { Row, Col, Spin } from 'antd';
import Calendar from './Calendar';
import request from '../../../../utils/request';
import { getEnterprise } from '../../../../utils/enterprise';
import { handleResponse } from '../../../../utils/globalUtils';

/**
 * @author turing
 */

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      year: props.year,
      list: [],
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  componentWillReceiveProps(nextProps) {
    const { year } = this.state;
    if (nextProps.year && year !== nextProps.year) {
      this.setState({ year: nextProps.year }, () => this.fetchData());
    }
  }

  fetchData = () => {
    const { year } = this.state;
    this.setState({ loading: true });
    request(`/venuebooking/calendar/saleDateList?year=${year}`)
      .then(response => {
        if (handleResponse(response)) {
          const list = [];
          const months = Object.keys(response.data);
          months.forEach(month => {
            list.push({ month, dataSource: response.data[month] });
          });
          this.setState({ list });
        }
        this.setState({ loading: false });
      });
  };

  render() {
    const { year, list, loading } = this.state;

    return (
      <Spin spinning={loading}>
        <Row>
          {list.map(item =>
            <Col xxl={6} xl={8} md={12} sm={24} key={item.month} style={{ marginBottom: 24 }} align='center'>
              <Calendar year={year} month={item.month} dataSource={item.dataSource} />
            </Col>
          )}
        </Row>
      </Spin>
    );
  }
}

export default Index;
