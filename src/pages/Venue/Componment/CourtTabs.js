import React, { Component } from 'react';
import { connect } from 'dva';
import { Tabs } from 'antd';
import request from '../../../utils/request';
import { handleResponse } from '../../../utils/globalUtils';

/**
 * @author turing
 */

@connect(({ preview, loading }) => ({
  data: preview,
  loading: loading.models.preview,
}))
class CourtTabs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sportItemId: props.sportItemId,
      courtList: [],
    };
  }

  componentWillMount() {
    this.getCourtList();
  }

  componentWillReceiveProps(nextProps) {
    const { sportItemId } = this.state;
    if (nextProps.sportItemId !== sportItemId) {
      this.setState({ sportItemId: nextProps.sportItemId }, () => this.getCourtList());
    }
  }

  getCourtList = () => {
    const { sportItemId } = this.state;
    if (sportItemId) {
      request(`/venuebooking/court/getCourtList?sportItemId=${sportItemId}`)
        .then(response => {
          if (handleResponse(response)) {
            this.setState({ courtList: response.data.map(item => ({ ...item })) }, () => this.setActiveKey());
          }
        });
    }
  };

  setActiveKey = (activeKey) => {
    const { onChange } = this.props;
    const { courtList } = this.state;
    onChange(activeKey || (courtList.length > 0 ? courtList[0].id.toString() : undefined));
  };

  onSubmit = () => {
    const { onOk,  activeKey } = this.props;
    onOk(activeKey);
  };

  render() {
    const { activeKey } = this.props;
    const { courtList } = this.state;

    return (
      <Tabs activeKey={activeKey} onChange={this.setActiveKey} type="card">
        {courtList.map(item => <Tabs.TabPane tab={item.courtName} key={item.id} />)}
      </Tabs>
    );
  }
}

export default CourtTabs;
