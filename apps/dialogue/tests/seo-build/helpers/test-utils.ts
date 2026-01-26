import fs from 'node:fs';
import path from 'node:path';

/**
 * Build Test Utilities for Dialogue App
 *
 * 빌드 결과물 검증을 위한 공통 유틸리티 함수들
 */

export const BUILD_DIR = path.join(__dirname, '../../../dist/client');

/**
 * 재귀적으로 모든 파일을 찾아 반환
 */
export function getAllFiles(dir: string, ext?: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, ext));
    } else if (!ext || entry.name.endsWith(ext)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 파일 존재 여부 확인
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * 파일 내용 읽기
 */
export function readFile(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

/**
 * XML 파일 기본 검증
 */
export function isValidXML(content: string): boolean {
  return (
    content.includes('<?xml version=') &&
    (content.includes('<urlset') || content.includes('<sitemapindex'))
  );
}

/**
 * 파일 크기 확인
 */
export function getFileSize(filePath: string): number {
  if (!fs.existsSync(filePath)) {
    return 0;
  }
  const stats = fs.statSync(filePath);
  return stats.size;
}

/**
 * 디렉토리 존재 여부 확인
 */
export function directoryExists(dirPath: string): boolean {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/**
 * 빌드 디렉토리 존재 확인
 */
export function isBuildDirReady(): boolean {
  return directoryExists(BUILD_DIR);
}
