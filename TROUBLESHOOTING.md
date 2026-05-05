# 🔧 IRCTC Integration Troubleshooting Guide

## Quick Diagnosis

### ✅ Step 1: Test the API Directly

Visit: **http://localhost:5173/test-irctc**

This dedicated test page will show you:
- Whether the environment variable is loaded ✓
- If the API key is working
- Real-time API responses
- Detailed error messages

### ✅ Step 2: Check Browser Console

When you search for trains, open DevTools (F12) and check the Console tab for:

```
✅ Should see:
- "Fetching trains from NDLS to CSTM"
- "Using API Key: 7d44d467cf..."
- "Response status: 200"
- "Received train data: [...]"

❌ If you see errors:
- CORS errors → API configuration issue
- 401/403 → Invalid API key
- 429 → Rate limit exceeded
- Network errors → Connectivity issue
```

## 🔍 Common Issues & Solutions

### Issue 1: "NOT LOADED" Environment Variable

**Symptom**: Test page shows "VITE_RAPIDAPI_KEY: NOT LOADED ✗"

**Solution**:
1. Stop the dev server (Ctrl+C)
2. Verify `.env` file exists in project root
3. Check `.env` contains:
   ```env
   VITE_RAPIDAPI_KEY=7d44d467cfmsh8a9fcafc80e97a3p12d0e3jsnbca7fcdc0ec0
   VITE_RAPIDAPI_HOST=irctc-api2.p.rapidapi.com
   ```
4. Restart: `npm run dev`
5. Hard refresh browser (Ctrl+Shift+R)

### Issue 2: CORS Errors

**Symptom**: Console shows "Access-Control-Allow-Origin" errors

**Cause**: RapidAPI doesn't support direct browser calls

**Solutions**:

#### Option A: Use Cloudflare Worker Proxy (Recommended)

Add to `src/worker/index.ts`:

