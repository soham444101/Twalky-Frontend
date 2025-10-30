import {
    createNavigationContainerRef,
    CommonActions,
    StackActions,
} from '@react-navigation/native';


export const navigationRef = createNavigationContainerRef();

export function navigate(routeName, params) {
    console.log("Navigation utlitie is call")
    if (navigationRef.isReady()) {
        navigationRef.dispatch(CommonActions.navigate(routeName, params));

    }
}
export function replace(routeName, params) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.replace(routeName, params));
    }
}
export function resetAndNavigate(routeName) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: routeName }],
            }),
        );
    }
}

export function goBack() {
    console.log("...............................")
    console.log("Goback function called")
    console.log("...............................")
    if (navigationRef.isReady()) {
        navigationRef.dispatch(CommonActions.goBack());
    }
}
export function push(routeName, params) {
    if (navigationRef.isReady()) {
        navigationRef.dispatch(StackActions.push(routeName, params));
    }
}
export function prepareNavigation() {
    navigationRef.isReady();
} 