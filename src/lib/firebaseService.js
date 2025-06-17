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
  writeBatch,
  limit,
  orderBy,
  startAfter,
  onSnapshot,
  enableNetwork,
  disableNetwork,
  runTransaction,
  documentId
} from 'firebase/firestore';
import { db } from './firebase';

// Advanced multi-layer caching system
class AdvancedCache {
  constructor() {
    this.memoryCache = new Map();
    this.persistentCache = this.initPersistentCache();
    this.requestCache = new Map(); // For deduplicating concurrent requests
    this.subscribers = new Map(); // For real-time subscriptions
    this.MEMORY_TTL = 5 * 60 * 1000; // 5 minutes
    this.PERSISTENT_TTL = 30 * 60 * 1000; // 30 minutes
    this.MAX_MEMORY_SIZE = 1000;
    this.compressionEnabled = true;
  }

  initPersistentCache() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return {
        get: (key) => {
          try {
            const item = localStorage.getItem(`fb_cache_${key}`);
            if (!item) return null;
            const parsed = JSON.parse(item);
            if (Date.now() - parsed.timestamp > this.PERSISTENT_TTL) {
              localStorage.removeItem(`fb_cache_${key}`);
              return null;
            }
            return this.compressionEnabled ? this.decompress(parsed.data) : parsed.data;
          } catch { return null; }
        },
        set: (key, data) => {
          try {
            const item = {
              data: this.compressionEnabled ? this.compress(data) : data,
              timestamp: Date.now()
            };
            localStorage.setItem(`fb_cache_${key}`, JSON.stringify(item));
          } catch { /* Storage full, ignore */ }
        },
        delete: (key) => localStorage.removeItem(`fb_cache_${key}`)
      };
    }
    return { get: () => null, set: () => {}, delete: () => {} };
  }

  compress(data) {
    // Simple compression for repeated keys
    const str = JSON.stringify(data);
    return str.length > 1000 ? this.lzCompress(str) : str;
  }

  decompress(data) {
    return typeof data === 'string' && data.startsWith('LZ:') ? 
      JSON.parse(this.lzDecompress(data)) : 
      (typeof data === 'string' ? JSON.parse(data) : data);
  }

  lzCompress(str) {
    // Simple LZ compression
    const dict = {};
    let data = str.split('');
    let output = [];
    let currChar, phrase = data[0], code = 256;
    
    for (let i = 1; i < data.length; i++) {
      currChar = data[i];
      if (dict[phrase + currChar] != null) {
        phrase += currChar;
      } else {
        output.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        dict[phrase + currChar] = code++;
        phrase = currChar;
      }
    }
    output.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    return 'LZ:' + output.join(',');
  }

  lzDecompress(compressed) {
    const data = compressed.slice(3).split(',').map(Number);
    const dict = {};
    let currChar, phrase, output = [String.fromCharCode(data[0])], code = 256;
    
    for (let i = 1; i < data.length; i++) {
      const currCode = data[i];
      if (currCode < 256) {
        currChar = String.fromCharCode(currCode);
      } else {
        currChar = dict[currCode] || (phrase + phrase.charAt(0));
      }
      output.push(currChar);
      phrase = output[output.length - 2];
      dict[code++] = phrase + currChar.charAt(0);
    }
    return output.join('');
  }

  getCacheKey(...params) {
    return params.join('_').replace(/[^a-zA-Z0-9_]/g, '_');
  }

  get(key) {
    // Try memory cache first
    const memoryItem = this.memoryCache.get(key);
    if (memoryItem && (Date.now() - memoryItem.timestamp) < this.MEMORY_TTL) {
      return memoryItem.data;
    }

    // Try persistent cache
    const persistentData = this.persistentCache.get(key);
    if (persistentData) {
      // Promote to memory cache
      this.setMemory(key, persistentData);
      return persistentData;
    }

    return null;
  }

  set(key, data) {
    this.setMemory(key, data);
    this.persistentCache.set(key, data);
  }

  setMemory(key, data) {
    // Implement LRU eviction
    if (this.memoryCache.size >= this.MAX_MEMORY_SIZE) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
    this.memoryCache.set(key, { data, timestamp: Date.now() });
  }

  delete(key) {
    this.memoryCache.delete(key);
    this.persistentCache.delete(key);
  }

  clear(pattern) {
    if (pattern) {
      Array.from(this.memoryCache.keys()).forEach(key => {
        if (key.includes(pattern)) this.memoryCache.delete(key);
      });
    } else {
      this.memoryCache.clear();
    }
  }

  // Request deduplication
  async dedupRequest(key, requestFn) {
    if (this.requestCache.has(key)) {
      return this.requestCache.get(key);
    }

    const promise = requestFn().finally(() => {
      this.requestCache.delete(key);
    });

    this.requestCache.set(key, promise);
    return promise;
  }

  // Real-time subscriptions with automatic cleanup
  subscribe(key, query, callback) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).unsubscribe();
    }

    const unsubscribe = onSnapshot(query, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      this.set(key, data);
      callback(data);
    }, (error) => {
      console.error(`Subscription error for ${key}:`, error);
    });

    this.subscribers.set(key, { unsubscribe, timestamp: Date.now() });
    
    // Auto cleanup old subscriptions
    setTimeout(() => {
      if (this.subscribers.has(key)) {
        this.subscribers.get(key).unsubscribe();
        this.subscribers.delete(key);
      }
    }, 10 * 60 * 1000); // 10 minutes

    return unsubscribe;
  }

  unsubscribe(key) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).unsubscribe();
      this.subscribers.delete(key);
    }
  }
}

