// preload.js
const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loading...');

const electronAPI = {
  //LICENSE MANAGEMENT
  isLicenseValid: () => licenseManager.isLicenseValid(),
  getUser: () => licenseManager.getUser(),
  saveLicense: (data, user) => licenseManager.saveLicense(data, user),
  startTrial: () => licenseManager.startTrial(),
  isTrialActive: () => licenseManager.isTrialActive(),
  // Legacy handlers (for backward compatibility)
  saveData: (data) => ipcRenderer.send('save-data', data),
  getData: () => ipcRenderer.invoke('get-data'),
  getIconPath: () => ipcRenderer.invoke("get-swiftlink-icon"),
  minimize: () => ipcRenderer.send("minimize"),
  maximize: () => ipcRenderer.send("maximize"),
  close: () => ipcRenderer.send("close"),
  onMaximize: (callback) => ipcRenderer.on("is-maximized", callback),
  
  
  // Company handlers
  getCompanies: (userId) => ipcRenderer.invoke('get-companies', userId),
  saveCompany: (userId, companyData) => ipcRenderer.invoke('save-company', userId, companyData),
  deleteCompany: (userId, companyId) => ipcRenderer.invoke('delete-company', userId, companyId),
  
  // New payroll handlers
  getEmployees: (userId) => ipcRenderer.invoke('get-employees', userId),
  saveEmployee: (userId, employeeData) => ipcRenderer.invoke('save-employee', userId, employeeData),
  deleteEmployee: (userId, employeeId) => ipcRenderer.invoke('delete-employee', userId, employeeId),
  getAllPayrollData: (userId) => ipcRenderer.invoke('get-all-payroll-data', userId),
  saveMonthlyData: (userId, employeeId, year, month, data) => 
    ipcRenderer.invoke('save-monthly-data', userId, employeeId, year, month, data),
  
  // PDF download (keeping both names for compatibility)
  downloadPDF: (details) => ipcRenderer.send('download-pdf', details),

};

console.log('Exposing electronAPI with methods:', Object.keys(electronAPI));

try {
  contextBridge.exposeInMainWorld('electronAPI', electronAPI);
  console.log('electronAPI successfully exposed to main world');
} catch (error) {
  console.error('Failed to expose electronAPI:', error);
}

// Test function to verify API is working
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, checking electronAPI...');
  console.log('window.electronAPI available:', !!window.electronAPI);
  if (window.electronAPI) {
    console.log('Available methods:', Object.keys(window.electronAPI));
    console.log('saveMonthlyData type:', typeof window.electronAPI.saveMonthlyData);
  }
});