// ========================================
// Database - 데이터베이스
// ========================================

export const TECH_DATABASE_KO_EN: Record<string, string> = {
  // === 관계형 데이터베이스 (Relational Database) ===
  '관계형 데이터베이스': 'relational database',
  오라클: 'Oracle',

  // === NoSQL 데이터베이스 (NoSQL Database) ===
  몽고DB: 'MongoDB',
  카산드라: 'Cassandra',
  카우치DB: 'CouchDB',
  파이어베이스: 'Firebase',
  파이어스토어: 'Firestore',
  수파베이스: 'Supabase',

  // === 키-값 저장소 (Key-Value Store) ===
  레디스: 'Redis',
  멤캐시드: 'Memcached',
  발키: 'Valkey',

  // === 그래프 데이터베이스 (Graph Database) ===
  네오포제이: 'Neo4j',
  넵튠: 'Neptune',

  // === 시계열 데이터베이스 (Time Series Database) ===
  인플럭스DB: 'InfluxDB',
  타임스케일: 'TimescaleDB',
  프로메테우스: 'Prometheus',

  // === 벡터 데이터베이스 (Vector Database) ===
  파인콘: 'Pinecone',
  밀버스: 'Milvus',
  위비에이트: 'Weaviate',
  크로마: 'Chroma',
  큐드런트: 'Qdrant',

  // === 검색 엔진 (Search Engine) ===
  엘라스틱서치: 'Elasticsearch',
  알골리아: 'Algolia',
  밀리서치: 'Meilisearch',
  타입센스: 'Typesense',

  // === 데이터베이스 용어 (Database Terms) ===
  테이블: 'table',
  행: 'row',
  열: 'column',
  레코드: 'record',
  필드: 'field',
  기본키: 'primary key',
  외래키: 'foreign key',
  인덱스: 'index',
  '복합 인덱스': 'composite index',
  '유니크 제약': 'unique constraint',
  널: 'null',
  스키마: 'schema',
  정규화: 'normalization',
  비정규화: 'denormalization',
  제1정규형: 'first normal form',
  제2정규형: 'second normal form',
  제3정규형: 'third normal form',
  조인: 'join',
  '내부 조인': 'inner join',
  '외부 조인': 'outer join',
  '왼쪽 조인': 'left join',
  '오른쪽 조인': 'right join',
  '크로스 조인': 'cross join',
  서브쿼리: 'subquery',
  뷰: 'view',
  트리거: 'trigger',
  '저장 프로시저': 'stored procedure',
  트랜잭션: 'transaction',
  커밋: 'commit',
  롤백: 'rollback',
  원자성: 'atomicity',
  일관성: 'consistency',
  격리성: 'isolation',
  지속성: 'durability',
  잠금: 'lock',
  '교착 상태': 'deadlock',
  샤딩: 'sharding',
  파티셔닝: 'partitioning',
  복제: 'replication',
  마스터: 'master',
  슬레이브: 'slave',
  클러스터링: 'clustering',
  쿼리: 'query',
  '쿼리 최적화': 'query optimization',
  '실행 계획': 'execution plan',
  '풀 테이블 스캔': 'full table scan',
};

export const TECH_DATABASE_EN_KO: Record<string, string> = Object.fromEntries(
  Object.entries(TECH_DATABASE_KO_EN).map(([ko, en]) => [en.toLowerCase(), ko]),
);
