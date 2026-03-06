const DATA_CLIENT_URL = (import.meta as any).env?.VITE_DATA_CLIENT_URL || 'http://localhost:3000'

function App() {
  if (typeof window !== "undefined" && "webflow" in window) {
    (window as Record<string, any>).webflow.setExtensionSize("large")
  }

  return (
    <iframe
      src={DATA_CLIENT_URL}
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
