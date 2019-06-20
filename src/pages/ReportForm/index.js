import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Form, Card, Row, Col, Button, Table, Select,Input,Checkbox,Tabs,message } from 'antd';
import moment from 'moment';
import styles from './index.less';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import VenueManagement from './venueManagement';
import { noMatch } from '../../utils/authority';
import Authorized from '../../utils/Authorized';

@Form.create()
@connect(({ reportForm,loading }) => ({
  reportForm,
  loading: loading.models.reduction,
}))
class Reduction extends Component {

  onTabsChanged = (activeKey) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'reportForm/onTabsChanged',
      payload: {
        activeKey,
      },
    })
  };

  render() {
    const { reportForm:{activeKey} } = this.props;
    return (
      <PageHeaderWrapper>
        <Card>
          <Row>
            <Col style={{ padding: '8px 0' }}>
              <Tabs type="card" activeKey={activeKey} onChange={this.onTabsChanged}>
                <Tabs.TabPane tab="场馆经营汇总报表" key='0'>
                  <Authorized authority='jis_platform_dc_report_courts' nomatch={noMatch()}>
                    <VenueManagement />
                  </Authorized>
                </Tabs.TabPane>
                <Tabs.TabPane tab="会员老卡换卡报表" key='1'>
                  <Authorized authority='jis_platform_dc_report_vip' nomatch={noMatch()}>
                    <VenueManagement />
                  </Authorized>
                </Tabs.TabPane>
                <Tabs.TabPane tab="运动项目销售报表" key='2'>
                  <Authorized authority='jis_platform_dc_report_sports' nomatch={noMatch()}>
                    <VenueManagement />
                  </Authorized>
                </Tabs.TabPane>
                <Tabs.TabPane tab="支付情况报表" key='3'>
                  <Authorized authority='jis_platform_dc_report_payment' nomatch={noMatch()}>
                    <VenueManagement />
                  </Authorized>
                </Tabs.TabPane>
              </Tabs>
            </Col>
          </Row>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default Reduction;
