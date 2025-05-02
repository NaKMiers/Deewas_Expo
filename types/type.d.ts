// Models
declare interface IBudget {
  _id: string
  createdAt: string
  updatedAt: string

  user: string
  category: string

  total: number
  begin: string
  end: string

  amount: number
}

declare type IFullBudget = IBudget & { user: IUser; category: ICategory }

declare interface ICategory {
  _id: string
  createdAt: string
  updatedAt: string

  name: string
  user: string
  icon: string
  type: TransactionType
  amount: number
  deletable: boolean
}

declare type IFullCategory = ICategory & { user: IUser }

declare interface ISettings {
  _id: string
  createdAt: string
  updatedAt: string

  user: string
  personalities: number[]
  currency: string
  language: string

  freeTokensUsed: number
}

declare type IFullSettings = ISettings & { user: IUser }

declare interface ITransaction {
  _id: string
  createdAt: string
  updatedAt: string

  user: string
  wallet: string
  category: string
  type: TransactionType
  name: string
  amount: number
  date: string
}

declare type TransactionType = 'income' | 'expense' | 'saving' | 'invest' | 'transfer' | 'balance'

declare type IFullTransaction = ITransaction & { category: ICategory; wallet: IWallet; user: IUser }

declare interface IUser {
  _id: string
  createdAt: string
  updatedAt: string

  username: string
  email: string
  password: string
  authType: TAuthType
  role: TUserRole

  avatar: string
  name: string
  initiated: boolean

  plan: string
  planExpiredAt: Date | null
  purchasedAtPlatform: string
}

declare type IFullUser = IUser & { iat: number; exp: number }

declare type TAuthType = 'local' | 'google' | 'facebook' | 'apple'
declare type TUserRole = 'admin' | 'user'

declare interface IWallet {
  _id: string
  createdAt: string
  updatedAt: string

  user: string
  name: string
  icon: string
  hide: boolean

  income: number
  expense: number
  saving: number
  invest: number
  transfer: number
}

declare type IFullWallet = IWallet & { user: IUser }

// Components
declare type ChartType = 'bar' | 'line' | 'pie' | 'radar' | 'pyramid'

declare type TimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'

declare type ChartItem = {
  value: number
  label: string
  type: TransactionType
}
