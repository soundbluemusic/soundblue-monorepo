// ========================================
// Monitoring & Logging - 모니터링 / 로깅
// ========================================

export const TECH_MONITORING_KO_EN: Record<string, string> = {
  // === 기본 개념 (Basic Concepts) ===
  모니터링: 'monitoring',
  옵저버빌리티: 'observability',
  로깅: 'logging',
  로그: 'log',
  '로그 레벨': 'log level',

  // === 로그 레벨 (Log Levels) ===
  디버그: 'debug',
  인포: 'info',
  워닝: 'warning',
  크리티컬: 'critical',
  페이탈: 'fatal',

  // === 트레이싱 (Tracing) ===
  트레이싱: 'tracing',
  '분산 트레이싱': 'distributed tracing',
  스팬: 'span',
  '트레이스 ID': 'trace ID',

  // === 메트릭 (Metrics) ===
  메트릭: 'metrics',
  게이지: 'gauge',
  카운터: 'counter',
  히스토그램: 'histogram',

  // === 알림/운영 (Alerting/Operations) ===
  대시보드: 'dashboard',
  알림: 'alert',
  인시던트: 'incident',
  온콜: 'on-call',

  // === 모니터링 도구 (Monitoring Tools) ===
  그라파나: 'Grafana',
  프로메테우스: 'Prometheus',
  데이터독: 'Datadog',
  뉴렐릭: 'New Relic',
  센트리: 'Sentry',
  스플렁크: 'Splunk',
  'ELK 스택': 'ELK Stack',
  엘라스틱서치: 'Elasticsearch',
  로그스태시: 'Logstash',
  키바나: 'Kibana',
  재거: 'Jaeger',
  집킨: 'Zipkin',
  오픈텔레메트리: 'OpenTelemetry',

  // === 모니터링 유형 (Monitoring Types) ===
  APM: 'Application Performance Monitoring',
  RUM: 'Real User Monitoring',
  '신세틱 모니터링': 'synthetic monitoring',
  업타임: 'uptime',

  // === SLA/SLO (Service Level) ===
  SLA: 'Service Level Agreement',
  SLO: 'Service Level Objective',
  SLI: 'Service Level Indicator',
  MTTR: 'Mean Time to Recovery',
  MTTF: 'Mean Time to Failure',
  MTBF: 'Mean Time Between Failures',
};

export const TECH_MONITORING_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(TECH_MONITORING_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
