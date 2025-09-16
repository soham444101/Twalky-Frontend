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
import { Dimensions, StatusBar, Text,  } from 'react-native';
import { Colors } from './src/utlities/Constant.js';


function App() {

  return (
    <SafeAreaProvider>
      <StatusBar backgroundColor={Colors.background}/>
      <Navigation />
      
    </SafeAreaProvider>
  )


}



export default App;
