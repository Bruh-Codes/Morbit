import { ReactNode } from 'react';

type ComplianceGateProps = {
  children: ReactNode;
};

export const AddressBlocked = ({ children }: ComplianceGateProps) => {
  return <>{children}</>;
};
