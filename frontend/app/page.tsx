'use client'

import Link from "next/link"
import { BiLogoGithub, BiSend, BiUpload, BiX, BiPencil, BiLoaderCircle } from "react-icons/bi"
import { AnimatedBeamSection } from "@/components/AnimatedBeamSection"
import { useState, useEffect, useRef } from 'react'
import Tooltip from "@/components/Tooltip"
import { toast } from 'sonner'
import { NumberTicker } from "@/components/NumberTicker"
import ReactMarkdown from 'react-markdown'

const miniTitles = ["Ask anything about your documents", "Get instant answers", "Explore your data", "Summarize your PDFs", "Easy retrieve the information"]
const allowedExtensions = ['pdf', 'docx', 'md', 'txt', 'csv']

interface UploadedFile 
{
    id: number
    file: File
}

interface Message 
{
    id: number
    text: string
    sender: 'user' | 'fennec'
    timestamp: Date
    files?: UploadedFile[]
}

const AnimatedMessage = ({text} : {text: string}) => {
    const [displayed, setDisplayed] = useState<string>('')
    useEffect(() => {
        setDisplayed('')
        let i = 0
        const interval = setInterval(() => {
            if (i < text.length)
            {
                setDisplayed(text.slice(0, i + 1))
                i++
            }
            else
                clearInterval(interval)
        }, 15)
        return () => clearInterval(interval)
    }, [text])
    return <ReactMarkdown>{displayed}</ReactMarkdown>
}

