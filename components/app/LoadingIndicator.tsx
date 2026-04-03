import LottieView from 'lottie-react-native';
import { View } from 'react-native';

interface LoadingIndicatorProps {
  size?: 'small' | 'large' | number;
}

export function LoadingIndicator({ size = 'large' }: LoadingIndicatorProps) {
  const dimension = typeof size === 'number' ? size : size === 'small' ? 40 : 120;

  return (
    <View
      style={{
        width: dimension,
        height: dimension,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <LottieView
        source={require('../../assets/animations/Ball.lottie')}
        autoPlay
        loop
        style={{ width: dimension, height: dimension }}
      />
    </View>
  );
}
