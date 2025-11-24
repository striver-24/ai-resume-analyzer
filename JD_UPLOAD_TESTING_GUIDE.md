# 🧪 JD Upload Feature - Testing Guide

## 📋 Test Environment Setup

### Prerequisites
- Node.js 18+ installed
- Local development environment running
- GCP credentials configured
- Sample JD files ready

### Start Development Server
```bash
npm run dev
# Server runs on http://localhost:5173
```

---

## 🎯 Manual Testing Guide

### Test 1: Manual JD Mode - Basic Flow

**Objective:** Verify Manual JD mode works as before

**Steps:**
1. Navigate to `/upload`
2. Click "Manual JD" button
3. Enter:
   - Company Name: "Google"
   - Job Title: "Senior Software Engineer"
   - Job Description: "Seeking an experienced software engineer..."
4. Upload a sample resume PDF
5. Click "Analyze Resume"

**Expected Result:**
- ✅ Form shows all 4 fields
- ✅ Progress shows 5 steps
- ✅ Step 1: "Converting PDF to image"
- ✅ Step 2: "Uploading files"
- ✅ Step 3: "Extracting text"
- ✅ Step 4: "AI Analysis (parallel)"
- ✅ Step 5: "Finalizing"
- ✅ Redirects to `/resume/{uuid}`
- ✅ Results page shows ATS score and feedback

---

### Test 2: Upload JD & Resume Mode - PDF

**Objective:** Verify JD extraction from PDF files

**Steps:**
1. Navigate to `/upload`
2. Click "Upload JD & Resume" button
3. Upload a PDF job description file
4. Upload a PDF resume file
5. Verify info box appears: "JD Information will be automatically extracted..."
6. Click "Analyze Resume & JD"

**Expected Result:**
- ✅ Form shows 2 file uploaders
- ✅ Button text is "Analyze Resume & JD"
- ✅ Info box appears when JD file selected
- ✅ Progress shows 6 steps
- ✅ Step 1: "Extracting JD information" ← NEW
- ✅ Steps 2-6 proceed normally
- ✅ JD metadata extracted correctly:
  - Job Title extracted
  - Company Name extracted
  - Job Description extracted
- ✅ Redirects to `/resume/{uuid}`

---

### Test 3: Upload JD & Resume Mode - DOCX

**Objective:** Verify JD extraction from DOCX files

**Steps:**
1. Navigate to `/upload`
2. Click "Upload JD & Resume" button
3. Upload a DOCX job description file
4. Upload a PDF resume file
5. Click "Analyze Resume & JD"

**Expected Result:**
- ✅ DOCX file accepted
- ✅ No conversion error
- ✅ Text extracted successfully
- ✅ JD metadata extracted correctly
- ✅ Analysis completes successfully

---

### Test 4: Mode Switching

**Objective:** Verify switching between modes works smoothly

**Steps:**
1. Navigate to `/upload`
2. Click "Manual JD" button
3. Enter some data in form
4. Click "Upload JD & Resume" button
5. Click back to "Manual JD" button

**Expected Result:**
- ✅ Form fields change when switching modes
- ✅ No errors during switching
- ✅ Previous mode data can be re-accessed
- ✅ UI updates smoothly

---

### Test 5: File Upload Validations

**Objective:** Verify file size and format validations

**Steps:**
1. Navigate to `/upload` in Upload mode
2. Try uploading a non-PDF/DOCX file
   - Expected: Rejected
3. Try uploading a file > 20MB
   - Expected: Rejected
4. Upload valid files
   - Expected: Accepted

**Expected Result:**
- ✅ Invalid formats rejected
- ✅ Oversized files rejected
- ✅ Valid files accepted
- ✅ Error messages clear

---

### Test 6: Error Handling - Missing Files

**Objective:** Verify error when files are missing

**Steps:**
1. Navigate to `/upload` in Upload mode
2. Click "Analyze Resume & JD" without uploading files

**Expected Result:**
- ✅ Error message: "Please upload both resume and JD files"
- ✅ Analysis doesn't start
- ✅ User remains on upload page

---

### Test 7: JD Extraction Accuracy

**Objective:** Verify JD extraction extracts correct information

**Test Data:**

**Sample JD.txt:**
```
SENIOR SOFTWARE ENGINEER
TechCorp Inc

About the Role:
We are looking for an experienced Senior Software Engineer to join our platform team. 
You will work on building scalable backend systems...

Responsibilities:
- Design and implement system architecture
- Lead technical discussions
- Mentor junior engineers
```

**Expected Extraction:**
- ✅ Job Title: "Senior Software Engineer"
- ✅ Company: "TechCorp Inc"
- ✅ Description: Full text including "About the Role" and "Responsibilities"

