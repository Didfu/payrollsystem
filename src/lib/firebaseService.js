import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from './firebase';

export const firebaseService = {
  async getCompanies(userId) {
    try {
      const templatesRef = collection(db, 'companyTemplates');
      const templatesSnapshot = await getDocs(templatesRef);
      return templatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isTemplate: true
      }));
    } catch (error) {
      console.error('Error getting companies:', error);
      throw error;
    }
  },

  async getCompanyByName(name) {
    try {
      const templatesRef = collection(db, 'companyTemplates');
      const snapshot = await getDocs(templatesRef);
      return snapshot.docs.find(doc =>
        doc.data().name.toLowerCase().trim() === name.toLowerCase().trim()
      );
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

      return {
        id: docRef.id,
        ...companyData,
        isTemplate: true
      };
    } catch (error) {
      console.error('Error adding company:', error);
      throw error;
    }
  },

  async updateCompany(userId, companyId, companyData) {
    try {
      const companyRef = doc(db, 'companyTemplates', companyId);
      await setDoc(companyRef, {
        ...companyData,
        updatedBy: userId,
        updatedAt: serverTimestamp()
      }, { merge: true });

      return {
        id: companyId,
        ...companyData
      };
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },

  async getCompanyById(userId, companyId) {
    try {
      const companyRef = doc(db, 'companyTemplates', companyId);
      const companyDoc = await getDoc(companyRef);

      if (companyDoc.exists()) {
        return {
          id: companyDoc.id,
          ...companyDoc.data()
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting company by ID:', error);
      throw error;
    }
  },

  async saveEmployee(userId, employeeData) {
    try {
      const employeesRef = collection(db, 'users', userId, 'employees');
      if (employeeData.companyId) {
        const companyRef = doc(db, 'companyTemplates', employeeData.companyId);
        const companyDoc = await getDoc(companyRef);
        if (!companyDoc.exists()) {
          throw new Error('Selected company does not exist');
        }
      }

      if (employeeData.id) {
        const employeeDocRef = doc(employeesRef, employeeData.id);
        await setDoc(employeeDocRef, {
          ...employeeData,
          updatedAt: serverTimestamp()
        }, { merge: true });
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
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting employees:', error);
      throw error;
    }
  },

  async getEmployeesByCompany(userId, companyId) {
    try {
      const employeesRef = collection(db, 'users', userId, 'employees');
      const q = query(employeesRef, where('companyId', '==', companyId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting employees by company:', error);
      throw error;
    }
  },

  async deleteEmployee(userId, employeeId) {
    try {
      const employeeDocRef = doc(db, 'users', userId, 'employees', employeeId);
      await deleteDoc(employeeDocRef);

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
      const payrollRef = collection(db, 'users', userId, 'monthlyPayrollData');
      const snapshot = await getDocs(payrollRef);

      const payrollData = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const { employeeId, year, month, earnings, deductions, deductionToggles } = data;

        if (!payrollData[employeeId]) payrollData[employeeId] = {};
        if (!payrollData[employeeId][year]) payrollData[employeeId][year] = {};

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

  async sharePayrollData(fromUserId, toEmail, employeeId) {
    try {
      if (!fromUserId || !toEmail || !employeeId) throw new Error('Missing required parameters');

      const employeeDocRef = doc(db, 'users', String(fromUserId), 'employees', String(employeeId));
      const employeeDoc = await getDoc(employeeDocRef);
      if (!employeeDoc.exists()) throw new Error('Employee not found');

      const employeeData = { id: employeeDoc.id, ...employeeDoc.data() };

      let companyData = null;
      if (employeeData.companyId) {
        try {
          companyData = await this.getCompanyById(fromUserId, employeeData.companyId);
        } catch {}
      }

      const payrollRef = collection(db, 'users', String(fromUserId), 'monthlyPayrollData');
      const payrollSnapshot = await getDocs(payrollRef);

      const employeePayrollData = {};
      payrollSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (String(data.employeeId).trim() === String(employeeId).trim()) {
          const { year, month, earnings, deductions, deductionToggles } = data;
          let parsedYear = parseInt(String(year).split('-')[0]);
          if (isNaN(parsedYear) || !month || month === 'NaN' || String(month).trim() === '') return;

          const normalizedYear = String(parsedYear);
          if (!employeePayrollData[normalizedYear]) employeePayrollData[normalizedYear] = {};

          employeePayrollData[normalizedYear][month] = {
            earnings: earnings || {},
            deductions: deductions || {},
            deductionToggles: deductionToggles || {}
          };
        }
      });

      const shareData = { employee: employeeData, company: companyData, payrollData: employeePayrollData };
      const shareRef = collection(db, 'sharedPayrollData');
      await addDoc(shareRef, {
        fromUserId,
        toEmail: toEmail.toLowerCase().trim(),
        shareData,
        sharedAt: serverTimestamp(),
        status: 'pending'
      });

      return true;
    } catch (error) {
      console.error('Error sharing payroll data:', error);
      throw error;
    }
  },

  async getSharedPayrollData(userEmail) {
    try {
      const shareRef = collection(db, 'sharedPayrollData');
      const snapshot = await getDocs(shareRef);
      return snapshot.docs
        .filter(doc => doc.data().toEmail === userEmail.toLowerCase().trim())
        .map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting shared payroll data:', error);
      throw error;
    }
  },

  async acceptSharedData(shareId, userId, shareData) {
    try {
      let companyId = null;

      if (shareData.company) {
        try {
          const existing = await this.getCompanyByName(shareData.company.name);
          if (existing) {
            companyId = existing.id;
          } else {
            const newCompany = await this.addCompany(userId, {
              name: shareData.company.name,
              address: shareData.company.address || '',
              logo: shareData.company.logo || null,
              sharedFrom: shareData.fromUserId
            });
            companyId = newCompany.id;
          }
        } catch {}
      }

      const employeeDocRef = doc(collection(db, 'users', String(userId), 'employees'), String(shareData.employee.id));
      const employeeDataToSave = {
        ...shareData.employee,
        ...(companyId && { companyId }),
        ...(shareData.fromUserId && { sharedFrom: shareData.fromUserId }),
        addedAt: serverTimestamp()
      };
      await setDoc(employeeDocRef, employeeDataToSave, { merge: true });

      if (shareData.payrollData) {
        const payrollPromises = [];
        Object.keys(shareData.payrollData).forEach(year => {
          Object.keys(shareData.payrollData[year]).forEach(month => {
            const employeeId = String(shareData.employee.id);
            let parsedYear = parseInt(String(year).split('-')[0]);
            if (isNaN(parsedYear) || !month || month === 'NaN' || String(month).trim() === '') return;

            const recordId = `${employeeId}_${parsedYear}_${month}`;
            const payrollDocRef = doc(db, 'users', String(userId), 'monthlyPayrollData', recordId);
            payrollPromises.push(setDoc(payrollDocRef, {
              employeeId,
              year: parsedYear,
              month: String(month),
              ...shareData.payrollData[year][month],
              ...(shareData.fromUserId && { sharedFrom: shareData.fromUserId }),
              timestamp: serverTimestamp(),
              updatedAt: serverTimestamp()
            }, { merge: true }));
          });
        });
        await Promise.all(payrollPromises);
      }

      await setDoc(doc(db, 'sharedPayrollData', shareId), {
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

  async getSharingHistory(userId) {
    try {
      const shareRef = collection(db, 'sharedPayrollData');
      const snapshot = await getDocs(shareRef);
      return snapshot.docs
        .filter(doc => doc.data().fromUserId === userId)
        .map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting sharing history:', error);
      throw error;
    }
  },

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
      return docSnap.exists() ? docSnap.data() : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
};