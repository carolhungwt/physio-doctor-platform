# Referral System Implementation Summary

## ✅ Completed Features

### Backend (NestJS API)

#### 1. Referrals Module (`apps/api/src/referrals/`)
- **DTO** (`dto/create-referral.dto.ts`):
  - Patient selection (UUID)
  - Diagnosis (required)
  - Number of sessions (min: 1)
  - Urgency level (ROUTINE/URGENT/EMERGENCY)
  - Service type preference (CLINIC/HOME_VISIT/optional)
  - Additional notes
  - Validity period (default: 90 days)

- **Service** (`referrals.service.ts`):
  - `createReferral()` - Create new referral with validation
  - `getReferralsByDoctor()` - List all doctor's referrals
  - `getReferralsByPatient()` - List all patient's referrals
  - `getReferralById()` - Get detailed referral info
  - `updateReferralStatus()` - Update referral status
  - `getActiveReferralsForPatient()` - Get valid active referrals
  - Automatic expiry date calculation
  - Access control validation

- **Controller** (`referrals.controller.ts`):
  - `POST /referrals` - Create referral
  - `GET /referrals/doctor` - Get doctor's referrals
  - `GET /referrals/patient` - Get patient's referrals
  - `GET /referrals/patient/active` - Get active patient referrals
  - `GET /referrals/:id` - Get referral details
  - `PATCH /referrals/:id/status` - Update status

#### 2. Patients Module (`apps/api/src/patients/`)
- **Service** (`patients.service.ts`):
  - `getAllPatients()` - List all active patients with search
  - `getPatientWithProfile()` - Get patient with full profile
  - Search by name, email, or phone

- **Controller** (`patients.controller.ts`):
  - `GET /patients` - List patients (with optional search query)
  - `GET /patients/profile` - Get current patient profile

#### 3. Module Integration
- Added `ReferralsModule` to `app.module.ts`
- Added `PatientsModule` to `app.module.ts`
- All endpoints JWT-protected

### Frontend (Next.js Web App)

#### 1. Create Referral Page (`apps/web/src/app/doctor/referrals/create/page.tsx`)
Features:
- **Patient Selection**:
  - Searchable patient list (by name, email, phone)
  - Patient details preview
  - Real-time patient filtering

- **Clinical Information Form**:
  - Diagnosis input (required)
  - Number of sessions (1-20)
  - Validity period (30-365 days, default: 90)
  - Urgency level selector (ROUTINE/URGENT/EMERGENCY)
  - Service type preference (Any/Clinic/Home Visit)
  - Additional notes textarea

- **UX Features**:
  - Loading states
  - Error handling with alerts
  - Success message with auto-redirect
  - Cancel navigation
  - Referral fee information display (20%)
  - Responsive design

#### 2. Referrals List Page (`apps/web/src/app/doctor/referrals/page.tsx`)
Features:
- **Summary Statistics**:
  - Total referrals count
  - Active referrals
  - Completed referrals
  - Expiring soon count

- **Referrals List**:
  - Patient information display
  - Diagnosis overview
  - Sessions tracking (used/total)
  - Issue and expiry dates
  - Urgency badges
  - Status badges (ACTIVE/EXPIRED/COMPLETED/REVOKED)
  - Warning icon for expiring soon referrals (<14 days)
  - View details button

- **Empty State**:
  - Helpful message for first-time users
  - Quick action to create first referral

#### 3. Dashboard Integration (`apps/web/src/app/dashboard/page.tsx`)
- Updated "Create Referral" quick action button to navigate to `/doctor/referrals/create`
- Updated "View Patients" to "My Referrals" linking to `/doctor/referrals`

#### 4. UI Components
- Created `Badge` component (`apps/web/src/components/ui/badge.tsx`)
  - Support for multiple variants (default, secondary, destructive, outline)
  - Used for status and urgency indicators

## Database Schema (Already Exists)

The Prisma schema includes:
- `Referral` model with all required fields
- Relations to `User` (doctor/patient)
- `Appointment` relation for tracking usage
- `Document` relation for referral PDFs
- Enums: `Urgency`, `ReferralStatus`, `ServiceType`

## Testing Instructions

### Prerequisites
1. Backend API running on `http://localhost:3001`
2. Frontend running on `http://localhost:3000`
3. PostgreSQL database running (Docker)
4. User accounts created:
   - At least 1 doctor with completed profile
   - At least 1 patient with completed profile

### Test Flow

#### Step 1: Doctor Login
1. Navigate to `/auth/login`
2. Login as a doctor user
3. Should redirect to `/dashboard`

#### Step 2: Create Referral
1. Click "Create Referral" button on dashboard
2. Should navigate to `/doctor/referrals/create`
3. Test patient search:
   - Type patient name/email in search box
   - Select patient from dropdown
   - Verify patient details display
