import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import {
  getOAuthRedirectUrl,
  exchangeCodeForSessionToken,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { INDIAN_CITIES } from "@/worker/data/cities";
import { generateRoutes } from "@/worker/data/routes";
import { ATTRACTIONS } from "@/worker/data/attractions";
import { ACCOMMODATIONS } from "@/worker/data/accommodations";
import { RESTAURANTS } from "@/worker/data/restaurants";
import { ItineraryRequestSchema, TravelPlanSchema, type TravelPlan } from "@/shared/types";
import { RecommendationService, type UserPreference } from "@/worker/services/recommendationService";
import { getDestinationId, searchHotels } from "@/services/hotelAPI";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());
const LOCAL_USER_ID = "local-user";
const resolveRequestUserId = (c: { req: { header: (name: string) => string | undefined; query: (name: string) => string | undefined } }) =>
  c.req.header("x-user-id") || c.req.query("userId") || LOCAL_USER_ID;

// Database initialization endpoint for local development
app.post("/api/init-db", async (c) => {
  try {
    // Create saved_trips table
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS saved_trips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        from_city TEXT NOT NULL,
        to_city TEXT NOT NULL,
        travel_mode TEXT NOT NULL,
        route_details TEXT,
        estimated_cost REAL,
        estimated_duration TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Create saved_cities table
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS saved_cities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        city_name TEXT NOT NULL,
        city_state TEXT NOT NULL,
        saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Create saved_attractions table
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS saved_attractions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        attraction_id TEXT NOT NULL,
        attraction_name TEXT NOT NULL,
        city_name TEXT NOT NULL,
        saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Create saved_itineraries table
    await c.env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS saved_itineraries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        itinerary_name TEXT NOT NULL,
        city TEXT NOT NULL,
        days INTEGER NOT NULL,
        budget TEXT NOT NULL,
        travel_style TEXT NOT NULL,
        interests TEXT NOT NULL,
        itinerary_content TEXT NOT NULL,
        saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Create indexes
    await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_saved_trips_user_id ON saved_trips(user_id)`).run();
    await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_saved_cities_user_id ON saved_cities(user_id)`).run();
    await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_saved_attractions_user_id ON saved_attractions(user_id)`).run();
    await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_saved_itineraries_user_id ON saved_itineraries(user_id)`).run();

    return c.json({ success: true, message: "Database initialized successfully" });
  } catch (error) {
    console.error("Error initializing database:", error);
    return c.json({ success: false, error: "Failed to initialize database" }, 500);
  }
});

type JwtUser = {
  id: string;
  email?: string;
  name?: string;
};

const getJwtSecret = (env: Env): string => {
  const processEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env.JWT_SECRET || processEnv?.JWT_SECRET || "";
};

const normalizeJwtUser = (candidate: unknown): JwtUser | null => {
  if (typeof candidate !== "object" || candidate === null) return null;
  const raw = candidate as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id : typeof raw.user_id === "string" ? raw.user_id : "";
  if (!id) return null;
  return {
    id,
    email: typeof raw.email === "string" ? raw.email : undefined,
    name: typeof raw.name === "string" ? raw.name : undefined,
  };
};

type AuthMiddlewareContext = Parameters<typeof authMiddleware>[0];
type AuthMiddlewareNext = Parameters<typeof authMiddleware>[1];

const authWithJwtOrSession = async (c: AuthMiddlewareContext, next: AuthMiddlewareNext) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const jwtSecret = getJwtSecret(c.env);
    if (!jwtSecret) {
      return c.json({ error: "JWT auth is not configured. Set JWT_SECRET." }, 500);
    }

    const token = authHeader.slice("Bearer ".length).trim();
    try {
      const payload = await verify(token, jwtSecret);
      const userCandidate = normalizeJwtUser((payload as Record<string, unknown>).user ?? payload);
      if (!userCandidate) {
        return c.json({ error: "Invalid JWT payload" }, 401);
      }
      // `authMiddleware` types `user` as a Mocha session user. For JWT mode we only need an id/email/name.
      (c as any).set("user", userCandidate);
      await next();
      return;
    } catch {
      return c.json({ error: "Invalid or expired JWT token" }, 401);
    }
  }

  return authMiddleware(c, next);
};

