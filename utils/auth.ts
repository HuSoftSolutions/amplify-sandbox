import { Hub } from 'aws-amplify/utils';
import { fetchAuthSession } from 'aws-amplify/auth';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'checking';

export const setupAuthListener = (
  callback: (status: AuthStatus) => void
) => {
  // Check initial auth state
  checkAuth(callback);

  // Listen for auth events
  return Hub.listen('auth', async ({ payload }) => {
    switch (payload.event) {
      case 'signedIn':
        callback('authenticated');
        break;
      case 'signedOut':
        callback('unauthenticated');
        break;
      case 'tokenRefresh':
        checkAuth(callback);
        break;
    }
  });
};

const checkAuth = async (callback: (status: AuthStatus) => void) => {
  try {
    const session = await fetchAuthSession();
    callback(session.tokens ? 'authenticated' : 'unauthenticated');
  } catch (error) {
    callback('unauthenticated');
  }
};
