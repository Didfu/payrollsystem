"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { firebaseService } from '../lib/firebaseService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import { useEffect, useState } from "react";

const printStyles = `@media print { @page { margin: 0.75in 0.5in; size: A4; } body { padding: 0 !important; } .pay-section { border: 1px solid black !important; margin-bottom: 12px !important; } .print-page-break { page-break-after: always; } .print-page-break-before { page-break-before: always; } .print-header { margin-bottom: 12px !important; text-align: center; } .print-header h1 { font-size: 18px !important; margin-bottom: 4px !important; font-weight: bold; } .print-header h2 { font-size: 16px !important; margin: 4px 0 !important; font-weight: bold; } .print-header p { font-size: 11px !important; margin: 2px 0 !important; } .print-header .border-t { border-top: 2px solid black !important; border-bottom: 2px solid black !important; padding: 8px 0 !important; margin: 8px 0 !important; } .employee-details { margin-bottom: 12px !important; font-size: 11px !important; } .employee-details .grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 16px !important; } .employee-details .space-y-1 > * + * { margin-top: 2px !important; } .employee-details p { display: flex !important; margin: 2px 0 !important; } .employee-details span:first-child { width: 120px !important; font-weight: 600; flex-shrink: 0; } .pay-section { border: 2px solid black !important; margin-bottom: 12px !important; } .pay-section h3 { font-size: 12px !important; padding: 6px 8px !important; margin: 0 !important; background: #f0f0f0 !important; border-bottom: 1px solid black !important; font-weight: bold; } .pay-section .p-3 { padding: 8px !important; } .pay-section .space-y-2 > * + * { margin-top: 3px !important; } .pay-section .text-sm { font-size: 11px !important; } .pay-section .border-t { border-top: 1px solid black !important; padding-top: 6px !important; margin-top: 6px !important; } .pay-details-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 16px !important; } .net-pay-section { margin-top: 12px !important; padding: 8px !important; border: 3px solid black !important; background: white !important; } .summary-cards .bg-blue-50, .summary-cards .bg-green-50, .summary-cards .bg-purple-50 { padding: 8px !important; } .monthly-section { margin-bottom: 32px !important; } .annual-section { margin-top: 32px !important; } .print-page-break-before { page-break-before: auto !important; } .net-pay-section .text-xl { font-size: 16px !important; font-weight: bold; } .net-pay-section .text-sm { font-size: 10px !important; margin-top: 6px !important; } .annual-table { font-size: 10px !important; width: 100% !important; border-collapse: collapse !important; margin-top: 12px !important; } .annual-table th, .annual-table td { border: 1px solid black !important; padding: 4px 6px !important; text-align: left; } .annual-table th { background: #e0e0e0 !important; font-weight: bold !important; } .annual-table td:not(:first-child) { text-align: right !important; } .monthly-grid { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 8px !important; margin-top: 12px !important; page-break-inside: avoid; } .monthly-grid > div { border: 1px solid black !important; padding: 6px !important; font-size: 9px !important; text-align: center; } .monthly-grid .selected-month { border: 2px solid black !important; } .monthly-grid .font-semibold { font-size: 9px !important; font-weight: bold !important; margin-bottom: 2px !important; } .monthly-grid .text-lg { font-size: 11px !important; font-weight: bold !important; } .print-only { display: block !important; } .screen-only { display: none !important; } .print-section { page-break-inside: avoid; margin-bottom: 24px !important; } .monthly-section, .annual-section { display: block !important; } .section-heading { font-size: 14px !important; font-weight: bold !important; margin: 12px 0 8px 0 !important; border-bottom: 1px solid black !important; padding-bottom: 4px !important; } } @media screen { .print-only { display: none !important; } .screen-only { display: block !important; } }`;
const months = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
const earningCategories = ["Basic", "Dearness Allowance","House Rent Allowance", "Other Allowance", "Car Allowance", "Interest Subsidy", "Performance Pay", "Long Term Incentive Plan", "Miscellaneous Allowance", "Mobile Handset Allowance"];
const defaultMonthlyEarnings = () => Object.fromEntries(earningCategories.map(cat => [cat, 0]));
const initialEmployeeState = { name: "", code: "", department: "", designation: "", grade: "", dob: "", doj: "", location: "", bank: "", costCenter: "", pan: "", pf: "", esi: "", heading: "", address: "", basicSalary: 20000.0, pfUan: "" };

