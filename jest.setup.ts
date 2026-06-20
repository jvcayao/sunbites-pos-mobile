// laravel-echo
jest.mock("laravel-echo", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    private: jest.fn().mockReturnValue({ notification: jest.fn() }),
    disconnect: jest.fn(),
  })),
}));

// pusher-js/react-native exports as module.exports.Pusher (named, not default)
jest.mock("pusher-js/react-native", () => ({
  Pusher: jest.fn(),
}));

// @react-native-community/netinfo (peer dep of pusher-js/react-native)
jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  Redirect: () => null,
  Link: "Link",
  Stack: { Screen: "Screen" },
  Tabs: { Screen: "Screen" },
}));

// react-native-paper
jest.mock("react-native-paper", () => {
  const RNP = jest.requireActual("react-native-paper");
  return { ...RNP };
});

// @expo/vector-icons
jest.mock("@expo/vector-icons", () => ({
  MaterialCommunityIcons: "MaterialCommunityIcons",
}));

// @expo-google-fonts/* — native font asset requires can't be resolved under Jest.
// Mock each package's named exports (font module refs) plus useFonts.
jest.mock("@expo-google-fonts/space-grotesk", () => ({
  useFonts: () => [true],
  SpaceGrotesk_400Regular: "SpaceGrotesk_400Regular",
  SpaceGrotesk_500Medium: "SpaceGrotesk_500Medium",
  SpaceGrotesk_600SemiBold: "SpaceGrotesk_600SemiBold",
  SpaceGrotesk_700Bold: "SpaceGrotesk_700Bold",
}));

jest.mock("@expo-google-fonts/dm-sans", () => ({
  useFonts: () => [true],
  DMSans_400Regular: "DMSans_400Regular",
  DMSans_500Medium: "DMSans_500Medium",
  DMSans_700Bold: "DMSans_700Bold",
}));

jest.mock("@expo-google-fonts/dm-mono", () => ({
  useFonts: () => [true],
  DMMono_400Regular: "DMMono_400Regular",
  DMMono_500Medium: "DMMono_500Medium",
}));

// react-native-qr-svg
jest.mock("react-native-qr-svg", () => ({
  QrCodeSvg: "QrCodeSvg",
}));

// react-native-svg
jest.mock("react-native-svg", () => ({
  Svg: "Svg",
  Path: "Path",
  Rect: "Rect",
}));

// react-native-safe-area-context
jest.mock("react-native-safe-area-context", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const insets = { top: 0, bottom: 0, left: 0, right: 0 };
  const frame = { x: 0, y: 0, width: 375, height: 812 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => insets,
    SafeAreaInsetsContext: React.createContext(insets),
    SafeAreaFrameContext: React.createContext(frame),
    initialWindowMetrics: { insets, frame },
  };
});
