import { ReactNode } from 'react'
import type { Metadata } from 'next'
import Script from 'next/script'

import UiProvider from '@/providers/ui.provider'
import WalletProvider from '@/providers/wallet.provider'
import MintProvider from '@/providers/mint.provider'
import TokenAccountProvider from '@/providers/tokenAccount.provider'

import Message from '@/components/message'
import Sidebar from '@/app/sidebar'

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
    <html lang="en" data-theme="light">
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
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,200;0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,200;1,9..40,300;1,9..40,400;1,9..40,500;1,9..40,600;1,9..40,700;1,9..40,800;1,9..40,900&display=swap"
          rel="stylesheet"
        />
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
