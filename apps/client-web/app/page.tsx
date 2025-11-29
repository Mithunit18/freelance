import UserGreeting from '@/components/user/UserGreeting';
import Link from 'next/link';
import { Button } from '@vision-match/ui-web';
import { formatDate } from '@vision-match/utils-js';

export default function Home() {
  const today = formatDate(new Date());

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Client Portal</h1>
          <p className="text-gray-600 mb-2">Welcome to your dashboard</p>
          <p className="text-sm text-gray-500">Today: {today}</p>
        </div>
        
        <UserGreeting />

        <div className="flex gap-4 justify-center">
          <Link href="/page-one">
            <Button variant="primary">Go to Page One</Button>
          </Link>
          <Link href="/page-two">
            <Button variant="secondary">Go to Page Two</Button>
          </Link>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>API: {process.env.NEXT_PUBLIC_API_URL}</p>
          <p className="mt-2 text-xs text-green-600">
            ✅ Using shared UI components and utilities!
          </p>
        </div>
      </div>
    </main>
  );
}