---

### Test 8: Cloud Storage Verification

**Objective:** Verify files are saved to cloud storage

**Steps:**
1. Complete an upload in "Upload JD & Resume" mode
2. Go to Google Cloud Console
3. Navigate to Cloud Storage Bucket
4. Check folder structure

**Expected Result:**
- ✅ JD files saved: `users/{userId}/job_descriptions/`
- ✅ Resume files saved: `users/{userId}/resumes/`
- ✅ Original files present
- ✅ Image files present (for PDFs)
- ✅ Files are user-isolated

---

### Test 9: Performance Testing

**Objective:** Verify performance metrics

**Steps:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Complete an upload in "Upload JD & Resume" mode
4. Look for "Performance Metrics" output

**Expected Result:**
- ✅ Total time < 30s
- ✅ JD extraction: 2-3s
- ✅ PDF conversion: 1-2s
- ✅ File uploads: 2-3s
- ✅ Text extraction: 3-4s
- ✅ AI analysis: 8-12s
- ✅ All timings logged

**Example Console Output:**
```
📊 Performance Metrics:
  total: 22.15s
  breakdown:
    jd_extraction: 2.45s
    pdf_conversion: 1.82s
    parallel_uploads: 2.91s
    text_extraction: 3.52s
    parallel_ai_analysis: 11.45s
```

---

### Test 10: Results Page Validation

**Objective:** Verify results are accurate

**Steps:**
1. Complete an upload
2. Wait for redirect to results page
3. Check the displayed data:
   - ATS Score
   - Strengths
   - Weaknesses
   - Improvements
   - Keywords
   - Summary

**Expected Result:**
- ✅ All data displayed correctly
- ✅ Information matches uploaded JD
- ✅ Analysis is relevant to JD
- ✅ No data corruption
- ✅ Page loads properly

---

## 🔍 Component Testing

### UploadModeSelector Component

**Test:**
```tsx
<UploadModeSelector 
  mode="manual"
  onModeChange={(mode) => console.log(mode)}
/>
```

**Verify:**
- ✅ Manual button shows as active (blue)
- ✅ Upload button shows as inactive (gray)
- ✅ Info box shows correct message
- ✅ Clicking buttons triggers onModeChange
- ✅ Icons display correctly

---

### JDUploader Component

**Test:**
```tsx
<JDUploader 
  onFileSelect={(file) => console.log(file)}
/>
```

**Verify:**
- ✅ Accepts PDF files
- ✅ Accepts DOCX files
- ✅ Rejects other formats
- ✅ Shows file preview when selected
- ✅ Remove button works
- ✅ Drag & drop works
- ✅ File size shown correctly

---

## 🧬 API Testing

### Test /api/ai/extract-jd Endpoint

**Using cURL:**

```bash
# With PDF file
curl -X POST http://localhost:5173/api/ai/extract-jd \
  -F "file=@sample_jd.pdf" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  --cookie-jar cookies.txt

# With DOCX file
curl -X POST http://localhost:5173/api/ai/extract-jd \
  -F "file=@sample_jd.docx" \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "jobTitle": "Senior Software Engineer",
  "companyName": "TechCorp Inc",
  "jobDescription": "Full job description text...",
  "filePath": "users/userid/job_descriptions/sample_jd.pdf",
  "imagePath": "users/userid/job_descriptions/sample_jd.png"
}
```

**Test Error Cases:**

```bash
# Missing file
curl -X POST http://localhost:5173/api/ai/extract-jd \
  -F "file=@" \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Expected: {"success": false, "error": "No file provided"}
```

---

## 📊 Integration Testing

### End-to-End Flow Test

**Scenario:** User uploads JD and Resume, gets analysis

**Steps:**
1. User navigates to `/upload`
2. Selects "Upload JD & Resume" mode
3. Uploads sample JD (PDF)
4. Uploads sample Resume (PDF)
5. System shows extraction progress
6. System extracts JD metadata
7. System shows analysis progress
8. System displays results

**Validation Checkpoints:**
- ✅ Mode selector works
- ✅ File uploads successful
- ✅ JD extraction accurate
- ✅ Progress tracking correct
- ✅ Analysis runs successfully
- ✅ Results page loads
- ✅ All data persisted
- ✅ Cloud storage has files

---

## 🔐 Security Testing

### Authentication Test

**Objective:** Verify auth is required

**Steps:**
1. Try accessing `/upload` without login
2. Try calling `/api/ai/extract-jd` without auth

**Expected Result:**
- ✅ Redirected to auth page
- ✅ API returns 401 Unauthorized

