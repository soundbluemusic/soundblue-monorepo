import { createFileRoute, useRouterState } from '@tanstack/react-router';
import { Layout } from '~/components/Layout';
import { getLocaleFromPath, getContent } from '~/content';

export const Route = createFileRoute('/ja/tools')({
  head: () => ({
    meta: [
      { title: 'Tools | SoundBlue Projects' },
      { name: 'description', content: 'Free web tools for all creators' },
    ],
  }),
  component: Tools,
});

function Tools() {
  const { location } = useRouterState();
  const locale = getLocaleFromPath(location.pathname);
  const t = getContent(locale);

  return (
    <Layout>
      <div className="prose">
        <p><strong>{t.tools.intro}</strong></p>
        <p>{t.tools.subIntro}</p>
        <p>🌐 <strong>Website</strong>: <a href="https://tools.soundbluemusic.com">tools.soundbluemusic.com</a></p>

        <hr />

        <h2>{t.tools.coreValues}</h2>
        <table>
          <thead>
            <tr>
              <th>Value</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>🆓 <strong>Free</strong></td>
              <td>{locale === 'ko' ? '완전히 무료로 사용' : locale === 'ja' ? '完全無料で使用' : 'Completely free to use'}</td>
            </tr>
            <tr>
              <td>🚫 <strong>No Sign-up</strong></td>
              <td>{locale === 'ko' ? '계정 불필요' : locale === 'ja' ? 'アカウント不要' : 'No account required'}</td>
            </tr>
            <tr>
              <td>🚫 <strong>No Ads</strong></td>
              <td>{locale === 'ko' ? '광고 없음' : locale === 'ja' ? '広告なし' : 'No advertisements, ever'}</td>
            </tr>
            <tr>
              <td>🔒 <strong>Private</strong></td>
              <td>{locale === 'ko' ? '데이터는 기기에만 저장' : locale === 'ja' ? 'データはデバイスにのみ保存' : 'Your data stays on your device'}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h2>{t.tools.availableTools}</h2>

        <h3>{t.tools.musicTools} 🎵</h3>
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Metronome</strong></td>
              <td>{locale === 'ko' ? 'BPM 조절, 박자, 펜듈럼 시각화' : locale === 'ja' ? 'BPM制御、拍子、振り子の視覚化' : 'BPM control, time signature, pendulum visualization'}</td>
            </tr>
            <tr>
              <td><strong>Drum Machine</strong></td>
              <td>{locale === 'ko' ? '다양한 사운드가 있는 드럼 패턴 시퀀서' : locale === 'ja' ? '複数のサウンドを持つドラムパターンシーケンサー' : 'Drum pattern sequencer with multiple sounds'}</td>
            </tr>
          </tbody>
        </table>

        <h3>{t.tools.utilityTools} 🛠️</h3>
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>QR Generator</strong></td>
              <td>{locale === 'ko' ? 'QR 코드 즉시 생성' : locale === 'ja' ? 'QRコードを即座に作成' : 'Create QR codes instantly'}</td>
            </tr>
            <tr>
              <td><strong>Translator</strong></td>
              <td>{locale === 'ko' ? '한영 양방향 번역' : locale === 'ja' ? '韓英双方向翻訳' : 'Korean ↔ English bidirectional translation'}</td>
            </tr>
          </tbody>
        </table>

        <h3>{t.tools.visualTools} 🎨</h3>
        <table>
          <thead>
            <tr>
              <th>Tool</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Color Harmony</strong></td>
              <td>{locale === 'ko' ? '색상환 및 하모니 생성기' : locale === 'ja' ? 'カラーホイールとハーモニージェネレーター' : 'Color wheel and harmony generator'}</td>
            </tr>
            <tr>
              <td><strong>Color Palette</strong></td>
              <td>{locale === 'ko' ? '커스텀 색상 조합' : locale === 'ja' ? 'カスタムカラーコンビネーション' : 'Custom color combinations'}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        <h2>{t.tools.features}</h2>
        <ul>
          <li><strong>Bilingual</strong> — {locale === 'ko' ? '영어와 한국어 인터페이스' : locale === 'ja' ? '英語と韓国語のインターフェース' : 'English and Korean interface'}</li>
          <li><strong>PWA</strong> — {locale === 'ko' ? '앱으로 설치 가능' : locale === 'ja' ? 'アプリとしてインストール' : 'Install as an app'}</li>
          <li><strong>Offline</strong> — {locale === 'ko' ? '인터넷 없이 작동' : locale === 'ja' ? 'インターネットなしで動作' : 'Works without internet'}</li>
          <li><strong>Responsive</strong> — {locale === 'ko' ? '모든 기기에서 작동' : locale === 'ja' ? 'どのデバイスでも動作' : 'Works on any device'}</li>
        </ul>

        <hr />

        <h2>{t.tools.howItWorks}</h2>
        <ol>
          <li>{locale === 'ko' ? 'tools.soundbluemusic.com 방문' : locale === 'ja' ? 'tools.soundbluemusic.comにアクセス' : 'Visit tools.soundbluemusic.com'}</li>
          <li>{locale === 'ko' ? '사이드바에서 도구 선택' : locale === 'ja' ? 'サイドバーからツールを選択' : 'Choose a tool from the sidebar'}</li>
          <li>{locale === 'ko' ? '바로 사용 시작 — 설정 불필요' : locale === 'ja' ? '使い始める — セットアップ不要' : 'Start using — no setup required'}</li>
        </ol>
        <p>{locale === 'ko' ? '모든 것이 브라우저에서 실행됩니다. 서버, 계정, 추적 없음.' : locale === 'ja' ? 'すべてがブラウザで実行されます。サーバー、アカウント、追跡なし。' : 'Everything runs in your browser. No server, no account, no tracking.'}</p>

        <hr />

        <h2>{t.tools.links}</h2>
        <table>
          <thead>
            <tr>
              <th>Platform</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tools</td>
              <td><a href="https://tools.soundbluemusic.com">tools.soundbluemusic.com</a></td>
            </tr>
            <tr>
              <td>GitHub</td>
              <td><a href="https://github.com/soundbluemusic/soundblue-monorepo/tree/main/apps/tools">soundblue-monorepo/apps/tools</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