const page = () => {
    const [textIndex, setTextIndex] = useState<number>(0)
    const [hoverGithub, setHoverGithub] = useState<boolean>(false)
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState<string>('')
    const [messageId, setMessageId] = useState<number>(1)
    const fileIdRef = useRef<number>(1)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputContainerRef = useRef<HTMLDivElement>(null)
    const [starCount, setStarCount] = useState<number>(0)
    const [firstLoad, setFirstLoad] = useState<boolean>(true)
    const [loadingFennecMessage, setLoadingFennecMessage] = useState<boolean>(false)
    const [inConversation, setInConversation] = useState<boolean>(false)
    const [loadingUpload, setIsLoadingUpload] = useState<boolean>(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setTextIndex((prev) => (prev + 1) % miniTitles.length)
        }, 2000)
        getStarCountFromRepo()
        deleteHistory()
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'})
    }, [messages])

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const findExtension = (filename: string) => {
        const pos = filename.lastIndexOf('.')
        if (pos === -1 || pos === 0)
            return ''
        return filename.slice(pos + 1)
    }

    const deleteHistory = async () => {
        try
        {
            await fetch('http://backend:8000/history', {method: 'DELETE'})
        }
        catch (error)
        {
            toast.error("Error: an error happened while trying to call the server.")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) 
        {
            const newFiles: UploadedFile[] = []
            for (let i = 0; i < files.length; i++)
            {
                const extension = findExtension(files[i].name)
                if (!allowedExtensions.includes(extension))
                {
                    toast.error(`Error: ${files[i].name} is not a supported type of file.`)
                    continue
                }
                newFiles.push({file: files[i], id: fileIdRef.current})
                fileIdRef.current++
            }
            setUploadedFiles(prev => [...prev, ...newFiles])
            e.target.value = ''
        }
    }

    const removeFile = (id: number) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== id))
    }

    const handleSendMessage = async () => {
        if (!inConversation)
        {
            if (inputValue.trim() === '')
            {
                toast.error('Error: No message is being provided')
                return
            }
            if (uploadedFiles.length === 0)
            {
                toast.error("Error: You need to provide atleast one file in order to let Fennec process it.")
                return
            }
        }
        else
        {
            if (inputValue.trim() === '')
            {
                toast.error('Error: No message is being provided')
                return
            }
        }
        if (!inConversation)
        {
            setIsLoadingUpload(true)
            const multiformData = new FormData()
            uploadedFiles.forEach(({file}) => {
                multiformData.append('files', file)
            })
            try
            {
                const response = await fetch('http://backend:8000/upload', {
                    method: 'POST',
                    body: multiformData
                })
                if (!response.ok)
                {
                    toast.error("Error: an error happened while trying to call the server.")
                    await handleNewChat()
                    return
                }
                setIsLoadingUpload(false)
            }
            catch (error)
            {
                toast.error("Error: an error happened while trying to call the server.")
                await handleNewChat()
                return
            }
        }
        const userMessage: Message = {
            id: messageId,
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
            files: !inConversation ? uploadedFiles : []
        }
        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setUploadedFiles([])
        setMessageId(prev => prev + 1)
        setLoadingFennecMessage(true)
        setInConversation(true)
        try
        {
            const response = await fetch('http://backend:8000/askFennec', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({text: inputValue})
            })
            const data = await response.json()
            const fennecMessage: Message = {
                id: messageId + 1,
                text: data.response,
                sender: 'fennec',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, fennecMessage])
            setMessageId(prev => prev + 2)
            setLoadingFennecMessage(false)
        }
        catch (error)
        {
            toast.error("Error: an error happened while trying to call the server.")
            handleNewChat()
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !loadingFennecMessage && !loadingUpload)
        {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) 
            return '0 Bytes'
        const kb = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(kb))
        return Math.round((bytes / Math.pow(kb, i)) * 100) / 100 + ' ' + sizes[i]
    }

    const handleNewChat = async () => {
        setMessages([])
        setUploadedFiles([])
        setInConversation(false)
        await deleteHistory()
    }

    const getStarCountFromRepo = async () => {
        try
        {
            const response = await fetch('https://api.github.com/repos/Charaf3334/FennecRAG')
            const data = await response.json()
            setStarCount(data['stargazers_count'])
        }
        catch (error)
        {
            setStarCount(0)
        }
	    setFirstLoad(false)
    }

    return (
        <div className="flex flex-col min-h-screen font-space">
            {firstLoad ? (
                <div className="flex items-center justify-center min-h-screen">
                    <BiLoaderCircle size={40} className="animate-spin"/>
                </div>
            ) : (
                <>
                    <nav className='flex items-center justify-around p-2 md:p-3 gap-2 md:gap-0'>
                        <Link href={'/'} className="flex items-center gap-1 md:gap-2 min-w-0">
                            <img src="/favicon.png" alt="" className='w-8 h-8 md:w-12 md:h-12'/>
                            <div className='border-l border-gray-400 h-4 md:h-6'></div>
                            <span className='font-bold text-sm md:text-base truncate'>FennecRAG</span>
                        </Link>
                        <div onMouseEnter={() => setHoverGithub(true)} onMouseLeave={() => setHoverGithub(false)}>
                            <Link href={'https://github.com/Charaf3334/FennecRAG'} target="_blank" className="flex items-center justify-center gap-1 md:gap-2 p-1 md:p-2 rounded-2xl border border-gray-200 shadow-2xs">
                                <BiLogoGithub size={18} className='md:w-6 md:h-6'/>
                                <div className={`${!hoverGithub ? 'bg-gray-200' : 'bg-black text-white'} rounded-2xl px-1 md:px-2 font-bold transition-colors duration-200 ease-in-out text-xs md:text-sm`}>
                                    <NumberTicker value={starCount} delay={0.2}/>
                                </div>
                            </Link>
                        </div>
                    </nav>
                    <main className="grow flex flex-col items-center justify-center gap-3 md:gap-5 px-3 md:px-0">
                        {messages.length === 0 && (
                            <>
                                <img src="/smilingFennec.png" alt="Smiling Fennec" className="w-20 h-20 md:w-30 md:h-30"/>
                                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-2 text-center md:text-left">
                                    <h1 className="text-5xl md:text-8xl font-bold">FennecRAG</h1>
                                    <span className="text-lg md:text-xl text-gray-500 inline-block h-6 md:h-8 overflow-hidden relative">
                                        <span className="inline-block transition-all duration-700 ease-in-out"
                                            style={{
                                                transform: `translateY(calc(-${textIndex} * 2rem))`,
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}>
                                            {miniTitles.map((text, i) => (
                                                <div key={i} className="h-6 md:h-8 flex items-center whitespace-nowrap text-xs md:text-xl">
                                                    {text}
                                                </div>
                                            ))}
                                        </span>
                                    </span>
                                </div>
                            </>
                        )}
                        <div className={`w-full max-w-2xl ${messages.length > 0 ? 'h-180' : 'h-auto'} bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl shadow-md flex flex-col transition-all duration-300`}>
                            {messages.length > 0 && (
                                <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
                                    {messages.map((message) => (
                                        <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`flex flex-col gap-2 max-w-xs md:max-w-xl`}>
                                                <div className={`px-3 md:px-4 py-2 rounded-lg wrap-break-word text-sm ${message.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-900 rounded-bl-none'}`}>
                                                    {message.sender === 'fennec' ? <AnimatedMessage text={message.text}/> : <ReactMarkdown>{message.text}</ReactMarkdown>} 
                                                    <span className={`text-xs mt-1 block ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                                        {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                                    </span>
                                                </div>
                                                {message.files && message.files.length > 0 && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {message.files.map(({file, id}) => (
                                                            <div key={id} className="bg-gray-100 border-2 border-gray-200 rounded-lg p-2 flex items-center gap-2 text-xs md:text-sm">
                                                                <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-md bg-gray-200 shrink-0">
                                                                    <span className="text-xs font-bold text-gray-700">
                                                                        {findExtension(file.name).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-semibold text-gray-800 truncate max-w-xs md:max-w-sm">
                                                                        {file.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {formatFileSize(file.size)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {loadingFennecMessage && (
                                        <div className="flex justify-start">
                                            <div className="flex flex-col gap-2 max-w-xs md:max-w-xl">
                                                <div className="px-3 md:px-4 py-2 rounded-lg wrap-break-word text-sm bg-gray-200 text-gray-900 rounded-bl-none flex items-center gap-2">
                                                    <BiLoaderCircle className="animate-spin text-gray-500" size={18}/>
                                                    <span className="text-xs md:text-sm text-gray-600 italic">Fennec is thinking...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef}/>
                                </div>
                            )}
                            <div ref={inputContainerRef} className={`${messages.length > 0 ? 'border-t border-gray-200' : ''} p-2 md:p-3`}>
                                {uploadedFiles.length > 0 && (
                                    <div className="mb-2 md:mb-3 flex flex-wrap gap-2">
                                        {uploadedFiles.map(({file, id}) => (
                                            <div key={id} className="relative bg-gray-100 border-2 border-gray-200 rounded-lg p-2 flex items-center gap-2 group hover:border-gray-300 transition-colors text-xs md:text-sm">
                                                <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-md bg-gray-200 shrink-0">
                                                    <span className="text-xs font-bold text-gray-700">
                                                        {findExtension(file.name).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-gray-800 truncate max-w-xs md:max-w-sm">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                                <button onClick={() => removeFile(id)} className="ml-2 cursor-pointer shrink-0 w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100">
                                                    <BiX size={14} className="text-red-500 md:w-4 md:h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="relative">
                                    <input type="text" placeholder="Ask Fennec..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} className={`w-full border-2 border-gray-200 shadow-2xs ${!inConversation ? 'pl-10 md:pl-13' : 'pl-3 md:pl-4'} pr-10 md:pr-13 py-2 rounded-2xl outline-none focus:border-gray-400 transition-all duration-300 ease-in-out text-sm md:text-base`}/>
                                    <Tooltip content="Send" side="top">
                                        <button disabled={loadingFennecMessage || loadingUpload} onClick={handleSendMessage} className={`w-6 h-6 md:w-8 md:h-8 ${loadingFennecMessage || loadingUpload ? 'cursor-not-allowed' : 'cursor-pointer'} hover:bg-gray-400/80 bg-gray-400 flex items-center justify-center rounded-full absolute right-2 md:right-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ease-in-out`}>
                                            {loadingFennecMessage || loadingUpload ? <BiLoaderCircle size={18} className="animate-spin text-gray-500"/> : <BiSend size={18} className="text-white md:w-6 md:h-6"/>}
                                        </button>
                                    </Tooltip>
                                    {!inConversation && (
                                        <Tooltip content="Upload a file" side="top">
                                            <button disabled={loadingFennecMessage || loadingUpload} onClick={handleUploadClick} className={`w-6 h-6 md:w-8 md:h-8 ${loadingFennecMessage || loadingUpload ? 'cursor-not-allowed' : 'cursor-pointer'} hover:bg-gray-400/80 bg-gray-400 flex items-center justify-center rounded-full absolute left-2 md:left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ease-in-out`}>
                                                <BiUpload size={18} className="text-white md:w-6 md:h-6"/>
                                            </button>
                                        </Tooltip>
                                    )}
                                </div>
                                {messages.length > 0 && (
                                    <div className="flex items-center justify-center mt-2 md:mt-2">
                                        <div onClick={handleNewChat} className="flex items-center bg-gray-400 hover:bg-gray-400/80 px-2 md:px-3 py-1 md:py-2 rounded-lg cursor-pointer gap-1 text-white transition-colors text-xs md:text-sm">
                                            <BiPencil size={16} className='md:w-6 md:h-6'/>
                                            <p>New chat</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.txt,.docx,.csv,.md" multiple/>
                        {messages.length === 0 && <AnimatedBeamSection/>}
                    </main>
                    <footer className="flex flex-col md:flex-row items-center justify-around p-2 md:p-3 mt-4 md:mt-7 gap-2 text-xs md:text-sm">
                        <span className="text-gray-500 text-center" style={{fontFamily: 'var(--font-pacifico)'}}>Built with a lot of love.</span>
                        <span className="text-gray-500 text-center">© {new Date().getFullYear()} FennecRAG. All Rights Reserved.</span>
                    </footer>
                </>
            )}
        </div>
    )
}

export default page
