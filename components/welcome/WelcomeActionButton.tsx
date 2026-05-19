import { Text } from 'components/app/Text';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';
import { Animated, Easing, Pressable } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

interface WelcomeActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function WelcomeActionButton({
  label,
  onPress,
  variant = 'primary',
}: WelcomeActionButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const shineProgress = useRef(new Animated.Value(0)).current;
  const [buttonWidth, setButtonWidth] = useState(0);

  const shineTranslateX = shineProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [-84, buttonWidth + 84],
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    setButtonWidth(event.nativeEvent.layout.width);
  };

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      bounciness: 0,
      speed: 28,
      useNativeDriver: true,
    }).start();

    shineProgress.stopAnimation();
    shineProgress.setValue(0);
    Animated.timing(shineProgress, {
      toValue: 1,
      duration: 360,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      bounciness: 6,
      speed: 22,
      useNativeDriver: true,
    }).start();
  };

  if (variant === 'secondary') {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          accessibilityRole="button"
          className="relative mt-5 items-center justify-center overflow-hidden py-2"
          onLayout={handleLayout}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}>
          <Text className="font-button text-[18px] text-[#121212]">{label}</Text>

          <Animated.View
            pointerEvents="none"
            style={{
              opacity: buttonWidth === 0 ? 0 : 0.85,
              transform: [{ translateX: shineTranslateX }, { rotate: '16deg' }],
            }}
            className="absolute -bottom-6 -top-6 w-16">
            <LinearGradient
              className="h-full w-full"
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.92)', 'rgba(255,255,255,0)']}
              end={{ x: 1, y: 0.5 }}
              start={{ x: 0, y: 0.5 }}
            />
          </Animated.View>
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        accessibilityRole="button"
        className="relative mt-5 h-14 w-full items-center justify-center overflow-hidden rounded-full bg-primary"
        onLayout={handleLayout}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}>
        <Text className="font-button text-[17px] text-black">{label}</Text>

        <Animated.View
          pointerEvents="none"
          style={{
            opacity: buttonWidth === 0 ? 0 : 0.7,
            transform: [{ translateX: shineTranslateX }, { rotate: '16deg' }],
          }}
          className="absolute -bottom-6 -top-6 w-16">
          <LinearGradient
            className="h-full w-full"
            colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
            end={{ x: 1, y: 0.5 }}
            start={{ x: 0, y: 0.5 }}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
