# Testing Guide: Referral System

## Prerequisites

### 1. Start Database (PostgreSQL)
```bash
cd /Users/carolwaitinghung/Documents/ML_AI/physio-doctor-platform
docker-compose up -d
```

Verify database is running:
```bash
docker ps | grep postgres
```

### 2. Start Backend API
```bash
cd apps/api
npm run dev
```

Expected output:
```
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO [RoutesResolver] ReferralsController {/referrals}:
[Nest] INFO [RouterExplorer] Mapped {/referrals, POST} route
[Nest] INFO [RouterExplorer] Mapped {/referrals/doctor, GET} route
[Nest] INFO [RouterExplorer] Mapped {/referrals/patient, GET} route
...
```

API should be running on: **http://localhost:3001**

### 3. Start Frontend
```bash
cd apps/web
npm run dev
```

Expected output:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

Frontend should be running on: **http://localhost:3000**

## Test Data Setup

### Create Test Users (if not already exists)

#### 1. Create Doctor Account
1. Navigate to http://localhost:3000/auth/register
2. Fill in:
   - First Name: John
   - Last Name: Smith
   - Email: doctor@test.com
   - Username: drsmith
   - Phone: +85291234567
   - Password: Test123!
   - Role: DOCTOR
3. Click "Register"
4. Login with doctor@test.com / Test123!
5. Complete doctor profile onboarding:
   - License Number: MD12345
   - Specialties: Sports Medicine, Orthopedics
   - Years of Experience: 10
   - Consultation Fee: 800
   - Consultation Type: BOTH
   - Bank Name: HSBC
   - Account Number: 123456789
   - Account Name: John Smith
6. Submit profile

#### 2. Create Patient Account
1. Logout from doctor account
2. Navigate to http://localhost:3000/auth/register
3. Fill in:
   - First Name: Jane
   - Last Name: Doe
   - Email: patient@test.com
   - Username: janedoe
   - Phone: +85298765432
   - Password: Test123!
   - Role: PATIENT
4. Click "Register"
5. Login with patient@test.com / Test123!
6. Complete patient profile onboarding:
   - Date of Birth: 1990-01-15
   - Gender: FEMALE
   - Emergency Contact: Tom Doe
   - Emergency Phone: +85298888888
   - Medical History: Previous knee surgery in 2020
7. Submit profile

## Test Flow

### Test 1: Create Referral

#### Step 1.1: Access Create Referral Page
1. Login as doctor (doctor@test.com)
2. Navigate to dashboard (should auto-redirect after login)
3. Click "Create Referral" button in Quick Actions section
4. **Expected**: Redirects to `/doctor/referrals/create`

#### Step 1.2: Search and Select Patient
1. Type "jane" in the search box
2. **Expected**: Patient list filters to show Jane Doe
3. Click on the "Select Patient" dropdown
4. **Expected**: See "Jane Doe • +85298765432" in the list
5. Select "Jane Doe"
6. **Expected**: Blue info box appears showing:
   - Name: Jane Doe
   - Email: patient@test.com
   - Phone: +85298765432

#### Step 1.3: Fill Clinical Information
1. Diagnosis: "Chronic lower back pain - requires physiotherapy treatment"
2. Number of Sessions: 8
3. Valid For (Days): 90 (default)
4. Urgency Level: ROUTINE (default)
5. Preferred Service Type: Any (default)
6. Additional Notes: "Patient prefers afternoon appointments. History of previous back surgery."

#### Step 1.4: Submit Referral
1. Click "Create Referral" button
2. **Expected**: 
   - Button shows loading spinner: "Creating Referral..."
   - After ~1-2 seconds: Success message appears
   - Green success card with checkmark icon
   - Message: "Referral Created Successfully!"
   - Auto-redirect to `/doctor/referrals` after 2 seconds

### Test 2: View Referrals List

#### Step 2.1: Verify Referral in List
After redirect from Test 1:
1. **Expected URL**: `/doctor/referrals`
2. **Expected to see**:
   - Summary cards at top:
     - Total Referrals: 1
     - Active: 1
     - Completed: 0
     - Expiring Soon: 0
   - Referral card showing:
     - Patient name: Jane Doe
     - Diagnosis: "Chronic lower back pain..."
     - Sessions: 0 / 8 used
     - Issued: [Today's date]
     - Expires: [90 days from today]
     - Urgency: ROUTINE badge (blue)
     - Status: ACTIVE badge (green)
     - "View Details" button

#### Step 2.2: Test Search Patient Again
1. Type "jane" in search box on create page
2. **Expected**: Real-time filtering of patient list

#### Step 2.3: Test Empty Search
1. Type "xyz123" in search box
2. **Expected**: Dropdown shows "No patients found"

### Test 3: Navigation Flow

#### Step 3.1: Dashboard Navigation
1. From referrals list, click "Back to Dashboard"
2. **Expected**: Returns to `/dashboard`
3. Verify "My Referrals" button is visible in Quick Actions
4. Click "My Referrals"
5. **Expected**: Returns to `/doctor/referrals`

#### Step 3.2: Create Another Referral
1. From referrals list, click "Create Referral" button (top right)
2. **Expected**: Navigate to `/doctor/referrals/create`
3. Click "Cancel" button
4. **Expected**: Returns to `/dashboard`

### Test 4: Form Validation

#### Step 4.1: Test Required Fields
1. Navigate to `/doctor/referrals/create`
2. Without selecting patient, fill diagnosis: "Test"
3. Click "Create Referral"
4. **Expected**: Red error alert: "Please select a patient"

#### Step 4.2: Test Empty Diagnosis
1. Select a patient
2. Leave diagnosis empty
3. Click "Create Referral"
4. **Expected**: Red error alert: "Diagnosis is required"

#### Step 4.3: Test Invalid Sessions
1. Select patient and enter diagnosis
2. Change sessions to 0
3. Click "Create Referral"
4. **Expected**: Red error alert: "Please specify at least 1 session"

### Test 5: Create Multiple Referrals

#### Step 5.1: Create Second Referral
1. Create another referral with:
   - Patient: Jane Doe (same patient)
   - Diagnosis: "Sports injury - ankle sprain"
   - Sessions: 4
   - Urgency: URGENT
2. Submit
3. **Expected**: Success and redirect

#### Step 5.2: Verify List Updates
1. On referrals list page:
2. **Expected**:
   - Total Referrals: 2
   - Active: 2
   - Two referral cards showing:
     - First: Back pain, 8 sessions, ROUTINE
     - Second: Ankle sprain, 4 sessions, URGENT (orange badge)

### Test 6: API Testing (Optional - Using curl or Postman)

#### Step 6.1: Get JWT Token
Login to get token:
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "login": "doctor@test.com",
    "password": "Test123!"
  }'
