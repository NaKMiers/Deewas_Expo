import TutorialOverlay from '@/components/dialogs/TutorialOverlay'
import * as Device from 'expo-device'
import { Stack } from 'expo-router'

export default function DrawerLayout() {
  const isTablet = Device.deviceType === Device.DeviceType.TABLET

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          presentation: !isTablet ? 'modal' : undefined,
          animation: !isTablet ? 'slide_from_bottom' : undefined,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <TutorialOverlay />
    </>
  )
}
