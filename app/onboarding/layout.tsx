import Logo from '@/components/Logo'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50
      flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="md" showTagline={true} />
        </div>
        {children}
      </div>
    </div>
  )
}
