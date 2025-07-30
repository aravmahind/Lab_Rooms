import React, { useEffect, useState } from 'react'
import { Button } from '../components/ui/button'
import { useNavigate } from 'react-router-dom'

const Landing: React.FC = () => {
  const navigate = useNavigate()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleCreateRoom = () => {
    navigate('/create-room')
  }

  const handleJoinRoom = () => {
    navigate('/join-room')
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-cyan-900/20 to-blue-900/20">
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
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
        
        {/* Interactive Glow Effect */}
        <div
          className="absolute w-96 h-96 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent rounded-full blur-3xl transition-all duration-300"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-6 md:py-8">
        {/* Animated Logo */}
        <div className={`mb-4 md:mb-6 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative group">
            <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition duration-300 animate-pulse" />
            <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 group-hover:rotate-6 transition-all duration-300">
              <span className="text-xl md:text-2xl font-black text-black">LR</span>
              <div className="absolute -top-1 -right-1 md:-top-1.5 md:-right-1.5 w-4 h-4 md:w-5 md:h-5 bg-yellow-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>

        {/* Main Heading with Typewriter Effect */}
        <div className={`text-center mb-6 md:mb-8 px-2 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-400 mb-3 md:mb-4 tracking-tight">
            Welcome to the
          </h1>
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-5 transform hover:scale-105 transition-transform duration-300">
              Lab<span className="text-cyan-400">rooms</span>!
            </h2>
            <div className="absolute -bottom-1 md:-bottom-2 left-1/2 transform -translate-x-1/2 w-16 md:w-24 h-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
          </div>
          
          {/* Animated Subtitle */}
          <p className="text-base sm:text-lg text-emerald-300 font-medium mt-4 md:mt-6 animate-pulse">
            Real time collaboration with team
          </p>
        </div>

        {/* Action Buttons with Hover Effects */}
        <div className={`flex flex-col sm:flex-row gap-4 md:gap-5 mb-8 md:mb-10 w-full max-w-md mx-auto px-4 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <Button 
            onClick={handleCreateRoom}
            className="group relative px-8 sm:px-10 py-4 md:py-5 text-base md:text-lg font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 text-black rounded-xl md:rounded-2xl shadow-2xl overflow-hidden transform hover:scale-110 hover:rotate-1 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            <span className="relative z-10">Create Room</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-yellow-400 rounded-full animate-ping" />
          </Button>
          
          <Button 
            onClick={handleJoinRoom}
            className="group relative px-8 sm:px-10 py-4 md:py-5 text-base md:text-lg font-bold border-2 md:border-3 border-cyan-400 text-cyan-300 bg-black/50 backdrop-blur-sm rounded-xl md:rounded-2xl shadow-2xl overflow-hidden transform hover:scale-110 hover:-rotate-1 transition-all duration-300 hover:bg-cyan-400/10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">Join Room</span>
          </Button>
        </div>

        {/* Features Description with Animated Cards */}
        <div className={`text-center max-w-5xl mx-auto px-4 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 mb-6">
            {[
              { icon: "📁", text: "Share & Upload Files", delay: "0s" },
              { icon: "✏️", text: "Real-time Editing", delay: "0.2s" },
              { icon: "💬", text: "Team Chat", delay: "0.4s" }
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-4 md:p-5 bg-gradient-to-br from-cyan-900/30 to-emerald-900/30 backdrop-blur-lg rounded-xl md:rounded-2xl border border-cyan-400/20 hover:border-cyan-400/50 transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-xl"
                style={{ animationDelay: feature.delay }}
              >
                <div className="text-2xl md:text-3xl mb-2 animate-bounce" style={{ animationDelay: feature.delay }}>
                  {feature.icon}
                </div>
                <p className="text-cyan-200 font-semibold text-sm md:text-base">{feature.text}</p>
              </div>
            ))}
          </div>
          
          <p className="text-base md:text-lg text-gray-300 leading-relaxed bg-black/30 backdrop-blur-sm p-4 md:p-5 rounded-xl md:rounded-2xl border border-cyan-400/20">
            Experience the future of team collaboration with{" "}
            <span className="text-cyan-400 font-bold">real-time file sharing</span>,{" "}
            <span className="text-emerald-400 font-bold">collaborative editing</span>,{" "}
            <span className="text-blue-400 font-bold">instant messaging</span>, and{" "}
            <span className="text-purple-400 font-bold">seamless file management</span> 
            {" "}— all in one powerful platform.
          </p>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/50 to-transparent" />
    </div>
  )
}

export default Landing 