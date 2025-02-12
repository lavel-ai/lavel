// packages/database/src/tenant-app/seed-reference.ts
import 'dotenv/config'; // Load environment variables
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema/reference';
import { states, cities, lawBranches, jurisdictions, trialStages, trialTypes, trialStagesTypes, courthouses } from '../schema/reference';
import { InferInsertModel } from 'drizzle-orm';
import { eq, and } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// Types for our seed data
type StateInsert = InferInsertModel<typeof states>;
type CityInsert = InferInsertModel<typeof cities>;
type LawBranchInsert = InferInsertModel<typeof lawBranches>;
type JurisdictionInsert = InferInsertModel<typeof jurisdictions>;
type TrialStageInsert = InferInsertModel<typeof trialStages>;
type TrialTypeInsert = InferInsertModel<typeof trialTypes>;
type TrialStageTypeInsert = InferInsertModel<typeof trialStagesTypes>;
type CourthouseInsert = InferInsertModel<typeof courthouses>;

// Store IDs for relationships
interface IdMap {
  [key: string]: number;
}

const stateIds: IdMap = {};
const cityIds: IdMap = {};
const lawBranchIds: IdMap = {};
const jurisdictionIds: IdMap = {};
const trialStageIds: IdMap = {};
const trialTypeIds: IdMap = {};
const courthouseIds: IdMap = {};

// Get the database URL from environment variables
const databaseUrl = process.env.TEST_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('TEST_DATABASE_URL is not defined');
}

// Create a database connection
const connection = postgres(databaseUrl, { max: 1 });
const db = drizzle(connection, { schema: { ...schema } });

