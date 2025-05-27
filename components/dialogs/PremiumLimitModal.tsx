import { images } from '@/assets/images/images'
import { cn } from '@/lib/utils'
import moment from 'moment'
import { memo, ReactNode } from 'react'
import { Platform, View } from 'react-native'
import Countdown from '../Countdown'
import Image from '../Image'
import Text from '../Text'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import { Separator } from '../ui/separator'

interface PremiumLimitModalProps {
  open?: boolean
  close?: (_open: boolean) => void
  trigger?: ReactNode
  label: string
  desc?: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  disabled?: boolean
  className?: string
}

function PremiumLimitModal({
  open,
  close,
  trigger,
  label,
  desc,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  disabled = false,
  className,
}: PremiumLimitModalProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={close}
    >
      {trigger && (
        <AlertDialogTrigger
          asChild
          disabled={disabled}
          className={cn('h-full w-full', className)}
        >
          {trigger}
        </AlertDialogTrigger>
      )}

      <AlertDialogContent className="border-200/30 rounded-3xl border">
        <AlertDialogHeader>
          <AlertDialogTitle className={cn('text-center', Platform.OS === 'ios' && 'text-white')}>
            {label}
          </AlertDialogTitle>
          {desc && <AlertDialogDescription className="text-center">{desc}</AlertDialogDescription>}
        </AlertDialogHeader>

        <View className="items-center gap-2">
          <Countdown
            timeType="loop"
            duration={7 * 24 * 60} // 7 days
            start={moment().startOf('week').toISOString()}
            textClassName={cn('text-primary', Platform.OS === 'ios' && 'text-white')}
          />

          <View className="aspect-video w-full rounded-3xl bg-white shadow-lg">
            <Image
              source={images.flashSale}
              resizeMode="cover"
              className="h-full w-full rounded-3xl bg-white shadow-lg"
            />
          </View>
        </View>

        <Separator className="h-px bg-slate-300/50" />

        <AlertDialogFooter className="flex-row items-center justify-end gap-2">
          <AlertDialogCancel className="mt-0 border-0 px-2 text-sm">
            <Text>{cancelLabel}</Text>
          </AlertDialogCancel>
          <AlertDialogAction
            className="mt-0 px-2 text-sm"
            onPress={onConfirm}
          >
            <Text className="border-0 font-semibold text-secondary">{confirmLabel}</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default memo(PremiumLimitModal)
