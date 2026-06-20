import { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_STAGING = process.env.APP_VARIANT === 'staging';

const getUniqueIdentifier = () => {
    if (IS_DEV) {
        return 'com.sunbites.pos.mobile.dev';
    }

    if (IS_STAGING) {
        return 'com.sunbites.pos.mobile.staging';
    }

    return 'com.sunbites.pos.mobile';
};

const getAppName = () => {
    if (IS_DEV) {
        return 'Sunbites POS (Dev)';
    }

    if (IS_STAGING) {
        return 'Sunbites POS (Staging)';
    }

    return 'Sunbites POS';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    name: getAppName(),
    slug: "sunbites-pos-mobile",
    version: "1.0.0",
    scheme: "sunbites-pos",
    orientation: 'landscape',
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    platforms: ['ios', 'android'],
    android: {
        adaptiveIcon: {
            backgroundColor: '#FFFFFF',
            foregroundImage: './assets/android-icon-foreground.png',
            backgroundImage: './assets/android-icon-background.png',
            monochromeImage: './assets/android-icon-monochrome.png',
        },
        package: getUniqueIdentifier(),
        versionCode: 1,
        softwareKeyboardLayoutMode: 'resize',
    },
    plugins: [
        "expo-router",
        "expo-font",
        "expo-secure-store",
        "expo-updates",
        "./plugins/withGradleVersion",
        'expo-image',
        '@react-native-community/datetimepicker',
    ],
    "experiments": {
        "typedRoutes": true
    },
    "updates": {
        "url": "https://u.expo.dev/sunbites-pos-mobile",
        "enabled": true,
        "checkAutomatically": "ON_LOAD",
        "fallbackToCacheTimeout": 0
    },
    "runtimeVersion": {
        "policy": "appVersion"
    },
    "extra": {
        "eas": {
            "projectId": "20f6590e-6e92-4f59-b1be-9585aa218c64"
        },
        reverbAppKey: process.env.EXPO_PUBLIC_REVERB_APP_KEY,
        reverbHost: process.env.EXPO_PUBLIC_REVERB_HOST,
        reverbPort: process.env.EXPO_PUBLIC_REVERB_PORT,
        reverbScheme: process.env.EXPO_PUBLIC_REVERB_SCHEME,
    }
});