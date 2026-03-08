export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-white">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.07),transparent_25%),radial-gradient(circle_at_left,rgba(120,119,198,0.10),transparent_30%),radial-gradient(circle_at_right,rgba(255,255,255,0.04),transparent_30%)]" />
        {children}
      </body>
    </html>
  )
}