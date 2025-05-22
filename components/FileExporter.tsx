import { capitalize } from '@/lib/string'
import { cn } from '@/lib/utils'
import { getAllDataToExportApi } from '@/requests'
import * as FileSystem from 'expo-file-system'
import { router } from 'expo-router'
import * as Sharing from 'expo-sharing'
import JSZip from 'jszip'
import { LucideFileUp } from 'lucide-react-native'
import moment from 'moment'
import Papa from 'papaparse'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native'
import XLSX from 'xlsx'
import BlurView from './BlurView'
import Icon from './Icon'
import Text from './Text'
import ConfirmDialog from './dialogs/ConfirmDialog'
import PremiumLimitModal from './dialogs/PremiumLimitModal'
import { useAuth } from './providers/AuthProvider'

interface Data {
  wallets: IWallet[]
  categories: ICategory[]
  budgets: IFullBudget[]
  transactions: IFullTransaction[]
}

interface FileExporterProps {
  className?: string
}

function FileExporter({ className }: FileExporterProps) {
  // hooks
  const { isPremium } = useAuth()
  const { t: translate } = useTranslation()
  const t = useCallback((key: string) => translate('fileExporter.' + key), [translate])
  const tError = useCallback((key: string) => translate('error.' + key), [translate])

  // states
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState<number>(0)
  const [openPremiumModal, setOpenPremiumModal] = useState<boolean>(false)

  // get all data to export
  const getAllData = useCallback(async () => {
    try {
      const { wallets, categories, budgets, transactions } = await getAllDataToExportApi()
      const data = { wallets, categories, budgets, transactions }
      setData(data)
      return data
    } catch (err: any) {
      console.log('Error fetching transactions:', err)
      throw err
    }
  }, [])

  // flat data
  const flatData = useCallback((data: Data) => {
    const wallets = data.wallets.map(w => ({
      Name: w.icon + ' ' + w.name,
      Income: Math.round(w.income * 100) / 100,
      Expense: Math.round(w.expense * 100) / 100,
      Saving: Math.round(w.saving * 100) / 100,
      Invest: Math.round(w.invest * 100) / 100,
      Exclude: w.exclude ? 'Yes' : 'No',
    }))
    const categories = data.categories.map(c => ({
      Name: c.icon + ' ' + c.name,
      Type: capitalize(c.type),
      Amount: Math.round(c.amount * 100) / 100,
    }))
    const budgets = data.budgets.map(b => ({
      Category: b.category.icon + ' ' + b.category.name,
      Total: Math.round(b.total * 100) / 100,
      Begin: moment(b.begin).format('MM-DD-YYYY'),
      End: moment(b.end).format('MM-DD-YYYY'),
    }))
    const transactions = data.transactions.map(t => ({
      Name: t.name,
      Type: capitalize(t.type),
      Amount: Math.round(t.amount * 100) / 100,
      Category: t.category.icon + ' ' + t.category.name,
      Wallet: t.wallet.icon + ' ' + t.wallet.name,
      Date: moment(t.date).format('MM-DD-YYYY'),
    }))

    return { wallets, categories, budgets, transactions }
  }, [])

  const cleanUpOldFiles = useCallback(async () => {
    if (!FileSystem.documentDirectory) return
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory)
    for (const file of files) {
      await FileSystem.deleteAsync(FileSystem.documentDirectory + file)
    }
  }, [])

  // export to csv files (wallets.csv, categories.csv, budgets.csv, transactions.csv)
  const exportCSV = useCallback(async () => {
    // check if user is premium
    if (!isPremium) {
      setOpenPremiumModal(true)
      return
    }

    // start loading
    setLoading(1)

    try {
      let rawData = data || (await getAllData())
      const flattedData = flatData(rawData)

      const zip = new JSZip()

      zip.file('deewas-wallets.csv', Papa.unparse(flattedData.wallets))
      zip.file('deewas-categories.csv', Papa.unparse(flattedData.categories))
      zip.file('deewas-budgets.csv', Papa.unparse(flattedData.budgets))
      zip.file('deewas-transactions.csv', Papa.unparse(flattedData.transactions))

      const content = await zip.generateAsync({ type: 'base64' })

      const zipUri = FileSystem.documentDirectory + 'deewas-data.zip'
      await FileSystem.writeAsStringAsync(zipUri, content, {
        encoding: FileSystem.EncodingType.Base64,
      })

      Alert.alert(t('Export Complete'), t('All CSV files have been exported and zipped'))

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(zipUri)
      }
    } catch (err: any) {
      console.log(err)
      Alert.alert(tError('Export Failed'), tError('An error occurred while exporting CSV files'))
    } finally {
      // stop loading
      setLoading(0)
      cleanUpOldFiles()
    }
  }, [getAllData, flatData, cleanUpOldFiles, t, tError, data, isPremium])

  const exportExcel = useCallback(async () => {
    // check if user is premium
    if (!isPremium) {
      setOpenPremiumModal(true)
      return
    }

    // start loading
    setLoading(2)

    try {
      let rawData = data || (await getAllData())
      const flattedData = flatData(rawData)

      const wb = XLSX.utils.book_new()

      const wsWallets = XLSX.utils.json_to_sheet(flattedData.wallets)
      const wsCategories = XLSX.utils.json_to_sheet(flattedData.categories)
      const wsBudgets = XLSX.utils.json_to_sheet(flattedData.budgets)
      const wsTransactions = XLSX.utils.json_to_sheet(flattedData.transactions)

      XLSX.utils.book_append_sheet(wb, wsWallets, 'Wallets')
      XLSX.utils.book_append_sheet(wb, wsCategories, 'Categories')
      XLSX.utils.book_append_sheet(wb, wsBudgets, 'Budgets')
      XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transactions')

      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' })

      const fileUri = FileSystem.documentDirectory + 'deewas-data.xlsx'
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      })

      Alert.alert(t('Export Complete'), t('All data has been exported to Excel file'))

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri)
      }
    } catch (err: any) {
      console.error('Export Excel error:', err)
      Alert.alert(tError('Export Failed'), tError('An error occurred while exporting Excel file'))
    } finally {
      // stop loading
      setLoading(0)
      cleanUpOldFiles()
    }
  }, [getAllData, flatData, cleanUpOldFiles, t, tError, data, isPremium])

  return (
    <View className="shadow-md">
      <BlurView
        intensity={90}
        className={cn('overflow-hidden', className)}
      >
        <ConfirmDialog
          label={t('Export CSV')}
          desc={t('Are you sure you want to export all data as CSV?')}
          confirmLabel={t('Export')}
          cancelLabel={t('Cancel')}
          onConfirm={exportCSV}
          className='flex-shrink-0'
          trigger={
            <TouchableOpacity
              activeOpacity={0.7}
              className={cn('w-1/2 flex-1 flex-row items-center gap-2', loading > 0 && 'opacity-50')}
              disabled={loading > 0}
              style={{ height: 36 }}
            >
              {loading === 1 ? (
                <ActivityIndicator size={16} />
              ) : (
                <Icon
                  render={LucideFileUp}
                  size={19}
                />
              )}
              <Text className="text-lg font-semibold">{t('Export CSV')}</Text>
            </TouchableOpacity>
          }
        />
        <ConfirmDialog
          label={t('Export Excel')}
          desc={t('Are you sure you want to export all data as Excel?')}
          confirmLabel={t('Export')}
          cancelLabel={t('Cancel')}
          onConfirm={exportExcel}
          className='flex-shrink-0'
          trigger={
            <TouchableOpacity
              activeOpacity={0.7}
              className={cn('w-1/2 flex-1 flex-row items-center gap-2', loading > 0 && 'opacity-50')}
              disabled={loading > 0}
              style={{ height: 36 }}
            >
              {loading === 2 ? (
                <ActivityIndicator size={16} />
              ) : (
                <Icon
                  render={LucideFileUp}
                  size={19}
                />
              )}
              <Text className="text-lg font-semibold">{t('Export Excel')}</Text>
            </TouchableOpacity>
          }
        />

        {/* Premium Modal */}
        <PremiumLimitModal
          open={openPremiumModal}
          close={() => setOpenPremiumModal(false)}
          label={t('Please upgrade to Premium to export data')}
          confirmLabel={t('Upgrade Now')}
          cancelLabel={t('Cancel')}
          onConfirm={() => router.push('/premium')}
        />
      </BlurView>
    </View>
  )
}

export default memo(FileExporter)
