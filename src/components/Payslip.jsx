"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
const printStyles = `
  @media print {
  
    @page {
      margin: 0.75in 0.5in;
      size: A4;
    }
    
    
  
  body {
    
    padding: 0 !important;
    
  }
  
  .print-container,
  .print-container * {
    
    
  }
    .pay-section {
    border: 1px solid black !important; /* Only for internal pay sections */
    margin-bottom: 12px !important;
  }
    .print-page-break {
      page-break-after: always;
    }
    
    .print-page-break-before {
      page-break-before: always;
    }
    
    /* Header styles */
    .print-header {
      margin-bottom: 12px !important;
      text-align: center;
    }
    
    .print-header h1 {
      font-size: 18px !important;
      margin-bottom: 4px !important;
      font-weight: bold;
    }
    
    .print-header h2 {
      font-size: 16px !important;
      margin: 4px 0 !important;
      font-weight: bold;
    }
    
    .print-header p {
      font-size: 11px !important;
      margin: 2px 0 !important;
    }
    
    .print-header .border-t {
      border-top: 2px solid black !important;
      border-bottom: 2px solid black !important;
      padding: 8px 0 !important;
      margin: 8px 0 !important;
    }
    
    /* Employee details */
    .employee-details {
      margin-bottom: 12px !important;
      font-size: 11px !important;
    }
    
    .employee-details .grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 16px !important;
    }
    
    .employee-details .space-y-1 > * + * {
      margin-top: 2px !important;
    }
    
    .employee-details p {
      display: flex !important;
      margin: 2px 0 !important;
    }
    
    .employee-details span:first-child {
      width: 120px !important;
      font-weight: 600;
      flex-shrink: 0;
    }
    
    /* Pay sections */
    .pay-section {
      border: 2px solid black !important;
      margin-bottom: 12px !important;
    }
    
    .pay-section h3 {
      font-size: 12px !important;
      padding: 6px 8px !important;
      margin: 0 !important;
      background: #f0f0f0 !important;
      border-bottom: 1px solid black !important;
      font-weight: bold;
    }
    
    .pay-section .p-3 {
      padding: 8px !important;
    }
    
    .pay-section .space-y-2 > * + * {
      margin-top: 3px !important;
    }
    
    .pay-section .text-sm {
      font-size: 11px !important;
    }
    
    .pay-section .border-t {
      border-top: 1px solid black !important;
      padding-top: 6px !important;
      margin-top: 6px !important;
    }
    
    /* Pay details grid */
    .pay-details-grid {
      display: grid !important;
      grid-template-columns: 1fr 1fr !important;
      gap: 16px !important;
    }
    
    /* Net pay section */
    .net-pay-section {
      margin-top: 12px !important;
      padding: 8px !important;
      border: 3px solid black !important;
      background: white !important;
    }
    

.summary-cards .bg-blue-50,
.summary-cards .bg-green-50,
.summary-cards .bg-purple-50 {
  padding: 8px !important;
}

/* Monthly breakdown improvements */
.monthly-section {
  margin-bottom: 32px !important;
}

.annual-section {
  margin-top: 32px !important;
}

/* Remove page break class */
.print-page-break-before {
  page-break-before: auto !important;
}
    
    .net-pay-section .text-xl {
      font-size: 16px !important;
      font-weight: bold;
    }
    
    .net-pay-section .text-sm {
      font-size: 10px !important;
      margin-top: 6px !important;
    }
    
    /* Annual report specific */
    .annual-table {
      font-size: 10px !important;
      width: 100% !important;
      border-collapse: collapse !important;
      margin-top: 12px !important;
    }
    
    .annual-table th,
    .annual-table td {
      border: 1px solid black !important;
      padding: 4px 6px !important;
      text-align: left;
    }
    
    .annual-table th {
      background: #e0e0e0 !important;
      font-weight: bold !important;
    }
    
    .annual-table td:not(:first-child) {
      text-align: right !important;
    }
    
    /* Monthly breakdown grid */
    
  .monthly-grid {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 8px !important;
    margin-top: 12px !important;
    page-break-inside: avoid;
  }
  
  .monthly-grid > div {
    border: 1px solid black !important;
    padding: 6px !important;
    font-size: 9px !important;
    text-align: center;
  }
  
  /* Add selected month styling */
  .monthly-grid .selected-month {
    border: 2px solid black !important;
  }
    
    .monthly-grid .font-semibold {
      font-size: 9px !important;
      font-weight: bold !important;
      margin-bottom: 2px !important;
    }
    
    .monthly-grid .text-lg {
      font-size: 11px !important;
      font-weight: bold !important;
    }
    
    
    
    /* Print visibility controls */
    .print-only {
      display: block !important;
    }
    
    .screen-only {
      display: none !important;
    }
    
    .print-section {
      page-break-inside: avoid;
      margin-bottom: 24px !important;
    }
    
    /* Ensure sections print properly */
    .monthly-section,
    .annual-section {
      display: block !important;
    }
    
    /* Section headings */
    .section-heading {
      font-size: 14px !important;
      font-weight: bold !important;
      margin: 12px 0 8px 0 !important;
      border-bottom: 1px solid black !important;
      padding-bottom: 4px !important;
    }
  }
  
  @media screen {
    .print-only {
      display: none !important;
    }
    
    .screen-only {
      display: block !important;
    }
  }
`;



