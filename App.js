import React, {useCallback, useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreen from 'react-native-splash-screen'
import {customFonts} from './MyApp/fonts/Fonts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './MyApp/navigation/AppNavigator';
import { Provider } from "react-redux";
import { store } from "./MyApp/store/store";


function App() {
  const [appIsLoaded, setAppIsLoaded] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Load custom fonts
        // await loadCustomFonts();
        SplashScreen.hide();
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(error);
      } finally {
        setAppIsLoaded(true);
      }
    };

    prepare();
  }, []);

  const onLayout = useCallback(async () => {
    console.log("Did this function ran?");
    if (appIsLoaded) {
      SplashScreen.hide();
    }
  }, [appIsLoaded]);


 

  return (
    <Provider store={store}>
      <SafeAreaProvider style={styles.container} onLayout={onLayout}>
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

