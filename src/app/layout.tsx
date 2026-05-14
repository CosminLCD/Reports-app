import type { Metadata } from 'next'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import './globals.css'

export const metadata: Metadata = {
  title: 'APASS Reports — Raportare Accesibilitate',
  description: 'Interfață AI pentru documentarea problemelor de accesibilitate web',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body suppressHydrationWarning>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <Link href="/report/new" className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <span className="font-semibold text-gray-800">APASS Reports</span>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Setări</span>
              </Link>
            </div>
          </header>

          <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
            {children}
          </main>

          <footer className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
            APASS Accessibility Reports
          </footer>
        </div>
      </body>
    </html>
  )
}
