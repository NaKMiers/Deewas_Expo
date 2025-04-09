import { cn } from '@/lib/utils'
import { View } from 'react-native'
import { Markdown } from './markdown'

function Message({ role, content }: { role: 'assistant' | 'user'; content: string }) {
  return (
    <View
      className={cn(
        'flex flex-1 flex-row items-center gap-21/2',
        role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      <View
        className={cn(
          'flex flex-col gap-1 py-1.5',
          role === 'assistant' ? 'flex-1' : 'items-end rounded-[26px] rounded-br-xl bg-secondary px-4'
        )}
      >
        {typeof content === 'string' ? <Markdown>{content}</Markdown> : content}
      </View>
    </View>
  )
}

export default Message
