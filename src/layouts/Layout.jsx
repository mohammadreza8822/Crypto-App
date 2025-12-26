import styles from "./Layout.module.css";

function Layout({ children }) {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <div className={styles.logoIcon}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.logoText}>
              <h1>Crypto Tracker</h1>
              <span className={styles.tagline}>Real-time Market Data</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.statsBadge}>
              <span className={styles.badgeIcon}>📊</span>
              <span className={styles.badgeText}>Live Data</span>
            </div>
            <div className={styles.versionBadge}>
              <span>v2.0</span>
            </div>
          </div>
        </div>
        <div className={styles.headerGradient}></div>
      </header>
      {children}
      <footer className={styles.footer}>
        <p>Developed by <span className={styles.footerName}>Jasem Albaset</span> ❤️</p>
      </footer>
    </>
  );
}

export default Layout;
