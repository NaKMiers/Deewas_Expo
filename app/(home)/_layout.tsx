import { Redirect, Stack } from 'expo-router'

function HomeLayout() {
  return <Redirect href="/auth/login" />

  // return (
  //   <Stack>
  //     <Stack.Screen name="index" />
  //   </Stack>
  // )
}

export default HomeLayout
