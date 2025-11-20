import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Profile as ProfileType, Preferences } from '../types'

const MICRO_OPTIONS = ['Walk', 'Coffee', 'Reading', 'Tidy', 'Stretch', 'Music', 'Journal']
const HOBBY_OPTIONS = ['Cinema', 'Markets', 'Yoga', 'Climbing', 'Cooking', 'Gym', 'Pottery', 'Dancing']

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [preferences, setPreferences] = useState<Preferences | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [selectedMicros, setSelectedMicros] = useState<string[]>([])
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([])
  const [bucketList, setBucketList] = useState<string[]>([])
  const [newBucketItem, setNewBucketItem] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/')
      return
    }

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      setDisplayName(profileData.display_name)
    }

    // Load preferences
    const { data: prefsData } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (prefsData) {
      setPreferences(prefsData)
      setSelectedMicros((prefsData.favorite_micro_actions as string[]) || [])
      setSelectedHobbies((prefsData.favorite_hobbies as string[]) || [])
      setBucketList((prefsData.bucket_list as string[]) || [])
    }

    setLoading(false)
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setSaving(true)

    try {
      // Update profile
      await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('user_id', user.id)

      // Update preferences
      await supabase
        .from('preferences')
        .upsert({
          user_id: user.id,
          favorite_micro_actions: selectedMicros,
          favorite_hobbies: selectedHobbies,
          bucket_list: bucketList,
        })

      navigate('/app')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleMicro = (micro: string) => {
    setSelectedMicros((prev) =>
      prev.includes(micro) ? prev.filter((m) => m !== micro) : [...prev, micro]
    )
  }

  const toggleHobby = (hobby: string) => {
    setSelectedHobbies((prev) =>
      prev.includes(hobby) ? prev.filter((h) => h !== hobby) : [...prev, hobby]
    )
  }

  const addBucketItem = () => {
    if (newBucketItem.trim()) {
      setBucketList((prev) => [...prev, newBucketItem.trim()])
      setNewBucketItem('')
    }
  }

  const removeBucketItem = (index: number) => {
    setBucketList((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-text-light dark:text-text-dark">Loading...</div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light font-display text-text-light dark:bg-background-dark dark:text-text-dark">
      <div className="flex h-full grow flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-center border-b border-solid border-border-light bg-background-light/80 backdrop-blur-sm dark:border-border-dark dark:bg-background-dark/80">
          <div className="flex w-full max-w-2xl items-center justify-between whitespace-nowrap px-6 py-4">
            <div className="flex items-center gap-3 text-text-light dark:text-text-dark">
              <div className="size-6">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path
                    clipRule="evenodd"
                    d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold leading-tight tracking-tight">Kisloty</h2>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary px-5 text-sm font-bold leading-normal tracking-wide text-white disabled:opacity-50"
            >
              <span className="truncate">{saving ? 'Saving...' : 'Done'}</span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-1 justify-center p-4 sm:p-6 lg:p-8">
          <div className="flex w-full max-w-2xl flex-col gap-8">
            {/* Profile section */}
            <section className="flex flex-col items-center gap-6 rounded-lg bg-card-light p-6 shadow-sm dark:bg-card-dark">
              <div className="group relative">
                <div className="flex aspect-square size-24 items-center justify-center rounded-full border-2 border-dashed border-border-light bg-cover bg-center bg-no-repeat dark:border-border-dark">
                  <span className="text-4xl font-bold text-text-light/50 dark:text-text-dark/50">
                    {displayName.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="material-symbols-outlined text-2xl text-white">edit</span>
                </div>
              </div>
              <div className="w-full max-w-md">
                <label className="flex w-full flex-col">
                  <p className="pb-2 text-sm font-medium leading-normal text-text-light/80 dark:text-text-dark/80">
                    Display Name
                  </p>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="form-input flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-border-light bg-background-light p-3 text-base font-normal leading-normal placeholder:text-text-light/40 focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-border-dark dark:bg-background-dark dark:placeholder:text-text-dark/40"
                    placeholder="Your Name"
                  />
                </label>
              </div>
            </section>

            {/* Favourite micro actions */}
            <section className="flex flex-col gap-4 rounded-lg bg-card-light p-6 shadow-sm dark:bg-card-dark">
              <h3 className="text-lg font-bold leading-tight tracking-tight">Favourite micro actions</h3>
              <div className="flex flex-wrap gap-3">
                {MICRO_OPTIONS.map((micro) => (
                  <button
                    key={micro}
                    onClick={() => toggleMicro(micro)}
                    className={`flex h-9 shrink-0 cursor-pointer items-center justify-center gap-x-2 rounded-full px-4 ${
                      selectedMicros.includes(micro)
                        ? 'bg-primary/20 ring-2 ring-primary dark:bg-primary/30'
                        : 'bg-border-light hover:bg-primary/10 dark:bg-background-dark dark:hover:bg-primary/20'
                    }`}
                  >
                    <p className="text-sm font-medium leading-normal text-text-light dark:text-text-dark">
                      {micro}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Favourite hobbies */}
            <section className="flex flex-col gap-4 rounded-lg bg-card-light p-6 shadow-sm dark:bg-card-dark">
              <h3 className="text-lg font-bold leading-tight tracking-tight">Favourite hobbies</h3>
              <div className="flex flex-wrap gap-3">
                {HOBBY_OPTIONS.map((hobby) => (
                  <button
                    key={hobby}
                    onClick={() => toggleHobby(hobby)}
                    className={`flex h-9 shrink-0 cursor-pointer items-center justify-center gap-x-2 rounded-full px-4 ${
                      selectedHobbies.includes(hobby)
                        ? 'bg-primary/20 ring-2 ring-primary dark:bg-primary/30'
                        : 'bg-border-light hover:bg-primary/10 dark:bg-background-dark dark:hover:bg-primary/20'
                    }`}
                  >
                    <p className="text-sm font-medium leading-normal text-text-light dark:text-text-dark">
                      {hobby}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Bucket list */}
            <section className="flex flex-col gap-3 rounded-lg bg-card-light p-6 shadow-sm dark:bg-card-dark">
              <h3 className="text-lg font-bold leading-tight tracking-tight">My bucket list</h3>
              <div className="flex flex-col gap-2">
                {bucketList.map((item, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 rounded-lg p-2 hover:bg-background-light dark:hover:bg-background-dark"
                  >
                    <span className="material-symbols-outlined cursor-grab text-text-light/40 dark:text-text-dark/40">
                      drag_indicator
                    </span>
                    <p className="flex-1 text-base text-text-light dark:text-text-dark">{item}</p>
                    <button
                      onClick={() => removeBucketItem(index)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-text-light/60 dark:text-text-dark/60">
                        close
                      </span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newBucketItem}
                  onChange={(e) => setNewBucketItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addBucketItem()}
                  placeholder="Add a dream or goal..."
                  className="form-input flex h-10 flex-1 rounded-lg border border-border-light bg-background-light p-2 text-base focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-border-dark dark:bg-background-dark"
                />
                <button
                  onClick={addBucketItem}
                  className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 text-primary hover:bg-primary/20 dark:hover:bg-primary/30"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
            </section>

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="flex h-12 items-center justify-center rounded-lg border border-border-light bg-background-light px-6 text-base font-medium text-text-light transition-colors hover:bg-border-light dark:border-border-dark dark:bg-background-dark dark:text-text-dark dark:hover:bg-border-dark"
            >
              Sign out
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