const issueJwtForUser = async (env: Env, user: JwtUser) => {
  const jwtSecret = getJwtSecret(env);
  if (!jwtSecret) {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 7 * 24 * 60 * 60;
  const payload = {
    user,
    iat: now,
    exp,
  };
  const token = await sign(payload, jwtSecret);
  return { token, expiresAt: exp };
};

const mapWeatherConditionFromId = (id: number): "sunny" | "cloudy" | "rainy" | "snowy" | "stormy" => {
  if (id >= 200 && id < 300) return "stormy";
  if (id >= 300 && id < 600) return "rainy";
  if (id >= 600 && id < 700) return "snowy";
  if (id === 800) return "sunny";
  return "cloudy";
};

const getBestTimeToVisit = (city: string) => ({
  months: ["October", "November", "December", "January", "February"],
  summary: `The best time to visit ${city} is from October to February when the weather is pleasant and ideal for travel.`,
  tips: [
    `Check local weather conditions before planning your trip to ${city}`,
    "Winter months typically offer the best weather for sightseeing",
    "Consider local festivals and events while planning your visit",
    "Book accommodations in advance during peak season",
  ],
  avoid: [
    "Peak summer months with extreme temperatures",
    "Monsoon season if you prefer dry weather",
    "Crowded tourist seasons if you prefer quieter visits",
  ],
});

const CITY_TO_PRIMARY_STATION: Record<string, string> = {
  agra: "AGC",
  ahmedabad: "ADI",
  ajmer: "AII",
  amritsar: "ASR",
  andheri: "ADH",
  bengaluru: "SBC",
  bangalore: "SBC",
  bhopal: "BPL",
  chandigarh: "CDG",
  chennai: "MAS",
  coimbatore: "CBE",
  dadar: "DR",
  dehradun: "DDN",
  delhi: "NDLS",
  gwalior: "GWL",
  goa: "MAO",
  guwahati: "GHY",
  hyderabad: "SC",
  indore: "INDB",
  jaipur: "JP",
  jammu: "JAT",
  kanpur: "CNB",
  kochi: "ERS",
  kolkata: "HWH",
  lucknow: "LKO",
  "mumbai central": "MMCT",
  mumbai: "CSMT",
  mysore: "MYS",
  nagpur: "NGP",
  nashik: "NK",
  patna: "PNBE",
  pune: "PUNE",
  raipur: "R",
  ranchi: "RNC",
  surat: "ST",
  thane: "TNA",
  tirupati: "TPTY",
  trivandrum: "TVC",
  udaipur: "UDZ",
  vadodara: "BRC",
  varanasi: "BSB",
  vijayawada: "BZA",
  visakhapatnam: "VSKP",
};

const getRapidApiConfig = (env: Env) => {
  const processEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  const key =
    env.RAILWAY_RAPIDAPI_KEY ||
    processEnv?.RAILWAY_RAPIDAPI_KEY ||
    env.RAPIDAPI_KEY ||
    processEnv?.RAPIDAPI_KEY;
  const host =
    env.RAILWAY_RAPIDAPI_HOST ||
    processEnv?.RAILWAY_RAPIDAPI_HOST ||
    env.RAPIDAPI_HOST ||
    processEnv?.RAPIDAPI_HOST ||
    "irctc1.p.rapidapi.com";
  return { key, host };
};

const getIndianRailApiConfig = (env: Env) => {
  const processEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  const key = env.INDIANRAILAPI_KEY || processEnv?.INDIANRAILAPI_KEY;
  const baseUrl =
    env.INDIANRAILAPI_BASE_URL ||
    processEnv?.INDIANRAILAPI_BASE_URL ||
    "https://indianrailapi.com/api/v2";
  return { key, baseUrl };
};

const isLikelyStationCode = (value: string) => /^[A-Za-z]{2,5}$/.test(value.trim());

const extractArrayFromUnknown = (input: unknown): Record<string, unknown>[] => {
  if (Array.isArray(input)) {
    return input.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
  }
  if (typeof input === "object" && input !== null) {
    const obj = input as Record<string, unknown>;
    for (const key of ["data", "result", "results", "stations", "trains", "trainList", "Station", "Trains", "Fares"]) {
      const candidate = obj[key];
      if (Array.isArray(candidate)) {
        return candidate.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
      }
    }
  }
  return [];
};

const formatDateYYYYMMDD = (inputDate?: string): string => {
  const base = inputDate ? new Date(inputDate) : new Date();
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, "0");
  const d = String(base.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
};

const resolveStationCode = async (cityOrCode: string, key: string, host: string): Promise<string | null> => {
  const raw = cityOrCode.trim();
  if (!raw) return null;
  if (isLikelyStationCode(raw)) return raw.toUpperCase();

  const normalizedCity = raw.toLowerCase().replace(/\s+/g, " ").trim();
  const mapped = CITY_TO_PRIMARY_STATION[normalizedCity];
  if (mapped) return mapped;

  // Provider-hosted station search isn't consistently available across hosts.
  // We rely on static mapping and direct station-code input support.
  const searchUrl = new URL(`https://${host}/api/v3/searchStation`);
  searchUrl.searchParams.set("query", raw);

  const response = await fetch(searchUrl.toString(), {
    method: "GET",
    headers: {
      "x-rapidapi-key": key,
      "x-rapidapi-host": host,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  const stations = extractArrayFromUnknown(payload);
  if (stations.length === 0) return null;

  const top = stations[0];
  const code = top.stationCode || top.station_code || top.code;
  return typeof code === "string" ? code.toUpperCase() : null;
};

const resolveStationCodeIndian = async (
  cityOrCode: string,
  apiKey: string,
  baseUrl: string
): Promise<string | null> => {
  const raw = cityOrCode.trim();
  if (!raw) return null;
  if (isLikelyStationCode(raw)) return raw.toUpperCase();

  const normalizedCity = raw.toLowerCase().replace(/\s+/g, " ").trim();
  const mapped = CITY_TO_PRIMARY_STATION[normalizedCity];
  if (mapped) return mapped;

  const url = `${baseUrl}/AutoCompleteStation/apikey/${encodeURIComponent(apiKey)}/StationCodeOrName/${encodeURIComponent(raw)}/`;
  const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!response.ok) return null;

  const payload = await response.json() as Record<string, unknown>;
  const stationsRaw = payload.Station;
  const stations = Array.isArray(stationsRaw) ? stationsRaw : [];
  const first = stations.find((s): s is Record<string, unknown> => typeof s === "object" && s !== null);
  if (!first) return null;
  const code = first.StationCode ?? first.stationCode ?? first.code;
  return typeof code === "string" ? code.toUpperCase() : null;
};

interface NormalizedTrainResult {
  trainNumber: string;
  trainName: string;
  trainType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableClasses: string[];
  estimatedFare?: number;
}

interface FetchTrainOptionsResult {
  error?: string;
  providerError?: string;
  statusCode?: number;
  fromCode: string | null;
  toCode: string | null;
  trains: NormalizedTrainResult[];
}

const TRAIN_CACHE_TTL_MS = 2 * 60 * 1000;
const TRAIN_RATE_LIMIT_CACHE_TTL_MS = 45 * 1000;
const trainOptionsCache = new Map<string, { expiresAt: number; value: FetchTrainOptionsResult }>();

const normalizeTrainResult = (row: Record<string, unknown>): NormalizedTrainResult | null => {
  const trainNumber = String(
    row.trainNumber ?? row.trainNo ?? row.train_number ?? row.TrainNo ?? row.TrainNumber ?? ""
  ).trim();
  const trainName = String(
    row.trainName ?? row.train_name ?? row.name ?? row.TrainName ?? ""
  ).trim();
  if (!trainNumber || !trainName) return null;

  const classSource = row.availableClasses ?? row.classType ?? row.available_classes ?? row.Classes ?? [];
  const availableClasses = Array.isArray(classSource)
    ? classSource.map((item) => String(item)).filter(Boolean)
    : String(classSource || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return {
    trainNumber,
    trainName,
    trainType: String(row.trainType ?? row.train_type ?? row.TrainType ?? "Express").trim() || "Express",
    departureTime: String(
      row.departureTime ?? row.fromStd ?? row.from_std ?? row.DepartureTime ?? row.FromDepTime ?? row.departure ?? "--:--"
    ),
    arrivalTime: String(
      row.arrivalTime ?? row.toSta ?? row.to_sta ?? row.ArrivalTime ?? row.ToArrTime ?? row.arrival ?? "--:--"
    ),
    duration: String(row.duration ?? row.travelTime ?? row.travel_time ?? row.TravelTime ?? "--"),
    availableClasses,
  };
};

const fetchTrainOptionsFromRapidApi = async (
  fromInput: string,
  toInput: string,
  env: Env,
  limit: number,
  journeyDate: string
): Promise<FetchTrainOptionsResult> => {
  const rapid = getRapidApiConfig(env);
  if (!rapid.key) {
    return {
      error: "RAILWAY_RAPIDAPI_KEY is missing",
      statusCode: 500,
      trains: [],
      fromCode: null,
      toCode: null,
    };
  }

  const [fromCode, toCode] = await Promise.all([
    resolveStationCode(fromInput, rapid.key, rapid.host),
    resolveStationCode(toInput, rapid.key, rapid.host),
  ]);

  if (!fromCode || !toCode) {
    return {
      error: "Unable to resolve station code from city name",
      statusCode: 400,
      trains: [],
      fromCode,
      toCode,
    };
  }

  const trainsUrl = new URL(`https://${rapid.host}/api/v3/trainBetweenStations`);
  trainsUrl.searchParams.set("fromStationCode", fromCode);
  trainsUrl.searchParams.set("toStationCode", toCode);
  trainsUrl.searchParams.set("dateOfJourney", journeyDate);

  const response = await fetch(trainsUrl.toString(), {
    method: "GET",
    headers: {
      "x-rapidapi-key": rapid.key,
      "x-rapidapi-host": rapid.host,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const providerError = await response.text();
    const rateLimitMessage =
      response.status === 429
        ? "IRCTC provider rate limit reached. Please retry in a minute."
        : `IRCTC provider failed: ${response.status}`;
    return {
      error: rateLimitMessage,
      providerError,
      statusCode: response.status,
      trains: [],
      fromCode,
      toCode,
    };
  }

  const payload = await response.json();
  const rows = extractArrayFromUnknown(payload);
  const trains = rows
    .map(normalizeTrainResult)
    .filter((item): item is NormalizedTrainResult => item !== null)
    .slice(0, limit);

  return { trains, fromCode, toCode };
};

const fetchTrainOptionsFromIndianRailApi = async (
  fromInput: string,
  toInput: string,
  env: Env,
  limit: number,
  journeyDate: string
): Promise<FetchTrainOptionsResult> => {
  const indian = getIndianRailApiConfig(env);
  if (!indian.key) {
    return {
      error: "INDIANRAILAPI_KEY is missing",
      statusCode: 500,
      trains: [],
      fromCode: null,
      toCode: null,
    };
  }

  const [fromCode, toCode] = await Promise.all([
    resolveStationCodeIndian(fromInput, indian.key, indian.baseUrl),
    resolveStationCodeIndian(toInput, indian.key, indian.baseUrl),
  ]);

  if (!fromCode || !toCode) {
    return {
      error: "Unable to resolve station code from city name",
      statusCode: 400,
      trains: [],
      fromCode,
      toCode,
    };
  }

  const trainEndpointCandidates = [
    `${indian.baseUrl}/TrainBetweenStation/apikey/${encodeURIComponent(indian.key)}/From/${encodeURIComponent(fromCode)}/To/${encodeURIComponent(toCode)}/Date/${journeyDate}/`,
    `${indian.baseUrl}/TrainBetweenStation/apikey/${encodeURIComponent(indian.key)}/From/${encodeURIComponent(fromCode)}/To/${encodeURIComponent(toCode)}/`,
  ];

  let trainsPayload: Record<string, unknown> | null = null;
  let lastErrorBody = "";
  let lastStatus = 502;

  for (const endpoint of trainEndpointCandidates) {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      lastStatus = response.status;
      lastErrorBody = await response.text();
      continue;
    }
    trainsPayload = (await response.json()) as Record<string, unknown>;
    break;
  }

  if (!trainsPayload) {
    return {
      error: `IndianRailAPI provider failed: ${lastStatus}`,
      providerError: lastErrorBody,
      statusCode: lastStatus,
      trains: [],
      fromCode,
      toCode,
    };
  }

  const rows = extractArrayFromUnknown(trainsPayload);
  const trains = rows
    .map(normalizeTrainResult)
    .filter((item): item is NormalizedTrainResult => item !== null)
    .slice(0, limit);

  // Enrich with classes/fare using TrainFare endpoint for top results
  await Promise.all(
    trains.map(async (train) => {
      try {
        const fareUrl = `${indian.baseUrl}/TrainFare/apikey/${encodeURIComponent(indian.key!)}/TrainNumber/${encodeURIComponent(train.trainNumber)}/From/${encodeURIComponent(fromCode)}/To/${encodeURIComponent(toCode)}/Quota/GN`;
        const fareRes = await fetch(fareUrl, { method: "GET", headers: { Accept: "application/json" } });
        if (!fareRes.ok) return;
        const farePayload = (await fareRes.json()) as Record<string, unknown>;
        const fareRows = extractArrayFromUnknown(farePayload);
        if (fareRows.length === 0) return;

        const classes = fareRows
          .map((row) => String(row.Code ?? row.code ?? "").trim())
          .filter(Boolean);
        if (classes.length > 0) {
          train.availableClasses = Array.from(new Set([...train.availableClasses, ...classes]));
        }

        const fares = fareRows
          .map((row) => Number(row.Fare ?? row.fare))
          .filter((value) => Number.isFinite(value) && value > 0);
        if (fares.length > 0) {
          train.estimatedFare = Math.min(...fares);
        }
      } catch {
        // Non-blocking enrichment
      }
    })
  );

  return { trains, fromCode, toCode };
};

const fetchTrainOptions = async (
  fromInput: string,
  toInput: string,
  env: Env,
  limit = 5,
  dateOfJourney?: string
): Promise<FetchTrainOptionsResult> => {
  const journeyDate = formatDateYYYYMMDD(dateOfJourney);
  const hasIndianKey = Boolean(getIndianRailApiConfig(env).key);
  const provider = hasIndianKey ? "indianrailapi" : "rapidapi";
  const cacheKey = `${provider}::${fromInput.trim().toLowerCase()}::${toInput.trim().toLowerCase()}::${journeyDate}::${limit}`;
  const cached = trainOptionsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const result = hasIndianKey
    ? await fetchTrainOptionsFromIndianRailApi(fromInput, toInput, env, limit, journeyDate)
    : await fetchTrainOptionsFromRapidApi(fromInput, toInput, env, limit, dateOfJourney || new Date().toISOString().slice(0, 10));

  const ttl = result.error ? TRAIN_RATE_LIMIT_CACHE_TTL_MS : TRAIN_CACHE_TTL_MS;
  trainOptionsCache.set(cacheKey, {
    expiresAt: Date.now() + ttl,
    value: result,
  });
  return result;
};

// Auth endpoints
app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });
  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();
  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60,
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authWithJwtOrSession, async (c) => {
  return c.json(c.get("user"));
});

app.post("/api/auth/token", authWithJwtOrSession, async (c) => {
  const user = normalizeJwtUser(c.get("user"));
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const issued = await issueJwtForUser(c.env, user);
  if (!issued) {
    return c.json({ error: "JWT_SECRET is not configured" }, 500);
  }

  return c.json({
    token: issued.token,
    tokenType: "Bearer",
    expiresAt: issued.expiresAt,
    user,
  });
});

app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);
  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Cities endpoint
app.get("/api/cities", async (c) => {
  const search = c.req.query("search") || "";
  
  // Enhanced search with partial matching and case-insensitive matching
  const filtered = INDIAN_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(search.toLowerCase()) ||
      city.state.toLowerCase().includes(search.toLowerCase()) ||
      // Partial match in name (e.g., "Mum" matches "Mumbai")
      city.name.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
      // Partial match in state
      city.state.toLowerCase().indexOf(search.toLowerCase()) !== -1
  );
  
  return c.json(filtered);
});

