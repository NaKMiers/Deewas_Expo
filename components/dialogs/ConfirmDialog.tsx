import { cn } from '@/lib/utils'
import { memo, ReactNode } from 'react'
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

interface ConfirmDialogProps {
  open?: boolean
  close?: (_open: boolean) => void
  trigger?: ReactNode
  label: string
  desc: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  disabled?: boolean
  className?: string
}

function ConfirmDialog({
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
}: ConfirmDialogProps) {
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

      <AlertDialogContent className="border-200/30 rounded-lg border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-primary">{label}</AlertDialogTitle>
          <AlertDialogDescription>{desc}</AlertDialogDescription>
        </AlertDialogHeader>
        <Separator className="h-px bg-slate-300/50" />
        <AlertDialogFooter className="flex-row items-center justify-end gap-2">
          <AlertDialogCancel className="mt-0 px-2 text-sm">
            <Text>{cancelLabel}</Text>
          </AlertDialogCancel>
          {confirmLabel && onConfirm && (
            <AlertDialogAction
              className="bg mt-0 px-2 text-sm"
              onPress={onConfirm}
            >
              <Text className="font-semibold text-secondary">{confirmLabel}</Text>
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default memo(ConfirmDialog)
