import React, {useEffect, useState} from 'react'
import * as RNLocalize from 'react-native-localize'

import en from '../translations/strings_en.json'
import hi from '../translations/strings_hi_IN.json'
import mr from '../translations/strings_mr_IN.json'
import pa from '../translations/strings_pa_IN.json'

const useLocaleMessages = () => {
  const languages: {
    [key: string]: any
  } = {en, hi, mr, pa}

  const availableTranslations = ['en', 'hi', 'mr', 'pa']
  const [locale, setLocale] = useState(
    RNLocalize.findBestAvailableLanguage(availableTranslations)?.languageTag ||
      'en',
  )
  const [messages, setMessages] = useState(languages[locale])

  return {locale, messages}
}

export default useLocaleMessages
