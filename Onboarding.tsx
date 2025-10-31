import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { StackNavigationProp } from '@react-navigation/stack';

// স্ক্রিনের প্রস্থ
const { width } = Dimensions.get('window');

// স্লাইড ডেটার টাইপ ডেফিনিশন
interface Slide {
  id: string;
  title: string;
  description: string;
}

// নেভিগেশন প্রপসের টাইপ
type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined; // বটম ট্যাব রুট
};

type OnboardingNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

// স্লাইড ডেটা
const slides: Slide[] = [
  {
    id: '1',
    title: 'Welcome to Blood Donation',
    description: 'Connect with donors and save lives effortlessly.',
  },
  {
    id: '2',
    title: 'Be a Lifesaver',
    description: 'Your blood donation can make a difference in emergencies.',
  },
  {
    id: '3',
    title: 'Find Donors Fast',
    description: 'Search for donors by blood group and location.',
  },
  {
    id: '4',
    title: 'Join the Movement',
    description: 'Register now and become part of our lifesaving community.',
  },
];

interface OnboardingProps {
  navigation: OnboardingNavigationProp;
}

const Onboarding: React.FC<OnboardingProps> = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<Slide>>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  // কাস্টম ফন্ট লোড
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
  });

  // AsyncStorage থেকে onboarding স্ট্যাটাস চেক
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        if (hasSeenOnboarding === 'true') {
          navigation.replace('Main'); // বটম ট্যাবে যাবে
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };
    checkOnboardingStatus();
  }, [navigation]);

  // Next বাটন অ্যানিমেশন
  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // Next বাটন হ্যান্ডলার
  const handleNext = async () => {
    handleButtonPressIn();
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      try {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        navigation.replace('Main'); // শেষে বটম ট্যাবে যাবে
      } catch (error) {
        console.error('Error saving onboarding status:', error);
      }
    }
    setTimeout(handleButtonPressOut, 100);
  };

  // Skip বাটন হ্যান্ডলার
  const handleSkip = async () => {
    handleButtonPressIn();
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      navigation.replace('Main'); // সরাসরি বটম ট্যাবে যাবে
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
    setTimeout(handleButtonPressOut, 100);
  };

  if (!fontsLoaded) {
    return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;
  }

  return (
    <LinearGradient
      colors={['#ff4d4d', '#fff']}
      style={styles.container}
    >
      {/* Slides */}
      <FlatList
        data={slides}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        ref={flatListRef}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={({ viewableItems }) => {
          if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
          }
        }}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <View
            key={i.toString()}
            style={[
              styles.dot,
              { backgroundColor: i === currentIndex ? '#d32f2f' : '#fff' },
            ]}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        {currentIndex < slides.length - 1 ? (
          <>
            <TouchableOpacity onPress={handleSkip} onPressIn={handleButtonPressIn} onPressOut={handleButtonPressOut}>
              <Animated.Text style={[styles.skip, { transform: [{ scale: buttonScale }] }]}>Skip</Animated.Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
            >
              <Animated.Text style={[styles.nextText, { transform: [{ scale: buttonScale }] }]}>Next</Animated.Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleNext}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
          >
            <Animated.Text style={[styles.startText, { transform: [{ scale: buttonScale }] }]}>Get Started</Animated.Text>
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

export default Onboarding;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Roboto_700Bold',
    color: '#d32f2f',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Roboto_400Regular',
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  skip: {
    fontSize: 18,
    fontFamily: 'Roboto_400Regular',
    color: '#fff',
  },
  nextButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 3,
  },
  nextText: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#388e3c',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 10,
    alignSelf: 'center',
    elevation: 3,
  },
  startText: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: 18,
    textAlign: 'center',
  },
});