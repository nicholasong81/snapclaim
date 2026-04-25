'use client'

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  showTagline?: boolean
  darkBackground?: boolean
}

export default function Logo({
  size = 'md',
  showTagline = false,
  darkBackground = false,
}: LogoProps) {
  const configs = {
    xs: {
      icon: 'w-6 h-6 text-xs rounded',
      snap: 'text-sm',
      claim: 'text-sm',
      tagline: 'text-xs',
      gap: 'gap-1.5',
    },
    sm: {
      icon: 'w-7 h-7 text-sm rounded-md',
      snap: 'text-base',
      claim: 'text-base',
      tagline: 'text-xs',
      gap: 'gap-2',
    },
    md: {
      icon: 'w-9 h-9 text-base rounded-lg',
      snap: 'text-xl',
      claim: 'text-xl',
      tagline: 'text-xs',
      gap: 'gap-2.5',
    },
    lg: {
      icon: 'w-12 h-12 text-xl rounded-xl',
      snap: 'text-3xl',
      claim: 'text-3xl',
      tagline: 'text-sm',
      gap: 'gap-3',
    },
  }

  const c = configs[size]
  const textColor = darkBackground
    ? 'text-white'
    : 'text-gray-900'
  const taglineColor = darkBackground
    ? 'text-blue-200'
    : 'text-blue-500'

  return (
    <div className="flex flex-col items-center">
      <div className={`flex items-center ${c.gap}`}>
        
        {/* Icon mark */}
        <div
          className={`${c.icon} bg-blue-600 
            flex items-center justify-center 
            flex-shrink-0 shadow-sm`}
        >
          <span
            className="text-white font-black 
              leading-none"
          >
            S
          </span>
        </div>

        {/* Word mark */}
        <div className="flex items-baseline gap-0">
          <span
            className={`${c.snap} font-black 
              tracking-tight text-blue-600 
              leading-none`}
          >
            Snap
          </span>
          <span
            className={`${c.claim} font-black 
              tracking-tight ${textColor} 
              leading-none`}
          >
            Claim
          </span>
        </div>
      </div>

      {/* Tagline */}
      {showTagline && (
        <p
          className={`${c.tagline} ${taglineColor} 
            font-medium tracking-widest 
            uppercase mt-1.5 text-center`}
        >
          Snap · Confirm · Done
        </p>
      )}
    </div>
  )
}
