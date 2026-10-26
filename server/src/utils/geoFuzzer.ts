/**
 * Utility to fuzz coordinates by ~1.5 - 2.5 km for worker privacy protection.
 * Daily-wage workers should not have their precise GPS home location exposed publicly.
 */
export const fuzzCoordinates = (
  coordinates: [number, number],
  radiusKm = 2.0
): [number, number] => {
  const [lng, lat] = coordinates;

  // 1 degree latitude ~ 111 km
  // 1 degree longitude ~ 111 km * cos(latitude)
  const latDelta = (Math.random() - 0.5) * (radiusKm / 111);
  const lngDelta =
    (Math.random() - 0.5) *
    (radiusKm / (111 * Math.cos((lat * Math.PI) / 180)));

  return [
    parseFloat((lng + lngDelta).toFixed(5)),
    parseFloat((lat + latDelta).toFixed(5)),
  ];
};
