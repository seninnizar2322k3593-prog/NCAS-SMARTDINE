import './globals.css'

/**
 * Root Layout Component
 * This is the main layout wrapper for all pages in the application
 */
export const metadata = {
  title: 'NCAS SMART DINE - QR-Based College Canteen System',
  description: 'Pre-order food from college canteen with QR-based ticket system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
