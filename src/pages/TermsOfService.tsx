import React from 'react';
import { FileText, Users, Shield, AlertTriangle, Scale, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SplitText from '@/components/ui/SplitText';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-80 h-80 bg-green-200 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-200 rounded-full blur-3xl animate-pulse-slow"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <SplitText
            text="Terms of Service"
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
            Please read these terms carefully before using our lost and found platform.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: December 2024
          </p>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Important:</strong> By using Campus Lost & Found, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Main Terms Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Card className="border border-gray-200 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-green-600" />
                <span>Acceptance and Use</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                By accessing Campus Lost & Found, you agree to these terms. This platform is for legitimate 
                lost and found purposes within the university community. Users must provide accurate information 
                and communicate respectfully with others.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-green-600" />
                <span>User Responsibilities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-gray-600">
                <li>• Post only truthful information about lost or found items</li>
                <li>• Use the platform solely for legitimate lost and found purposes</li>
                <li>• Meet in safe, public campus locations for item exchanges</li>
                <li>• Report suspicious activity or misuse to administrators</li>
                <li>• Maintain professional and respectful communication</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Scale className="w-6 h-6 text-green-600" />
                <span>Liability and Disclaimers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                The university and platform operators are not responsible for lost, stolen, or damaged items. 
                Users interact at their own risk. We do not verify user identities or item descriptions. 
                The platform is provided "as is" without warranties.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <span>Prohibited Activities</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-gray-600">
                <li>• Posting false or misleading information</li>
                <li>• Using the platform for commercial sales</li>
                <li>• Harassment or inappropriate communication</li>
                <li>• Attempting to claim items that don't belong to you</li>
                <li>• Sharing account access with others</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsOfService; 