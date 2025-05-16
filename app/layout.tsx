import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Roboto, Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Smile Stop - Your Journey, Your Voice!",
  description: "Share your feedback about Dubai Metro and Tram services",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${inter.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
