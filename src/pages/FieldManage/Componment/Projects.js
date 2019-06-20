import React, { Component } from 'react';
import { connect } from 'dva';
import { Col, Tag, Tooltip } from 'antd';
import classNames from 'classnames';
import Ellipsis from '../../../components/Ellipsis';
import styles from '../index.less';

/**
 * @author turing
 */

@connect(({ fieldManage, loading }) => ({
  data: fieldManage,
  loading: loading.models.fieldManage,
}))
class Projects extends Component {
  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
    this.initialProjects();
  }

  firstDid = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'fieldManage/initialProjects2',
    }).then(() => {
      this.onProjectChanged();
    });
  }
  /**
   * initial projects
   */
  initialProjects = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'fieldManage/initialProjects',
    }).then(() => {
      this.onProjectChanged();
    });
  };

  onProjectSelected = (selectedProject) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'fieldManage/onProjectSelected',
      payload: {
        selectedProject,
      },
    }).then(() => {
      this.onProjectChanged();
    });
  };

  onProjectChanged = () => {
    const { data: { selectedProject }, onChange } = this.props;
    if (selectedProject) {
      onChange(selectedProject);
    }
  };

  renderProject = (item, index, checked) => {
    const selectedTag = classNames(styles.selectedTag, styles.normalTag);
    const defaultTag = classNames(styles.defaultTag, styles.normalTag);
    return (
      <span key={index} className={styles.globalTag}>
        <Tooltip placement="topLeft" title={item.itemName && item.itemName.length > 8 ? item.itemName : undefined}>
          <Tag.CheckableTag
            className={checked === item.id ? selectedTag : defaultTag}
            style={{ marginRight: 5, marginTop: 24 }}
            checked={checked === item.id}
            onChange={() => this.onProjectSelected(item.id)}
          >
            <Ellipsis length={8}>{item.itemName}</Ellipsis>
          </Tag.CheckableTag>
        </Tooltip>
      </span>
    );
  };

  render() {
    const { data: { projects, selectedProject } } = this.props;

    return (
      <Col>
        {projects.map((item, index) => this.renderProject(item, index, selectedProject))}
      </Col>
    );
  }
}

export default Projects;