4. Fill referral form:
   - Enter diagnosis (e.g., "Lower back pain")
   - Set sessions (e.g., 6)
   - Select urgency (e.g., ROUTINE)
   - Choose service type (optional)
   - Add notes (optional)
5. Click "Create Referral"
6. Should see success message
7. Should auto-redirect to `/doctor/referrals`

#### Step 3: View Referrals List
1. Verify referral appears in list
2. Check summary stats are updated
3. Verify referral details:
   - Patient name
   - Diagnosis
   - Sessions: 0/6 used
   - Status: ACTIVE
   - Urgency badge
   - Issue and expiry dates
4. Click "View Details" (if implemented later)

#### Step 4: API Testing (Optional)
```bash
# Get doctor's referrals
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/referrals/doctor

# Get patients list
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/patients

# Create referral
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "PATIENT_UUID",
    "diagnosis": "Test diagnosis",
    "sessions": 6,
    "urgency": "ROUTINE"
  }' \
  http://localhost:3001/referrals
```

## Known Limitations & TODOs

### Current Implementation
- ✅ Create referral flow
- ✅ List referrals
- ✅ Patient search and selection
- ✅ Status tracking
- ✅ Urgency levels
- ✅ Expiry warnings

### Not Yet Implemented (Future)
- ❌ PDF generation for referrals
- ❌ QR code generation
- ❌ Email notifications to patients
- ❌ Referral details page
- ❌ Revoke/cancel referral functionality
- ❌ Edit referral
- ❌ Patient view of referrals
- ❌ Physiotherapist access to referrals
- ❌ Session usage tracking (when appointments complete)
- ❌ Automatic status updates (EXPIRED when past expiry date)

## File Structure

```
apps/
├── api/
│   └── src/
│       ├── referrals/
│       │   ├── dto/
│       │   │   └── create-referral.dto.ts
│       │   ├── referrals.controller.ts
│       │   ├── referrals.service.ts
│       │   └── referrals.module.ts
│       ├── patients/
│       │   ├── patients.controller.ts
│       │   ├── patients.service.ts
│       │   └── patients.module.ts
│       └── app.module.ts (updated)
└── web/
    └── src/
        ├── app/
        │   ├── dashboard/
        │   │   └── page.tsx (updated)
        │   └── doctor/
        │       └── referrals/
        │           ├── create/
        │           │   └── page.tsx
        │           └── page.tsx
        └── components/
            └── ui/
                └── badge.tsx (new)
```

## API Endpoints Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/referrals` | Create new referral | Doctor |
| GET | `/referrals/doctor` | List doctor's referrals | Doctor |
| GET | `/referrals/patient` | List patient's referrals | Patient |
| GET | `/referrals/patient/active` | Get active patient referrals | Patient |
| GET | `/referrals/:id` | Get referral details | Doctor/Patient/Admin |
| PATCH | `/referrals/:id/status` | Update referral status | Doctor |
| GET | `/patients` | List all patients (with search) | Doctor/Admin |
| GET | `/patients/profile` | Get current patient profile | Patient |

## Next Steps

### Immediate Priority
1. **Test the referral creation flow end-to-end**
2. **Create referral details page** (`/doctor/referrals/[id]`)
3. **Patient view of referrals** (`/patient/referrals`)

### High Priority
1. **PDF generation** - Generate printable referral documents
2. **QR code generation** - For easy referral verification
3. **Email notifications** - Notify patients when referral is created
4. **Session tracking** - Update sessionsUsed when appointments complete
5. **Automatic expiry** - Cron job to update expired referrals

### Medium Priority
1. **Revoke referral** - Allow doctors to cancel referrals
2. **Referral statistics** - Analytics for doctors
3. **Export functionality** - Download referrals as CSV/PDF
4. **Filtering and sorting** - Advanced search on referrals list
5. **Physio referral access** - Let physios view relevant referrals

### Nice to Have
1. **Referral templates** - Save common diagnoses
2. **Batch referrals** - Create multiple referrals at once
3. **Referral reminders** - Notify patients of unused referrals
4. **Referral extensions** - Extend expiry dates
5. **Multi-language support** - Traditional Chinese translations

## Notes for Developer

- All backend endpoints are JWT-protected and extract userId from token
- Frontend uses localStorage for token (`access_token` key)
- Patient search is case-insensitive and searches across name, email, phone
- Expiry date is automatically calculated based on validityDays (default: 90)
- Referral fee is 20% (hardcoded, not in database yet)
- Status badges use custom CSS classes (not shadcn variants)
- "Expiring soon" is defined as <14 days until expiry

## Compliance Notes (Hong Kong)

- ✅ Medical license validation (doctor must have completed profile)
- ✅ Patient profile validation (patient must exist)
- ✅ 20% referral fee structure (UI mentions, not yet in payment system)
- ❌ PDF document generation (required for records)
- ❌ Digital signature/verification (future requirement)
- ❌ Audit trail (partial - createdAt/updatedAt exist)

