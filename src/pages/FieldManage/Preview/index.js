import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Row, Col, Tabs, Button } from 'antd';
import moment from 'moment';
import PageHeaderWrapper from '../../../components/PageHeaderWrapper';
import Projects from '../Componment/Projects';
import Calendars from '../Componment/Calendars';
import CourtTabs from '../Componment/CourtTabs';
import CourtView from '../Componment/CourtView';
import DateView from '../Componment/DateView';
import { renderSign } from '../../../utils/globalUtils';
import { monthFormat } from '../utils';

/**
 * @author turing
 */

@connect(({ fieldManage, preview, loading }) => ({
  fieldManage,
  data: preview,
  loading: loading.models.preview,
}))
class index extends Component {
  componentWillMount() {
    this.setYear();
  }

  setYear = () => {
    const { dispatch, location: { query } } = this.props;
    const rule = new RegExp(/^\d{4}$/);
    if (query.year && rule.test(query.year)) {
      dispatch({
        type: 'preview/setYear',
        payload: {
          year: query.year,
          month: moment(moment(query.year, 'YYYY').month(0)).format(monthFormat),
          activeKey: 'yearView',
        },
      });
    } else {
      router.push({
        pathname: '/fieldManage/priceSetting/preview',
        query: {
          year: moment().format('YYYY'),
        },
      });
    }
  };

  onTabsChanged = (activeKey) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'preview/onTabsChanged',
      payload: {
        activeKey,
      },
    });
  };

  onCourtTabsChanged = (activeTab) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'preview/onTabsChanged',
      payload: {
        activeTab,
      },
    });
  };

  onDataChanged = (sportItem, court, date, timeUnit, price, status) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'preview/onDataChanged',
      payload: { sportItem, court, date, timeUnit, price, status },
    });
  };

  handleSubmit = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'preview/handleSubmit',
    }).then(() => {
      const { data: {modifiedData} } = this.props;
      if(JSON.stringify(modifiedData)!=="{}") {
        this.onTabsChanged('yearView');
        this.projects1.firstDid();
      }
    });
  };

  reset = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'preview/reset',
      payload: { reset: false },
    });
    if (this.dateViewRef) {
      this.dateViewRef.resetOriginalList();
    }
    if (this.courtViewRef) {
      this.courtViewRef.resetOriginalList();
    }
  };

  render() {
    const { fieldManage, data, dispatch } = this.props;

    if (data.reset) {
      this.reset();
    }
    const extraButton = <Button onClick={() => this.handleSubmit()} type='primary'>生效</Button>;
    const signList1 = [
      { key: 1, color: 'white', label: '已生效' },
      { key: 2, color: '#F269D6', label: '未生效' },
      { key: 3, color: '#CC3300', label: '未设定' },
    ];
    const signList2 = [
      { key: 1, color: '#F269D6', label: '已修改' },
      { key: 2, color: '#9ACD32', label: '未生效' },
      { key: 3, color: 'white', label: '已生效' },
    ];

    return (
      <PageHeaderWrapper>
        <Card>
          <Row gutter={24}>
            <Projects
              onChange={() => {}}
              onRef={inst => {
                this.projects1 = inst;
              }}
            />
          </Row>
          <Row>
            <Col style={{ padding: '8px 0' }}>
              <Tabs type="card" activeKey={data.activeKey} onChange={this.onTabsChanged} tabBarExtraContent={extraButton}>
                <Tabs.TabPane tab="年视图" key='yearView'>
                  <CourtTabs
                    activeKey={data.activeTab}
                    sportItemId={fieldManage.selectedProject}
                    onChange={this.onCourtTabsChanged}
                  />
                  <Calendars dispatch={dispatch} year={data.year} court={data.activeTab} />
                  <Row><Col style={{ paddingTop: 8 }}>{signList1.map(item => renderSign(item))}</Col></Row>
                </Tabs.TabPane>
                <Tabs.TabPane tab="场地视图" key='fieldView'>
                  <CourtTabs
                    activeKey={data.activeTab}
                    sportItemId={fieldManage.selectedProject}
                    onChange={this.onCourtTabsChanged}
                  />
                  <CourtView
                    onRef={ref => {this.courtViewRef = ref}}
                    dispatch={dispatch}
                    year={data.year}
                    month={data.month}
                    sportItem={fieldManage.selectedProject}
                    court={data.activeTab}
                    dataSource={data.modifiedData}
                    onChange={this.onDataChanged}
                  />
                  <Row><Col style={{ paddingTop: 8 }}>{signList2.map(item => renderSign(item))}</Col></Row>
                </Tabs.TabPane>
                <Tabs.TabPane tab="日期视图" key='dateView'>
                  <DateView
                    onRef={ref => {this.dateViewRef = ref}}
                    year={data.year}
                    sportItem={fieldManage.selectedProject}
                    dataSource={data.modifiedData}
                    onChange={this.onDataChanged}
                  />
                  <Row><Col style={{ paddingTop: 8 }}>{signList2.map(item => renderSign(item))}</Col></Row>
                </Tabs.TabPane>
              </Tabs>
            </Col>
          </Row>
        </Card>
      </PageHeaderWrapper>
    );
  }
}

export default index;
