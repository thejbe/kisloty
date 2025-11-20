import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ActivityWithProfile, Profile, SuggestionTile as SuggestionTileType } from '../types'
import ActivityTile from '../components/ActivityTile'
import SuggestionTile from '../components/SuggestionTile'
import CreateActivityModal from '../components/CreateActivityModal'
import { getTimeOfDay, getDayType } from '../lib/utils'

export default function HomeFeed() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [activities, setActivities] = useState<ActivityWithProfile[]>([])
  const [suggestions, setSuggestions] = useState<SuggestionTileType[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadUserData()
    loadActivities()
    generateSuggestions()
  }, [])

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/')
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setProfile(data)
      if (!data.onboarding_complete) {
        navigate('/onboarding')
      }
    }
    setLoading(false)
  }

  const loadActivities = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get all friend activities (will be filtered by RLS)
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        profile:profiles!activities_user_id_fkey(*)
      `)
      .neq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!error && data) {
      setActivities(data as ActivityWithProfile[])
    }
  }

  const generateSuggestions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get user preferences
    const { data: prefs } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const timeOfDay = getTimeOfDay()
    const dayType = getDayType()

    // Simple rule-based suggestions
    const suggestionsList: SuggestionTileType[] = []

    if (timeOfDay === 'evening' && dayType === 'weekday') {
      suggestionsList.push({
        id: 'suggestion-1',
        type: 'suggestion',
        title: "It's a quiet evening – would you like to read somewhere cosy for 20 mins?",
        category: 'Tiny idea',
      })
    }

    if (dayType === 'weekend') {
      suggestionsList.push({
        id: 'suggestion-2',
        type: 'suggestion',
        title: 'Weekend coming up – maybe try a market?',
        category: 'Weekend idea',
      })
    }

    if (timeOfDay === 'morning' && prefs?.favorite_hobbies) {
      const hobbies = prefs.favorite_hobbies as string[]
      if (hobbies.includes('Yoga') || hobbies.includes('Gym')) {
        suggestionsList.push({
          id: 'suggestion-3',
          type: 'suggestion',
          title: 'Morning energy – how about a quick yoga session or gym visit?',
          category: 'Morning boost',
        })
      }
    }

    // Default suggestion if no specific ones match
    if (suggestionsList.length === 0) {
      suggestionsList.push({
        id: 'suggestion-default',
        type: 'suggestion',
        title: 'How about a quick coffee with someone nearby?',
        category: 'Small idea',
      })
    }

    setSuggestions(suggestionsList)
  }

  const handleActivityCreated = () => {
    loadActivities()
    setShowCreateModal(false)
  }

  const handleStartSuggestion = () => {
    setShowCreateModal(true)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-text-light dark:text-text-dark">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light font-display dark:bg-background-dark">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-center border-b border-black/5 bg-background-light/80 px-4 py-3 backdrop-blur-sm dark:border-white/5 dark:bg-background-dark/80 md:px-8">
          <div className="flex w-full max-w-3xl items-center justify-between">
            <div className="flex items-center gap-3 text-text-light dark:text-text-dark">
              <div className="size-5">
                <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path
                    clipRule="evenodd"
                    d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold tracking-tight">Kisloty</h2>
            </div>
            <div className="flex flex-1 justify-end">
              <button
                onClick={() => navigate('/profile')}
                className="aspect-square size-10 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: profile?.avatar_url
                    ? `url(${profile.avatar_url})`
                    : 'linear-gradient(135deg, #e29578 0%, #e5e5e5 100%)',
                }}
              />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-1 justify-center px-4 py-8 md:px-8 md:py-12">
          <div className="layout-content-container flex w-full max-w-3xl flex-1 flex-col gap-8">
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex flex-col gap-2">
                <p className="text-3xl font-bold tracking-tight text-text-light dark:text-text-dark md:text-4xl">
                  Hi, {profile?.display_name || 'there'}.
                </p>
                <p className="text-base font-normal text-muted-light dark:text-muted-dark">
                  Here are some small things you could do.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Suggestions */}
              {suggestions.map((suggestion) => (
                <SuggestionTile
                  key={suggestion.id}
                  suggestion={suggestion}
                  onStart={handleStartSuggestion}
                />
              ))}

              {/* Friend activities */}
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <ActivityTile key={activity.id} activity={activity} />
                ))
              ) : (
                <div className="rounded-lg bg-card-light p-8 text-center dark:bg-card-dark">
                  <p className="text-muted-light dark:text-muted-dark">
                    No friend activities yet. Start creating your own!
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Floating action button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 z-20 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105 active:scale-95 md:h-16 md:w-auto md:gap-2 md:px-6"
      >
        <span className="material-symbols-outlined !text-2xl">add</span>
        <span className="hidden text-base font-medium md:inline">Start a small thing</span>
      </button>

      {/* Create activity modal */}
      <CreateActivityModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleActivityCreated}
      />
    </div>
  )
}
