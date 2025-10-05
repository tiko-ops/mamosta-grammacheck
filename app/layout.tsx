export const metadata = {
  title: "Mamosta – Enkel svensk rättstavare",
  description: "Klistra in din text (max 10 000 tecken) och få den korrigerad direkt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body style={{
        fontFamily: 'system-ui, sans-serif',
        background: '#f7f7fb',
        color: '#111',
      }}>
        <header style={{ background: '#2196f3', color: '#fff' }}>
  <div style={{ maxWidth: 960, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
    <a href="/" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
      <img src="/mamosta-logo.png" alt="Mamosta" style={{ height: 40, width: 'auto', transition: 'transform 0.25s' }}
           onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
           onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')} />
    </a>
    <nav style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
      <a href="/integritet" style={{ color: '#fff', textDecoration: 'none' }}>Integritet</a>
      <a href="/villkor" style={{ color: '#fff', textDecoration: 'none' }}>Villkor</a>
    </nav>
  </div>
</header>

        <main style={{ maxWidth: 960, margin: '24px auto', padding: '0 16px' }}>
          {children}
        </main>
        <footer style={{
          maxWidth: 960, margin: '32px auto',
          padding: '16px', fontSize: 14, color: '#444'
        }}>
          © {new Date().getFullYear()} Mamosta • Kontakt: kundservice@mamosta.se
        </footer>
      </body>
    </html>
  );
}
