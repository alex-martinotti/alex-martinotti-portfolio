import { useEffect } from 'react'

const SITE = 'Alex Martinotti'
const DEFAULT_DESCRIPTION =
  'Alex Martinotti — Luxembourg-based filmmaker and photographer. Brand films, campaigns, hospitality and event content.'

const setMeta = (selector: string, attr: string, value: string) => {
  document.querySelector(selector)?.setAttribute(attr, value)
}

/**
 * Per-route title and description. The site is a client-rendered SPA, so the
 * tab title, search snippets and share previews would otherwise read the same
 * on every page.
 */
export function usePageMeta(title?: string, description = DEFAULT_DESCRIPTION) {
  useEffect(() => {
    const full = title ? `${title} — ${SITE}` : `${SITE} — Film · Photo · Creative`
    document.title = full
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', full)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('link[rel="canonical"]', 'href', `https://www.alexmartinotti.com${window.location.pathname}`)
  }, [title, description])
}
