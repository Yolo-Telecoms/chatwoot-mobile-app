import moment from 'moment';
import { fromUnixTime, format, formatDistanceToNow } from 'date-fns';

export const messageStamp = ({ time, dateFormat = 'h:mm a' }) => {
  const unixTime = fromUnixTime(time);
  return format(unixTime, dateFormat);
};

export const dynamicTime = ({ time }) => {
  const unixTime = fromUnixTime(time);
  return formatDistanceToNow(unixTime, { addSuffix: true });
};

export const timeAgo = ({ time }) => {
  const createdAt = moment(time * 1000);
  return createdAt.fromNow();
};
