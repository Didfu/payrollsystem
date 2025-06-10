// Updated Payslip.jsx – prints Monthly + Annual together
"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

/* --------------------------------------------------
   Static look‑ups
-------------------------------------------------- */
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
    heading: 'TRIBE Pvt. Ltd.',
    address: '456 Sub Street, Mumbai, MH 400001',
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
    heading: 'Tiger Life Insurance Ltd.',
    address: '123 Main Street, Mumbai, MH 400001',
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
    heading: 'HDLC Life Assurance Ltd.',
    address: '456 Park Lane, Bengaluru, KA 560001',
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
  Basic: 129151.0,
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
  /* ---------- UI state ---------- */
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [currentView, setCurrentView] = useState("monthly"); // 'monthly' | 'annual'

  /* ---------- Data state ---------- */
  // { empId : { year : { month : { earnings, deductions, deductionToggles } } } }
  const [employeeData, setEmployeeData] = useState({});

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

  /* ---------- Helpers ---------- */
  const selectedEmployee = EMPLOYEES.find((e) => e.id === selectedEmpId);

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
          (n % 100 ? " " + toWords(n % 100) : "") +
          " Rupees"
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
    return result.trim();
  };

  /* ---------- Effects ---------- */
  // Load monthly data when employee/date changes
  useEffect(() => {
    if (!selectedEmpId || !selectedMonth || !selectedYear) return;
    const empData = employeeData[selectedEmpId] || {};
    const yearData = empData[selectedYear] || {};
    const monthData = yearData[selectedMonth] || {};

    setMonthlyEarnings(monthData.earnings || defaultMonthlyEarnings());
    setDeductions(
      monthData.deductions || {
        incomeTax: 0,
        pf: 0,
        professionalTax: 200,
        benevolence: 2000,
        esop: 5208,
      }
    );
    setDeductionToggles(
      monthData.deductionToggles || {
        incomeTax: true,
        pf: true,
        professionalTax: true,
        benevolence: true,
        esop: true,
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
      pf: Math.round(basic * 0.12),
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
    earningCategories.forEach((cat) => (totals[cat] = { gross: 0, exempt: 0 }));
    months.forEach((m) => {
      const mData = yearData[m];
      if (!mData?.earnings) return;
      earningCategories.forEach((cat) => {
        totals[cat].gross += mData.earnings[cat] || 0;
      });
    });
    return totals;
  };
  const annualData = calculateAnnualData();
  const hasAnnual = Object.values(annualData).some((d) => d.gross > 0);

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
    <div className="mb-6" >
      <h2 className="text-center text-lg font-bold mb-4">
        Annual Earnings Report – {selectedYear}
      </h2>
      {!hasAnnual ? (
        <p className="text-center text-gray-500">No annual data yet</p>
      ) : (
        <>
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
                const d = annualData[category] || { gross: 0, exempt: 0 };
                if (d.gross === 0) return null;
                return (
                  <tr key={category}>
                    <td className="border p-2">{category}</td>
                    <td className="border p-2 text-right">₹{d.gross.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className="border p-2 text-right">₹{d.exempt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className="border p-2 text-right">₹{(d.gross - d.exempt).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                  </tr>
                );
              })}
              {/* Total Row */}
              <tr className="bg-gray-100 font-semibold">
                <td className="border p-2 text-right">Total Annual</td>
                <td className="border p-2 text-right">
                  ₹{Object.values(annualData).reduce((s, i) => s + (i?.gross || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="border p-2 text-right">
                  ₹{Object.values(annualData).reduce((s, i) => s + (i?.exempt || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
                <td className="border p-2 text-right">
                  ₹{Object.values(annualData).reduce((s, i) => s + ((i?.gross || 0) - (i?.exempt || 0)), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Monthly Breakdown */}
          <div className="mt-8">
            <h3 className="font-bold mb-2">Monthly Breakdown ({selectedYear})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {months.map((month) => {
                const mData = employeeData[selectedEmpId]?.[selectedYear]?.[month];
                const mTotal = mData ? Object.values(mData.earnings).reduce((s, v) => s + v, 0) : 0;
                return (
                  <div
                    key={month}
                    className={`border p-3 rounded ${mTotal > 0 ? "bg-green-50" : "bg-gray-50"}`}
                  >
                    <div className="font-medium">{month}</div>
                    <div className="text-sm text-gray-600">
                      {mTotal > 0 ? `₹${mTotal.toLocaleString("en-IN")}` : "No data"}
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

  /* --------------------------------------------------
     Early‑exit screen asking to choose employee
  -------------------------------------------------- */
  if (!selectedEmpId) {
    return (
      <div className="p-6 max-w-[1200px] mx-auto">
        <Card className="shadow p-6 rounded-2xl">
          <h1 className="text-2xl font-bold mb-4">Payrolls</h1>
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

  /* --------------------------------------------------
     Render – we always include BOTH blocks.
     Tailwind classes:
       - For screen: show only the active block.
       - For print: force both to display (print:block overrides hidden).
  -------------------------------------------------- */
  return (
    <div className="p-6 max-w-[1200px] mx-auto text-xs font-sans bg-white text-black print:text-black print:bg-white print:p-2 print:max-w-full print:text-[10px]">
      {/* -------------- Controls (screen‑only) -------------- */}
      {currentView === "monthly" ? (
        <div className="mb-6 print:hidden">
          <Card className="shadow p-4 rounded-2xl">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {/* Employee select */}
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

              {/* Month + year */}
              <div className="flex items-center gap-2">
                <label>Month:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border px-2 py-1 text-sm rounded"
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
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
              <Button onClick={() => setCurrentView("annual")} variant="outline" className="ml-2">
                View Annual Report
              </Button>
              <button onClick={() => window.print()} className="ml-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
                Print (Monthly + Annual)
              </button>
            </div>
          </Card>
        </div>
      ) : (
        // ANNUAL CONTROLS
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
              <Button onClick={() => setCurrentView("monthly")} variant="outline" className="ml-2">
                Back to Monthly
              </Button>
              <button onClick={() => window.print()} className="ml-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
                Print (Annual + Monthly)
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* -------------- MONTHLY BLOCK -------------- */}
      <div className={currentView === "annual" ? "hidden print:block" : "block"}>
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold print:text-base">
            {selectedEmployee.heading}
          </h2>
          <p className="text-sm text-gray-600 print:text-xs">
            {selectedEmployee.address}
          </p>
          <h2 className="text-sm font-semibold mt-2">
            Pay Slip for the month of {selectedMonth} {selectedYear}
          </h2>
        </div>

        {/* Employee Details */}
        <div className="grid grid-cols-2 gap-4 border border-gray-400 p-4 mb-4">
          <div>
            {/* column‑1 */}
            {[
              ["Code", selectedEmployee?.code],
              ["Name", selectedEmployee?.name],
              ["Department", selectedEmployee?.department],
              ["Designation", selectedEmployee?.designation],
              ["Grade", selectedEmployee?.grade],
              ["DOB", selectedEmployee?.dob],
              ["DOJ", selectedEmployee?.doj],
            ].map(([label, val]) => (
              <div key={label}>
                <label className="font-semibold">{label}:</label>
                <input type="text" value={val || ""} onInput={handleResize} readOnly style={{ width: "auto", minWidth: "150px" }} />
              </div>
            ))}
          </div>
          <div>
            {/* column‑2 */}
            {[
              ["Location", selectedEmployee?.location],
              ["Bank/MICR", selectedEmployee?.bank],
              ["Cost Center", selectedEmployee?.costCenter],
              ["PAN No", selectedEmployee?.pan],
              ["PF No", selectedEmployee?.pf],
              ["ESI No", selectedEmployee?.esi],
              ["PF UAN", selectedEmployee?.pfUan],
            ].map(([label, val]) => (
              <div key={label}>
                <label className="font-semibold">{label}:</label>
                <input type="text" value={val || ""} onInput={handleResize} readOnly style={{ width: "auto", minWidth: "150px" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Earnings & deductions */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Earnings table */}
          <div>
            <h3 className="font-bold mb-2">Earnings</h3>
            <table className="w-full border table-fixed">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-1 text-left w-3/4">Description</th>
                  <th className="border p-1 text-left w-1/4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {earningCategories.map((cat) => (
                  <tr key={cat}>
                    <td className="border p-1">{cat}</td>
                    <td className="border p-1">
                      <input
                        type="number"
                        step="0.01"
                        className="w-24 px-1"
                        value={monthlyEarnings[cat] || 0}
                        onChange={(e) => updateEarning(cat, e.target.value)}
                        onBlur={(e) => updateEarning(cat, parseFloat(e.target.value || 0).toFixed(2))}
                      />
                    </td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="border p-1">GROSS EARNING</td>
                  <td className="border p-1 text-right">{grossEarning.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Deductions table */}
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
                {Object.entries(deductions).map(([k, v]) => (
                  <tr key={k}>
                    <td className="border p-1 capitalize">{k.replace(/([A-Z])/g, " $1").trim()}</td>
                    <td className="border p-1">
                      {deductionToggles[k] ? (
                        <input type="number" className="w-24 px-1" value={v.toFixed(2)} readOnly />
                      ) : (
                        <span className="block px-1 text-gray-500">{v.toFixed(2)}</span>
                      )}
                    </td>
                    <td className="border p-1 text-center">
                      <input type="checkbox" checked={deductionToggles[k]} onChange={() => toggleDeduction(k)} />
                    </td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="border p-1">GROSS DEDUCTION</td>
                  <td className="border p-1 text-right">{grossDeduction.toFixed(2)}</td>
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

      {/* -------------- ANNUAL BLOCK -------------- */}
      <div className={currentView === "monthly" ? "hidden print:block" : "block"}>
        {currentView === "annual" && (
          <div className="text-center mb-4" style={{ pageBreakBefore: 'always' }}>
            <h2 className="text-xl font-bold print:text-base">
              {selectedEmployee.heading}
            </h2>
            <p className="text-sm text-gray-600 print:text-xs">
              {selectedEmployee.address}
            </p>
            <h2 className="text-sm font-semibold mt-2">
              Annual Report – {selectedEmployee?.name} ({selectedYear})
            </h2>
          </div>
        )}
        <AnnualReportBlock />
      </div>
    </div>
  );
};

export default Payslip;
