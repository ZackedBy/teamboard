# How to Login as Admin

## ✅ Automatic: First User is Admin (Default Behavior)

**The first user you register will automatically be an admin!**

Just:
1. Register a new account (first registration)
2. Login with that account
3. You'll have admin privileges automatically

## Option 1: Make Existing User Admin (Manual)

When you create the first user account, you can make them admin automatically. Here are the steps:

### Method A: Via Database (After Registration)

1. **Register a user** through the normal registration process
2. **Connect to your PostgreSQL database:**
   ```bash
   # If using Docker:
   docker exec -it <postgres_container_name> psql -U postgres -d teamboard
   
   # Or if PostgreSQL is installed locally:
   psql -U postgres -d teamboard
   ```

3. **Find the user ID and make them admin:**
   ```sql
   -- See all users
   SELECT id, name, email, is_admin FROM users;
   
   -- Make the first user (or any user) an admin
   UPDATE users SET is_admin = true WHERE id = 1;
   -- Or by email:
   UPDATE users SET is_admin = true WHERE email = 'your-email@example.com';
   ```

4. **Log out and log back in** to get the admin token

### Method B: Modify Registration to Auto-Make First User Admin

I can modify the code to automatically make the first registered user an admin. Would you like me to do that?

---

## Option 2: Using SQL Script

Create a SQL script to set up admin:

```sql
-- Make user with email 'admin@example.com' an admin
UPDATE users SET is_admin = true WHERE email = 'admin@example.com';

-- Or make first user admin
UPDATE users 
SET is_admin = true 
WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1);
```

---

## Option 3: Through Existing Admin User

If you already have an admin user:
1. Login as that admin
2. Go to Users page
3. Click the ⭐ (star) button next to any user to make them admin
4. That user can now login with admin privileges

---

## Quick Setup Script

If you want, I can create a simple script to make the first user admin automatically. Let me know!

---

## Verify Admin Status

After setting admin status:
1. **Log out** from the application
2. **Log back in** with the admin user
3. You should see admin controls in the Users page
4. Check browser console for `isAdmin: true` in the user object

---

## Troubleshooting

**Problem:** "Admin access required" error
- **Solution:** Make sure you logged out and logged back in after setting admin status
- The JWT token needs to be refreshed to include the new admin status

**Problem:** Can't find users table
- **Solution:** Make sure the database is initialized:
  ```bash
  # Check if tables exist
  psql -U postgres -d teamboard -c "\dt"
  ```

**Problem:** No admin badge showing
- **Solution:** 
  1. Clear browser cache/localStorage
  2. Log out completely
  3. Log back in
  4. Check `localStorage.getItem('user')` in browser console

