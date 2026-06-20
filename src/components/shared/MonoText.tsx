import { Text, StyleSheet } from 'react-native'
import type { TextProps } from 'react-native'
import { FontFamily } from '@/theme/fonts'
import { palette } from '@/theme'

type MonoSize = 'lg' | 'md' | 'sm'
type MonoWeight = 'regular' | 'bold'

interface MonoTextProps extends Omit<TextProps, 'style'> {
  size?: MonoSize
  weight?: MonoWeight
  color?: string
  style?: TextProps['style']
}

export function MonoText({
  size = 'md',
  weight = 'regular',
  color = palette.zinc950,
  style,
  children,
  ...rest
}: MonoTextProps): React.JSX.Element {
  return (
    <Text
      style={[styles[size], styles[weight], { color }, style]}
      {...rest}
    >
      {children}
    </Text>
  )
}

const styles = StyleSheet.create({
  lg:      { fontFamily: FontFamily.mono.bold,    fontSize: 20, lineHeight: 26 },
  md:      { fontFamily: FontFamily.mono.regular, fontSize: 14, lineHeight: 20 },
  sm:      { fontFamily: FontFamily.mono.regular, fontSize: 12, lineHeight: 16 },
  regular: { fontFamily: FontFamily.mono.regular },
  bold:    { fontFamily: FontFamily.mono.bold },
})
