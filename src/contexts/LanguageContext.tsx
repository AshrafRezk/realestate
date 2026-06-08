/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type LanguageContextValue = {
  t: (key: string, options?: Record<string, unknown>) => string
  lang: string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation()

  const value = useMemo<LanguageContextValue>(() => {
    const lang = i18n.resolvedLanguage || i18n.language
    return { t: t as LanguageContextValue['t'], lang }
  }, [t, i18n.resolvedLanguage, i18n.language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}

