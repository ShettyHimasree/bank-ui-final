# Authentication Fix Plan

## Current Issues Identified:
1. **No Route Protection**: Private routes (`/app/*`) are accessible without authentication
2. **Backend Dependencies**: AuthService tries to call non-existent APIs (`/api/login`, `/api/register`)
3. **No Authentication State Management**: No global auth state to control navbar visibility
4. **Missing Auth Guard**: No protection for private routes

## Plan to Fix Authentication:

### Step 1: Create Mock Authentication Service
- Update AuthService to work with localStorage instead of HTTP calls
- Add authentication state management
- Include mock user data validation

### Step 2: Create Authentication Guard
- Create AuthGuard to protect private routes
- Check localStorage for authentication status
- Redirect to login if not authenticated

### Step 3: Update Route Configuration
- Apply AuthGuard to all private routes
- Ensure proper route protection

### Step 4: Improve Auth State Management
- Add auth state service for global authentication status
- Update components to react to auth state changes
- Fix logout functionality

### Step 5: Test Authentication Flow
- Test login/logout functionality
- Verify route protection works
- Ensure navbar shows/hides based on auth state

## Files to Modify:
1. `src/app/auth.service.ts` - Update to work without backend
2. `src/app/auth.guard.ts` - Create new guard
3. `src/app/app.routes.ts` - Apply guard to routes
4. `src/app/components/login/login.component.ts` - Fix login logic
5. `src/app/components/private-navbar/navbar.component.ts` - Improve logout

## Expected Outcome:
- Private navbar only accessible after login
- Login/logout works with localStorage
- Protected routes redirect to login when not authenticated
- No backend dependencies for basic functionality
