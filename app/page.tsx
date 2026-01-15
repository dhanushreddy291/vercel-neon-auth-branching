import { db } from '@/app/db';
import { messages } from '@/app/db/schema';
import { postMessage, approveMessage } from './actions';
import { desc, eq, and } from 'drizzle-orm';
import { authServer } from '@/lib/auth/server';

export default async function Home() {
  const { data } = await authServer.getSession();
  const isAdmin = data?.user.role === 'admin';

  const publicMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.isApproved, true))
    .orderBy(desc(messages.createdAt));

  const pendingMessages = isAdmin
    ? await db.select().from(messages).where(eq(messages.isApproved, false))
    : [];

  const userPending = data?.session
    ? await db
      .select()
      .from(messages)
      .where(and(eq(messages.userId, data.user.id), eq(messages.isApproved, false)))
    : [];

  return (
    <main className="max-w-2xl mx-auto p-8 font-sans text-gray-900 dark:text-gray-200">

      <header className="flex justify-between items-center mb-8 border-b border-gray-300 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold tracking-tight">
          Community Message Board&nbsp;
          {isAdmin && <span className="text-red-500">(Admin Mode)</span>}
        </h1>
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

      {data?.session && userPending.length > 0 && !isAdmin && (
        <div className="mb-8 p-4 rounded-lg border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-800 shadow-sm">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            Your message is pending admin review and will appear once approved.
          </p>
        </div>
      )}

      {isAdmin && pendingMessages.length > 0 && (
        <div className="mb-10 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 p-5 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-4">
            Moderation Queue
          </h2>

          <div className="space-y-3">
            {pendingMessages.map((msg) => (
              <div
                key={msg.id}
                className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-700 shadow-sm"
              >
                <div>
                  <p className="text-gray-900 dark:text-gray-100">{msg.content}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Posted by <span className="font-medium">{msg.userId}</span>
                  </span>
                </div>

                <form action={approveMessage.bind(null, msg.id)}>
                  <button className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition">
                    Approve
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Live Messages</h2>

      <div className="space-y-4">
        {publicMessages.map((msg) => (
          <div
            key={msg.id}
            className="p-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow transition"
          >
            <p className="text-gray-800 dark:text-gray-200 mb-2">{msg.content}</p>

            <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
              <span>
                Posted by{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {msg.userId}
                </span>
              </span>
              <span>{msg.createdAt?.toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