// Connection management
// Connection management
class ConnectionManager {
  constructor() {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.pendingWrites = [];
      this.setupEventListeners();
    } else {
      this.isOnline = true; // Assume online on server
      this.pendingWrites = [];
    }
  }

  setupEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processPendingWrites();
        enableNetwork(db);
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        disableNetwork(db);
      });
    }
  }

  async processPendingWrites() {
    while (this.pendingWrites.length > 0) {
      const write = this.pendingWrites.shift();
      try {
        await write();
      } catch (error) {
        console.error('Failed to process pending write:', error);
        this.pendingWrites.unshift(write); // Put it back
        break;
      }
    }
  }

  addPendingWrite(writeFn) {
    this.pendingWrites.push(writeFn);
  }
}


// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  startTimer(operation) {
    const key = `${operation}_${Date.now()}`;
    this.metrics.set(key, { start: performance.now(), operation });
    return key;
  }

  endTimer(key) {
    const metric = this.metrics.get(key);
    if (metric) {
      const duration = performance.now() - metric.start;
      console.log(`🚀 ${metric.operation}: ${duration.toFixed(2)}ms`);
      this.metrics.delete(key);
      return duration;
    }
  }

  logSlowOperation(operation, duration, threshold = 1000) {
    if (duration > threshold) {
      console.warn(`⚠️ Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
    }
  }
}

// Initialize singletons
const cache = new AdvancedCache();
const connectionManager = new ConnectionManager();
const perfMonitor = new PerformanceMonitor();

// Optimized batch processor
class BatchProcessor {
  constructor() {
    this.batches = new Map();
    this.batchSize = 500; // Firestore limit
    this.flushInterval = 100; // ms
  }

  addToBatch(batchKey, operation) {
    if (!this.batches.has(batchKey)) {
      this.batches.set(batchKey, []);
      // Auto-flush after interval
      setTimeout(() => this.flush(batchKey), this.flushInterval);
    }

    const batch = this.batches.get(batchKey);
    batch.push(operation);

    // Auto-flush when batch is full
    if (batch.length >= this.batchSize) {
      this.flush(batchKey);
    }
  }

  async flush(batchKey) {
    const operations = this.batches.get(batchKey);
    if (!operations || operations.length === 0) return;

    this.batches.delete(batchKey);

    try {
      const batch = writeBatch(db);
      operations.forEach(op => op(batch));
      await batch.commit();
    } catch (error) {
      console.error(`Batch ${batchKey} failed:`, error);
      throw error;
    }
  }

  async flushAll() {
    const promises = Array.from(this.batches.keys()).map(key => this.flush(key));
    await Promise.all(promises);
  }
}

const batchProcessor = new BatchProcessor();

export const firebaseService = {
  // Connection management
  async ensureConnection() {
    if (!connectionManager.isOnline) {
      throw new Error('No internet connection');
    }
  },

  // Ultra-optimized company operations
  async getCompanies(userId, options = {}) {
    const timer = perfMonitor.startTimer('getCompanies');
    const cacheKey = cache.getCacheKey('companies', userId, JSON.stringify(options));
    
    try {
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached && !options.forceRefresh) {
        perfMonitor.endTimer(timer);
        return cached;
      }

      // Deduplicate concurrent requests
      return await cache.dedupRequest(cacheKey, async () => {
        const templatesRef = collection(db, 'companyTemplates');
        let q = query(templatesRef);

        // Apply filters and pagination
        if (options.limit) q = query(q, limit(options.limit));
        if (options.orderBy) q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
        if (options.startAfter) q = query(q, startAfter(options.startAfter));

        const snapshot = await getDocs(q);
        const companies = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isTemplate: true
        }));

        cache.set(cacheKey, companies);
        perfMonitor.endTimer(timer);
        return companies;
      });
    } catch (error) {
      perfMonitor.endTimer(timer);
      throw error;
    }
  },

  async getCompanyByName(name, useIndex = true) {
    const timer = perfMonitor.startTimer('getCompanyByName');
    const normalizedName = name.toLowerCase().trim();
    const cacheKey = cache.getCacheKey('companyByName', normalizedName);

    try {
      const cached = cache.get(cacheKey);
      if (cached) {
        perfMonitor.endTimer(timer);
        return cached;
      }

      return await cache.dedupRequest(cacheKey, async () => {
        const templatesRef = collection(db, 'companyTemplates');
        
        let q;
        if (useIndex) {
          // Use indexed query for better performance
          q = query(templatesRef, where('nameLower', '==', normalizedName), limit(1));
        } else {
          // Fallback to array-contains for partial matches
          q = query(templatesRef, limit(100)); // Get limited set and filter client-side
        }

        const snapshot = await getDocs(q);
        let result = null;

        if (useIndex) {
          result = snapshot.docs[0] || null;
        } else {
          // Client-side filtering for exact match
          result = snapshot.docs.find(doc => 
            doc.data().name?.toLowerCase().trim() === normalizedName
          ) || null;
        }

        cache.set(cacheKey, result);
        perfMonitor.endTimer(timer);
        return result;
      });
    } catch (error) {
      perfMonitor.endTimer(timer);
      console.error('Error in getCompanyByName:', error);
      return null;
    }
  },

  async addCompany(userId, companyData, options = {}) {
    const timer = perfMonitor.startTimer('addCompany');
    
    try {
      await this.ensureConnection();

      // Optimistic validation
      if (!options.skipValidation) {
        const existing = await this.getCompanyByName(companyData.name);
        if (existing) throw new Error('A company with this name already exists');
      }

      const docData = {
        ...companyData,
        nameLower: companyData.name.toLowerCase().trim(),
        searchTerms: this.generateSearchTerms(companyData.name),
        createdBy: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isTemplate: true
      };

      let result;
      if (options.useBatch) {
        // Add to batch for bulk operations
        const docRef = doc(collection(db, 'companyTemplates'));
        batchProcessor.addToBatch('companies', (batch) => {
          batch.set(docRef, docData);
        });
        result = { id: docRef.id, ...companyData, isTemplate: true };
      } else {
        const docRef = await addDoc(collection(db, 'companyTemplates'), docData);
        result = { id: docRef.id, ...companyData, isTemplate: true };
      }

      // Smart cache invalidation
      this.invalidateRelatedCaches(['companies', 'companyByName'], userId);

      perfMonitor.endTimer(timer);
      return result;
    } catch (error) {
      perfMonitor.endTimer(timer);
      throw error;
    }
  },

  async updateCompany(userId, companyId, companyData, options = {}) {
    const timer = perfMonitor.startTimer('updateCompany');
    
    try {
      await this.ensureConnection();

      const updateData = {
        ...companyData,
        updatedBy: userId,
        updatedAt: serverTimestamp()
      };

      if (companyData.name) {
        updateData.nameLower = companyData.name.toLowerCase().trim();
        updateData.searchTerms = this.generateSearchTerms(companyData.name);
      }

      if (options.useTransaction) {
        await runTransaction(db, async (transaction) => {
          const companyRef = doc(db, 'companyTemplates', companyId);
          const companyDoc = await transaction.get(companyRef);
          
          if (!companyDoc.exists()) {
            throw new Error('Company not found');
          }

          transaction.set(companyRef, updateData, { merge: true });
        });
      } else {
        const companyRef = doc(db, 'companyTemplates', companyId);
        await setDoc(companyRef, updateData, { merge: true });
      }

      this.invalidateRelatedCaches(['companies', 'company', 'companyByName'], userId, companyId);

      perfMonitor.endTimer(timer);
      return { id: companyId, ...companyData };
    } catch (error) {
      perfMonitor.endTimer(timer);
      throw error;
    }
  },

  async getCompanyById(userId, companyId, useRealtime = false) {
    const timer = perfMonitor.startTimer('getCompanyById');
    const cacheKey = cache.getCacheKey('company', companyId);

    try {
      if (!useRealtime) {
        const cached = cache.get(cacheKey);
        if (cached) {
          perfMonitor.endTimer(timer);
          return cached;
        }
      }

      return await cache.dedupRequest(cacheKey, async () => {
        const companyRef = doc(db, 'companyTemplates', companyId);
        const companyDoc = await getDoc(companyRef);

        const result = companyDoc.exists() ? {
          id: companyDoc.id,
          ...companyDoc.data()
        } : null;

        if (!useRealtime) {
          cache.set(cacheKey, result);
        }

        perfMonitor.endTimer(timer);
        return result;
      });
    } catch (error) {
      perfMonitor.endTimer(timer);
      throw error;
    }
  },

  // Ultra-optimized employee operations with pagination and real-time updates
  async getEmployees(userId, options = {}) {
    const timer = perfMonitor.startTimer('getEmployees');
    const cacheKey = cache.getCacheKey('employees', userId, JSON.stringify(options));

    try {
      if (options.realtime) {
        // Set up real-time subscription
        const employeesRef = collection(db, 'users', userId, 'employees');
        let q = query(employeesRef, orderBy('createdAt', 'desc'));
        
        if (options.limit) q = query(q, limit(options.limit));
        if (options.startAfter) q = query(q, startAfter(options.startAfter));

        return cache.subscribe(cacheKey, q, options.callback || (() => {}));
      }

      const cached = cache.get(cacheKey);
      if (cached && !options.forceRefresh) {
        perfMonitor.endTimer(timer);
        return cached;
      }

      return await cache.dedupRequest(cacheKey, async () => {
        const employeesRef = collection(db, 'users', userId, 'employees');
        let q = query(employeesRef, orderBy('createdAt', 'desc'));

        if (options.limit) q = query(q, limit(options.limit));
        if (options.startAfter) q = query(q, startAfter(options.startAfter));
        if (options.companyId) q = query(q, where('companyId', '==', options.companyId));

        const snapshot = await getDocs(q);
        const employees = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        cache.set(cacheKey, employees);
        perfMonitor.endTimer(timer);
        return employees;
      });
    } catch (error) {
      perfMonitor.endTimer(timer);
      throw error;
    }
  },

  async saveEmployee(userId, employeeData, options = {}) {
    const timer = perfMonitor.startTimer('saveEmployee');
    
    try {
      await this.ensureConnection();

      // Parallel validation
      const validationPromises = [];
      if (employeeData.companyId && !options.skipCompanyValidation) {
        validationPromises.push(
          this.getCompanyById(userId, employeeData.companyId).then(company => {
            if (!company) throw new Error('Selected company does not exist');
          })
        );
      }

      await Promise.all(validationPromises);

      const employeesRef = collection(db, 'users', userId, 'employees');
      let docId;

      if (employeeData.id) {
        // Update existing
        const employeeDocRef = doc(employeesRef, employeeData.id);
        const updateData = {
          ...employeeData,
          updatedAt: serverTimestamp()
        };

        if (options.useTransaction) {
          await runTransaction(db, async (transaction) => {
            const employeeDoc = await transaction.get(employeeDocRef);
            if (!employeeDoc.exists()) {
              throw new Error('Employee not found');
            }
            transaction.set(employeeDocRef, updateData, { merge: true });
          });
        } else {
          await setDoc(employeeDocRef, updateData, { merge: true });
        }
        docId = employeeData.id;
      } else {
        // Create new
        const newEmployeeData = {
          ...employeeData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        if (options.useBatch) {
          const docRef = doc(employeesRef);
          batchProcessor.addToBatch('employees', (batch) => {
            batch.set(docRef, newEmployeeData);
          });
          docId = docRef.id;
        } else {
          const docRef = await addDoc(employeesRef, newEmployeeData);
          docId = docRef.id;
        }
      }

      this.invalidateRelatedCaches(['employees', 'employeesByCompany'], userId);

      perfMonitor.endTimer(timer);
      return docId;
    } catch (error) {
      perfMonitor.endTimer(timer);
      throw error;
    }
  },

  async deleteEmployee(userId, employeeId, options = {}) {
    const timer = perfMonitor.startTimer('deleteEmployee');
    
    try {
      await this.ensureConnection();

      if (options.useTransaction) {
        await runTransaction(db, async (transaction) => {
          // Delete employee
          const employeeRef = doc(db, 'users', userId, 'employees', employeeId);
          transaction.delete(employeeRef);

          // Get and delete payroll data
          const payrollRef = collection(db, 'users', userId, 'monthlyPayrollData');
          const payrollQuery = query(payrollRef, where('employeeId', '==', employeeId));
          const payrollSnapshot = await getDocs(payrollQuery);
          
          payrollSnapshot.docs.forEach(doc => {
            transaction.delete(doc.ref);
          });
        });
      } else {
        // Use batch for better performance
        const batch = writeBatch(db);

        // Delete employee
        const employeeRef = doc(db, 'users', userId, 'employees', employeeId);
        batch.delete(employeeRef);

        // Delete related payroll data
        const payrollRef = collection(db, 'users', userId, 'monthlyPayrollData');
        const payrollQuery = query(payrollRef, where('employeeId', '==', employeeId));
        const payrollSnapshot = await getDocs(payrollQuery);
        
        payrollSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
      }

      this.invalidateRelatedCaches(['employees', 'employeesByCompany', 'payrollData'], userId);

      perfMonitor.endTimer(timer);
    } catch (error) {
      perfMonitor.endTimer(timer);
      throw error;
    }
  },

  // Advanced payroll operations with aggregation
  async getAllPayrollData(userId, options = {}) {
    const timer = perfMonitor.startTimer('getAllPayrollData');
    const cacheKey = cache.getCacheKey('payrollData', userId, JSON.stringify(options));

    try {
      const cached = cache.get(cacheKey);
      if (cached && !options.forceRefresh) {
        perfMonitor.endTimer(timer);
        return cached;
      }

      return await cache.dedupRequest(cacheKey, async () => {
        const payrollRef = collection(db, 'users', userId, 'monthlyPayrollData');
        let q = query(payrollRef, orderBy('year', 'desc'), orderBy('month', 'desc'));

        // Apply filters
        if (options.employeeId) q = query(q, where('employeeId', '==', options.employeeId));
        if (options.year) q = query(q, where('year', '==', options.year));
        if (options.limit) q = query(q, limit(options.limit));

        const snapshot = await getDocs(q);
        const payrollData = {};

        // Optimized grouping
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          const { employeeId, year, month, earnings, deductions, deductionToggles } = data;

          payrollData[employeeId] ??= {};
          payrollData[employeeId][year] ??= {};
          payrollData[employeeId][year][month] = {
            earnings: earnings || {},
            deductions: deductions || {},
            deductionToggles: deductionToggles || {}
          };
        });

        cache.set(cacheKey, payrollData);
        perfMonitor.endTimer(timer);
        return payrollData;
      });
    } catch (error) {
      perfMonitor.endTimer(timer);
      throw error;
    }
  },

  async saveMonthlyData(userId, employeeId, year, month, data, options = {}) {
    const timer = perfMonitor.startTimer('saveMonthlyData');
    
    try {
      await this.ensureConnection();

      const recordId = `${employeeId}_${year}_${month}`;
      const payrollDocRef = doc(db, 'users', userId, 'monthlyPayrollData', recordId);
      
      const saveData = {
        employeeId,
        year,
        month,
        ...data,
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (options.useBatch) {
        batchProcessor.addToBatch('payroll', (batch) => {
          batch.set(payrollDocRef, saveData, { merge: true });
        });
      } else {
        await setDoc(payrollDocRef, saveData, { merge: true });
      }

      this.invalidateRelatedCaches(['payrollData'], userId);

      perfMonitor.endTimer(timer);
      return recordId;
    } catch (error) {
      perfMonitor.endTimer(timer);
      throw error;
    }
  },

  // Optimized bulk operations
  async bulkSaveEmployees(userId, employees) {
    const timer = perfMonitor.startTimer('bulkSaveEmployees');
    
    try {
      await this.ensureConnection();

      const batch = writeBatch(db);
      const employeesRef = collection(db, 'users', userId, 'employees');

      employees.forEach(employee => {
        const docRef = employee.id ? doc(employeesRef, employee.id) : doc(employeesRef);
        const employeeData = {
          ...employee,
          ...(employee.id ? { updatedAt: serverTimestamp() } : {
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })
        };
        batch.set(docRef, employeeData, { merge: true });
      });

      await batch.commit();
      this.invalidateRelatedCaches(['employees'], userId);

      perfMonitor.endTimer(timer);
    } catch (error) {
      perfMonitor.endTimer(timer);
      throw error;
    }
  },

  async bulkSavePayrollData(userId, payrollRecords) {
    const timer = perfMonitor.startTimer('bulkSavePayrollData');
    
    try {
      await this.ensureConnection();

      // Process in chunks to avoid batch size limits
      const chunkSize = 450; // Leave some room for safety
      const chunks = [];
      
      for (let i = 0; i < payrollRecords.length; i += chunkSize) {
        chunks.push(payrollRecords.slice(i, i + chunkSize));
      }

      const batchPromises = chunks.map(async (chunk) => {
        const batch = writeBatch(db);
        
        chunk.forEach(record => {
          const { employeeId, year, month, ...data } = record;
          const recordId = `${employeeId}_${year}_${month}`;
          const docRef = doc(db, 'users', userId, 'monthlyPayrollData', recordId);
          
          batch.set(docRef, {
            employeeId,
            year,
            month,
            ...data,
            timestamp: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true });
        });

        return batch.commit();
      });

      await Promise.all(batchPromises);
      this.invalidateRelatedCaches(['payrollData'], userId);

      perfMonitor.endTimer(timer);
    } catch (error) {
      perfMonitor.endTimer(timer);
      throw error;
    }
  },

  // Advanced sharing with compression
  async sharePayrollData(fromUserId, toEmail, employeeId, options = {}) {
    const timer = perfMonitor.startTimer('sharePayrollData');
    
    try {
      await this.ensureConnection();

      if (!fromUserId || !toEmail || !employeeId) {
        throw new Error('Missing required parameters');
      }

      // Parallel data fetching
      const [employeeDoc, payrollSnapshot] = await Promise.all([
        getDoc(doc(db, 'users', String(fromUserId), 'employees', String(employeeId))),
        getDocs(query(
          collection(db, 'users', String(fromUserId), 'monthlyPayrollData'),
          where('employeeId', '==', String(employeeId)),
          orderBy('year', 'desc'),
          orderBy('month', 'desc')
        ))
      ]);

      if (!employeeDoc.exists()) throw new Error('Employee not found');

      const employeeData = { id: employeeDoc.id, ...employeeDoc.data() };

      // Get company data if needed
      let companyData = null;
      if (employeeData.companyId) {
        companyData = await this.getCompanyById(fromUserId, employeeData.companyId);
      }

      // Optimize payroll data processing
     const employeePayrollData = {};
     payrollSnapshot.docs.forEach(doc => {
       const data = doc.data();
       const { year, month, earnings, deductions, deductionToggles } = data;
       const parsedYear = parseInt(String(year).split('-')[0]);
       
       if (isNaN(parsedYear) || !month || month === 'NaN' || String(month).trim() === '') return;

       const normalizedYear = String(parsedYear);
       employeePayrollData[normalizedYear] ??= {};
       employeePayrollData[normalizedYear][month] = {
         earnings: earnings || {},
         deductions: deductions || {},
         deductionToggles: deductionToggles || {}
       };
     });

     const shareData = { 
       employee: employeeData, 
       company: companyData, 
       payrollData: employeePayrollData 
     };

     // Compress large datasets
     const compressedShareData = options.compress !== false && 
       JSON.stringify(shareData).length > 10000 ? 
       cache.compress(shareData) : shareData;

     await addDoc(collection(db, 'sharedPayrollData'), {
       fromUserId,
       toEmail: toEmail.toLowerCase().trim(),
       shareData: compressedShareData,
       isCompressed: typeof compressedShareData === 'string',
       sharedAt: serverTimestamp(),
       status: 'pending',
       expiresAt: options.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
     });

     perfMonitor.endTimer(timer);
     return true;
   } catch (error) {
     perfMonitor.endTimer(timer);
     throw error;
   }
 },

 async getSharedPayrollData(userEmail, options = {}) {
   const timer = perfMonitor.startTimer('getSharedPayrollData');
   const normalizedEmail = userEmail.toLowerCase().trim();
   const cacheKey = cache.getCacheKey('sharedData', normalizedEmail, JSON.stringify(options));

   try {
     if (!options.forceRefresh) {
       const cached = cache.get(cacheKey);
       if (cached) {
         perfMonitor.endTimer(timer);
         return cached;
       }
     }

     return await cache.dedupRequest(cacheKey, async () => {
       const shareRef = collection(db, 'sharedPayrollData');
       let q = query(
         shareRef, 
         where('toEmail', '==', normalizedEmail),
         orderBy('sharedAt', 'desc')
       );

       // Filter by status if specified
       if (options.status) {
         q = query(q, where('status', '==', options.status));
       }

       if (options.limit) {
         q = query(q, limit(options.limit));
       }

       const snapshot = await getDocs(q);
       const sharedData = snapshot.docs.map(doc => {
         const data = doc.data();
         
         // Decompress if needed
         if (data.isCompressed && typeof data.shareData === 'string') {
           data.shareData = cache.decompress(data.shareData);
         }

         return { id: doc.id, ...data };
       }).filter(item => {
         // Filter out expired items
         if (item.expiresAt && item.expiresAt.toDate() < new Date()) {
           // Optionally clean up expired items
           if (options.cleanupExpired) {
             deleteDoc(doc(db, 'sharedPayrollData', item.id)).catch(console.error);
           }
           return false;
         }
         return true;
       });

       cache.set(cacheKey, sharedData);
       perfMonitor.endTimer(timer);
       return sharedData;
     });
   } catch (error) {
     perfMonitor.endTimer(timer);
     throw error;
   }
 },

 async acceptSharedData(shareId, userId, shareData, options = {}) {
   const timer = perfMonitor.startTimer('acceptSharedData');
   
   try {
     await this.ensureConnection();

     return await runTransaction(db, async (transaction) => {
       let companyId = null;

       // Handle company creation/lookup
       if (shareData.company) {
         const existing = await this.getCompanyByName(shareData.company.name);
         if (existing) {
           companyId = existing.id;
         } else if (!options.skipCompanyCreation) {
           const companyRef = doc(collection(db, 'companyTemplates'));
           transaction.set(companyRef, {
             name: shareData.company.name,
             nameLower: shareData.company.name.toLowerCase().trim(),
             searchTerms: this.generateSearchTerms(shareData.company.name),
             address: shareData.company.address || '',
             logo: shareData.company.logo || null,
             sharedFrom: shareData.fromUserId,
             createdAt: serverTimestamp(),
             updatedAt: serverTimestamp(),
             isTemplate: true
           });
           companyId = companyRef.id;
         }
       }

       // Add employee
       const employeeDocRef = doc(collection(db, 'users', String(userId), 'employees'), String(shareData.employee.id));
       const employeeDataToSave = {
         ...shareData.employee,
         ...(companyId && { companyId }),
         ...(shareData.fromUserId && { sharedFrom: shareData.fromUserId }),
         addedAt: serverTimestamp()
       };
       transaction.set(employeeDocRef, employeeDataToSave, { merge: true });

       // Process payroll data in optimized chunks
       if (shareData.payrollData && !options.skipPayrollData) {
         const payrollOperations = [];
         
         Object.keys(shareData.payrollData).forEach(year => {
           Object.keys(shareData.payrollData[year]).forEach(month => {
             const employeeId = String(shareData.employee.id);
             const parsedYear = parseInt(String(year).split('-')[0]);
             
             if (isNaN(parsedYear) || !month || month === 'NaN' || String(month).trim() === '') return;

             const recordId = `${employeeId}_${parsedYear}_${month}`;
             const payrollDocRef = doc(db, 'users', String(userId), 'monthlyPayrollData', recordId);
             
             payrollOperations.push({
               ref: payrollDocRef,
               data: {
                 employeeId,
                 year: parsedYear,
                 month: String(month),
                 ...shareData.payrollData[year][month],
                 ...(shareData.fromUserId && { sharedFrom: shareData.fromUserId }),
                 timestamp: serverTimestamp(),
                 updatedAt: serverTimestamp()
               }
             });
           });
         });

         // Process payroll in chunks to avoid transaction limits
         const chunkSize = 400; // Conservative limit for transactions
         if (payrollOperations.length > chunkSize) {
           // For large datasets, process initial chunk in transaction, rest in batches
           payrollOperations.slice(0, chunkSize).forEach(op => {
             transaction.set(op.ref, op.data, { merge: true });
           });

           // Schedule remaining operations for batch processing
           const remainingOps = payrollOperations.slice(chunkSize);
           setTimeout(async () => {
             try {
               await this.bulkSavePayrollData(userId, remainingOps.map(op => ({
                 employeeId: op.data.employeeId,
                 year: op.data.year,
                 month: op.data.month,
                 earnings: op.data.earnings,
                 deductions: op.data.deductions,
                 deductionToggles: op.data.deductionToggles,
                 sharedFrom: op.data.sharedFrom
               })));
             } catch (error) {
               console.error('Error processing remaining payroll data:', error);
             }
           }, 100);
         } else {
           payrollOperations.forEach(op => {
             transaction.set(op.ref, op.data, { merge: true });
           });
         }
       }

       // Update share status
       transaction.set(doc(db, 'sharedPayrollData', shareId), {
         status: 'accepted',
         acceptedAt: serverTimestamp(),
         acceptedBy: userId
       }, { merge: true });

       return true;
     });
   } catch (error) {
     perfMonitor.endTimer(timer);
     throw error;
   } finally {
     // Clear relevant caches
     this.invalidateRelatedCaches(['employees', 'payrollData', 'companies', 'sharedData'], userId);
     perfMonitor.endTimer(timer);
   }
 },

 // Advanced search with full-text capabilities
 async searchCompanies(searchTerm, options = {}) {
   const timer = perfMonitor.startTimer('searchCompanies');
   const normalizedTerm = searchTerm.toLowerCase().trim();
   const cacheKey = cache.getCacheKey('searchCompanies', normalizedTerm, JSON.stringify(options));

   try {
     const cached = cache.get(cacheKey);
     if (cached && !options.forceRefresh) {
       perfMonitor.endTimer(timer);
       return cached;
     }

     return await cache.dedupRequest(cacheKey, async () => {
       const templatesRef = collection(db, 'companyTemplates');
       
       // Use multiple query strategies for comprehensive search
       const queries = [
         // Exact name match
         query(templatesRef, where('nameLower', '==', normalizedTerm), limit(options.limit || 10)),
         // Prefix match
         query(
           templatesRef, 
           where('nameLower', '>=', normalizedTerm),
           where('nameLower', '<=', normalizedTerm + '\uf8ff'),
           limit(options.limit || 10)
         ),
         // Search terms array-contains
         query(templatesRef, where('searchTerms', 'array-contains', normalizedTerm), limit(options.limit || 10))
       ];

       const [exactResults, prefixResults, termsResults] = await Promise.all(
         queries.map(q => getDocs(q))
       );

       // Combine and deduplicate results
       const resultMap = new Map();
       const addResults = (snapshot, priority) => {
         snapshot.docs.forEach(doc => {
           const id = doc.id;
           if (!resultMap.has(id)) {
             resultMap.set(id, {
               id,
               ...doc.data(),
               searchPriority: priority,
               isTemplate: true
             });
           }
         });
       };

       addResults(exactResults, 1);
       addResults(prefixResults, 2);
       addResults(termsResults, 3);

       // Sort by relevance and priority
       const results = Array.from(resultMap.values())
         .sort((a, b) => {
           if (a.searchPriority !== b.searchPriority) {
             return a.searchPriority - b.searchPriority;
           }
           // Secondary sort by name similarity
           const aDistance = this.levenshteinDistance(a.name.toLowerCase(), normalizedTerm);
           const bDistance = this.levenshteinDistance(b.name.toLowerCase(), normalizedTerm);
           return aDistance - bDistance;
         })
         .slice(0, options.limit || 50);

       cache.set(cacheKey, results);
       perfMonitor.endTimer(timer);
       return results;
     });
   } catch (error) {
     perfMonitor.endTimer(timer);
     throw error;
   }
 },

 async searchEmployees(userId, searchTerm, options = {}) {
   const timer = perfMonitor.startTimer('searchEmployees');
   const normalizedTerm = searchTerm.toLowerCase().trim();
   const cacheKey = cache.getCacheKey('searchEmployees', userId, normalizedTerm, JSON.stringify(options));

   try {
     const cached = cache.get(cacheKey);
     if (cached && !options.forceRefresh) {
       perfMonitor.endTimer(timer);
       return cached;
     }

     return await cache.dedupRequest(cacheKey, async () => {
       // Get all employees (consider caching this)
       const employees = await this.getEmployees(userId, { limit: 1000 });
       
       // Client-side search for flexibility
       const results = employees.filter(employee => {
         const searchableText = [
           employee.name,
           employee.email,
           employee.phone,
           employee.designation,
           employee.department
         ].join(' ').toLowerCase();

         return searchableText.includes(normalizedTerm);
       }).sort((a, b) => {
         // Sort by relevance
         const aRelevance = this.calculateRelevance(a, normalizedTerm);
         const bRelevance = this.calculateRelevance(b, normalizedTerm);
         return bRelevance - aRelevance;
       }).slice(0, options.limit || 50);

       cache.set(cacheKey, results);
       perfMonitor.endTimer(timer);
       return results;
     });
   } catch (error) {
     perfMonitor.endTimer(timer);
     throw error;
   }
 },

 // Analytics and reporting
 async getPayrollAnalytics(userId, options = {}) {
   const timer = perfMonitor.startTimer('getPayrollAnalytics');
   const cacheKey = cache.getCacheKey('payrollAnalytics', userId, JSON.stringify(options));

   try {
     const cached = cache.get(cacheKey);
     if (cached && !options.forceRefresh) {
       perfMonitor.endTimer(timer);
       return cached;
     }

     return await cache.dedupRequest(cacheKey, async () => {
       const payrollData = await this.getAllPayrollData(userId, options);
       
       const analytics = {
         totalEmployees: Object.keys(payrollData).length,
         monthlyTotals: {},
         employeeTotals: {},
         averages: {},
         trends: {}
       };

       // Calculate analytics
       Object.keys(payrollData).forEach(employeeId => {
         const employeeData = payrollData[employeeId];
         let employeeTotal = 0;

         Object.keys(employeeData).forEach(year => {
           Object.keys(employeeData[year]).forEach(month => {
             const monthData = employeeData[year][month];
             const monthKey = `${year}-${month}`;

             // Calculate month totals
             const earnings = Object.values(monthData.earnings || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
             const deductions = Object.values(monthData.deductions || {}).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
             const netPay = earnings - deductions;

             analytics.monthlyTotals[monthKey] = (analytics.monthlyTotals[monthKey] || 0) + netPay;
             employeeTotal += netPay;
           });
         });

         analytics.employeeTotals[employeeId] = employeeTotal;
       });

       // Calculate averages
       const monthlyValues = Object.values(analytics.monthlyTotals);
       analytics.averages.monthlyPayroll = monthlyValues.length > 0 ? 
         monthlyValues.reduce((sum, val) => sum + val, 0) / monthlyValues.length : 0;

       const employeeValues = Object.values(analytics.employeeTotals);
       analytics.averages.employeePay = employeeValues.length > 0 ?
         employeeValues.reduce((sum, val) => sum + val, 0) / employeeValues.length : 0;

       cache.set(cacheKey, analytics);
       perfMonitor.endTimer(timer);
       return analytics;
     });
   } catch (error) {
     perfMonitor.endTimer(timer);
     throw error;
   }
 },

 // Utility methods
 generateSearchTerms(name) {
   const terms = [];
   const words = name.toLowerCase().split(/\s+/);
   
   // Individual words
   terms.push(...words);
   
   // Prefixes
   words.forEach(word => {
     for (let i = 1; i <= word.length; i++) {
       terms.push(word.substring(0, i));
     }
   });

   // Remove duplicates and empty strings
   return [...new Set(terms.filter(term => term.length > 0))];
 },

 levenshteinDistance(str1, str2) {
   const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
   
   for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
   for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
   
   for (let j = 1; j <= str2.length; j++) {
     for (let i = 1; i <= str1.length; i++) {
       const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
       matrix[j][i] = Math.min(
         matrix[j][i - 1] + 1,
         matrix[j - 1][i] + 1,
         matrix[j - 1][i - 1] + cost
       );
     }
   }
   
   return matrix[str2.length][str1.length];
 },

 calculateRelevance(employee, searchTerm) {
   let relevance = 0;
   const term = searchTerm.toLowerCase();
   
   if (employee.name?.toLowerCase().includes(term)) relevance += 10;
   if (employee.name?.toLowerCase().startsWith(term)) relevance += 5;
   if (employee.email?.toLowerCase().includes(term)) relevance += 8;
   if (employee.designation?.toLowerCase().includes(term)) relevance += 6;
   if (employee.department?.toLowerCase().includes(term)) relevance += 4;
   
   return relevance;
 },

 invalidateRelatedCaches(cacheTypes, ...params) {
   cacheTypes.forEach(type => {
     const pattern = params.length > 0 ? 
       cache.getCacheKey(type, ...params) : type;
     cache.clear(pattern);
   });
 },

 // Performance and maintenance
 async optimizeFirestore() {
   const timer = perfMonitor.startTimer('optimizeFirestore');
   
   try {
     // Clean up expired shared data
     const expiredQuery = query(
       collection(db, 'sharedPayrollData'),
       where('expiresAt', '<', new Date())
     );
     
     const expiredSnapshot = await getDocs(expiredQuery);
     if (expiredSnapshot.docs.length > 0) {
       const batch = writeBatch(db);
       expiredSnapshot.docs.forEach(doc => batch.delete(doc.ref));
       await batch.commit();
     }

     // Flush pending batches
     await batchProcessor.flushAll();
     
     perfMonitor.endTimer(timer);
     return {
       expiredDataCleaned: expiredSnapshot.docs.length,
       batchesFlushed: true
     };
   } catch (error) {
     perfMonitor.endTimer(timer);
     throw error;
   }
 },

 getPerformanceMetrics() {
   return {
     cacheSize: cache.memoryCache.size,
     activeSubscriptions: cache.subscribers.size,
     pendingRequests: cache.requestCache.size,
     connectionStatus: connectionManager.isOnline,
     pendingWrites: connectionManager.pendingWrites.length
   };
 },

 // Cleanup methods
 cleanup() {
   // Unsubscribe from all real-time listeners
   cache.subscribers.forEach(({ unsubscribe }) => unsubscribe());
   cache.subscribers.clear();
   
   // Clear caches
   cache.clear();
   
   // Flush any pending batches
   batchProcessor.flushAll().catch(console.error);
 },

 // Development helpers
 enableDebugMode() {
   window.firebaseServiceDebug = {
     cache,
     connectionManager,
     perfMonitor,
     batchProcessor
   };
   console.log('🔧 Firebase Service Debug Mode Enabled');
 }
};

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    firebaseService.cleanup();
  });

  // Periodic cleanup
  setInterval(() => {
    firebaseService.optimizeFirestore().catch(console.error);
  }, 10 * 60 * 1000); // Every 10 minutes
}


// Export additional utilities
export const cacheManager = cache;
export const performanceMonitor = perfMonitor;
export const connectionManagerInstance = connectionManager;