// Routes endpoint
app.get("/api/routes", async (c) => {
  const from = c.req.query("from");
  const to = c.req.query("to");
  const date = c.req.query("date") || undefined;

  if (!from || !to) {
    return c.json({ error: "Missing from or to parameter" }, 400);
  }

  const baseRoutes = generateRoutes(from, to);
  const nonTrainRoutes = baseRoutes.filter((route) => route.mode !== "train");

  // Use mock train data instead of real API calls
  console.log(`[ROUTES API] Fetching mock trains for ${from} to ${to}`);
  const mockTrains = getMockTrainsForRoute(from, to, 3);
  
  const trainResult = {
    trains: mockTrains,
    fromCode: from.toUpperCase(),
    toCode: to.toUpperCase(),
  };
  
  const trainRoutes = trainResult.trains.map((train, index) => ({
    id: `train-mock-${index + 1}-${train.trainNumber}-${trainResult.fromCode}-${trainResult.toCode}`,
    mode: "train" as const,
    operator: `${train.trainName} - Indian Railways`,
    number: train.trainNumber,
    departure: train.departureTime,
    arrival: train.arrivalTime,
    duration: train.duration,
    price: train.estimatedFare ?? 450 + index * 120,
    availableClasses: train.availableClasses,
    availability:
      train.availableClasses.length > 0
        ? `Classes: ${train.availableClasses.slice(0, 3).join(", ")}`
        : "Check IRCTC for latest availability",
    steps: [
      `Board train ${train.trainNumber} from ${from} (${trainResult.fromCode})`,
      `Travel to ${to} (${trainResult.toCode}) by Indian Railways`,
      "Estimated fare - check IRCTC for actual fares and booking",
    ],
  }));

  const unavailableTrainCard = {
    id: `train-unavailable-${from}-${to}`,
    mode: "train" as const,
    operator: "Indian Railways",
    number: "N/A",
    departure: "--:--",
    arrival: "--:--",
    duration: "N/A",
    price: 0,
    availableClasses: [] as string[],
    availability: "Not Available",
    steps: [
      `No trains found from ${from} to ${to}.`,
      "Try another route or check IRCTC official website.",
      "You can still continue with bus/car options below.",
    ],
  };

  const finalTrainRoutes = trainRoutes.length > 0 ? trainRoutes : [unavailableTrainCard];
  console.log(`[ROUTES API] Returning ${finalTrainRoutes.length} train options`);
  return c.json([...finalTrainRoutes, ...nonTrainRoutes]);
});
// Real train search endpoint - NOW USING MOCK DATA + AI
app.get("/api/trains", async (c) => {
  const from = c.req.query("from");
  const to = c.req.query("to");
  const limit = Number(c.req.query("limit") || "6");
  const date = c.req.query("date") || undefined;

  console.log(`[TRAIN API] Request received: from=${from}, to=${to}, limit=${limit}`);

  if (!from || !to) {
    console.error('[TRAIN API] Missing from or to parameter');
    return c.json({ error: "Missing from or to parameter" }, 400);
  }

  // Use mock data instead of real API calls
  // Mock data includes popular routes and generic trains
  console.log(`[TRAIN API] Calling getMockTrainsForRoute with from=${from}, to=${to}`);
  const mockTrains = getMockTrainsForRoute(from, to, limit);
  
  console.log(`[TRAIN API] Found ${mockTrains.length} trains`);
  
  if (mockTrains.length === 0) {
    console.warn('[TRAIN API] No trains found for this route');
    return c.json({
      error: "No trains found for this route",
      fromStationCode: from.toUpperCase(),
      toStationCode: to.toUpperCase(),
      trains: [],
    });
  }

  return c.json({
    fromStationCode: from.toUpperCase(),
    toStationCode: to.toUpperCase(),
    trains: mockTrains,
  });
});

