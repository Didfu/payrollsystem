"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const months = [
  "April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"
];

const EMPLOYEES = [
  { 
    id: "emp-1", 
    name: "Alice Johnson",
    code: "16761",
    department: "BUSINESS INSIGHTS",
    designation: "EVP",
    grade: "16",
    dob: "2 Aug 1979",
    doj: "18 Jun 2008",
    location: "Corporate",
    bank: "1234565678990 (HDFC BANK)",
    costCenter: "2000421233",
    pan: "ABCDE12345",
    pf: "AB/CDE/12345/678/9012",
    esi: "-",
    pfUan: "123456789012"
  },
  { 
    id: "emp-2", 
    name: "Bob Lee",
    code: "16762",
    department: "TECHNOLOGY",
    designation: "VP",
    grade: "15",
    dob: "15 Mar 1985",
    doj: "12 Jan 2010",
    location: "Corporate",
    bank: "9876543210123 (HDFC BANK)",
    costCenter: "2000421234",
    pan: "FGHIJ67890",
    pf: "AB/CDE/67890/123/4567",
    esi: "-",
    pfUan: "987654321098"
  },
  { 
    id: "emp-3", 
    name: "Carlos Singh",
    code: "16763",
    department: "OPERATIONS",
    designation: "AVP",
    grade: "14",
    dob: "10 Dec 1988",
    doj: "05 Sep 2012",
    location: "Corporate",
    bank: "5555666677778 (HDFC BANK)",
    costCenter: "2000421235",
    pan: "KLMNO12345",
    pf: "AB/CDE/55555/666/7777",
    esi: "-",
    pfUan: "555666777888"
  }
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
  "Basic": 129151.0,
  "House Rent Allowance": 77985.0,
  "Other Allowance": 27908.0,
  "Car Allowance": 6091.0,
  "Interest Subsidy": 3383.0,
  "Performance Pay": 57612.0,
  "Long Term Incentive Plan": 0.0,
  "Miscellaneous Allowance": 358.0,
  "Mobile Handset Allowance": 449.0
});