```

Copy the `access_token` from response.

#### Step 6.2: List Patients
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3001/patients
```

**Expected**: Array of patient objects with id, name, email, phone

#### Step 6.3: Create Referral via API
```bash
curl -X POST http://localhost:3001/referrals \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PATIENT_ID_FROM_STEP_6.2",
    "diagnosis": "Test via API",
    "sessions": 6,
    "urgency": "ROUTINE"
  }'
```

**Expected**: 201 Created with referral object

#### Step 6.4: List Doctor's Referrals
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:3001/referrals/doctor
```

**Expected**: Array of referral objects for the logged-in doctor

## Expected Behaviors

### ✅ Success Indicators
- [ ] Can create referrals with valid data
- [ ] Patient search works correctly
- [ ] Form validation prevents invalid submissions
- [ ] Success message displays after creation
- [ ] Referrals appear in list immediately after creation
- [ ] Summary statistics update correctly
- [ ] Navigation between pages works smoothly
- [ ] Badges display correct colors based on status/urgency
- [ ] Loading states show during API calls
- [ ] Error messages display for API failures

### ❌ Error Scenarios to Test
- [ ] Creating referral without selecting patient
- [ ] Creating referral without diagnosis
- [ ] Invalid session count (0 or negative)
- [ ] Network error handling (stop backend mid-request)
- [ ] Unauthorized access (logout and try to access /doctor/referrals)
- [ ] Invalid token handling

## Troubleshooting

### Issue: "Failed to fetch patients"
**Solution**: 
- Check backend is running on port 3001
- Check database is running
- Verify JWT token is valid
- Check browser console for CORS errors

### Issue: "Failed to create referral"
**Solution**:
- Check all required fields are filled
- Verify patient exists in database
- Check doctor has completed profile
- Look at backend logs for detailed error

### Issue: Redirect after login doesn't work
**Solution**:
- Clear localStorage: `localStorage.clear()`
- Re-login and complete profile
- Check `access_token` exists in localStorage

### Issue: Patient not appearing in list
**Solution**:
- Verify patient completed registration
- Check patient has PATIENT role (not DOCTOR/PHYSIO)
- Query database: `SELECT * FROM users WHERE role = 'PATIENT';`

### Issue: Badge not displaying correctly
**Solution**:
- Check that badge.tsx component exists
- Verify Tailwind CSS is configured
- Check browser console for component errors

## Database Verification

### Check Referrals in Database
```bash
# Connect to PostgreSQL
docker exec -it physio-doctor-platform-postgres-1 psql -U postgres -d physio_platform

# Query referrals
SELECT 
  r.id,
  r.diagnosis,
  r.sessions,
  r.status,
  p.email as patient_email,
  d.email as doctor_email
FROM referrals r
JOIN users p ON r."patientId" = p.id
JOIN users d ON r."doctorId" = d.id;
```

### Check Patients
```sql
SELECT 
  id,
  email,
  "firstName",
  "lastName",
  role
FROM users 
WHERE role = 'PATIENT';
```

## Performance Benchmarks

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Form Submission**: < 1 second
- **Patient Search**: < 300ms (real-time filtering)

## Security Checklist

- [ ] JWT token required for all endpoints
- [ ] Doctor cannot create referral for self
- [ ] Cannot access /doctor/* pages without DOCTOR role
- [ ] Patient IDs validated before referral creation
- [ ] SQL injection prevented (Prisma ORM)
- [ ] XSS protection (React escapes by default)

## Next Testing Phase

After this initial testing:
1. Test patient view of referrals (implement `/patient/referrals`)
2. Test referral details page (implement `/doctor/referrals/[id]`)
3. Test referral status updates
4. Test expiry notifications
5. Test integration with appointment booking
6. Load testing with multiple concurrent users
7. Mobile responsiveness testing

## Test Results Template

```
Date: ___________
Tester: ___________

[ ] Test 1: Create Referral - PASS / FAIL
    Notes: ___________________________________

[ ] Test 2: View Referrals List - PASS / FAIL
    Notes: ___________________________________

[ ] Test 3: Navigation Flow - PASS / FAIL
    Notes: ___________________________________

[ ] Test 4: Form Validation - PASS / FAIL
    Notes: ___________________________________

[ ] Test 5: Multiple Referrals - PASS / FAIL
    Notes: ___________________________________

[ ] Test 6: API Testing - PASS / FAIL
    Notes: ___________________________________

Issues Found:
1. ___________________________________
2. ___________________________________

Suggestions:
1. ___________________________________
2. ___________________________________
```

