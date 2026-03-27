import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "AcadComm Portal — IPM IIM Indore",
  description: "Academic Committee Portal for IPM programme, IIM Indore",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="h-full bg-white text-zinc-900 antialiased">{children}</body>
    </html>
  )
}
