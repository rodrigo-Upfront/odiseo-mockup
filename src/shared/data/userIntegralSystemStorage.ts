// Sistema Integral User Mapping for ODISEO Users
// Stores the mapping between ODISEO users and Sistema Integral users

const USER_INTEGRAL_SYSTEM_KEY = "odiseo_user_integral_system_mapping";

export interface UserIntegralSystemMapping {
  odiseoUserId: string;
  integralSystemUserId: string;
  integralSystemUserValue: string;
  mappedAt: string;
}

export function saveUserIntegralSystemMapping(
  odiseoUserId: string,
  integralSystemUserId: string,
  integralSystemUserValue: string
): void {
  const mappings = getUserIntegralSystemMappings();
  
  const existingIndex = mappings.findIndex(m => m.odiseoUserId === odiseoUserId);
  
  const newMapping: UserIntegralSystemMapping = {
    odiseoUserId,
    integralSystemUserId,
    integralSystemUserValue,
    mappedAt: new Date().toISOString(),
  };
  
  if (existingIndex >= 0) {
    mappings[existingIndex] = newMapping;
  } else {
    mappings.push(newMapping);
  }
  
  localStorage.setItem(USER_INTEGRAL_SYSTEM_KEY, JSON.stringify(mappings));
}

export function getUserIntegralSystemMappings(): UserIntegralSystemMapping[] {
  try {
    const stored = localStorage.getItem(USER_INTEGRAL_SYSTEM_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getUserIntegralSystemMapping(odiseoUserId: string): UserIntegralSystemMapping | undefined {
  const mappings = getUserIntegralSystemMappings();
  return mappings.find(m => m.odiseoUserId === odiseoUserId);
}

export function deleteUserIntegralSystemMapping(odiseoUserId: string): void {
  const mappings = getUserIntegralSystemMappings();
  const filtered = mappings.filter(m => m.odiseoUserId !== odiseoUserId);
  localStorage.setItem(USER_INTEGRAL_SYSTEM_KEY, JSON.stringify(filtered));
}
