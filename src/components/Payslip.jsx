"use client"; // for App Router
import React, { useState, useEffect } from "react";

const Payslip = () => {
  const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const [selectedMonth, setSelectedMonth] = useState("March");
const [selectedYear, setSelectedYear] = useState("2024");

  const [earnings, setEarnings] = useState([
    { desc: "Basic", rate: 129151.0 },
    { desc: "House Rent Allowance", rate: 77985.0 },
    { desc: "Other Allowance", rate: 27908.0 },
    { desc: "Car Allowance", rate: 6091.0 },
    { desc: "Interest Subsidy", rate: 3383.0 },
    { desc: "Performance Pay", rate: 57612.0 },
    { desc: "Long Term Incentive Plan", rate: 0.0 },
    { desc: "Miscellaneous Allowance", rate: 358.0 },
    { desc: "Mobile Handset Allowance", rate: 449.0 },
  ]);

  const [deductions, setDeductions] = useState({
    incomeTax: 0,
    pf: 0,
    professionalTax: 200,
    benevolence: 2000,
    esop: 5208,
  });
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
  const [deductionToggles, setDeductionToggles] = useState({
    incomeTax: true,
    pf: true,
    professionalTax: true,
    benevolence: true,
    esop: true,
  });

  const updateEarning = (index, value) => {
    const updated = [...earnings];
    updated[index].rate = parseFloat(value) || 0;
    setEarnings(updated);
  };
  const handleResize = (e) => {
    const input = e.target;
    input.style.width = `${Math.max(150, input.value.length * 8)}px`;
  };

  useEffect(() => {
    const gross = earnings.reduce((sum, item) => sum + item.rate, 0);
    const basic = earnings.find((e) => e.desc === "Basic")?.rate || 0;

    setDeductions((prev) => ({
      ...prev,
      incomeTax: Math.round(gross * 0.3),
      pf: Math.round(basic * 0.12),
    }));
  }, [earnings]);

  const toggleDeduction = (key) => {
    setDeductionToggles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };
  const updateAnnualEarning = (index, field, value) => {
  const updated = [...annualEarnings];
  updated[index][field] = parseFloat(value) || 0;
  setAnnualEarnings(updated);
};


  const grossEarning = earnings.reduce((sum, item) => sum + item.rate, 0);

  const grossDeduction = Object.entries(deductions).reduce(
    (sum, [key, value]) => (deductionToggles[key] ? sum + value : sum),
    0
  );

  const netPay = grossEarning - grossDeduction;
  const [annualEarnings, setAnnualEarnings] = useState([
    { desc: "Basic", gross: 1547470.00, exempt: 0.00 },
    { desc: "House Rent Allowance", gross: 904621.00, exempt: 0.00},
    { desc: "Other Allowance", gross: 733258.00, exempt: 0.00},
    { desc: "Car Allowance", gross: 603121.00, exempt: 0.00 },
    { desc: "Interest Subsidy", gross: 40308.00, exempt: 0.00},
    { desc: "Performance Pay", gross: 1145110.00, exempt: 0.00},
    { desc: "Long Term Incentive Plan", gross: 637408.00, exempt: 0.00},
    { desc: "Fuel and Driver", gross: 32310.00, exempt: 32310.00},
    { desc: "Childrens Education Allowance", gross: 2393.00, exempt: 2393.00},
    { desc: "Miscellaneous Allowance", gross: 576312.00, exempt: 0.00},
    { desc: "NPS CTC", gross: 152480.00, exempt: 0.00},
    { desc: "Mobile Handset Allowance", gross: 52830.00, exempt: 8499.00},
    { desc: "Stock Options", gross: 241050.00, exempt: 0.00},
  ]);
  const annualGrossTotal = annualEarnings.reduce((sum, item) => sum + item.gross, 0);
  const annualExemptTotal = annualEarnings.reduce((sum, item) => sum + item.exempt, 0);
  const annualTaxableTotal = annualEarnings.reduce((sum, item) => sum + item.taxable, 0);
  return (

    <div className="p-6 max-w-[1200px] mx-auto text-xs font-sans bg-white text-black print:text-black print:bg-white print:p-2 print:max-w-full print:text-[10px]">
      {/* Header */}
      <div className="flex justify-center items-center gap-2 mb-4 print:hidden">
  <label>Month:</label>
  <select
    value={selectedMonth}
    onChange={(e) => setSelectedMonth(e.target.value)}
    className="border px-2 py-1 text-sm"
  >
    {months.map((month) => (
      <option key={month} value={month}>
        {month}
      </option>
    ))}
  </select>

  <label>Year:</label>
  <input
    type="number"
    value={selectedYear}
    onChange={(e) => setSelectedYear(e.target.value)}
    className="border px-2 py-1 w-20 text-sm"
  />

  <button
    onClick={() => window.print()}
    className="ml-4 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
  >
    Print Payslip
  </button>
</div>

      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">HDFC Life Insurance Company Limited</h1>
        <p>MUMBAI - 4000067, MAHARASHTRA</p>
        <h2 className="text-sm font-semibold mt-2">
  Pay Slip for the month of {selectedMonth} {selectedYear}
</h2>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 border border-gray-400 p-4 mb-4">
        <div>
          <label><strong>Code:</strong></label>
          <input type="text" defaultValue="16761" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />

          <label><strong>Name:</strong></label>
          <input type="text" defaultValue="Mr SHAH" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />

          <label><strong>Department:</strong></label>
          <input type="text" defaultValue="BUSINESS INSIGHTS" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />

          <label><strong>Designation:</strong></label>
          <input type="text" defaultValue="EVP" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />

          <label><strong>Grade:</strong></label>
          <input type="text" defaultValue="16" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />

          <label><strong>DOB:</strong></label>
          <input type="text" defaultValue="2 Aug 1979" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />

          <label><strong>DOJ:</strong></label>
          <input type="text" defaultValue="18 Jun 2008" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />
        </div>
        <div>
          <label><strong>Location:</strong></label>
          <input type="text" defaultValue="Corporate" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />

          <label><strong>Bank/MICR:</strong></label>
          <input type="text" defaultValue="1234565678990 (HDFC BANK)" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />

          <label><strong>Cost Center:</strong></label>
          <input type="text" defaultValue="2000421233" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />

          <label><strong>PAN No:</strong></label>
          <input type="text" defaultValue="ABCDE12345" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />

          <label><strong>PF No:</strong></label>
          <input type="text" defaultValue="AB/CDE/12345/678/9012" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />

          <label><strong>ESI No:</strong></label>
          <input type="text" defaultValue="-" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />

          <label><strong>PF UAN:</strong></label>
          <input type="text" defaultValue="123456789012" onInput={handleResize} style={{ width: 'auto', minWidth: '150px' }} /><br />
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
              {earnings.map((item, idx) => (
                <tr key={idx}>
                  <td className="border p-1">{item.desc}</td>
                  <td className="border p-1">
                    <input
                      type="number"
                      step="0.01"
                      className="w-24 px-1"
                      value={item.rate}
                      onChange={(e) => updateEarning(idx, e.target.value)}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value || 0).toFixed(2);
                        updateEarning(idx, val);
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
                <th className="border p-1 text-center w-0.5/5 ">Include</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(deductions).map(([key, value]) => (
                <tr key={key}>
                  <td className="border p-1 capitalize">{key}</td>
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
                  <td className="border p-1 text-center ">
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
        Net Pay: {netPay.toFixed(2)} ({numberToWords(netPay)} Only)
      </p>
      <p className="font-bold mb-2">Income Tax Worksheet for the Period April 2023 - March 2024</p>
      <hr></hr><br></br>
      {/* Additional tables for Income Tax Worksheet, Deductions, Perqs, etc., can be added here similarly with detailed rows */}
      {/* Annual Earnings Table (Income Tax Worksheet Section) */}
      <div className="mb-6">
  <h3 className="font-bold mb-2">Annual Earnings</h3>
  <table className="w-full border table-fixed text-sm">
    <thead className="bg-gray-100">
      <tr>
        <th className="border p-1 text-left w-2/5">Description</th>
        <th className="border p-1 text-left w-1/5">Gross</th>
        <th className="border p-1 text-left w-1/5">Exempt</th>
        <th className="border p-1 text-left w-1/5">Taxable</th>
      </tr>
    </thead>
    <tbody>
      {annualEarnings.map((item, idx) => (
        <tr key={idx}>
          <td className="border p-1">{item.desc}</td>
          <td className="border p-1">
            <input
              type="number"
              value={item.gross}
              onChange={(e) => updateAnnualEarning(idx, "gross", e.target.value)}
              className="w-full px-1"
            />
          </td>
          <td className="border p-1">
            <input
              type="number"
              value={item.exempt}
              onChange={(e) => updateAnnualEarning(idx, "exempt", e.target.value)}
              className="w-full px-1"
            />
          </td>
          <td className="border p-1">
            {(item.gross - item.exempt).toFixed(2)}
          </td>
        </tr>
      ))}

      {/* Total Row */}
      <tr className="bg-gray-100 font-semibold">
        <td className="border p-1 text-right">Total</td>
        <td className="border p-1">
          {annualEarnings.reduce((sum, i) => sum + i.gross, 0).toFixed(2)}
        </td>
        <td className="border p-1">
          {annualEarnings.reduce((sum, i) => sum + i.exempt, 0).toFixed(2)}
        </td>
        <td className="border p-1">
          {annualEarnings
            .reduce((sum, i) => sum + (i.gross - i.exempt), 0)
            .toFixed(2)}
        </td>
      </tr>
    </tbody>
  </table>
</div>

        <hr></hr>
      <p className="text-xs text-center mt-6 border-t pt-4">
        Personal Note: This is a system generated payslip, does not require any signature.
      </p>
    </div>
  );
};

export default Payslip;
