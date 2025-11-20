import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ActivityTemplate, TimeFrameType } from '../types'

interface CreateActivityModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export default function CreateActivityModal({ isOpen, onClose, onCreated }: CreateActivityModalProps) {
  const [templates, setTemplates] = useState<ActivityTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ActivityTemplate | null>(null)
  const [step, setStep] = useState<'template' | 'details'>('template')
  const [timeFrameType, setTimeFrameType] = useState<TimeFrameType>('now')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [location, setLocation] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('activity_templates')
      .select('*')
      .eq('is_active', true)
      .order('type', { ascending: true })

    if (!error && data) {
      setTemplates(data)
    }
  }

  const handleTemplateSelect = (template: ActivityTemplate) => {
    setSelectedTemplate(template)
    setStep('details')
  }

  const handleCreate = async () => {
    if (!selectedTemplate) return

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let scheduled_at = null
      if (timeFrameType === 'scheduled' && scheduledDate && scheduledTime) {
        scheduled_at = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
      }

      const { error } = await supabase.from('activities').insert({
        user_id: user.id,
        template_id: selectedTemplate.id,
        title: `${selectedTemplate.label} ${selectedTemplate.emoji}`,
        description: note || null,
        time_frame_type: timeFrameType,
        scheduled_at,
        location: location || null,
        visibility: 'friends',
        status: 'planned',
      })

      if (error) throw error

      onCreated()
      resetAndClose()
    } catch (error) {
      console.error('Error creating activity:', error)
      alert('Failed to create activity. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetAndClose = () => {
    setStep('template')
    setSelectedTemplate(null)
    setTimeFrameType('now')
    setScheduledDate('')
    setScheduledTime('')
    setLocation('')
    setNote('')
    onClose()
  }

  const getMaxDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  }

  if (!isOpen) return null

  const microTemplates = templates.filter((t) => t.type === 'micro')
  const hobbyTemplates = templates.filter((t) => t.type === 'hobby')

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-lg rounded-t-lg bg-card-light p-6 sm:rounded-lg dark:bg-card-dark">
        {step === 'template' && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
                Start a small thing
              </h2>
              <button
                onClick={resetAndClose}
                className="text-muted-light hover:text-text-light dark:text-muted-dark dark:hover:text-text-dark"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-muted-light dark:text-muted-dark">
                Micro actions (10-20 mins)
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {microTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="flex aspect-square flex-col items-center justify-center rounded-lg border border-chip-border-light bg-background-light p-2 transition-colors hover:bg-bubble-light dark:border-chip-border-dark dark:bg-background-dark dark:hover:bg-bubble-dark"
                  >
                    <span className="text-3xl">{template.emoji}</span>
                    <span className="mt-1 text-center text-xs text-text-light dark:text-text-dark">
                      {template.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-light dark:text-muted-dark">
                Hobbies & activities
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {hobbyTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="flex aspect-square flex-col items-center justify-center rounded-lg border border-chip-border-light bg-background-light p-2 transition-colors hover:bg-bubble-light dark:border-chip-border-dark dark:bg-background-dark dark:hover:bg-bubble-dark"
                  >
                    <span className="text-3xl">{template.emoji}</span>
                    <span className="mt-1 text-center text-xs text-text-light dark:text-text-dark">
                      {template.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === 'details' && selectedTemplate && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={() => setStep('template')}
                className="text-muted-light hover:text-text-light dark:text-muted-dark dark:hover:text-text-dark"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <h2 className="flex-1 text-2xl font-bold text-text-light dark:text-text-dark">
                {selectedTemplate.emoji} {selectedTemplate.label}
              </h2>
              <button
                onClick={resetAndClose}
                className="text-muted-light hover:text-text-light dark:text-muted-dark dark:hover:text-text-dark"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-light dark:text-text-dark">
                  When?
                </label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setTimeFrameType('now')}
                    className={`flex h-12 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors ${
                      timeFrameType === 'now'
                        ? 'border-primary bg-primary text-white'
                        : 'border-chip-border-light bg-background-light text-text-light hover:bg-bubble-light dark:border-chip-border-dark dark:bg-background-dark dark:text-text-dark dark:hover:bg-bubble-dark'
                    }`}
                  >
                    Now
                  </button>
                  <button
                    onClick={() => setTimeFrameType('scheduled')}
                    className={`flex h-12 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors ${
                      timeFrameType === 'scheduled'
                        ? 'border-primary bg-primary text-white'
                        : 'border-chip-border-light bg-background-light text-text-light hover:bg-bubble-light dark:border-chip-border-dark dark:bg-background-dark dark:text-text-dark dark:hover:bg-bubble-dark'
                    }`}
                  >
                    Pick a date (within 30 days)
                  </button>
                  <button
                    onClick={() => setTimeFrameType('someday')}
                    className={`flex h-12 items-center justify-center rounded-lg border px-4 text-sm font-medium transition-colors ${
                      timeFrameType === 'someday'
                        ? 'border-primary bg-primary text-white'
                        : 'border-chip-border-light bg-background-light text-text-light hover:bg-bubble-light dark:border-chip-border-dark dark:bg-background-dark dark:text-text-dark dark:hover:bg-bubble-dark'
                    }`}
                  >
                    Sometime in the future
                  </button>
                </div>
              </div>

              {timeFrameType === 'scheduled' && (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-medium text-text-light dark:text-text-dark">
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      max={getMaxDate()}
                      className="form-input h-12 w-full rounded-lg border border-chip-border-light bg-background-light p-3 text-base focus:outline-0 focus:ring-2 focus:ring-primary/50 dark:border-chip-border-dark dark:bg-background-dark dark:text-text-dark"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="mb-2 block text-sm font-medium text-text-light dark:text-text-dark">
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="form-input h-12 w-full rounded-lg border border-chip-border-light bg-background-light p-3 text-base focus:outline-0 focus:ring-2 focus:ring-primary/50 dark:border-chip-border-dark dark:bg-background-dark dark:text-text-dark"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-text-light dark:text-text-dark">
                  Where? (optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., local café, Brixton, home"
                  className="form-input h-12 w-full rounded-lg border border-chip-border-light bg-background-light p-3 text-base focus:outline-0 focus:ring-2 focus:ring-primary/50 dark:border-chip-border-dark dark:bg-background-dark dark:text-text-dark"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-light dark:text-text-dark">
                  Note (optional)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Any additional details..."
                  rows={3}
                  className="form-input w-full rounded-lg border border-chip-border-light bg-background-light p-3 text-base focus:outline-0 focus:ring-2 focus:ring-primary/50 dark:border-chip-border-dark dark:bg-background-dark dark:text-text-dark"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={loading || (timeFrameType === 'scheduled' && (!scheduledDate || !scheduledTime))}
                className="flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create activity'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
