import { db } from '@/app/db';
import { messages } from '@/app/db/schema';
import { desc } from 'drizzle-orm';
import { authServer } from '@/lib/auth/server';
import { postMessage } from '@/app/actions';

export default async function Home() {
  const { data } = await authServer.getSession();

  const allMessages = await db
    .select()
    .from(messages)
    .orderBy(desc(messages.createdAt));

  return (
    <main className="max-w-2xl mx-auto p-8 font-sans text-gray-900 dark:text-gray-200">
      <header className="flex justify-between items-center mb-8 border-b border-gray-300 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">Community Message Board</h1>
      </header>

      {data?.session && (
        <form
          action={postMessage}
          className="mb-10 bg-gray-100 dark:bg-gray-800 p-5 rounded-xl border border-gray-300 dark:border-gray-700 shadow-sm"
        >
          <label className="block mb-3 font-medium">Post a message</label>
          <div className="flex gap-3">
            <input
              name="content"
              required
              placeholder="What's on your mind?"
              className="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium">
              Post
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {allMessages.map((msg) => (
          <div
            key={msg.id}
            className="p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow transition"
          >
            <p className="text-gray-800 dark:text-gray-200 mb-2">{msg.content}</p>

            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>
                Posted by <span className="font-medium text-gray-700 dark:text-gray-300">{msg.userId}</span>
              </span>

              <span>{msg.createdAt?.toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
