"use client";

import { Authenticator } from '@aws-amplify/ui-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function AuthenticatedContent({ user, onAuthenticated }: { 
  user: any; 
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
      {({ signOut, user }) => {
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
