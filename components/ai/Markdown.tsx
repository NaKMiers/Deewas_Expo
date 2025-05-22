import { useColorScheme } from '@/lib/useColorScheme'
import { View } from 'react-native'
import MarkdownDisplay from 'react-native-markdown-display'

export function Markdown({ children }: { children: string }) {
  const { isDarkColorScheme } = useColorScheme()

  const markdownStyles = {
    body: { fontSize: 16, color: isDarkColorScheme ? '#fff' : '#111' },
    code_inline: {
      backgroundColor: '#f1f1f1',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: '#f1f1f1',
      padding: 8,
      borderRadius: 4,
    },
    list_item: {
      marginVertical: 4,
    },
    strong: {
      fontWeight: '600',
    },
  }

  return (
    <View>
      <MarkdownDisplay style={markdownStyles as any}>{children}</MarkdownDisplay>
    </View>
  )
}
