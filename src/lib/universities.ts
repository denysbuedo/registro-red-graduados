// src/lib/universities.ts

export const MINISTRIES = ["MES", "MINSAP", "MINCULT", "INDER", "MINREX"] as const;
export type Ministry = typeof MINISTRIES[number];

export interface UniversityInfo {
  name: string;
  ministry: Ministry;
}

export const UNIVERSITY_LIST: UniversityInfo[] = [
  { name: "Escuela Superior de Cuadros del Estado y del Gobierno", ministry: "MES" },
  { name: "Universidad Agraria de La Habana Fructuoso Rodríguez Pérez", ministry: "MES" },
  { name: "Universidad Central Marta Abreu de Las Villas", ministry: "MES" },
  { name: "Universidad de Artemisa Julio Díaz González", ministry: "MES" },
  { name: "Universidad de Camagüey Ignacio Agramonte Loynaz", ministry: "MES" },
  { name: "Universidad de Ciego de Ávila Máximo Gómez Báez", ministry: "MES" },
  { name: "Universidad de Ciencias de la Cultura Física y el Deporte Manuel Fajardo", ministry: "MES" },
  { name: "Universidad de Ciencias Pedagógicas Enrique José Varona", ministry: "MES" },
  { name: "Universidad de Cienfuegos Carlos Rafael Rodríguez", ministry: "MES" },
  { name: "Universidad de Granma", ministry: "MES" },
  { name: "Universidad de Guantánamo", ministry: "MES" },
  { name: "Universidad de Holguín", ministry: "MES" },
  { name: "Universidad de La Habana", ministry: "MES" },
  { name: "Universidad de la Isla de la Juventud Jesús Montané Oropesa", ministry: "MES" },
  { name: "Universidad de las Ciencias Informáticas", ministry: "MES" },
  { name: "Universidad de Las Tunas", ministry: "MES" },
  { name: "Universidad de Matanzas", ministry: "MES" },
  { name: "Universidad de Moa Dr. Antonio Núñez Jiménez", ministry: "MES" },
  { name: "Universidad de Oriente", ministry: "MES" },
  { name: "UPR Universidad de Pinar del Río Hermanos Saiz Montes de Oca", ministry: "MES" },
  { name: "UNISS Universidad de Sancti Spíritus José Martí Pérez", ministry: "MES" },
  { name: "Universidad Tecnológica de La Habana José Antonio Echeverría", ministry: "MES" },
  { name: "Escuela Latinoamericana de Medicina", ministry: "MINSAP" },
  { name: "Universidad de Ciencias Médicas de Camagüey", ministry: "MINSAP" },
  { name: "Universidad de Ciencias Médicas de Ciego de Ávila", ministry: "MINSAP" },
  { name: "Universidad de Ciencias Médicas de Cienfuegos", ministry: "MINSAP" },
  { name: "Universidad de Ciencias Médicas de Granma", ministry: "MINSAP" },
  { name: "Universidad de Ciencias Médicas de Guantánamo", ministry: "MINSAP" },
  { name: "Universidad de Ciencias Médicas de Holguín", ministry: "MINSAP" },
  { name: "Universidad de Ciencias Médicas de La Habana", ministry: "MINSAP" },
  { name: "Universidad de Ciencias Médicas de Las Tunas", ministry: "MINSAP" },
  { name: "Universidad de Ciencias Médicas de Matanzas", ministry: "MINSAP" },
  { name: "Universidad de Ciencias Médicas de Pinar del Río", ministry: "MINSAP" },
  { name: "Universidad de Ciencias Médicas de Sancti Spíritus", ministry: "MINSAP" },
  { name: "Universidad de Ciencias Médicas de Santiago de Cuba", ministry: "MINSAP" },
  { name: "Universidad de Ciencias Médicas de Villa Clara", ministry: "MINSAP" },
  { name: "Instituto Superior de Relaciones Internacionales Raúl Roa García", ministry: "MINREX" },
  { name: "Universidad de las Artes", ministry: "MINCULT" },
];

export const UNIVERSITIES = UNIVERSITY_LIST.map(u => u.name);

export function getUniversityMinistry(name: string): Ministry | null {
  const uni = UNIVERSITY_LIST.find(u => u.name === name);
  return uni ? uni.ministry : null;
}

export function getUniversitiesByMinistry(ministry: Ministry): string[] {
  return UNIVERSITY_LIST.filter(u => u.ministry === ministry).map(u => u.name);
}