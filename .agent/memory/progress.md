# Project Progress

## Recent Milestones Completed
- **Batch Setup Update**: Removed `"Rerepeater"` option from all filters, student creation, editing, dashboard stats, and marks entry wizard batch selectors. Available batches: `Repeater`, `Weekend Batch`, `Crash Course`, `Test Batch`.
- **Grand Test Marks Registry Redesign**:
  - Implemented Excel-like grid view editing on a single screen (no popups, no separate forms).
  - Supports input of six variables per student: Biology Correct/Wrong, Physics Correct/Wrong, Chemistry Correct/Wrong.
  - Automatically calculates Total Correct, Total Wrong, Unanswered (out of 180 questions), and Final Marks (using NEET formula: `Correct * 4 - Wrong`) instantly on input change.
  - Allowed negative scores (removed 0-cap constraint for Grand Tests).
- **Excel Export**:
  - Grand Test spreadsheet exported with exactly the 11 columns matching the on-screen display.
- **Supabase Integration**:
  - Saves individual subject correct answers (`biology_correct`, `chemistry_correct`, `physics_correct`) and calculated subject scores (`biology`, `chemistry`, `physics`) into the database.
- **Student Dashboard Enhancement**:
  - Added expandable detail sections under the Grand Test history list, displaying the subject-wise correct/wrong breakdown.
- **Admin Student Analytics**:
  - Included a Subject-wise Average Breakdown section showing Biology, Physics, and Chemistry averages.
  - Added inline expandable detail rows to the history registry table for Grand Tests.
- **Verification**: Next.js production build runs and succeeds cleanly.
