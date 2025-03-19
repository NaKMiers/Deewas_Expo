import Text from '@/components/Text'
import { Link } from 'expo-router'
import React from 'react'
import { View } from 'react-native'

function HomeScreen() {
  return (
    <View>
      <Text>HomeScreen</Text>
      <Link href="/auth/login">
        <Text>Login</Text>
      </Link>
    </View>
  )
}

export default HomeScreen