// Helper function to get mock trains for a route
const getMockTrainsForRoute = (from: string, to: string, limit: number): any[] => {
  // Convert city names to station codes
  const fromCode = CITY_TO_PRIMARY_STATION[from.toLowerCase()] || from.toUpperCase().slice(0, 4);
  const toCode = CITY_TO_PRIMARY_STATION[to.toLowerCase()] || to.toUpperCase().slice(0, 4);
  
  const routeKey = `${fromCode}-${toCode}`;
  const reverseRouteKey = `${toCode}-${fromCode}`;
  
  // Popular trains database (same as in railwayAPI.ts)
  const POPULAR_TRAINS: Record<string, any[]> = {
    'NDLS-CSTM': [
      { trainNumber: '12952', trainName: 'Mumbai Rajdhani', trainType: 'RAJDHANI', departureTime: '16:55', arrivalTime: '08:35', duration: '15:40', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['1A', '2A', '3A'], estimatedFare: 2500 },
      { trainNumber: '12954', trainName: 'August Kranti Rajdhani', trainType: 'RAJDHANI', departureTime: '17:20', arrivalTime: '09:55', duration: '16:35', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['1A', '2A', '3A'], estimatedFare: 2400 },
      { trainNumber: '12138', trainName: 'Punjab Mail', trainType: 'MAIL/EXPRESS', departureTime: '05:05', arrivalTime: '07:00', duration: '25:55', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '3A', '2A', '1A'], estimatedFare: 850 },
      { trainNumber: '12926', trainName: 'Paschim Express', trainType: 'SUPERFAST', departureTime: '17:45', arrivalTime: '14:30', duration: '20:45', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '3A', '2A'], estimatedFare: 720 },
    ],
    'NDLS-HWH': [
      { trainNumber: '12302', trainName: 'Howrah Rajdhani', trainType: 'RAJDHANI', departureTime: '16:50', arrivalTime: '09:55', duration: '17:05', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['1A', '2A', '3A'], estimatedFare: 2800 },
      { trainNumber: '12314', trainName: 'Sealdah Rajdhani', trainType: 'RAJDHANI', departureTime: '16:30', arrivalTime: '10:05', duration: '17:35', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['1A', '2A', '3A'], estimatedFare: 2750 },
      { trainNumber: '12382', trainName: 'Poorva Express', trainType: 'SUPERFAST', departureTime: '15:50', arrivalTime: '16:25', duration: '24:35', runningDays: ['Mon', 'Wed', 'Fri', 'Sun'], availableClasses: ['SL', '3A', '2A', '1A'], estimatedFare: 890 },
    ],
    'CSTM-SBC': [
      { trainNumber: '11302', trainName: 'Udyan Express', trainType: 'MAIL/EXPRESS', departureTime: '08:05', arrivalTime: '07:30', duration: '23:25', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '3A', '2A'], estimatedFare: 950 },
      { trainNumber: '16529', trainName: 'Bangalore Express', trainType: 'EXPRESS', departureTime: '20:40', arrivalTime: '22:05', duration: '25:25', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '3A', '2A'], estimatedFare: 880 },
    ],
    'MAS-NDLS': [
      { trainNumber: '12434', trainName: 'Chennai Rajdhani', trainType: 'RAJDHANI', departureTime: '17:45', arrivalTime: '09:30', duration: '15:45', runningDays: ['Mon', 'Wed', 'Fri'], availableClasses: ['1A', '2A', '3A'], estimatedFare: 3200 },
      { trainNumber: '12616', trainName: 'Grand Trunk Express', trainType: 'MAIL/EXPRESS', departureTime: '07:10', arrivalTime: '06:55', duration: '23:45', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '3A', '2A', '1A'], estimatedFare: 920 },
    ],
  };

  // Check if we have data for this route
  let trains = POPULAR_TRAINS[routeKey] || POPULAR_TRAINS[reverseRouteKey] || [];
  
  // If reverse route, swap times
  if (POPULAR_TRAINS[reverseRouteKey]) {
    trains = trains.map(train => ({
      ...train,
      departureTime: train.arrivalTime,
      arrivalTime: train.departureTime,
    }));
  }
  
  // If no specific trains, return generic ones
  if (trains.length === 0) {
    trains = [
      { trainNumber: '12XXX', trainName: 'Express Special', trainType: 'SUPERFAST', departureTime: '06:00', arrivalTime: '18:00', duration: '12:00', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '3A', '2A'], estimatedFare: 650 },
      { trainNumber: '14XXX', trainName: 'Passenger Fast', trainType: 'MAIL/EXPRESS', departureTime: '08:30', arrivalTime: '22:30', duration: '14:00', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], availableClasses: ['SL', '2S'], estimatedFare: 420 },
      { trainNumber: '22XXX', trainName: 'Superfast Express', trainType: 'SUPERFAST', departureTime: '15:45', arrivalTime: '05:45', duration: '14:00', runningDays: ['Mon', 'Wed', 'Fri', 'Sun'], availableClasses: ['SL', '3A', '2A'], estimatedFare: 780 },
    ];
  }
  
  // Add disclaimer message
  return trains.slice(0, limit).map(train => ({
    ...train,
    disclaimer: 'Estimated fare. Check IRCTC for actual fares and booking.',
  }));
};

