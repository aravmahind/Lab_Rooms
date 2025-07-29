import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

interface TeamMember {
  id: string
  name: string
  isOnline: boolean
  joinedAt: Date
}

const LabRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoaded, setIsLoaded] = useState(false)
  const [roomCode] = useState(roomId || 'ROOM123')
  
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(2 * 60 * 60) // 2 hours in seconds
  
  // Get room name and host name from URL parameters
  const roomName = searchParams.get('roomName') || 'Untitled Room'
  const hostName = searchParams.get('hostName') || 'Anonymous Host'
  
  const [teamMembers] = useState<TeamMember[]>([
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

  useEffect(() => {
    setIsLoaded(true)
    
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
  }, [])

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

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-cyan-900/20 to-blue-900/20">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-3 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className={`mb-4 md:mb-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                LabRooms Workspace
              </h1>
              <button
                onClick={() => navigate('/')}
                className="px-3 py-2 text-xs sm:text-sm font-semibold text-cyan-300 border border-cyan-400/50 rounded-lg hover:bg-cyan-400/10 transition-colors duration-200 whitespace-nowrap"
              >
                Leave Room
              </button>
            </div>
          </div>

          {/* Responsive Layout - Stack on mobile, grid on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 min-h-[calc(100vh-120px)]">
            
            {/* Column 1: Room Info & Team */}
            <div className={`lg:col-span-3 space-y-3 md:space-y-4 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              
              {/* Room Code & Expiry */}
              <div className="bg-gradient-to-br from-cyan-900/30 to-emerald-900/30 backdrop-blur-lg rounded-xl md:rounded-2xl border border-cyan-400/20 p-3 md:p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base md:text-lg font-bold text-cyan-300 flex items-center gap-2">
                      <span className="text-lg md:text-xl">🏠</span>
                      <span className="truncate">{roomName}</span>
                    </h2>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-black/30 rounded-xl p-3 border border-cyan-400/30">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-400 mb-1">Room Code</p>
                          <p className="text-sm md:text-lg font-black text-cyan-400 font-mono tracking-wider truncate">{roomCode}</p>
                        </div>
                        <button
                          onClick={copyRoomCode}
                          className="px-2 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-colors duration-200 text-xs font-semibold whitespace-nowrap"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-black/30 rounded-xl p-3 border border-emerald-400/30">
                      <p className="text-xs text-gray-400 mb-1">Expires In</p>
                      <p className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                        <span className="text-base md:text-lg">⏰</span>
                        <span className="font-mono text-sm md:text-base text-white">{formatTime(timeLeft)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Host Section */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 backdrop-blur-lg rounded-2xl border border-purple-400/20 p-3">
                <h3 className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                  <span className="text-lg">👑</span>
                  Host
                </h3>
                <div className="flex items-center gap-2 bg-black/30 rounded-xl p-2 border border-purple-400/30">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{hostName[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{hostName}</p>
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                      Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Members Section */}
              <div className="bg-gradient-to-br from-cyan-900/30 to-emerald-900/30 backdrop-blur-lg rounded-2xl border border-cyan-400/20 p-3 flex-1">
                <h3 className="text-sm font-bold text-cyan-300 mb-2 flex items-center gap-2">
                  <span className="text-lg">👥</span>
                  Team Members ({teamMembers.length})
                </h3>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className="flex items-center gap-2 bg-black/30 rounded-xl p-2 border border-cyan-400/20 hover:border-cyan-400/40 transition-colors duration-200"
                    >
                      <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-black">{member.name[0]}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white text-xs">{member.name}</p>
                        <p className="text-xs text-gray-400">
                          Joined {Math.floor((Date.now() - member.joinedAt.getTime()) / 60000)} min ago
                        </p>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full ${member.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                    </div>
                  ))}
                  
                  {teamMembers.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-400 text-xs">No team members yet</p>
                      <p className="text-gray-500 text-xs mt-1">Share the room code to invite others</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Column 2: File Editor/Workspace - Much Bigger */}
            <div className={`lg:col-span-6 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-lg rounded-2xl border border-gray-400/20 p-4 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    Code Editor
                  </h3>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold hover:bg-green-500/30 transition-colors">
                      Save
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 bg-black/50 rounded-xl border border-gray-400/30 p-0 overflow-hidden">
                  <textarea
                    className="w-full h-full bg-transparent text-white p-4 resize-none focus:outline-none text-sm font-mono leading-relaxed"
                    placeholder="// Start coding here...
// This is a collaborative code editor
// Your teammates can see your changes in real-time

function welcomeToLabRooms() {
    console.log('Welcome to collaborative coding!');
    // Add your code here
}"
                    style={{ minHeight: '100%' }}
                  />
                </div>
              </div>
            </div>

            {/* Column 3: Chat & Files - Smaller */}
            <div className={`lg:col-span-3 space-y-3 transition-all duration-1000 delay-600 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              
              {/* Chat Section */}
              <div className="bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 backdrop-blur-lg rounded-2xl border border-emerald-400/20 p-3 flex flex-col" style={{ height: 'calc(50% - 6px)' }}>
                <h3 className="text-sm font-bold text-emerald-300 mb-2 flex items-center gap-2 flex-shrink-0">
                  <span className="text-lg">💬</span>
                  Team Chat
                </h3>
                <div className="flex-1 bg-black/30 rounded-xl border border-emerald-400/20 p-2 mb-2 overflow-y-auto">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 text-center">Welcome to the room! 🎉</div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <input 
                    type="text" 
                    placeholder="Type message..."
                    className="flex-1 bg-black/50 border border-emerald-400/30 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-400"
                  />
                  <button className="px-2 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/30 transition-colors flex-shrink-0">
                    Send
                  </button>
                </div>
              </div>

              {/* Files Section */}
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 backdrop-blur-lg rounded-2xl border border-blue-400/20 p-3 flex flex-col" style={{ height: 'calc(50% - 6px)' }}>
                <h3 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2 flex-shrink-0">
                  <span className="text-lg">📁</span>
                  Shared Files
                </h3>
                <div className="flex-1 bg-black/30 rounded-xl border border-blue-400/20 p-2 mb-2 overflow-y-auto">
                  <div className="text-center py-4">
                    <div className="text-2xl mb-1">📤</div>
                    <p className="text-gray-400 text-xs">No files uploaded yet</p>
                    <p className="text-gray-500 text-xs mt-1">Drag & drop files here</p>
                  </div>
                </div>
                <button className="w-full py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold hover:bg-blue-500/30 transition-colors border border-blue-400/30 flex-shrink-0">
                  Upload Files
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LabRoom
