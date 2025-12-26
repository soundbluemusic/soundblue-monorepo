import m from '~/lib/messages';
import { useUIStore } from '~/stores';
import styles from './ResultPanel.module.scss';

// ========================================
// ResultPanel Component - 오른쪽 결과 패널
// ========================================

export function ResultPanel() {
  const { resultContent, closeResultPanel } = useUIStore();

  return (
    <div className={styles.panel}>
      {resultContent ? (
        <>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.headerIcon}>
                {resultContent.type === 'report' && <ReportIcon />}
                {resultContent.type === 'info' && <InfoIcon />}
                {resultContent.type === 'help' && <HelpIcon />}
              </span>
              <h2 className={styles.headerTitle}>{resultContent.title}</h2>
            </div>
            <button
              type="button"
              onClick={closeResultPanel}
              className={styles.closeButton}
              aria-label={m['app.closePanel']()}
            >
              <CloseIcon />
            </button>
          </div>

          {/* Content */}
          <div className={styles.content}>
            <div className={styles.prose}>{resultContent.content}</div>
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <DocumentIcon />
          <p className={styles.emptyText}>{m['app.resultsPanelEmptyState']()}</p>
        </div>
      )}
    </div>
  );
}

// Icons
function DocumentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="48"
      height="48"
      className={styles.emptyIcon}
    >
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="20"
      height="20"
      className={styles.iconAccent}
    >
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="20"
      height="20"
      className={styles.iconAccent}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="20"
      height="20"
      className={styles.iconAccent}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}
