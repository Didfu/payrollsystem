import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
  limit
} from 'firebase/firestore';
import { db } from './firebase';

export const firebaseService = {
  async getCompanies(userId) {
    try {
      const q = query(collection(db, 'companyTemplates'), where('createdBy', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isTemplate: true }));
    } catch (error) {
      console.error('Error getting companies:', error);
      throw error;
    }
  },

  async getCompanyByName(name) {
    try {
      const q = query(collection(db, 'companyTemplates'), where('name', '==', name.trim()), limit(1));
      const snapshot = await getDocs(q);
      return snapshot.docs[0] || null;
    } catch (error) {
      console.error('Error checking company name:', error);
      return null;
    }
  },

  async addCompany(userId, companyData) {
    try {
      const existing = await this.getCompanyByName(companyData.name);
      if (existing) throw new Error('A company with this name already exists');

      const templatesRef = collection(db, 'companyTemplates');
      const docRef = await addDoc(templatesRef, {
        ...companyData,
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isTemplate: true
      });

      return { id: docRef.id, ...companyData, isTemplate: true };
    } catch (error) {
      console.error('Error adding company:', error);
      throw error;
    }
  },

  async updateCompany(userId, companyId, companyData) {
    try {
      const companyRef = doc(db, 'companyTemplates', companyId);
      await setDoc(companyRef, { ...companyData, updatedBy: userId, updatedAt: serverTimestamp() }, { merge: true });
      return { id: companyId, ...companyData };
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },

  async getCompanyById(userId, companyId) {
    try {
      const companyRef = doc(db, 'companyTemplates', companyId);
      const companyDoc = await getDoc(companyRef);
      return companyDoc.exists() ? { id: companyDoc.id, ...companyDoc.data() } : null;
    } catch (error) {
      console.error('Error getting company by ID:', error);
      throw error;
    }
  },

  async saveEmployee(userId, employeeData) {
    try {
      if (employeeData.companyId) {
        const companyRef = doc(db, 'companyTemplates', employeeData.companyId);
        const companyDoc = await getDoc(companyRef);
        if (!companyDoc.exists()) throw new Error('Selected company does not exist');
      }

      const employeesRef = collection(db, 'users', userId, 'employees');

      if (employeeData.id) {
        const employeeDocRef = doc(employeesRef, employeeData.id);
        await setDoc(employeeDocRef, { ...employeeData, updatedAt: serverTimestamp() }, { merge: true });
        return employeeData.id;
      } else {
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
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting employees:', error);
      throw error;
    }
  },

  async getEmployeesByCompany(userId, companyId) {
    try {
      const q = query(collection(db, 'users', userId, 'employees'), where('companyId', '==', companyId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting employees by company:', error);
      throw error;
    }
  },

  async deleteEmployee(userId, employeeId) {
    try {
      await deleteDoc(doc(db, 'users', userId, 'employees', employeeId));

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
      const snapshot = await getDocs(collection(db, 'users', userId, 'monthlyPayrollData'));
      const payrollData = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const { employeeId, year, month, earnings, deductions, deductionToggles } = data;
        if (!payrollData[employeeId]) payrollData[employeeId] = {};
        if (!payrollData[employeeId][year]) payrollData[employeeId][year] = {};
        payrollData[employeeId][year][month] = { earnings, deductions, deductionToggles };
      });

      return payrollData;
    } catch (error) {
      console.error('Error getting payroll data:', error);
      throw error;
    }
  },

  async getSharedPayrollData(userEmail) {
    try {
      const q = query(collection(db, 'sharedPayrollData'), where('toEmail', '==', userEmail.toLowerCase().trim()));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting shared payroll data:', error);
      throw error;
    }
  },

  async getSharingHistory(userId) {
    try {
      const q = query(collection(db, 'sharedPayrollData'), where('fromUserId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting sharing history:', error);
      throw error;
    }
  },

  async updateUserProfile(userId, userData) {
    try {
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, { ...userData, lastUpdated: serverTimestamp() }, { merge: true });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  async getUserProfile(userId) {
    try {
      const userDocRef = doc(db, 'users', userId);
      const docSnap = await getDoc(userDocRef);
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
};
