/* eslint-disable react-hooks/rules-of-hooks */
import Reactotron from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';

// Disable the rule just for this next call:
const reactotron = Reactotron
  // eslint-disable-next-line react-hooks/rules-of-hooks
  .useReactNative()
  .use(reactotronRedux())
  .connect();

export default reactotron;