const Payslip = ({ user }) => {
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [showAddEmployee, setShowAddEmployee] = useState(false);
    const [editingEmployeeId, setEditingEmployeeId] = useState(null);
    const [selectedEmpId, setSelectedEmpId] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("March");
    const [selectedYear, setSelectedYear] = useState("2025-26"); // This state holds the displayed format
    const [currentView, setCurrentView] = useState("monthly");
    const [employeeData, setEmployeeData] = useState({}); // This stores data with normalized year keys (e.g., '2025')
    const [monthlyEarnings, setMonthlyEarnings] = useState(defaultMonthlyEarnings());
    const [deductions, setDeductions] = useState({
        pf: 0,
        esic: 0,
        professionalTax: 200,
        loanRepayment: 0,
        esop: 5208,
        benevolence: 2000,
        incomeTax: 0,
    });
    
    // Reordered deductionToggles to match
    const [deductionToggles, setDeductionToggles] = useState({
        pf: true,
        esic: true,
        professionalTax: true,
        loanRepayment: true,
        esop: true,
        benevolence: true,
        incomeTax: true,
    });
    const [tdsDeductions, setTdsDeductions] = useState({
    'April-2023': 496078.00,
    'May-2023': 104157.00,
    'June-2023': 104124.00,
    'July-2023': 104124.00,
    'August-2023': 104123.00,
    'September-2023': 104124.00,
    'October-2023': 322882.00,
    'November-2023': 101906.00,
    'December-2023': 101906.00,
    'January-2024': 88704.00,
    'February-2024': 86782.00,
    'March-2024': 168585.00,
    'Tax Deducted on Perq.': 0.00
});
    const [typedValue, setTypedValue] = useState("2025-26");
    const [isLoading, setIsLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareEmail, setShareEmail] = useState("");
    const [sharedData, setSharedData] = useState([]);
    const [showSharedData, setShowSharedData] = useState(false);
    // Add this after your existing state declarations
const [taxDeductions, setTaxDeductions] = useState({
    standardDeduction: 75000,
    professionalTax: 2500,
    underChapterVIA: 0,
    anyOtherIncome: 0,
    taxableIncome: 0,
    totalTax: 0,
    taxRebate: 0,
    surcharge: 0,
    taxDue: 0,
    healthAndEducationCess: 0,
    netTax: 0,
    taxDeductedPreviousEmployer: 0,
    taxDeductedOnPerq: 0,
    taxDeductedOnAnyOtherIncome: 0,
    taxDeductedTillDate: 0,
    taxToBeDeducted: 0,
    taxPerMonth: 0,
    taxOnNonRecurringEarnings: 0,
    taxDeductionForThisMonth: 0
});

    // Helper function to normalize the year string
    const getNormalizedYear = (yearString) => {
        if (!yearString) return '';
        // If it's already a 4-digit year (e.g., "2025"), return it as is.
        // If it's "2025-26", split and take the first part "2025".
        const parts = yearString.split('-');
        return parts[0];
    };

    useEffect(() => {
        const loadSharedData = async () => {
            if (!user?.email) return;
            try {
                const shared = await firebaseService.getSharedPayrollData(user.email);
                setSharedData(shared.filter(item => item.status === 'pending'));
            } catch (error) {
                console.error('Error loading shared data:', error);
            }
        };
        loadSharedData();
    }, [user?.email]);

    const handleSharePayroll = async () => {
        if (!shareEmail.trim()) {
            alert("Please enter an email address");
            return;
        }
        if (!selectedEmployee || !selectedMonth || !selectedYear) {
            alert("Please select employee, month and year");
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(shareEmail.trim())) {
            alert("Please enter a valid email address");
            return;
        }
        setIsLoading(true);
        try {
            await firebaseService.sharePayrollData(user.uid, shareEmail.trim(), selectedEmployee.id);
            alert(`Payroll data shared successfully with ${shareEmail}!`);
            setShowShareModal(false);
            setShareEmail("");
        } catch (error) {
            console.error('Error sharing payroll:', error);
            alert('Error sharing payroll data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAcceptSharedData = async (shareItem) => {
        setIsLoading(true);
        try {
            // Note: firebaseService.acceptSharedData should handle the 'normalizedYear' internally
            await firebaseService.acceptSharedData(shareItem.id, user.uid, shareItem.shareData);
            const employeesData = await firebaseService.getEmployees(user.uid);
            const employeesWithLocalIds = employeesData.map(emp => ({ ...emp, id: emp.id }));
            setEmployees(employeesWithLocalIds);
            const payrollData = await firebaseService.getAllPayrollData(user.uid);
            setEmployeeData(payrollData); // This object will use normalized years as keys
            setSharedData(prev => prev.filter(item => item.id !== shareItem.id));
            alert("Shared data accepted successfully!");
        } catch (error) {
            console.error('Error accepting shared data:', error);
            alert('Error accepting shared data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const loadUserData = async () => {
            if (!user?.uid || dataLoaded) return;
            setIsLoading(true);
            try {
                const employeesData = await firebaseService.getEmployees(user.uid);
                const employeesWithLocalIds = employeesData.map(emp => ({ ...emp, id: emp.id }));
                setEmployees(employeesWithLocalIds);
                const payrollData = await firebaseService.getAllPayrollData(user.uid);
                setEmployeeData(payrollData); // This object will use normalized years as keys
                if (employeesWithLocalIds.length > 0) {
                    setSelectedEmpId(employeesWithLocalIds[0].id);
                    setIsSetupComplete(true);
                }
                setDataLoaded(true);
            } catch (error) {
                console.error('Error loading user data:', error);
                alert('Error loading your data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        loadUserData();
    }, [user?.uid, dataLoaded]);

    useEffect(() => {
        const styleSheet = document.createElement("style");
        styleSheet.textContent = printStyles;
        document.head.appendChild(styleSheet);
        return () => document.head.removeChild(styleSheet);
    }, []);

    const handleSaveEmployee = async (employeeData) => {
        if (!employeeData.name.trim() || !employeeData.code.trim()) {
            alert("Please fill in at least the name and employee code");
            return;
        }
        setIsLoading(true);
        try {
            const savedId = await firebaseService.saveEmployee(user.uid, employeeData);
            if (employeeData.id) {
                setEmployees(prev => prev.map(emp => emp.id === employeeData.id ? { ...employeeData, id: savedId } : emp));
                alert("Employee updated successfully!");
            } else {
                setEmployees(prev => [...prev, { ...employeeData, id: savedId }]);
                alert("Employee added successfully!");
            }
            setEditingEmployeeId(null);
            setShowAddEmployee(false);
        } catch (error) {
            console.error('Error saving employee:', error);
            alert('Error saving employee. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteEmployee = async (empId) => {
        if (!confirm("Are you sure you want to delete this employee? This will also delete all their payroll data.")) {
            return;
        }
        setIsLoading(true);
        try {
            await firebaseService.deleteEmployee(user.uid, empId);
            setEmployees(prev => prev.filter(emp => emp.id !== empId));
            if (selectedEmpId === empId) setSelectedEmpId("");
            alert("Employee deleted successfully!");
        } catch (error) {
            console.error('Error deleting employee:', error);
            alert('Error deleting employee. Please try again.');
        } finally {
            setIsLoading(false);
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

    const numberToWords = (num) => {
        if (num === 0) return "Zero";
        const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
        const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
        const toWords = (n) => {
            if (n < 20) return a[n];
            if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
            if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + toWords(n % 100) : "");
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

    // Use normalized year to access data
    useEffect(() => {
        if (!selectedEmpId || !selectedMonth || !selectedYear) return;
        const normalizedYear = getNormalizedYear(selectedYear); // Get the 4-digit year key
        const monthData = employeeData[selectedEmpId]?.[normalizedYear]?.[selectedMonth] || {};

        const defaultEarnings = defaultMonthlyEarnings();
        if (selectedEmployee?.basicSalary) defaultEarnings.Basic = selectedEmployee.basicSalary;
        setMonthlyEarnings(monthData.earnings || defaultEarnings);
        setDeductions(monthData.deductions || { pf: 0,
        esic: 0,
        professionalTax: 200,
        loanRepayment: 0,
        esop: 5208,
        benevolence: 2000,
        incomeTax: 0, });
        setDeductionToggles(monthData.deductionToggles || { pf: true,
        esic: true,
        professionalTax: true,
        loanRepayment: true,
        esop: true,
        benevolence: true,
        incomeTax: true, });
        setTdsDeductions(monthData.tdsDeductions || {
    'April-2023': 496078.00,
    'May-2023': 104157.00,
    'June-2023': 104124.00,
    'July-2023': 104124.00,
    'August-2023': 104123.00,
    'September-2023': 104124.00,
    'October-2023': 322882.00,
    'November-2023': 101906.00,
    'December-2023': 101906.00,
    'January-2024': 88704.00,
    'February-2024': 86782.00,
    'March-2024': 168585.00,
    'Tax Deducted on Perq.': 0.00
});

        setTaxDeductions(monthData.taxDeductions || {
        standardDeduction: 75000,
        professionalTax: 2500, underChapterVIA: 0, anyOtherIncome: 0, taxableIncome: 0,
        totalTax: 0, taxRebate: 0, surcharge: 0, taxDue: 0, healthAndEducationCess: 0,
        netTax: 0, taxDeductedPreviousEmployer: 0, taxDeductedOnPerq: 0,
        taxDeductedOnAnyOtherIncome: 0, taxDeductedTillDate: 0, taxToBeDeducted: 0,
        taxPerMonth: 0, taxOnNonRecurringEarnings: 0, taxDeductionForThisMonth: 0
    });
    }, [selectedEmpId, selectedMonth, selectedYear, employeeData, selectedEmployee]);

    useEffect(() => {
        if (!monthlyEarnings || typeof monthlyEarnings !== 'object') {
            // console.warn("monthlyEarnings is not a valid object during deduction calculation, skipping."); // For debugging
            return; // Exit early if monthlyEarnings is not an object
        }
        const gross = Object.values(monthlyEarnings).reduce((s, v) => s + v, 0);
        const basic = monthlyEarnings["Basic"] || 0;
        const dear = monthlyEarnings["Dearness Allowance"] || 0;
        setDeductions((prev) => ({ ...prev, incomeTax: Math.round(gross * 0.3), pf: Math.ceil((basic+dear) * 0.12), esic: basic * 0.0075, }));
    }, [monthlyEarnings]);

    const grossEarning = Object.values(monthlyEarnings).reduce((s, v) => s + v, 0);
    const grossDeduction = Object.entries(deductions).reduce((s, [k, v]) => (deductionToggles[k] ? s + v : s), 0);
    const netPay = grossEarning - grossDeduction;

    const calculateAnnualData = () => {
        if (!selectedEmpId || !selectedYear) return {};
        const normalizedYear = getNormalizedYear(selectedYear); // Get the 4-digit year key
        const yearData = employeeData[selectedEmpId]?.[normalizedYear] || {};

        const totals = {};
        earningCategories.forEach((cat) => (totals[cat] = { gross: 0, projectedGross: 0 }));

        let actualMonthsCount = 0;
        let firstAvailableMonthData = null;
        months.forEach((m) => {
            if (yearData[m]?.earnings) { // Access using 'm' for month, not normalizedYear
                actualMonthsCount++;
                if (!firstAvailableMonthData) firstAvailableMonthData = yearData[m].earnings;
                earningCategories.forEach((cat) => {
                    totals[cat].gross += yearData[m].earnings[cat] || 0;
                });
            }
        });

        const remainingMonths = Math.max(0, 12 - actualMonthsCount);
        if (firstAvailableMonthData && remainingMonths > 0) {
            earningCategories.forEach((cat) => {
                totals[cat].projectedGross = (firstAvailableMonthData[cat] || 0) * remainingMonths;
            });
        }
        Object.values(totals)[0].actualMonths = actualMonthsCount;
        Object.values(totals)[0].projectedMonths = remainingMonths;
        return totals;
    };

    const annualData = calculateAnnualData();
    const hasAnnual = Object.values(annualData).some((d) => d.gross > 0 || d.projectedGross > 0);

    const updateEarning = (category, val) => setMonthlyEarnings((prev) => ({ ...prev, [category]: parseFloat(val) || 0 }));
    const toggleDeduction = (k) => setDeductionToggles((prev) => ({ ...prev, [k]: !prev[k] }));

    const saveCurrentMonthData = async () => {
        if (!selectedEmpId || !selectedMonth || !selectedYear) {
            return alert("Please select employee, month and year");
        }
        setIsLoading(true);
        try {
            const normalizedYear = getNormalizedYear(selectedYear); // Use normalized year for saving
            await firebaseService.saveMonthlyData(user.uid, selectedEmpId, normalizedYear, selectedMonth, { earnings: { ...monthlyEarnings }, deductions: { ...deductions }, deductionToggles: { ...deductionToggles }, taxDeductions: { ...taxDeductions },tdsDeductions: { ...tdsDeductions } });
            
            // Update local state with the normalized year key
            setEmployeeData((prev) => ({
                ...prev,
                [selectedEmpId]: {
                    ...prev[selectedEmpId],
                    [normalizedYear]: { // Ensure this key is the normalized year
                        ...prev[selectedEmpId]?.[normalizedYear],
                        [selectedMonth]: {
                            earnings: { ...monthlyEarnings },
                            deductions: { ...deductions },
                            deductionToggles: { ...deductionToggles },
                            taxDeductions: { ...taxDeductions },
                            tdsDeductions: { ...tdsDeductions }
                        },
                    },
                },
            }));
            alert(`Data saved for ${selectedMonth} ${selectedYear}!`);
        } catch (error) {
            console.error('Error saving monthly data:', error);
            alert('Error saving data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const AnnualReportBlock = () => (
        <div className="mb-6">
            {!hasAnnual ? <p className="text-center text-gray-500">No annual data available</p> : (
                <>
                    <div className="mt-6 grid grid-cols-3 gap-4 ">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-2 text-sm">Actual Earnings</h4>
                            <p className="text-xl font-bold text-blue-600 mb-1">₹{Object.values(annualData).reduce((s, i) => s + (i?.gross || 0), 0).toLocaleString("en-IN")}</p>
                            <p className="text-sm text-blue-600">{Object.values(annualData)[0]?.actualMonths || 0} months</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-800 mb-2 text-sm">Projected Earnings</h4>
                            <p className="text-xl font-bold text-green-600 mb-1">₹{Object.values(annualData).reduce((s, i) => s + (i?.projectedGross || 0), 0).toLocaleString("en-IN")}</p>
                            <p className="text-sm text-green-600">{Object.values(annualData)[0]?.projectedMonths || 0} months</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-800 mb-2 text-sm">Total Annual</h4>
                            <p className="text-xl font-bold text-purple-600 mb-1">₹{Object.values(annualData).reduce((s, i) => s + ((i?.gross || 0) + (i?.projectedGross || 0)), 0).toLocaleString("en-IN")}</p>
                            <p className="text-sm text-purple-600">Complete year</p>
                        </div>
                        </div>
                        <div className="mt-8">
                        <h3 className="font-bold mb-4 section-heading">Monthly Breakdown ({selectedYear})</h3>
                        <div className="grid grid-cols-6 gap-3 ">
                            {months.map((month) => {
                                const normalizedSelectedYearForMonthlyBreakdown = getNormalizedYear(selectedYear); // Crucial for monthly breakdown
                                const mData = employeeData[selectedEmpId]?.[normalizedSelectedYearForMonthlyBreakdown]?.[month];
                                const mTotal = mData ? Object.values(mData.earnings).reduce((s, v) => s + v, 0) : 0;
                                const hasData = mTotal > 0;
                                return (
                                    <div
                                        key={month}
                                        className={`border-2 p-3 rounded-lg transition-all hover:shadow-md cursor-pointer ${hasData ? "bg-green-50 border-green-300 hover:bg-green-100" : "bg-gray-50 border-gray-300 hover:bg-gray-100"} ${selectedMonth === month ? "ring-2 ring-green-500" : ""}`}
                                        onClick={() => { if (hasData) { setSelectedMonth(month); setCurrentView("monthly"); } }}
                                    >
                                        <div className="font-medium text-sm mb-2 text-center">{month}</div>
                                        <div className={`text-base font-bold text-center ${hasData ? "text-green-700" : "text-gray-400"}`}>
                                            {hasData ? `₹${Math.round(mTotal).toLocaleString("en-IN")}` : "No data"}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    
                    </div>
                    <h3 className="font-bold mb-4 mt-6 section-heading">Annual Earnings Summary</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-sm annual-table">
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 p-3 text-left font-semibold">Description</th>
                                    <th className="border border-gray-300 p-3 text-right font-semibold">Actual ({Object.values(annualData)[0]?.actualMonths || 0} months)</th>
                                    <th className="border border-gray-300 p-3 text-right font-semibold">Projected ({Object.values(annualData)[0]?.projectedMonths || 0} months)</th>
                                    <th className="border border-gray-300 p-3 text-right font-semibold">Total Annual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earningCategories.map((category) => {
                                    const d = annualData[category] || { gross: 0, projectedGross: 0 };
                                    const totalAmount = d.gross + d.projectedGross;
                                    if (totalAmount === 0) return null;
                                    return (
                                        <tr key={category}>
                                            <td className="border border-gray-300 p-3 font-medium">{category}</td>
                                            <td className="border border-gray-300 p-3 text-right">₹{d.gross.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="border border-gray-300 p-3 text-right">₹{d.projectedGross.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            <td className="border border-gray-300 p-3 text-right font-semibold">₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        </tr>
                                    );
                                })}
                                 
                                <tr className="bg-gray-100 font-semibold border-t-2 border-gray-400">
                                    <td className="border border-gray-300 p-3 text-right font-bold">Total Annual</td>
                                    <td className="border border-gray-300 p-3 text-right font-bold">₹{Object.values(annualData).reduce((s, i) => s + (i?.gross || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="border border-gray-300 p-3 text-right font-bold">₹{Object.values(annualData).reduce((s, i) => s + (i?.projectedGross || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    <td className="border border-gray-300 p-3 text-right font-bold text-blue-700">₹{Object.values(annualData).reduce((s, i) => s + ((i?.gross || 0) + (i?.projectedGross || 0)), 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-8">
                    <TaxDeductionTable />
                </div>

                </>
            )}
        </div>
    );
    // Add this new component after the AnnualReportBlock function
const TaxDeductionTable = () => {
    const taxDeductionFields = [
        { key: 'standardDeduction', label: 'Standard Deduction' },
        { key: 'professionalTax', label: 'Professional Tax' },
        { key: 'underChapterVIA', label: 'Under Chapter VI-A' },
        { key: 'anyOtherIncome', label: 'Any Other Income' },
        { key: 'taxableIncome', label: 'Taxable Income' },
        { key: 'totalTax', label: 'Total Tax' },
        { key: 'taxRebate', label: 'Tax Rebate u/s 87a' },
        { key: 'surcharge', label: 'Surcharge' },
        { key: 'taxDue', label: 'Tax Due' },
        { key: 'healthAndEducationCess', label: 'Health and Education Cess' },
        { key: 'netTax', label: 'Net Tax' },
        { key: 'taxDeductedPreviousEmployer', label: 'Tax Deducted (Previous Employer)' },
        { key: 'taxDeductedOnPerq', label: 'Tax Deducted on Perq.' },
        { key: 'taxDeductedOnAnyOtherIncome', label: 'Tax Deducted on Any Other Income.' },
        { key: 'taxDeductedTillDate', label: 'Tax Deducted Till Date' },
        { key: 'taxToBeDeducted', label: 'Tax to be Deducted' },
        { key: 'taxPerMonth', label: 'Tax/Month' },
        { key: 'taxOnNonRecurringEarnings', label: 'Tax on Non-Recurring Earnings' },
        { key: 'taxDeductionForThisMonth', label: 'Tax Deduction for this month' }
    ];

    const updateTaxDeduction = (key, value) => {
        setTaxDeductions(prev => ({
            ...prev,
            [key]: parseFloat(value) || 0
        }));
    };

    return (
        <div className="mb-6 print:mb-4">
            <h3 className="font-bold mb-4 section-heading">Tax Deductions & TDS Summary</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tax Deductions Table */}
                <div>
                    <h4 className="font-semibold mb-3 text-sm">Tax Deductions</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300 text-sm annual-table">
                            <colgroup>
                                <col className="w-3/4" />
                                <col className="w-1/4" />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th className="border border-gray-300 p-3 text-left font-semibold">Description</th>
                                    <th className="border border-gray-300 p-3 text-right font-semibold w-32">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxDeductionFields.map(({ key, label }) => (
                                    <tr key={key}>
                                        <td className="border border-gray-300 p-3 font-medium">{label}</td>
                                        <td className="border border-gray-300 p-3 text-right w-32">
                                            <span className="screen-only">
                                                <input
                                                    type="number"
                                                    defaultValue={taxDeductions[key] || 0}
                                                    onBlur={(e) => updateTaxDeduction(key, e.target.value)}
                                                    className="w-full text-right border-0 bg-transparent focus:outline-1px"
                                                    step="0.01"
                                                />
                                            </span>
                                            <span className="print-only">
                                                ₹{(taxDeductions[key] || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TDS Deducted Monthly Table */}
                <div>
                    <TDSDeductedMonthlyTable />
                </div>
            </div>
        </div>
    );
};
const TDSDeductedMonthlyTable = () => {
    const [tdsDeductions, setTdsDeductions] = useState([]);

    const addRow = () => {
        setTdsDeductions(prev => [...prev, { month: '', amount: 0 }]);
    };

    const removeRow = (index) => {
        setTdsDeductions(prev => prev.filter((_, i) => i !== index));
    };

    const updateRow = (index, field, value) => {
        setTdsDeductions(prev => 
            prev.map((row, i) => 
                i === index 
                    ? { ...row, [field]: field === 'amount' ? parseFloat(value) || 0 : value }
                    : row
            )
        );
    };

    const totalTds = tdsDeductions.reduce((sum, row) => sum + (row.amount || 0), 0);

    return (
        <div className="mb-6 print:mb-4">
            <h3 className="font-bold mb-4 section-heading">TDS Deducted Monthly</h3>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm annual-table">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 p-3 text-left font-semibold">Month</th>
                            <th className="border border-gray-300 p-3 text-right font-semibold">Amount</th>
                            <th className="border border-gray-300 p-3 text-center font-semibold print:hidden">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tdsDeductions.map((row, index) => (
                            <tr key={index}>
                                <td className="border border-gray-300 p-3 font-medium">
                                    <div className="print:hidden">
                                        <input
                                            type="text"
                                            value={row.month}
                                            onChange={(e) => updateRow(index, 'month', e.target.value)}
                                            placeholder="Enter month/period"
                                            className="w-full border-0 bg-transparent focus:outline-1px font-medium"
                                        />
                                    </div>
                                    <div className="hidden print:block">
                                        {row.month}
                                    </div>
                                </td>
                                <td className="border border-gray-300 p-3 text-right">
                                    <div className="print:hidden">
                                        <input
                                            type="number"
                                            value={row.amount}
                                            onChange={(e) => updateRow(index, 'amount', e.target.value)}
                                            placeholder="0.00"
                                            className="w-full text-right border-0 bg-transparent focus:outline-1px"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="hidden print:block">
                                        {row.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </div>
                                </td>
                                <td className="border border-gray-300 p-3 text-center print:hidden">
                                    <button
                                        onClick={() => removeRow(index)}
                                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        title="Remove row"
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {tdsDeductions.length === 0 && (
                            <tr className="print:hidden">
                                <td colSpan="3" className="border border-gray-300 p-6 text-center text-gray-500">
                                    No entries yet. Click "Add Row" to start.
                                </td>
                            </tr>
                        )}
                        {tdsDeductions.length > 0 && (
                            <tr className="bg-gray-100 font-semibold border-t-2 border-gray-400">
                                <td className="border border-gray-300 p-3 text-right font-bold">Total</td>
                                <td className="border border-gray-300 p-3 text-right font-bold text-blue-700">
                                    {totalTds.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="border border-gray-300 p-3 print:hidden"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 print:hidden">
                <button
                    onClick={addRow}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                >
                    Add Row
                </button>
            </div>
        </div>
    );
};

    const MonthlyPayslipBlock = () => (
        <div className="mb-6">
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
            <div className="grid grid-cols-2 gap-6 print:gap-4 pay-details-grid">
                <div className="border print:border-black pay-section">
    <h3 className="font-bold bg-gray-100 p-3 print:bg-gray-200 print:p-2 print:text-sm border-b print:border-black">EARNINGS</h3>
    <div className="p-3 print:p-2">
        <table className="w-full border-collapse text-sm">
            <colgroup>
                <col className="w-3/4" />
                <col className="w-1/4" />
            </colgroup>
            <thead>
                <tr>
                    <th className="border border-gray-300 p-2 text-left font-semibold print:border-black">Description</th>
                    <th className="border border-gray-300 p-2 text-right font-semibold print:border-black">Amount</th>
                </tr>
            </thead>
            <tbody>
                {earningCategories.map((category) => {
                    const amount = monthlyEarnings[category] || 0;
                    if (amount === 0) return null;
                    return (
                        <tr key={category}>
                            <td className="border border-gray-300 p-2 print:border-black">{category}</td>
                            <td className="border border-gray-300 p-2 text-right font-medium print:border-black">₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        </tr>
                    );
                })}
                <tr className="bg-gray-100 font-semibold border-t-2 border-gray-400">
                    <td className="border border-gray-300 p-2 font-bold print:border-black">Total Earnings</td>
                    <td className="border border-gray-300 p-2 text-right font-bold print:border-black">₹{grossEarning.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
<div className="border print:border-black pay-section">
    <h3 className="font-bold bg-gray-100 p-3 print:bg-gray-200 print:p-2 print:text-sm border-b print:border-black">DEDUCTIONS</h3>
    <div className="p-3 print:p-2">
        <table className="w-full border-collapse text-sm">
            <colgroup>
                <col className="w-3/4" />
                <col className="w-1/4" />
            </colgroup>
            <thead>
                <tr>
                    <th className="border border-gray-300 p-2 text-left font-semibold print:border-black">Description</th>
                    <th className="border border-gray-300 p-2 text-right font-semibold print:border-black">Amount</th>
                </tr>
            </thead>
            <tbody>
                {[
                    "pf",
                    "esic",
                    "professionalTax",
                    "loanRepayment",
                    "esop",
                    "benevolence",
                    "incomeTax",
                ].map((key) => {
                    const amount = deductions[key] || 0;
                    if (!deductionToggles[key] || amount === 0) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                        <tr key={key}>
                            <td className="border border-gray-300 p-2 print:border-black">{label}</td>
                            <td className="border border-gray-300 p-2 text-right font-medium print:border-black">₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        </tr>
                    );
                })}
                <tr className="bg-gray-100 font-semibold border-t-2 border-gray-400">
                    <td className="border border-gray-300 p-2 font-bold print:border-black">Total Deductions</td>
                    <td className="border border-gray-300 p-2 text-right font-bold print:border-black">₹{grossDeduction.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded border-2 border-gray-300 print:bg-white print:border-black print:rounded-none print:mt-4 net-pay-section">
                <div className="flex justify-between items-center font-bold text-xl print:text-lg">
                    <span>NET PAY</span>
                    <span>₹{netPay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="mt-3 text-sm print:text-xs print:mt-2">
                    <span className="font-semibold">Amount in words:</span> {numberToWords(netPay)}
                </div>
            </div>
            <div className="mt-4 text-center text-sm text-black-600 print:text-xs print:mt-3">
                <p><strong>Personal Note:</strong> This is a system generated payslip, does not require any signature.</p>
            </div>
        </div>
    );

    const EmployeeForm = ({ employee, onSave, onCancel }) => {
        const [formData, setFormData] = useState(employee || initialEmployeeState);
        const isEditing = !!employee;
        const handleChange = (e) => {
            const { name, value, type } = e.target;
            setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
        };
        const formFields = [{ name: 'name', label: 'Name *', placeholder: 'Enter employee name' },{ name: 'code', label: 'Employee Code *', placeholder: 'Enter employee code' },{ name: 'department', label: 'Department', placeholder: 'Enter department' },{ name: 'designation', label: 'Designation', placeholder: 'Enter designation' },{ name: 'grade', label: 'Grade', placeholder: 'Enter grade' },{ name: 'dob', label: 'Date of Birth', placeholder: 'e.g., 2 Aug 1979' },{ name: 'doj', label: 'Date of Joining', placeholder: 'e.g., 18 Jun 2008' },{ name: 'location', label: 'Location', placeholder: 'Enter location' },{ name: 'bank', label: 'Bank Details', placeholder: 'Account number (Bank name)' },{ name: 'costCenter', label: 'Cost Center', placeholder: 'Enter cost center' },{ name: 'pan', label: 'PAN Number', placeholder: 'Enter PAN number' },{ name: 'pf', label: 'PF Number', placeholder: 'Enter PF number' },{ name: 'esi', label: 'ESI Number', placeholder: "Enter ESI number (or '-')" },{ name: 'pfUan', label: 'PF UAN', placeholder: 'Enter PF UAN' },{ name: 'heading', label: 'Company Name', placeholder: 'Enter company name' },{ name: 'address', label: 'Company Address', placeholder: 'Enter company address' },{ name: 'basicSalary', label: 'Basic Salary', type: 'number', step: '0.01' }];
        return (
            <Card className={`p-4 mb-6 ${isEditing ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                <h3 className="text-lg font-semibold mb-4">{isEditing ? 'Edit' : 'Add New'} Employee</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {formFields.map(field => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium mb-1">{field.label}</label>
                            <input type={field.type || "text"} name={field.name} value={formData[field.name]} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder={field.placeholder} step={field.step}/>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => onSave(formData)} className={isEditing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}>{isEditing ? 'Update Employee' : 'Add Employee'}</Button>
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                </div>
            </Card>
        );
    };

    const SharedDataModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Shared Payroll Data ({sharedData.length})</h3>
                {sharedData.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No shared data available</p>
                ) : (
                    <div className="space-y-4">
                        {sharedData.map((item) => (
                            <div key={item.id} className="border rounded-lg p-4">
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div><strong>Employee:</strong> {item.shareData.employee.name}</div>
                                    <div><strong>Period:</strong> {item.shareData.month} {item.shareData.year}</div>
                                    <div><strong>From:</strong> {item.fromUserId}</div>
                                    <div><strong>Shared:</strong> {item.sharedAt?.toDate?.()?.toLocaleDateString() || 'Recently'}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => handleAcceptSharedData(item)}className="bg-green-600 hover:bg-green-700">Accept & Add to Dashboard</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={() => setShowSharedData(false)}>Close</Button>
                </div>
            </div>
        </div>
    );

    if (!isSetupComplete) {
        return (
            <>
                {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span>Processing...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div className="p-4 sm:p-6 max-w-[1200px] mx-auto print:p-0 print:max-w-none">
                    <Card className="p-4 sm:p-6 print:shadow-none print:rounded-none print:p-0 print:border-none print-container">
                        <div className="flex justify-between items-center mb-4 sm:mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-center flex-1">Setup</h1>
                            {sharedData.length > 0 && (
                                <Button variant="outline" onClick={() => setShowSharedData(true)} className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 relative ml-4">Shared Data<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{sharedData.length}</span></Button>
                            )}
                        </div>
                        <p className="text-gray-600 mb-4 sm:mb-6 text-center">Add employees to get started with payslip generation</p>
                        {employees.length > 0 && (
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold mb-4">Added Employees ({employees.length})</h2>
                                <div className="grid gap-4">
                                    {employees.map((emp) => (
                                        <div key={emp.id} className="border rounded-lg p-4 flex justify-between items-start">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                                                <div><span className="font-medium">Name:</span> {emp.name}</div>
                                                <div><span className="font-medium">Code:</span> {emp.code}</div>
                                                <div><span className="font-medium">Department:</span> {emp.department || "N/A"}</div>
                                                <div><span className="font-medium">Designation:</span> {emp.designation || "N/A"}</div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <Button variant="outline" size="sm" onClick={() => setEditingEmployeeId(emp.id)}>Edit</Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDeleteEmployee(emp.id)}>Delete</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {showAddEmployee && <EmployeeForm onSave={handleSaveEmployee} onCancel={() => setShowAddEmployee(false)} />}
                        {editingEmployeeId && <EmployeeForm employee={employees.find(e => e.id === editingEmployeeId)} onSave={handleSaveEmployee} onCancel={() => setEditingEmployeeId(null)} />}
                        <div className="flex justify-center gap-4">
                            {!showAddEmployee && !editingEmployeeId && (
                                <Button onClick={() => setShowAddEmployee(true)} className="bg-blue-600 hover:bg-blue-700">Add New Employee</Button>
                            )}
                             
                            {employees.length > 0 && !editingEmployeeId && (
                                <Button onClick={proceedToPayslip} className="bg-green-600 hover:bg-green-700">Proceed to Payslip Generator ({employees.length} employees)</Button>
                            )}
                             
                        </div>
                    </Card>
                </div>
                {showSharedData && <SharedDataModal />}
            </>
        );
    }
    const PrintLayout = () => (
        <div className="print-only">
            {selectedEmployee && (
                <>
                     
                    <div className="monthly-section print-section">
                        <div className="text-center mb-4 print-header">
                            <h1 className="text-2xl font-bold mb-2">{selectedEmployee?.heading || "COMPANY NAME"}</h1>
                            <p className="text-sm text-gray-600">{selectedEmployee?.address || "Company Address"}</p>
                            <div className="border-t border-b border-gray-300 py-3 mt-4">
                                <h2 className="text-xl font-bold">PAYSLIP</h2>
                                <p className="text-sm text-gray-600">For the month of {selectedMonth} {selectedYear}</p>
                            </div>
                        </div>
                        <MonthlyPayslipBlock />
                    </div>
                     
                    <div className="annual-section print-section mt-8">
                        <AnnualReportBlock />
                    </div>
                </>
            )}
        </div>
    );

    const ShareModal = () => {
        const [localEmail, setLocalEmail] = useState(shareEmail);

        useEffect(() => {
            setLocalEmail(shareEmail);
        }, [shareEmail]);

        const handleShare = async () => {
            if (!localEmail.trim()) {
                alert("Please enter an email address");
                return;
            }
            if (!selectedEmployee || !selectedMonth || !selectedYear) {
                alert("Please select employee, month and year");
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(localEmail.trim())) {
                alert("Please enter a valid email address");
                return;
            }
            setIsLoading(true);
            try {

                await firebaseService.sharePayrollData(user.uid, localEmail.trim(), selectedEmployee.id, getNormalizedYear(selectedYear), selectedMonth);
                alert(`Payroll data shared successfully with ${localEmail}!`);
                setShowShareModal(false);
                setShareEmail("");
                setLocalEmail("");
            } catch (error) {
                console.error('Error sharing payroll:', error);
                alert('Error sharing payroll data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">Share Payroll Data</h3>
                    <p className="text-sm text-gray-600 mb-4">Share {selectedEmployee?.name}'s payroll data for {selectedMonth} {selectedYear}</p>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Email address</label>
                        <input type="email" value={localEmail} onChange={(e) => setLocalEmail(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Enter recipient's email" autoFocus/>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleShare} className="bg-green-600 hover:bg-green-700">Share</Button>
                        <Button variant="outline" onClick={() => {setShowShareModal(false);setShareEmail("");setLocalEmail("");}}>Cancel</Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-[1200px] mx-auto print:p-0 print:max-w-none print:mx-0 print:bg-white border-0">
            <div className="shadow p-6 rounded-2xl print:shadow-none print:rounded-none print:p-0 print-container bg-white">
                <div className="flex justify-between items-center mb-6 print:hidden">
                    <Button variant="outline" onClick={() => setIsSetupComplete(false)} className="text-sm">← Back to Setup</Button>
                    <div className="flex gap-2">
                        <Button variant={currentView === "monthly" ? "default" : "outline"} onClick={() => setCurrentView("monthly")}>Monthly View</Button>
                        <Button variant={currentView === "annual" ? "default" : "outline"} onClick={() => setCurrentView("annual")}>Annual View</Button>
                    </div>
                    <div className="flex gap-2">
                        {sharedData.length > 0 && (
                            <Button variant="outline" onClick={() => setShowSharedData(true)} className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 relative">Shared Data<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{sharedData.length}</span></Button>
                        )}
                        <Button onClick={() => setShowShareModal(true)} className="bg-green-600 hover:bg-green-700" disabled={!selectedEmployee || !selectedMonth || !selectedYear}>Share</Button>
                        <Button onClick={() => window.print()} className="bg-purple-600 hover:bg-purple-700">Print</Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:hidden">
                    <div>
                        <label className="block text-sm font-medium mb-1">Employee</label>
                        <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
                            <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                            <SelectContent>
                                {employees.map((emp) => <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.code})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Month</label>
                        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {months.map((month) => <SelectItem key={month} value={month}>{month}</SelectItem>)}
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
            setTypedValue(input); // Always show what the user typed initially
            if (/^\d{4}$/.test(input)) {
                const startYear = parseInt(input);
                const endYearShort = ((startYear + 1) % 100).toString().padStart(2, "0");
                const formatted = `${startYear}-${endYearShort}`;
                setSelectedYear(formatted); // Internally store as YYYY-YY
                setTypedValue(formatted); // Update typedValue to reflect the formatted year
            } else if (/^\d{4}-\d{2}$/.test(input) || input === "") {
                setSelectedYear(input);
            }
        }}
        onClick={(e) => e.target.select()} // <--- ADDED: Select all text on click
    />
</div>
                    </div>
                    <div className="flex items-end">
                        <Button onClick={saveCurrentMonthData} className="w-full bg-green-600 hover:bg-green-700">Save Data</Button>
                    </div>
                </div>
                <div className="screen-only">
                    {!selectedEmployee ? <div className="text-center py-8 text-gray-500">Please select an employee to view payslip</div> :
                        currentView === "annual" ? <AnnualReportBlock /> : (
                            <>
                                <MonthlyPayslipBlock />
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
                                    <div>
                                        <h3 className="font-bold mb-4">Edit Earnings</h3>
                                        <div className="space-y-3">
                                            {earningCategories.map((category) => (
                                                <div key={category} className="flex justify-between items-center">
                                                    <label className="text-sm font-medium">{category}:</label>
                                                    <input type="number" value={monthlyEarnings[category] || 0} onChange={(e) => updateEarning(category, e.target.value)} className="w-32 border rounded px-2 py-1 text-right text-sm" step="0.01"/>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
    <h3 className="font-bold mb-4">Edit Deductions</h3>
    <div className="space-y-3">
        {[
            { key: "pf", label: "Pf" },
            { key: "esic", label: "Esic" },
            { key: "professionalTax", label: "Professional Tax" },
            { key: "loanRepayment", label: "Loan Repayment" },
            { key: "esop", label: "Esop" },
            { key: "benevolence", label: "Benevolence" },
            { key: "incomeTax", label: "Income Tax" }
        ].map(({ key, label }) => {
            const amount = deductions[key];
            return (
                <div key={key} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={deductionToggles[key]} onChange={() => toggleDeduction(key)} className="rounded"/>
                        <label className="text-sm font-medium">{label}:</label>
                    </div>
                    <input type="number" value={amount} onChange={(e) => setDeductions(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))} className="w-32 border rounded px-2 py-1 text-right text-sm" step="0.01" disabled={!deductionToggles[key]} />
                </div>
            );
        })}
    </div>
</div>
                                </div>
                            </>
                        )}
                </div>
                <PrintLayout />
            </div>
            {showShareModal && <ShareModal />}
            {showSharedData && <SharedDataModal />}
            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span>Processing...</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payslip;