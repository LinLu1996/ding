import React, { Component } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Button, Icon } from 'antd';
import moment from 'moment';
import PageHeaderWrapper from '../../../components/PageHeaderWrapper';
import Authorized from '../../../utils/Authorized';
import { noMatch } from '../../../utils/authority';
import Calendars from '../Components/Calendars';
import { renderSign } from '../../../utils/globalUtils';

/**
 * @author turing
 */

@connect(({ dateSetting, loading }) => ({
  data: dateSetting,
  loading: loading.models.dateSetting,
}))
class index extends Component {
  calculateYear = (number) => {
    const { dispatch, data: { year } } = this.props;
    dispatch({
      type: 'dateSetting/setState',
      payload: {
        year: moment(year, 'YYYY').add(number, 'years').year(),
      }
    });
  };

  render() {
    const { data } = this.props;

    const cardTitle = (
      <Row>
        <Col span={6}>
          <Authorized authority='jis_platform_dc_system_date_last' nomatch={noMatch()}>
            <Button onClick={() => this.calculateYear(-1)} type='primary'><Icon type='left' />上一年</Button>
          </Authorized>
        </Col>
        <Col span={12} align='center' style={{ marginTop: 4 }}>{data.year}</Col>
        <Col span={6} align='right'>
          <Authorized authority='jis_platform_dc_system_date_next' nomatch={noMatch()}>
            <Button onClick={() => this.calculateYear(1)} type='primary'>下一年<Icon type='right' /></Button>
          </Authorized>
        </Col>
      </Row>
    );
    const signList = [
      { key: 1, color: '#009900', label: '周末价' },
      { key: 2, color: '#FFFF00', label: '节假日价' },
      { key: 3, color: null, label: '工作日价' },
      { key: 4, color: '#FF5757', label: '未设定' },
    ];

    return (
      <PageHeaderWrapper>
        <Card
          title={cardTitle}
        >
          <Calendars year={data.year} />
          <Row><Col style={{ padding: '24px 0' }}>{signList.map(item => renderSign(item))}</Col></Row>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default index;
