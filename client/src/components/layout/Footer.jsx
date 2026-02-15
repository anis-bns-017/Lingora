import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaComments, FaTwitter, FaGithub, FaDiscord, 
  FaEnvelope, FaPhone, FaMapMarkerAlt 
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 rounded-3xl overflow-hidden">
      <div className="container mx-auto px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FaComments className="text-3xl text-primary-500" />
              <span className="text-xl font-bold text-white">Lingora</span>
            </div>
            <p className="text-sm mb-4">
              Learn languages through real conversations with native speakers from around the world.
            </p>
            <div className="flex space-x-4">
              <SocialLink href="#" icon={FaTwitter} />
              <SocialLink href="#" icon={FaGithub} />
              <SocialLink href="#" icon={FaDiscord} />
              <SocialLink href="#" icon={FaEnvelope} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <FooterLink to="/rooms">Browse Rooms</FooterLink>
              <FooterLink to="/languages">Languages</FooterLink>
              <FooterLink to="/community">Community</FooterLink>
              <FooterLink to="/blog">Blog</FooterLink>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <FooterLink to="/faq">FAQ</FooterLink>
              <FooterLink to="/contact">Contact Us</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/terms">Terms of Service</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <FaEnvelope className="text-primary-500" />
                <span>support@lingora.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaPhone className="text-primary-500" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-primary-500" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>© {new Date().getFullYear()} Lingora. All rights reserved. Made with ❤️ for language learners worldwide.</p>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ href, icon: Icon }) => (
  <a href={href} className="hover:text-white transition">
    <Icon size={20} />
  </a>
);

const FooterLink = ({ to, children }) => (
  <li>
    <Link to={to} className="hover:text-white transition">
      {children}
    </Link>
  </li>
);

export default Footer;