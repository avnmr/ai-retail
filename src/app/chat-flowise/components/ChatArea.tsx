import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SendIcon, MenuIcon, UserIcon, MicIcon } from 'lucide-react'
import { useState, useEffect } from 'react'

type ChatAreaProps = {
  messages: any[]
  input: string
  handleInputChange: (value: string) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messagesEndRef: React.RefObject<HTMLDivElement>
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  title?: string
  description?: string
}

export default function ChatArea({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messagesEndRef,
  sidebarOpen,
  setSidebarOpen,
  title = "Chat AI Flowise",
  description = "Start a conversation with the AI assistant.",
}: ChatAreaProps) {

  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    console.log('messages', messages)
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const startListening = () => {
    setIsListening(true)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('')
      handleInputChange(transcript)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()

    return () => {
      recognition.stop()
      setIsListening(false)
    }
  }

  const stopListening = () => {
    setIsListening(false)
  }

  return (
    <main className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
      <header className="border-b border-gray-200 p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        <Button onClick={() => setSidebarOpen(!sidebarOpen)} variant="ghost" className="text-gray-500 md:hidden">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </header>
      <div className="flex-grow flex flex-col overflow-hidden">
        <ScrollArea className="flex-grow h-full">
          <div className="max-w-2xl mx-auto py-4 px-4">
            {messages.length === 0 ? (
              <div className="text-center py-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
                {/* <p className="text-gray-600">{currentPromptDescription}</p> */}
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} className={`mb-6 ${m.role === 'user' ? 'flex justify-end' : ''}`}>
                  <div className={`flex items-start ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${m.role === 'user' ? 'bg-gray-200 ml-4' : 'mr-4'
                      }`} style={m.role === 'user' ? {} : { backgroundColor: 'rgb(0 0 0)', color: 'white' }}>
                      {m.role === 'user' ? <UserIcon className="w-5 h-5 text-gray-600" /> : 'AI'}
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <div className="text-sm font-semibold mb-1"></div>
                      <div className="text-gray-800 break-words">{m.content}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>
      <footer className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto relative">
          <Input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Send a message"
            className="w-full bg-white border border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300 text-gray-800 pr-24 shadow-sm"
          />
          <Button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100"
          >
            <MicIcon className={`h-5 w-5 ${isListening ? 'text-red-500' : 'text-gray-500'}`} />
          </Button>
          <Button type="submit" disabled={isLoading} className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100">
            <SendIcon className="h-5 w-5 text-gray-500" />
          </Button>
        </form>
      </footer>
    </main>
  )
}