import { createFileRoute, useRouterState } from '@tanstack/react-router';
import { Layout } from '~/components/Layout';
import { getLocaleFromPath, getContent } from '~/content';

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { title: 'About | SoundBlue Projects' },
      { name: 'description', content: 'Music and creative projects by Sound Blue' },
    ],
  }),
  component: About,
});

function About() {
  const { location } = useRouterState();
  const locale = getLocaleFromPath(location.pathname);
  const t = getContent(locale);

  return (
    <Layout>
      <div className="prose">
        <h2>SoundBlueMusic</h2>

        <blockquote>
          <em>{t.about.quote}</em>
        </blockquote>

        <p>{locale === 'ko' ? '하지만 그게 전부가 아닙니다.' : locale === 'ja' ? 'でもそれだけではありません。' : "But that's not all."}</p>
        <p>{t.about.intro}</p>

        <hr />

        <h2>{t.about.whatWeDo}</h2>
        <table>
          <thead>
            <tr>
              <th>Area</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>🎵 <strong>Music</strong></td>
              <td>{locale === 'ko' ? '오리지널 곡, 앨범, 프로덕션' : locale === 'ja' ? 'オリジナル曲、アルバム、制作' : 'Original songs, albums, and productions'}</td>
            </tr>
            <tr>
              <td>🛠️ <strong>Web Tools</strong></td>
              <td>{locale === 'ko' ? '뮤지션과 크리에이터를 위한 무료 도구' : locale === 'ja' ? 'ミュージシャンとクリエイターのための無料ツール' : 'Free tools for musicians and creators'}</td>
            </tr>
            <tr>
              <td>💬 <strong>Apps</strong></td>
              <td>{locale === 'ko' ? '오프라인 우선, 프라이버시 중심 앱' : locale === 'ja' ? 'オフラインファースト、プライバシー重視のアプリ' : 'Offline-first, privacy-focused applications'}</td>
            </tr>
            <tr>
              <td>🌐 <strong>Open Source</strong></td>
              <td>{locale === 'ko' ? 'GitHub에 공개된 코드' : locale === 'ja' ? 'GitHubで公開されているコード' : 'Code shared publicly on GitHub'}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h2>{t.about.philosophy}</h2>

        <h3>{locale === 'ko' ? '모두에게 무료' : locale === 'ja' ? '誰でも無料' : 'Free for Everyone'}</h3>
        <p>{locale === 'ko' ? '모든 도구와 앱은 완전히 무료입니다:' : locale === 'ja' ? 'すべてのツールとアプリは完全に無料です：' : 'All tools and apps are completely free:'}</p>
        <ul>
          <li>{locale === 'ko' ? '가입 불필요' : locale === 'ja' ? '登録不要' : 'No sign-up required'}</li>
          <li>{locale === 'ko' ? '광고 없음' : locale === 'ja' ? '広告なし' : 'No advertisements'}</li>
          <li>{locale === 'ko' ? '유료 기능 없음' : locale === 'ja' ? '有料機能なし' : 'No paywalls'}</li>
          <li>{locale === 'ko' ? '데이터 수집 없음' : locale === 'ja' ? 'データ収集なし' : 'No data collection'}</li>
        </ul>

        <h3>{locale === 'ko' ? '접근성' : locale === 'ja' ? 'アクセシビリティ' : 'Accessible'}</h3>
        <p>{locale === 'ko' ? '우리가 만드는 모든 것은:' : locale === 'ja' ? '私たちが作るすべてのものは：' : 'Everything we build is:'}</p>
        <ul>
          <li>{locale === 'ko' ? '여러 언어로 이용 가능 (EN/KO)' : locale === 'ja' ? '複数の言語で利用可能（EN/KO）' : 'Available in multiple languages (EN/KO)'}</li>
          <li>{locale === 'ko' ? '장애가 있는 사용자도 접근 가능 (WCAG)' : locale === 'ja' ? '障害のあるユーザーもアクセス可能（WCAG）' : 'Accessible to users with disabilities (WCAG)'}</li>
          <li>{locale === 'ko' ? '가능한 오프라인 작동 (PWA)' : locale === 'ja' ? '可能な限りオフラインで動作（PWA）' : 'Works offline when possible (PWA)'}</li>
        </ul>

        <h3>{locale === 'ko' ? '오픈 소스' : locale === 'ja' ? 'オープンソース' : 'Open Source'}</h3>
        <p>{locale === 'ko' ? '코드는 공개되어 있지만, 콘텐츠는 저작권이 있습니다.' : locale === 'ja' ? 'コードは公開されていますが、コンテンツは著作権で保護されています。' : 'The code is public, but the content is copyrighted.'}</p>

        <hr />

        <h2>{t.about.projects}</h2>
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><a href="https://soundbluemusic.com">Sound Blue</a></td>
              <td>{locale === 'ko' ? '공식 아티스트 웹사이트' : locale === 'ja' ? '公式アーティストウェブサイト' : 'Official artist website'}</td>
            </tr>
            <tr>
              <td><a href="https://tools.soundbluemusic.com">Tools</a></td>
              <td>{locale === 'ko' ? '크리에이터를 위한 무료 웹 도구' : locale === 'ja' ? 'クリエイターのための無料ウェブツール' : 'Free web tools for creators'}</td>
            </tr>
            <tr>
              <td><a href="https://dialogue.soundbluemusic.com">Dialogue</a></td>
              <td>{locale === 'ko' ? '오프라인 Q&A 도구' : locale === 'ja' ? 'オフラインQ&Aツール' : 'Offline Q&A tool'}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h2>{t.about.connect}</h2>
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Website</td>
              <td><a href="https://soundbluemusic.com">soundbluemusic.com</a></td>
            </tr>
            <tr>
              <td>YouTube</td>
              <td><a href="https://www.youtube.com/@SoundBlueMusic">@SoundBlueMusic</a></td>
            </tr>
            <tr>
              <td>GitHub</td>
              <td><a href="https://github.com/soundbluemusic">soundbluemusic</a></td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h2>{t.about.copyright}</h2>
        <p>{locale === 'ko' ? 'SoundBlueMusic이 만든 모든 콘텐츠는 저작권이 있습니다.' : locale === 'ja' ? 'SoundBlueMusicが作成したすべてのコンテンツは著作権で保護されています。' : 'All content created by SoundBlueMusic is copyrighted.'}</p>
        <p>{locale === 'ko' ? '소스 코드는 오픈 소스이며 GitHub에서 사용할 수 있지만:' : locale === 'ja' ? 'ソースコードはオープンソースでGitHubで利用可能ですが：' : 'The source code is open source and available on GitHub, but:'}</p>
        <ul>
          <li><strong>Code</strong>: Open source (MIT License)</li>
          <li><strong>Content</strong>: All rights reserved</li>
        </ul>
        <p>{locale === 'ko' ? '이것은 음악, 아트워크, 텍스트 및 기타 모든 창작 콘텐츠를 포함합니다.' : locale === 'ja' ? 'これには音楽、アートワーク、テキスト、その他すべてのクリエイティブコンテンツが含まれます。' : 'This includes music, artwork, text, and any other creative content.'}</p>
      </div>
    </Layout>
  );
}
