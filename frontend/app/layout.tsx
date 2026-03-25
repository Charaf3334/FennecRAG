import type { Metadata } from "next"
import { Space_Grotesk, Pacifico, Geist } from "next/font/google"
import "./globals.css"
import { Toaster } from 'sonner'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", geist.variable)}>
        <body className={`${spaceGrotesk.variable} ${pacifico.variable} antialiased`}>
            {children}
            <Toaster 
                theme="light" position="top-right" richColors duration={3000} expand visibleToasts={3}
                style={{
                    fontFamily: 'var(--font-space)'
                }}/>
        </body>
    </html>
    )
}