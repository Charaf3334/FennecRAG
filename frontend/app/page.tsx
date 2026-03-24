'use client'

import Link from "next/link"
import { BiLogoGithub, BiSend } from "react-icons/bi"
import { AnimatedBeamSection } from "@/components/AnimatedBeamSection"
import { useState, useEffect } from 'react'

const miniTitles = ["Ask anything about your documents", "Get instant answers", "Explore your data", "Summarize your PDFs", "Easy retrieve the information"]

const page = () => {
    const [textIndex, setTextIndex] = useState<number>(0)
    const [hoverGithub, setHoverGithub] = useState<boolean>(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % miniTitles.length)
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="flex flex-col min-h-screen font-space">
            <nav className='flex items-center justify-around p-3'>
                <Link href={'/'} className="flex items-center gap-2">
                    <img src="/favicon.png" alt="" className='w-12 h-12'/>
                    <div className='border-l border-gray-400 h-6'></div>
                    <span className='font-bold'>FennecRAG</span>
                </Link>
                <div className="flex items-center justify-center gap-3">
                    <span className="hover:bg-gray-200 cursor-pointer px-3 py-1 rounded-md transition-colors duration-200 ease-in-out">About</span>
                    <span className="hover:bg-gray-200 cursor-pointer px-3 py-1 rounded-md transition-colors duration-200 ease-in-out">How to use</span>
                </div>
                <div onMouseEnter={() => setHoverGithub(true)} onMouseLeave={() => setHoverGithub(false)}>
                    <Link href={'https://www.github.com/Charaf3334'} className="flex items-center justify-center gap-2 p-2 rounded-2xl border border-gray-200 shadow-2xs">
                        <BiLogoGithub size={22}/>
                        <div className={`${!hoverGithub ? 'bg-gray-200' : 'bg-black text-white'} rounded-2xl px-2 font-bold transition-colors duration-200 ease-in-out`}>
                            1200 {/* this will be the real time value of how many stars my repo has.. */}
                        </div>
                    </Link>
                </div>
            </nav>
            <main className="grow flex flex-col items-center justify-center">
                <img src="/smilingFennec.png" alt="Smiling Fennec" className="w-30 h-30"/>
                <div className="flex items-baseline gap-2 mb-5">
                    <h1 className="text-8xl font-bold">FennecRAG</h1>
                    <span className="text-xl text-gray-500 inline-block h-8 overflow-hidden relative">
                        <span
                            className="inline-block transition-all duration-700 ease-in-out"
                            style={{
                                transform: `translateY(calc(-${textIndex} * 2rem))`,
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                            {miniTitles.map((text, i) => (
                                <div key={i} className="h-8 flex items-center whitespace-nowrap">
                                    {text}
                                </div>
                            ))}
                        </span>
                    </span>
                </div>
                <div className="mt-5 w-full max-w-2xl text-xl relative">
                    <input type="text" placeholder="Ask Fennec..." className="w-full border-2 border-gray-200 shadow-2xs pl-4 pr-13 py-2 rounded-2xl outline-none focus:border-gray-400 transition-all duration-300 ease-in-out"/>
                    <div className="w-8 h-8 cursor-pointer hover:bg-gray-400/80 bg-gray-400 flex items-center justify-center rounded-full absolute right-3 top-2 transition-colors duration-200 ease-in-out">
                        <BiSend size={21} className="text-white"/>
                    </div>
                </div>
                <AnimatedBeamSection/>
            </main>
            <footer className="flex items-center justify-around p-3 mt-7">
                <span className="text-gray-500" style={{fontFamily: 'var(--font-pacifico)'}}>Built with a lot of love.</span>
                <span className="text-gray-500">© {new Date().getFullYear()} FennecRAG. All Rights Reserved.</span>
            </footer>
        </div>
    )
}

export default page