'use client';

import { Play, X } from 'lucide-react';
import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

interface Video {
  id: string;
  title: string;
  short_description: string | null;
  video_url: string;
  order_index: number;
  is_active: boolean;
}

const defaultVideos: Video[] = [];

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:.*\/)?(\d+)/);
  return match ? match[1] : null;
}

function getThumbnailUrl(videoUrl: string): string {
  const videoId = getYouTubeId(videoUrl);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  const vimeoId = getVimeoId(videoUrl);
  if (vimeoId) {
    return `https://vumbnail.com/${vimeoId}.jpg`;
  }
  return '';
}

function getEmbedUrl(videoUrl: string): string {
  const youtubeId = getYouTubeId(videoUrl);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }
  
  const vimeoId = getVimeoId(videoUrl);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}`;
  }
  
  return videoUrl;
}

const VideoCard = memo(function VideoCard({ 
  video, 
  onPlay 
}: { 
  video: Video; 
  onPlay: () => void;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const thumbnailUrl = getThumbnailUrl(video.video_url);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="group relative aspect-video rounded-[2rem] overflow-hidden bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all cursor-pointer"
      onClick={onPlay}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
          <Play className="w-8 h-8 text-white ml-1" fill="white" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 pointer-events-none">
        <h3 className="text-xl font-bold text-white mb-2">{video.title}</h3>
        {video.short_description && (
          <p className="text-gray-400 text-sm">{video.short_description}</p>
        )}
      </div>
      
      {isInView && thumbnailUrl && !imageError ? (
        <img
          ref={imgRef}
          src={thumbnailUrl}
          alt={video.title}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : imageError ? (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <Play className="w-12 h-12 text-gray-600" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
    </div>
  );
});

const VideoPlayer = memo(function VideoPlayer({ 
  videoUrl, 
  onClose 
}: { 
  videoUrl: string; 
  onClose: () => void;
}) {
  const embedUrl = getEmbedUrl(videoUrl);
  const isDirectVideo = videoUrl.match(/\.(mp4|webm|ogg)$/i);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-6xl aspect-video rounded-[2rem] overflow-hidden bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {isDirectVideo ? (
          <video
            src={embedUrl}
            controls
            autoPlay
            className="w-full h-full"
          />
        ) : (
          <iframe
            src={`${embedUrl}?autoplay=1&rel=0`}
            className="w-full h-full"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            title="Video Player"
          />
        )}
      </div>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Close"
      >
        <X className="w-6 h-6 text-white" />
      </button>
    </div>
  );
});

export default function VideoHub() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
          .from('home_videos')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) {
          console.error('Error fetching videos:', error);
          setVideos(defaultVideos);
        } else if (data && data.length > 0) {
          setVideos(data as Video[]);
        } else {
          setVideos(defaultVideos);
        }
      } catch (error) {
        console.error('Error in fetch:', error);
        setVideos(defaultVideos);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const validVideos = videos.filter(v => v && v.id && v.video_url);

  const handlePlay = useCallback((videoId: string) => {
    setPlayingVideo(videoId);
  }, []);

  const handleClose = useCallback(() => {
    setPlayingVideo(null);
  }, []);

  if (isLoading) {
    return null;
  }

  if (validVideos.length === 0) {
    return null;
  }

  const currentVideo = validVideos.find(v => v.id === playingVideo);

  return (
    <section className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">مركز الفيديو</h2>
          <p className="text-gray-400 text-lg">
            شاهد أهم المقاطع التوضيحية عن خدماتنا
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {validVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPlay={() => handlePlay(video.id)}
            />
          ))}
        </div>

        {currentVideo && (
          <VideoPlayer
            videoUrl={currentVideo.video_url}
            onClose={handleClose}
          />
        )}
      </div>
    </section>
  );
}
