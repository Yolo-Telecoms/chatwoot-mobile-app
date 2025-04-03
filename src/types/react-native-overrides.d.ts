declare module 'react-native/Libraries/Text/TextNativeComponent' {
  import { HostComponent } from 'react-native';

  // Provide a shape that suits your usage.
  // For a minimal approach, you can give it an `any` or `unknown` type:
  const TextNativeComponent: HostComponent<unknown>;

  export default TextNativeComponent;
}
