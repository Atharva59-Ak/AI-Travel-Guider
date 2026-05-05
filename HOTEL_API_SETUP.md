# Hotel API Integration Guide

## Overview
The City Guider now supports **real-time hotel data** from Hotels.com via RapidAPI, with automatic fallback to mock data if the API is unavailable.

## Setup Instructions

### 1. Get Your RapidAPI Key

1. Go to [Hotels.com API on RapidAPI](https://rapidapi.com/apidojo/api/hotels4)
2. Click **"Subscribe to Test"** or **"Get API Key"**
3. Choose a pricing plan (Basic plan is free with limited requests)
4. Copy your API key from the dashboard

### 2. Configure Environment Variables

Create or update your `.env` file in the project root:

```bash
# Add this line with your actual API key
HOTEL_RAPIDAPI_KEY=your_actual_api_key_here
```

For production deployment, also add to your Cloudflare Workers environment variables in `wrangler.json` or through the Cloudflare dashboard.

### 3. How It Works

The accommodations endpoint now follows this flow:

```
User requests hotels for a city
         ↓
Try to get destination ID from Hotels.com API
         ↓
Search for real hotels with current dates
         ↓
┌─────────────────────┬──────────────────────┐
│   Success ✓         │   Error/No Data ✗    │
│                     │                      │
│   Return real       │   Fallback to        │
│   hotel data        │   mock data          │
│                     │                      │
└─────────────────────┴──────────────────────┘
```

### 4. API Flow Details

#### Real Hotel Search (Primary)
1. **Destination Lookup**: Converts city name to Hotels.com destination ID
2. **Hotel Search**: Fetches available hotels for check-in (today) and check-out (3 days later)
3. **Data Transformation**: Converts API response to our app's format
4. **Return Results**: Sends real hotel data with live pricing and availability

#### Mock Data Fallback
If the API fails or returns no results:
- Automatically falls back to static mock data
- Ensures the UI always shows something
- Maintains app functionality even without API key

### 5. Testing

To verify the integration:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12)

3. **Navigate to a city page** (e.g., Mumbai)

4. **Click on "Hotels" tab**

5. **Check console logs** - you should see:
   ```
   [ACCOMMODATIONS API] Request received for city: mumbai
   [ACCOMMODATIONS API] Searching destination ID for: mumbai
   [ACCOMMODATIONS API] Found destination ID: 123456
   [ACCOMMODATIONS API] Fetching hotels for check-in: 2024-01-15, check-out: 2024-01-18
   [ACCOMMODATIONS API] Found 6 real hotels for mumbai
   ```

6. **Check Network tab** - Look for:
   - Request to `/api/accommodations?city=mumbai`
   - Response should contain real hotel data

### 6. Troubleshooting

#### No hotels showing / Only mock data
- Check if `HOTEL_RAPIDAPI_KEY` is set in `.env`
- Verify API key is valid on RapidAPI dashboard
- Check if you've exceeded your API quota
- Look for error messages in browser console

#### API errors in console
- Ensure you have internet connectivity
- Check RapidAPI subscription status
- Verify the API host is accessible

#### Destination ID not found
- Try different city name spellings
- Some smaller cities may not be in Hotels.com database
- Major Indian cities should work fine

### 7. Features of Real Hotel Data

✅ **Live Pricing** - Current rates from Hotels.com  
✅ **Real Availability** - Based on actual hotel inventory  
✅ **Guest Reviews** - Real guest ratings and review counts  
✅ **Multiple Images** - Actual hotel photos  
✅ **Amenities** - List of hotel facilities  
✅ **Star Ratings** - Official hotel classifications  

### 8. Cost Considerations

The Hotels.com API on RapidAPI offers:
- **Free tier**: 100 requests/month (Basic plan)
- **Paid plans**: Starting at $9.99/month for higher limits

Each city search = 2 API calls:
1. Get destination ID
2. Search hotels

### 9. Production Deployment

For production (Cloudflare Workers):

1. Add environment variable to `wrangler.json`:
   ```json
   {
     "vars": {
       "HOTEL_RAPIDAPI_KEY": "your_production_api_key"
     }
   }
   ```

2. Or use Cloudflare Dashboard:
   - Go to Workers & Pages
   - Select your worker
   - Settings → Variables → Environment Variables
   - Add `HOTEL_RAPIDAPI_KEY`

### 10. Future Enhancements

Potential improvements:
- User-selectable check-in/check-out dates
- Filter by price range, star rating, amenities
- Sort by price, rating, distance
- Hotel booking deep links
- Real-time room availability
- Multiple room types and pricing

---

## Support

If you encounter issues:
1. Check browser console for detailed logs
2. Verify API key configuration
3. Review RapidAPI dashboard for usage stats
4. Check Hotels.com API documentation

**API Documentation**: https://rapidapi.com/apidojo/api/hotels4