// Helper function to load CSV data
function loadCsvData(fileName: string): any[] {
  const filePath = path.join(__dirname, 'reference-' + fileName);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

async function seedStates() {
  console.log('Seeding states...');
  const statesData = loadCsvData('states.csv');
  
  for (const stateData of statesData) {
    try {
      const state: StateInsert = {
        name: stateData.name.toLowerCase(),
      };
      
      const existingState = await db.select().from(states).where(eq(states.name, state.name));
      
      if (existingState.length === 0) {
        const [inserted] = await db.insert(states).values(state).returning();
        stateIds[state.name] = inserted.id;
        console.log(`Inserted state: ${state.name}`);
      } else {
        stateIds[state.name] = existingState[0].id;
        console.log(`State already exists: ${state.name}`);
      }
    } catch (error) {
      console.error(`Error seeding state ${stateData.name}:`, error);
    }
  }
}

async function seedCities() {
  console.log('Seeding cities...');
  const citiesData = loadCsvData('cities.csv');
  
  for (const cityData of citiesData) {
    try {
      const stateName = cityData.state.toLowerCase();
      const stateId = stateIds[stateName];
      
      if (!stateId) {
        console.error(`State not found for city ${cityData.name}: ${stateName}`);
        continue;
      }
      
      const city: CityInsert = {
        name: cityData.name.toLowerCase(),
        stateId: stateId,
      };
      
      const existingCity = await db.select().from(cities).where(eq(cities.name, city.name));
      
      if (existingCity.length === 0) {
        const [inserted] = await db.insert(cities).values(city).returning();
        cityIds[city.name] = inserted.id;
        console.log(`Inserted city: ${city.name} (State: ${stateName})`);
      } else {
        // Update the state ID if it's different
        if (existingCity[0].stateId !== stateId) {
          await db.update(cities)
            .set({ stateId })
            .where(eq(cities.id, existingCity[0].id));
          console.log(`Updated state for city: ${city.name} (State: ${stateName})`);
        }
        cityIds[city.name] = existingCity[0].id;
        console.log(`City already exists: ${city.name} (State: ${stateName})`);
      }
    } catch (error) {
      console.error(`Error seeding city ${cityData.name}:`, error);
    }
  }
}

async function seedLawBranches() {
  console.log('Seeding law branches...');
  const lawBranchesData = loadCsvData('lawbranch.csv');
  
  for (const lawBranchData of lawBranchesData) {
    try {
      const lawBranch: LawBranchInsert = {
        name: lawBranchData.name.toLowerCase(),
      };
      
      const existingLawBranch = await db.select().from(lawBranches).where(eq(lawBranches.name, lawBranch.name));
      
      if (existingLawBranch.length === 0) {
        const [inserted] = await db.insert(lawBranches).values(lawBranch).returning();
        lawBranchIds[lawBranch.name] = inserted.id;
        console.log(`Inserted law branch: ${lawBranch.name}`);
      } else {
        lawBranchIds[lawBranch.name] = existingLawBranch[0].id;
        console.log(`Law branch already exists: ${lawBranch.name}`);
      }
    } catch (error) {
      console.error(`Error seeding law branch ${lawBranchData.name}:`, error);
    }
  }
}

async function seedJurisdictions() {
  console.log('Seeding jurisdictions...');
  const jurisdictionsData = loadCsvData('jurisdiction.csv');
  
  for (const jurisdictionData of jurisdictionsData) {
    try {
      const jurisdiction: JurisdictionInsert = {
        name: jurisdictionData.name.toLowerCase(),
      };
      
      const existingJurisdiction = await db.select().from(jurisdictions).where(eq(jurisdictions.name, jurisdiction.name));
      
      if (existingJurisdiction.length === 0) {
        const [inserted] = await db.insert(jurisdictions).values(jurisdiction).returning();
        jurisdictionIds[jurisdiction.name] = inserted.id;
        console.log(`Inserted jurisdiction: ${jurisdiction.name}`);
      } else {
        jurisdictionIds[jurisdiction.name] = existingJurisdiction[0].id;
        console.log(`Jurisdiction already exists: ${jurisdiction.name}`);
      }
    } catch (error) {
      console.error(`Error seeding jurisdiction ${jurisdictionData.name}:`, error);
    }
  }
}

async function seedTrialStages() {
  console.log('Seeding trial stages...');
  const trialStagesData = loadCsvData('stage.csv');
  
  for (const stageData of trialStagesData) {
    try {
      const stage: TrialStageInsert = {
        name: stageData.name.toLowerCase(),
      };
      
      const existingStage = await db.select().from(trialStages).where(eq(trialStages.name, stage.name));
      
      if (existingStage.length === 0) {
        const [inserted] = await db.insert(trialStages).values(stage).returning();
        trialStageIds[stage.name] = inserted.id;
        console.log(`Inserted trial stage: ${stage.name}`);
      } else {
        trialStageIds[stage.name] = existingStage[0].id;
        console.log(`Trial stage already exists: ${stage.name}`);
      }
    } catch (error) {
      console.error(`Error seeding trial stage ${stageData.name}:`, error);
    }
  }
}

async function seedTrialTypes() {
  console.log('Seeding trial types...');
  const trialTypesData = loadCsvData('type.csv');
  
  for (const typeData of trialTypesData) {
    try {
      const type: TrialTypeInsert = {
        name: typeData.name.toLowerCase(),
      };
      
      const existingType = await db.select().from(trialTypes).where(eq(trialTypes.name, type.name));
      
      if (existingType.length === 0) {
        const [inserted] = await db.insert(trialTypes).values(type).returning();
        trialTypeIds[type.name] = inserted.id;
        console.log(`Inserted trial type: ${type.name}`);
      } else {
        trialTypeIds[type.name] = existingType[0].id;
        console.log(`Trial type already exists: ${type.name}`);
      }
    } catch (error) {
      console.error(`Error seeding trial type ${typeData.name}:`, error);
    }
  }
}

async function seedTrialStagesTypes() {
  console.log('Seeding trial stages types relationships...');
  // This would require a mapping CSV file that defines which stages belong to which types
  // For now, we'll assume all stages can belong to all types
  for (const typeId of Object.values(trialTypeIds)) {
    for (const stageId of Object.values(trialStageIds)) {
      try {
        const stageType: TrialStageTypeInsert = {
          trialTypeId: typeId,
          trialStageId: stageId,
        };
        
        // Check if relationship already exists
        const existing = await db.select()
          .from(trialStagesTypes)
          .where(
            and(
              eq(trialStagesTypes.trialTypeId, typeId),
              eq(trialStagesTypes.trialStageId, stageId)
            )
          );
        
        if (existing.length === 0) {
          await db.insert(trialStagesTypes).values(stageType);
          console.log(`Inserted trial stage-type relationship: ${typeId}-${stageId}`);
        } else {
          console.log(`Trial stage-type relationship already exists: ${typeId}-${stageId}`);
        }
      } catch (error) {
        console.error(`Error seeding trial stage-type relationship ${typeId}-${stageId}:`, error);
      }
    }
  }
}

async function seedCourthouses() {
  console.log('Seeding courthouses...');
  const courthousesData = loadCsvData('courthouses.csv');
  
  for (const courthouseData of courthousesData) {
    try {
      const stateName = courthouseData.state.toLowerCase();
      const cityName = courthouseData.city.toLowerCase();
      const lawBranchName = courthouseData.law_branch.toLowerCase();
      const jurisdictionName = courthouseData.jurisdiction.toLowerCase();
      
      const stateId = stateIds[stateName];
      const cityId = cityIds[cityName];
      const lawBranchId = lawBranchIds[lawBranchName];
      const jurisdictionId = jurisdictionIds[jurisdictionName];
      
      if (!stateId || !cityId || !lawBranchId || !jurisdictionId) {
        console.error(`Missing reference for courthouse ${courthouseData.name}:`, {
          state: stateName,
          city: cityName,
          lawBranch: lawBranchName,
          jurisdiction: jurisdictionName,
        });
        continue;
      }
      
      const courthouse: CourthouseInsert = {
        name: courthouseData.name.toLowerCase(),
        stateId,
        cityId,
        lawBranchId,
        jurisdictionId,
        parentId: courthouseData.parent_id ? parseInt(courthouseData.parent_id) : null,
      };
      
      const existingCourthouse = await db.select().from(courthouses).where(eq(courthouses.name, courthouse.name));
      
      if (existingCourthouse.length === 0) {
        const [inserted] = await db.insert(courthouses).values(courthouse).returning();
        courthouseIds[courthouse.name] = inserted.id;
        console.log(`Inserted courthouse: ${courthouse.name}`);
      } else {
        // Update the courthouse if any references have changed
        await db.update(courthouses)
          .set({
            stateId,
            cityId,
            lawBranchId,
            jurisdictionId,
            parentId: courthouse.parentId,
          })
          .where(eq(courthouses.id, existingCourthouse[0].id));
        courthouseIds[courthouse.name] = existingCourthouse[0].id;
        console.log(`Updated courthouse: ${courthouse.name}`);
      }
    } catch (error) {
      console.error(`Error seeding courthouse ${courthouseData.name}:`, error);
    }
  }
}

async function seed() {
  try {
    // Seed in order of dependencies
    await seedStates();
    await seedCities();
    await seedLawBranches();
    await seedJurisdictions();
    await seedTrialStages();
    await seedTrialTypes();
    await seedTrialStagesTypes();
    await seedCourthouses();
    
    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await connection.end();
  }
}

seed();