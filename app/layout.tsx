import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mamosta Grammacheck',
  description: 'Rätta din svenska text snabbt och enkelt med Mamosta.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body
        style={{
          margin: 0,
          backgroundColor: '#f6f7fb',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          color: '#222',
        }}
      >
        {/* Header */}
        <header
          style={{
            background: '#2196f3',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              maxWidth: 960,
              margin: '0 auto',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
            >
              <img
                src="/mamosta-logo.png"
                alt="Mamosta"
                className="mamosta-logo"
                style={{ height: 40, width: 'auto' }}
              />
            </a>

            <nav
              style={{
                marginLeft: 'auto',
                display: 'flex',
                gap: 16,
              }}
            >
              <a
                href="/integritet"
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Integritet
              </a>
              <a
                href="/villkor"
                style={{
                  color: '#fff',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Villkor
              </a>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main
          style={{
            maxWidth: 960,
            margin: '0 auto',
            padding: '32px 16px',
          }}
        >
          {children}
        </main>

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            fontSize: 14,
            padding: '24px 16px',
            color: '#777',
            borderTop: '1px solid #ddd',
            marginTop: 40,
          }}
        >
          © 2025 Mamosta • Kontakt:{' '}
          <a href="mailto:kundservice@mamosta.se" style={{ color: '#2196f3' }}>
            kundservice@mamosta.se
          </a>
        </footer>
      </body>
    </html>
  );
}
