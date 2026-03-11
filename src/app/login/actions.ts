'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    if (!data.email || !data.password) {
        redirect('/login?error=يرجى إدخال البريد الإلكتروني وكلمة المرور')
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        const errorMessage = encodeURIComponent(
            error.message.includes('Invalid login') || error.message.includes('invalid_credentials')
                ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
                : error.message.includes('User not found')
                ? 'المستخدم غير موجود'
                : error.message.includes('Email not confirmed')
                ? 'يرجى تأكيد البريد الإلكتروني أولاً'
                : 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى'
        )
        redirect(`/login?error=${errorMessage}`)
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard/admin')
}
