import Text from '@/components/Text'
import { Link } from 'expo-router'
import { View } from 'react-native'

function NotFoundPage() {
  return (
    <View>
      <Text>This screen doesn't exist.</Text>

      <Link href="/">
        <Text>Go to home screen!</Text>
      </Link>
    </View>
  )
}

export default NotFoundPage
