import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from '../screen/Splash.Screen';
import HomeScreen from '../screen/Home.Screen';
import PreapareMeetScreen from '../screen/PreapareMeet.Screen';
import LiveMeetScreen from '../screen/LiveMeet.Screen';
import JoinMeetScreen from '../screen/JoinMeet.Screen';
import { navigationRef } from '../utlities/NavigationUtilities';
import { WSProvider } from '../services/api/WSProvider';
import React from 'react';

const Stack = createNativeStackNavigator();

const Navigation = () => (
    <WSProvider>
        <NavigationContainer ref={navigationRef} >
            <Stack.Navigator initialRouteName='SplashScreen' screenOptions={
                {
                    headerShown:false
                    
                }
            }>
                <Stack.Screen name='SplashScreen' component={SplashScreen} />
                <Stack.Screen name='HomeScreen' component={HomeScreen} />
                <Stack.Screen name='PreapareMeetScreen' component={PreapareMeetScreen} />
                <Stack.Screen name='LiveMeetScreen' component={LiveMeetScreen} />
                <Stack.Screen name='JoinMeetScreen' component={JoinMeetScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    </WSProvider>
)


export default Navigation