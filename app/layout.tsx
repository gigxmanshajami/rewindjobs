// @ts-nocheck 
// "use client";
import './globals.css';
import Navbar from './components/Navbar/index';
import 'react-circular-progressbar/dist/styles.css';
import 'react-loading-skeleton/dist/skeleton.css'
import { Toaster } from "@/components/ui/toaster"
import NextTopLoader from 'nextjs-toploader';

import Footer from './components/Footer/Footer';
import CookieConsent from './CookieConsent';
export const metadata = {
  title: 'RewindJobs',
  description: 'Rewind Jobs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <body>
        <NextTopLoader
          height={3}
          speed={8}
          showSpinner={false}
        />
        <Navbar />
        <CookieConsent />
        {children}
        <Toaster />
        <Footer />
      </body>
    </html>
  )
}