const Payslip = () => {
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [currentView, setCurrentView] = useState("monthly"); // 'monthly' or 'annual'
  
  // Store all employee data: { empId: { year: { month: { earnings, deductions, etc } } } }
  const [employeeData, setEmployeeData] = useState({});
  
  // Current month's data
  const [monthlyEarnings, setMonthlyEarnings] = useState(defaultMonthlyEarnings());
  const [deductions, setDeductions] = useState({
    incomeTax: 0,
    pf: 0,
    professionalTax: 200,
    benevolence: 2000,
    esop: 5208,
  });
  const [deductionToggles, setDeductionToggles] = useState({
    incomeTax: true,
    pf: true,
    professionalTax: true,
    benevolence: true,
    esop: true,
  });

  // Load monthly data when employee/month/year changes
  useEffect(() => {
    if (selectedEmpId && selectedMonth && selectedYear) {
      const empData = employeeData[selectedEmpId];
      const yearData = empData?.[selectedYear];
      const monthData = yearData?.[selectedMonth];
      
      if (monthData) {
        setMonthlyEarnings(monthData.earnings || defaultMonthlyEarnings());
        setDeductions(monthData.deductions || {
          incomeTax: 0,
          pf: 0,
          professionalTax: 200,
          benevolence: 2000,
          esop: 5208,
        });
        setDeductionToggles(monthData.deductionToggles || {
          incomeTax: true,
          pf: true,
          professionalTax: true,
          benevolence: true,
          esop: true,
        });
      } else {
        // Reset to defaults for new selection
        setMonthlyEarnings(defaultMonthlyEarnings());
        setDeductions({
          incomeTax: 0,
          pf: 0,
          professionalTax: 200,
          benevolence: 2000,
          esop: 5208,
        });
        setDeductionToggles({
          incomeTax: true,
          pf: true,
          professionalTax: true,
          benevolence: true,
          esop: true,
        });
      }
    }
  }, [selectedEmpId, selectedMonth, selectedYear, employeeData]);

  // Auto-calculate deductions based on earnings
  useEffect(() => {
    const gross = Object.values(monthlyEarnings).reduce((sum, val) => sum + val, 0);
    const basic = monthlyEarnings["Basic"] || 0;

    setDeductions((prev) => ({
      ...prev,
      incomeTax: Math.round(gross * 0.3),
      pf: Math.round(basic * 0.12),
    }));
  }, [monthlyEarnings]);

  const saveCurrentMonthData = () => {
    if (!selectedEmpId || !selectedMonth || !selectedYear) {
      alert("Please select employee, month, and year first!");
      return;
    }
    
    setEmployeeData(prev => ({
      ...prev,
      [selectedEmpId]: {
        ...prev[selectedEmpId],
        [selectedYear]: {
          ...prev[selectedEmpId]?.[selectedYear],
          [selectedMonth]: {
            earnings: { ...monthlyEarnings },
            deductions: { ...deductions },
            deductionToggles: { ...deductionToggles }
          }
        }
      }
    }));
    
    alert(`Data saved for ${selectedMonth} ${selectedYear}!`);
  };

  // Calculate annual totals from monthly data
  const calculateAnnualData = () => {
    if (!selectedEmpId || !selectedYear) return {};
    
    const yearData = employeeData[selectedEmpId]?.[selectedYear] || {};
    const annualTotals = {};
    
    // Initialize totals
    earningCategories.forEach(category => {
      annualTotals[category] = { gross: 0, exempt: 0 };
    });
    
    // Sum up monthly data
    months.forEach(month => {
      const monthData = yearData[month];
      if (monthData?.earnings) {
        earningCategories.forEach(category => {
          const monthlyAmount = monthData.earnings[category] || 0;
          annualTotals[category].gross += monthlyAmount;
          // For now, exempt is 0 unless specified (you can add logic for exemptions)
          annualTotals[category].exempt += 0;
        });
      }
    });
    
    return annualTotals;
  };

  const selectedEmployee = EMPLOYEES.find(emp => emp.id === selectedEmpId);

  const numberToWords = (num) => {
    if (num === 0) return 'Zero';

    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
      'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
      'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    const numToWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000)
        return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numToWords(n % 100) : '') + ' Rupees';
      return '';
    };

    let integerPart = Math.floor(num);
    let decimalPart = Math.round((num - integerPart) * 100);

    let result = '';
    let tempNum = integerPart;
    let parts = [];

    if (tempNum >= 10000000) {
      parts.push(numToWords(Math.floor(tempNum / 10000000)) + ' Crore');
      tempNum %= 10000000;
    }
    if (tempNum >= 100000) {
      parts.push(numToWords(Math.floor(tempNum / 100000)) + ' Lakh');
      tempNum %= 100000;
    }
    if (tempNum >= 1000) {
      parts.push(numToWords(Math.floor(tempNum / 1000)) + ' Thousand');
      tempNum %= 1000;
    }
    if (tempNum > 0) {
      parts.push(numToWords(tempNum));
    }

    result = parts.join(' ');

    if (decimalPart > 0) {
      if (result.length > 0) {
        result += ' and ';
      }
      result += numToWords(decimalPart) + ' Paisa';
    } else if (result.length === 0) {
      result = 'Zero';
    }

    return result.trim();
  };

  const updateEarning = (category, value) => {
    setMonthlyEarnings(prev => ({
      ...prev,
      [category]: parseFloat(value) || 0
    }));
  };

  const toggleDeduction = (key) => {
    setDeductionToggles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleResize = (e) => {
    const input = e.target;
    input.style.width = `${Math.max(150, input.value.length * 8)}px`;
  };

  const grossEarning = Object.values(monthlyEarnings).reduce((sum, val) => sum + val, 0);
  const grossDeduction = Object.entries(deductions).reduce(
    (sum, [key, value]) => (deductionToggles[key] ? sum + value : sum),
    0
  );
  const netPay = grossEarning - grossDeduction;

  if (!selectedEmpId) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <Card className="shadow p-6 rounded-2xl">
          <h1 className="text-2xl font-bold mb-4">Dynamic Payslip Generator</h1>
          <div className="flex items-center gap-4 mb-4">
            <span>Select Employee:</span>
            <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Choose an employee" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYEES.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-center text-gray-500 mt-10">Choose an employee to generate payslip.</p>
        </Card>
      </div>
    );
  }

  // Annual View
  if (currentView === "annual") {
    const annualData = calculateAnnualData();
    const hasData = Object.keys(annualData).some(key => annualData[key]?.gross > 0);
    
    return (
      <div className="p-6 max-w-[1200px] mx-auto text-xs font-sans bg-white">
        {/* Controls */}
        <div className="mb-6 print:hidden">
          <Card className="shadow p-4 rounded-2xl">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span>Employee:</span>
                <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEES.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <label>Year:</label>
                <input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border px-2 py-1 w-20 text-sm rounded"
                />
              </div>

              <Button 
                onClick={() => setCurrentView("monthly")} 
                variant="outline"
                className="ml-4"
              >
                Back to Monthly
              </Button>

              <button
                onClick={() => window.print()}
                className="ml-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
              >
                Print Annual Report
              </button>
            </div>
          </Card>
        </div>
        
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold">HDFC Life Insurance Company Limited</h1>
          <p>MUMBAI - 4000067, MAHARASHTRA</p>
          <h2 className="text-sm font-semibold mt-2">
            Annual Earnings Report for {selectedEmployee?.name} - Year {selectedYear}
          </h2>
        </div>

        {!hasData ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No monthly data found for {selectedYear}</p>
            <p className="text-sm text-gray-400">Add some monthly payslip data first to see annual totals</p>
          </div>
        ) : (
          <div className="mb-6">
            <h3 className="font-bold mb-2">Annual Earnings Summary</h3>
            <table className="w-full border table-fixed text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left w-2/5">Description</th>
                  <th className="border p-2 text-left w-1/5">Gross Annual</th>
                  <th className="border p-2 text-left w-1/5">Exempt</th>
                  <th className="border p-2 text-left w-1/5">Taxable</th>
                </tr>
              </thead>
              <tbody>
                {earningCategories.map((category) => {
                  const data = annualData[category] || { gross: 0, exempt: 0 };
                  const taxable = data.gross - data.exempt;
                  
                  if (data.gross === 0) return null;
                  
                  return (
                    <tr key={category}>
                      <td className="border p-2">{category}</td>
                      <td className="border p-2 text-right">₹{data.gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="border p-2 text-right">₹{data.exempt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="border p-2 text-right">₹{taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}

                {/* Total Row */}
                <tr className="bg-gray-100 font-semibold">
                  <td className="border p-2 text-right">Total Annual</td>
                  <td className="border p-2 text-right">
                    ₹{Object.values(annualData).reduce((sum, i) => sum + (i?.gross || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border p-2 text-right">
                    ₹{Object.values(annualData).reduce((sum, i) => sum + (i?.exempt || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="border p-2 text-right">
                    ₹{Object.values(annualData).reduce((sum, i) => sum + ((i?.gross || 0) - (i?.exempt || 0)), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
            
            {/* Monthly Breakdown */}
            <div className="mt-8">
              <h3 className="font-bold mb-2">Monthly Breakdown ({selectedYear})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {months.map(month => {
                  const monthData = employeeData[selectedEmpId]?.[selectedYear]?.[month];
                  const monthTotal = monthData ? Object.values(monthData.earnings).reduce((sum, val) => sum + val, 0) : 0;
                  
                  return (
                    <div key={month} className={`border p-3 rounded ${monthTotal > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                      <div className="font-medium">{month}</div>
                      <div className="text-sm text-gray-600">
                        {monthTotal > 0 ? `₹${monthTotal.toLocaleString('en-IN')}` : 'No data'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Monthly View (Payslip)
  return (
    <div className="p-6 max-w-[1200px] mx-auto text-xs font-sans bg-white text-black print:text-black print:bg-white print:p-2 print:max-w-full print:text-[10px]">
      
      {/* Controls - Hidden in print */}
      <div className="mb-6 print:hidden">
        <Card className="shadow p-4 rounded-2xl">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span>Employee:</span>
              <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEES.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label>Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border px-2 py-1 text-sm rounded"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label>Year:</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border px-2 py-1 w-20 text-sm rounded"
              />
            </div>

            <Button onClick={saveCurrentMonthData} className="ml-4">
              Save Monthly Data
            </Button>

            <Button 
              onClick={() => setCurrentView("annual")} 
              variant="outline"
              className="ml-2"
            >
              View Annual Report
            </Button>

            <button
              onClick={() => window.print()}
              className="ml-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
            >
              Print Payslip
            </button>
          </div>
        </Card>
      </div>

      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">HDFC Life Insurance Company Limited</h1>
        <p>MUMBAI - 4000067, MAHARASHTRA</p>
        <h2 className="text-sm font-semibold mt-2">
          Pay Slip for the month of {selectedMonth} {selectedYear}
        </h2>
      </div>

      {/* Employee Details */}
      <div className="grid grid-cols-2 gap-4 border border-gray-400 p-4 mb-4">
        <div>
          <label><strong>Code:</strong></label>
          <input type="text" value={selectedEmployee?.code || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />

          <label><strong>Name:</strong></label>
          <input type="text" value={selectedEmployee?.name || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />

          <label><strong>Department:</strong></label>
          <input type="text" value={selectedEmployee?.department || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />

          <label><strong>Designation:</strong></label>
          <input type="text" value={selectedEmployee?.designation || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />

          <label><strong>Grade:</strong></label>
          <input type="text" value={selectedEmployee?.grade || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />

          <label><strong>DOB:</strong></label>
          <input type="text" value={selectedEmployee?.dob || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />

          <label><strong>DOJ:</strong></label>
          <input type="text" value={selectedEmployee?.doj || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />
        </div>
        <div>
          <label><strong>Location:</strong></label>
          <input type="text" value={selectedEmployee?.location || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />

          <label><strong>Bank/MICR:</strong></label>
          <input type="text" value={selectedEmployee?.bank || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />

          <label><strong>Cost Center:</strong></label>
          <input type="text" value={selectedEmployee?.costCenter || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />

          <label><strong>PAN No:</strong></label>
          <input type="text" value={selectedEmployee?.pan || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />

          <label><strong>PF No:</strong></label>
          <input type="text" value={selectedEmployee?.pf || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />

          <label><strong>ESI No:</strong></label>
          <input type="text" value={selectedEmployee?.esi || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />

          <label><strong>PF UAN:</strong></label>
          <input type="text" value={selectedEmployee?.pfUan || ""} onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} readOnly /><br />
        </div>
      </div>

      {/* Earnings and Deductions */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        {/* Earnings */}
        <div className="mb-6">
          <h3 className="font-bold mb-2">Earnings</h3>
          <table className="w-full border table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-1 text-left w-3/4">Description</th>
                <th className="border p-1 text-left w-1/4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {earningCategories.map((category) => (
                <tr key={category}>
                  <td className="border p-1">{category}</td>
                  <td className="border p-1">
                    <input
                      type="number"
                      step="0.01"
                      className="w-24 px-1"
                      value={monthlyEarnings[category] || 0}
                      onChange={(e) => updateEarning(category, e.target.value)}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value || 0).toFixed(2);
                        updateEarning(category, val);
                      }}
                    />
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="border p-1">GROSS EARNING</td>
                <td className="border p-1 text-right">
                  {parseFloat(grossEarning).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deductions */}
        <div>
          <h3 className="font-bold mb-2">Deductions</h3>
          <table className="w-full border table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-1 text-left w-3/5">Description</th>
                <th className="border p-1 text-left w-1.5/5">Amount</th>
                <th className="border p-1 text-center w-0.5/5">Include</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(deductions).map(([key, value]) => (
                <tr key={key}>
                  <td className="border p-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</td>
                  <td className="border p-1">
                    {deductionToggles[key] ? (
                      <input
                        type="number"
                        step="0.01"
                        className="w-24 px-1"
                        value={parseFloat(value).toFixed(2)}
                        readOnly
                      />
                    ) : (
                      <span className="block px-1 text-gray-500">
                        {parseFloat(value).toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="border p-1 text-center">
                    <input
                      type="checkbox"
                      checked={deductionToggles[key]}
                      onChange={() => toggleDeduction(key)}
                    />
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="border p-1">GROSS DEDUCTION</td>
                <td className="border p-1 text-right">
                  {parseFloat(grossDeduction).toFixed(2)}
                </td>
                <td className="border p-1" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <p className="text-center font-semibold mb-4">
        Net Pay: ₹{netPay.toFixed(2)} ({numberToWords(netPay)} Only)
      </p>
      
      <hr />
      <p className="text-xs text-center mt-6 border-t pt-4">
        Personal Note: This is a system generated payslip, does not require any signature.
      </p>
    </div>
  );
};

export default Payslip;