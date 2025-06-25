class ElectronService {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.electronAPI;
  }

  // Company methods
  async getCompanies(userId) {
    if (!this.isElectron) throw new Error('Electron API not available');
    return await window.electronAPI.getCompanies(userId);
  }

  async saveCompany(userId, companyData) {
    if (!this.isElectron) throw new Error('Electron API not available');
    return await window.electronAPI.saveCompany(userId, companyData);
  }

  async deleteCompany(userId, companyId) {
    if (!this.isElectron) throw new Error('Electron API not available');
    return await window.electronAPI.deleteCompany(userId, companyId);
  }

  // Employee methods
  async getEmployees(userId) {
    if (!this.isElectron) throw new Error('Electron API not available');
    return await window.electronAPI.getEmployees(userId);
  }

  async saveEmployee(userId, employeeData) {
    if (!this.isElectron) throw new Error('Electron API not available');
    return await window.electronAPI.saveEmployee(userId, employeeData);
  }

  async deleteEmployee(userId, employeeId) {
    if (!this.isElectron) throw new Error('Electron API not available');
    return await window.electronAPI.deleteEmployee(userId, employeeId);
  }

  // Payroll methods
  async getAllPayrollData(userId) {
    if (!this.isElectron) throw new Error('Electron API not available');
    return await window.electronAPI.getAllPayrollData(userId);
  }

  async saveMonthlyData(userId, employeeId, year, month, data) {
    if (!this.isElectron) throw new Error('Electron API not available');
    return await window.electronAPI.saveMonthlyData(userId, employeeId, year, month, data);
  }
}

export const electronService = new ElectronService();