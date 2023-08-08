import { ReactNode } from 'react'
import type { Metadata } from 'next'

import UiProvider from '@/providers/ui.provider'
import WalletProvider from '@/providers/wallet.provider'
import MintProvider from '@/providers/mint.provider'
import TokenAccountProvider from '@/providers/tokenAccount.provider'

import Message from '@/components/message'
import Sidebar from '@/app/sidebar'

import { DMSans } from '@/fonts'
import '@/styles/global.scss'
import 'react-datepicker/dist/react-datepicker.css'

export const metadata: Metadata = {
  title: 'Sentre: The suite for startups on Solana',
  description:
    'The suite for startups on Solana. Formerly, The dApp Store for All Things Solana.',
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
      <body>
        <UiProvider>
          <WalletProvider>
            <MintProvider>
              <TokenAccountProvider>
                <main className="flex w-full">
                  <Sidebar />
                  <div className="flex flex-col flex-auto pr-2 py-2">
                    {children}
                  </div>
                </main>
                <Message />
              </TokenAccountProvider>
            </MintProvider>
          </WalletProvider>
        </UiProvider>
      </body>
    </html>
  )
}
