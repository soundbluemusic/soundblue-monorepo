import type { ReactNode } from 'react';

/**
 * Shared test types for type-safe mocking
 */

/**
 * Type for cn utility function mock
 */
export type CnFunction = (...classes: (string | boolean | undefined | null)[]) => string;

/**
 * Props for BottomSheet mock component
 */
export interface MockBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * Props for Link mock component
 */
export interface MockLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

/**
 * Meta descriptor types for React Router meta function testing
 */
export interface MetaTitle {
  title: string;
}

export interface MetaDescription {
  name: 'description';
  content: string;
}

export interface MetaProperty {
  property: string;
  content: string;
}

export interface MetaName {
  name: string;
  content: string;
}

export type MetaDescriptor = MetaTitle | MetaDescription | MetaProperty | MetaName;

/**
 * Type guard for meta title
 */
export function isMetaTitle(meta: MetaDescriptor): meta is MetaTitle {
  return 'title' in meta;
}

/**
 * Type guard for meta with name attribute
 */
export function isMetaName(meta: MetaDescriptor): meta is MetaName | MetaDescription {
  return 'name' in meta;
}

/**
 * Helper to find title meta from meta array
 */
export function findMetaTitle(metas: MetaDescriptor[]): MetaTitle | undefined {
  return metas.find(isMetaTitle);
}

/**
 * Helper to find description meta from meta array
 */
export function findMetaDescription(metas: MetaDescriptor[]): MetaDescription | undefined {
  return metas.find((m): m is MetaDescription => isMetaName(m) && m.name === 'description');
}

/**
 * Test meta args type (custom type for TanStack Router migration)
 */
export interface TestMetaArgs {
  location: { pathname: string; search: string; hash: string; state: unknown; key: string };
  params: Record<string, string>;
  data: unknown;
  loaderData: unknown;
  matches: unknown[];
  error: unknown;
}

/**
 * Creates test meta args compatible with route testing
 * Uses a minimal shape that satisfies type checking for meta function tests
 */
export function createTestMetaArgs(pathname = '/'): TestMetaArgs {
  return {
    location: { pathname, search: '', hash: '', state: null, key: 'default' },
    params: {},
    data: undefined,
    loaderData: undefined,
    matches: [],
    error: undefined,
  };
}
