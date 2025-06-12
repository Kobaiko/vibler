import { SignupForm } from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-secondary-900">
            Join Vibler
          </h1>
          <p className="mt-2 text-secondary-600">
            Start building amazing marketing funnels with AI
          </p>
        </div>
        
        <SignupForm onSuccess={() => window.location.href = '/dashboard'} />
      </div>
    </div>
  )
} 