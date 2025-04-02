import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ navigation }) {
  const handleDone = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('MainApp');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      navigation.replace('MainApp');
    }
  };

  return (
    <View style={styles.container}>
      <Onboarding
        onDone={handleDone}
        onSkip={handleDone}
        pages={[
          {
            backgroundColor: '#ffffff',
            image: (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1532102235608-dc8fc689c9ab?q=80&w=800&auto=format&fit=crop' }}
                  style={styles.image}
                />
                <LinearGradient
                  colors={['rgba(217, 119, 6, 0.2)', 'rgba(180, 83, 9, 0.3)']}
                  style={styles.gradient}
                />
              </View>
            ),
            title: 'KundaPay',
            subtitle: 'Le transfert en toute confiance',
          },
          {
            backgroundColor: '#ffffff',
            image: (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?q=80&w=800&auto=format&fit=crop' }}
                  style={styles.image}
                />
                <LinearGradient
                  colors={['rgba(217, 119, 6, 0.2)', 'rgba(180, 83, 9, 0.3)']}
                  style={styles.gradient}
                />
              </View>
            ),
            title: 'Aidez vos proches',
            subtitle: 'Investissez en Afrique',
          },
          {
            backgroundColor: '#ffffff',
            image: (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=800&auto=format&fit=crop' }}
                  style={styles.image}
                />
                <LinearGradient
                  colors={['rgba(217, 119, 6, 0.2)', 'rgba(180, 83, 9, 0.3)']}
                  style={styles.gradient}
                />
              </View>
            ),
            title: 'Préparez l\'avenir',
            subtitle: 'avec KundaPay',
          },
        ]}
        containerStyles={styles.containerStyle}
        imageContainerStyles={styles.imageContainerStyle}
        titleStyles={styles.titleStyle}
        subTitleStyles={styles.subtitleStyle}
        bottomBarHighlight={false}
        showSkip={true}
        skipLabel="Passer"
        nextLabel="Suivant"
        doneLabel="Commencer"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    width: width,
    height: height * 0.5,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
    borderRadius: 20,
  },
  containerStyle: {
    paddingBottom: 40,
  },
  imageContainerStyle: {
    paddingBottom: 20,
  },
  titleStyle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  subtitleStyle: {
    fontSize: 18,
    color: '#4B5563',
    paddingHorizontal: 20,
    textAlign: 'center',
  },
});