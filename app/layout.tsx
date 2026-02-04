import type { Metadata } from 'next';
import { Fraunces, Space_Grotesk } from 'next/font/google';
import './globals.css';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Third-Place Atlas',
  description: 'A vibe-forward map of calm, welcoming third places.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <div className="site">
          <header className="site-header">
            <div className="brand">
              <a className="brand-title" href="/">
                Third-Place Atlas
              </a>
              <p className="brand-tagline">Find calm, welcoming spaces to pause.</p>
            </div>
            <nav className="nav">
              <a className="nav-link" href="/">
                Map
              </a>
              <a className="nav-link nav-link-solid" href="/add">
                Add a place
              </a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
