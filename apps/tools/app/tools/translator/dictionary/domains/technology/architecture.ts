// ========================================
// Architecture & Design Patterns - 아키텍처 / 디자인 패턴
// ========================================

export const TECH_ARCHITECTURE_KO_EN: Record<string, string> = {
  // === 아키텍처 (Architecture) ===
  아키텍처: 'architecture',
  모놀리식: 'monolithic',
  마이크로서비스: 'microservices',
  '이벤트 기반': 'event-driven',
  '계층형 아키텍처': 'layered architecture',
  '클린 아키텍처': 'clean architecture',
  '헥사고날 아키텍처': 'hexagonal architecture',
  '어니언 아키텍처': 'onion architecture',
  '이벤트 소싱': 'event sourcing',
  '사가 패턴': 'saga pattern',
  'API 퍼스트': 'API-first',

  // === 디자인 패턴 (Design Patterns) ===
  '디자인 패턴': 'design pattern',
  '생성 패턴': 'creational pattern',
  '구조 패턴': 'structural pattern',
  '행동 패턴': 'behavioral pattern',
  싱글톤: 'singleton',
  팩토리: 'factory',
  '팩토리 메서드': 'factory method',
  '추상 팩토리': 'abstract factory',
  빌더: 'builder',
  프로토타입: 'prototype',
  어댑터: 'adapter',
  브릿지: 'bridge',
  컴포지트: 'composite',
  데코레이터: 'decorator',
  퍼사드: 'facade',
  플라이웨이트: 'flyweight',
  '체인 오브 리스폰서빌리티': 'chain of responsibility',
  커맨드: 'command',
  이터레이터: 'iterator',
  미디에이터: 'mediator',
  메멘토: 'memento',
  옵저버: 'observer',
  스테이트: 'state',
  스트래티지: 'strategy',
  '템플릿 메서드': 'template method',
  비지터: 'visitor',
  '의존성 주입': 'dependency injection',
  '리포지토리 패턴': 'repository pattern',
  '유닛 오브 워크': 'unit of work',
  엔티티: 'entity',
  애그리거트: 'aggregate',

  // === 원칙 (Principles) ===
  '단일 책임 원칙': 'single responsibility principle',
  '개방-폐쇄 원칙': 'open-closed principle',
  '리스코프 치환 원칙': 'Liskov substitution principle',
  '인터페이스 분리 원칙': 'interface segregation principle',
  '의존성 역전 원칙': 'dependency inversion principle',
  '관심사의 분리': 'separation of concerns',
  '느슨한 결합': 'loose coupling',
  '높은 응집도': 'high cohesion',
  '최소 지식 원칙': 'principle of least knowledge',
  '컴포지션 오버 인헤리턴스': 'composition over inheritance',
  폴리모피즘: 'polymorphism',
  캡슐화: 'encapsulation',
  추상화: 'abstraction',
  상속: 'inheritance',
};

export const TECH_ARCHITECTURE_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(TECH_ARCHITECTURE_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
