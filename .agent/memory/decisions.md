# Architectural decisions

## 1. Reconstructive Math for Subject-wise Wrong Answers
- **Decision**: Avoid running schema migrations to add `biology_wrong`, `physics_wrong`, and `chemistry_wrong` columns to the `student_marks` table.
- **Rationale**: Altering the Supabase table schema for historical records could break existing dashboards or require complex migration scripts. Instead, we save:
  - Subject correct answers: `biology_correct`, `physics_correct`, `chemistry_correct`
  - Computed subject scores: `biology`, `physics`, `chemistry`
- **Reconstruction Formula**:
  - `biology_wrong = (biology_correct * 4) - biology`
  - `physics_wrong = (physics_correct * 4) - physics`
  - `chemistry_wrong = (chemistry_correct * 4) - chemistry`
  - This allows dashboards to calculate and render correct/wrong counts on the fly. It is fully backwards compatible and mathematically robust for all score ranges.

## 2. Removal of Rerepeater Batch
- **Decision**: Completely strip `"Rerepeater"` from frontend code batch lists, creation templates, and filters, leaving 4 available batches (`Repeater`, `Weekend Batch`, `Crash Course`, `Test Batch`).
- **Rationale**: Keeps database records intact but prevents staff from creating new students under this batch or filtering dashboard views by it.
