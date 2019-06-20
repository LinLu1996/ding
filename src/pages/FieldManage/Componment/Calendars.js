import React, { Component } from 'react';
import { Row, Col, Spin } from 'antd';
import Calendar from './Calendar';
import request from '../../../utils/request';
import { handleResponse } from '../../../utils/globalUtils';

/**
 * @author turing
 */

class Calendars extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      year: props.year,
      court: props.court,
      list: [],
    };
  }

  componentWillMount() {
    this.fetchData();
  }

  componentWillReceiveProps(nextProps) {
    const { year, court } = this.state;
    if (year !== nextProps.year || court !== nextProps.court) {
      this.setState({
        year: nextProps.year,
        court: nextProps.court,
      }, () => this.fetchData());
    } else {
      this.fetchData();
    }
  }

  fetchData = () => {
    const { year, court } = this.state;
    if (year && court) {
      this.setState({ loading: true });
      request(`/venuebooking/calendar/cadenlarTypeList?year=${year}&courtId=${court}`)
        .then(response => {
          if (handleResponse(response)) {
            this.setState({ list: response.data.responseList });
          }
          this.setState({ loading: false });
        });
    }
  };

  render() {
    const { list, loading } = this.state;
    return (
      <Spin spinning={loading}>
        <Row>
          {list.map(item =>
            <Col xxl={6} xl={8} md={12} sm={24} key={Object.keys(item)[0]} style={{ marginBottom: 24 }} align='center'>
              <Calendar {...this.props} dataSource={item} />
            </Col>
          )}
        </Row>
      </Spin>
    );
  }
}

export default Calendars;
