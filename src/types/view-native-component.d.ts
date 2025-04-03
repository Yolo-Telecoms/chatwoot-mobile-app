declare module 'react-native/Libraries/Components/View/ViewNativeComponent' {
  import { HostComponent } from 'react-native';

  // If you need it strongly typed, replace `any` with a more specific prop interface
  const ViewNativeComponent: HostComponent<unknown>;
  export default ViewNativeComponent;
}
