'use client'

interface BottomNavProps {
  inboxCount: number
}

export default function BottomNav({ inboxCount }: BottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-2">
        <span className="text-xs text-gray-400">
          Mobile nav coming in Prompt 4
        </span>
      </div>
    </div>
  )
}
