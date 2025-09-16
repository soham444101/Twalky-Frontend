import { View, Text, Image, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { navigate } from '../utlities/NavigationUtilities.js'

const SplashScreen = () => {

  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('====================================');
      console.log("Timeout is set");
      console.log('====================================');

      navigate("HomeScreen");
    }, 500)

    return () => clearTimeout(timeout);
  }, [])

  return (
    <View style={style.cantainer}>
      <Image source={require("../assest/erasebg-transformed.png")} style={style.image} />
      <Text>SplashScreen</Text>
    </View>
  )
}

const style = StyleSheet.create(
  {
    cantainer: {
      flex: 1,
      backgroundColor: "#fffff"
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    }
  }
)
export default SplashScreen