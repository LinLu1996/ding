import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Tabs } from 'antd';
import PageHeaderWrapper from '../../components/PageHeaderWrapper';
import UsageRecord from './UsageRecord';
import UsageStatus from './UsageStatus';

/**
 * @author turing
 */

@connect(({ tabs, loading }) => ({
  data: tabs,
  loading: loading.models.tabs,
}))
class index extends Component {
  componentDidMount() {
    this.onTabsChange("2")
  }

  onTabsChange = (activeKey) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'tabs/onStateChange',
      payload: {
        activeKey,
      },
    });
  };

  render() {
    const { data } = this.props;

    return (
      <PageHeaderWrapper>
        <Card>
          <Tabs onChange={this.onTabsChange} type="card" activeKey={data.activeKey}>
            {/* <Tabs.TabPane tab='查询入闸/出闸记录' key="1" /> */}
            <Tabs.TabPane tab='箱子状态' key="2">
              <UsageStatus />
            </Tabs.TabPane>
            <Tabs.TabPane tab='使用记录' key="3">
              <UsageRecord />
            </Tabs.TabPane>
          </Tabs>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default index;
