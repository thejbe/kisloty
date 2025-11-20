import { ActivityWithProfile } from '../types'
import { formatDistanceToNow } from '../lib/utils'

interface ActivityTileProps {
  activity: ActivityWithProfile
}

export default function ActivityTile({ activity }: ActivityTileProps) {
  const getTimeDisplay = () => {
    if (activity.time_frame_type === 'now') {
      return 'Now'
    } else if (activity.time_frame_type === 'scheduled' && activity.scheduled_at) {
      return formatDistanceToNow(activity.scheduled_at)
    } else {
      return 'Someday'
    }
  }

  return (
    <div className="flex flex-col rounded-lg bg-card-light p-5 shadow-sm shadow-black/5 dark:bg-card-dark">
      <div className="flex items-center gap-3">
        <div
          className="size-9 rounded-full bg-cover bg-center"
          style={{
            backgroundImage: activity.profile?.avatar_url
              ? `url(${activity.profile.avatar_url})`
              : 'linear-gradient(135deg, #e29578 0%, #e5e5e5 100%)',
          }}
        />
        <p className="text-sm font-medium text-text-light dark:text-text-dark">
          {activity.profile?.display_name || 'Someone'} is {activity.time_frame_type === 'now' ? 'doing' : 'planning to'}...
        </p>
      </div>
      <p className="my-3 text-lg font-bold leading-tight tracking-tight text-text-light dark:text-text-dark">
        {activity.title}
      </p>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-light dark:text-muted-dark">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined !text-base">schedule</span>
            {getTimeDisplay()}
          </span>
          {activity.location && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined !text-base">location_on</span>
              {activity.location}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 px-4 bg-secondary text-sm font-medium text-text-light transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-text-dark dark:hover:bg-white/20">
            <span className="truncate">I'll do this too</span>
          </button>
          <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 px-4 bg-primary text-sm font-medium text-white transition-opacity hover:opacity-90">
            <span className="truncate">Say hi</span>
          </button>
        </div>
      </div>
    </div>
  )
}
