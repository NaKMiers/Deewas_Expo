import { ChevronDown } from '@/lib/icons/ChevronDown'
import { ChevronUp } from '@/lib/icons/ChevronUp'
import { useColorScheme } from '@/lib/useColorScheme'
import { cn } from '@/lib/utils'
import * as SelectPrimitive from '@rn-primitives/select'
import { LucideChevronDown } from 'lucide-react-native'
import * as React from 'react'
import { Platform, StyleSheet } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import BlurView from '../BlurView'

type Option = SelectPrimitive.Option

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<SelectPrimitive.TriggerRef, SelectPrimitive.TriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isDarkColorScheme } = useColorScheme()

    return (
      <BlurView
        className="overflow-hidden rounded-md"
        tint="prominent"
        intensity={100}
        noBlur
      >
        <SelectPrimitive.Trigger
          ref={ref}
          className={cn(
            'native:h-12 h-10 flex-row items-center justify-between rounded-md border border-primary/10 px-3 py-2 text-sm text-muted-foreground web:ring-offset-background web:focus:outline-none web:focus:ring-2 web:focus:ring-ring web:focus:ring-offset-2 [&>span]:line-clamp-1',
            props.disabled && 'opacity-50 web:cursor-not-allowed',
            className
          )}
          {...props}
        >
          <>{children}</>
          <LucideChevronDown
            size={16}
            aria-hidden={true}
            color={isDarkColorScheme ? '#fff' : '#111'}
            className="opacity-70"
          />
        </SelectPrimitive.Trigger>
      </BlurView>
    )
  }
)
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

/**
 * Platform: WEB ONLY
 */
const SelectScrollUpButton = ({ className, ...props }: SelectPrimitive.ScrollUpButtonProps) => {
  if (Platform.OS !== 'web') {
    return null
  }
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn('items-center justify-center py-1 web:cursor-default', className)}
      {...props}
    >
      <ChevronUp
        size={14}
        className="text-foreground"
      />
    </SelectPrimitive.ScrollUpButton>
  )
}

/**
 * Platform: WEB ONLY
 */
const SelectScrollDownButton = ({ className, ...props }: SelectPrimitive.ScrollDownButtonProps) => {
  if (Platform.OS !== 'web') {
    return null
  }
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn('items-center justify-center py-1 web:cursor-default', className)}
      {...props}
    >
      <ChevronDown
        size={14}
        className="text-foreground"
      />
    </SelectPrimitive.ScrollDownButton>
  )
}

const SelectContent = React.forwardRef<
  SelectPrimitive.ContentRef,
  SelectPrimitive.ContentProps & { portalHost?: string }
>(({ className, children, position = 'popper', portalHost, ...props }, ref) => {
  const { open } = SelectPrimitive.useRootContext()

  return (
    <SelectPrimitive.Portal hostName={portalHost}>
      <SelectPrimitive.Overlay style={Platform.OS !== 'web' ? StyleSheet.absoluteFill : undefined}>
        <Animated.View
          className="z-50"
          entering={FadeIn}
          exiting={FadeOut}
        >
          <SelectPrimitive.Content
            ref={ref}
            className={cn(
              'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-primary/10 shadow-md shadow-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              position === 'popper' &&
                'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
              open
                ? 'web:animate-in web:fade-in-0 web:zoom-in-95'
                : 'web:animate-out web:fade-out-0 web:zoom-out-95',
              className
            )}
            position={position}
            {...props}
          >
            <BlurView
              className="px-1 py-2"
              intensity={80}
              tint="prominent"
              noBlur
            >
              <SelectScrollUpButton />
              <SelectPrimitive.Viewport
                className={cn(
                  'p-1',
                  position === 'popper' &&
                    'h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]'
                )}
              >
                <ScrollView>{children}</ScrollView>
              </SelectPrimitive.Viewport>
              <SelectScrollDownButton />
            </BlurView>
          </SelectPrimitive.Content>
        </Animated.View>
      </SelectPrimitive.Overlay>
    </SelectPrimitive.Portal>
  )
})
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<SelectPrimitive.LabelRef, SelectPrimitive.LabelProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Label
      ref={ref}
      className={cn(
        'native:pb-2 native:pl-10 native:text-base py-1.5 pl-8 pr-2 text-sm font-semibold text-popover-foreground',
        className
      )}
      {...props}
    />
  )
)
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<SelectPrimitive.ItemRef, SelectPrimitive.ItemProps>(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        'web:group native:py-2 native:pl-2 relative w-full flex-row items-center rounded-sm py-1.5 pl-2 pr-2 active:bg-accent web:cursor-default web:select-none web:outline-none web:hover:bg-accent/50 web:focus:bg-accent',
        props.disabled && 'opacity-50 web:pointer-events-none',
        className
      )}
      {...props}
    >
      {/* <View className="native:left-3.5 native:pt-px absolute left-2 h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check
            size={16}
            strokeWidth={3}
            className="text-popover-foreground"
          />
        </SelectPrimitive.ItemIndicator>
      </View> */}
      <SelectPrimitive.ItemText className="native:text-lg native:text-base text-sm text-popover-foreground web:group-focus:text-accent-foreground" />
    </SelectPrimitive.Item>
  )
)
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<SelectPrimitive.SeparatorRef, SelectPrimitive.SeparatorProps>(
  ({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
      ref={ref}
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
      {...props}
    />
  )
)
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type Option,
}
