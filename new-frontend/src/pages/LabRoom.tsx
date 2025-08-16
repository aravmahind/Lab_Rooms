import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
// import io, { Socket } from 'socket.io-client'
// import { FileManager, type SavedFile } from '../utils/fileManager'

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  type: 'user' | 'system'
}

// interface TeamMember {
//   id: string
//   name: string
//   joinedAt: Date
//   isOnline: boolean
// }

const LabRoom: React.FC = () => {
  const navigate = useNavigate()
  const { roomCode } = useParams<{ roomCode: string }>()
  
  // State management
  const [activeTab, setActiveTab] = useState<'code' | 'file' | 'whiteboard'>('code')
  // const [roomName] = useState('Lab Room')
  const [hostName] = useState('Siddhi')
  const [memberName] = useState(localStorage.getItem('memberName') || 'Anonymous')
  // const [isLoaded, setIsLoaded] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3600) // 1 hour in seconds
  // const [showRoomCode, setShowRoomCode] = useState(false)
  const [isTeamMembersCollapsed, setIsTeamMembersCollapsed] = useState(false)
  const [isSavedFilesCollapsed, setIsSavedFilesCollapsed] = useState(false)
  const [isTeamChatCollapsed, setIsTeamChatCollapsed] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'blue'>('blue')
  const [showThemeDropdown, setShowThemeDropdown] = useState(false)
  // const [savedFiles, setSavedFiles] = useState<SavedFile[]>([])
  // const [saveMessage, setSaveMessage] = useState('')
  
  // Hardcoded room code and team members
  const hardcodedRoomCode = 'Cacf26a'
  const hardcodedMembers = [
    { id: '1', name: 'Tanshiq', isOnline: true, joinedAt: new Date(Date.now() - 300000) }, // 5 min ago
    { id: '2', name: 'Chirag', isOnline: true, joinedAt: new Date(Date.now() - 600000) }, // 10 min ago
    { id: '3', name: 'Arav', isOnline: false, joinedAt: new Date(Date.now() - 900000) } // 15 min ago
  ]
  
  // Socket and messaging
  // const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  // const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Content states
  const [codeContent, setCodeContent] = useState('')

  useEffect(() => {
    // Temporarily disable socket connection for debugging
    /*
    // Initialize socket connection
    const newSocket = io('http://localhost:3001')
    setSocket(newSocket)

    // Join room
    if (roomCode) {
      newSocket.emit('join-room', roomCode)
    }

    // Socket event listeners
    newSocket.on('user-joined', (username: string) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'System',
        content: `${username} joined the room`,
        timestamp: new Date().toISOString(),
        type: 'system'
      }])
    })

    newSocket.on('user-left', (username: string) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'System',
        content: `${username} left the room`,
        timestamp: new Date().toISOString(),
        type: 'system'
      }])
    })

    newSocket.on('receive-message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    // Cleanup
    return () => {
      newSocket.close()
    }
    */
  }, [roomCode])

  useEffect(() => {
    // setIsLoaded(true)
    
    // Load saved files
    // setSavedFiles(FileManager.getSavedFiles())
    
    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: memberName,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        type: 'user'
      }
      
      // For now, just add to local messages (socket disabled for debugging)
      setMessages(prev => [...prev, message])
      setNewMessage('')
    }
  }

  // const copyRoomCode = () => {
  //   if (roomCode) {
  //     navigator.clipboard.writeText(roomCode)
  //   }
  // }

  // Theme configuration
  const getThemeDisplayName = (theme: string) => {
    switch (theme) {
      case 'blue': return 'Ocean'
      case 'dark': return 'Dark'
      case 'light': return 'Light'
      default: return theme
    }
  }

  const getThemeStyles = () => {
    switch (currentTheme) {
      case 'dark':
        return {
          bg: 'bg-[#000814]',
          headerBg: 'bg-[#000000]',
          sidebarBg: 'bg-[#03071e]',
          contentBg: 'bg-[#000814]',
          textPrimary: 'text-white',
          textSecondary: 'text-gray-300',
          border: 'border-gray-600',
          chatBg: 'bg-[#2b2d42]',
          messageBg: 'bg-[#000814]'
        }
      case 'blue':
        return {
          bg: 'bg-blue-50',
          headerBg: 'bg-blue-800',
          sidebarBg: 'bg-blue-100',
          contentBg: 'bg-white',
          textPrimary: 'text-blue-900',
          textSecondary: 'text-blue-700',
          border: 'border-blue-300',
          chatBg: 'bg-blue-50',
          messageBg: 'bg-white'
        }
      default: // light
        return {
          bg: 'bg-gray-50',
          headerBg: 'bg-[#fbfefb]',
          sidebarBg: 'bg-[#f8f9fa]',
          contentBg: 'bg-white',
          textPrimary: 'text-gray-800',
          textSecondary: 'text-gray-600',
          border: 'border-gray-200',
          chatBg: 'bg-gray-50',
          messageBg: 'bg-white'
        }
    }
  }

  const themeStyles = getThemeStyles()

  const renderTabContent = () => {
    switch (activeTab) {
      case 'code':
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${themeStyles.textPrimary}`}>Code Sharing</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Save
              </button>
            </div>
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              className={`flex-1 w-full p-4 border ${themeStyles.border} rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeStyles.contentBg} ${themeStyles.textPrimary}`}
              placeholder="// Paste your code here...
// Share code snippets with your team
// Real-time collaboration

console.log('Welcome to LabRooms!');

function example() {
  return 'Start coding together!';
}"
            />
          </div>
        )
      
      case 'file':
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${themeStyles.textPrimary}`}>File Sharing</h3>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Upload Files
              </button>
            </div>
            <div className={`flex-1 border-2 border-dashed ${themeStyles.border} rounded-lg flex items-center justify-center`}>
              <div className="text-center">
                <div className={`w-16 h-16 ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                  <div className={`w-8 h-8 border-2 ${currentTheme === 'dark' ? 'border-gray-300' : 'border-gray-400'} rounded`}></div>
                </div>
                <h4 className={`text-lg font-medium ${themeStyles.textPrimary} mb-2`}>No files uploaded yet</h4>
                <p className={themeStyles.textSecondary}>Drag and drop files here or click upload</p>
              </div>
            </div>
          </div>
        )
      
      case 'whiteboard':
        return (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${themeStyles.textPrimary}`}>White Board</h3>
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Clear
                </button>
                <button className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Save
                </button>
              </div>
            </div>
            <div className={`flex-1 ${themeStyles.contentBg} border ${themeStyles.border} rounded-lg flex items-center justify-center`}>
              <div className="text-center">
                <div className={`w-16 h-16 ${currentTheme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                  <div className={`w-8 h-8 border-2 ${currentTheme === 'dark' ? 'border-gray-300' : 'border-gray-400'} rounded-full`}></div>
                </div>
                <h4 className={`text-lg font-medium ${themeStyles.textPrimary} mb-2`}>Interactive Whiteboard</h4>
                <p className={themeStyles.textSecondary}>Start drawing and collaborating</p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen ${themeStyles.bg}`}>
      {/* Header */}
      <div className={`${currentTheme === 'blue' ? 'bg-blue-800' : themeStyles.headerBg} border-b ${themeStyles.border} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src="/blueLogo.png" 
              alt="LabRooms Logo" 
              className="w-12 h-12 object-contain"
            />
            <h1 className={`text-xl font-semibold ${currentTheme === 'blue' ? 'text-white' : themeStyles.textPrimary}`}>
              Room Code: {hardcodedRoomCode}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentTheme === 'blue' 
                    ? 'text-blue-100 hover:bg-blue-700 border border-blue-600' 
                    : currentTheme === 'dark'
                    ? `${themeStyles.textSecondary} hover:${themeStyles.textPrimary} hover:bg-gray-600 border ${themeStyles.border}`
                    : `${themeStyles.textSecondary} hover:${themeStyles.textPrimary} hover:bg-gray-100 border ${themeStyles.border}`
                }`}
              >
                Theme: {getThemeDisplayName(currentTheme)} ▼
              </button>
              
              {showThemeDropdown && (
                <div className={`absolute right-0 mt-2 w-32 ${themeStyles.contentBg} border ${themeStyles.border} rounded-lg shadow-lg z-50`}>
                  <button
                    onClick={() => {
                      setCurrentTheme('light')
                      setShowThemeDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm ${themeStyles.textPrimary} ${currentTheme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} rounded-t-lg transition-colors`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTheme('dark')
                      setShowThemeDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm ${themeStyles.textPrimary} ${currentTheme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} transition-colors`}
                  >
                    Dark
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTheme('blue')
                      setShowThemeDropdown(false)
                    }}
                    className={`w-full text-left px-3 py-2 text-sm ${themeStyles.textPrimary} ${currentTheme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'} rounded-b-lg transition-colors`}
                  >
                    Ocean 
                  </button>
                </div>
              )}
            </div>

            {/* Timer */}
            <div className={`text-sm ${currentTheme === 'blue' ? 'text-blue-100' : themeStyles.textSecondary}`}>
              Time: {formatTime(timeLeft)}
            </div>
            
            {/* Leave Room Button */}
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                currentTheme === 'blue'
                  ? 'bg-white text-blue-800 hover:bg-blue-50 border border-blue-200'
                  : currentTheme === 'dark'
                  ? 'bg-gray-600 text-white hover:bg-gray-700 border border-gray-500'
                  : 'bg-gray-600 text-white hover:bg-gray-700 border border-gray-500'
              }`}
            >
              Leave Room
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className={`w-80 ${themeStyles.sidebarBg} border-r ${themeStyles.border} flex flex-col`}>
          {/* Team Members */}
          <div className={`p-4 border-b ${themeStyles.border}`}>
            <button
              onClick={() => setIsTeamMembersCollapsed(!isTeamMembersCollapsed)}
              className={`w-full flex items-center justify-between font-medium ${themeStyles.textPrimary} mb-3 hover:${themeStyles.textSecondary} transition-colors`}
            >
              <span>Team Members</span>
              <div className={`transform transition-transform ${isTeamMembersCollapsed ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>
            
            {!isTeamMembersCollapsed && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <div className={`flex items-center gap-2 p-2 ${
                  currentTheme === 'dark' 
                    ? 'hover:bg-gray-600' 
                    : currentTheme === 'blue'
                    ? 'hover:bg-blue-50'
                    : 'hover:bg-gray-50'
                } rounded-lg`}>
                  <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">{hostName[0]}</span>
                  </div>
                  <span className={`text-sm ${themeStyles.textPrimary}`}>{hostName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    currentTheme === 'blue' 
                      ? 'text-blue-800 bg-blue-200' 
                      : 'text-blue-600 bg-blue-100'
                  }`}>Host</span>
                </div>
                
                {hardcodedMembers.map((member) => (
                  <div key={member.id} className={`flex items-center gap-2 p-2 ${
                    currentTheme === 'dark' 
                      ? 'hover:bg-gray-600' 
                      : currentTheme === 'blue'
                      ? 'hover:bg-blue-50'
                      : 'hover:bg-gray-50'
                  } rounded-lg`}>
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-white">{member.name[0]}</span>
                    </div>
                    <span className={`text-sm ${themeStyles.textPrimary}`}>{member.name}</span>
                    <div className={`w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Files */}
          <div className={`p-4 border-b ${themeStyles.border}`}>
            <button
              onClick={() => setIsSavedFilesCollapsed(!isSavedFilesCollapsed)}
              className={`w-full flex items-center justify-between font-medium ${themeStyles.textPrimary} mb-3 hover:${themeStyles.textSecondary} transition-colors`}
            >
              <span>Saved Files</span>
              <div className={`transform transition-transform ${isSavedFilesCollapsed ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>
            
            {!isSavedFilesCollapsed && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {/* Dummy file names */}
                <div className={`flex items-center gap-2 p-2 ${
                  currentTheme === 'dark' 
                    ? 'hover:bg-gray-600' 
                    : currentTheme === 'blue'
                    ? 'hover:bg-blue-50'
                    : 'hover:bg-gray-50'
                } rounded-lg cursor-pointer`}>
                  <div className={`w-4 h-4 ${themeStyles.textSecondary}`}>📄</div>
                  <span className={`text-sm ${themeStyles.textPrimary} truncate`}>main.py</span>
                </div>
                
                <div className={`flex items-center gap-2 p-2 ${
                  currentTheme === 'dark' 
                    ? 'hover:bg-gray-600' 
                    : currentTheme === 'blue'
                    ? 'hover:bg-blue-50'
                    : 'hover:bg-gray-50'
                } rounded-lg cursor-pointer`}>
                  <div className={`w-4 h-4 ${themeStyles.textSecondary}`}>📄</div>
                  <span className={`text-sm ${themeStyles.textPrimary} truncate`}>algorithm.js</span>
                </div>
                
                <div className={`flex items-center gap-2 p-2 ${
                  currentTheme === 'dark' 
                    ? 'hover:bg-gray-600' 
                    : currentTheme === 'blue'
                    ? 'hover:bg-blue-50'
                    : 'hover:bg-gray-50'
                } rounded-lg cursor-pointer`}>
                  <div className={`w-4 h-4 ${themeStyles.textSecondary}`}>📄</div>
                  <span className={`text-sm ${themeStyles.textPrimary} truncate`}>styles.css</span>
                </div>
                
                <div className={`flex items-center gap-2 p-2 ${
                  currentTheme === 'dark' 
                    ? 'hover:bg-gray-600' 
                    : currentTheme === 'blue'
                    ? 'hover:bg-blue-50'
                    : 'hover:bg-gray-50'
                } rounded-lg cursor-pointer`}>
                  <div className={`w-4 h-4 ${themeStyles.textSecondary}`}>📄</div>
                  <span className={`text-sm ${themeStyles.textPrimary} truncate`}>database.sql</span>
                </div>
                
                <div className={`flex items-center gap-2 p-2 ${
                  currentTheme === 'dark' 
                    ? 'hover:bg-gray-600' 
                    : currentTheme === 'blue'
                    ? 'hover:bg-blue-50'
                    : 'hover:bg-gray-50'
                } rounded-lg cursor-pointer`}>
                  <div className={`w-4 h-4 ${themeStyles.textSecondary}`}>📄</div>
                  <span className={`text-sm ${themeStyles.textPrimary} truncate`}>README.md</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className={`p-4 border-b ${themeStyles.border}`}>
              <button
                onClick={() => setIsTeamChatCollapsed(!isTeamChatCollapsed)}
                className={`w-full flex items-center justify-between font-medium ${themeStyles.textPrimary} hover:${themeStyles.textSecondary} transition-colors`}
              >
                <span>Team Chat</span>
                <div className={`transform transition-transform ${isTeamChatCollapsed ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>
            </div>
            
            {!isTeamChatCollapsed && (
              <div className="flex-1 flex flex-col p-4 min-h-0">
                <div className={`flex-1 ${themeStyles.chatBg} rounded-lg p-3 mb-3 overflow-y-auto min-h-0`}>
                  <div className="space-y-2">
                    {messages.length === 0 ? (
                      <div className={`text-center text-sm ${themeStyles.textSecondary} py-4`}>
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className={`${message.type === 'system' ? 'text-center' : ''}`}>
                          {message.type === 'system' ? (
                            <div className={`text-xs ${themeStyles.textSecondary} py-1`}>{message.content}</div>
                          ) : (
                            <div className={`${themeStyles.messageBg} rounded-lg p-2 border ${themeStyles.border}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className={`text-xs font-medium ${themeStyles.textPrimary}`}>{message.sender}</span>
                                <span className={`text-xs ${themeStyles.textSecondary}`}>
                                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className={`text-sm ${themeStyles.textPrimary} break-words`}>{message.content}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2 flex-shrink-0">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className={`flex-1 px-3 py-2 border ${themeStyles.border} rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${themeStyles.contentBg} ${themeStyles.textPrimary}`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 ${themeStyles.contentBg}`}>
          {/* Tab Navigation */}
          <div className={`border-b ${themeStyles.border}`}>
            <nav className="flex">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'code'
                    ? currentTheme === 'dark' 
                      ? 'border-white text-white' 
                      : 'border-blue-600 text-blue-600'
                    : `border-transparent ${themeStyles.textSecondary} hover:${themeStyles.textPrimary} ${
                        currentTheme === 'dark' ? 'hover:border-gray-500' : 'hover:border-gray-300'
                      }`
                }`}
              >
                Code Sharing
              </button>
              <button
                onClick={() => setActiveTab('file')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'file'
                    ? currentTheme === 'dark' 
                      ? 'border-white text-white' 
                      : 'border-blue-600 text-blue-600'
                    : `border-transparent ${themeStyles.textSecondary} hover:${themeStyles.textPrimary} ${
                        currentTheme === 'dark' ? 'hover:border-gray-500' : 'hover:border-gray-300'
                      }`
                }`}
              >
                File Sharing
              </button>
              <button
                onClick={() => setActiveTab('whiteboard')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'whiteboard'
                    ? currentTheme === 'dark' 
                      ? 'border-white text-white' 
                      : 'border-blue-600 text-blue-600'
                    : `border-transparent ${themeStyles.textSecondary} hover:${themeStyles.textPrimary} ${
                        currentTheme === 'dark' ? 'hover:border-gray-500' : 'hover:border-gray-300'
                      }`
                }`}
              >
                White Board
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="h-[calc(100%-61px)] p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LabRoom
