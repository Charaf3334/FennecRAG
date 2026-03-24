import type { Metadata } from "next"
import { Space_Grotesk, Pacifico } from "next/font/google"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
	subsets: ["latin"],
	variable: "--font-space-grotesk",
    weight: ["400"],
})

const pacifico = Pacifico({
    subsets: ["latin"],
    variable: "--font-pacifico",
    weight: ["400"],
})

export const metadata: Metadata = {
	title: "FennecRAG",
	description: "Upload PDF's, Markdowns or any txt files and grep informations from them",
	icons: {
		icon: "/favicon.png"
  	}
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
	<html lang="en">
	  <body className={`${spaceGrotesk.variable} ${pacifico.variable} antialiased`}>
		{children}
	  </body>
	</html>
  )
}