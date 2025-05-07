import { cn } from '@/lib/utils'
import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'

interface CommonFooterProps {
  cancelLabel: string
  acceptLabel?: string
  onCancel: () => void
  onAccept?: () => void
  loading?: boolean
  className?: string
}

function CommonFooter({
  cancelLabel,
  acceptLabel,
  onCancel,
  onAccept,
  loading,
  className,
}: CommonFooterProps) {
  return (
    <View className={cn('flex-row items-center justify-end gap-21/2', className)}>
      <TouchableOpacity
        className="h-12 min-w-[60px] items-center justify-center rounded-md border border-primary/10 bg-secondary px-21/2"
        onPress={onCancel}
      >
        <Text className="font-semibold text-primary">{cancelLabel}</Text>
      </TouchableOpacity>
      {onAccept && acceptLabel && (
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
      )}
    </View>
  )
}

export default CommonFooter
