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
        <header style={{ background: '#1e90ff', color: '#fff' }}>
          <div style={{
            maxWidth: 960, margin: '0 auto',
            padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ fontWeight: 800, fontSize: 20 }}>Mamosta</div>
            <nav style={{ display: 'flex', gap: 16 }}>
              <a href="/integritet" style={{ color: '#fff' }}>Integritet</a>
              <a href="/villkor" style={{ color: '#fff' }}>Villkor</a>
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
