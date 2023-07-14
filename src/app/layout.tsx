import { ReactNode } from 'react'
import type { Metadata } from 'next'

import UiProvider from '@/providers/ui.provider'
import WalletProvider from '@/providers/wallet.provider'
import TokenProvider from '@/providers/token.provider'

import Message from '@/components/message/page'
import Sidebar from '@/app/sidebar'

import '@/styles/global.scss'

export const metadata: Metadata = {
  title: 'Sentre',
  description: 'The suite for startups on Solana',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <UiProvider>
          <TokenProvider>
            <WalletProvider>
              <main className="flex w-full">
                <Sidebar />
                <div className="flex flex-col flex-auto pr-2 py-2">
                  {children}
                </div>
              </main>
              <Message />
            </WalletProvider>
          </TokenProvider>
        </UiProvider>
      </body>
    </html>
  )
}
