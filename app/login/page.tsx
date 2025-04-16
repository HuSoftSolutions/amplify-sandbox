"use client";

import { Authenticator } from '@aws-amplify/ui-react';
import { AuthUser } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function AuthenticatedContent({ onAuthenticated }: { 
  user: AuthUser;
  onAuthenticated: () => void;
}) {
  useEffect(() => {
    onAuthenticated();
  }, [onAuthenticated]);

  return <div>Redirecting to dashboard...</div>;
}

export default function Login() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin-dashboard');
    }
  }, [isAuthenticated, router]);

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  return (
    <Authenticator>
      {({ user }) => {
        if (user) {
          return <AuthenticatedContent 
            user={user} 
            onAuthenticated={handleAuthenticated} 
          />;
        }
        return <div>Please sign in to continue</div>;
      }}
    </Authenticator>
  );
}