/* --------------------------------------------------
   Static look‑ups
-------------------------------------------------- */
const months = [
  "April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"
];

const earningCategories = [
  "Basic",
  "House Rent Allowance",
  "Other Allowance",
  "Car Allowance",
  "Interest Subsidy",
  "Performance Pay",
  "Long Term Incentive Plan",
  "Miscellaneous Allowance",
  "Mobile Handset Allowance"
];

const defaultMonthlyEarnings = () => ({
  Basic: 0,
  "House Rent Allowance": 0,
  "Other Allowance": 0,
  "Car Allowance": 0,
  "Interest Subsidy": 0,
  "Performance Pay": 0,
  "Long Term Incentive Plan": 0,
  "Miscellaneous Allowance": 0,
  "Mobile Handset Allowance": 0,
});


/* --------------------------------------------------
Component
-------------------------------------------------- */
const Payslip = () => {
  /* ---------- Setup state ---------- */
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
const [editEmployeeData, setEditEmployeeData] = useState({});
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    code: "",
    department: "",
    designation: "",
    grade: "",
    dob: "",
    doj: "",
    location: "",
    bank: "",
    costCenter: "",
    pan: "",
    pf: "",
    esi: "",
    heading: "",
    address: "",
    basicSalary: 20000.0,
    pfUan: ""
  });
  const PrintLayout = () => (
    <div className="print-only">
      {selectedEmployee && (
        <>
          {/* Monthly Payslip Section */}
          <div className="monthly-section print-section">
            <div className="text-center mb-4 print-header">
              <h1 className="text-2xl font-bold mb-2">
                {selectedEmployee?.heading || "COMPANY NAME"}
              </h1>
              <p className="text-sm text-gray-600">
                {selectedEmployee?.address || "Company Address"}
              </p>
              <div className="border-t border-b border-gray-300 py-3 mt-4">
                <h2 className="text-xl font-bold">MONTHLY PAYSLIP</h2>
                <p className="text-sm text-gray-600">
                  For the month of {selectedMonth} {selectedYear}
                </p>
              </div>
            </div>
            <MonthlyPayslipBlock />
          </div>

          {/* Annual report without page break and without header */}
          <div className="annual-section print-section mt-8">
            <AnnualReportBlock />
          </div>
        </>
      )}
    </div>
  );

  /* ---------- UI state ---------- */
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [selectedYear, setSelectedYear] = useState("2025-26");
  const [currentView, setCurrentView] = useState("monthly"); // 'monthly' | 'annual'

  /* ---------- Data state ---------- */
  // { empId : { year : { month : { earnings, deductions, deductionToggles } } } }
  const [employeeData, setEmployeeData] = useState({});

  const [monthlyEarnings, setMonthlyEarnings] = useState(defaultMonthlyEarnings());
  const [deductions, setDeductions] = useState({
    incomeTax: 0,
    pf: 0,
    professionalTax: 200,
    benevolence: 2000,
    esop: 5208,
    esic: 0,
  });
  const [deductionToggles, setDeductionToggles] = useState({
    incomeTax: true,
    pf: true,
    professionalTax: true,
    benevolence: true,
    esop: true,
    esic: true,
  });
  // Add this useEffect to inject print styles
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  /* ---------- Employee Management ---------- */
  const handleAddEmployee = () => {
    if (!newEmployee.name.trim() || !newEmployee.code.trim()) {
      alert("Please fill in at least the name and employee code");
      return;
    }

    const empId = `emp-${Date.now()}`;
    const employeeToAdd = {
      id: empId,
      ...newEmployee
    };

    setEmployees(prev => [...prev, employeeToAdd]);
    setNewEmployee({
      name: "",
      code: "",
      department: "",
      designation: "",
      grade: "",
      dob: "",
      doj: "",
      location: "",
      bank: "",
      costCenter: "",
      pan: "",
      pf: "",
      esi: "",
      heading: "",
      address: "",
      basicSalary: 20000.0,
      pfUan: ""
    });
    setShowAddEmployee(false);
  };

  const handleDeleteEmployee = (empId) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      setEmployees(prev => prev.filter(emp => emp.id !== empId));
      if (selectedEmpId === empId) {
        setSelectedEmpId("");
      }
    }
  };



  const proceedToPayslip = () => {
    if (employees.length === 0) {
      alert("Please add at least one employee before proceeding");
      return;
    }
    setIsSetupComplete(true);
    setSelectedEmpId(employees[0].id);
  };
  const handleEditEmployee = (empId) => {
  const employee = employees.find(emp => emp.id === empId);
  if (employee) {
    setEditEmployeeData({ ...employee });
    setEditingEmployee(empId);
  }
};

