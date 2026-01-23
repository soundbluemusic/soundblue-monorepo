import { createFileRoute, useRouterState } from '@tanstack/react-router';
import { Layout } from '~/components/Layout';
import { getLocaleFromPath, getContent } from '~/content';

export const Route = createFileRoute('/dialogue')({
  head: () => ({
    meta: [
      { title: 'Dialogue | SoundBlue Projects' },
      { name: 'description', content: 'Q&A tool that works 100% offline' },
    ],
  }),
  component: Dialogue,
});

function Dialogue() {
  const { location } = useRouterState();
  const locale = getLocaleFromPath(location.pathname);
  const t = getContent(locale);

  return (
    <Layout>
      <div className="prose">
        <p><strong>{t.dialogue.intro}</strong></p>
        <p>{t.dialogue.subIntro}</p>
        <p>🌐 <strong>Website</strong>: <a href="https://dialogue.soundbluemusic.com">dialogue.soundbluemusic.com</a></p>

        <hr />

        <h2>{t.dialogue.keyFeatures}</h2>
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>🔌 <strong>Offline</strong></td>
              <td>{locale === 'ko' ? '완전히 인터넷 없이 작동' : locale === 'ja' ? '完全にインターネットなしで動作' : 'Works completely without internet'}</td>
            </tr>
            <tr>
              <td>⚡ <strong>Instant</strong></td>
              <td>{locale === 'ko' ? '지연 없는 즉시 답변' : locale === 'ja' ? '遅延なしの即時回答' : 'Zero latency answers'}</td>
            </tr>
            <tr>
              <td>🌏 <strong>Bilingual</strong></td>
              <td>{locale === 'ko' ? '영어와 한국어 지원' : locale === 'ja' ? '英語と韓国語をサポート' : 'English and Korean supported'}</td>
            </tr>
            <tr>
              <td>📱 <strong>PWA</strong></td>
              <td>{locale === 'ko' ? '앱으로 설치 가능' : locale === 'ja' ? 'アプリとしてインストール' : 'Install as an app'}</td>
            </tr>
            <tr>
              <td>♿ <strong>Accessible</strong></td>
              <td>{locale === 'ko' ? 'WCAG 준수, 키보드 내비게이션' : locale === 'ja' ? 'WCAG準拠、キーボードナビゲーション' : 'WCAG compliant, keyboard navigation'}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h2>{t.dialogue.howItWorks}</h2>
        <p>{locale === 'ko' ? 'Dialogue는 일반적인 Q&A 앱과 다릅니다:' : locale === 'ja' ? 'Dialogueは一般的なQ&Aアプリとは異なります：' : 'Dialogue is different from typical Q&A apps:'}</p>
        <ol>
          <li><strong>{locale === 'ko' ? '모든 데이터가 내장' : locale === 'ja' ? 'すべてのデータが組み込み' : 'All data is embedded'}</strong> — {locale === 'ko' ? '서버 호출 불필요' : locale === 'ja' ? 'サーバー呼び出し不要' : 'No server calls needed'}</li>
          <li><strong>{locale === 'ko' ? '오프라인 작동' : locale === 'ja' ? 'オフラインで動作' : 'Works offline'}</strong> — {locale === 'ko' ? '한번 로드되면 인터넷 선택' : locale === 'ja' ? '一度ロードすれば、インターネットはオプション' : 'Once loaded, internet is optional'}</li>
          <li><strong>{locale === 'ko' ? '프라이버시 우선' : locale === 'ja' ? 'プライバシー優先' : 'Privacy first'}</strong> — {locale === 'ko' ? '기기를 떠나는 데이터 없음' : locale === 'ja' ? 'デバイスを離れるデータなし' : 'Nothing leaves your device'}</li>
        </ol>

        <hr />

        <h2>{t.dialogue.useCases}</h2>
        <ul>
          <li>{locale === 'ko' ? '인터넷 없이 빠른 참조' : locale === 'ja' ? 'インターネットなしでクイックリファレンス' : 'Quick reference without internet'}</li>
          <li>{locale === 'ko' ? '언어 연습을 위한 학습 도구' : locale === 'ja' ? '言語練習のための学習ツール' : 'Learning tool for language practice'}</li>
          <li>{locale === 'ko' ? '오프라인 문서 접근' : locale === 'ja' ? 'オフラインドキュメントアクセス' : 'Offline documentation access'}</li>
        </ul>

        <hr />

        <h2>{t.dialogue.languages}</h2>
        <table>
          <thead>
            <tr>
              <th>Language</th>
              <th>Path</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>English</td>
              <td><a href="https://dialogue.soundbluemusic.com">dialogue.soundbluemusic.com</a></td>
            </tr>
            <tr>
              <td>Korean</td>
              <td><a href="https://dialogue.soundbluemusic.com/ko/">dialogue.soundbluemusic.com/ko/</a></td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h2>{t.dialogue.installAsApp}</h2>
        <p>{locale === 'ko' ? 'Dialogue는 프로그레시브 웹 앱(PWA)입니다:' : locale === 'ja' ? 'DialogueはプログレッシブWebアプリ（PWA）です：' : 'Dialogue is a Progressive Web App (PWA):'}</p>
        <ol>
          <li>{locale === 'ko' ? '기기에서 웹사이트 방문' : locale === 'ja' ? 'デバイスでウェブサイトにアクセス' : 'Visit the website on your device'}</li>
          <li>{locale === 'ko' ? '"설치" 또는 "홈 화면에 추가" 찾기' : locale === 'ja' ? '「インストール」または「ホーム画面に追加」を探す' : 'Look for "Install" or "Add to Home Screen"'}</li>
          <li>{locale === 'ko' ? '네이티브 앱처럼 사용 — 오프라인에서도' : locale === 'ja' ? 'ネイティブアプリのように使用 — オフラインでも' : 'Use like a native app — even offline'}</li>
        </ol>

        <hr />

        <h2>{t.dialogue.links}</h2>
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Dialogue</td>
              <td><a href="https://dialogue.soundbluemusic.com">dialogue.soundbluemusic.com</a></td>
            </tr>
            <tr>
              <td>GitHub</td>
              <td><a href="https://github.com/soundbluemusic/soundblue-monorepo/tree/main/apps/dialogue">soundblue-monorepo/apps/dialogue</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
