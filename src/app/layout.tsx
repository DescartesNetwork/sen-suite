import { ReactNode } from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'

import UiProvider from '@/providers/ui.provider'
import WalletProvider from '@/providers/wallet.provider'
import MintProvider from '@/providers/mint.provider'
import TokenAccountProvider from '@/providers/tokenAccount.provider'

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
  icons: {
    icon: '/web.svg',
    apple: '/ios.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" className={DMSans.className}>
      <head>
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-YZGWFX3N5E"
        />
        <Script id="google-analytics">
          {`window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-YZGWFX3N5E');`}
        </Script>
      </head>
      <body className="w-full flex flex-row">
        <UiProvider>
          <WalletProvider>
            <MintProvider>
              <TokenAccountProvider>
                <Sidebar>
                  {children}
                  <Message />
                </Sidebar>
              </TokenAccountProvider>
            </MintProvider>
          </WalletProvider>
        </UiProvider>
      </body>
    </html>
  )
}
