'use client';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import Payslip from '@/components/Payslip';
import { Button } from '@/components/ui/button';

function AppContent() {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div>
      <div className="flex justify-between items-center p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold">Payroll System</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{currentUser.email}</span>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>
      <Payslip user={currentUser} />
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