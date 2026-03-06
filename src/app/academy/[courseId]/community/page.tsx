'use client';
import { useEffect, useState, use } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Send, Heart, MessageSquare, Trash2, Users, ChevronRight } from 'lucide-react';

interface Props { params: Promise<{ courseId: string }> }

interface Post {
    id: string;
    body: string;
    likes: number;
    created_at: string;
    user_id: string;
    profiles?: { full_name: string };
    academy_community_comments?: Comment[];
}

interface Comment {
    id: string;
    body: string;
    user_id: string;
    created_at: string;
    profiles?: { full_name: string };
}

export default function CommunityPage({ params }: Props) {
    const { courseId } = use(params);
    const supabase = createClient();
    const [posts, setPosts] = useState<Post[]>([]);
    const [course, setCourse] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [enrollment, setEnrollment] = useState<any>(null);
    const [newPost, setNewPost] = useState('');
    const [posting, setPosting] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        const { data } = await supabase
            .from('academy_community_posts')
            .select('*, profiles:user_id(full_name), academy_community_comments(*, profiles:user_id(full_name))')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false })
            .limit(50);
        if (data) setPosts(data as Post[]);
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const { data: courseData } = await supabase.from('academy_courses').select('title_ar').eq('id', courseId).single();
            setCourse(courseData);

            if (user) {
                const { data: enr } = await supabase.from('academy_enrollments').select('*').eq('user_id', user.id).eq('course_id', courseId).single();
                setEnrollment(enr);
            }

            await fetchPosts();
            setLoading(false);
        };
        init();

        // Realtime subscription
        const channel = supabase.channel(`community-${courseId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'academy_community_posts' }, fetchPosts)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'academy_community_comments' }, fetchPosts)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [courseId]);

    const handlePost = async () => {
        if (!newPost.trim() || !user || !enrollment) return;
        setPosting(true);
        await supabase.from('academy_community_posts').insert({
            user_id: user.id, course_id: courseId, body: newPost.trim()
        });
        setNewPost('');
        setPosting(false);
        await fetchPosts();
    };

    const handleLike = async (postId: string, currentLikes: number) => {
        await supabase.from('academy_community_posts').update({ likes: currentLikes + 1 }).eq('id', postId);
        await fetchPosts();
    };

    const handleDelete = async (postId: string) => {
        if (!confirm('حذف هذا المنشور؟')) return;
        await supabase.from('academy_community_posts').delete().eq('id', postId);
        await fetchPosts();
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );

    const isOwner = user?.email === 'jumpleadsjl@gmail.com' || user?.user_metadata?.role === 'owner';

    return (
        <div className="min-h-screen bg-black text-white" dir="rtl">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-20">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
                    <Link href={`/academy/${courseId}`} className="text-gray-500 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                    <div>
                        <p className="text-xs text-gray-500 font-medium">المجتمع</p>
                        <h1 className="text-white font-black text-sm">{course?.title_ar}</h1>
                    </div>
                    <div className="mr-auto flex items-center gap-1 text-gray-600 text-xs">
                        <Users className="w-3.5 h-3.5" />
                        <span>{posts.length} منشور</span>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                {/* New Post */}
                {enrollment ? (
                    <div className="bg-white/[0.02] border border-white/10 rounded-[1.5rem] p-5 space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-sm shrink-0">
                                {user?.email?.[0]?.toUpperCase() || '?'}
                            </div>
                            <textarea
                                value={newPost}
                                onChange={e => setNewPost(e.target.value)}
                                onKeyDown={e => e.ctrlKey && e.key === 'Enter' && handlePost()}
                                placeholder="شارك المجتمع بسؤال أو فكرة أو إنجاز..."
                                className="flex-1 bg-transparent text-white text-sm outline-none resize-none min-h-[80px] placeholder-gray-700 text-right"
                            />
                        </div>
                        <div className="flex items-center justify-between border-t border-white/5 pt-3">
                            <span className="text-gray-700 text-xs">Ctrl+Enter للنشر</span>
                            <button
                                onClick={handlePost}
                                disabled={!newPost.trim() || posting}
                                className="flex items-center gap-2 bg-white text-black font-bold px-5 py-2 rounded-xl text-sm hover:bg-gray-200 transition-all disabled:opacity-40"
                            >
                                <Send className="w-4 h-4" /> نشر
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8 border border-white/10 rounded-[1.5rem] text-gray-600">
                        <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">اشترك في الكورس للانضمام للمجتمع</p>
                        <Link href={`/academy/${courseId}`} className="text-purple-400 text-sm hover:underline">← تفاصيل الكورس</Link>
                    </div>
                )}

                {/* Posts Feed */}
                <div className="space-y-4">
                    {posts.map(post => (
                        <PostCard
                            key={post.id}
                            post={post}
                            user={user}
                            isOwner={isOwner}
                            courseId={courseId}
                            onLike={() => handleLike(post.id, post.likes)}
                            onDelete={() => handleDelete(post.id)}
                            onRefresh={fetchPosts}
                            supabase={supabase}
                        />
                    ))}
                    {posts.length === 0 && (
                        <div className="text-center py-16 text-gray-700">
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>لا توجد منشورات بعد. كن أول من ينشر!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function PostCard({ post, user, isOwner, courseId, onLike, onDelete, onRefresh, supabase }: {
    post: Post; user: any; isOwner: boolean; courseId: string;
    onLike: () => void; onDelete: () => void; onRefresh: () => void; supabase: any;
}) {
    const [commentText, setCommentText] = useState('');
    const [commenting, setCommenting] = useState(false);

    const handleAddComment = async () => {
        if (!commentText.trim() || !user) return;
        setCommenting(true);
        await supabase.from('academy_community_comments').insert({
            post_id: post.id, user_id: user.id, body: commentText.trim()
        });
        setCommentText('');
        setCommenting(false);
        onRefresh();
    };

    const handleDeleteComment = async (commentId: string) => {
        await supabase.from('academy_community_comments').delete().eq('id', commentId);
        onRefresh();
    };

    const comments = (post.academy_community_comments || []).sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return (
        <div className="bg-white/[0.02] border border-white/10 rounded-[1.5rem] p-5 space-y-4">
            {/* Author */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-sm">
                        {post.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">{post.profiles?.full_name || 'طالب'}</p>
                        <p className="text-gray-600 text-xs">{new Date(post.created_at).toLocaleString('ar-OM')}</p>
                    </div>
                </div>
                {(isOwner || post.user_id === user?.id) && (
                    <button onClick={onDelete} className="text-gray-700 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Body */}
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{post.body}</p>

            {/* Actions */}
            <div className="flex items-center gap-4 border-t border-white/5 pt-3">
                <button onClick={onLike} className="flex items-center gap-1.5 text-gray-600 hover:text-red-400 transition-colors text-xs">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                </button>
                <span className="flex items-center gap-1.5 text-gray-600 text-xs">
                    <MessageSquare className="w-4 h-4" />
                    <span>{comments.length} تعليق</span>
                </span>
            </div>

            {/* Comments */}
            {comments.length > 0 && (
                <div className="space-y-3 border-t border-white/5 pt-3">
                    {comments.map(comment => (
                        <div key={comment.id} className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                                {comment.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1 bg-white/[0.02] rounded-xl px-3 py-2">
                                <p className="text-gray-500 text-[10px] font-bold mb-0.5">{comment.profiles?.full_name || 'طالب'}</p>
                                <p className="text-gray-300 text-xs leading-relaxed">{comment.body}</p>
                            </div>
                            {(isOwner || comment.user_id === user?.id) && (
                                <button onClick={() => handleDeleteComment(comment.id)} className="text-gray-800 hover:text-red-400 transition-colors mt-1">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add comment */}
            {user && (
                <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                    <input
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                        placeholder="أضف تعليقاً..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-white/20 transition-colors text-right"
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={!commentText.trim() || commenting}
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors disabled:opacity-40"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
