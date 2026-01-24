import UserGreeting from '@/components/user/UserGreeting';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-gray-600 mb-8">Manage your application</p>
        </div>
        
        <UserGreeting />

        <div className="flex gap-4 justify-center">
          <Link 
            href="/page-one" 
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Go to Page One
          </Link>
          <Link 
            href="/page-two" 
            className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Go to Page Two
          </Link>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>API: {process.env.NEXT_PUBLIC_API_URL}</p>
        </div>
      </div>
    </main>
  );
}