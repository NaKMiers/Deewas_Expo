import { registerRootComponent } from 'expo'
import { ExpoRoot } from 'expo-router'

// Must be exported or Fast Refresh won't update the context
export function App() {
  // useEffect(() => {
  //   GoogleSignin.configure({
  //     iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
  //     webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  //     profileImageSize: 150,
  //   })
  // })

  const ctx = require.context('./app')
  return <ExpoRoot context={ctx} />
}

registerRootComponent(App)
