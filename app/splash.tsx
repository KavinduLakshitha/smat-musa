// app/splash.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions, Text } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const waveAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations when component mounts
    Animated.sequence([
      // Fade and scale logo
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.5)),
        }),
      ]),
      
      // Wave animation
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      
      // Wait a bit before navigating away
      Animated.delay(600),
    ]).start(() => {
      // Navigate to app after animation is done
      router.replace('/');
    });
  }, [fadeAnim, scaleAnim, waveAnim]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2C5E1A', '#4CAF50']}
        style={styles.gradient}
      >
        {/* Wave Animation */}
        <Animated.View 
          style={[
            styles.waveContainer, 
            {
              transform: [
                { 
                  translateY: waveAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height * 0.1, 0]
                  })
                }
              ],
              opacity: waveAnim
            }
          ]}
        >
          <Svg height={height * 0.15} width={width} viewBox={`0 0 ${width} ${height * 0.15}`}>
            <Path
              d={`M0 ${height * 0.15} 
                 C ${width * 0.25} 0, ${width * 0.75} ${height * 0.05}, ${width} 0 
                 L ${width} ${height * 0.15} 
                 L 0 ${height * 0.15} 
                 Z`}
              fill="#ffffff"
              opacity={0.2}
            />
          </Svg>
        </Animated.View>
        
        {/* Logo and Text */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Replace with your actual logo image if you have one */}
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🍌</Text>
          </View>
          <Text style={styles.logoText}>SMART MUSA</Text>
          <Text style={styles.tagline}>Your Complete Banana Farming Solution</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoIcon: {
    fontSize: 50,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});