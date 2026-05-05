# 🚂 Testing Your IRCTC Railway Integration

## Quick Start Guide

### 1️⃣ Access the Search Page

Click the preview button above and navigate to:
- **URL Pattern**: `http://localhost:5173/search?from=Mumbai&to=Delhi`
- Or use the search form in the app to search between any two cities

### 2️⃣ Test Train Search Features

#### Test Case 1: Mumbai to Delhi Route
```
From: Mumbai
To: Delhi
Transport Mode: Train
```
**Expected Result**: You should see multiple trains including:
- Rajdhani Express
- Duronto Express
- Paschim Express
- And more...

#### Test Case 2: Bangalore to Chennai
```
From: Bangalore
To: Chennai
Transport Mode: Train
```
**Expected Result**: Multiple trains like:
- Shatabdi Express
- Lalbagh Express
- Brindavan Express

#### Test Case 3: Delhi to Agra (Tourist Route)
```
From: Delhi
To: Agra
Transport Mode: Train
```
**Expected Result**: 
- Gatimaan Express
- Shatabdi Express
- Taj Express

### 3️⃣ Verify API Integration

Open your browser's Developer Console (F12) and check:

✅ **Network Tab**:
- Look for requests to `irctc-api2.p.rapidapi.com`
- Status should be 200 OK
- Response time should be < 2 seconds

✅ **Console Logs**:
- No CORS errors
- No authentication errors
- Should see train data being logged

### 4️⃣ Test Station Code Mapping

The app automatically converts city names to railway station codes:

| City Name | Station Code |
|-----------|-------------|
| Mumbai | CSTM |
| Delhi | NDLS |
| Bangalore | SBC |
| Chennai | MAS |
| Kolkata | HWH |
| Hyderabad | HYB |

Try searching with city names - the conversion happens automatically!

### 5️⃣ Test Different Features

#### ✅ Train Schedule Lookup
- Enter a train number (e.g., 12952)
- View complete schedule with all stations
- Check arrival/departure times
- See platform numbers

#### ✅ PNR Status Check
- Enter a sample PNR (for testing)
- View reservation status
- Check berth allocation

#### ✅ Live Train Running Status
- Search for any running train
- See current location
- Check delay information
- View upcoming stations

### 6️⃣ UI/UX Verification

Check these visual elements:

✅ **Loading States**:
- Spinner appears during API calls
- "Searching for trains..." message displays

✅ **Train Cards Display**:
- Train name and number visible
- Departure/arrival times clear
- Duration displayed correctly
- Available classes shown with badges

✅ **Animations**:
- Smooth fade-in for train cards
- Hover effects working
- Responsive on mobile

✅ **Error Handling**:
- Try invalid station codes
- Should show helpful error message
- No crashes or blank screens

### 7️⃣ Test Date Selection

Use the date picker to:
- Select future dates
- Verify trains show for different dates
- Change passenger count
- See updated results

### 8️⃣ Cross-Mode Comparison

Test that train options appear alongside:
- ✈️ Flights
- 🚌 Buses  
- 🚗 Cars

Trains should be properly filtered and displayed.

## 🐛 Common Issues & Solutions

### Issue 1: No Trains Showing
**Solution**: 
1. Check if station codes are valid
2. Try major cities first (Mumbai, Delhi, etc.)
3. Check browser console for API errors

### Issue 2: API Error Messages
**Solution**:
1. Verify `.env` file has correct RAPIDAPI_KEY
2. Restart dev server: `npm run dev`
3. Check RapidAPI subscription status

### Issue 3: Loading Forever
**Solution**:
1. Open Network tab in DevTools
2. Check if API request is pending
3. Verify internet connection
4. Try refreshing the page

### Issue 4: Wrong Station Codes
**Solution**:
- The app auto-converts city names
- For rare cities, try using major nearby stations
- Example: Use "PUNE" instead of "Lonavala"

## 📊 Sample API Response

When working correctly, you should see data like:

```json
{
  "trainNumber": "12952",
  "trainName": "Mumbai Rajdhani",
  "trainType": "RAJDHANI",
  "departureTime": "16:35",
  "arrivalTime": "08:35",
  "duration": "16:00",
  "runningDays": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "availableClasses": ["1A", "2A", "3A"]
}
```

## 🎯 Success Criteria

Your integration is working perfectly if:

✅ Trains display within 2-3 seconds
✅ All train details are visible
✅ Station codes convert automatically
✅ Date selection works
✅ No console errors
✅ Smooth animations
✅ Mobile responsive

## 🔍 Advanced Testing

### Test Edge Cases:
1. **Same source and destination** - Should handle gracefully
2. **Very small cities** - Should suggest alternatives
3. **No direct trains** - Should show appropriate message
4. **Special characters in city names** - Should handle properly

### Performance Testing:
1. Load time should be < 3 seconds
2. Multiple searches should work smoothly
3. No memory leaks on repeated searches
4. Animations should remain smooth

## 📱 Mobile Testing

Test on mobile view:
- Cards should stack vertically
- Text should be readable
- Buttons should be tappable
- Date picker should work

## 🎨 Visual Checklist

When viewing train results, verify:

- [ ] Train icons are visible
- [ ] Colors are consistent (blue theme)
- [ ] Spacing is uniform
- [ ] Fonts are readable
- [ ] Borders are clean
- [ ] Shadows add depth
- [ ] Icons align properly

## 🚀 Next Steps After Testing

Once confirmed working:

1. ✅ Test with real user scenarios
2. ✅ Add more city mappings if needed
3. ✅ Consider adding fare calculation
4. ✅ Implement seat availability check
5. ✅ Add booking links (if available)

## 📞 Support

If you encounter issues:

1. Check `IRCTC_INTEGRATION.md` for setup details
2. Review browser console for errors
3. Verify environment variables in `.env`
4. Check RapidAPI documentation

---

**Happy Testing! 🎉**

Your IRCTC Railway integration should now be fully functional with real-time train data!
