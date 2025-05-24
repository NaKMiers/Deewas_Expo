import { useAppDispatch, useAppSelector } from '@/hooks/reduxHook'
import useSettings from '@/hooks/useSettings'
import { setInProgress, setOpenTutorial } from '@/lib/reducers/tutorialReducer'
import { cn } from '@/lib/utils'
import { updateMySettingsApi } from '@/requests'
import { usePathname, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Platform, TouchableOpacity, View } from 'react-native'
import BlurView from '../BlurView'
import Text from '../Text'
import { Progress } from '../ui/progress'

function TutorialOverlay() {
  // hooks
  const router = useRouter()
  const dispatch = useAppDispatch()
  const pathname = usePathname()
  const { settings, refetch: refetchSettings } = useSettings()
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('tutorialOverlay.' + key), [translate])

  // store
  const { open, step, inProgress } = useAppSelector(state => state.tutorial)

  // states
  const [completed, setCompleted] = useState<boolean>(true)

  const steps = useMemo(
    () => [
      {
        step: 1,
        title: `${t('Step 1')}: ${t('Create a Wallet')}`,
        description: t("Tap the 'New Wallet' button to set up your first wallet"),
        route: '/home',
      },
      {
        step: 2,
        title: `${'Step 1'}: ${t('Name Your Wallet')}`,
        description: t("Enter a name for your wallet and tap 'Save' to continue"),
        route: '/create-wallet',
      },
      {
        step: 3,
        title: `${t('Step 2')}: ${t('Add a Transaction')}`,
        description: t("Go to the 'Transactions' screen to view and manage your transactions"),
        route: '/home',
      },
      {
        step: 4,
        title: `${t('Step 2')}: ${t('Record a Transaction')}`,
        description: t("Tap 'Add Transaction' to log your first transaction"),
        route: '/transactions',
        boxStyle: { bottom: Platform.OS === 'ios' ? 240 : 206 },
      },
      {
        step: 5,
        title: `${t('Step 2')}: ${t('Complete Your Transaction')}`,
        description: t("Enter the name and amount for your transaction, then tap 'Save'"),
        route: '/create-transaction',
      },
      {
        step: 6,
        title: `${t('Step 3')}: ${t('Create a Budget')}`,
        description: t("Visit the 'Budgets' tab to start managing your finances"),
        route: '/transactions',
      },
      {
        step: 7,
        title: `${t('Step 3')}: ${t('Set Up a Budget')}`,
        description: t("Tap 'Create Budget' to define your spending plan"),
        route: '/budgets',
        boxStyle: { bottom: Platform.OS === 'ios' ? 240 : 206 },
      },
      {
        step: 8,
        title: `${t('Step 3')}: ${t('Finalize Your Budget')}`,
        description: t("Enter the name and amount for your budget, then tap 'Save'"),
        route: '/create-budget',
        boxStyle: { bottom: Platform.OS === 'ios' ? 180 : 146 },
      },
      {
        step: 9,
        title: `${t('Step 4')}: ${t('Your Finance Assistant')}`,
        description: t("Go to the 'Deewas' screen to chat with your AI assistant"),
        route: '/budgets',
      },
      {
        step: 10,
        title: `${t('Step 4')}: ${t('Ask Deewas a Question')}`,
        description: `${t('Ask Deewas')}: ${t('What’s my most expensive expense this month?')}`,
        route: '/ai',
        boxStyle: { bottom: Platform.OS === 'ios' ? 280 : 246 },
      },
      {
        step: 11,
        title: t('Welcome to Deewas!'),
        description: `${t('You’re all set!')} ${t('Thank you for choosing Deewas')} ${t('Let’s manage your finances together!')}`,
        route: '/ai',
        boxStyle: { bottom: Platform.OS === 'ios' ? 200 : 166 },
      },
    ],
    [t]
  )

  useEffect(() => {
    if (!settings) return

    if (!settings.firstLaunch) {
      setCompleted(false)
      dispatch(setOpenTutorial(true))
      dispatch(setInProgress(true))
    }
  }, [dispatch, settings])

  useEffect(() => {
    if (!inProgress || completed) return

    const curStep = steps[step - 1]
    if (curStep?.route && pathname !== curStep.route) {
      // Alert.alert(
      //   t('Stay on Track'),
      //   t("You're on your way! Follow the steps to continue or skip if you'd like")
      // )

      router.push(curStep.route as any)
    }
  }, [router, pathname, steps, step, inProgress, completed, t])

  // completed tutorial
  const handleCompleteTutorial = useCallback(async () => {
    try {
      setCompleted(true)
      dispatch(setOpenTutorial(false))
      dispatch(setInProgress(false))
      await updateMySettingsApi({ firstLaunch: true })
      refetchSettings()
    } catch (err: any) {
      console.log(err)
    }
  }, [dispatch, refetchSettings])

  // Handle skip tutorial
  const handleSkip = useCallback(async () => {
    if (step === steps.length) {
      return handleCompleteTutorial()
    }

    Alert.alert(t('Skip Tutorial'), t('Are you sure you want to skip the tutorial?'), [
      { text: t('Cancel') },
      {
        text: t('Skip'),
        onPress: handleCompleteTutorial,
      },
    ])
  }, [handleCompleteTutorial, step, steps, t])

  if (!open || completed) return null

  return (
    <View
      className="absolute w-full max-w-[500px] px-21/2"
      style={{
        left: '50%',
        bottom: Platform.OS === 'ios' ? 90 : 56,
        transform: [{ translateX: '-50%' }],
        ...steps[step - 1].boxStyle,
      }}
    >
      <BlurView
        className="items-center overflow-hidden rounded-xl border-2 border-sky-500 p-21"
        noBlur
      >
        <Progress
          value={(step / steps.length) * 100}
          indicatorClassName="bg-green-500"
          className="h-2 bg-primary/20"
        />

        <Text className="mt-4 text-xl font-bold">{steps[step - 1].title}</Text>
        <Text className="text-center text-base">{steps[step - 1].description}</Text>

        <TouchableOpacity
          onPress={handleSkip}
          className={cn(
            'mt-6 h-10 items-center justify-center rounded-full bg-primary px-21',
            step === steps.length && 'w-full'
          )}
        >
          <Text className="font-semibold text-secondary">
            {step === steps.length ? t('Finish Tutorial') : t('Skip Tutorial')}
          </Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  )
}

export default TutorialOverlay
