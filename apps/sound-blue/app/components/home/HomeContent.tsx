import { CSSParticles } from '~/components/background';
import { BRAND, YouTubeIcon } from '~/constants';
import m from '~/lib/messages';
export function HomeContent() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8 text-center overflow-hidden">
      <CSSParticles />

      <div className="relative z-1 mb-8">
        <h1 className="text-3xl md:text-[3rem] font-semibold text-content m-0 mb-4">
          {BRAND.name}
        </h1>
        <p className="text-lg md:text-xl text-content-muted m-0 mb-4 italic">
          {m['home.tagline']()}
        </p>
        <p className="text-base md:text-lg text-content-muted m-0 mb-2 max-w-120 leading-relaxed">
          {m['home.description']()}
        </p>
        <p className="text-sm text-content-muted m-0">{m['home.genres']()}</p>
      </div>

      <div className="relative z-1 flex flex-wrap gap-3 justify-center mt-6">
        <a
          href="https://www.youtube.com/@SoundBlueMusic"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link social-youtube"
          aria-label="YouTube - SoundBlueMusic"
        >
          <YouTubeIcon className="w-5 h-5 shrink-0" />
          <span>{m['home.cta']()}</span>
        </a>
        <a
          href="https://soundblue.music"
          target="_blank"
          rel="noopener noreferrer"
          className="social-link social-discography"
          aria-label="Discography - Sound Blue"
        >
          <svg
            className="w-5 h-5 shrink-0"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 5.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
          </svg>
          <span>{m['home.discography']()}</span>
        </a>
      </div>
    </div>
  );
}

export default HomeContent;
