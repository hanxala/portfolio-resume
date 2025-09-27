import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-purple-500/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Admin Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign up to access the portfolio admin panel
          </p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white dark:bg-gray-800 shadow-2xl",
            }
          }}
        />
      </div>
    </div>
  )
}