// Attractions endpoint
app.get("/api/attractions", async (c) => {
  const city = c.req.query("city")?.toLowerCase();
  const preference = c.req.query("preference") as UserPreference || "solo";
  const category = c.req.query("category");
  const sortBy = c.req.query("sortBy") || "recommended"; // recommended, rating, name
  
  let filtered = ATTRACTIONS;
  
  if (city) {
    filtered = ATTRACTIONS.filter(
      (attraction) => attraction.city.toLowerCase() === city
    );
  }

  // Apply AI-based recommendations if requested
  if (sortBy === "recommended") {
    filtered = RecommendationService.getRecommendations(filtered, preference, category);
  } else if (sortBy === "rating") {
    // Sort by rating (high to low)
    filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    if (category) {
      filtered = filtered.filter(attraction => 
        attraction.category.toLowerCase().includes(category.toLowerCase())
      );
    }
  } else {
    // Sort alphabetically by name
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (category) {
      filtered = filtered.filter(attraction => 
        attraction.category.toLowerCase().includes(category.toLowerCase())
      );
    }
  }

  return c.json(filtered);
});

// Accommodations endpoint - Real API with fallback
app.get("/api/accommodations", async (c) => {
  const city = c.req.query("city")?.toLowerCase();
  
  console.log(`[ACCOMMODATIONS API] Request received for city: ${city}`);
  
  if (!city) {
    console.log(`[ACCOMMODATIONS API] No city specified, returning all ${ACCOMMODATIONS.length} accommodations`);
    return c.json(ACCOMMODATIONS);
  }

  try {
    // Try to get destination ID from Hotels.com API
    console.log(`[ACCOMMODATIONS API] Searching destination ID for: ${city}`);
    const destinationId = await getDestinationId(city);
    
    if (destinationId) {
      console.log(`[ACCOMMODATIONS API] Found destination ID: ${destinationId}`);
      
      // Get today's date and checkout date (3 days later)
      const checkInDate = new Date().toISOString().split('T')[0];
      const checkOutDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      console.log(`[ACCOMMODATIONS API] Fetching hotels for check-in: ${checkInDate}, check-out: ${checkOutDate}`);
      
      // Search for hotels
      const hotels = await searchHotels(destinationId, checkInDate, checkOutDate, 2, 1);
      
      if (hotels && hotels.length > 0) {
        console.log(`[ACCOMMODATIONS API] Found ${hotels.length} real hotels for ${city}`);
        
        // Convert HotelData to Accommodation format
        const accommodations = hotels.map(hotel => ({
          id: hotel.id,
          name: hotel.name,
          city: city.charAt(0).toUpperCase() + city.slice(1), // Capitalize city name
          description: hotel.description,
          image: hotel.image,
          rating: hotel.rating,
          price: hotel.price,
          reviews: hotel.reviews,
          bookingUrl: hotel.bookingUrl,
          coordinates: hotel.coordinates,
        }));
        
        return c.json(accommodations);
      }
    }
    
    console.log(`[ACCOMMODATIONS API] Could not get real hotels, falling back to mock data`);
  } catch (error) {
    console.error(`[ACCOMMODATIONS API] Error fetching real hotels:`, error);
  }
  
  // Fallback to mock data
  const filtered = ACCOMMODATIONS.filter(
    (accommodation) => {
      const match = accommodation.city.toLowerCase() === city;
      console.log(`[ACCOMMODATIONS API] Checking "${accommodation.city}" against "${city}": ${match}`);
      return match;
    }
  );
  
  console.log(`[ACCOMMODATIONS API] Found ${filtered.length} mock accommodations for ${city}`);
  return c.json(filtered);
});

// Restaurants endpoint
app.get("/api/restaurants", async (c) => {
  const city = c.req.query("city")?.toLowerCase();
  const cuisine = c.req.query("cuisine")?.toLowerCase();
  const dietary = c.req.query("dietary")?.toLowerCase();
  
  let filtered = [...RESTAURANTS];

  if (city) {
    filtered = filtered.filter(
      (restaurant) => restaurant.city.toLowerCase() === city
    );
  }

  if (cuisine) {
    filtered = filtered.filter(
      (restaurant) => restaurant.cuisine.toLowerCase().includes(cuisine)
    );
  }

  if (dietary) {
    filtered = filtered.filter(
      (restaurant) => restaurant.dietary.some(d => d.toLowerCase().includes(dietary))
    );
  }

  return c.json(filtered);
});

