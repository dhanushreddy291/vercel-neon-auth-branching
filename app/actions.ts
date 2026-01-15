'use server';

import { db } from '@/app/db';
import { revalidatePath } from 'next/cache';
import { createAuthServer } from '@neondatabase/neon-js/auth/next/server';
import { messages } from '@/app/db/schema';
import { eq } from 'drizzle-orm';

const authServer = createAuthServer();

export async function postMessage(formData: FormData) {
    const { data } = await authServer.getSession();
    if (!data || !data.session) throw new Error("Unauthorized");

    const isAdmin = data.user.role === 'admin';

    await db.insert(messages).values({
        content: formData.get('content') as string,
        userId: data.user.id,
        // Auto approve if admin else false
        isApproved: isAdmin
    });
    revalidatePath('/');
}

export async function approveMessage(messageId: string) {
    const { data } = await authServer.getSession();
    if (!data || data.user.role !== 'admin') throw new Error("Unauthorized");
    await db.update(messages)
        .set({ isApproved: true })
        .where(eq(messages.id, messageId));
    revalidatePath('/');
}