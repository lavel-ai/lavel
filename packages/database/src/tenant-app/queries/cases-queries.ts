import { and, asc, desc, eq, ilike, inArray, sql } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { cases } from '../schema/case-schema';
import { teams } from '../schema/teams-schema';
import { users } from '../schema/users-schema';
import { states } from '../schema/states-schema';
import { cities } from '../schema/cities-schema';
import { courthouses } from '../schema/courthouses-schema';
import type { SQL, SQLWrapper } from 'drizzle-orm';

export type DrizzleClient = PgDatabase<any>;

export interface CaseFilters {
  team?: string[];
  leadAttorney?: string[];
  state?: string[];
  city?: string[];
  courthouse?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  search?: string;
  type?: 'advisory' | 'litigation';
}

export interface CaseSorting {
  id: string;
  desc: boolean;
}

export interface CaseQueryOptions {
  pageIndex: number;
  pageSize: number;
  filters?: CaseFilters;
  sorting?: CaseSorting[];
}

export interface FilterOption {
  id: string | number;
  name: string;
}

export interface CaseFilterOptions {
  teams: FilterOption[];
  attorneys: FilterOption[];
  states: FilterOption[];
  cities: FilterOption[];
  courthouses: FilterOption[];
}

function buildWhereConditions(filters?: CaseFilters): SQL<unknown> {
  if (!filters) {
    return sql`1 = 1`;
  }

  const conditions: SQL<unknown>[] = [];

  if (filters.team?.length) {
    conditions.push(inArray(cases.assignedTeamId, filters.team) as SQL<unknown>);
  }
  if (filters.leadAttorney?.length) {
    conditions.push(inArray(cases.leadAttorneyId, filters.leadAttorney) as SQL<unknown>);
  }
  if (filters.state?.length) {
    conditions.push(inArray(cases.stateId, filters.state.map(Number)) as SQL<unknown>);
  }
  if (filters.city?.length) {
    conditions.push(inArray(cases.cityId, filters.city.map(Number)) as SQL<unknown>);
  }
  if (filters.courthouse?.length) {
    conditions.push(
      inArray(cases.courthouseId, filters.courthouse.map(Number)) as SQL<unknown>
    );
  }
  if (filters.dateRange) {
    conditions.push(
      sql`${cases.startDate} >= ${filters.dateRange.from}::timestamp`,
      sql`${cases.startDate} <= ${filters.dateRange.to}::timestamp`
    );
  }
  if (filters.search) {
    conditions.push(ilike(cases.title, `%${filters.search}%`) as SQL<unknown>);
  }
  if (filters.type) {
    conditions.push(eq(cases.type, filters.type) as SQL<unknown>);
  }

  return conditions.length > 0 ? and(...conditions) as SQL<unknown> : sql`1 = 1`;
}

export async function getCases(
  tenantDb: DrizzleClient,
  options: CaseQueryOptions
) {
  const { pageIndex, pageSize, filters, sorting } = options;
  const offset = pageIndex * pageSize;

  // Build order by
  const orderBy = sorting?.map((sort) => {
    const column = cases[sort.id as keyof typeof cases];
    return sort.desc ? desc(column) : asc(column);
  }) ?? [desc(cases.createdAt)];

  return tenantDb
    .select()
    .from(cases)
    .where(buildWhereConditions(filters))
    .limit(pageSize)
    .offset(offset)
    .orderBy(...orderBy);
}

export async function getCaseCount(
  tenantDb: DrizzleClient,
  filters?: CaseFilters
) {
  return tenantDb
    .select({ count: sql<number>`count(*)` })
    .from(cases)
    .where(buildWhereConditions(filters));
}

export async function getCaseFilterOptions(
  tenantDb: DrizzleClient
): Promise<CaseFilterOptions> {
  const [teamResults, attorneyResults, stateResults, cityResults, courthouseResults] = await Promise.all([
    tenantDb
      .select({
        id: teams.id,
        name: teams.name,
      })
      .from(teams),
    tenantDb
      .select({
        id: users.id,
        name: sql<string>`concat(${users.firstName}, ' ', ${users.lastName})`,
      })
      .from(users),
    tenantDb
      .select({
        id: states.id,
        name: states.name,
      })
      .from(states),
    tenantDb
      .select({
        id: cities.id,
        name: cities.name,
      })
      .from(cities),
    tenantDb
      .select({
        id: courthouses.id,
        name: courthouses.name,
      })
      .from(courthouses),
  ]);

  return {
    teams: teamResults,
    attorneys: attorneyResults,
    states: stateResults,
    cities: cityResults,
    courthouses: courthouseResults,
  };
}
