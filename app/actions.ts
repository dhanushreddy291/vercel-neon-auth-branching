'use server';

import { db } from '@/app/db';
import { messages } from '@/app/db/schema';
import { authServer } from '@/lib/auth/server';
import { revalidatePath } from 'next/cache';

export async function postMessage(formData: FormData) {
    const { data } = await authServer.getSession();

    if (!data || !data.session) throw new Error("Unauthorized");

    await db.insert(messages).values({
        content: formData.get('content') as string,
        userId: data.user.id
    });

    revalidatePath('/');
}