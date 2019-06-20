import React, { Component, Fragment } from 'react';
import { Button, message, Select, Tag } from 'antd';
import styles from './index.less'

const Option = Select.Option;

class Camera extends Component {

  constructor(props) {
    super(props);
    this.state = {
      img: null,
      imgType: 'jpeg',
      isVideo: true,
    };
  }

  componentWillMount() {
    console.log(this.props);
  }

  componentDidMount() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const vendorUrl = window.URL || window.webkitURL;
    const that = this;
    navigator.getMedia = navigator.getUserMedia ||
      navagator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    navigator.getMedia({
      video: true, //使用摄像头对象
      audio: false  //不适用音频
    }, function (strem) {
      console.log(strem);
      video.src = vendorUrl.createObjectURL(strem);
      video.play();
    }, function (error) {
      //error.code
      console.log(error);
      that.setState({
        isVideo: false,
      })
    });

    const { x, y, width, height, imgsrc } = this.props;
    if (imgsrc) {
      console.log(imgsrc)
      let img = new Image();
      img.src = imgsrc;
      img.setAttribute('crossOrigin', 'anonymous')
      img.onload = () => {
        canvas.getContext('2d').drawImage(img, x, y, width, height);
      }
    }
  }

  handleChange = (e) => {
    console.log(e);
    // 清空canvas,设置图片类型
    const { x, y, width, height } = this.props;
    canvas.getContext('2d').clearRect(x, y, width, height);
    this.setState({
      imgType: e,
      img: null,
    });
  }

  picture = () => {
    const { x, y, width, height, onPush } = this.props;
    const { imgType } = this.state;
    canvas.getContext('2d').drawImage(video, x, y, width, height);
    onPush(canvas.toDataURL(`image/${imgType}`))
  }


  render() {
    const { width, height, showImgType } = this.props;
    const { isVideo } = this.state;
    return (
      <div style={{ display: 'flex', margin: '20px 0', paddingLeft: 50 }}>
        {isVideo &&
          (
            <Fragment>
              <video id="video" width={width} height={width * (3 / 4)} />
              <div className={styles.btns}>
                <Button type="primary" id='tack' onClick={this.picture}> 拍照 </Button>
                {
                  showImgType && (
                    <Select defaultValue="jpeg" style={{ width: 120 }} onChange={this.handleChange}>
                      <Option value="jpeg">jpeg</Option>
                      <Option value="png">png</Option>
                    </Select>
                  )
                }
              </div>
              <canvas id='canvas' width={width} height={width * (3 / 4)}></canvas>
            </Fragment>
          )
        }
        {!isVideo &&
          (
            <Tag>请插入拍照设备</Tag>
          )
        }
      </div>
    );
  }
}


export default Camera;

Camera.defaultProps = {
  x: 0, // x轴截取位置
  y: 0, // y轴截取位置
  width: 400, // 视频和图片宽度
  height: 400, // 视频和图片高度
  noPicture: '请拍照后再上传图片',
  noPushMethod: '上传方法未定义',
  showImgType: false, // 是否显示选择图片类型
  img: null, // 父组件传的图片
};
