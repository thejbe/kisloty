import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Check if onboarding is complete
        supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data?.onboarding_complete) {
              navigate('/app')
            } else {
              navigate('/onboarding')
            }
          })
      }
      setLoading(false)
    })
  }, [navigate])

  const handleGetStarted = () => {
    navigate('/onboarding')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-text-light dark:text-text-dark">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-light p-4 font-display text-text-light antialiased dark:bg-background-dark dark:text-text-dark sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center">
        <main className="flex w-full flex-col items-center gap-12 py-10 lg:flex-row lg:items-center lg:gap-16">
          {/* Left side: Text content */}
          <div className="flex w-full flex-col items-center gap-6 text-center lg:w-1/2 lg:items-start lg:gap-8 lg:text-left">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black leading-tight tracking-tighter sm:text-5xl lg:text-6xl">
                Kisloty
              </h1>
              <h2 className="text-xl font-bold text-primary sm:text-2xl">
                Do more things together.
              </h2>
              <p className="text-base text-text-light/80 dark:text-text-dark/80 sm:text-lg">
                A gentle app that helps you do small real-life things with friends, instead of doomscrolling.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleGetStarted}
                className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary px-6 text-base font-bold text-white shadow-sm transition-transform hover:scale-105"
              >
                <span className="truncate">Get started</span>
              </button>
              <button className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-secondary-light px-6 text-base font-bold text-text-light transition-colors hover:bg-black/10 dark:bg-secondary-dark dark:text-text-dark dark:hover:bg-white/10">
                <span className="truncate">How it works</span>
              </button>
            </div>
          </div>

          {/* Right side: Activity cards preview */}
          <div className="w-full lg:w-1/2">
            <div className="relative flex flex-col items-center justify-center p-4">
              <div
                className="z-10 w-full max-w-sm rounded-lg border border-black/5 bg-card-light p-4 shadow-lg transition-transform hover:-translate-y-1 dark:border-white/5 dark:bg-card-dark"
                style={{ transform: 'rotate(-3deg) translateY(0px)' }}
              >
                <p className="text-base sm:text-lg">Mia is grabbing a coffee ☕</p>
              </div>
              <div
                className="z-20 w-full max-w-sm rounded-lg border border-black/5 bg-card-light p-4 shadow-xl transition-transform hover:-translate-y-1 dark:border-white/5 dark:bg-card-dark"
                style={{ transform: 'rotate(2deg) translateY(-20px)' }}
              >
                <p className="text-base sm:text-lg">Tom is going for a 10-min walk 🚶</p>
              </div>
              <div
                className="z-30 w-full max-w-sm rounded-lg border border-black/5 bg-card-light p-4 shadow-2xl transition-transform hover:-translate-y-1 dark:border-white/5 dark:bg-card-dark"
                style={{ transform: 'rotate(-1deg) translateY(-40px)' }}
              >
                <p className="text-base sm:text-lg">You might like to read somewhere cosy 📖</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
