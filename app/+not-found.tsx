import Text from '@/components/Text'
import { Link } from 'expo-router'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function NotFoundPage() {
  return (
    <SafeAreaView className='flex-1'>
      <View>
        <Text>This screen doesn't exist.</Text>

        <Link href='/'>
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </SafeAreaView>
  )
}

export default NotFoundPage
