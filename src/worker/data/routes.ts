import type { RouteOption } from "@/shared/types";

export function generateRoutes(from: string, to: string): RouteOption[] {
  // Generate train routes
  const trainRoutes = [
    {
      id: `train-1-${from}-${to}`,
      mode: "train" as const,
      operator: "Indian Railways",
      number: "12301",
      departure: "06:30 AM",
      arrival: "10:45 AM",
      duration: "4h 15m",
      price: 450,
      availability: "Available - 67 seats",
      steps: [
        `Board train 12301 from ${from} Junction at 06:30 AM`,
        `Direct train - no transfers required`,
        `Arrive at ${to} Central at 10:45 AM`,
      ],
    },
    {
      id: `train-2-${from}-${to}`,
      mode: "train" as const,
      operator: "Indian Railways",
      number: "12627",
      departure: "08:00 AM",
      arrival: "01:20 PM",
      duration: "5h 20m",
      price: 380,
      availability: "Available - 42 seats",
      steps: [
        `Board train 12627 from ${from} Station at 08:00 AM`,
        `Train stops at intermediate stations`,
        `Arrive at ${to} Junction at 01:20 PM`,
      ],
    },
    {
      id: `train-3-${from}-${to}`,
      mode: "train" as const,
      operator: "Indian Railways",
      number: "12951",
      departure: "09:15 AM",
      arrival: "02:30 PM",
      duration: "5h 15m",
      price: 520,
      availability: "Available - 23 seats",
      steps: [
        `Board train 12951 from ${from} Terminus at 09:15 AM`,
        `Premium express service`,
        `Arrive at ${to} Central at 02:30 PM`,
      ],
    },
  ];

  // Generate bus routes
  const busRoutes = [
    {
      id: `bus-1-${from}-${to}`,
      mode: "bus" as const,
      operator: "RedBus Express",
      number: "RB-4523",
      departure: "07:00 AM",
      arrival: "12:30 PM",
      duration: "5h 30m",
      price: 320,
      availability: "Available - 18 seats",
      steps: [
        `Board bus RB-4523 from ${from} Bus Terminal`,
        `AC Sleeper service with 2 stops`,
        `Arrive at ${to} Bus Stand`,
      ],
    },
    {
      id: `bus-2-${from}-${to}`,
      mode: "bus" as const,
      operator: "VRL Travels",
      number: "VRL-8901",
      departure: "10:30 AM",
      arrival: "04:45 PM",
      duration: "6h 15m",
      price: 280,
      availability: "Available - 32 seats",
      steps: [
        `Board bus VRL-8901 from ${from} Central Bus Stop`,
        `Semi-sleeper with rest stops`,
        `Arrive at ${to} Main Bus Terminal`,
      ],
    },
  ];

  // Generate car route
  const carRoute = {
    id: `car-1-${from}-${to}`,
    mode: "car" as const,
    departure: "Flexible",
    arrival: "Flexible",
    duration: "4h 30m",
    price: 1850,
    steps: [
      `Start from ${from} via NH-48`,
      `Estimated fuel cost: ₹1,200`,
      `Estimated toll charges: ₹650`,
      `Total distance: ~320 km`,
      `Arrive at ${to}`,
    ],
  };

  return [...trainRoutes, ...busRoutes, carRoute];
}
