import { message } from 'antd';

/**
 * 图片上传限制格式
 * @param file
 * @returns {boolean}
 */
export function isPicture(file) {
  const isJPG = file.type === 'image/jpg';
  const isJPEG = file.type === 'image/jpeg';
  const isPNG = file.type === 'image/png';
  const isBMP = file.type === 'image/bmp';
  const flag = isJPG || isJPEG || isPNG || isBMP;
  if (!flag) {
    message.warning('只能上传 jpg/jpeg/png 格式图片');
  }
  return flag;
}

/**
 * 图片大小限制
 * @param file
 * @param size
 * @returns {boolean}
 */
export function pictureLimit(file, size) {
  const flag = file.size < 1024 * 1024 * size;
  if (!flag) {
    message.warning(`图片大小不超过${size}M`);
  }
  return flag;
}
