import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export const firebaseService = {
  // Employee management
  async saveEmployee(userId, employeeData) {
    try {
      const employeesRef = collection(db, 'users', userId, 'employees');
      
      if (employeeData.id) {
        // Update existing employee
        const employeeDocRef = doc(employeesRef, employeeData.id);
        await setDoc(employeeDocRef, {
          ...employeeData,
          updatedAt: serverTimestamp()
        }, { merge: true });
        return employeeData.id;
      } else {
        // Add new employee
        const docRef = await addDoc(employeesRef, {
          ...employeeData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return docRef.id;
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      throw error;
    }
  },

  async getEmployees(userId) {
    try {
      const employeesRef = collection(db, 'users', userId, 'employees');
      const snapshot = await getDocs(employeesRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting employees:', error);
      throw error;
    }
  },

  async deleteEmployee(userId, employeeId) {
    try {
      const employeeDocRef = doc(db, 'users', userId, 'employees', employeeId);
      await deleteDoc(employeeDocRef);
      
      // Also delete all payroll data for this employee
      const payrollRef = collection(db, 'users', userId, 'monthlyPayrollData');
      const payrollSnapshot = await getDocs(payrollRef);
      
      const deletePromises = payrollSnapshot.docs
        .filter(doc => doc.data().employeeId === employeeId)
        .map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  },

  // Payroll data management
  async saveMonthlyData(userId, employeeId, year, month, data) {
    try {
      const recordId = `${employeeId}_${year}_${month}`;
      const payrollDocRef = doc(db, 'users', userId, 'monthlyPayrollData', recordId);
      
      await setDoc(payrollDocRef, {
        employeeId,
        year,
        month,
        ...data,
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return recordId;
    } catch (error) {
      console.error('Error saving monthly data:', error);
      throw error;
    }
  },

  async getAllPayrollData(userId) {
    try {
      const payrollRef = collection(db, 'users', userId, 'monthlyPayrollData');
      const snapshot = await getDocs(payrollRef);
      
      const payrollData = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const { employeeId, year, month, earnings, deductions, deductionToggles } = data;
        
        if (!payrollData[employeeId]) {
          payrollData[employeeId] = {};
        }
        if (!payrollData[employeeId][year]) {
          payrollData[employeeId][year] = {};
        }
        
        payrollData[employeeId][year][month] = {
          earnings,
          deductions,
          deductionToggles
        };
      });
      
      return payrollData;
    } catch (error) {
      console.error('Error getting payroll data:', error);
      throw error;
    }
  },

  // Updated sharing functionality - now shares complete employee data
async sharePayrollData(fromUserId, toEmail, employeeId) {
  try {
    console.log('=== SHARE PAYROLL DEBUG START ===');
    console.log('fromUserId:', fromUserId);
    console.log('toEmail:', toEmail);
    console.log('employeeId:', employeeId);

    if (!fromUserId || !toEmail || !employeeId) {
      throw new Error('Missing required parameters: fromUserId, toEmail, or employeeId');
    }

    if (typeof employeeId !== 'string') {
      throw new Error(`employeeId must be a string, received: ${typeof employeeId}`);
    }

    const employeeDocRef = doc(db, 'users', String(fromUserId), 'employees', String(employeeId));
    const employeeDoc = await getDoc(employeeDocRef);

    if (!employeeDoc.exists()) {
      throw new Error(`Employee with ID '${employeeId}' not found`);
    }

    const employeeData = { id: employeeDoc.id, ...employeeDoc.data() };
    console.log('Employee data found:', employeeData);

    const payrollRef = collection(db, 'users', String(fromUserId), 'monthlyPayrollData');
    const payrollSnapshot = await getDocs(payrollRef);

    console.log('=== FILTERING FOR EMPLOYEE ===');
    const employeePayrollData = {};
    let matchCount = 0;

    payrollSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const docEmployeeId = String(data.employeeId).trim();
      const targetEmployeeId = String(employeeId).trim();

      if (docEmployeeId === targetEmployeeId) {
        const { year, month, earnings, deductions, deductionToggles } = data;
        
        // Handle year validation and normalization
        let normalizedYear, parsedYear;
        
        if (String(year).includes('-')) {
          // Handle formats like "2025-26" - extract first year
          parsedYear = parseInt(String(year).split('-')[0]);
          normalizedYear = String(parsedYear);
        } else {
          parsedYear = parseInt(year);
          normalizedYear = String(parsedYear);
        }
        
        // Skip records with invalid year
        if (isNaN(parsedYear)) {
          console.log(`⚠️ Skipping invalid record: year=${year} (couldn't parse year)`);
          return;
        }

        // Skip records with invalid/empty month (but allow month names)
        if (!month || month === 'NaN' || String(month).trim() === '') {
          console.log(`⚠️ Skipping invalid record: year=${year}, month=${month} (invalid month)`);
          return;
        }
        
        matchCount++;
        console.log(`✅ VALID MATCH FOUND! Document ${doc.id}`, {
          originalYear: year,
          normalizedYear,
          month
        });

        if (!employeePayrollData[normalizedYear]) {
          employeePayrollData[normalizedYear] = {};
        }

        employeePayrollData[normalizedYear][month] = {
          earnings: earnings || {},
          deductions: deductions || {},
          deductionToggles: deductionToggles || {}
        };
      }
    });

    console.log('=== FINAL RESULTS ===');
    console.log('Total valid matches found:', matchCount);
    console.log('Final employeePayrollData:', employeePayrollData);

    const shareData = {
      employee: employeeData,
      payrollData: employeePayrollData
    };

    const shareRef = collection(db, 'sharedPayrollData');
    const docRef = await addDoc(shareRef, {
      fromUserId,
      toEmail: toEmail.toLowerCase().trim(),
      shareData,
      sharedAt: serverTimestamp(),
      status: 'pending'
    });

    console.log('Share document created with ID:', docRef.id);
    console.log('=== SHARE PAYROLL DEBUG END ===');
    return true;

  } catch (error) {
    console.error('Error sharing payroll data:', error);
    throw error;
  }
},

debugReceivedPayrollData(shareData) {
  console.log('=== RECEIVER DEBUG START ===');
  console.log('Received shareData:', shareData);
  
  if (shareData.payrollData) {
    console.log('Payroll data years:', Object.keys(shareData.payrollData));
    
    Object.keys(shareData.payrollData).forEach(year => {
      console.log(`Year ${year}:`, {
        months: Object.keys(shareData.payrollData[year]),
        yearType: typeof year,
        yearParsed: parseInt(year),
        yearIsNaN: isNaN(parseInt(year))
      });
      
      Object.keys(shareData.payrollData[year]).forEach(month => {
        console.log(`  Month ${month}:`, {
          monthType: typeof month,
          monthParsed: parseInt(month),
          monthIsNaN: isNaN(parseInt(month)),
          hasEarnings: !!shareData.payrollData[year][month].earnings,
          hasDeductions: !!shareData.payrollData[year][month].deductions,
          earningsKeys: Object.keys(shareData.payrollData[year][month].earnings || {}),
          deductionsKeys: Object.keys(shareData.payrollData[year][month].deductions || {})
        });
      });
    });
  }
  
  console.log('=== RECEIVER DEBUG END ===');
},
async getSharedPayrollData(userEmail) {
try {
  const shareRef = collection(db, 'sharedPayrollData');
      const snapshot = await getDocs(shareRef);
      
      const sharedData = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.toEmail === userEmail.toLowerCase().trim()) {
          sharedData.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      return sharedData;
    } catch (error) {
      console.error('Error getting shared payroll data:', error);
      throw error;
    }
  },

async acceptSharedData(shareId, userId, shareData) {
  try {
    // Save employee data
    const employeesRef = collection(db, 'users', String(userId), 'employees');
    const employeeDocRef = doc(employeesRef, String(shareData.employee.id));
    
    await setDoc(employeeDocRef, {
      ...shareData.employee,
      ...(shareData.fromUserId && { sharedFrom: shareData.fromUserId }),
      addedAt: serverTimestamp()
    }, { merge: true });

    // Save payroll data with better validation
    if (shareData.payrollData) {
      const payrollPromises = [];
      
      Object.keys(shareData.payrollData).forEach(year => {
        Object.keys(shareData.payrollData[year]).forEach(month => {
          const employeeId = String(shareData.employee.id);
          
          // Handle year validation and normalization
          let normalizedYear, parsedYear;
          
          if (String(year).includes('-')) {
            // Handle formats like "2025-26" - extract first year
            parsedYear = parseInt(String(year).split('-')[0]);
            normalizedYear = String(parsedYear);
          } else {
            parsedYear = parseInt(year);
            normalizedYear = String(parsedYear);
          }
          
          // Skip records with invalid year
          if (isNaN(parsedYear)) {
            console.log(`⚠️ Skipping invalid payroll record: year=${year} (couldn't parse year)`);
            return;
          }

          // Skip records with invalid/empty month
          if (!month || month === 'NaN' || String(month).trim() === '') {
            console.log(`⚠️ Skipping invalid payroll record: year=${year}, month=${month} (invalid month)`);
            return;
          }

          const monthStr = String(month);
          const recordId = `${employeeId}_${normalizedYear}_${monthStr}`;

          const payrollDocRef = doc(db, 'users', String(userId), 'monthlyPayrollData', recordId);
          
          const payrollPromise = setDoc(payrollDocRef, {
            employeeId: employeeId,
            year: parsedYear,
            month: monthStr, // Store month as string (e.g., "April")
            ...shareData.payrollData[year][month],
            ...(shareData.fromUserId && { sharedFrom: shareData.fromUserId }),
            timestamp: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });

          payrollPromises.push(payrollPromise);
        });
      });

      await Promise.all(payrollPromises);
      console.log(`✅ Successfully imported ${payrollPromises.length} payroll records`);
    }

    // Update share status
    const shareDocRef = doc(db, 'sharedPayrollData', shareId);
    await setDoc(shareDocRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      acceptedBy: userId
    }, { merge: true });

    return true;

  } catch (error) {
    console.error('Error accepting shared data:', error);
    throw error;
  }
},

  async declineSharedData(shareId) {
    try {
      const shareDocRef = doc(db, 'sharedPayrollData', shareId);
      await setDoc(shareDocRef, {
        status: 'declined',
        declinedAt: serverTimestamp()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error declining shared data:', error);
      throw error;
    }
  },

  async deleteSharedData(shareId) {
    try {
      const shareDocRef = doc(db, 'sharedPayrollData', shareId);
      await deleteDoc(shareDocRef);
      return true;
    } catch (error) {
      console.error('Error deleting shared data:', error);
      throw error;
    }
  },

  // Get sharing history for a user
  async getSharingHistory(userId) {
    try {
      const shareRef = collection(db, 'sharedPayrollData');
      const snapshot = await getDocs(shareRef);
      
      const sharingHistory = [];
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.fromUserId === userId) {
          sharingHistory.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      return sharingHistory;
    } catch (error) {
      console.error('Error getting sharing history:', error);
      throw error;
    }
  },

  // User profile management
  async updateUserProfile(userId, userData) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        ...userData,
        lastUpdated: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async getUserProfile(userId) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userDocRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
};