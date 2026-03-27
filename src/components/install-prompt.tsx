'use client'

import { useEffect, useState } from 'react'
import { Download, X, Share } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOS, setShowIOS] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed or previously dismissed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      localStorage.getItem('pwa-dismissed')
    ) return

    // Android / Chrome — catch install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS detection
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const isInStandalone = ('standalone' in navigator) && (navigator as unknown as { standalone: boolean }).standalone
    if (isIOS && !isInStandalone) setShowIOS(true)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem('pwa-dismissed', '1')
    setDeferredPrompt(null)
    setShowIOS(false)
    setDismissed(true)
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') dismiss()
    setDeferredPrompt(null)
  }

  if (dismissed || (!deferredPrompt && !showIOS)) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-2xl border border-zinc-200 bg-white shadow-xl p-4 flex items-start gap-3">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-zinc-900 flex items-center justify-center">
        <span className="text-white text-xs font-bold">AC</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-zinc-900">Install AcadComm</p>
        {showIOS ? (
          <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
            Tap <Share size={11} className="inline mb-0.5" /> Share then <strong>Add to Home Screen</strong> to install.
          </p>
        ) : (
          <p className="text-xs text-zinc-500 mt-0.5">Add to your home screen for quick access.</p>
        )}
        {deferredPrompt && (
          <button
            onClick={install}
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white"
          >
            <Download size={12} /> Install App
          </button>
        )}
      </div>
      <button onClick={dismiss} className="shrink-0 rounded-md p-1 text-zinc-400 hover:bg-zinc-100">
        <X size={16} />
      </button>
    </div>
  )
}
