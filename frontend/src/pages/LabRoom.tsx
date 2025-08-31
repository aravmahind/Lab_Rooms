import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

interface TeamMember {
  id: string
  name: string
  isOnline: boolean
  joinedAt: Date
}

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  type: 'message' | 'system'
}

const LabRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoaded, setIsLoaded] = useState(false)
  const [roomCode, setRoomCode] = useState(roomId || 'ROOM123')
  const [showRoomCode, setShowRoomCode] = useState(false)
  const [roomExists, setRoomExists] = useState(true)
  const [isValidating, setIsValidating] = useState(true)
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [showTeamPanel, setShowTeamPanel] = useState(false)
  const [showChatPanel, setShowChatPanel] = useState(false)
  const [activeSection, setActiveSection] = useState('code-sharing') // New state for navigation
  
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60) // 2 hours in seconds
  
  // Get room name and host name from URL parameters
  const roomName = searchParams.get('roomName') || 'Untitled Room'
  const hostName = searchParams.get('hostName') || 'Anonymous Host'
  const memberName = searchParams.get('memberName') || 'Anonymous'
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Tanishq Kulkarni',
      isOnline: true,
      joinedAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    },
    {
      id: '2',
      name: 'Arav Mahind',
      isOnline: true,
      joinedAt: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
    },
    {
      id: '3',
      name: 'Chirag Chaudhari',
      isOnline: true,
      joinedAt: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
    }
  ])

  // Chat functionality state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'System',
      content: 'Welcome to the room! 🎉',
      timestamp: new Date(Date.now() - 10000),
      type: 'system'
    },
    {
      id: '2',
      sender: 'Tanishq Kulkarni',
      content: 'Hey everyone! Ready to collaborate?',
      timestamp: new Date(Date.now() - 8000),
      type: 'message'
    },
    {
      id: '3',
      sender: 'Arav Mahind',
      content: 'Yes! This is awesome 🚀',
      timestamp: new Date(Date.now() - 5000),
      type: 'message'
    },
    {
      id: '4',
      sender: 'Chirag Chaudhari',
      content: 'Let\'s share some code snippets!',
      timestamp: new Date(Date.now() - 2000),
      type: 'message'
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      sender: memberName,
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'message'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  useEffect(() => {
    const validateRoom = async () => {
      if (!roomId) {
        setRoomExists(false)
        setIsValidating(false)
        return
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/rooms/code/${roomId}`)
        if (!response.ok) {
          setRoomExists(false)
        } else {
          const room = await response.json()
          setRoomCode(room.code)
          setRoomExists(true)
          
          // Add current member to team members if not already present
          if (memberName && memberName !== 'Anonymous') {
            setTeamMembers(prev => {
              const existingMember = prev.find(member => member.name === memberName)
              if (!existingMember) {
                // Add system message for new member
                setMessages(prevMessages => [...prevMessages, {
                  id: `join-${Date.now()}`,
                  sender: 'System',
                  content: `${memberName} joined the room 👋`,
                  timestamp: new Date(),
                  type: 'system'
                }])
                
                return [...prev, {
                  id: Date.now().toString(),
                  name: memberName,
                  isOnline: true,
                  joinedAt: new Date()
                }]
              }
              return prev
            })
          }
        }
      } catch (error) {
        setRoomExists(false)
      } finally {
        setIsValidating(false)
        setIsLoaded(true)
      }
    }

    validateRoom()
    
    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          // Room expired - redirect or show expiry message
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [roomId])

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    // You can add a toast notification here
  }

  const themeClasses = {
    bg: isDarkTheme ? 'bg-gray-900' : 'bg-gray-50',
    text: isDarkTheme ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkTheme ? 'text-gray-300' : 'text-gray-600',
    textMuted: isDarkTheme ? 'text-gray-400' : 'text-gray-500',
    border: isDarkTheme ? 'border-gray-700' : 'border-gray-200',
    card: isDarkTheme ? 'bg-gray-800' : 'bg-white',
    cardSecondary: isDarkTheme ? 'bg-gray-700' : 'bg-gray-100',
    input: isDarkTheme ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300',
    button: isDarkTheme ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600',
    buttonSecondary: isDarkTheme ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300',
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg}`}>
      {/* Main Content */}
      <div className="min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Room Validation */}
          {isValidating && (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <div className={`w-8 h-8 border-2 ${isDarkTheme ? 'border-blue-400' : 'border-blue-500'} border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
                <p className={`text-lg ${themeClasses.text}`}>Validating room...</p>
              </div>
            </div>
          )}

          {!isValidating && !roomExists && (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className={`text-2xl font-bold text-red-500 mb-2`}>Room Not Found</h1>
                <p className={`${themeClasses.textMuted} mb-6`}>The room code you entered doesn't exist or has expired.</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate('/join-room')}
                    className={`px-6 py-3 ${themeClasses.button} text-white font-semibold rounded-lg transition-colors`}
                  >
                    Try Another Code
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className={`px-6 py-3 ${themeClasses.border} ${themeClasses.textSecondary} hover:${themeClasses.buttonSecondary} font-semibold rounded-lg transition-colors border`}
                  >
                    Go Home
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isValidating && roomExists && (
            <>
              {/* Navigation Bar */}
              <div className={`${themeClasses.cardSecondary} border-b-2 ${themeClasses.border} shadow-sm mb-6 -mx-4 md:-mx-6 px-4 md:px-6 py-4 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Left: LabRooms Workspace Title */}
                  <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.text}`}>
                    LabRooms Workspace
                  </h1>
                  
                  {/* Center: Navigation Sections */}
                  <div className={`flex items-center gap-1 ${themeClasses.cardSecondary} ${themeClasses.border} border rounded-lg p-1`}>
                    <button
                      onClick={() => setActiveSection('code-sharing')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                        activeSection === 'code-sharing'
                          ? `${themeClasses.button} text-white shadow-sm`
                          : `${themeClasses.textSecondary} hover:${themeClasses.buttonSecondary}`
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Code Sharing
                    </button>
                    
                    <button
                      onClick={() => setActiveSection('whiteboard')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                        activeSection === 'whiteboard'
                          ? `${themeClasses.button} text-white shadow-sm`
                          : `${themeClasses.textSecondary} hover:${themeClasses.buttonSecondary}`
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Whiteboard
                    </button>
                    
                    <button
                      onClick={() => setActiveSection('file-sharing')}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 ${
                        activeSection === 'file-sharing'
                          ? `${themeClasses.button} text-white shadow-sm`
                          : `${themeClasses.textSecondary} hover:${themeClasses.buttonSecondary}`
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      File Sharing
                    </button>
                  </div>
                  
                  {/* Right: Timer, Toggle, Leave Room */}
                  <div className="flex items-center gap-3">
                    {/* Expiry Timer - Single Line Format */}
                    <div className={`${themeClasses.cardSecondary} rounded-lg px-3 py-2 ${themeClasses.border} border flex items-center gap-2`}>
                      <span className="text-red-500 text-lg">⏰</span>
                      <p className={`text-sm font-bold ${themeClasses.text} font-mono`}>
                        Expires In : {formatTime(timeLeft)}
                      </p>
                    </div>
                    
                    {/* Theme Toggle */}
                    <button
                      onClick={() => setIsDarkTheme(!isDarkTheme)}
                      className={`p-2 rounded-lg ${themeClasses.cardSecondary} ${themeClasses.border} border transition-colors hover:scale-105`}
                      title={isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'}
                    >
                      {isDarkTheme ? (
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      )}
                    </button>
                    
                    <button
                      onClick={() => navigate('/')}
                      className={`px-4 py-2 text-sm font-semibold ${themeClasses.textSecondary} ${themeClasses.border} border rounded-lg hover:${themeClasses.buttonSecondary} transition-colors`}
                    >
                      Leave Room
                    </button>
                  </div>
                </div>
              </div>

          {/* Responsive Layout - Hide right sidebar, make editor full width */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[calc(100vh-140px)]">
            
            {/* Column 1: Room Info - Minimalistic Design */}
            <div className={`lg:col-span-1 space-y-4 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              
              {/* Room Code & Expiry - Clean Card */}
              <div className={`${themeClasses.card} rounded-xl ${themeClasses.border} border p-4 shadow-sm`}>
                <div className="space-y-4">
                  <div>
                    <h2 className={`text-lg font-semibold ${themeClasses.text} mb-1`}>
                      {roomName}
                    </h2>
                  </div>
                  
                  <div className="space-y-3">
                    <div className={`${themeClasses.cardSecondary} rounded-lg p-3`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs ${themeClasses.textMuted} mb-1`}>Room Code</p>
                          <p className={`text-lg font-mono font-bold ${themeClasses.text} tracking-wider`}>
                            {showRoomCode ? roomCode : '•'.repeat(roomCode.length)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setShowRoomCode(!showRoomCode)}
                            className={`p-2 ${themeClasses.buttonSecondary} rounded-lg transition-colors hover:scale-105`}
                            title={showRoomCode ? "Hide code" : "Show code"}
                          >
                            {showRoomCode ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={copyRoomCode}
                            className={`px-3 py-2 ${themeClasses.button} text-white text-xs font-semibold rounded-lg transition-colors hover:scale-105`}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: File Editor/Workspace - Full Width */}
            <div className={`lg:col-span-3 ${themeClasses.card} rounded-xl ${themeClasses.border} border p-6 shadow-sm transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold ${themeClasses.text} flex items-center gap-2`}>
                    <span className="text-xl">📝</span>
                    Code Editor
                  </h3>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors">
                      Save
                    </button>
                    <button className={`px-4 py-2 ${themeClasses.buttonSecondary} ${themeClasses.textSecondary} text-sm font-semibold rounded-lg transition-colors`}>
                      Share
                    </button>
                  </div>
                </div>
                
                <div className={`flex-1 ${themeClasses.cardSecondary} rounded-lg ${themeClasses.border} border overflow-hidden`}>
                  <textarea
                    className={`w-full h-full ${themeClasses.cardSecondary} ${themeClasses.text} p-4 resize-none focus:outline-none text-sm font-mono leading-relaxed`}
                    placeholder={`// Welcome to LabRooms collaborative workspace!
// 
// ✨ What you can do:
// • Write and share code in real-time
// • Collaborate with your team members
// • Save and export your work
// • Chat with your team in the sidebar
//
// Start coding below...

function welcomeToLabRooms() {
  console.log("Hello, team! Let's build something amazing together!");
  
  // Your code here...
}

welcomeToLabRooms();`}
                    style={{ minHeight: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Floating Action Buttons - Bottom Right */}
          <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
            {/* Team Members Button */}
            <button
              onClick={() => setShowTeamPanel(true)}
              className={`w-14 h-14 ${themeClasses.button} rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center group`}
              title="View Team Members"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a6 6 0 01-4-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              {teamMembers.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {teamMembers.length}
                </span>
              )}
            </button>

            {/* Chat Button */}
            <button
              onClick={() => setShowChatPanel(true)}
              className={`w-14 h-14 ${themeClasses.button} rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 flex items-center justify-center group`}
              title="Open Chat"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {messages.length > 4 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {messages.length - 4}
                </span>
              )}
            </button>
          </div>

          {/* Team Members Modal */}
          {showTeamPanel && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className={`${themeClasses.card} rounded-2xl ${themeClasses.border} border shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${themeClasses.text} flex items-center gap-2`}>
                      <span className="text-xl">�</span>
                      Team Members ({teamMembers.length + 1})
                    </h3>
                    <button
                      onClick={() => setShowTeamPanel(false)}
                      className={`p-2 ${themeClasses.buttonSecondary} rounded-lg hover:scale-105 transition-transform`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {/* Host */}
                    <div className={`flex items-center gap-3 ${themeClasses.cardSecondary} rounded-lg p-3`}>
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{hostName[0]}</span>
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${themeClasses.text}`}>{hostName}</p>
                        <p className="text-xs text-blue-500 flex items-center gap-1">
                          <span className="text-sm">👑</span>
                          Host
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>

                    {/* Team Members */}
                    {teamMembers.map((member) => (
                      <div 
                        key={member.id} 
                        className={`flex items-center gap-3 ${themeClasses.cardSecondary} rounded-lg p-3 transition-colors hover:scale-[1.02]`}
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{member.name[0]}</span>
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${themeClasses.text}`}>{member.name}</p>
                          <p className={`text-xs ${themeClasses.textMuted}`}>
                            Joined {Math.floor((Date.now() - member.joinedAt.getTime()) / 60000)} min ago
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                    ))}
                    
                    {teamMembers.length === 0 && (
                      <div className="text-center py-6">
                        <p className={`${themeClasses.textMuted} text-sm`}>No other members yet</p>
                        <p className={`${themeClasses.textMuted} text-xs mt-1`}>Share the room code to invite others</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Modal */}
          {showChatPanel && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className={`${themeClasses.card} rounded-2xl ${themeClasses.border} border shadow-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-semibold ${themeClasses.text} flex items-center gap-2`}>
                      <span className="text-xl">💬</span>
                      Team Chat
                    </h3>
                    <button
                      onClick={() => setShowChatPanel(false)}
                      className={`p-2 ${themeClasses.buttonSecondary} rounded-lg hover:scale-105 transition-transform`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div key={message.id} className={`${message.type === 'system' ? 'text-center' : ''}`}>
                        {message.type === 'system' ? (
                          <div className={`text-xs ${themeClasses.textMuted} py-1`}>{message.content}</div>
                        ) : (
                          <div className={`${themeClasses.cardSecondary} rounded-lg p-3 ${themeClasses.border} border`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-sm font-semibold ${themeClasses.text}`}>{message.sender}</span>
                              <span className={`text-xs ${themeClasses.textMuted}`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className={`text-sm ${themeClasses.textSecondary} break-words`}>{message.content}</p>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className={`flex-1 ${themeClasses.input} rounded-lg px-4 py-2 ${themeClasses.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <button 
                      type="submit"
                      className={`px-6 py-2 ${themeClasses.button} text-white font-semibold rounded-lg transition-colors hover:scale-105`}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default LabRoom