// AI Itinerary endpoint
app.post("/api/itinerary", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = ItineraryRequestSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        {
          error: "Invalid itinerary request",
          details: parsed.error.issues,
        },
        400
      );
    }
    const validated = parsed.data;

    // Resolve API keys from worker bindings, then local Node env (dev fallback)
    const processEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
    const nvidiaApiKeyRaw = c.env.NVIDIA_API_KEY || processEnv?.NVIDIA_API_KEY;
    const nvidiaApiKey = nvidiaApiKeyRaw?.replace(/^Bearer\s+/i, "").trim();
    const nvidiaModel = c.env.NVIDIA_MODEL || processEnv?.NVIDIA_MODEL || "google/gemma-3n-e4b-it";
    const nvidiaBaseUrl = (c.env.NVIDIA_BASE_URL || processEnv?.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/+$/, "");

    // Debug logging
    console.log('[ITINERARY API] NVIDIA_API_KEY from c.env:', !!c.env.NVIDIA_API_KEY);
    console.log('[ITINERARY API] NVIDIA_API_KEY from processEnv:', !!processEnv?.NVIDIA_API_KEY);
    console.log('[ITINERARY API] NVIDIA_API_KEY present:', !!nvidiaApiKey);
    console.log('[ITINERARY API] Using model:', nvidiaModel);
    console.log('[ITINERARY API] Using base URL:', nvidiaBaseUrl);

    type PlanSource = "ai" | "repaired" | "fallback";

    const stripCodeFences = (text: string) =>
      text
        .trim()
        .replace(/```(?:json)?/gi, "")
        .replace(/```/g, "")
        .trim();

    const extractFirstJsonObject = (text: string): unknown | null => {
      const cleaned = stripCodeFences(text);
      if (!cleaned) return null;

      // Fast-path: whole string is a JSON object.
      if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
        try {
          return JSON.parse(cleaned);
        } catch {
          // continue to scanning path below
        }
      }

      let startIndex = -1;
      let depth = 0;
      let inString = false;
      let escaping = false;

      for (let i = 0; i < cleaned.length; i++) {
        const ch = cleaned[i];

        if (startIndex === -1) {
          if (ch === "{") {
            startIndex = i;
            depth = 1;
            inString = false;
            escaping = false;
          }
          continue;
        }

        if (inString) {
          if (escaping) {
            escaping = false;
            continue;
          }
          if (ch === "\\") {
            escaping = true;
            continue;
          }
          if (ch === "\"") {
            inString = false;
          }
          continue;
        }

        if (ch === "\"") {
          inString = true;
          continue;
        }
        if (ch === "{") {
          depth++;
          continue;
        }
        if (ch === "}") {
          depth--;
          if (depth === 0) {
            const candidate = cleaned.slice(startIndex, i + 1);
            try {
              return JSON.parse(candidate);
            } catch {
              // Keep scanning for another JSON object later in the text.
              startIndex = -1;
              depth = 0;
              inString = false;
              escaping = false;
            }
          }
        }
      }

      return null;
    };

    const dayCostForBudget = (budget: "low" | "medium" | "luxury") =>
      budget === "low" ? 1000 : budget === "medium" ? 2500 : 5000;

    const buildFallbackPlan = (): TravelPlan => {
      const cityLower = validated.city.trim().toLowerCase();
      const attractionsForCity = ATTRACTIONS.filter((a) => a.city.toLowerCase() === cityLower);
      const restaurantsForCity = RESTAURANTS.filter((r) => r.city.toLowerCase() === cityLower);

      const attractionsPool = (attractionsForCity.length ? attractionsForCity : ATTRACTIONS)
        .slice()
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10);

      const restaurantsPool = (restaurantsForCity.length ? restaurantsForCity : RESTAURANTS)
        .slice()
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10);

      const mappedAttractions = attractionsPool.map((a) => ({
        name: a.name,
        description: a.description,
        location: { lat: a.coordinates.lat, lng: a.coordinates.lng },
        rating: a.rating,
      }));

      const mappedRestaurants = restaurantsPool.map((r) => ({
        name: r.name,
        cuisine: r.cuisine,
        priceRange: r.priceRange,
        location: { lat: r.coordinates.lat, lng: r.coordinates.lng },
        rating: r.rating,
      }));

      const perDayCost = dayCostForBudget(validated.budget);
      const itinerary = Array.from({ length: validated.days }, (_, idx) => {
        const day = idx + 1;
        const a1 = mappedAttractions[idx % mappedAttractions.length];
        const a2 = mappedAttractions[(idx * 2 + 1) % mappedAttractions.length];
        const a3 = mappedAttractions[(idx * 3 + 2) % mappedAttractions.length];
        const r1 = mappedRestaurants[idx % mappedRestaurants.length];
        const r2 = mappedRestaurants[(idx + 2) % mappedRestaurants.length];

        const morningPlace = a1?.name || "City Walk";
        const afternoonPlace = a2?.name || "Local Landmark";
        const eveningPlace = a3?.name || "Market & Dinner";

        return {
          day,
          title: `Explore ${validated.city} (Day ${day})`,
          activities: [
            `Morning: Visit ${morningPlace}`,
            `Afternoon: Explore ${afternoonPlace}`,
            `Evening: ${eveningPlace} + local dinner`,
          ],
          attractions: [morningPlace, afternoonPlace, eveningPlace].filter(Boolean),
          restaurants: [r1?.name, r2?.name].filter(Boolean) as string[],
          morning: {
            place: morningPlace,
            description: a1?.description || "Start your day with a popular local highlight.",
          },
          afternoon: {
            place: afternoonPlace,
            travelTime: "30-45 minutes",
          },
          evening: {
            place: eveningPlace,
            activity: "Leisure time, shopping, and dinner.",
          },
          estimatedCost: perDayCost,
        };
      });

      const interestText = validated.interests.length ? validated.interests.join(", ") : "sightseeing";
      const summary = `A ${validated.days}-day trip to ${validated.city} focused on ${interestText}.`;
      const travelTips = [
        "Start early to avoid crowds and heat.",
        "Keep small cash for local transport and snacks.",
        "Use sunscreen and stay hydrated.",
        "Plan 1–2 buffer hours each day for traffic and queues.",
        "Try local cuisine but choose busy, well-reviewed places.",
        "Carry a light jacket or umbrella depending on season.",
      ];

      return {
        summary,
        totalCost: perDayCost * validated.days,
        bestTimeToVisit: "October to March (generally pleasant weather in most Indian cities).",
        travelTips,
        attractions: mappedAttractions,
        restaurants: mappedRestaurants,
        itinerary,
      };
    };

    const normalizePlanForDays = (plan: TravelPlan): { plan: TravelPlan; changed: boolean } => {
      let changed = false;
      const expected = validated.days;

      let itinerary = Array.isArray(plan.itinerary) ? plan.itinerary.slice() : [];
      if (itinerary.length !== expected) {
        changed = true;
        const fallback = buildFallbackPlan().itinerary;
        itinerary = itinerary.slice(0, expected);
        while (itinerary.length < expected) {
          itinerary.push(fallback[itinerary.length]);
        }
      }

      itinerary = itinerary.map((dayEntry, idx) => {
        const dayNumber = idx + 1;
        const out = {
          ...dayEntry,
          day: Number.isFinite(dayEntry.day) ? dayEntry.day : dayNumber,
          title: dayEntry.title || `Day ${dayNumber}`,
          activities: Array.isArray(dayEntry.activities) ? dayEntry.activities : [],
          attractions: Array.isArray(dayEntry.attractions) ? dayEntry.attractions : [],
          restaurants: Array.isArray(dayEntry.restaurants) ? dayEntry.restaurants : [],
        };
        if (out.day !== dayNumber) changed = true;
        out.day = dayNumber;
        return out;
      });

      const perDayFallback = dayCostForBudget(validated.budget);
      const computedTotal = itinerary.reduce(
        (sum, dayEntry) => sum + (typeof dayEntry.estimatedCost === "number" ? dayEntry.estimatedCost : perDayFallback),
        0
      );
      const totalCost = typeof plan.totalCost === "number" && Number.isFinite(plan.totalCost) ? plan.totalCost : computedTotal;
      if (totalCost !== plan.totalCost) changed = true;

      return {
        plan: {
          ...plan,
          itinerary,
          totalCost,
        },
        changed,
      };
    };

    const callNvidiaChat = async (messages: Array<{ role: "system" | "user"; content: string }>) => {
      const res = await fetch(`${nvidiaBaseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${nvidiaApiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          model: nvidiaModel,
          messages,
          max_tokens: 4096,
          temperature: 0.6,
          top_p: 0.9,
          frequency_penalty: 0.3,
          presence_penalty: 0.3,
          stream: false,
        }),
      });

      if (!res.ok) {
        const bodyText = await res.text();
        throw new Error(`NVIDIA API error: ${res.status} ${bodyText.slice(0, 160)}`);
      }

      const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      return payload.choices?.[0]?.message?.content?.trim() || "";
    };

    const budgetDescription = validated.budget === 'low' 
      ? 'Budget-conscious options with local experiences'
      : validated.budget === 'medium' 
        ? 'Balanced options with good quality accommodations and experiences'
        : 'Premium luxury experiences and high-end accommodations';

    const travelStyleDescription = validated.travelStyle === 'solo' 
      ? 'Solo traveler experience'
      : validated.travelStyle === 'couple' 
        ? 'Romantic couple experience'
        : validated.travelStyle === 'family' 
          ? 'Family-friendly activities suitable for all ages'
          : 'Group experience with activities for friends';

    const interestsDescription = validated.interests.length > 0 
      ? `Focusing on: ${validated.interests.join(', ')}`
      : 'General sightseeing and popular attractions';

    const prompt = `You are an expert India travel planner. Generate a COMPLETE ${validated.days}-day travel itinerary for ${validated.city}.

REQUIREMENTS:
- Budget: ${budgetDescription}
- Style: ${travelStyleDescription}
- Interests: ${interestsDescription}
- Each day MUST have DIFFERENT places, attractions, and restaurants — NO repetition across days
- Use REAL, SPECIFIC place names that actually exist in ${validated.city} (not placeholders)
- Include morning, afternoon, and evening slots for every single day
- Provide estimated costs in INR (numbers only, no ₹ symbol)

OUTPUT FORMAT: Return ONLY a single valid JSON object. No markdown, no code fences, no explanation — just raw JSON.

{
  "summary": "short 2-sentence summary of the overall trip",
  "totalCost": <total INR number>,
  "bestTimeToVisit": "best months to visit ${validated.city}",
  "travelTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "attractions": [
    {"name": "Attraction Name", "description": "1-2 sentence description", "location": {"lat": <number>, "lng": <number>}, "rating": <number 1-5>, "duration": "X hours"}
  ],
  "restaurants": [
    {"name": "Restaurant Name", "cuisine": "cuisine type", "priceRange": "₹500-₹1500 per person", "location": {"lat": <number>, "lng": <number>}, "rating": <number 1-5>}
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "Unique theme for Day 1",
      "morning": {"place": "Specific Place Name", "description": "what to do there"},
      "afternoon": {"place": "Different Specific Place", "travelTime": "20 mins by auto"},
      "evening": {"place": "Another Specific Place", "activity": "specific evening activity"},
      "estimatedCost": <INR number>,
      "activities": ["activity1", "activity2", "activity3"],
      "attractions": ["Place 1", "Place 2"],
      "restaurants": ["Restaurant 1"]
    }
  ]
}

