import { Text } from 'react-native'

const fontMap = {
  light: 'PretendardLight',
  regular: 'PretendardRegular',
  medium: 'PretendardMedium',
  semibold: 'PretendardSemiBold',
  bold: 'PretendardBold',
}

export default function CustomText({
  children,
  style,
  weight = 'regular',
  ...props
}) {
  return (
    <Text
      style={[{ fontFamily: fontMap[weight] || fontMap.regular }, style]}
      {...props}
    >
      {children}
    </Text>
  )
}