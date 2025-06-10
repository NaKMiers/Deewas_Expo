import { images } from '@/assets/images/images'
import { CHAT_MAX_WIDTH } from '@/constants'
import { cn } from '@/lib/utils'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, ImageBackground, TouchableOpacity, View } from 'react-native'
import BudgetCard from '../BudgetCard'
import Category from '../Category'
import Text from '../Text'
import Transaction from '../Transaction'
import WalletCard from '../WalletCard'
import { Markdown } from './Markdown'

interface MessageProps {
  role: 'assistant' | 'user'
  content: string
  parts?: any
}

function Message({ role, content, parts }: MessageProps) {
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('ERROR_CODE.' + key)

  const toolInvocations = parts?.[1]?.toolInvocation

  const isLarge = SCREEN_WIDTH >= CHAT_MAX_WIDTH

  // if tool is invoked, show the result of the tool
  if (toolInvocations && toolInvocations?.result) {
    const { _args, result, _state, _step, _toolCallId, toolName } = toolInvocations
    const message = result?.message || ''
    const errorCode = result?.errorCode

    // check if any error occurred
    if (errorCode) {
      return (
        <>
          <BasicMessage
            role={role}
            content={t(errorCode)}
          />
          {errorCode.includes('LIMIT') && (
            <View className="shadow-md">
              <ImageBackground
                source={images.preBgVFlip}
                className="overflow-hidden rounded-xl"
              >
                <TouchableOpacity
                  className="px-21 py-2"
                  onPress={() => router.push('/premium')}
                >
                  <Text className="py-1 text-center font-medium text-neutral-800">Upgrade Now</Text>
                </TouchableOpacity>
              </ImageBackground>
            </View>
          )}
        </>
      )
    }

    switch (toolName) {
      case 'get_all_wallets': {
        const wallets = result?.wallets || []

        // check if any wallets were found
        if (wallets.length <= 0) {
          return (
            <BasicMessage
              role={role}
              content="No wallets found"
            />
          )
        }

        // show a list of wallets
        return (
          <View>
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}
            <FlatList
              horizontal
              data={wallets}
              keyExtractor={item => item._id}
              showsHorizontalScrollIndicator={false}
              snapToInterval={isLarge ? CHAT_MAX_WIDTH / 2 : SCREEN_WIDTH - 21}
              decelerationRate="fast"
              className={cn('-mx-21/2 mb-21', !message && 'mt-21/2')}
              renderItem={({ item: wallet }: { item: IWallet }) => (
                <View
                  className="px-21/2"
                  style={{
                    width: isLarge ? CHAT_MAX_WIDTH / 2 : SCREEN_WIDTH - 21,
                  }}
                >
                  <WalletCard
                    wallet={wallet}
                    hideMenu
                  />
                </View>
              )}
            />
          </View>
        )
      }
      case 'get_wallet':
      case 'create_wallet':
      case 'update_wallet': {
        const wallet = result?.wallet

        // check if wallet was found
        if (!wallet) {
          return (
            <BasicMessage
              role={role}
              content={'No wallet found'}
            />
          )
        }

        // show the wallet details
        return (
          <View>
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}

            <WalletCard
              wallet={wallet}
              hideMenu
              className={cn('mb-21', !message && 'mt-21/2')}
            />
          </View>
        )
      }
      case 'delete_wallet': {
        const wallet = result?.wallet
        // check if wallet was found
        if (!wallet) {
          return (
            <BasicMessage
              role={role}
              content={'No wallet found'}
            />
          )
        }

        // show the message
        return (
          <BasicMessage
            role={role}
            content={`Wallet "${wallet.name}" deleted successfully!`}
          />
        )
      }
      case 'transfer_fund_from_wallet_to_wallet': {
        const sourceWallet = result?.sourceWallet
        const destinationWallet = result?.destinationWallet

        // check if source wallet was found
        if (!sourceWallet) {
          return (
            <BasicMessage
              role={role}
              content={'No source wallet found'}
            />
          )
        }

        // check if destination wallet was found
        if (!destinationWallet) {
          return (
            <BasicMessage
              role={role}
              content={'No destination wallet found'}
            />
          )
        }

        // show the source and destination wallets
        return (
          <View>
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}
            <FlatList
              horizontal
              data={[sourceWallet, destinationWallet]}
              keyExtractor={item => item._id}
              showsHorizontalScrollIndicator={false}
              snapToInterval={isLarge ? CHAT_MAX_WIDTH - 21 : SCREEN_WIDTH - 21}
              decelerationRate="fast"
              className={cn('-mx-21/2 mb-21', !message && 'mt-21/2')}
              renderItem={({ item: wallet }: { item: IWallet }) => (
                <View
                  className="px-21/2"
                  style={{
                    width: isLarge ? CHAT_MAX_WIDTH - 21 : SCREEN_WIDTH - 21,
                  }}
                >
                  <WalletCard
                    wallet={wallet}
                    hideMenu
                  />
                </View>
              )}
            />
          </View>
        )
      }
      case 'get_all_categories': {
        const categories = result?.categories || []

        // check if any categories were found
        if (categories.length <= 0) {
          return (
            <BasicMessage
              role={role}
              content="No categories found"
            />
          )
        }

        // show a list of wallets
        return (
          <View>
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}
            <View className={cn('mb-21 gap-1', !message && 'mt-21/2')}>
              {categories.map((c: ICategory) => (
                <Category
                  category={c}
                  hideMenu
                  key={c._id}
                />
              ))}
            </View>
          </View>
        )
      }
      case 'get_category':
      case 'create_category':
      case 'update_category': {
        const category = result?.category

        // check if category was found
        if (!category) {
          return (
            <BasicMessage
              role={role}
              content={'No category found'}
            />
          )
        }

        // show the wallet details
        return (
          <View>
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}

            <Category
              category={category}
              className={cn('mb-21', !message && 'mt-21/2')}
              hideMenu
            />
          </View>
        )
      }
      case 'delete_category': {
        const category = result?.category
        // check if category was found
        if (!category) {
          return (
            <BasicMessage
              role={role}
              content={'No category found'}
            />
          )
        }

        // show the message
        return (
          <BasicMessage
            role={role}
            content={`Category "${category.name}" deleted successfully!`}
          />
        )
      }
      case 'get_all_budgets': {
        const budgets = result?.budgets || []

        // check if any budgets were found
        if (budgets.length <= 0) {
          return (
            <BasicMessage
              role={role}
              content="No budgets found"
            />
          )
        }

        // show a list of wallets
        return (
          <View>
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}
            {budgets.map((b: IFullBudget) => (
              <BudgetCard
                budget={b}
                begin={b.begin}
                end={b.end}
                hideMenu
                key={b._id}
                className="mb-1"
              />
            ))}
          </View>
        )
      }
      case 'create_budget':
      case 'update_budget': {
        const budget = result?.budget

        // check if budget was found
        if (!budget) {
          return (
            <BasicMessage
              role={role}
              content={'No budget found'}
            />
          )
        }

        // show the wallet details
        return (
          <View>
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}

            <BudgetCard
              budget={budget}
              begin={budget.begin}
              end={budget.end}
              hideMenu
              className={cn('mb-21', !message && 'mt-21/2')}
            />
          </View>
        )
      }
      case 'delete_budget': {
        const budget = result?.budget
        // check if budget was found
        if (!budget) {
          return (
            <BasicMessage
              role={role}
              content={'No budget found'}
            />
          )
        }

        // show the message
        return (
          <BasicMessage
            role={role}
            content={`Budget for category ${budget.category.name} with total ${budget.total} deleted successfully!`}
          />
        )
      }
      case 'get_all_transactions': {
        const transactions = result?.transactions || []

        // check if any transactions were found
        if (transactions.length <= 0) {
          return (
            <BasicMessage
              role={role}
              content="No transactions found"
            />
          )
        }

        // show a list of transactions
        return (
          <View>
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}
            {transactions.map((t: IFullTransaction) => (
              <View
                className="mb-1"
                key={t._id}
              >
                <Transaction
                  transaction={t}
                  hideMenu
                />
              </View>
            ))}
          </View>
        )
      }
      case 'get_transaction':
      case 'get_most_transaction':
      case 'create_transaction':
      case 'update_transaction': {
        const transaction = result?.transaction

        // check if transaction was found
        if (!transaction) {
          return (
            <BasicMessage
              role={role}
              content={'No transaction found'}
            />
          )
        }

        // show the wallet details
        return (
          <View>
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}

            <Transaction
              transaction={transaction}
              hideMenu
              className={cn('mb-21', !message && 'mt-21/2')}
            />
          </View>
        )
      }
      case 'delete_transaction': {
        const transaction = result?.transaction
        // check if transaction was found
        if (!transaction) {
          return (
            <BasicMessage
              role={role}
              content={'No transaction found'}
            />
          )
        }

        // show the message
        return (
          <BasicMessage
            role={role}
            content={`Transaction "${transaction.name}" deleted successfully!`}
          />
        )
      }
    }
  }

  return (
    <BasicMessage
      role={role}
      content={content}
    />
  )
}

function BasicMessage({ role, content }: MessageProps) {
  return (
    <View
      className={cn(
        'flex-1 flex-row items-center gap-21/2',
        role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      <View
        className={cn(
          'gap-1 py-1.5',
          role === 'assistant'
            ? 'flex-1'
            : 'items-end rounded-[26px] rounded-br-xl border border-primary/5 bg-secondary px-4'
        )}
      >
        {typeof content === 'string' ? <Markdown>{content}</Markdown> : content}
      </View>
    </View>
  )
}

export default memo(Message)
