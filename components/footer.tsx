import Link from "next/link";

const footerLinks = {
  product: [
    { label: "College Predictor", href: "/predict" },
    { label: "Find Mentors", href: "/mentors" },
    { label: "Previous Year Papers", href: "/papers" },
    { label: "College Explorer", href: "/colleges" },
  ],
  support: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/about#contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg overflow-hidden">
                <img src="/logo.png" alt="CET Mentor Hub Logo" className="h-full w-full object-cover" />
              </div>
              <span className="font-bold text-lg">CET Mentor Hub</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Free MHTCET guidance by real VJTI students. College predictor, PYQ online tests, and honest mentorship — completely free.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CET Mentor Hub. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with care for Maharashtra students
          </p>
        </div>
      </div>
    </footer>
  );
}
