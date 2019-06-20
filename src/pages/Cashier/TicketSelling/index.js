import React, { Component } from 'react';
import router from 'umi/router';
import { Card, Form, Input, InputNumber, Row, Col, Checkbox, Button, Tag, message, Modal } from 'antd';
import PageHeaderWrapper from '../../../components/PageHeaderWrapper';
import WxPay from '../../../components/WxPay/BarCode';
import request from '../../../utils/request';
import { handleResponse } from '../../../utils/globalUtils';
import { handlePrint } from '../../../utils/batchPrint';

const FormItem = Form.Item;

/**
 * @author turing
 */

@Form.create()
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: {},
      payMethod: [],
      paymentMode: undefined, // 支付方式
      barVisible: undefined, // 微信支付窗口
      orderNo: undefined, // 订单号
      goodsName: undefined, // 产品名
      deviceCode: undefined, // 设备号
      methodCode: undefined, // 支付方式
      version: undefined, // 版本号
    };
  }

  componentDidMount() {
    this.initialBaseInfo();
    this.initialPayMethod();
  }

  /**
   * 获取票券基本信息
   */
  initialBaseInfo = () => {
    const { location: { query } } = this.props;
    request(`/venuebooking/cashier/getOneById?ticketBasicId=${query.ticketBasicId}`)
      .then(response => {
        if (handleResponse(response)) {
          this.setState({ formData: response.data });
        }
      });
  };

  /**
   * 获取可使用的支付方式
   */
  initialPayMethod = () => {
    request("/venuebooking/paymentMethod/getPayment?type=1")
      .then(response => {
        if (handleResponse(response)) {
          this.setState({
            payMethod: response.data,
            paymentMode: response.data.length > 0 ? response.data[0].code : undefined,
          });
        }
      });
  };

  onPayMethodChange = (code) => {
    this.setState({ paymentMode: code });
  };

  /**
   * 计算金额
   * @param value 人数
   */
  calculateTotalMoney = (value) => {
    const { form } = this.props;
    const { formData } = this.state;
    form.resetFields(["manCounts", "girlCounts"]);
    form.setFieldsValue({
      manCounts: Number(value) * Number(formData.adultNum),
      girlCounts: 0,
      totalMoney: value ? (Number(value) * Number(form.getFieldValue("ticketSalePrice"))).toString() : 0,
    });
  };

  handleSubmit = (e) => {
    if (e)
      e.preventDefault();
    const { form } = this.props;
    const { paymentMode } = this.state;
    let fieldNames = ["counts", "manCounts", "girlCounts", "childrenCounts"];
    // 是否修改金额
    if (form.getFieldValue("isModified"))
      fieldNames = fieldNames.concat(["totalMoney", "permitCardNo"]);
    // 是否使用会员卡
    if (paymentMode === "2")
      fieldNames.push("cardNo");
    form.validateFieldsAndScroll(fieldNames, (errors, values) => {
      if (!errors) {
        const { formData } = this.state;
        const params = {...values};
        params.ticketBasicId = formData.ticketBasicId; // 票券id
        params.paymentMode = paymentMode; // 支付方式
        params.customerType = paymentMode === "2" ? 1 : 2; // 客户类型(1,会员，2，散客)
        if (paymentMode === "2") {
          this.vipCheckBeforePay(params);
        } else {
          this.toPay(params);
        }
      }
    });
  };

  /**
   * 会员卡支付前效验
   */
  vipCheckBeforePay = (params) => {
    this.setState({ loading: true });
    request(`/venuebooking/memberCard/cardMember?cardNo=${params.cardNo}`)
      .then(response => {
        if (handleResponse(response)) {
          if (response.data.cardType === 1) {
            message.error("年卡用户无需购买门票，可直接入场");
            return;
          }
          this.toPay(params);
        }
        this.setState({ loading: false });
      });
  };

  toPay = (params) => {
    this.setState({ loading: true });
    request("/venuebooking/cashier/saleTicket", {
      method: "POST",
      body: params,
    }).then(response => {
      if (handleResponse(response, (params.paymentMode !== "3" && params.paymentMode !== "4"))) {
        if (params.paymentMode === "3" || params.paymentMode === "4") {
          // 微信&支付宝单独处理
          this.onBarVisibleChange(true, response.data.orderNo, response.data.goodsName, response.data.deviceCode, response.data.methodCode, response.data.version);
        } else {
          this.goBack();
          handlePrint(response.data.orderNo);
        }
      }
      this.setState({ loading: false });
    });
  };

  /**
   * 微信支付
   */
  onBarVisibleChange = (barVisible, orderNo, goodsName, deviceCode, methodCode, version) => {
    this.setState({ barVisible, orderNo, goodsName, deviceCode, methodCode, version });
  };

  /**
   * 取消修改金额后重置总金额
   */
  onModifyTotalMoneyChange = (e) => {
    if (!e.target.checked) {
      const { form } = this.props;
      this.calculateTotalMoney(form.getFieldValue("counts"));
    }
  };

  /**
   * 男女数量切换
   * @param value
   * @param fieldName
   */
  onCountsChange = (value, fieldName) => {
    const { form } = this.props;
    const total = form.getFieldValue("total");
    form.setFieldsValue({
      [fieldName]: total - value,
    });
  };

  goBack = () => {
    const pathname = "/cashier/cashierList/index";
    router.push({ pathname });
  };

  /**
   * 输入数量超出最大限制时弹窗提示
   */
  validateCounts = (rule, value, back, stock) => {
    const max = stock > 10 ? 10 : stock;
    if (Number(value) > max) {
      this.showWarningMessage(`最大可售卖票数为${max}张`);
    }
    back();
  };

  showWarningMessage = (text) => {
    Modal.warning({
      title: '注意',
      content: text,
      okText: '确定',
    });
  };

  render() {
    const { form } = this.props;
    const { loading, formData, payMethod, paymentMode, barVisible, orderNo, goodsName, deviceCode, methodCode, version } = this.state;

    const formItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 6 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 18 } },
    };
    const buyItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 8 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 16 } },
    };
    const sexItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 6 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 18 } },
    };
    const payItemLayout = {
      labelCol: { xs: { span: 24 }, sm: { span: 3 } },
      wrapperCol: { xs: { span: 24 }, sm: { span: 21 } },
    };

    return (
      <PageHeaderWrapper>
        <Form onSubmit={this.handleSubmit}>
          <Card title="基本信息" bordered={false} bodyStyle={{ paddingBottom: 0 }}>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="票名">
                  {form.getFieldDecorator("ticketName", {
                    initialValue: formData.ticketName,
                  })(
                    <Input disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="适用场地">
                  {form.getFieldDecorator("applyCourtName", {
                    initialValue: formData.applyCourtName,
                  })(
                    <Input disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="适用日期范围">
                  {form.getFieldDecorator("date", {
                    initialValue: `${formData.applyDateStart} ~ ${formData.applyDateEnd}`,
                  })(
                    <Input disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="适用日期类型">
                  {form.getFieldDecorator("applyDateString", {
                    initialValue: formData.applyDateString,
                  })(
                    <Input disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="适用时间范围">
                  {form.getFieldDecorator("Gender", {
                    initialValue: `${formData.applyTimeStart} ~ ${formData.applyTimeEnd}`,
                  })(
                    <Input disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="使用时长(分钟)">
                  {form.getFieldDecorator("duration", {
                    initialValue: formData.duration,
                  })(
                    <Input disabled />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem {...formItemLayout} label="价格(元)">
                  {form.getFieldDecorator("ticketSalePrice", {
                    initialValue: formData.ticketSalePrice,
                  })(
                    <Input disabled />
                  )}
                </FormItem>
              </Col>
              {formData.adultNum && (
                <Col span={12}>
                  <FormItem {...formItemLayout} label="可用人数/票">
                    {form.getFieldDecorator("adultNum", {
                      // 当前默认不区分成人小孩，可用人数为成人+小孩总数量
                      initialValue: Number(formData.adultNum || 0) + Number(formData.childrenNum || 0),
                    })(
                      <Input disabled />
                    )}
                  </FormItem>
                </Col>
              )}
            </Row>
          </Card>
          <Card title="购票信息" bordered={false} bodyStyle={{ paddingBottom: 0 }}>
            <Row>
              <Col span={8}>
                <FormItem {...buyItemLayout} label="数量">
                  {form.getFieldDecorator("counts", {
                    rules: [
                      { required: true, message: '请输入数量' },
                      { validator: (rule, value, back) => this.validateCounts(rule, value, back, formData.currentStock) },
                    ],
                    initialValue: 1,
                  })(
                    <InputNumber
                      style={{ width: "100%" }}
                      min={1}
                      max={formData.currentStock > 10 ? 10 : formData.currentStock}
                      precision={0}
                      onChange={this.calculateTotalMoney}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={16}>
                <Row>
                  <Col span={6}>
                    <FormItem label="男" {...sexItemLayout}>
                      {form.getFieldDecorator("manCounts", {
                        rules: [{ required: true, message: '请输入数量' }],
                        initialValue: (Number(formData.adultNum) + Number(formData.childrenNum)) * Number(form.getFieldValue("counts")),
                      })(
                        <InputNumber
                          onChange={value => this.onCountsChange(value, "girlCounts")}
                          min={0}
                          max={(Number(formData.adultNum) + Number(formData.childrenNum)) * Number(form.getFieldValue("counts"))}
                          precision={0}
                          style={{ width: "100%" }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={6}>
                    <FormItem label="女" {...sexItemLayout}>
                      {form.getFieldDecorator("girlCounts", {
                        rules: [{ required: true, message: '请输入数量' }],
                        initialValue: 0,
                      })(
                        <InputNumber
                          onChange={value => this.onCountsChange(value, "manCounts")}
                          min={0}
                          max={(Number(formData.adultNum) + Number(formData.childrenNum)) * Number(form.getFieldValue("counts"))}
                          precision={0}
                          style={{ width: "100%" }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem {...sexItemLayout} label="总可用人数">
                      {form.getFieldDecorator("total", {
                        initialValue: (Number(formData.adultNum) + Number(formData.childrenNum)) * Number(form.getFieldValue("counts")),
                      })(
                        <span>{(Number(formData.adultNum) + Number(formData.childrenNum)) * Number(form.getFieldValue("counts"))}</span>
                      )}
                    </FormItem>
                  </Col>
                  {/* <Col span={6}>
                    <FormItem label="儿童" {...sexItemLayout}>
                      {form.getFieldDecorator("childrenCounts", {
                        initialValue: Number(formData.childrenNum) * Number(form.getFieldValue("counts")),
                      })(
                        <InputNumber disabled precision={0} style={{ width: "100%" }} />
                      )}
                    </FormItem>
                  </Col> */}
                </Row>
              </Col>
              <Col span={8}>
                <FormItem {...buyItemLayout} label="金额" style={{ marginBottom: 0 }}>
                  <Row gutter={6}>
                    <Col span={12}>
                      <FormItem>
                        {form.getFieldDecorator("totalMoney", {
                          initialValue: (Number(form.getFieldValue("counts")) * Number(form.getFieldValue("ticketSalePrice"))).toString(),
                        })(
                          <InputNumber
                            style={{ width: "100%" }}
                            disabled={!form.getFieldValue("isModified")}
                            precision={2}
                            min={0}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      {form.getFieldDecorator("isModified", {
                        valuePropName: "checked",
                      })(
                        <Checkbox onChange={this.onModifyTotalMoneyChange}>修改金额</Checkbox>
                      )}
                    </Col>
                  </Row>
                </FormItem>
              </Col>
              {form.getFieldValue("isModified") && (
                <Col span={8}>
                  <FormItem {...buyItemLayout} label="授权卡号">
                    {form.getFieldDecorator("permitCardNo", {
                      rules: [
                        { required: true, message:'请输入卡号' },
                        { pattern: /^[A-Za-z0-9]{0,50}$/, message: '请输入正确的卡号' },
                      ],
                    })(
                      <Input placeholder='请输入授权卡号' type="password" />
                    )}
                  </FormItem>
                </Col>
              )}
            </Row>
          </Card>
          <Card title="支付信息" bordered={false}>
            <FormItem {...payItemLayout} label="支付方式">
              {payMethod.map(item =>
                <Tag.CheckableTag
                  style={{ padding: "15px 19px", fontWeight: 500, lineHeight: 0, fontSize: 14, border: '1px solid #d9d9d9' }}
                  key={item.id}
                  checked={paymentMode === item.code}
                  onChange={() => this.onPayMethodChange(item.code)}
                >
                  {item.name}
                </Tag.CheckableTag>
              )}
            </FormItem>
            {paymentMode === "2" && (
              <FormItem label="会员卡号" {...{ labelCol: { xs: { span: 24 }, sm: { span: 3 } }, wrapperCol: { xs: { span: 24 }, sm: { span: 8 } },}}>
                {form.getFieldDecorator("cardNo", {
                  rules: [{ required: true, message: "请输入会员卡号" }],
                })(
                  <Input placeholder="请输入会员卡号" />
                )}
              </FormItem>
            )}
            <FormItem {...{ wrapperCol: { xs: { span: 24 }, sm: { offset: 3, span: 20 } } }} style={{ marginBottom: 0 }}>
              <Button onClick={() => this.goBack()}>取消</Button>
              <Button loading={loading} htmlType="submit" style={{ marginLeft: 6 }}>确定</Button>
            </FormItem>
          </Card>
        </Form>
        <WxPay
          visible={barVisible}
          param={{ orderNo, goodsName, deviceCode, methodCode, version }}
          onOk={() => {
            this.onBarVisibleChange(false);
            this.goBack();
            handlePrint(orderNo);
          }}
          onCancel={() => this.onBarVisibleChange(false)}
        />
      </PageHeaderWrapper>
    );
  }
}

export default index;
