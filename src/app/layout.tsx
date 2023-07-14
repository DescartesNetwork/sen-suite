import { ReactNode } from 'react'
import type { Metadata } from 'next'

import UiProvider from '@/providers/ui.provider'

import Message from '@/components/message/page'
import Sidebar from '@/app/sidebar'

import '@/styles/global.scss'
import WalletProvider from '@/providers/wallet.provider'

export const metadata: Metadata = {
  title: 'Sentre',
  description: 'The suite for startups on Solana',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
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
          <WalletProvider>
            <main className="flex w-full">
              <Sidebar />
              <div className="flex flex-col flex-auto pr-2 py-2">
                {children}
              </div>
            </main>
            <Message />
          </WalletProvider>
        </UiProvider>
      </body>
    </html>
  )
}
