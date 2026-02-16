import { formatRadarTime } from '../services/rainviewer';

export function RadarControls({
  currentFrame,
  currentFrameIndex,
  totalFrames,
  isPastFrame,
  isPlaying,
  onPlayPause,
  onFrameChange
}) {
  if (!currentFrame) return null;

  const time = formatRadarTime(currentFrame.time);
  const progress = ((currentFrameIndex + 1) / totalFrames) * 100;

  return (
    <div className="absolute bottom-4 left-4 right-4 z-[1000]">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-xl shadow-lg p-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayPause}
            className="w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-md"
            aria-label={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>

          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className={`font-medium ${isPastFrame ? 'text-blue-600 dark:text-blue-400' : 'text-orange-500'}`}>
                {isPastFrame ? '📡 Observé' : '🔮 Prévision'}
              </span>
              <span className="font-mono text-gray-700 dark:text-gray-300">{time}</span>
            </div>

            <input
              type="range"
              min="0"
              max={totalFrames - 1}
              value={currentFrameIndex}
              onChange={(e) => onFrameChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="relative h-1 mt-1">
              <div
                className="absolute h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
