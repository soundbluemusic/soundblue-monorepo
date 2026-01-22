import { createFileRoute, useRouterState } from '@tanstack/react-router';
import { Layout } from '~/components/Layout';
import { getLocaleFromPath, getContent } from '~/content';

export const Route = createFileRoute('/ko/sound-blue')({
  head: () => ({
    meta: [
      { title: 'Sound Blue | SoundBlue Projects' },
      { name: 'description', content: 'Official website of indie artist Sound Blue' },
    ],
  }),
  component: SoundBlue,
});

function SoundBlue() {
  const { location } = useRouterState();
  const locale = getLocaleFromPath(location.pathname);
  const t = getContent(locale);

  return (
    <Layout>
      <div className="prose">
        <blockquote>
          <em>{t.soundBlue.quote}</em>
        </blockquote>

        <p><strong>Sound Blue</strong> {t.soundBlue.intro}</p>
        <p>🌐 <strong>Website</strong>: <a href="https://soundbluemusic.com">soundbluemusic.com</a></p>

        <hr />

        <h2>{t.soundBlue.whatsOnSite}</h2>
        <table>
          <thead>
            <tr>
              <th>Section</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>🎧 Music & Albums</td>
              <td>{locale === 'ko' ? '오리지널 음악과 앨범 감상' : locale === 'ja' ? 'オリジナル音楽とアルバムを聴く' : 'Listen to original music and albums'}</td>
            </tr>
            <tr>
              <td>📰 News & Blog</td>
              <td>{locale === 'ko' ? '최신 소식과 이야기' : locale === 'ja' ? '最新ニュースとストーリー' : 'Latest updates and stories'}</td>
            </tr>
            <tr>
              <td>🤖 AI Chat Assistant</td>
              <td>{locale === 'ko' ? 'Sound Blue에 대해 질문하기' : locale === 'ja' ? 'Sound Blueについて質問する' : 'Ask questions about Sound Blue'}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h2>{t.soundBlue.features}</h2>
        <ul>
          <li><strong>Bilingual</strong> — {locale === 'ko' ? '영어와 한국어로 이용 가능' : locale === 'ja' ? '英語と韓国語で利用可能' : 'Available in English and Korean'}</li>
          <li><strong>PWA</strong> — {locale === 'ko' ? '기기에 앱으로 설치 가능' : locale === 'ja' ? 'デバイスにアプリとしてインストール' : 'Install as an app on your device'}</li>
          <li><strong>Accessible</strong> — {locale === 'ko' ? 'WCAG 준수 디자인' : locale === 'ja' ? 'WCAGに準拠したデザイン' : 'WCAG compliant design'}</li>
          <li><strong>Fast</strong> — {locale === 'ko' ? '즉시 로딩되는 정적 사이트' : locale === 'ja' ? '即時ロードの静的サイト' : 'Static site with instant loading'}</li>
        </ul>

        <hr />

        <h2>{t.soundBlue.languages}</h2>
        <p>{locale === 'ko' ? '사이트가 자동으로 언어 설정을 감지합니다:' : locale === 'ja' ? 'サイトは自動的に言語設定を検出します：' : 'The site automatically detects your language preference:'}</p>
        <ul>
          <li>English: <a href="https://soundbluemusic.com">soundbluemusic.com</a></li>
          <li>Korean: <a href="https://soundbluemusic.com/ko/">soundbluemusic.com/ko/</a></li>
        </ul>

        <hr />

        <h2>{t.soundBlue.aiChat}</h2>
        <p>{locale === 'ko' ? '질문이 있으신가요? 내장된 채팅 어시스턴트가 도와드립니다:' : locale === 'ja' ? '質問がありますか？内蔵チャットアシスタントがお手伝いします：' : 'Have a question? The built-in chat assistant can help with:'}</p>
        <ul>
          <li>{locale === 'ko' ? 'Sound Blue는 누구인가요?' : locale === 'ja' ? 'Sound Blueとは誰ですか？' : 'Who is Sound Blue?'}</li>
          <li>{locale === 'ko' ? '음악과 장르 정보' : locale === 'ja' ? '音楽とジャンル情報' : 'Music and genre information'}</li>
          <li>{locale === 'ko' ? '라이선스 및 저작권 질문' : locale === 'ja' ? 'ライセンスと著作権の質問' : 'License and copyright questions'}</li>
          <li>{locale === 'ko' ? '연락처 및 소셜 링크' : locale === 'ja' ? '連絡先とソーシャルリンク' : 'Contact and social links'}</li>
        </ul>

        <hr />

        <h2>{t.soundBlue.links}</h2>
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
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
