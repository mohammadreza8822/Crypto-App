import styles from "./Layout.module.css";

function Layout({ children }) {
  return (
    <>
      <header className={styles.header}>
        <h1>Crypto App</h1>
        <p>React Project</p>
      </header>
      {children}
      <footer className={styles.footer}>
        <p>Develop By Mohammadreza Asghary ❤️ </p>
      </footer>
    </>
  );
}

export default Layout;
