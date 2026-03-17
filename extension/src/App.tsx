import { useEffect, useRef, useState } from 'react'
import { registerHandler, createMessageRouter } from './message-router'
import {
  fullScan,
  patchElement,
  resolveElement,
  getCachedGroups,
  getCacheSize,
  clearCache
} from './element-cache'

const DATA_CLIENT_URL = (import.meta as any).env?.VITE_DATA_CLIENT_URL || 'http://localhost:3000'

function App() {
  const [iframeSrc, setIframeSrc] = useState(DATA_CLIENT_URL)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('webflow' in window)) return

    const wf = (window as Record<string, any>).webflow
    wf.setExtensionSize('large')

    wf.getSiteInfo().then((siteInfo: Record<string, any>) => {
      const siteId = siteInfo?.siteId
      if (siteId) {
        const url = new URL(DATA_CLIENT_URL)
        url.searchParams.set('siteId', siteId)
        setIframeSrc(url.toString())
      }
    }).catch(() => {})

    const sendToIframe = (selectedId: string | null, groups: ReturnType<typeof getCachedGroups>) => {
      const target = iframeRef.current?.contentWindow
      if (!target) return
      target.postMessage({
        type: 'ATTRIBUTES_UPDATED',
        payload: { elementId: selectedId, elementGroups: groups },
      }, '*')
    }

    registerHandler('GET_ATTRIBUTES', async (_payload, { selected }) => {
      const selectedId = selected?.id?.element || null
      const groups = await fullScan(wf)
      sendToIframe(selectedId, groups)
    })

    registerHandler('SET_ATTRIBUTE', async (payload, { wf: w, selected }) => {
      const selectedId = selected?.id?.element || null
      const targetId = payload?.elementId || selectedId
      const el = await resolveElement(w, targetId) || selected
      if (!el?.customAttributes) return

      await el.setCustomAttribute(payload.name, payload.value)
      await patchElement(w, targetId || selectedId)
      sendToIframe(selectedId, getCachedGroups())
    })

    registerHandler('REMOVE_ATTRIBUTE', async (payload, { wf: w, selected }) => {
      const selectedId = selected?.id?.element || null
      const targetId = payload?.elementId || selectedId
      const el = await resolveElement(w, targetId) || selected
      if (!el?.customAttributes) return

      await el.removeCustomAttribute(payload.name)
      await patchElement(w, targetId || selectedId)
      sendToIframe(selectedId, getCachedGroups())
    })

    registerHandler('SELECT_ELEMENT', async (payload, { wf: w }) => {
      const el = await resolveElement(w, payload?.elementId)
      if (el) await w.setSelectedElement(el)
    })

    let selectionTimer: ReturnType<typeof setTimeout> | null = null

    const handleSelectionChange = (element: any) => {
      if (selectionTimer) clearTimeout(selectionTimer)
      selectionTimer = setTimeout(async () => {
        try {
          const id = element?.id?.element || null
          if (getCacheSize() === 0) {
            const groups = await fullScan(wf)
            sendToIframe(id, groups)
          } else {
            sendToIframe(id, getCachedGroups())
          }
        } catch (err) {
          console.error('Selection error:', err)
        }
      }, 150)
    }

    const unsubscribe = wf.subscribe(
      'selectedelement',
      (element: any) => handleSelectionChange(element)
    )

    const messageRouter = createMessageRouter(wf)
    window.addEventListener('message', messageRouter)

    return () => {
      if (unsubscribe) unsubscribe()
      if (selectionTimer) clearTimeout(selectionTimer)
      window.removeEventListener('message', messageRouter)
      clearCache()
    }
  }, [])

  return (
    <iframe
      ref={iframeRef}
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
