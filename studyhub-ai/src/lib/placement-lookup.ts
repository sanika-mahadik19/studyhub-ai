import placementStats from "@/data/placement-stats.json";

export type DomainType = "Sci&Tech" | "Comm&Mgmt" | "Others";

export interface DomainStats {
  domain: DomainType;
  rate: string;
  avgDegreeP: string;
  avgSalary: string;
  workexWithRate: string;
  workexWithoutRate: string;
}

const TOPIC_DOMAIN_MAP: Record<string, DomainType> = {
  "dbms": "Sci&Tech",
  "database": "Sci&Tech",
  "operating systems": "Sci&Tech",
  "os": "Sci&Tech",
  "data structures": "Sci&Tech",
  "dsa": "Sci&Tech",
  "algorithms": "Sci&Tech",
  "networking": "Sci&Tech",
  "oops": "Sci&Tech",
  "python": "Sci&Tech",
  "javascript": "Sci&Tech",
  "coding": "Sci&Tech",
  "programming": "Sci&Tech",
  "marketing": "Comm&Mgmt",
  "finance": "Comm&Mgmt",
  "management": "Comm&Mgmt",
  "hrm": "Comm&Mgmt",
  "logistics": "Comm&Mgmt",
  "arts": "Others",
  "humanities": "Others",
};

export function getDomainForTopic(topic: string): DomainType {
  const key = topic.toLowerCase();
  for (const [k, v] of Object.entries(TOPIC_DOMAIN_MAP)) {
    if (key.includes(k)) return v;
  }
  return "Sci&Tech"; // Default for most academic study notes
}

export function getStatsForDomain(domain: DomainType): DomainStats {
  const stats = (placementStats.byDegree as any)[domain];
  return {
    domain,
    rate: stats.rate,
    avgDegreeP: stats.avgDegreeP,
    avgSalary: stats.avgSalary,
    workexWithRate: placementStats.workexStats.withWorkex,
    workexWithoutRate: placementStats.workexStats.withoutWorkex,
  };
}
