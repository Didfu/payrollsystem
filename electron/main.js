const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,               
    frame: true, 
    icon: path.join(__dirname, "icon.ico"), 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
win.maximize();
  if (isDev) {
    win.loadURL('http://localhost:3000');
    // Open DevTools in development
    win.webContents.openDevTools();
  } else {
    // In production, load the static Next.js files
    win.loadFile(path.join(__dirname, '../out/index.html'));
  }
}

// Utility functions for data management
const getDataPath = () => {
  return path.join(app.getPath('userData'), 'payroll-data');
};

const ensureDataDirectory = async () => {
  const dataPath = getDataPath();
  try {
    await fsPromises.access(dataPath);
  } catch {
    await fsPromises.mkdir(dataPath, { recursive: true });
  }
};
ipcMain.on("minimize", (e) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.minimize();
});

ipcMain.on("maximize", (e) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  }
});

// Emit maximize/unmaximize events
app.whenReady().then(() => {
  const win = BrowserWindow.getFocusedWindow();

  if (win) {
    win.on("maximize", () => {
      win.webContents.send("is-maximized", true);
    });
    win.on("unmaximize", () => {
      win.webContents.send("is-maximized", false);
    });
  }
});



ipcMain.on("close", (e) => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) win.close();
});
// Company management IPC handlers
ipcMain.handle('get-companies', async (event, userId) => {
  try {
    await ensureDataDirectory();
    const filePath = path.join(getDataPath(), `companies-${userId}.json`);
    
    const data = await fsPromises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return []; // Return empty array if file doesn't exist
    }
    console.error('Error getting companies:', error);
    throw error;
  }
});

ipcMain.handle('save-company', async (event, userId, companyData) => {
  try {
    await ensureDataDirectory();
    const filePath = path.join(getDataPath(), `companies-${userId}.json`);
    
    let companies = [];
    try {
      const data = await fsPromises.readFile(filePath, 'utf8');
      companies = JSON.parse(data);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    
    if (companyData.id) {
      const index = companies.findIndex(comp => comp.id === companyData.id);
      if (index !== -1) {
        companies[index] = companyData;
      } else {
        companies.push(companyData);
      }
    } else {
      companyData.id = Date.now().toString();
      companies.push(companyData);
    }
    
    await fsPromises.writeFile(filePath, JSON.stringify(companies, null, 2));
    return companyData;
  } catch (error) {
    console.error('Error saving company:', error);
    throw error;
  }
});

ipcMain.handle('delete-company', async (event, userId, companyId) => {
  try {
    await ensureDataDirectory();
    const filePath = path.join(getDataPath(), `companies-${userId}.json`);
    
    const data = await fsPromises.readFile(filePath, 'utf8');
    const companies = JSON.parse(data);
    const filteredCompanies = companies.filter(comp => comp.id !== companyId);
    await fsPromises.writeFile(filePath, JSON.stringify(filteredCompanies, null, 2));
    
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return true;
    }
    console.error('Error deleting company:', error);
    throw error;
  }
});

// Employee management IPC handlers
ipcMain.handle('get-employees', async (event, userId) => {
  try {
    await ensureDataDirectory();
    const filePath = path.join(getDataPath(), `employees-${userId}.json`);
    
    const data = await fsPromises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('Error getting employees:', error);
    throw error;
  }
});
ipcMain.handle("get-swiftlink-icon", () => {
  return path.join(__dirname, "electron/swiftlink.png"); // full local path
});
ipcMain.handle('save-employee', async (event, userId, employeeData) => {
  try {
    await ensureDataDirectory();
    const filePath = path.join(getDataPath(), `employees-${userId}.json`);
    
    let employees = [];
    try {
      const data = await fsPromises.readFile(filePath, 'utf8');
      employees = JSON.parse(data);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    
    if (employeeData.id) {
      const index = employees.findIndex(emp => emp.id === employeeData.id);
      if (index !== -1) {
        employees[index] = employeeData;
      } else {
        employees.push(employeeData);
      }
    } else {
      employeeData.id = Date.now().toString();
      employees.push(employeeData);
    }
    
    await fsPromises.writeFile(filePath, JSON.stringify(employees, null, 2));
    return employeeData.id;
  } catch (error) {
    console.error('Error saving employee:', error);
    throw error;
  }
});

ipcMain.handle('delete-employee', async (event, userId, employeeId) => {
  try {
    await ensureDataDirectory();
    const filePath = path.join(getDataPath(), `employees-${userId}.json`);
    
    const data = await fsPromises.readFile(filePath, 'utf8');
    const employees = JSON.parse(data);
    const filteredEmployees = employees.filter(emp => emp.id !== employeeId);
    await fsPromises.writeFile(filePath, JSON.stringify(filteredEmployees, null, 2));
    
    // Also delete payroll data for this employee
    const payrollPath = path.join(getDataPath(), `payroll-${userId}-${employeeId}.json`);
    try {
      await fsPromises.unlink(payrollPath);
    } catch (error) {
      console.log('Payroll file not found for deleted employee, skipping...');
    }
    
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return true;
    }
    console.error('Error deleting employee:', error);
    throw error;
  }
});

// Payroll data management IPC handlers
ipcMain.handle('get-all-payroll-data', async (event, userId) => {
  try {
    await ensureDataDirectory();
    const dataPath = getDataPath();
    const payrollData = {};
    
    const files = await fsPromises.readdir(dataPath);
    const payrollFiles = files.filter(file => 
      file.startsWith(`payroll-${userId}-`) && file.endsWith('.json')
    );
    
    for (const file of payrollFiles) {
      const employeeId = file.replace(`payroll-${userId}-`, '').replace('.json', '');
      const filePath = path.join(dataPath, file);
      
      try {
        const data = await fsPromises.readFile(filePath, 'utf8');
        payrollData[employeeId] = JSON.parse(data);
      } catch (error) {
        console.error(`Error reading payroll file ${file}:`, error);
      }
    }
    
    return payrollData;
  } catch (error) {
    console.error('Error reading payroll data directory:', error);
    return {};
  }
});

ipcMain.handle('save-monthly-data', async (event, userId, employeeId, year, month, data) => {
  try {
    await ensureDataDirectory();
    const filePath = path.join(getDataPath(), `payroll-${userId}-${employeeId}.json`);
    
    let payrollData = {};
    try {
      const existingData = await fsPromises.readFile(filePath, 'utf8');
      payrollData = JSON.parse(existingData);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    
    if (!payrollData[year]) {
      payrollData[year] = {};
    }
    
    payrollData[year][month] = data;
    
    await fsPromises.writeFile(filePath, JSON.stringify(payrollData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving monthly data:', error);
    throw error;
  }
});

// PDF download handler
ipcMain.on('download-pdf', async (event, { name, month, year }) => {
  const win = BrowserWindow.getFocusedWindow();
  const safeName = name.replace(/\s+/g, '');
  const filename = `${safeName}_${month}_${year}.pdf`;
  const pdfPath = path.join(app.getPath('downloads'), filename);

  try {
    const pdfData = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
    });

    fs.writeFileSync(pdfPath, pdfData);
    shell.openPath(pdfPath);
    console.log('✅ PDF saved to:', pdfPath);
  } catch (err) {
    console.error('❌ Failed to generate PDF:', err);
  }
});


// App event handlers
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle app errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});