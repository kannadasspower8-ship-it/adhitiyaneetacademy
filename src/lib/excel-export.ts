import * as XLSX from "xlsx"
import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Helper to download workbook in browser
 */
function saveWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename)
}

/**
 * 1. Generates and downloads a report for a single test.
 */
export async function generateSingleTestReport(supabase: SupabaseClient, testId: string, testName: string) {
  // Query all marks for the test, joining student details
  const { data: marks, error } = await supabase
    .from("student_marks")
    .select(`
      physics,
      chemistry,
      biology,
      total,
      percentage,
      students (
        student_id,
        name,
        email
      )
    `)
    .eq("test_id", testId)

  if (error) throw error
  if (!marks || marks.length === 0) {
    throw new Error("No marks records found for this test.")
  }

  // Map to clean format and sort by total descending (ranking)
  const reportData = marks
    .map((record: any) => ({
      "Student ID": record.students?.student_id || "N/A",
      "Student Name": record.students?.name || "N/A",
      "Physics Marks": record.physics,
      "Chemistry Marks": record.chemistry,
      "Biology Marks": record.biology,
      "Total Score (out of 720)": record.total,
      "Percentage (%)": parseFloat(record.percentage).toFixed(2),
    }))
    .sort((a, b) => b["Total Score (out of 720)"] - a["Total Score (out of 720)"])

  const ws = XLSX.utils.json_to_sheet(reportData)
  
  // Set column widths for premium reading
  const wscols = [
    { wch: 15 }, // Student ID
    { wch: 25 }, // Student Name
    { wch: 15 }, // Physics Marks
    { wch: 15 }, // Chemistry Marks
    { wch: 15 }, // Biology Marks
    { wch: 22 }, // Total Score
    { wch: 15 }, // Percentage
  ]
  ws["!cols"] = wscols

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Test Results")

  const sanitizedFileName = testName.replace(/[^a-z0-9]/gi, "_").toLowerCase()
  saveWorkbook(wb, `${sanitizedFileName}_report.xlsx`)
}

/**
 * 2. Generates and downloads a monthly compilation report.
 * It builds a summary tab of all students and their average scores, 
 * alongside individual tabs for each test.
 */
export async function generateMonthlyReport(supabase: SupabaseClient) {
  // 1. Fetch all students
  const { data: students, error: studentError } = await supabase
    .from("students")
    .select("id, student_id, name")

  if (studentError) throw studentError

  // 2. Fetch all tests
  const { data: tests, error: testError } = await supabase
    .from("tests")
    .select("id, name, date, type")
    .order("date", { ascending: true })

  if (testError) throw testError

  // 3. Fetch all marks
  const { data: marks, error: marksError } = await supabase
    .from("student_marks")
    .select("student_id, test_id, total, percentage")

  if (marksError) throw marksError

  if (!tests || tests.length === 0) {
    throw new Error("No tests conducted yet to export.")
  }

  const wb = XLSX.utils.book_new()

  // Summary Data: Columns = [Student ID, Student Name, Avg Percentage, Test 1, Test 2, ...]
  const summaryRows = students.map((std) => {
    const row: any = {
      "Student ID": std.student_id,
      "Student Name": std.name,
    }

    let testCount = 0
    let totalPct = 0

    tests.forEach((t) => {
      const match = marks.find((m) => m.student_id === std.id && m.test_id === t.id)
      if (match) {
        row[t.name] = match.total
        totalPct += parseFloat(match.percentage || "0")
        testCount++
      } else {
        row[t.name] = "Absent"
      }
    })

    row["Average Percentage (%)"] = testCount > 0 ? (totalPct / testCount).toFixed(2) : "0.00"
    return row
  })

  // Put Average Percentage as the third column for clarity
  const formattedSummary = summaryRows.map((r) => {
    const { "Student ID": id, "Student Name": name, "Average Percentage (%)": avg, ...testScores } = r
    return {
      "Student ID": id,
      "Student Name": name,
      "Average Percentage (%)": avg,
      ...testScores,
    }
  })

  const wsSummary = XLSX.utils.json_to_sheet(formattedSummary)
  XLSX.utils.book_append_sheet(wb, wsSummary, "Cohort Performance Summary")

  // Generate detailed sheets for each individual test
  tests.forEach((t) => {
    const testMarks = marks.filter((m) => m.test_id === t.id)
    const testDetails = testMarks.map((m) => {
      const std = students.find((s) => s.id === m.student_id)
      return {
        "Student ID": std?.student_id || "N/A",
        "Student Name": std?.name || "N/A",
        "Total Marks": m.total,
        "Percentage (%)": parseFloat(m.percentage || "0").toFixed(2),
      }
    }).sort((a, b) => b["Total Marks"] - a["Total Marks"])

    const wsTest = XLSX.utils.json_to_sheet(testDetails)
    // Sheet names are capped at 31 chars in Excel
    const sheetName = t.name.substring(0, 30)
    XLSX.utils.book_append_sheet(wb, wsTest, sheetName)
  })

  saveWorkbook(wb, `monthly_academic_report.xlsx`)
}

/**
 * 3. Generates a master backup spreadsheet containing every table in the database
 */
export async function generateCompleteReport(supabase: SupabaseClient) {
  const wb = XLSX.utils.book_new()

  // Define tables to backup
  const tables = [
    { name: "students", label: "Students Master" },
    { name: "courses", label: "Courses Brochure" },
    { name: "tests", label: "Tests Ledgers" },
    { name: "student_marks", label: "Marks Database" },
    { name: "achievements", label: "Achievements Registry" },
    { name: "gallery", label: "Gallery Assets" },
    { name: "website_content", label: "CMS Web Data" },
    { name: "contact_details", label: "Academy Contact Details" },
  ]

  for (const table of tables) {
    const { data, error } = await supabase.from(table.name).select("*")
    if (!error && data) {
      // Clean JSON formats if needed (e.g. highlights array, CMS JSON)
      const sanitized = data.map((row) => {
        const cleaned: any = {}
        for (const key in row) {
          if (Array.isArray(row[key])) {
            cleaned[key] = row[key].join(", ")
          } else if (typeof row[key] === "object" && row[key] !== null) {
            cleaned[key] = JSON.stringify(row[key])
          } else {
            cleaned[key] = row[key]
          }
        }
        return cleaned
      })
      const ws = XLSX.utils.json_to_sheet(sanitized)
      XLSX.utils.book_append_sheet(wb, ws, table.label)
    }
  }

  saveWorkbook(wb, `adhitya_academy_master_database_backup.xlsx`)
}
