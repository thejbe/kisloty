import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type OnboardingStep = 'auth' | 'location' | 'time' | 'micro' | 'hobby' | 'complete'

const KISLOTY_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOig2MNMZ4ACFXKXOjkpxspZ78qDoMa6OlJIQUdbtLc5wVS6jGfLVJrzoyOeE4GIAgAAhne69AQIJwrd0PZHvV1ijvP9PxYmpH09I1HoeV6K4O67LAVUlMJuMKDvM1HpqIdhKonPdckYj5mamhYTpmHumUPL5Mg6YIsu3PiL97PjTTaDAj-xnJzzEsJwW5ibODQI8GPLXRvJemW5DslXq3b7HlHc6qWYzcsglUHALHiSi-14O_okPqJsT_8kUWDFpaNypIjuhyPw'

const TIME_OPTIONS = ['10-20', '30-60', '60-120'] as const
const HOBBY_OPTIONS = ['Cinema', 'Markets', 'Gym', 'Yoga', 'Climbing', 'Pottery']

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState<OnboardingStep>('auth')
  const [email, setEmail] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Form state
  const [displayName, setDisplayName] = useState('')
  const [city, setCity] = useState('')
  const [typicalTime, setTypicalTime] = useState<typeof TIME_OPTIONS[number] | null>(null)
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([])

  useEffect(() => {
    // Check if user is already authenticated
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id)
        setEmail(session.user.email || '')
        setStep('location')
      }
    })

    // Listen for auth state changes (magic link login)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUserId(session.user.id)
        setEmail(session.user.email || '')
        setStep('location')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    })

    if (error) {
      alert(error.message)
    } else {
      setEmailSent(true)
    }
    setLoading(false)
  }

  const handleLocationSubmit = () => {
    if (city.trim()) {
      setStep('time')
    }
  }

  const handleTimeSubmit = (time: typeof TIME_OPTIONS[number]) => {
    setTypicalTime(time)
    setStep('micro')
  }

  const handleMicroSubmit = () => {
    setStep('hobby')
  }

  const handleHobbyToggle = (hobby: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    )
  }

  const handleComplete = async () => {
    if (!userId) return

    setLoading(true)

    try {
      // Create profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: userId,
        display_name: displayName || email.split('@')[0],
        city: city,
        onboarding_complete: true,
      })

      if (profileError) throw profileError

      // Create preferences
      const { error: prefsError } = await supabase.from('preferences').upsert({
        user_id: userId,
        typical_available_time: typicalTime,
        favorite_hobbies: selectedHobbies,
      })

      if (prefsError) throw prefsError

      // Navigate to home feed
      navigate('/app')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('There was an error completing onboarding. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStepNumber = () => {
    const steps = { auth: 0, location: 1, time: 2, micro: 3, hobby: 4, complete: 5 }
    return steps[step]
  }

  const getProgress = () => {
    return ((getStepNumber() + 1) / 5) * 100
  }

  if (step === 'auth') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background-light p-4 font-display text-text-light dark:bg-background-dark dark:text-text-dark">
        <div className="w-full max-w-md rounded-lg bg-card-light p-8 shadow-lg dark:bg-card-dark">
          <h1 className="mb-2 text-3xl font-bold">Welcome to Kisloty</h1>
          <p className="mb-6 text-muted-light dark:text-muted-dark">
            Let's get started. Enter your email to continue.
          </p>

          {!emailSent ? (
            <form onSubmit={handleSendMagicLink} className="flex flex-col gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="form-input h-12 w-full rounded-lg border border-chip-border-light bg-background-light p-3 text-base focus:outline-0 focus:ring-2 focus:ring-primary/50 dark:border-chip-border-dark dark:bg-background-dark dark:text-text-dark"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Continue with email'}
              </button>
            </form>
          ) : (
            <div className="rounded-lg bg-bubble-light p-4 dark:bg-bubble-dark">
              <p className="text-center">
                Check your email! We sent a magic link to <strong>{email}</strong>
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light font-display text-text-light dark:bg-background-dark dark:text-text-dark">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center px-4 py-5 sm:py-10">
          <div className="flex w-full max-w-2xl flex-1 flex-col">
            {/* Progress bar */}
            <div className="flex w-full flex-col gap-2 p-4">
              <p className="text-sm font-medium leading-normal">
                Step {getStepNumber()} of 5
              </p>
              <div className="h-2 rounded-full bg-bubble-light dark:bg-bubble-dark">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${getProgress()}%` }}
                />
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex flex-col gap-6 p-4">
              {/* Welcome message */}
              <div className="flex items-start gap-3">
                <div
                  className="aspect-square h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${KISLOTY_AVATAR})` }}
                />
                <div className="flex flex-1 flex-col items-start gap-1">
                  <p className="text-sm font-medium leading-normal">Kisloty</p>
                  <p className="flex max-w-md rounded-lg rounded-bl-none bg-bubble-light px-4 py-3 text-base font-normal leading-relaxed dark:bg-bubble-dark">
                    Hey, I'm Kisloty 👋 I help you do more small real-life things with people you
                    care about.
                  </p>
                </div>
              </div>

              {/* Location step */}
              {step === 'location' && (
                <>
                  <div className="flex items-start gap-3">
                    <div
                      className="aspect-square h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${KISLOTY_AVATAR})` }}
                    />
                    <div className="flex flex-1 flex-col items-start gap-1">
                      <p className="text-sm font-medium leading-normal">Kisloty</p>
                      <p className="flex max-w-md rounded-lg rounded-bl-none bg-bubble-light px-4 py-3 text-base font-normal leading-relaxed dark:bg-bubble-dark">
                        Where are you right now?
                      </p>
                    </div>
                  </div>
                  <div className="flex w-full max-w-md items-start gap-3 justify-end">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLocationSubmit()}
                      placeholder="Enter your city or neighborhood"
                      className="form-input flex h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border border-chip-border-light bg-background-light p-3 text-base leading-normal text-text-light placeholder:text-text-light/50 focus:outline-0 focus:ring-2 focus:ring-primary/50 dark:border-chip-border-dark dark:bg-background-dark dark:text-text-dark dark:placeholder:text-text-dark/50"
                    />
                  </div>
                </>
              )}

              {/* Time step */}
              {(step === 'time' || step === 'micro' || step === 'hobby' || step === 'complete') && (
                <>
                  <div className="flex items-start justify-end gap-3">
                    <p className="flex max-w-md rounded-lg rounded-br-none bg-primary px-4 py-3 text-base font-medium leading-relaxed text-white dark:text-text-dark">
                      {city}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div
                      className="aspect-square h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${KISLOTY_AVATAR})` }}
                    />
                    <div className="flex flex-1 flex-col items-start gap-1">
                      <p className="text-sm font-medium leading-normal">Kisloty</p>
                      <p className="flex max-w-md rounded-lg rounded-bl-none bg-bubble-light px-4 py-3 text-base font-normal leading-relaxed dark:bg-bubble-dark">
                        How much time do you usually have for small things?
                      </p>
                    </div>
                  </div>
                  {step === 'time' && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      <button
                        onClick={() => handleTimeSubmit('10-20')}
                        className="flex items-center justify-center rounded-full border border-chip-border-light bg-secondary px-4 py-2 text-sm font-medium text-text-light transition-colors hover:bg-bubble-light dark:border-chip-border-dark dark:hover:bg-bubble-dark"
                      >
                        10–20 mins
                      </button>
                      <button
                        onClick={() => handleTimeSubmit('30-60')}
                        className="flex items-center justify-center rounded-full border border-chip-border-light bg-secondary px-4 py-2 text-sm font-medium text-text-light transition-colors hover:bg-bubble-light dark:border-chip-border-dark dark:hover:bg-bubble-dark"
                      >
                        30–60 mins
                      </button>
                      <button
                        onClick={() => handleTimeSubmit('60-120')}
                        className="flex items-center justify-center rounded-full border border-chip-border-light bg-secondary px-4 py-2 text-sm font-medium text-text-light transition-colors hover:bg-bubble-light dark:border-chip-border-dark dark:hover:bg-bubble-dark"
                      >
                        1–2 hours
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* Micro step */}
              {(step === 'micro' || step === 'hobby' || step === 'complete') && (
                <>
                  <div className="flex items-start justify-end gap-3">
                    <p className="flex max-w-md rounded-lg rounded-br-none bg-primary px-4 py-3 text-base font-medium leading-relaxed text-white dark:text-text-dark">
                      {typicalTime === '10-20' && '10–20 mins'}
                      {typicalTime === '30-60' && '30–60 mins'}
                      {typicalTime === '60-120' && '1–2 hours'}
                    </p>
                  </div>
                  {step === 'micro' && (
                    <div className="flex items-start gap-3">
                      <div
                        className="aspect-square h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${KISLOTY_AVATAR})` }}
                      />
                      <div className="flex flex-1 flex-col items-start gap-3">
                        <p className="text-sm font-medium leading-normal">Kisloty</p>
                        <p className="flex max-w-md rounded-lg rounded-bl-none bg-bubble-light px-4 py-3 text-base font-normal leading-relaxed dark:bg-bubble-dark">
                          Nice! Let's skip ahead...
                        </p>
                        <button
                          onClick={handleMicroSubmit}
                          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background-light dark:focus:ring-offset-background-dark"
                        >
                          <span>Continue</span>
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Hobby step */}
              {(step === 'hobby' || step === 'complete') && (
                <>
                  <div className="flex items-start gap-3">
                    <div
                      className="aspect-square h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${KISLOTY_AVATAR})` }}
                    />
                    <div className="flex flex-1 flex-col items-start gap-1">
                      <p className="text-sm font-medium leading-normal">Kisloty</p>
                      <p className="flex max-w-md rounded-lg rounded-bl-none bg-bubble-light px-4 py-3 text-base font-normal leading-relaxed dark:bg-bubble-dark">
                        What's something you wish you did more often?
                      </p>
                    </div>
                  </div>
                  {step === 'hobby' && (
                    <>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {HOBBY_OPTIONS.map((hobby) => (
                          <button
                            key={hobby}
                            onClick={() => handleHobbyToggle(hobby)}
                            className={`flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                              selectedHobbies.includes(hobby)
                                ? 'border-primary bg-primary text-white dark:text-text-dark'
                                : 'border-chip-border-light bg-secondary text-text-light hover:bg-bubble-light dark:border-chip-border-dark dark:hover:bg-bubble-dark'
                            }`}
                          >
                            {hobby}
                          </button>
                        ))}
                      </div>
                      {selectedHobbies.length > 0 && (
                        <div className="flex items-start gap-3">
                          <div
                            className="aspect-square h-10 w-10 shrink-0 rounded-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${KISLOTY_AVATAR})` }}
                          />
                          <div className="flex flex-1 flex-col items-start gap-3">
                            <p className="text-sm font-medium leading-normal">Kisloty</p>
                            <p className="flex max-w-md rounded-lg rounded-bl-none bg-bubble-light px-4 py-3 text-base font-normal leading-relaxed dark:bg-bubble-dark">
                              Nice, thanks! I'll use this to suggest gentle ideas. Let's head to
                              your home feed.
                            </p>
                            <button
                              onClick={handleComplete}
                              disabled={loading}
                              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background-light disabled:opacity-50 dark:focus:ring-offset-background-dark"
                            >
                              <span>{loading ? 'Setting up...' : 'Go to Home Feed'}</span>
                              <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
