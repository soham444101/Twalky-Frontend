/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */


import {
  SafeAreaProvider,

} from 'react-native-safe-area-context';
import Navigation from "./src/navigation/Navigation.js"
import { Dimensions, StatusBar, Text, } from 'react-native';
import { Colors } from './src/utlities/Constant.js';
import { useEffect } from 'react';


function App() {
  useEffect(() => {
    console.log("App.js File called")
  }, [])

  return (
    // <SafeAreaProvider>
    <Navigation />

    // </SafeAreaProvider>
  )


}
export default App;
