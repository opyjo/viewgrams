import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
};

const userPool = new CognitoUserPool(poolData);

export type AuthSession = {
  email: string;
  token: string;
  userId: string;
};

export const getCurrentSession = (): Promise<AuthSession | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }

    const currentUser = userPool.getCurrentUser();
    if (!currentUser) {
      resolve(null);
      return;
    }

    currentUser.getSession((err: Error | null, session: CognitoUserSession) => {
      if (err || !session?.isValid()) {
        resolve(null);
        return;
      }

      const idToken = session.getIdToken();
      const payload = idToken.payload as { sub?: string; email?: string };
      resolve({
        email: payload.email || currentUser.getUsername(),
        token: idToken.getJwtToken(),
        userId: payload.sub || currentUser.getUsername(),
      });
    });
  });
};

export const signIn = (email: string, password: string): Promise<AuthSession> => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    const userData = {
      Username: email,
      Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        const idToken = session.getIdToken();
        const payload = idToken.payload as { sub?: string; email?: string };
        resolve({
          email: payload.email || email,
          token: idToken.getJwtToken(),
          userId: payload.sub || email,
        });
      },
      onFailure: (err) => {
        reject(err);
      },
      newPasswordRequired: () => {
        reject(new Error('Password reset required. Please reset your password in Cognito.'));
      },
    });
  });
};

export const signUp = (email: string, password: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
    ];

    userPool.signUp(email, password, attributes, [], (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

export const confirmSignUp = (email: string, code: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

export const signOut = () => {
  const currentUser = userPool.getCurrentUser();
  currentUser?.signOut();
};

export const getIdToken = async (): Promise<string | null> => {
  const session = await getCurrentSession();
  return session?.token || null;
};
