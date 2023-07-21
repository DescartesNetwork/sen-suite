import { ReactNode } from 'react'
import type { Metadata } from 'next'

import UiProvider from '@/providers/ui.provider'
import WalletProvider from '@/providers/wallet.provider'
import MintProvider from '@/providers/mint.provider'

import Message from '@/components/message'
import Sidebar from '@/app/sidebar'

import '@/styles/global.scss'

export const metadata: Metadata = {
  title: 'Sentre',
  description: 'The suite for startups on Solana',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  icons: {
    icon: '/web.svg',
    apple: '/ios.png',
  },
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
          <MintProvider>
            <WalletProvider>
              <main className="flex w-full">
                <Sidebar />
                <div className="flex flex-col flex-auto pr-2 py-2">
                  {children}
                </div>
              </main>
              <Message />
            </WalletProvider>
          </MintProvider>
        </UiProvider>
      </body>
    </html>
  )
}
