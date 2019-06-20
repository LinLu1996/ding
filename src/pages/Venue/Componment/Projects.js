import React, { Component } from 'react';
import { connect } from 'dva';
import { Col, Tag } from 'antd';
import classNames from 'classnames';
import styles from '../index.less';

/**
 * @author turing
 */

@connect(({ venuefieldManage, loading }) => ({
  data: venuefieldManage,
  loading: loading.models.fieldManage,
}))
class Projects extends Component {
  componentDidMount() {
    this.initialProjects();
  }

  /**
   * initial projects
   */
  initialProjects = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'venuefieldManage/initialProjects',
    }).then(() => {
      this.onProjectChanged();
    });
  };

  onProjectSelected = (selectedProject) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'venuefieldManage/onProjectSelected',
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

  renderProject = (item, checked) => {
    const selectedTag = classNames(styles.selectedTag, styles.normalTag);
    const defaultTag = classNames(styles.defaultTag, styles.normalTag);
    return (
      <Col span={2} align='center' key={item.id}>
        <Tag.CheckableTag
          className={checked === item.id ? selectedTag : defaultTag}
          onChange={() => this.onProjectSelected(item.id)}
        >
          {item.sportName}
        </Tag.CheckableTag>
      </Col>
    );
  };

  render() {
    const { data: { projects, selectedProject } } = this.props;

    return projects.map(item => this.renderProject(item, selectedProject));
  }
}

export default Projects;
