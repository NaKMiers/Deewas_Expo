import { images } from '@/assets/images/images'
import { cn } from '@/lib/utils'
import { LucideCheck } from 'lucide-react-native'
import { useState } from 'react'
import { Image, ScrollView, TouchableOpacity, View } from 'react-native'
import Icon from '../Icon'
import Text from '../Text'
import { Separator } from '../ui/separator'

const personalities = [
  {
    id: 0,
    title: 'The Tough Love Mom',
    role: 'Strict Mother',
    image: images.theToughLoveMom,
    description: 'No nonsense. Always nagging, always watching.',
    prompt:
      'Speak firmly and directly. Remind the user of their goals and reprimand overspending like a strict mom keeping the house in order.',
  },
  {
    id: 1,
    title: 'The Angry Big Sister',
    role: 'Tough-Love Sis',
    image: images.theAngryBigSister,
    description: "Blunt, bossy, and doesn't hold back — but it’s because she cares.",
    prompt:
      'Speak like a fiery big sister. Be direct, sarcastic, and slightly bossy. Show tough love by pushing the user to be responsible, while letting just a bit of care sneak through.',
  },
  {
    id: 2,
    title: 'The Caring Lover',
    role: 'Supportive Partner',
    image: images.theCaringLover,
    description: 'Sweet, encouraging, always on your side.',
    prompt:
      'Talk with warmth and compassion, like a loving partner. Gently guide the user and celebrate their progress emotionally.',
  },
  {
    id: 3,
    title: 'The Friendly Buddy',
    role: 'Chill Best Friend',
    image: images.theFriendlyBuddy,
    description: 'Relaxed, funny, but always got your back.',
    prompt:
      'Use casual, friendly language. Make finance fun and low-pressure. Give advice like a friend who wants you to win without the drama.',
  },
  {
    id: 4,
    title: 'The Creative Little Bro',
    role: 'Playful Innovator',
    image: images.theCreativeLittleBro,
    description: 'Quirky ideas and unexpected solutions.',
    prompt:
      'Think out of the box, suggest creative ways to save/spend. Use a playful tone like a curious little brother full of energy.',
  },
  {
    id: 5,
    title: 'The Gentle Dad',
    role: 'Wise Father Figure',
    image: images.theGentleDad,
    description: 'Calm, wise, and deeply supportive.',
    prompt:
      'Speak slowly, wisely, and reassuringly. Offer life lessons through money tips, like a dad teaching his child the value of patience and planning.',
  },
  {
    id: 6,
    title: 'The Loyal Puppy',
    role: 'Uncomplaining Companion',
    image: images.theLoyalPuppy,
    description: 'Always happy, never complains, just here to cheer you on.',
    prompt:
      'Respond with unwavering positivity and loyalty. Avoid criticism. Encourage everything the user does, like a puppy wagging its tail no matter what.',
  },
  {
    id: 7,
    title: 'The Moody Cat',
    role: 'Aloof Genius',
    image: images.theMoodyCat,
    description: 'Independent, unpredictable, helps when *they* feel like it — but always spot on.',
    prompt:
      "Respond with sharp wit and subtle sarcasm. Offer helpful advice, but only when it feels earned. Be a bit mysterious, like you're smarter than you let on. Think cool, clever, and effortlessly insightful.",
  },
]

export default function Slide5({ onChange }: { onChange: (value: any) => void }) {
  const [selected, setSelected] = useState<any[]>([])

  return (
    <View className="flex flex-1 items-center justify-center">
      <Text className="text-center text-3xl font-bold text-primary">
        Pick a personality for Deewas assistant?
      </Text>
      <Text className="mt-1 text-center font-medium text-primary">
        Select multiple if you'd like to mix styles.
      </Text>

      <ScrollView className="mt-21 w-full flex-1">
        <View className="mx-auto mt-8 flex w-full max-w-[500px] flex-row flex-wrap gap-y-2 px-21/2">
          {personalities.map((item, index) => (
            <View
              className="w-1/2 flex-row px-1"
              key={index}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                className={cn(
                  'relative flex w-full rounded-lg border-2 border-transparent bg-secondary p-2',
                  selected.some(i => i.id === item.id) && 'border-primary'
                )}
                onPress={() =>
                  selected.some(i => i.id === item.id)
                    ? setSelected(selected.filter(i => i.id !== item.id))
                    : selected.length < 3 && setSelected([...selected, item])
                }
                key={index}
              >
                {selected.some(i => i.id === item.id) && (
                  <Icon
                    className="absolute right-21/2 top-21/2"
                    render={LucideCheck}
                    size={20}
                    color="#22c55e"
                  />
                )}

                <View className="h-[100px] p-21/2">
                  <Image
                    source={item.image}
                    className="h-full w-full"
                    resizeMode="contain"
                  />
                </View>

                <Text className="text-center font-semibold">{item.title}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Separator className="my-4 h-0" />
      </ScrollView>

      <View className="w-full px-21/2 md:px-21">
        <TouchableOpacity
          className={cn(
            'mb-21 mt-21 flex h-14 flex-shrink-0 flex-row items-center justify-center rounded-full bg-primary px-8'
          )}
          onPress={() => onChange(selected.map(p => p.id).sort())}
        >
          <Text className="text-lg font-semibold text-secondary">Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
