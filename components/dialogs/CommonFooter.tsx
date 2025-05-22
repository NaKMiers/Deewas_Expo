import { cn } from '@/lib/utils'
import React, { memo } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

interface CommonFooterProps {
  cancelLabel: string
  acceptLabel?: string
  onCancel: () => void
  onAccept?: () => void
  loading?: boolean
  className?: string
  inTutorial?: boolean
}

function CommonFooter({
  cancelLabel,
  acceptLabel,
  onCancel,
  onAccept,
  loading,
  inTutorial,
  className,
}: CommonFooterProps) {
  return (
    <View className={cn('flex-row items-center justify-end gap-21/2', className)}>
      <TouchableOpacity
        className="h-12 min-w-[60px] items-center justify-center rounded-md border border-primary/10 bg-secondary px-21/2"
        onPress={inTutorial ? () => {} : onCancel}
      >
        <Text className="font-semibold text-primary">{cancelLabel}</Text>
      </TouchableOpacity>
      {onAccept && acceptLabel && (
        <View className="relative">
          {inTutorial && (
            <View
              className="absolute left-0 top-1/2 z-10 h-16 w-[calc(100%)] -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-sky-500 bg-sky-500/10"
              pointerEvents="none"
            />
          )}
          <TouchableOpacity
            className="h-12 min-w-[80px] items-center justify-center rounded-md border border-primary/10 bg-primary px-21/2"
            onPress={onAccept}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text className="font-semibold text-secondary">{acceptLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default memo(CommonFooter)
