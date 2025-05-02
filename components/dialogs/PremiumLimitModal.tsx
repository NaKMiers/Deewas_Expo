import { images } from '@/assets/images/images'
import { cn } from '@/lib/utils'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import moment from 'moment'
import { memo, ReactNode } from 'react'
import { View } from 'react-native'
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

      <AlertDialogContent className="border-200/30 border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">{label}</AlertDialogTitle>
          {desc && <AlertDialogDescription className="text-center">{desc}</AlertDialogDescription>}
        </AlertDialogHeader>

        <View className="items-center gap-2">
          <Countdown
            timeType="once"
            start={moment().startOf('day').toISOString()}
            expire={moment().endOf('day').toISOString()}
            textClassName="text-white"
          />

          <View
            className="rounded-3xl shadow-lg"
            style={{ width: SCREEN_WIDTH - 100, height: 152 }}
          >
            <Image
              source={images.flashSale}
              resizeMode="cover"
              className="h-full w-full rounded-3xl shadow-lg"
            />
          </View>
        </View>

        <Separator className="h-px bg-slate-300/50" />

        <AlertDialogFooter className="flex flex-row items-center justify-end gap-2">
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
