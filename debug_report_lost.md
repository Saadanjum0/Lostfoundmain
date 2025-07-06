# Debug Guide: Report Lost Item Not Working

## **Step 1: Check if Categories and Locations Exist**

The most common reason the "Report Lost Item" functionality doesn't work is missing categories or locations in your database.

### **Quick Test:**
1. Go to `/report/lost` in your browser
2. Look for debug info box (if in development mode)
3. Check if it shows "Categories: 0, Locations: 0"

### **Fix:**
Run the `seed_categories_locations.sql` script in your Supabase SQL Editor:
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `seed_categories_locations.sql`
3. Run the script
4. Refresh your app

## **Step 2: Check Console Errors**

Open browser developer tools (F12) and check for:

### **Common Errors:**
1. **Network errors** - API calls failing
2. **Authentication errors** - User not logged in
3. **Validation errors** - Form validation failing
4. **Database errors** - Foreign key constraints, etc.

## **Step 3: Test Step by Step**

### **Test Navigation:**
1. Click "Report Lost Item" button
2. Should redirect to `/report/lost`
3. Page should load with form

### **Test Form Loading:**
1. Categories dropdown should populate
2. Locations dropdown should populate
3. No error alerts should show

### **Test Form Submission:**
1. Fill out all required fields:
   - Item name
   - Category
   - Description (min 10 chars)
   - Location
   - Date lost
   - Contact email
2. Click "Submit Lost Item Report"
3. Should show success toast

## **Step 4: Check Authentication**

The route is protected by `AuthGuard`. Make sure:
1. User is logged in
2. Auth context is working
3. User object exists

## **Step 5: Database Checks**

Run these queries in Supabase SQL Editor:

```sql
-- Check if categories exist
SELECT count(*) as category_count FROM categories WHERE is_active = true;

-- Check if locations exist  
SELECT count(*) as location_count FROM locations WHERE is_active = true;

-- Check recent items submissions
SELECT * FROM items ORDER BY created_at DESC LIMIT 5;
```

## **Step 6: Common Issues and Solutions**

### **Issue: Empty Dropdowns**
**Cause:** No categories or locations in database
**Solution:** Run `seed_categories_locations.sql`

### **Issue: Form Validation Errors**
**Cause:** Missing required fields or validation rules
**Solution:** Check form schema and fill all required fields

### **Issue: Network/API Errors**
**Cause:** Supabase connection issues or RLS policies
**Solution:** 
- Check Supabase connection
- Verify RLS policies allow INSERT on items table
- Check user permissions

### **Issue: Image Upload Fails**
**Cause:** Storage bucket issues or file size limits
**Solution:**
- Check if `item-images` storage bucket exists
- Verify storage policies allow uploads
- Check file size (should be < 5MB per image)

### **Issue: Authentication Errors**
**Cause:** User not properly authenticated
**Solution:**
- Log out and log back in
- Check if JWT token is valid
- Verify AuthGuard is working

## **Step 7: Enable Debug Mode**

In development, you'll see a debug info box showing:
- Categories count
- Locations count  
- Loading states
- Error messages

This helps identify exactly what's missing.

## **Step 8: Manual Testing Checklist**

- [ ] Navigate to `/report/lost`
- [ ] Page loads without errors
- [ ] Categories dropdown has options
- [ ] Locations dropdown has options
- [ ] Fill out form with valid data
- [ ] Submit form
- [ ] Success message appears
- [ ] Form resets after submission
- [ ] Item appears in admin dashboard (pending status)

## **Most Likely Fix Needed:**

**Run the seed script!** 99% of the time, the issue is simply that categories and locations tables are empty. After running `seed_categories_locations.sql`, the functionality should work perfectly. 