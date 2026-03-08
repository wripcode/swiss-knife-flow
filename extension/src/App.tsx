import { useEffect, useState } from 'react'

const DATA_CLIENT_URL = (import.meta as any).env?.VITE_DATA_CLIENT_URL || 'http://localhost:3000'

function App() {
  const [iframeSrc, setIframeSrc] = useState(DATA_CLIENT_URL)

  useEffect(() => {
    if (typeof window === 'undefined' || !('webflow' in window)) return

    const wf = (window as Record<string, any>).webflow
    wf.setExtensionSize('large')

    // Get the current site info from the Designer Extension API
    wf.getSiteInfo().then((siteInfo: Record<string, any>) => {
      const siteId = siteInfo?.siteId
      if (siteId) {
        const url = new URL(DATA_CLIENT_URL)
        url.searchParams.set('siteId', siteId)
        setIframeSrc(url.toString())
      }
    }).catch(() => {
      // Not in Webflow context or API unavailable — use plain URL
    })
  }, [])

  return (
    <iframe
      src={iframeSrc}
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
      title="Swiss Knife Flow"
    />
  )
}

export default App
