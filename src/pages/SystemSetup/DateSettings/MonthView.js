import React, { Component } from 'react';
import { connect } from 'dva';
import { Card } from 'antd';
import PageHeaderWrapper from '../../../components/PageHeaderWrapper';
import MonthSetting from '../Components/MonthSetting';

/**
 * @author turing
 */

@connect(({ dateSetting, loading }) => ({
  data: dateSetting,
  loading: loading.models.dateSetting,
}))
class MonthView extends Component {
  render() {
    return (
      <PageHeaderWrapper>
        <Card>
          <MonthSetting />
        </Card>
        <div style={{ padding: 28 }} />
      </PageHeaderWrapper>
    );
  }
}

export default MonthView;
