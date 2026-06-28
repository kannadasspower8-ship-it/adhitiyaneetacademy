---
trigger: always_on
---

# Project Initialization Rule (Highest Priority)

This rule applies BEFORE any planning, coding, analysis, or file modifications.

## Step 1 — Determine Project Type

First determine whether this is:

* A brand-new project created from the DassOS template.
* An existing project that already contains project history.

Never assume.

---

## Step 2 — If This Is a New Project

Initialize the workspace.

Ensure the following files exist:

* memory/project.md
* memory/client.md
* memory/progress.md
* memory/bugs.md
* memory/features.md
* memory/sessions.md
* memory/decisions.md
* memory/stack.md

If these files contain template or placeholder information from another project:

* Remove all previous project-specific content.
* Replace it with clean template content.
* Preserve the file structure.
* Do not delete the files themselves.

Do not begin development until the memory files have been initialized.

---

## Step 3 — If This Is an Existing Project

Never erase project history.

Read all memory files.

Continue from the current project state.

Update existing memory instead of replacing it.

---

## Step 4 — Safety Rules

Never delete:

* source code
* components
* assets
* documentation
* database files
* configuration files

unless explicitly instructed.

Only reset the project memory files when initializing a brand-new project.

---

## Step 5 — Confirmation

Before writing any code, confirm internally that:

* The workspace has been initialized correctly.
* No memory from another project remains.
* The project is ready for development.

Only then continue with the orchestrator workflow.
