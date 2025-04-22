import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { languages } from '@/constants/settings'
import useLanguage from '@/hooks/useLanguage'
import { Separator } from '@rn-primitives/select'
import { Link, router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRef } from 'react'
import { Stack } from 'expo-router'

export default function TermsAndConditionsPage() {
  // Hooks
  const { changeLanguage, language } = useLanguage()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('termsAndConditionsPage.' + key)

  return (
    <SafeAreaView className="flex-1 bg-secondary">
      <View className="flex-1 gap-21 px-21/2 py-21/2 md:px-21">
        {/* Header */}
        <View className="rounded-xl bg-white px-21/2 py-21/2 md:px-21">
          <View className="flex-row items-center justify-between">
            <Text className="flex items-end pl-1 text-center text-3xl font-bold tracking-wider">
              DEEWAS
              <Text className="text-[40px] font-bold text-green-500">.</Text>
            </Text>

            <Select
              value={language}
              onValueChange={option => {
                if (!option) return
                changeLanguage(option.value)
              }}
            >
              <SelectTrigger
                className="bg-secondary"
                style={{ height: 36 }}
              >
                <Text className="text-primary">{language.label}</Text>
              </SelectTrigger>

              <SelectContent className="border-transparent bg-secondary shadow-none">
                {languages.map((item, index) => (
                  <SelectItem
                    key={index}
                    value={item.value}
                    label={item.label}
                  />
                ))}
              </SelectContent>
            </Select>
          </View>

          <View className="mt-2 flex-row items-center justify-center gap-4">
            <TouchableOpacity onPress={() => router.replace('/policies/privacy-policy')}>
              <Text>{t('Privacy Policy')}</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="underline">{t('Terms And Conditions')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView>
          {/* Content */}
          <View className="rounded-xl bg-white p-4 shadow-xl">
            <View>
              <Text className="text-center text-3xl font-bold">{t('Terms And Conditions')}</Text>
              <Text className="text-center text-sm text-muted-foreground">
                {t('Effective as of April 12, 2025')}
              </Text>
            </View>
            <View className="space-y-8">
              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Introduction')}</Text>
                <Text>
                  {t('These terms and conditions apply to the Deewas app')} ({t('hereby referred to as')}{' '}
                  "{t('Application')}") {t('for mobile devices that was created by Anh Khoa Nguyen')} (
                  {t('hereby referred to as')} "{t('Service Provider')}") {t('as a Free service')}.
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Usage Agreement')}</Text>
                <Text>
                  {t(
                    'Upon downloading or utilizing the Application, you are automatically agreeing to the following terms'
                  )}
                  .{' '}
                  {t(
                    'It is strongly advised that you thoroughly read and understand these terms prior to using the Application'
                  )}
                  .{' '}
                  {t(
                    'Unauthorized copying, modification of the Application, any part of the Application, or our trademarks is strictly prohibited'
                  )}
                  .{' '}
                  {t(
                    'Any attempts to extract the source code of the Application, translate the Application into other languages, or create derivative versions are not permitted'
                  )}
                  .{' '}
                  {t(
                    'All trademarks, copyrights, database rights, and other intellectual property rights related to the Application remain the property of the Service Provider'
                  )}
                  .
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Modifications and Charges')}</Text>
                <Text>
                  {t(
                    'The Service Provider is dedicated to ensuring that the Application is as beneficial and efficient as possible'
                  )}
                  .{' '}
                  {t(
                    'As such, they reserve the right to modify the Application or charge for their services at any time and for any reason'
                  )}
                  .{' '}
                  {t(
                    'The Service Provider assures you that any charges for the Application or its services will be clearly communicated to you'
                  )}
                  .
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Data and Device Security')}</Text>
                <Text>
                  {t(
                    'The Application stores and processes personal data that you have provided to the Service Provider in order to provide the Service'
                  )}
                  .{' '}
                  {t(
                    'It is your responsibility to maintain the security of your phone and access to the Application'
                  )}
                  .{' '}
                  {t(
                    'The Service Provider strongly advise against jailbreaking or rooting your phone, which involves removing software restrictions and limitations imposed by the official operating system of your device'
                  )}
                  .{' '}
                  {t(
                    'Such actions could expose your phone to malware, viruses, malicious programs, compromise your phone’s security features, and may result in the Application not functioning correctly or at all'
                  )}
                  .
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Third Party Services')}</Text>
                <Text>
                  {t(
                    'Please note that the Application utilizes third-party services that have their own Terms and Conditions'
                  )}
                  .{' '}
                  {t(
                    'Below are the links to the Terms and Conditions of the third-party service providers used by the Application'
                  )}
                  :
                </Text>
                <View className="mt-2 pl-6">
                  {[
                    {
                      name: 'Google Play Services',
                      url: 'https://policies.google.com/terms',
                    },
                    { name: 'Facebook', url: 'https://www.facebook.com/legal/terms' },
                    {
                      name: 'Apple',
                      url: 'https://www.apple.com/legal/internet-services/terms/site.html',
                    },
                  ].map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => Linking.openURL(item.url)}
                      className="flex-row"
                    >
                      <Text className="text-blue-600">
                        {' \u2022 '} {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">
                  {t('Service Provider Responsibility')}
                </Text>
                <Text>
                  {t(
                    'Please be aware that the Service Provider does not assume responsibility for certain aspects'
                  )}
                  .{' '}
                  {t(
                    'Some functions of the Application require an active internet connection, which can be Wi-Fi or provided by your mobile network provider'
                  )}
                  .{' '}
                  {t(
                    'The Service Provider cannot be held responsible if the Application does not function at full capacity due to lack of access to Wi-Fi or if you have exhausted your data allowance'
                  )}
                  .
                </Text>
                <Text className="mt-4">
                  {t(
                    'In terms of the Service Provider’s responsibility for your use of the application, it is important to note that while they strive to ensure that it is updated and accurate at all times, they do rely on third parties to provide information to them so that they can make it available to you'
                  )}
                  .{' '}
                  {t(
                    'The Service Provider accepts no liability for any loss, direct or indirect, that you experience as a result of relying entirely on this functionality of the application'
                  )}
                  .
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Internet and Data Charges')}</Text>
                <Text>
                  {t(
                    'If you are using the application outside of a Wi-Fi area, please be aware that your mobile network provider’s agreement terms still apply'
                  )}
                  .{' '}
                  {t(
                    'Consequently, you may incur charges from your mobile provider for data usage during the connection to the application, or other third-party charges'
                  )}
                  .{' '}
                  {t(
                    'By using the application, you accept responsibility for any such charges, including roaming data charges if you use the application outside of your home territory (i.e., region or country) without disabling data roaming'
                  )}
                  .{' '}
                  {t(
                    'If you are not the bill payer for the device on which you are using the application, they assume that you have obtained permission from the bill payer'
                  )}
                  .
                </Text>
                <Text className="mt-4">
                  {t(
                    'Similarly, the Service Provider cannot always assume responsibility for your usage of the application'
                  )}
                  .{' '}
                  {t(
                    'For instance, it is your responsibility to ensure that your device remains charged'
                  )}
                  .{' '}
                  {t(
                    'If your device runs out of battery and you are unable to access the Service, the Service Provider cannot be held responsible'
                  )}
                  .
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">
                  {t('Application Updates and Termination')}
                </Text>
                <Text>
                  {t('The Service Provider may wish to update the application at some point')}.{' '}
                  {t(
                    'The application is currently available as per the requirements for the operating system (and for any additional systems they decide to extend the availability of the application to) may change, and you will need to download the updates if you want to continue using the application'
                  )}
                  .{' '}
                  {t(
                    'The Service Provider does not guarantee that it will always update the application so that it is relevant to you and/or compatible with the particular operating system version installed on your device'
                  )}
                  .{' '}
                  {t(
                    'However, you agree to always accept updates to the application when offered to you'
                  )}
                  .
                </Text>
                <Text className="mt-4">
                  {t(
                    'The Service Provider may also wish to cease providing the application and may terminate its use at any time without providing termination notice to you'
                  )}
                  .{' '}
                  {t(
                    'Unless they inform you otherwise, upon any termination, (a) the rights and licenses granted to you in these terms will end; (b) you must cease using the application, and (if necessary) delete it from your device'
                  )}
                  .
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Changes to These Terms')}</Text>
                <Text>
                  {t('The Service Provider may periodically update their Terms and Conditions')}.{' '}
                  {t('Therefore, you are advised to review this page regularly for any changes')}.{' '}
                  {t(
                    'The Service Provider will notify you of any changes by posting the new Terms and Conditions on this page'
                  )}
                  .
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Contact Us')}</Text>
                <Text>
                  {t(
                    'If you have any questions or suggestions about the Terms and Conditions, please do not hesitate to contact the Service Provider via email at'
                  )}{' '}
                  <Text
                    className="text-blue-600"
                    onPress={() => Linking.openURL('mailto:deewas.now@gmail.com')}
                  >
                    deewas.now@gmail.com
                  </Text>
                  .
                </Text>
              </View>
            </View>
            <Separator className="my-2.5 h-0" />
          </View>

          {/* Footer */}
          <View className="px-4 py-6 text-center sm:px-6 lg:px-8">
            <Text className="text-center text-primary">
              © {new Date().getFullYear()} Deewas. {t('All rights reserved')} | {t('Contact us at')}{' '}
              <Link
                href="mailto:deewas.now@gmail.com"
                className="text-sky-600 hover:underline"
              >
                deewas.now@gmail.com
              </Link>
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
