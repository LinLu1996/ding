import React, { Component, Fragment } from 'react';
// import {} from 'antd';
import home from "../../assets/home.png";

/**
 * @author turing
 */

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    // const {} = this.props;
    // const {} = this.state;

    return (
      <Fragment>
        <img alt="" style={{ width: '100%', height: "100%" }} src={home} />
      </Fragment>
    );
  }
}

export default index;
