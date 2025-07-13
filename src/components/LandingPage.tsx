import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import LetterGlitch from './LetterGlitch'
import DecryptedText from './DecryptedText'
import { useState } from 'react'
import LoginForm from './LoginForm'
import { useAuth } from '../hooks/useAuth'

const LandingPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleEnterNews = () => {
    navigate('/news')
  }

  return (
    <div className="min-h-screen relative">
      {/* Auth Buttons */}
      <div className="absolute top-0 right-0 p-6 z-20 flex gap-4">
        {!user ? (
          <>
            <button
              className="btn-secondary text-white border-white/30 bg-black/40 hover:bg-white/10 font-bold"
              onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
            >
              Sign In
            </button>
            <button
              className="btn-primary font-bold"
              onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}
            >
              Sign Up
            </button>
          </>
        ) : (
          <button
            className="btn-secondary text-white border-white/30 bg-black/40 hover:bg-white/10 font-bold"
            onClick={logout}
          >
            Log Out
          </button>
        )}
      </div>
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-center justify-center">
          <div className="bg-gray-900 rounded-xl shadow-xl p-8 max-w-sm w-full border border-gray-800 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
              onClick={() => setShowAuthModal(false)}
            >
              ×
            </button>
            <LoginForm mode={authMode} onSuccess={() => setShowAuthModal(false)} />
          </div>
        </div>
      )}
      {/* LetterGlitch Background */}
      <div className="absolute inset-0 z-0">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={false}
          smooth={true}
        />
      </div>
      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              <DecryptedText
                text="Vleeb"
                speed={80}
                maxIterations={15}
                animateOn="view"
                revealDirection="center"
                className="text-white"
                encryptedClassName="text-green-400"
              />
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed drop-shadow-md">
              <DecryptedText
                text="Stay informed with the latest news in alternative timelines with fire ass updates. Discover stupid shit daily that has no purpose in your life whatsoever"
                speed={60}
                maxIterations={20}
                animateOn="view"
                revealDirection="start"
                className="text-gray-200"
                encryptedClassName="text-green-400"
              />
            </p>
          </div>
          <button
            onClick={handleEnterNews}
            className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-3 group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20"
          >
            Enter News
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default LandingPage 