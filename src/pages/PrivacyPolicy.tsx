import React from 'react';
import { Shield, Eye, Lock, Users, Database, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SplitText from '@/components/ui/SplitText';

const PrivacyPolicy = () => {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        "Personal information you provide when creating an account (name, email, student ID, department)",
        "Contact information (phone number) for item recovery purposes",
        "Item details including photos, descriptions, and locations",
        "Messages and communications through our platform",
        "Usage data and analytics to improve our services"
      ]
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        "To provide and maintain our lost and found services",
        "To facilitate communication between users for item recovery",
        "To send notifications about matching items or messages",
        "To improve our platform based on usage patterns",
        "To comply with legal obligations and prevent fraud"
      ]
    },
    {
      icon: Users,
      title: "Information Sharing",
      content: [
        "We do not sell, trade, or rent your personal information",
        "Contact information is only shared with verified users for legitimate recovery purposes",
        "We may share information with law enforcement if required by law",
        "Anonymous usage statistics may be shared with university administration",
        "Third-party service providers may have access to data necessary for their services"
      ]
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        "We use industry-standard encryption to protect your data",
        "All communications are secured with SSL/TLS protocols",
        "Database access is restricted to authorized personnel only",
        "Regular security audits and updates are performed",
        "User passwords are hashed and never stored in plain text"
      ]
    },
    {
      icon: Shield,
      title: "Your Rights",
      content: [
        "You can access and update your personal information at any time",
        "You can delete your account and associated data",
        "You can opt out of non-essential communications",
        "You can request a copy of your data",
        "You can report privacy concerns to our support team"
      ]
    },
    {
      icon: Mail,
      title: "Contact Us",
      content: [
        "If you have questions about this privacy policy, contact us at privacy@campuslostfound.edu",
        "For data deletion requests, email: data-protection@campuslostfound.edu",
        "Visit the Student Services Center for in-person assistance",
        "Call (555) 123-4567 during business hours",
        "We respond to privacy inquiries within 72 hours"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-80 h-80 bg-blue-200 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-200 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <SplitText
            text="Privacy Policy"
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            delay={120}
            duration={0.7}
            ease="power2.out"
            splitType="words"
            from={{ opacity: 0, y: 50, rotationY: 20 }}
            to={{ opacity: 1, y: 0, rotationY: 0 }}
            threshold={0.2}
            rootMargin="-80px"
            textAlign="center"
          />
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: December 2024
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sections.map((section, index) => (
              <Card key={index} className="border border-gray-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {section.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {section.content.map((item, idx) => (
                      <li key={idx} className="flex items-start text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border border-gray-200 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900 text-center">
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Retention</h3>
                <p className="text-gray-600">
                  We retain your personal information for as long as your account is active or as needed to provide services. 
                  Resolved item listings may be archived for statistical purposes but will be anonymized after 1 year.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookies and Tracking</h3>
                <p className="text-gray-600">
                  We use essential cookies to maintain your session and preferences. We do not use tracking cookies for 
                  advertising purposes. You can disable cookies in your browser settings, but this may affect functionality.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Policy Updates</h3>
                <p className="text-gray-600">
                  We may update this privacy policy from time to time. We will notify users of any material changes 
                  via email and platform notifications. Continued use of the service constitutes acceptance of the updated policy.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Student Rights</h3>
                <p className="text-gray-600">
                  As a university service, we comply with FERPA guidelines regarding educational records. 
                  Students have additional rights under university policies regarding their personal information.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy; 