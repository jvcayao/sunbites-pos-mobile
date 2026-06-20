import { useWindowDimensions } from "react-native";

export interface LayoutInfo {
  width: number;
  height: number;
  isLandscape: boolean;
  isTablet: boolean;
  isLandscapeTablet: boolean;
}

export function useLayout(): LayoutInfo {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 768;
  return {
    width,
    height,
    isLandscape,
    isTablet,
    isLandscapeTablet: isLandscape && isTablet,
  };
}