---

### File Type Validation

**Objective:** Verify only allowed files accepted

**Steps:**
1. Try uploading .txt file
2. Try uploading .doc file (older format)
3. Try uploading .jpg image
4. Upload valid .pdf
5. Upload valid .docx

**Expected Result:**
- ✅ .txt rejected
- ✅ .doc rejected
- ✅ .jpg rejected
- ✅ .pdf accepted
- ✅ .docx accepted

---

### File Size Validation

**Objective:** Verify 20MB limit enforced

**Steps:**
1. Create 21MB test file
2. Try uploading
3. Create 15MB test file
4. Upload successfully

**Expected Result:**
- ✅ 21MB file rejected
- ✅ Error message clear
- ✅ 15MB file accepted

---

## 📱 Mobile Testing

### Responsive Design

**Test on Different Screens:**

**Mobile (375px):**
- [x] Mode selector stacks
- [x] Buttons full width
- [x] Form fields readable
- [x] File uploader fits
- [x] No horizontal scroll

**Tablet (768px):**
- [x] Layout optimized
- [x] Two-column for inputs
- [x] Touch-friendly buttons
- [x] Proper spacing

**Desktop (1400px):**
- [x] Centered layout
- [x] Max-width applied
- [x] Proper alignment
- [x] All elements visible

---

## 🐛 Debugging Checklist

When tests fail, check:

- [ ] Browser console for errors
- [ ] Network tab for API calls
- [ ] DevTools for React errors
- [ ] Server logs for backend errors
- [ ] GCS permissions
- [ ] Service account credentials
- [ ] Environment variables
- [ ] File permissions
- [ ] Authentication status
- [ ] API endpoint accessibility

---

## 📝 Test Report Template

```
Feature: JD Upload
Date: [Date]
Tester: [Name]
Environment: [Dev/Staging/Prod]

Test Results:
✅ Test 1: Manual JD Mode - PASSED
✅ Test 2: Upload PDF - PASSED
✅ Test 3: Upload DOCX - PASSED
✅ Test 4: Mode Switching - PASSED
✅ Test 5: File Validations - PASSED
✅ Test 6: Error Handling - PASSED
✅ Test 7: JD Extraction - PASSED
✅ Test 8: Cloud Storage - PASSED
✅ Test 9: Performance - PASSED
✅ Test 10: Results Page - PASSED

Issues Found: None
Blockers: None
Notes: All tests passed successfully

Sign-off: [Tester Name] - [Date]
```

---

## 🎬 Test Data Files

### Sample JD (PDF/DOCX)

**File:** `sample_job_description.pdf`

Content:
```
=== JOB POSTING ===

Position: Senior Software Engineer
Company: TechCorp Inc
Location: San Francisco, CA

Job Description:
We are hiring a Senior Software Engineer to lead the development 
of our backend platform. You will work on scalable distributed 
systems and mentor junior engineers.

Responsibilities:
- Design and implement system architecture
- Lead code reviews and technical discussions
- Mentor junior team members
- Optimize performance and scalability

Required Skills:
- 5+ years of software engineering experience
- Proficiency in Python, Go, or Java
- Experience with distributed systems
- Strong communication skills

Nice to Have:
- Experience with Kubernetes
- Background in data engineering
- Open source contributions
```

### Sample Resume (PDF)

**File:** `sample_resume.pdf`

Content:
```
JOHN DOE
Email: john@example.com | Phone: (555) 123-4567

PROFESSIONAL SUMMARY
Experienced Software Engineer with 6 years of experience building 
scalable systems and leading technical teams.

EXPERIENCE

Senior Software Engineer | TechCorp Inc | 2020 - Present
- Led development of backend platform serving 1M+ users
- Mentored 3 junior engineers
- Improved system performance by 40%

Software Engineer | StartupXYZ | 2018 - 2020
- Developed microservices architecture
- Reduced API response time by 50%

EDUCATION
B.S. Computer Science | University of California | 2018

SKILLS
Python, Go, Java, Kubernetes, Docker, PostgreSQL
```

---

## ✅ Test Completion Checklist

- [ ] All 10 manual tests passed
- [ ] Component tests passed
- [ ] API tests passed
- [ ] Integration tests passed
- [ ] Security tests passed
- [ ] Mobile tests passed
- [ ] Performance acceptable
- [ ] Error handling verified
- [ ] Documentation reviewed
- [ ] Ready for production

---

**Test Guide Version:** 1.0
**Last Updated:** November 11, 2025
**Status:** ✅ Ready for Testing

🧪 **All tests should pass before deploying to production**