```typescript
app.get("/api/trains/between-stations", async (c) => {
  const from = c.req.query("from");
  const to = c.req.query("to");
  
  if (!from || !to) {
    return c.json({ error: "Missing parameters" }, 400);
  }
  
  const response = await fetch(
    `https://irctc-api2.p.rapidapi.com/trainsBetweenStations?fromStationCode=${from}&toStationCode=${to}`,
    {
      headers: {
        'x-rapidapi-host': 'irctc-api2.p.rapidapi.com',
        'x-rapidapi-key': c.env.RAPIDAPI_KEY,
      },
    }
  );
  
  const data = await response.json();
  return c.json(data);
});
```

Then update `railwayAPI.ts`:

```typescript
export async function getTrainsBetweenStations(
  fromStation: string,
  toStation: string
): Promise<TrainBetweenStations[] | null> {
  try {
    const response = await fetch(
      `/api/trains/between-stations?from=${fromStation}&to=${toStation}`
    );
    
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}
```

#### Option B: Configure RapidAPI CORS

1. Go to https://rapidapi.com/apiashish/api/irctc-api2
2. Check if they have CORS settings
3. Some APIs require you to set your domain whitelist

### Issue 3: API Returns Empty Array or Null

**Symptom**: No trains showing, but no errors

**Possible Causes**:

1. **Invalid Station Codes**
   - Ensure you're using proper codes (NDLS, CSTM, etc.)
   - Try major cities first

2. **No Direct Trains**
   - Some routes may not have direct trains
   - Try Mumbai-Delhi or Delhi-Bangalore (busy routes)

3. **API Response Format Changed**
   - Check console for actual response
   - API might return different structure

**Debug**:
```javascript
// In railwayAPI.ts, add after line 86:
console.log('Raw API Response:', JSON.stringify(data, null, 2));
```

### Issue 4: 401 Unauthorized / 403 Forbidden

**Symptom**: API returns these status codes

**Causes**:
1. Invalid API key
2. Expired API key
3. Subscription issues on RapidAPI

**Solution**:
1. Verify key in `.env` matches exactly
2. Check RapidAPI subscription is active
3. Ensure no extra spaces in .env file
4. Try regenerating key on RapidAPI

### Issue 5: 429 Too Many Requests

**Symptom**: API stops working after several calls

**Cause**: Rate limiting

**Solutions**:
1. Check your RapidAPI plan limits
2. Add caching to reduce API calls
3. Implement request throttling

```typescript
// Simple cache example
const cache = new Map<string, {data: any, timestamp: number}>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getTrainsBetweenStations(from: string, to: string) {
  const key = `${from}-${to}`;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetchAPI(...);
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

## 🧪 Manual Testing Steps

### Test 1: Environment Variables

Open browser console and type:
```javascript
import.meta.env.VITE_RAPIDAPI_KEY
```
Should show your API key (first 10 chars)

### Test 2: Direct API Call

In browser console:
```javascript
fetch('https://irctc-api2.p.rapidapi.com/trainsBetweenStations?fromStationCode=NDLS&toStationCode=CSTM', {
  method: 'GET',
  headers: {
    'x-rapidapi-host': 'irctc-api2.p.rapidapi.com',
    'x-rapidapi-key': '7d44d467cfmsh8a9fcafc80e97a3p12d0e3jsnbca7fcdc0ec0',
  },
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

If this works → Issue is in your code
If this fails → Issue with API key or RapidAPI

### Test 3: Check Network Tab

1. Open DevTools → Network tab
2. Search for trains
3. Look for request to `irctc-api2.p.rapidapi.com`
4. Check:
   - Status code (should be 200)
   - Request headers (has API key?)
   - Response (what's the actual data?)

## 📊 Expected vs Actual Behavior

### ✅ Expected (Working):
```
Console Output:
✓ Fetching trains from NDLS to CSTM
✓ Using API Key: 7d44d467cf...
✓ Response status: 200
✓ Received train data: Array(15)
  [0]: {trainName: "Rajdhani Express", ...}
  [1]: {trainName: "Duronto Express", ...}
  ...

UI Shows:
✓ Train cards with names
✓ Departure/Arrival times
✓ Duration
✓ Available classes
```

### ❌ Not Working:
```
Console Output:
✗ Failed to fetch trains: 401 Unauthorized
OR
✗ Access to fetch blocked by CORS policy
OR
✗ Response status: 429

UI Shows:
✗ "No trains found" message
✗ Loading spinner forever
✗ Error message in red box
```

## 🛠️ Quick Fixes

### Fix 1: Restart Everything

```bash
# Stop server
Ctrl+C

# Clear Vite cache
rm -rf node_modules/.vite

# Restart
npm run dev

# Hard refresh browser
Ctrl+Shift+R
```

### Fix 2: Reinstall Dependencies

```bash
npm install
npm run dev
```

### Fix 3: Check .env Loading

Add to top of `main.tsx`:
```typescript
console.log('Env vars:', import.meta.env);
```

Should show all VITE_* variables

## 🎯 Testing Checklist

- [ ] Visit http://localhost:5173/test-irctc
- [ ] Click "Test Mumbai → Delhi" button
- [ ] Check environment shows "Loaded ✓"
- [ ] See train data in results
- [ ] No console errors
- [ ] Visit main search page
- [ ] Search Mumbai to Delhi
- [ ] Select "Train" filter
- [ ] See real train options
- [ ] Click "Search Trains" button
- [ ] Trains load successfully

## 📞 Still Not Working?

If none of the above helps:

1. **Check RapidAPI Dashboard**
   - Go to https://rapidapi.com/developer/hub
   - Check your subscriptions
   - Verify API is active

2. **Test API Outside Your App**
   - Use Postman or curl
   - Test directly on RapidAPI website
   - Rule out app-specific issues

3. **Check API Documentation**
   - Visit https://rapidapi.com/apiashish/api/irctc-api2
   - Verify endpoint URLs
   - Check for API changes

4. **Share Debug Info**
   - Screenshot of test-irctc page
   - Console logs (full output)
   - Network tab request details

---

**Last Updated**: March 22, 2026  
**API Version**: IRCTC v2 via RapidAPI  
**Status**: Configuration Complete ✓
