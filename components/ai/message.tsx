import { cn } from '@/lib/utils'
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet'
import { FlatList, View } from 'react-native'
import BudgetCard from '../BudgetCard'
import Category from '../Category'
import { Transaction } from '../LatestTransactions'
import WalletCard from '../WalletCard'
import { Markdown } from './markdown'

interface MessageProps {
  role: 'assistant' | 'user'
  content: string
  parts?: any
}

export default function Message({ role, content, parts }: MessageProps) {
  const toolInvocations = parts?.[1]?.toolInvocation

  const MAX_WIDTH = 500
  const isLarge = SCREEN_WIDTH >= MAX_WIDTH

  // if tool is invoked, show the result of the tool
  if (toolInvocations && toolInvocations?.result) {
    const { args, result, state, step, toolCallId, toolName } = toolInvocations
    const message = result?.message || ''
    const error = result?.error

    // check if any error occurred
    if (error) {
      return (
        <BasicMessage
          role={role}
          content={error}
        />
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
          <View className="flex flex-col">
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
              snapToInterval={isLarge ? 500 - 21 : SCREEN_WIDTH - 21}
              decelerationRate="fast"
              className={cn('-mx-21/2 mb-21/2', !message && 'mt-21/2')}
              renderItem={({ item: wallet }: { item: IWallet }) => (
                <View
                  className="px-21/2"
                  style={{
                    width: isLarge ? 500 - 21 : SCREEN_WIDTH - 21,
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
          <View className="flex flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}

            <WalletCard
              wallet={wallet}
              hideMenu
              className={cn('mb-21/2', !message && 'mt-21/2')}
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
          <View className="flex flex-col">
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
              snapToInterval={isLarge ? 500 - 21 : SCREEN_WIDTH - 21}
              decelerationRate="fast"
              className={cn('-mx-21/2 mb-21/2', !message && 'mt-21/2')}
              renderItem={({ item: wallet }: { item: IWallet }) => (
                <View
                  className="px-21/2"
                  style={{
                    width: isLarge ? 500 - 21 : SCREEN_WIDTH - 21,
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
          <View className="flex flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}
            <FlatList
              data={categories}
              keyExtractor={item => item._id}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              className={cn('mb-21/2', !message && 'mt-21/2')}
              renderItem={({ item: category }: { item: ICategory }) => (
                <View className="mb-1">
                  <Category
                    category={category}
                    hideMenu
                  />
                </View>
              )}
            />
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
          <View className="flex flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}

            <Category
              category={category}
              className={cn('mb-21/2', !message && 'mt-21/2')}
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
      case 'get_budgets': {
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
          <View className="flex flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}
            <FlatList
              data={budgets}
              keyExtractor={item => item._id}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              className={cn('mb-21/2', !message && 'mt-21/2')}
              renderItem={({ item: budget }: { item: IFullBudget }) => (
                <View className="mb-1">
                  <BudgetCard
                    budget={budget}
                    begin={budget.begin}
                    end={budget.end}
                    hideMenu
                  />
                </View>
              )}
            />
          </View>
        )
      }
      case 'create_budget': {
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
          <View className="flex flex-col">
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
              className={cn('mb-21/2', !message && 'mt-21/2')}
            />
          </View>
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
          <View className="flex flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}
            <FlatList
              data={transactions}
              keyExtractor={item => item._id}
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              className={cn('mb-21/2', !message && 'mt-21/2')}
              renderItem={({ item: transaction }: { item: IFullTransaction }) => (
                <View className="mb-1">
                  <Transaction
                    transaction={transaction}
                    hideMenu
                  />
                </View>
              )}
            />
          </View>
        )
      }
      case 'get_transaction':
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
          <View className="flex flex-col">
            {message && (
              <BasicMessage
                content={message}
                role={role}
              />
            )}

            <Transaction
              transaction={transaction}
              hideMenu
              className={cn('mb-21/2', !message && 'mt-21/2')}
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
