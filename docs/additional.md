# Doctor Patient Feedback and Prescription Requirement

When you log in as a **Doctor** and have patients in your **Patient List**, make sure to complete the required actions for each patient.

## Required Actions

For every patient, the doctor must:

1. Provide **feedback**. **Feedback is compulsory.**
2. Add the required **prescription**.

> **Important:** Feedback is mandatory and must be submitted before the patient can be removed from the Patient List.

## Patient List Rule

If the doctor completes both the **feedback** and **prescription**, the patient should be **removed from the Patient List**.

### Expected Workflow

```text
Doctor Login
     ↓
Patient List
     ↓
Select Patient
     ↓
Give Feedback (Compulsory)
     ↓
Add Prescription
     ↓
Submit / Complete
     ↓
Patient Removed from Patient List
