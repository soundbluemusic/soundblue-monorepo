import styles from './CSSParticles.module.scss';

/**
 * Pure CSS particle background - no JavaScript, no click blocking issues
 */
export function CSSParticles() {
  return (
    <div className={styles.particles} aria-hidden="true">
      <div className={`${styles.particle} ${styles.particle1}`} />
      <div className={`${styles.particle} ${styles.particle2}`} />
      <div className={`${styles.particle} ${styles.particle3}`} />
      <div className={`${styles.particle} ${styles.particle4}`} />
      <div className={`${styles.particle} ${styles.particle5}`} />
      <div className={`${styles.particle} ${styles.particle6}`} />
      <div className={`${styles.particle} ${styles.particle7}`} />
      <div className={`${styles.particle} ${styles.particle8}`} />
      <div className={`${styles.particle} ${styles.particle9}`} />
      <div className={`${styles.particle} ${styles.particle10}`} />
      <div className={`${styles.particle} ${styles.particle11}`} />
      <div className={`${styles.particle} ${styles.particle12}`} />
    </div>
  );
}
