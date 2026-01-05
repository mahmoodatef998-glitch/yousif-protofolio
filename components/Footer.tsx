export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-dark-bg border-t border-dark-section">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <p className="text-text-secondary text-sm">
            © {currentYear} Portfolio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
