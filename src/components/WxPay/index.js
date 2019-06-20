import React, { Component } from 'react';
import { Modal, Button, Row, Col, message } from 'antd';
import QRCode from 'qrcode.react';
import request from '../../utils/request';
import { handleResponse } from '../../utils/globalUtils';

/**
 * @param visible
 * @param orderNo
 * @param payMoney
 * @function onOk 付款成功回调
 * @function onCancel 取消付款
 *
 * @author turing
 */

class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      payUrl: undefined,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && nextProps.orderNo) {
      this.setState({ visible: nextProps.visible }, () => {
        this.fetchPayUrl(nextProps.orderNo);
      });
    } else {
      this.setState({ visible: nextProps.visible });
    }
  }

  componentWillUnmount() {
    this.setState({
      payUrl: undefined,
    });
  }

  fetchPayUrl = (orderNo) => {
    request(`/ent/payment/toPay/weixin?orderNo=${orderNo}`)
      .then(response => {
        if (handleResponse(response)) {
          this.setState({ payUrl: response.data }, () => {
            this.pollingOrderStatus(orderNo);
          });
        }
      });
  };

  pollingOrderStatus = (orderNo) => {
    const { visible } = this.state;
    if (visible && orderNo) {
      request(`/venuebooking/order/payStatus/${orderNo}`)
        .then(response => {
          if (handleResponse(response)) {
            if (response.data === 2) {
              message.success(response.msg);
              const { onOk } = this.props;
              onOk();
            } else if (response.data === 1) {
              setTimeout(() => {
                this.pollingOrderStatus(orderNo);
              }, 1000);
            }
          }
        });
    }
  };

  render() {
    const { onCancel, payMoney } = this.props;
    const { visible, payUrl } = this.state;

    return (
      <Modal
        title='微信支付'
        closable={false}
        maskClosable={false}
        visible={visible}
        footer={[<Button onClick={onCancel}>取消</Button>]}
      >
        <Row>
          <Col align='center'>
            {payUrl && <QRCode value={payUrl} style={{ width: 320, height: 320 }} />}
          </Col>
        </Row>
        {payMoney && (
          <Row style={{ marginTop: 24 }}>
            <Col align='center'>{payMoney}</Col>
          </Row>
        )}
      </Modal>
    );
  }
}

export default index;
