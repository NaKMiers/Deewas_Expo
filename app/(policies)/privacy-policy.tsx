import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { languages } from '@/constants/settings'
import useLanguage from '@/hooks/useLanguage'
import { Separator } from '@rn-primitives/select'
import { Link, router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function PrivacyPolicyPage() {
  // hooks
  const { changeLanguage, language } = useLanguage()
  const { t: translate } = useTranslation()
  const t = (key: string) => translate('privacyPolicyPage.' + key)

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
                    value={item.value}
                    label={item.label}
                    key={index}
                  />
                ))}
              </SelectContent>
            </Select>
          </View>

          <View className="mt-2 flex-row items-center justify-center gap-4">
            <TouchableOpacity>
              <Text className="underline">{t('Privacy Policy')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.replace('/terms-and-conditions')}>
              <Text>{t('Terms And Conditions')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView>
          {/* Content */}
          <View className="rounded-xl bg-white p-4 shadow-xl">
            <View>
              <Text className="text-center text-3xl font-bold">{t('Privacy Policy')}</Text>
              <Text className="text-center text-sm text-muted-foreground">
                {t('Effective as of April 12, 2025')}
              </Text>
            </View>
            <View className="space-y-8">
              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Introduction')}</Text>
                <Text>
                  {t('This privacy policy applies to the Deewas app')}{' '}
                  {t('for mobile devices that was created by Anh Khoa Nguyen')} {t('as a Free service')}.
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">
                  {t('Information Collection and Use')}
                </Text>
                <Text>
                  {t('The Application collects information when you download and use it')}.{' '}
                  {t('This information may include')}:
                </Text>
                <View className="mt-2 pl-6">
                  {[
                    t('Your device’s Internet Protocol address (e.g., IP address)'),
                    t(
                      'The pages of the Application that you visit, the time and date of your visit, the time spent on those pages'
                    ),
                    t('The time spent on the Application'),
                    t('The operating system you use on your mobile device'),
                  ].map((item, index) => (
                    <Text
                      key={index}
                      className="flex-row"
                    >
                      {'\u2022'} {item}
                    </Text>
                  ))}
                </View>
                <Text className="mt-4">
                  {t(
                    'The Application does not gather precise information about the location of your mobile device'
                  )}
                  .
                </Text>
                <Text className="mt-4">
                  {t(
                    'The Service Provider may use the information you provided to contact you from time to time to provide you with important information, required notices, and marketing promotions'
                  )}
                  .
                </Text>
                <Text className="mt-4">
                  {t(
                    'For a better experience, while using the Application, the Service Provider may require you to provide us with certain personally identifiable information, including but not limited to email, name, birthday'
                  )}
                  .{' '}
                  {t(
                    'The information that the Service Provider requests will be retained by them and used as described in this privacy policy'
                  )}
                  .
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Third Party Access')}</Text>
                <Text>
                  {t(
                    'Only aggregated, anonymized data is periodically transmitted to external services to aid the Service Provider in improving the Application and their service'
                  )}
                  .{' '}
                  {t(
                    'The Service Provider may share your information with third parties in the ways that are described in this privacy statement'
                  )}
                  .
                </Text>
                <Text className="mt-4">
                  {t(
                    'Please note that the Application utilizes third-party services that have their own Privacy Policy about handling data'
                  )}
                  .{' '}
                  {t(
                    'Below are the links to the Privacy Policy of the third-party service providers used by the Application'
                  )}
                  :
                </Text>
                <View className="mt-2 pl-6">
                  {[
                    {
                      name: 'Google Play Services',
                      url: 'https://policies.google.com/privacy',
                    },
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
                <Text className="mt-4">
                  {t(
                    'The Service Provider may disclose User Provided and Automatically Collected Information'
                  )}
                  :
                </Text>
                <View className="mt-2 pl-6">
                  {[
                    t(
                      'As required by law, such as to comply with a subpoena, or similar legal process;'
                    ),
                    t(
                      'When they believe in good faith that disclosure is necessary to protect their rights, protect your safety or the safety of others, investigate fraud, or respond to a government request;'
                    ),
                    t(
                      'With their trusted services providers who work on their behalf, do not have an independent use of the information we disclose to them, and have agreed to adhere to the rules set forth in this privacy statement'
                    ) + '.',
                  ].map((item, index) => (
                    <Text
                      key={index}
                      className="flex-row"
                    >
                      {'\u2022'} {item}
                    </Text>
                  ))}
                </View>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Opt-Out Rights')}</Text>
                <Text>
                  {t(
                    'You can stop all collection of information by the Application easily by uninstalling it'
                  )}
                  .{' '}
                  {t(
                    'You may use the standard uninstall processes as may be available as part of your mobile device or via the mobile application marketplace or network'
                  )}
                  .
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Data Retention Policy')}</Text>
                <Text>
                  {t(
                    'The Service Provider will retain User Provided data for as long as you use the Application and for a reasonable time thereafter'
                  )}
                  .{' '}
                  {t(
                    'If you’d like them to delete User Provided Data that you have provided via the Application, please contact them at'
                  )}{' '}
                  <Text
                    className="text-blue-600"
                    onPress={() => Linking.openURL('mailto:deewas.now@gmail.com')}
                  >
                    deewas.now@gmail.com
                  </Text>{' '}
                  {t('and they will respond in a reasonable time')}.
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Children')}</Text>
                <Text>
                  {t(
                    'The Service Provider does not use the Application to knowingly solicit data from or market to children under the age of 13'
                  )}
                  .
                </Text>
                <Text className="mt-4">
                  {t('The Application does not address anyone under the age of 13')}.{' '}
                  {t(
                    'The Service Provider does not knowingly collect personally identifiable information from children under 13 years of age'
                  )}
                  .{' '}
                  {t(
                    'In the case the Service Provider discovers that a child under 13 has provided personal information, the Service Provider will immediately delete this from their servers'
                  )}
                  .{' '}
                  {t(
                    'If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact the Service Provider'
                  )}{' '}
                  (
                  <Text
                    className="text-blue-600"
                    onPress={() => Linking.openURL('mailto:deewas.now@gmail.com')}
                  >
                    deewas.now@gmail.com
                  </Text>
                  ) {t('so that they will be able to take the necessary actions')}.
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Security')}</Text>
                <Text>
                  {t(
                    'The Service Provider is concerned about safeguarding the confidentiality of your information'
                  )}
                  .{' '}
                  {t(
                    'The Service Provider provides physical, electronic, and procedural safeguards to protect information the Service Provider processes and maintains'
                  )}
                  .
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Changes')}</Text>
                <Text>
                  {t('This Privacy Policy may be updated from time to time for any reason')}.{' '}
                  {t(
                    'The Service Provider will notify you of any changes to the Privacy Policy by updating this page with the new Privacy Policy'
                  )}
                  .{' '}
                  {t(
                    'You are advised to consult this Privacy Policy regularly for any changes, as continued use is deemed approval of all changes'
                  )}
                  .
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Your Consent')}</Text>
                <Text>
                  {t(
                    'By using the Application, you are consenting to the processing of your information as set forth in this Privacy Policy now and as amended by us'
                  )}
                  .
                </Text>
              </View>

              <View>
                <Text className="mt-4 text-2xl font-semibold">{t('Contact Us')}</Text>
                <Text>
                  {t(
                    'If you have any questions regarding privacy while using the Application, or have questions about the practices, please contact the Service Provider via email at'
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
              © 2025 Deewas. All rights reserved. | Contact us at{' '}
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

export default PrivacyPolicyPage
