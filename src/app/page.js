'use client';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import Payslip from '@/components/Payslip';
import { Button } from '@/components/ui/button';
import PayrollApp from '@/components/PayrollApp';


function AppContent() {
  const { currentUser, logout } = useAuth();


  if (!currentUser) {
    return (
    <Login />
  );
  }

  return (
    <div className="">
  <PayrollApp user={currentUser} />
</div>
);

}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}