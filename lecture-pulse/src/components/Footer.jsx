import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
export default function Footer() {
  const location = useLocation();
  const handleHomeClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleDashboardClick = () => {
  if (location.pathname === "/dashboard") {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
};
  return (
    <footer className="w-full bg-slate-950 text-slate-200 border-t border-slate-800 py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Branding Section */}
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold tracking-wider text-white">LecturePulse</h2>
          <p className="text-sm text-slate-400">
            Enhancing real-time feedback and engagement in lectures.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
        <li>
          <Link
            to="/"
            onClick={handleHomeClick}
            className="hover:text-white transition-colors"
          >
            Home
          </Link>
        </li>

        <li>
          <Link
            to="/dashboard"
            onClick={handleDashboardClick}
            className="hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </li>

        <li>
          <HashLink
            smooth
            to="/#features"
            className="hover:text-white transition-colors"
          >
            Features
          </HashLink>
        </li>
      </ul>
        </div>

        {/* Contact/Support Info */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">Support</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>Email: <a href="mailto:support@lecturepulse.com" className="text-slate-200 hover:text-white transition-colors">support@lecturepulse.com</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-8 pt-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} LecturePulse. All rights reserved.
      </div>
    </footer>
  );
}