CRITICAL RULES:
- The "itinerary" array must have EXACTLY ${validated.days} entries (day 1 through day ${validated.days})
- Every day must visit DIFFERENT locations — do not repeat the same place on multiple days
- Provide at least 8 unique attractions and 6 unique restaurants for ${validated.city}
- All "lat" and "lng" values must be real approximate coordinates for ${validated.city}
- Respond with ONLY the JSON object, nothing else`;

    let itineraryText = "";
    let planSource: PlanSource = "fallback";
    let plan: TravelPlan | null = null;

    const validatePlan = (value: unknown): TravelPlan | null => {
      const parsedPlan = TravelPlanSchema.safeParse(value);
      if (!parsedPlan.success) return null;
      const normalized = normalizePlanForDays(parsedPlan.data);
      if (normalized.changed && planSource === "ai") {
        planSource = "repaired";
      }
      return normalized.plan;
    };

    // 1) Primary AI attempt (if key configured)
    if (nvidiaApiKey) {
      try {
        itineraryText = await callNvidiaChat([
          {
            role: "system",
            content:
              "You are a travel planner. You must return ONLY valid JSON that matches the requested schema. Do not include markdown fences or extra text.",
          },
          { role: "user", content: prompt },
        ]);
        planSource = "ai";

        const extracted = extractFirstJsonObject(itineraryText);
        plan = validatePlan(extracted);
      } catch (err) {
        console.error("NVIDIA itinerary provider error:", err);
        planSource = "fallback";
      }
    }

    // 2) Repair attempt (once) if AI returned invalid JSON
    if (nvidiaApiKey && planSource === "ai" && !plan && itineraryText) {
      try {
        const repairPrompt = `Convert the following content into STRICT valid JSON only.

Rules:
- Output ONLY JSON (no markdown, no commentary).
- Must match the schema described below.
- Ensure itinerary length is exactly ${validated.days}.

Schema (template):
{
  "summary": "string",
  "totalCost": 0,
  "bestTimeToVisit": "string",
  "travelTips": ["string"],
  "attractions": [{"name":"string","description":"string","location":{"lat":0,"lng":0},"rating":0}],
  "restaurants": [{"name":"string","cuisine":"string","priceRange":"string","location":{"lat":0,"lng":0},"rating":0}],
  "itinerary": [{"day":1,"title":"string","activities":["string"],"attractions":["string"],"restaurants":["string"],"estimatedCost":0}]
}

Content to convert:
${itineraryText}`;

        const repairedText = await callNvidiaChat([
          {
            role: "system",
            content: "You are a formatter. Return ONLY strict JSON. No markdown.",
          },
          { role: "user", content: repairPrompt },
        ]);

        const extracted = extractFirstJsonObject(repairedText);
        const repairedPlan = validatePlan(extracted);
        if (repairedPlan) {
          plan = repairedPlan;
          planSource = "repaired";
          itineraryText = repairedText || itineraryText;
        }
      } catch (err) {
        console.error("NVIDIA itinerary repair failed:", err);
      }
    }

    // 3) Fallback plan (always available)
    if (!plan) {
      plan = buildFallbackPlan();
      planSource = "fallback";
      if (!itineraryText) itineraryText = "";
    }

    return c.json({ plan, itinerary: itineraryText, planSource });
  } catch (error) {
    console.error("AI itinerary error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate itinerary";
    return c.json({ error: message }, 500);
  }
});

// Saved trips endpoints
app.get("/api/trips", async (c) => {
  const userId = resolveRequestUserId(c);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM saved_trips WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(userId)
    .all();

  return c.json(results);
});

app.post("/api/trips", async (c) => {
  const userId = resolveRequestUserId(c);
  const body = await c.req.json();

  const result = await c.env.DB.prepare(
    `INSERT INTO saved_trips (user_id, name, from_city, to_city, travel_mode, route_details, estimated_cost, estimated_duration)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      userId,
      body.name,
      body.from_city,
      body.to_city,
      body.travel_mode,
      body.route_details || null,
      body.estimated_cost || null,
      body.estimated_duration || null
    )
    .run();

  return c.json({ id: result.meta.last_row_id, success: true }, 201);
});

app.delete("/api/trips/:id", async (c) => {
  const userId = resolveRequestUserId(c);
  const id = c.req.param("id");

  await c.env.DB.prepare(
    "DELETE FROM saved_trips WHERE id = ? AND user_id = ?"
  )
    .bind(id, userId)
    .run();

  return c.json({ success: true });
});

// Saved cities endpoints
app.get("/api/saved-cities", async (c) => {
  const userId = resolveRequestUserId(c);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM saved_cities WHERE user_id = ? ORDER BY saved_at DESC"
  )
    .bind(userId)
    .all();

  return c.json(results);
});

app.post("/api/saved-cities", async (c) => {
  const userId = resolveRequestUserId(c);
  const body = await c.req.json();
  
  // Check if city is already saved
  const existing = await c.env.DB.prepare(
    "SELECT id FROM saved_cities WHERE user_id = ? AND city_name = ?"
  )
    .bind(userId, body.city_name)
    .first();
    
  if (existing) {
    return c.json({ error: "City already saved" }, 400);
  }
  
  const result = await c.env.DB.prepare(
    `INSERT INTO saved_cities (user_id, city_name, city_state)
     VALUES (?, ?, ?)`
  )
    .bind(
      userId,
      body.city_name,
      body.city_state
    )
    .run();

  return c.json({ id: result.meta.last_row_id, success: true }, 201);
});

