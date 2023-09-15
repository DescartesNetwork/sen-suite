import { ReactNode } from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'

// Providers
import UiProvider from '@/providers/ui.provider'
import WalletProvider from '@/providers/wallet.provider'
import MintProvider from '@/providers/mint.provider'
import TokenAccountProvider from '@/providers/tokenAccount.provider'

// Watchers
import TokenAccountWatcher from '@/watchers/tokenAccount.watcher'

import Message from '@/components/message'
import Sidebar from '@/app/sidebar'

import { DMSans } from '@/static/fonts'
import '@/static/styles/global.scss'
import 'react-datepicker/dist/react-datepicker.css'

export const metadata: Metadata = {
  title: 'Sentre: The suite for startups on Solana',
  description:
    'The suite for startups on Solana. Formerly, The dApp Store for All Things Solana.',
  manifest: '/manifest.json',
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
    <html lang="en" data-theme="light" className={DMSans.className}>
      <head>
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-G57JYZBDBP"
        />
        <Script id="google-analytics">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-G57JYZBDBP');`}
        </Script>
      </head>
      <body className="w-full flex flex-row">
        <UiProvider>
          <WalletProvider>
            <MintProvider>
              <TokenAccountProvider>
                <Sidebar>{children}</Sidebar>
                <Message />
                <TokenAccountWatcher />
              </TokenAccountProvider>
            </MintProvider>
          </WalletProvider>
        </UiProvider>
      </body>
    </html>
  )
}
