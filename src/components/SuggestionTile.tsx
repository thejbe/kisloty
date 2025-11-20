import { SuggestionTile as SuggestionTileType } from '../types'

interface SuggestionTileProps {
  suggestion: SuggestionTileType
  onStart: () => void
}

export default function SuggestionTile({ suggestion, onStart }: SuggestionTileProps) {
  return (
    <div className="flex flex-col rounded-lg bg-card-light p-5 shadow-sm shadow-black/5 dark:bg-card-dark">
      <p className="mb-3 text-sm font-medium text-primary">{suggestion.category}</p>
      <p className="text-lg font-bold leading-tight tracking-tight text-text-light dark:text-text-dark">
        {suggestion.title}
      </p>
      <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button className="text-sm font-medium text-muted-light underline-offset-4 hover:underline dark:text-muted-dark">
          See another idea
        </button>
        <button
          onClick={onStart}
          className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-9 px-4 bg-primary text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <span className="truncate">Start this</span>
        </button>
      </div>
    </div>
  )
}
