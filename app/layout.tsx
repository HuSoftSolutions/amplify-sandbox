// app/layout.tsx or equivalent
"use client";

import amplifyconfig from '@/amplify_outputs.json';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';

Amplify.configure(amplifyconfig, { ssr: true });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Authenticator.Provider>{children}</Authenticator.Provider>
      </body>
    </html>
  );
}
