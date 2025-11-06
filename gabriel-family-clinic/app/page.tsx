'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/data/card';
import {
  Calendar,
  FileText,
  Heart,
  Users,
  Clock,
  Shield,
  Phone,
  MapPin,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-emerald-600 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Gabriel Family Clinic
            </h1>
            <p className="text-2xl md:text-3xl mb-8 text-blue-100">
              Your Trusted Healthcare Partner in Singapore
            </p>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto">
              Quality healthcare services with CHAS compatibility.
              Book your appointment today and experience care that puts you first.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/signin">
                <Button variant="secondary" size="lg" className="text-xl py-8 px-12 min-h-[72px]">
                  Patient Portal
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" size="lg" className="text-xl py-8 px-12 min-h-[72px] bg-white text-blue-600 border-2 border-white hover:bg-blue-50">
                  Register Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-700">
              Comprehensive healthcare services for you and your family
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Easy Appointment Booking',
                description: 'Book appointments online 24/7 with our user-friendly portal. Choose your preferred doctor and time slot.',
              },
              {
                icon: FileText,
                title: 'Digital Medical Records',
                description: 'Access your medical history, test results, and prescriptions securely from anywhere, anytime.',
              },
              {
                icon: Heart,
                title: 'CHAS Compatible',
                description: 'We accept CHAS Blue, Orange, and Green cards. Enjoy subsidized healthcare services.',
              },
              {
                icon: Users,
                title: 'Family Medicine',
                description: 'Complete family healthcare services from infant care to elderly medicine and chronic disease management.',
              },
              {
                icon: Clock,
                title: 'Extended Hours',
                description: 'Open 7 days a week with extended evening hours for your convenience.',
              },
              {
                icon: Shield,
                title: 'Quality Care',
                description: 'Experienced doctors and modern facilities providing quality healthcare you can trust.',
              },
            ].map((service, index) => (
              <div
                key={service.title}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <div className="p-8">
                    <service.icon className="w-16 h-16 text-blue-600 mb-6" />
                    <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                      {service.title}
                    </h3>
                    <p className="text-lg text-gray-700">
                      {service.description}
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Gabriel Family Clinic?
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              We are committed to providing accessible, quality healthcare
              services for all Singaporeans
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8 animate-slide-in-left">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Elderly-Friendly Design
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Our facilities and digital portal are designed with larger
                  fonts, clear layouts, and easy navigation specifically for
                  elderly patients.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  CHAS Subsidies
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Accepted CHAS provider with automatic subsidy calculation.
                  Save on your healthcare costs with Blue, Orange, or Green
                  cards.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Singapore Standards
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Full compliance with Singapore healthcare regulations, NRIC
                  validation, and secure data protection standards.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-12 animate-slide-in-right">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">
                Quick Contact
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Phone className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xl font-semibold text-gray-900">Phone</p>
                    <p className="text-lg text-gray-700">+65 6123 4567</p>
                    <p className="text-base text-gray-600">Monday - Sunday: 8:00 AM - 10:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xl font-semibold text-gray-900">Location</p>
                    <p className="text-lg text-gray-700">
                      123 Healthcare Avenue<br />
                      #01-01 Medical Centre<br />
                      Singapore 123456
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <Link href="/contact">
                    <Button variant="primary" size="lg" className="w-full text-xl py-6">
                      Get Directions
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Experience Better Healthcare?
            </h2>
            <p className="text-2xl mb-12 text-blue-100">
              Join thousands of satisfied patients who trust Gabriel Family Clinic
              for their healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/signup">
                <Button variant="secondary" size="lg" className="text-xl py-8 px-12 min-h-[72px]">
                  Create Account
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" size="lg" className="text-xl py-8 px-12 min-h-[72px] bg-white text-blue-600 border-2 border-white hover:bg-blue-50">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">Gabriel Family Clinic</h3>
              <p className="text-lg text-gray-300">
                Quality healthcare for you and your family
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-lg">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
                    Our Services
                  </Link>
                </li>
                <li>
                  <Link href="/doctors" className="text-gray-300 hover:text-white transition-colors">
                    Our Doctors
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-lg">
                <li>
                  <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p className="text-lg">
              &copy; 2025 Gabriel Family Clinic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
