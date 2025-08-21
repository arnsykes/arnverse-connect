# ARNVERSE - Rencana Pengujian Manual End-to-End

**Tanggal:** 21 Agustus 2025  
**Versi:** 2.0  
**Tujuan:** Memastikan aplikasi stabil dan bebas runtime error setelah perbaikan komprehensif

---

## 🎯 Objektif Pengujian

1. **Zero Runtime Errors** - Tidak ada error di console browser
2. **Data Consistency** - UI menampilkan data dengan benar walau field null/undefined
3. **Responsive Design** - Aplikasi bekerja di desktop dan mobile
4. **Core Functionality** - Semua fitur utama berfungsi normal
5. **Error Resilience** - Aplikasi tetap stabil walau API return data kosong

---

## 🔧 Setup Pengujian

### Environment
- **Frontend URL:** `http://localhost:5173` (development) atau production URL
- **API Base:** `https://armworld.space/api`
- **Test Account:** `alice@arnverse.com / password`

### Browser Testing
- ✅ Chrome/Chromium (primary)
- ✅ Firefox
- ✅ Safari (jika tersedia)
- ✅ Mobile Chrome (responsive)

### Device Testing
- 📱 Mobile: iPhone 14 Pro (430x932) atau similar
- 💻 Desktop: 1440x900 atau larger
- 📱 Tablet: iPad (768x1024) atau similar

---

## 📋 Test Cases

### 1. **Authentication Flow** 🔐

#### TC-01: Login Success
**Steps:**
1. Buka aplikasi di browser
2. Navigate ke `/login`
3. Input: `alice@arnverse.com` / `password`
4. Klik "Login"

**Expected Results:**
- ✅ Redirect ke feed page setelah login sukses
- ✅ Header menampilkan nama user dengan benar
- ✅ Token tersimpan di localStorage
- ✅ Tidak ada error di console

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

#### TC-02: Protected Route Access
**Steps:**
1. Buka browser dalam incognito mode
2. Langsung akses `/feed` tanpa login
3. Observasi behavior

**Expected Results:**
- ✅ Redirect otomatis ke `/login`
- ✅ Setelah login, redirect kembali ke `/feed`
- ✅ Tidak ada error di console

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

### 2. **Feed Display & Data Safety** 📰

#### TC-03: Feed Loading
**Steps:**
1. Login berhasil
2. Observasi feed page loading
3. Scroll ke bawah untuk test infinite scroll

**Expected Results:**
- ✅ Posts ter-load tanpa error
- ✅ Semua author names tampil (tidak ada "undefined")
- ✅ Avatar fallback muncul jika tidak ada gambar
- ✅ Timestamps ter-format dengan benar (contoh: "2h", "1d")
- ✅ Like/comment counts tampil angka (tidak NaN)
- ✅ Infinite scroll bekerja smooth

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

#### TC-04: Null Data Handling
**Steps:**
1. Di feed, cari post yang mungkin punya author null atau field kosong
2. Observasi tampilan UI
3. Check console untuk errors

**Expected Results:**
- ✅ UI tetap render normal walau data sebagian kosong
- ✅ Fallback text muncul ("Unknown User", "Pengguna", dll)
- ✅ Avatar placeholder muncul jika avatar null
- ✅ Tidak ada "Cannot read properties of undefined" di console

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

### 3. **Comments Functionality** 💬

#### TC-05: Comments Loading
**Steps:**
1. Di feed, klik icon comment pada salah satu post
2. Observasi comment drawer yang muncul
3. Scroll dalam comment list jika ada banyak

**Expected Results:**
- ✅ Comment drawer terbuka smooth
- ✅ Comments ter-load tanpa error
- ✅ Author names di comments tampil benar (tidak "undefined")
- ✅ Avatar fallback bekerja untuk commenters
- ✅ Timestamps comments ter-format benar
- ✅ Tidak ada error di console

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

#### TC-06: Add New Comment
**Steps:**
1. Buka comment drawer
2. Type komentar: "Test comment dari manual testing"
3. Klik send button
4. Observasi hasil

**Expected Results:**
- ✅ Comment berhasil dikirim
- ✅ Comment muncul di list tanpa reload
- ✅ Comment count di post bertambah +1
- ✅ Toast notification muncul "Comment added"
- ✅ Input field dikosongkan setelah send

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

### 4. **Stories Feature** 📖

#### TC-07: Stories Loading
**Steps:**
1. Di header/top feed, observasi stories section
2. Klik pada story bubble jika ada
3. Test story viewer functionality

**Expected Results:**
- ✅ Story bubbles ter-load tanpa error
- ✅ Author names di story bubble tampil benar
- ✅ Story viewer buka dengan smooth animation
- ✅ Tidak ada error saat load story content
- ✅ Navigation antar stories bekerja

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

### 5. **Interactive Features** ❤️

#### TC-08: Like Functionality
**Steps:**
1. Di feed, klik heart icon pada post
2. Observasi perubahan UI
3. Klik lagi untuk unlike
4. Test pada beberapa posts berbeda

**Expected Results:**
- ✅ Heart icon berubah warna saat di-like
- ✅ Like count bertambah/berkurang sesuai action
- ✅ Optimistic update bekerja (tidak tunggu API response)
- ✅ State tetap konsisten setelah refresh page
- ✅ Tidak ada error di console

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

