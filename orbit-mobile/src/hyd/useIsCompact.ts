import { useWindowDimensions } from 'react-native';

export function useIsCompact(breakpoint = 840) {
  const { width } = useWindowDimensions();
  return width < breakpoint;
}
