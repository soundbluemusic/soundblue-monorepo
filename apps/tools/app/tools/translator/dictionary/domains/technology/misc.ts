// ========================================
// Miscellaneous Programming Terms - 기타 프로그래밍 용어
// ========================================

export const TECH_MISC_KO_EN: Record<string, string> = {
  // === 코드 관련 (Code Related) ===
  코드: 'code',
  '소스 코드': 'source code',
  코드베이스: 'codebase',
  보일러플레이트: 'boilerplate',
  스캐폴딩: 'scaffolding',
  리팩토링: 'refactoring',
  '코드 스멜': 'code smell',
  '기술 부채': 'technical debt',
  '레거시 코드': 'legacy code',
  '스파게티 코드': 'spaghetti code',
  '클린 코드': 'clean code',

  // === 협업 (Collaboration) ===
  '코드 리뷰': 'code review',
  '페어 프로그래밍': 'pair programming',
  '몹 프로그래밍': 'mob programming',
  '러버덕 디버깅': 'rubber duck debugging',

  // === 코딩 스타일 (Coding Style) ===
  컨벤션: 'convention',
  '코딩 스타일': 'coding style',
  린터: 'linter',
  포매터: 'formatter',
  프리티어: 'Prettier',

  // === 문서화 (Documentation) ===
  주석: 'comment',
  문서화: 'documentation',
  리드미: 'README',
  체인지로그: 'changelog',
  '릴리스 노트': 'release notes',

  // === 버전 관리 (Versioning) ===
  '시맨틱 버저닝': 'semantic versioning',
  '메이저 버전': 'major version',
  '마이너 버전': 'minor version',
  '패치 버전': 'patch version',
  알파: 'alpha',
  베타: 'beta',
  RC: 'Release Candidate',
  GA: 'General Availability',
  LTS: 'Long Term Support',
  EOL: 'End of Life',
  디프리케이트: 'deprecated',
  '브레이킹 체인지': 'breaking change',
  '하위 호환성': 'backward compatibility',
  마이그레이션: 'migration',
  업그레이드: 'upgrade',
  다운그레이드: 'downgrade',

  // === 의존성 (Dependencies) ===
  의존성: 'dependency',
  '피어 디펜던시': 'peer dependency',
  '데브 디펜던시': 'dev dependency',
  '트랜시티브 디펜던시': 'transitive dependency',
  '락 파일': 'lock file',
  '노드 모듈': 'node_modules',
  벤더: 'vendor',

  // === 호환성 (Compatibility) ===
  폴리필: 'polyfill',
  심: 'shim',

  // === 컴파일/빌드 (Compile/Build) ===
  트랜스파일: 'transpile',
  컴파일: 'compile',
  인터프리트: 'interpret',
  런타임: 'runtime',
  빌드타임: 'build time',
  '핫 리로드': 'hot reload',
  '라이브 리로드': 'live reload',
  HMR: 'Hot Module Replacement',
  '워치 모드': 'watch mode',
  '개발 서버': 'dev server',

  // === 환경 (Environments) ===
  프로덕션: 'production',
  스테이징: 'staging',
  '개발 환경': 'development environment',
  '테스트 환경': 'test environment',
  '환경 변수': 'environment variable',
  시크릿: 'secret',
  설정: 'configuration',
  '설정 파일': 'config file',
  dotenv: 'dotenv',
  플래그: 'flag',
  인자: 'argument',
  옵션: 'option',

  // === 확장성 (Extensibility) ===
  플러그인: 'plugin',
  익스텐션: 'extension',
  애드온: 'add-on',
  SDK: 'Software Development Kit',
  라이브러리: 'library',
  프레임워크: 'framework',
  도구: 'tool',
  유틸리티: 'utility',
  헬퍼: 'helper',
  래퍼: 'wrapper',
  미들웨어: 'middleware',
  어댑터: 'adapter',
  드라이버: 'driver',

  // === 클라이언트/서버 (Client/Server) ===
  클라이언트: 'client',
  서버: 'server',
  호스트: 'host',
  포트: 'port',
  엔드포인트: 'endpoint',

  // === 실행 (Execution) ===
  인스턴스: 'instance',
  워커: 'worker',
  스레드: 'thread',
  프로세스: 'process',
  잡: 'job',
  큐: 'queue',

  // === 이벤트/메시징 (Events/Messaging) ===
  메시지: 'message',
  페이로드: 'payload',
  핸들러: 'handler',
  리스너: 'listener',
  옵저버: 'observer',
  퍼블리셔: 'publisher',
  서브스크라이버: 'subscriber',
  브로커: 'broker',
  버스: 'bus',
  '펍/섭': 'Pub/Sub',
  '메시지 큐': 'message queue',
  레빗MQ: 'RabbitMQ',
  액티브MQ: 'ActiveMQ',
  SQS: 'Simple Queue Service',
  스트림: 'stream',

  // === 스케줄링 (Scheduling) ===
  배치: 'batch',
  크론: 'cron',
  스케줄러: 'scheduler',
  데몬: 'daemon',
  '백그라운드 잡': 'background job',

  // === 통신 (Communication) ===
  웹훅: 'webhook',
  '콜백 URL': 'callback URL',
  리다이렉트: 'redirect',
  포워드: 'forward',
  프록시: 'proxy',
};

export const TECH_MISC_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(TECH_MISC_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