#### TC-09: Save/Bookmark
**Steps:**
1. Klik bookmark icon pada post
2. Observasi perubahan UI
3. Test toggle bookmark

**Expected Results:**
- ✅ Bookmark icon berubah state saat di-klik
- ✅ Visual feedback jelas (warna/fill change)
- ✅ Action berjalan smooth tanpa lag
- ✅ Tidak ada error di console

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

### 6. **Navigation & Routing** 🧭

#### TC-10: Page Navigation
**Steps:**
1. Test navigation melalui sidebar (desktop) atau bottom tab (mobile)
2. Visit: Feed → Explore → Profile → Settings → Chatroom
3. Use browser back/forward buttons
4. Test direct URL access untuk each page

**Expected Results:**
- ✅ Smooth navigation tanpa flash/reload
- ✅ Active state indicator benar di navigation
- ✅ Browser back/forward bekerja normal
- ✅ Direct URL access tidak 404
- ✅ Loading states tampil appropriate

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

### 7. **Responsive Design** 📱

#### TC-11: Mobile Layout
**Steps:**
1. Resize browser ke mobile size (430px width) atau test di mobile device
2. Test semua functionality di mobile layout
3. Test touch interactions

**Expected Results:**
- ✅ Layout adapt dengan benar ke mobile
- ✅ Bottom tab navigation muncul dan bekerja
- ✅ Touch targets cukup besar (min 44px)
- ✅ Horizontal scroll tidak muncul
- ✅ Comments drawer responsive di mobile

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

#### TC-12: Desktop Layout  
**Steps:**
1. Test di desktop resolution (1440px+)
2. Observasi sidebar navigation
3. Test hover states pada interactive elements

**Expected Results:**
- ✅ Sidebar navigation visible dan functional
- ✅ Hover effects bekerja smooth
- ✅ Layout tidak terlalu lebar/sempit
- ✅ Good content spacing dan alignment

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

### 8. **Error Scenarios** ⚠️

#### TC-13: Network Failure Simulation
**Steps:**
1. Buka DevTools → Network tab
2. Set network to "Offline" atau throttle to "Slow 3G"
3. Try various actions (like, comment, navigation)
4. Return network to normal

**Expected Results:**
- ✅ Proper loading states tampil saat network slow
- ✅ Error messages user-friendly (tidak technical)
- ✅ Retry functionality available where appropriate
- ✅ App tidak crash/freeze saat offline
- ✅ Recovery smooth saat network kembali

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

#### TC-14: API Error Handling
**Steps:**
1. Monitor console untuk API errors
2. Test dengan invalid endpoints (jika mungkin)
3. Observasi error handling

**Expected Results:**
- ✅ API errors tidak crash UI
- ✅ User-friendly error messages
- ✅ Fallback content ditampilkan
- ✅ Retry mechanisms available

**Status:** [ ] Pass [ ] Fail  
**Notes:** ________________________________

---

## 🔍 Console Monitoring

### Critical Console Checks
Selama testing, pastikan **TIDAK ADA** error berikut di console:

❌ **FATAL ERRORS** (Harus 0):
- `Cannot read properties of undefined (reading 'username')`
- `Cannot read properties of undefined (reading 'display_name')`
- `Cannot read properties of null (reading 'slice')`
- `TypeError: Cannot read property`
- `ReferenceError`
- `Uncaught Error`

⚠️ **ACCEPTABLE WARNINGS** (Boleh ada):
- Network timeout warnings
- Non-critical API warnings
- Development-only warnings

### Monitoring Checklist
- [ ] ✅ Feed loading: No fatal errors
- [ ] ✅ Comments: No fatal errors  
- [ ] ✅ Stories: No fatal errors
- [ ] ✅ Navigation: No fatal errors
- [ ] ✅ Mobile layout: No fatal errors

---

## 📊 Test Results Summary

### Overall Status
- **Total Test Cases:** 14
- **Passed:** ___/14
- **Failed:** ___/14
- **Console Errors:** ___
- **Critical Issues:** ___

### Pass/Fail Criteria
- ✅ **PASS:** ≥ 12/14 test cases pass + 0 fatal console errors
- ⚠️ **CONDITIONAL PASS:** 10-11/14 pass + minor issues only
- ❌ **FAIL:** < 10/14 pass OR any fatal console errors

### Final Assessment
**Status:** [ ] PASS [ ] CONDITIONAL PASS [ ] FAIL

**Critical Issues Found:**
1. _________________________________
2. _________________________________
3. _________________________________

**Recommendations:**
1. _________________________________
2. _________________________________
3. _________________________________

---

## 🎯 Production Readiness Checklist

- [ ] All core functionality working
- [ ] Zero fatal runtime errors
- [ ] Responsive design functional
- [ ] Data consistency maintained
- [ ] Error handling graceful
- [ ] Performance acceptable (< 3s initial load)
- [ ] User experience smooth
- [ ] API integration stable

**PRODUCTION READY:** [ ] YES [ ] NO

**Tester Signature:** ________________________  
**Date Completed:** ________________________  
**Environment Tested:** ________________________