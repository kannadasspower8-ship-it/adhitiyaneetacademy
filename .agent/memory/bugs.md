# Bug Tracking

## Resolved Bugs
- **Syntax Compilation Error (June 2026)**: Fixed compilation error in `src/app/admin/dashboard/students/analytics/page.tsx` caused by duplicated/orphaned `</table>` and `</div>` tags left after inserting the Subject-wise Breakdown section.
- **Windows Next.js Build Lock (June 2026)**: Cleared `.next` cache directory to resolve `EINVAL: invalid argument, readlink` file lock errors on Windows during compilation.

## Known Issues
- None. The Next.js production build compiles successfully and static pages generate with no issues.
