import React from "react";
import Link from "next/link";
import { CalendarCheck, Twitter, Linkedin } from "lucide-react";
import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", href: "#" },
      { name: "Integrations", href: "#" },
      { name: "Enterprise", href: "#" },
      { name: "Solutions", href: "#" },
    ],
    company: [
      { name: "About Us", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Press", href: "#" },
      { name: "Blog", href: "#" },
    ],
    legal: [
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
      { name: "Cookie Policy", href: "#" },
      { name: "Security", href: "#" },
    ],
  };

  return (
    <footer className="bg-white pt-20 pb-10 px-6 md:px-12 lg:px-24 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-5 space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg">
                <Image
                  src={"/logo.png"}
                  width={40}
                  height={40}
                  alt="Logo Image"
                />
              </div>
              <span className="text-2xl font-black text-dark tracking-tight">
                Popket
              </span>
            </div>

            <p className="text-gray-500 text-base max-w-xs leading-relaxed">
              Simplifying productivity for the modern workforce. One task at a
              time.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Twitter
                  size={20}
                  fill="currentColor"
                  className="stroke-none"
                />
              </Link>
              <Link
                href="#"
                className="text-gray-400 hover:text-primary transition-colors"
              >
                <Linkedin
                  size={20}
                  fill="currentColor"
                  className="stroke-none"
                />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <h4 className="text-sm font-bold text-dark uppercase tracking-widest">
              Product
            </h4>
            <ul className="space-y-4">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-primary transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <h4 className="text-sm font-bold text-dark uppercase tracking-widest">
              Company
            </h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-primary transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="col-span-2 md:col-span-1 lg:col-span-3 space-y-6">
            <h4 className="text-sm font-bold text-dark uppercase tracking-widest">
              Legal
            </h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-primary transition-colors text-sm font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-gray-100">
          <p className="text-gray-400 text-sm">© {currentYear} Popket</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
