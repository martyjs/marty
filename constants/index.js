import arrayToConstants from './array-to-constants';
import isObject from 'lodash/lang/isObject';

export default function constants(obj) {
  let ret = {};

  if (Array.isArray(obj)) {
    ret = arrayToConstants(obj);
  } else if (isObject(obj)) {
    Object.keys(obj).forEach(actionType => ret[actionType] = constants(obj[actionType]));
  }

  return ret;
}
