'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient, LoginData } from '@/lib/api';

const countryCodes = [
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
];

type LoginMethod = 'email' | 'username' | 'phone';

export function LoginForm() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [countryCode, setCountryCode] = useState('+852');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formData, setFormData] = useState<LoginData>({
    identifier: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const method = e.target.value as LoginMethod;
    setLoginMethod(method);
    setFormData(prev => ({ ...prev, identifier: '' }));
    setPhoneNumber('');
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setPhoneNumber(value);
    setFormData(prev => ({
      ...prev,
      identifier: value ? `${countryCode}${value}` : '',
    }));
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    setCountryCode(newCode);
    setFormData(prev => ({
      ...prev,
      identifier: phoneNumber ? `${newCode}${phoneNumber}` : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.login(formData);
      
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      switch (response.user.role) {
        case 'PATIENT':
          router.push('/patient/dashboard');
          break;
        case 'DOCTOR':
          router.push('/doctor/dashboard');
          break;
        case 'PHYSIO':
          router.push('/physio/dashboard');
          break;
        case 'ADMIN':
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (loginMethod) {
      case 'email':
        return 'your@email.com';
      case 'username':
        return 'your username';
      case 'phone':
        return '1234 5678';
      default:
        return '';
    }
  };

  const getLabel = () => {
    switch (loginMethod) {
      case 'email':
        return 'Email Address';
      case 'username':
        return 'Username';
      case 'phone':
        return 'Phone Number';
      default:
        return 'Identifier';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Choose your preferred login method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="loginMethod" className="text-sm font-medium">
              Login Method
            </label>
            <select
              id="loginMethod"
              value={loginMethod}
              onChange={handleMethodChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            >
              <option value="email">Email Address</option>
              <option value="username">Username</option>
              <option value="phone">Phone Number</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="identifier" className="text-sm font-medium">
              {getLabel()}
            </label>
            
            {loginMethod === 'phone' ? (
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={handleCountryCodeChange}
                  className="w-28 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                >
                  {countryCodes.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.flag} {item.code}
                    </option>
                  ))}
                </select>
                <Input
                  id="identifier"
                  type="tel"
                  placeholder={getPlaceholder()}
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  required
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>
            ) : (
              <Input
                id="identifier"
                name="identifier"
                type={loginMethod === 'email' ? 'email' : 'text'}
                placeholder={getPlaceholder()}
                value={formData.identifier}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <a 
              href="/auth/register" 
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
