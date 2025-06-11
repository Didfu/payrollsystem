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