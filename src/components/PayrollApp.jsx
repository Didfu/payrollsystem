"use client";
import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Login from './Login';
import Payslip from './Payslip';
import { electronService } from '../lib/electronService';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Building, Shield, Bell, Settings } from 'lucide-react';

const PayrollApp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Professional animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut", delay: 0.1 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      transition: { duration: 0.2 }
    }
  };

  const loadingVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-slate-50"
        variants={loadingVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-6 shadow-lg">
            <Building className="h-8 w-8 text-white" />
          </div>
          <motion.div
            className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="text-lg font-medium text-slate-700"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            Loading SwiftLink Payroll...
          </motion.div>
          <p className="text-sm text-slate-500 mt-2">Securing your session</p>
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!user ? (
        <motion.div
          key="login"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Login onLoginSuccess={setUser} />
        </motion.div>
      ) : (
        <motion.div
          key="app"
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="min-h-screen bg-slate-50 "
        >
          {/* Professional Header */}
          <motion.header 
            className="bg-white shadow-sm border-b border-slate-200 px-4 py-4 print:hidden sticky top-0 z-50 backdrop-blur-sm bg-white/95"
            variants={headerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <motion.div 
                className="flex items-center gap-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                {/* User Info */}
                <motion.div 
                  className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-slate-800">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    
                  </div>
                </motion.div>
                

                
              </motion.div>
              
              {/* Header Actions */}
              <motion.div
                className="flex items-center gap-3 print:hidden"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                
                {/* Logout Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300 font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </motion.div>
              </motion.div>
            </div>

            
          </motion.header>
          
          {/* Main Content */}
          <motion.main
            className="flex-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Payslip user={user} />
          </motion.main>

          {/* Footer */}
          <motion.footer 
            className="bg-white border-t border-slate-200 px-4 py-6 print:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-4">
                  <span>© 2025 SwiftLink Payroll System</span>
                  
                </div>
                <div className="flex items-center gap-4">
                  <span>Need help?</span>
                  <button
  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
  onClick={() =>
    window.open(
      "https://mail.google.com/mail/?view=cm&fs=1&to=mahyavanshidhruv@gmail.com&su=SwiftLink%20Support",
      "_blank"
    )
  }
>
  Contact Support
</button>


                </div>
              </div>
            </div>
          </motion.footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PayrollApp;