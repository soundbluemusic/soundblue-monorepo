import type { MetaFunction } from 'react-router';
import { NavigationLayout } from '~/components/layout';
import m from '~/lib/messages';
export const meta: MetaFunction = () => [
  { title: 'Sound Blue | SoundBlueMusic' },
  {
    name: 'description',
    content:
      '한국 인디 아티스트 및 음악 프로듀서. 오리지널 BGM, 사운드트랙, 인스트루멘탈 음악 제작.',
  },
];

export default function HomeKo() {
  

  return (
    <NavigationLayout>
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="animate-slide-up text-center max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-content mb-4">{m['home.title']()}</h1>
          <p className="text-xl md:text-2xl text-content-muted mb-6">{m['home.tagline']()}</p>
          <p className="text-base text-(--color-text-tertiary) mb-8">{m['home.genres']()}</p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.youtube.com/@SoundBlueMusic"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link social-youtube"
            >
              <YoutubeIcon />
              <span>{m['home.cta']()}</span>
            </a>
            <a
              href="https://soundblue.music"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link social-discography"
            >
              <MusicIcon />
              <span>{m['home.discography']()}</span>
            </a>
          </div>
        </div>
      </div>
    </NavigationLayout>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function MusicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}
