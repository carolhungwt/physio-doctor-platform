# Quick Start Guide - Referral System

## 🚀 5-Minute Setup

### 1. Start Everything
```bash
# Terminal 1 - Database
docker-compose up -d

# Terminal 2 - Backend API
cd apps/api
npm run dev

# Terminal 3 - Frontend
cd apps/web
npm run dev
```

### 2. Create Test Accounts
**Doctor Account:**
- Email: `doctor@test.com`
- Password: `Test123!`
- Role: DOCTOR
- Complete profile with license: MD12345

**Patient Account:**
- Email: `patient@test.com`
- Password: `Test123!`
- Role: PATIENT
- Complete profile onboarding

### 3. Create Your First Referral
1. Login as doctor → http://localhost:3000
2. Click "Create Referral" on dashboard
3. Select patient from dropdown
4. Fill in:
   - Diagnosis: "Lower back pain"
   - Sessions: 6
   - Urgency: ROUTINE
5. Click "Create Referral"
6. ✅ Success! View in referrals list

## 📍 Key URLs

| Page | URL | Who |
|------|-----|-----|
| Login | http://localhost:3000/auth/login | All |
| Dashboard | http://localhost:3000/dashboard | All |
| Create Referral | http://localhost:3000/doctor/referrals/create | Doctor |
| View Referrals | http://localhost:3000/doctor/referrals | Doctor |
| API Docs | http://localhost:3001 | Dev |

## 🔑 API Quick Reference

All endpoints require `Authorization: Bearer TOKEN` header.

### Get Patients
```bash
GET /patients
GET /patients?search=jane
```

### Create Referral
```bash
POST /referrals
Body: {
  "patientId": "uuid",
  "diagnosis": "string",
  "sessions": 6,
  "urgency": "ROUTINE"
}
```

### List Referrals
```bash
GET /referrals/doctor    # Doctor's referrals
GET /referrals/patient   # Patient's referrals
GET /referrals/:id       # Single referral
```

## 🐛 Common Issues

**"Failed to fetch patients"**
→ Check backend is running on :3001

**"Failed to create referral"**
→ Verify doctor completed profile

**Redirect loop after login**
→ Clear localStorage and re-login

**Patient not in dropdown**
→ Patient must complete profile onboarding

## 📁 Where Is Everything?

```
Backend:  apps/api/src/referrals/
Frontend: apps/web/src/app/doctor/referrals/
Tests:    TEST_REFERRAL_SYSTEM.md
Details:  REFERRAL_SYSTEM_IMPLEMENTATION.md
```

## ✨ Features At a Glance

✅ Create referrals with full validation
✅ Search patients by name/email/phone
✅ Track sessions (used/total)
✅ Urgency levels (ROUTINE/URGENT/EMERGENCY)
✅ Expiry warnings (<14 days)
✅ Status badges (ACTIVE/EXPIRED/COMPLETED)
✅ 20% referral fee calculation
✅ Auto-redirect after success

## 🎯 What's Next?

Choose your adventure:

**A) Test It** → Follow `TEST_REFERRAL_SYSTEM.md`
**B) Extend It** → Add PDF generation, notifications
**C) Build More** → Patient booking system next
**D) Deploy It** → Production setup

## 💡 Pro Tips

1. **Search is instant** - Type in patient search for real-time filter
2. **Validation is smart** - Try submitting empty form to see all validations
3. **Badges are color-coded** - Green=active, Orange=urgent, Red=revoked
4. **Expiry warnings** - ⚠️ shows when <14 days left
5. **Stats update live** - Create referral → list updates immediately

## 📞 Need Help?

1. Check `TEST_REFERRAL_SYSTEM.md` for detailed testing
2. Check `REFERRAL_SYSTEM_IMPLEMENTATION.md` for technical details
3. Check browser console for errors
4. Check backend logs for API errors
5. Ask me anything! I'm here to help.

---

**Status**: Ready to test! 🎉

Start with Terminal 1-3 above, then visit http://localhost:3000

