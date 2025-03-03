
import React, { ReactNode } from 'react';

interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return <>{children}</>;
};

export default AuthWrapper;