app.delete("/api/saved-cities/:name", async (c) => {
  const userId = resolveRequestUserId(c);
  const cityName = c.req.param("name");

  await c.env.DB.prepare(
    "DELETE FROM saved_cities WHERE city_name = ? AND user_id = ?"
  )
    .bind(cityName, userId)
    .run();

  return c.json({ success: true });
});

// Saved attractions endpoints
app.get("/api/saved-attractions", async (c) => {
  const userId = resolveRequestUserId(c);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM saved_attractions WHERE user_id = ? ORDER BY saved_at DESC"
  )
    .bind(userId)
    .all();

  return c.json(results);
});

app.post("/api/saved-attractions", async (c) => {
  const userId = resolveRequestUserId(c);
  const body = await c.req.json();
  
  // Check if attraction is already saved
  const existing = await c.env.DB.prepare(
    "SELECT id FROM saved_attractions WHERE user_id = ? AND attraction_id = ?"
  )
    .bind(userId, body.attraction_id)
    .first();
    
  if (existing) {
    return c.json({ error: "Attraction already saved" }, 400);
  }
  
  const result = await c.env.DB.prepare(
    `INSERT INTO saved_attractions (user_id, attraction_id, attraction_name, city_name)
     VALUES (?, ?, ?, ?)`
  )
    .bind(
      userId,
      body.attraction_id,
      body.attraction_name,
      body.city_name
    )
    .run();

  return c.json({ id: result.meta.last_row_id, success: true }, 201);
});

app.delete("/api/saved-attractions/:id", async (c) => {
  const userId = resolveRequestUserId(c);
  const attractionId = c.req.param("id");

  await c.env.DB.prepare(
    "DELETE FROM saved_attractions WHERE attraction_id = ? AND user_id = ?"
  )
    .bind(attractionId, userId)
    .run();

  return c.json({ success: true });
});

// Saved itineraries endpoints
app.get("/api/saved-itineraries", async (c) => {
  const userId = resolveRequestUserId(c);
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM saved_itineraries WHERE user_id = ? ORDER BY saved_at DESC"
  )
    .bind(userId)
    .all();

  return c.json(results);
});

app.post("/api/saved-itineraries", async (c) => {
  const userId = resolveRequestUserId(c);
  const body = await c.req.json();
  
  // Check if itinerary is already saved
  const existing = await c.env.DB.prepare(
    "SELECT id FROM saved_itineraries WHERE user_id = ? AND itinerary_name = ?"
  )
    .bind(userId, body.itinerary_name)
    .first();
    
  if (existing) {
    return c.json({ error: "Itinerary already saved" }, 400);
  }
  
  const result = await c.env.DB.prepare(
    `INSERT INTO saved_itineraries (user_id, itinerary_name, city, days, budget, travel_style, interests, itinerary_content)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      userId,
      body.itinerary_name,
      body.city,
      body.days,
      body.budget,
      body.travel_style,
      JSON.stringify(body.interests),
      body.itinerary_content
    )
    .run();

  return c.json({ id: result.meta.last_row_id, success: true }, 201);
});

app.delete("/api/saved-itineraries/:id", async (c) => {
  const userId = resolveRequestUserId(c);
  const itineraryId = c.req.param("id");

  await c.env.DB.prepare(
    "DELETE FROM saved_itineraries WHERE id = ? AND user_id = ?"
  )
    .bind(itineraryId, userId)
    .run();

  return c.json({ success: true });
});

// Weather endpoint
app.get("/api/weather", async (c) => {
  const city = c.req.query("city");

  if (!city) {
    return c.json({ error: "City parameter is required" }, 400);
  }

  try {
    const apiKey = (c.env as any).OPENWEATHER_API_KEY || (c.env as any).VITE_OPENWEATHER_API_KEY;
    if (!apiKey) {
      return c.json({ error: "OpenWeather API key is not configured" }, 500);
    }

    const currentUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
    currentUrl.searchParams.set("q", `${city},IN`);
    currentUrl.searchParams.set("appid", apiKey);
    currentUrl.searchParams.set("units", "metric");

    const forecastUrl = new URL("https://api.openweathermap.org/data/2.5/forecast");
    forecastUrl.searchParams.set("q", `${city},IN`);
    forecastUrl.searchParams.set("appid", apiKey);
    forecastUrl.searchParams.set("units", "metric");

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl.toString()),
      fetch(forecastUrl.toString()),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      const currentError = await currentRes.text();
      const forecastError = await forecastRes.text();
      console.error("OpenWeather API request failed:", { currentError, forecastError });
      return c.json({ error: "Failed to fetch weather data from provider" }, 502);
    }

    const currentJson = await currentRes.json() as any;
    const forecastJson = await forecastRes.json() as any;
    const list = Array.isArray(forecastJson?.list) ? forecastJson.list : [];

    if (list.length === 0) {
      console.error("OpenWeather response has no forecast list:", forecastJson);
      return c.json({ error: "Weather provider returned no forecast data" }, 502);
    }

    const forecastByDate = new Map<string, any[]>();
    for (const item of list) {
      const date = (item.dt_txt as string).split(" ")[0];
      const list = forecastByDate.get(date) ?? [];
      list.push(item);
      forecastByDate.set(date, list);
    }

    const forecast = Array.from(forecastByDate.entries())
      .slice(0, 5)
      .map(([date, entries]) => {
        const highs = entries.map((e) => e.main?.temp_max ?? e.main?.temp ?? 0);
        const lows = entries.map((e) => e.main?.temp_min ?? e.main?.temp ?? 0);

        const representative = [...entries].sort((a, b) => {
          const aHour = Number((a.dt_txt as string).split(" ")[1]?.split(":")[0] ?? 0);
          const bHour = Number((b.dt_txt as string).split(" ")[1]?.split(":")[0] ?? 0);
          return Math.abs(aHour - 12) - Math.abs(bHour - 12);
        })[0];

        const weatherId = representative?.weather?.[0]?.id ?? 801;
        return {
          date,
          high: Math.round(Math.max(...highs)),
          low: Math.round(Math.min(...lows)),
          condition: mapWeatherConditionFromId(weatherId),
        };
      });

    const weatherData = {
      current: {
        temp: Math.round(currentJson.main?.temp ?? 0),
        condition: mapWeatherConditionFromId(currentJson.weather?.[0]?.id ?? 801),
        humidity: Math.round(currentJson.main?.humidity ?? 0),
        windSpeed: Math.round((currentJson.wind?.speed ?? 0) * 3.6),
        feelsLike: Math.round(currentJson.main?.feels_like ?? 0),
      },
      forecast,
      bestTimeToVisit: getBestTimeToVisit(city),
    };

    return c.json(weatherData);
  } catch (error) {
    console.error("Weather API error:", error);
    return c.json({ error: "Failed to fetch weather data" }, 500);
  }
});
export default app;

// SPA Fallback - Serve index.html for all non-API routes
app.get("*", async (c) => {
  // Return the index.html for client-side routing
  const response = await fetch(new URL("/index.html", c.req.url));
  return c.html(await response.text());
});
