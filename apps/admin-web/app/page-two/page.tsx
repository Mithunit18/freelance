import Link from 'next/link';
import { userService } from '@/services/user';

export default async function PageTwo() {
  let userData = null;
  try {
    userData = await userService.getCurrentUser();
  } catch (error) {
    console.error('Failed to fetch user:', error);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Admin Page Two</h1>
          <p className="text-gray-600 mb-8">Second admin page</p>
        </div>

        <div className="p-6 bg-pink-100 rounded-lg">
          <h2 className="text-2xl font-bold text-pink-900 mb-2">
            Data from Admin API:
          </h2>
          {userData ? (
            <>
              <p className="text-pink-700">Name: {userData.name}</p>
              <p className="text-pink-700">{userData.message}</p>
            </>
          ) : (
            <p className="text-red-600">Failed to load data</p>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Link 
            href="/" 
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Go to Home
          </Link>
          <Link 
            href="/page-one" 
            className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
          >
            Go to Page One
          </Link>
        </div>
      </div>
    </main>
  );
}