// ========================================
// Shared Types for Dialogue App
// ========================================

/**
 * Q&A 아이템 타입
 */
export interface QAItem {
  keywords: string[];
  patterns?: string[];
  answer: string;
  category?: string;
}

/**
 * Q&A 데이터베이스 타입
 */
export interface QADatabase {
  items: QAItem[];
}