const handleUpdateEmployee = () => {
  if (!editEmployeeData.name.trim() || !editEmployeeData.code.trim()) {
    alert("Please fill in at least the name and employee code");
    return;
  }

  setEmployees(prev => prev.map(emp => 
    emp.id === editingEmployee ? { ...editEmployeeData } : emp
  ));
  
  setEditingEmployee(null);
  setEditEmployeeData({});
  alert("Employee updated successfully!");
};

const handleCancelEdit = () => {
  setEditingEmployee(null);
  setEditEmployeeData({});
};

  /* ---------- Helpers ---------- */
  const [typedValue, setTypedValue] = useState("");
  const numberToWords = (num) => {
    if (num === 0) return "Zero";
    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const toWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + toWords(n % 100) : "")
        );
      return "";
    };

    let integerPart = Math.floor(num);
    let decimalPart = Math.round((num - integerPart) * 100);
    let result = "";
    let temp = integerPart;
    const parts = [];
    if (temp >= 10000000) {
      parts.push(toWords(Math.floor(temp / 10000000)) + " Crore");
      temp %= 10000000;
    }
    if (temp >= 100000) {
      parts.push(toWords(Math.floor(temp / 100000)) + " Lakh");
      temp %= 100000;
    }
    if (temp >= 1000) {
      parts.push(toWords(Math.floor(temp / 1000)) + " Thousand");
      temp %= 1000;
    }
    if (temp > 0) parts.push(toWords(temp));
    result = parts.join(" ");
    if (decimalPart > 0) {
      if (result) result += " and ";
      result += toWords(decimalPart) + " Paisa";
    } else if (!result) result = "Zero";
    if (result && !result.includes("Paisa")) result += " Rupees";
    return result.trim();
  };
  const selectedEmployee = employees.find((e) => e.id === selectedEmpId);
  /* ---------- Effects ---------- */
  // Load monthly data when employee/date changes
  useEffect(() => {
    if (!selectedEmpId || !selectedMonth || !selectedYear) return;
    const empData = employeeData[selectedEmpId] || {};
    const yearData = empData[selectedYear] || {};
    const monthData = yearData[selectedMonth] || {};


    // Get default earnings and override Basic with employee's basic salary
    const defaultEarnings = defaultMonthlyEarnings();
    if (selectedEmployee?.basicSalary) {
      defaultEarnings.Basic = selectedEmployee.basicSalary;
    }

    setMonthlyEarnings(monthData.earnings || defaultEarnings);
    setDeductions(
      monthData.deductions || {
        incomeTax: 0,
        pf: 0,
        professionalTax: 200,
        benevolence: 2000,
        esop: 5208,
        esic: 0,
      }
    );
    setDeductionToggles(
      monthData.deductionToggles || {
        incomeTax: true,
        pf: true,
        professionalTax: true,
        benevolence: true,
        esop: true,
        esic: true,
      }
    );
  }, [selectedEmpId, selectedMonth, selectedYear, employeeData]);



  // Auto‑recalculate IT & PF whenever earnings change
  useEffect(() => {
    const gross = Object.values(monthlyEarnings).reduce((s, v) => s + v, 0);
    const basic = monthlyEarnings["Basic"] || 0;
    setDeductions((prev) => ({
      ...prev,
      incomeTax: Math.round(gross * 0.3),
      pf: Math.ceil(basic * 0.12),
      esic: basic * 0.075,
    }));
  }, [monthlyEarnings]);

  /* ---------- Derived values ---------- */
  const grossEarning = Object.values(monthlyEarnings).reduce((s, v) => s + v, 0);
  const grossDeduction = Object.entries(deductions).reduce(
    (s, [k, v]) => (deductionToggles[k] ? s + v : s),
    0
  );
  const netPay = grossEarning - grossDeduction;

  // Annual calculations
  const calculateAnnualData = () => {
    if (!selectedEmpId || !selectedYear) return {};
    const yearData = employeeData[selectedEmpId]?.[selectedYear] || {};
    const totals = {};

    // Initialize totals for each category
    earningCategories.forEach((cat) => (totals[cat] = {
      gross: 0,
      exempt: 0,
      actualMonths: 0,
      projectedMonths: 0,
      projectedGross: 0,
      firstMonthValue: 0
    }));

    // Count actual months and calculate totals
    let actualMonthsCount = 0;
    let firstAvailableMonthData = null;

    months.forEach((m) => {
      const mData = yearData[m];
      if (mData?.earnings) {
        actualMonthsCount++;
        // Store first available month data for projection
        if (!firstAvailableMonthData) {
          firstAvailableMonthData = mData.earnings;
        }

        earningCategories.forEach((cat) => {
          totals[cat].gross += mData.earnings[cat] || 0;
        });
      }
    });

    // Calculate projected values
    const remainingMonths = Math.max(0, 12 - actualMonthsCount);

    if (firstAvailableMonthData && remainingMonths > 0) {
      earningCategories.forEach((cat) => {
        const firstMonthValue = firstAvailableMonthData[cat] || 0;
        totals[cat].projectedGross = firstMonthValue * remainingMonths;
        totals[cat].firstMonthValue = firstMonthValue;
      });
    }

    // Set month counts for all categories
    earningCategories.forEach((cat) => {
      totals[cat].actualMonths = actualMonthsCount;
      totals[cat].projectedMonths = remainingMonths;
    });

    return totals;
  };
  const annualData = calculateAnnualData();
  const hasAnnual = Object.values(annualData).some((d) => d.gross > 0 || d.projectedGross > 0);

  /* ---------- Handlers ---------- */
  const updateEarning = (category, val) => {
    setMonthlyEarnings((prev) => ({ ...prev, [category]: parseFloat(val) || 0 }));
  };
  const toggleDeduction = (k) => {
    setDeductionToggles((prev) => ({ ...prev, [k]: !prev[k] }));
  };
  const saveCurrentMonthData = () => {
    if (!selectedEmpId || !selectedMonth || !selectedYear) {
      return alert("Please select employee, month and year");
    }
    setEmployeeData((prev) => ({
      ...prev,
      [selectedEmpId]: {
        ...prev[selectedEmpId],
        [selectedYear]: {
          ...prev[selectedEmpId]?.[selectedYear],
          [selectedMonth]: {
            earnings: { ...monthlyEarnings },
            deductions: { ...deductions },
            deductionToggles: { ...deductionToggles },
          },
        },
      },
    }));
    alert(`Data saved for ${selectedMonth} ${selectedYear}!`);
  };

  const handleResize = (e) => {
    const el = e.target;
    el.style.width = `${Math.max(150, el.value.length * 8)}px`;
  };

  /* --------------------------------------------------
     UI blocks – extracted as helpers so they can be
     reused for print‑only sections
  -------------------------------------------------- */
  const AnnualReportBlock = () => (
    <div className="mb-6">
      {!hasAnnual ? (
        <p className="text-center text-gray-500">No annual data available</p>
      ) : (
        <>
          {/* Hide summary cards in print */}
          <div className="mt-6 grid grid-cols-3 gap-4 ">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2 text-sm">Actual Earnings</h4>
              <p className="text-xl font-bold text-blue-600 mb-1">
                ₹{Object.values(annualData).reduce((s, i) => s + (i?.gross || 0), 0).toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-blue-600">
                {Object.values(annualData)[0]?.actualMonths || 0} months
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2 text-sm">Projected Earnings</h4>
              <p className="text-xl font-bold text-green-600 mb-1">
                ₹{Object.values(annualData).reduce((s, i) => s + (i?.projectedGross || 0), 0).toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-green-600">
                {Object.values(annualData)[0]?.projectedMonths || 0} months
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-800 mb-2 text-sm">Total Annual</h4>
              <p className="text-xl font-bold text-purple-600 mb-1">
                ₹{Object.values(annualData).reduce((s, i) => s + ((i?.gross || 0) + (i?.projectedGross || 0)), 0).toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-purple-600">Complete year</p>
            </div>
          </div>

          <h3 className="font-bold mb-4 mt-6 section-heading">Annual Earnings Summary</h3>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm annual-table">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-3 text-left font-semibold">
                    Description
                  </th>
                  <th className="border border-gray-300 p-3 text-right font-semibold">
                    Actual ({Object.values(annualData)[0]?.actualMonths || 0} months)
                  </th>
                  <th className="border border-gray-300 p-3 text-right font-semibold">
                    Projected ({Object.values(annualData)[0]?.projectedMonths || 0} months)
                  </th>
                  <th className="border border-gray-300 p-3 text-right font-semibold">
                    Total Annual
                  </th>
                </tr>
              </thead>
              <tbody>
                {earningCategories.map((category) => {
                  const d = annualData[category] || {
                    gross: 0,
                    exempt: 0,
                    projectedGross: 0,
                    actualMonths: 0,
                    projectedMonths: 0
                  };

                  const totalAmount = d.gross + d.projectedGross;
                  if (totalAmount === 0) return null;

                  return (
                    <tr key={category}>
                      <td className="border border-gray-300 p-3 font-medium">
                        {category}
                      </td>
                      <td className="border border-gray-300 p-3 text-right">
                        ₹{d.gross.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="border border-gray-300 p-3 text-right">
                        ₹{d.projectedGross.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td className="border border-gray-300 p-3 text-right font-semibold">
                        ₹{totalAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                    </tr>
                  );
                })}

                <tr className="bg-gray-100 font-semibold border-t-2 border-gray-400">
                  <td className="border border-gray-300 p-3 text-right font-bold">
                    Total Annual
                  </td>
                  <td className="border border-gray-300 p-3 text-right font-bold">
                    ₹{Object.values(annualData).reduce((s, i) => s + (i?.gross || 0), 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                  <td className="border border-gray-300 p-3 text-right font-bold">
                    ₹{Object.values(annualData).reduce((s, i) => s + (i?.projectedGross || 0), 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                  <td className="border border-gray-300 p-3 text-right font-bold text-blue-700">
                    ₹{Object.values(annualData).reduce((s, i) => s + ((i?.gross || 0) + (i?.projectedGross || 0)), 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Monthly Breakdown */}
          <div className="mt-8">
            <h3 className="font-bold mb-4 section-heading">Monthly Breakdown ({selectedYear})</h3>
            <div className="grid grid-cols-6 gap-3 ">
              {months.map((month) => {
                const mData = employeeData[selectedEmpId]?.[selectedYear]?.[month];
                const mTotal = mData ? Object.values(mData.earnings).reduce((s, v) => s + v, 0) : 0;
                const hasData = mTotal > 0;

                return (
                  <div
                    key={month}
                    className={`border-2 p-3 rounded-lg transition-all hover:shadow-md cursor-pointer ${hasData
                        ? "bg-green-50 border-green-300 hover:bg-green-100"
                        : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                      } ${selectedMonth === month ? "ring-2 ring-green-500" : ""}`}
                    onClick={() => {
                      if (hasData) {
                        setSelectedMonth(month);
                        setCurrentView("monthly");
                      }
                    }}
                  >
                    <div className="font-medium text-sm mb-2 text-center">{month}</div>
                    <div className={`text-base font-bold text-center ${hasData ? "text-green-700" : "text-gray-400"
                      }`}>
                      {hasData ? `₹${Math.round(mTotal).toLocaleString("en-IN")}` : "No data"}
                    </div>
                  </div>
                );
              })}
            </div>

            
          </div>
        </>
      )}
    </div>
  );

  const MonthlyPayslipBlock = () => (
    <div className="mb-6">
      {/* Employee Details */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-sm print:gap-4 print:mb-4 print:text-xs employee-details">
        <div className="space-y-1 print:space-y-0.5">
          <p className="flex"><span className="font-semibold w-32 print:w-28">Employee Name:</span> <span>{selectedEmployee?.name || 'N/A'}</span></p>
          <p className="flex"><span className="font-semibold w-32 print:w-28">Employee Code:</span> <span>{selectedEmployee?.code || 'N/A'}</span></p>
          <p className="flex"><span className="font-semibold w-32 print:w-28">Department:</span> <span>{selectedEmployee?.department || 'N/A'}</span></p>
          <p className="flex"><span className="font-semibold w-32 print:w-28">Designation:</span> <span>{selectedEmployee?.designation || 'N/A'}</span></p>
          <p className="flex"><span className="font-semibold w-32 print:w-28">Grade:</span> <span>{selectedEmployee?.grade || 'N/A'}</span></p>
          <p className="flex"><span className="font-semibold w-32 print:w-28">Date of Birth:</span> <span>{selectedEmployee?.dob || 'N/A'}</span></p>
        </div>
        <div className="space-y-1 print:space-y-0.5">
          <p className="flex"><span className="font-semibold w-32 print:w-28">Date of Joining:</span> <span>{selectedEmployee?.doj || 'N/A'}</span></p>
          <p className="flex"><span className="font-semibold w-32 print:w-28">Location:</span> <span>{selectedEmployee?.location || 'N/A'}</span></p>
          <p className="flex"><span className="font-semibold w-32 print:w-28">Bank Details:</span> <span>{selectedEmployee?.bank || 'N/A'}</span></p>
          <p className="flex"><span className="font-semibold w-32 print:w-28">Cost Center:</span> <span>{selectedEmployee?.costCenter || 'N/A'}</span></p>
          <p className="flex"><span className="font-semibold w-32 print:w-28">PAN:</span> <span>{selectedEmployee?.pan || 'N/A'}</span></p>
          <p className="flex"><span className="font-semibold w-32 print:w-28">PF UAN:</span> <span>{selectedEmployee?.pfUan || 'N/A'}</span></p>
        </div>
      </div>

      {/* Pay Details */}
      <div className="grid grid-cols-2 gap-6 print:gap-4 pay-details-grid">
        {/* Earnings */}
        <div className="border print:border-black pay-section">
          <h3 className="font-bold bg-gray-100 p-3 print:bg-gray-200 print:p-2 print:text-sm border-b print:border-black">
            EARNINGS
          </h3>
          <div className="p-3 print:p-2 space-y-2 print:space-y-1">
            {earningCategories.map((category) => {
              const amount = monthlyEarnings[category] || 0;
              if (amount === 0) return null;
              return (
                <div key={category} className="flex justify-between text-sm print:text-xs">
                  <span>{category}</span>
                  <span className="font-medium">₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              );
            })}
            <div className="border-t pt-2 print:pt-1 font-bold flex justify-between print:border-black">
              <span>Total Earnings</span>
              <span>₹{grossEarning.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="border print:border-black pay-section">
          <h3 className="font-bold bg-gray-100 p-3 print:bg-gray-200 print:p-2 print:text-sm border-b print:border-black">
            DEDUCTIONS
          </h3>
          <div className="p-3 print:p-2 space-y-2 print:space-y-1">
            {Object.entries(deductions).map(([key, amount]) => {
              if (!deductionToggles[key] || amount === 0) return null;
              const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return (
                <div key={key} className="flex justify-between text-sm print:text-xs">
                  <span>{label}</span>
                  <span className="font-medium">₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              );
            })}
            <div className="border-t pt-2 print:pt-1 font-bold flex justify-between print:border-black">
              <span>Total Deductions</span>
              <span>₹{grossDeduction.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Net Pay */}
<div className="mt-6 p-4 bg-gray-50 rounded border-2 border-gray-300 print:bg-white print:border-black print:rounded-none print:mt-4 net-pay-section">
  <div className="flex justify-between items-center font-bold text-xl print:text-lg">
    <span>NET PAY</span>
    <span>₹{netPay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
  </div>
  <div className="mt-3 text-sm print:text-xs print:mt-2">
    <span className="font-semibold">Amount in words:</span> {numberToWords(netPay)}
  </div>
</div>

{/* Personal Note */}
<div className="mt-4 text-center text-sm text-black-600 print:text-xs print:mt-3">
  <p><strong>Personal Note:</strong> This is a system generated payslip, does not require any signature.</p>
</div>
    </div>
  );

  /* --------------------------------------------------
     SETUP SCREEN - Show before payslip
  -------------------------------------------------- */
  if (!isSetupComplete) {
    return (
      
    <div className="p-4 sm:p-6 max-w-[1200px] mx-auto print:p-0 print:max-w-none">
      <Card className="p-4 sm:p-6 print:shadow-none print:rounded-none print:p-0 print:border-none print-container">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Payroll System Setup</h1>
        <p className="text-gray-600 mb-4 sm:mb-6 text-center">Add employees to get started with payslip generation</p>

          {/* Employee List */}
          {employees.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Added Employees ({employees.length})</h2>
              <div className="grid gap-4">
                {employees.map((emp) => (
  <div key={emp.id} className="border rounded-lg p-4 flex justify-between items-start">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
      <div>
        <span className="font-medium">Name:</span> {emp.name}
      </div>
      <div>
        <span className="font-medium">Code:</span> {emp.code}
      </div>
      <div>
        <span className="font-medium">Department:</span> {emp.department || "N/A"}
      </div>
      <div>
        <span className="font-medium">Designation:</span> {emp.designation || "N/A"}
      </div>
    </div>
    <div className="flex gap-2 ml-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEditEmployee(emp.id)}
      >
        Edit
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => handleDeleteEmployee(emp.id)}
      >
        Delete
      </Button>
    </div>
  </div>
))}
              </div>
            </div>
          )}

          {/* Add Employee Form */}
          {showAddEmployee && (
            <Card className="p-4 mb-6 bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter employee name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Employee Code *</label>
                  <input
                    type="text"
                    value={newEmployee.code}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter employee code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter department"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Designation</label>
                  <input
                    type="text"
                    value={newEmployee.designation}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter designation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Grade</label>
                  <input
                    type="text"
                    value={newEmployee.grade}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter grade"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={newEmployee.dob}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, dob: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., 2 Aug 1979"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Joining</label>
                  <input
                    type="text"
                    value={newEmployee.doj}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, doj: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="e.g., 18 Jun 2008"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={newEmployee.location}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bank Details</label>
                  <input
                    type="text"
                    value={newEmployee.bank}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, bank: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Account number (Bank name)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cost Center</label>
                  <input
                    type="text"
                    value={newEmployee.costCenter}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, costCenter: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter cost center"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={newEmployee.pan}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, pan: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter PAN number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PF Number</label>
                  <input
                    type="text"
                    value={newEmployee.pf}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, pf: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter PF number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ESI Number</label>
                  <input
                    type="text"
                    value={newEmployee.esi}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, esi: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter ESI number (or '-')"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">PF UAN</label>
                  <input
                    type="text"
                    value={newEmployee.pfUan}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, pfUan: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter PF UAN"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    value={newEmployee.heading}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, heading: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Address</label>
                  <input
                    type="text"
                    value={newEmployee.address}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter company address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Basic Salary</label>
                  <input
                    type="number"
                    value={newEmployee.basicSalary}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, basicSalary: parseFloat(e.target.value) || 0 }))}
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter basic salary"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddEmployee} className="bg-green-600 hover:bg-green-700">
                  Add Employee
                </Button>
                <Button variant="outline" onClick={() => setShowAddEmployee(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          )}
          {/* Edit Employee Form */}
{editingEmployee && (
  <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
    <h3 className="text-lg font-semibold mb-4">Edit Employee</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input
          type="text"
          value={editEmployeeData.name || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter employee name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Employee Code *</label>
        <input
          type="text"
          value={editEmployeeData.code || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, code: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter employee code"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Department</label>
        <input
          type="text"
          value={editEmployeeData.department || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, department: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter department"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Designation</label>
        <input
          type="text"
          value={editEmployeeData.designation || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, designation: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter designation"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Grade</label>
        <input
          type="text"
          value={editEmployeeData.grade || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, grade: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter grade"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date of Birth</label>
        <input
          type="text"
          value={editEmployeeData.dob || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, dob: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="e.g., 2 Aug 1979"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Date of Joining</label>
        <input
          type="text"
          value={editEmployeeData.doj || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, doj: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="e.g., 18 Jun 2008"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          value={editEmployeeData.location || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, location: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter location"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Bank Details</label>
        <input
          type="text"
          value={editEmployeeData.bank || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, bank: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Account number (Bank name)"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Cost Center</label>
        <input
          type="text"
          value={editEmployeeData.costCenter || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, costCenter: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter cost center"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">PAN Number</label>
        <input
          type="text"
          value={editEmployeeData.pan || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, pan: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter PAN number"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">PF Number</label>
        <input
          type="text"
          value={editEmployeeData.pf || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, pf: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter PF number"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">ESI Number</label>
        <input
          type="text"
          value={editEmployeeData.esi || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, esi: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter ESI number (or '-')"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">PF UAN</label>
        <input
          type="text"
          value={editEmployeeData.pfUan || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, pfUan: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter PF UAN"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Company Name</label>
        <input
          type="text"
          value={editEmployeeData.heading || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, heading: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter company name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Company Address</label>
        <input
          type="text"
          value={editEmployeeData.address || ''}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, address: e.target.value }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter company address"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Basic Salary</label>
        <input
          type="number"
          value={editEmployeeData.basicSalary || 0}
          onChange={(e) => setEditEmployeeData(prev => ({ ...prev, basicSalary: parseFloat(e.target.value) || 0 }))}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter basic salary"
          step="0.01"
        />
      </div>
    </div>
    <div className="flex gap-2">
      <Button onClick={handleUpdateEmployee} className="bg-blue-600 hover:bg-blue-700">
        Update Employee
      </Button>
      <Button variant="outline" onClick={handleCancelEdit}>
        Cancel
      </Button>
    </div>
  </Card>
)}

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
  {!showAddEmployee && !editingEmployee && (
    <Button onClick={() => setShowAddEmployee(true)} className="bg-blue-600 hover:bg-blue-700">
      Add New Employee
    </Button>
  )}
  {employees.length > 0 && !editingEmployee && (
    <Button onClick={proceedToPayslip} className="bg-green-600 hover:bg-green-700">
      Proceed to Payslip Generator ({employees.length} employees)
    </Button>
  )}
</div>
        </Card>
      </div>
    );
  }

  /* --------------------------------------------------
     MAIN PAYSLIP SCREEN
  -------------------------------------------------- */

  return (
    <div className="p-6 max-w-[1200px] mx-auto print:p-0 print:max-w-none print:mx-0 print:bg-white border-0">
      <div className="shadow p-6 rounded-2xl print:shadow-none print:rounded-none print:p-0 print-container bg-white">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Button
            variant="outline"
            onClick={() => setIsSetupComplete(false)}
            className="text-sm"
          >
            ← Back to Setup
          </Button>
          <div className="flex gap-2">
            <Button
              variant={currentView === "monthly" ? "default" : "outline"}
              onClick={() => setCurrentView("monthly")}
            >
              Monthly View
            </Button>
            <Button
              variant={currentView === "annual" ? "default" : "outline"}
              onClick={() => setCurrentView("annual")}
            >
              Annual View
            </Button>
          </div>
          <Button onClick={() => window.print()} className="bg-purple-600 hover:bg-purple-700">
            Print
          </Button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:hidden">
          <div>
            <label className="block text-sm font-medium mb-1">Employee</label>
            <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name} ({emp.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <div className="mt-2">
              <Input
                type="text"
                placeholder="Enter year (e.g. 2023 or 2023-24)"
                value={typedValue}
                onChange={(e) => {
                  const input = e.target.value;
                  if (/^\d{4}$/.test(input)) {
                    const startYear = parseInt(input);
                    const endYearShort = ((startYear + 1) % 100).toString().padStart(2, "0");
                    const formatted = `${startYear}-${endYearShort}`;
                    setTypedValue(formatted);
                    setSelectedYear(formatted);
                  } else if (/^\d{4}-\d{2}$/.test(input) || input === "") {
                    setTypedValue(input);
                    setSelectedYear(input);
                  } else {
                    setTypedValue(input);
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-end">
            <Button onClick={saveCurrentMonthData} className="w-full bg-green-600 hover:bg-green-700">
              Save Data
            </Button>
          </div>
        </div>

        {/* Screen Content - Shows based on current view */}
        <div className="screen-only">
          {!selectedEmployee ? (
            <div className="text-center py-8 text-gray-500">
              Please select an employee to view payslip
            </div>
          ) : currentView === "annual" ? (
            <AnnualReportBlock />
          ) : (
            <>
              <MonthlyPayslipBlock />
              {/* Editing Section */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
                {/* Earnings Editor */}
                <div>
                  <h3 className="font-bold mb-4">Edit Earnings</h3>
                  <div className="space-y-3">
                    {earningCategories.map((category) => (
                      <div key={category} className="flex justify-between items-center">
                        <label className="text-sm font-medium">{category}:</label>
                        <input
                          type="number"
                          value={monthlyEarnings[category] || 0}
                          onChange={(e) => updateEarning(category, e.target.value)}
                          className="w-32 border rounded px-2 py-1 text-right text-sm"
                          step="0.01"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Deductions Editor */}
                <div>
                  <h3 className="font-bold mb-4">Edit Deductions</h3>
                  <div className="space-y-3">
                    {Object.entries(deductions).map(([key, amount]) => {
                      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                      return (
                        <div key={key} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={deductionToggles[key]}
                              onChange={() => toggleDeduction(key)}
                              className="rounded"
                            />
                            <label className="text-sm font-medium">{label}:</label>
                          </div>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setDeductions(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                            className="w-32 border rounded px-2 py-1 text-right text-sm"
                            step="0.01"
                            disabled={!deductionToggles[key]}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Print Layout - Shows both monthly and annual when printing */}
        <PrintLayout />
      </div>
    </div>
  );
};

export default Payslip;