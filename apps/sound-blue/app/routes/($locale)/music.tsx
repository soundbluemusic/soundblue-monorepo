import { useState } from 'react';
import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import { YouTubeEmbed, YouTubeThumbnail } from '~/components/media/YouTubeEmbed';
import { FEATURED_VIDEO, MUSIC_CATEGORIES, type MusicVideo } from '~/data/music-catalog';
import m from '~/lib/messages';
import { getSeoMeta } from '~/lib/seo';

export const meta: MetaFunction = ({ location }) => [
  { title: m['seo.pages.music.title']() },
  { name: 'description', content: m['seo.pages.music.description']() },
  ...getSeoMeta(location),
];

export default function Music() {
  const [selectedVideo, setSelectedVideo] = useState<MusicVideo | null>(null);

  // Get locale from messages (uses internal locale detection)
  const locale = (m['nav.home']() === '홈' ? 'ko' : 'en') as 'ko' | 'en';

  const handleVideoSelect = (video: MusicVideo) => {
    setSelectedVideo(video);
    // Scroll to top to show the player
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentVideo = selectedVideo || FEATURED_VIDEO;
  const hasCategories = MUSIC_CATEGORIES.some((cat) => cat.videos.length > 0);

  return (
    <NavigationLayout>
      <div className="mx-auto max-w-4xl p-6">
        {/* Page Header */}
        <h1 className="mb-2 text-3xl font-bold text-content">{m['music.title']()}</h1>
        <p className="mb-8 text-content-muted">{m['music.description']()}</p>

        {/* Main Video Player */}
        <section className="mb-8">
          <div className="mb-4">
            <YouTubeEmbed url={currentVideo.url} title={currentVideo.title[locale]} />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold text-content">{currentVideo.title[locale]}</h2>
            {currentVideo.releaseDate && (
              <p className="text-sm text-content-muted">{currentVideo.releaseDate}</p>
            )}
            {currentVideo.description && (
              <p className="mt-2 text-content-muted">{currentVideo.description[locale]}</p>
            )}
          </div>
        </section>

        {/* Video Categories */}
        {hasCategories ? (
          MUSIC_CATEGORIES.map((category) => {
            if (category.videos.length === 0) return null;

            return (
              <section key={category.id} className="mb-8">
                <h2 className="mb-4 text-xl font-semibold text-content">{category.name[locale]}</h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {category.videos.map((video) => (
                    <div key={video.url} className="flex flex-col gap-2">
                      <YouTubeThumbnail
                        url={video.url}
                        title={video.title[locale]}
                        onClick={() => handleVideoSelect(video)}
                        className={
                          selectedVideo?.url === video.url
                            ? 'ring-2 ring-accent-primary ring-offset-2'
                            : ''
                        }
                      />
                      <p className="line-clamp-2 text-sm text-content">{video.title[locale]}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        ) : (
          /* Empty State - No videos yet */
          <section className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-content-muted">{m['music.emptyState']()}</p>
            <p className="mt-2 text-sm text-content-muted">{m['music.emptyStateHint']()}</p>
            <a
              href="https://youtube.com/@SoundBlueMusic"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-accent-primary hover:underline"
            >
              <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              {m['music.visitYouTube']()}
            </a>
          </section>
        )}

        {/* External Links */}
        <section className="mt-8 flex flex-wrap gap-4">
          <a
            href="https://youtube.com/@SoundBlueMusic"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            <svg className="size-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            {m['externalLinks.youtube']()}
          </a>
          <a
            href="https://soundblue.music"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-white transition-colors hover:opacity-90"
          >
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {m['externalLinks.discography']()}
          </a>
        </section>
      </div>
    </NavigationLayout>
  );
}
