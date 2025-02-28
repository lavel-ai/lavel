Okay, let's create a fresh documentation for the Data Normalization Architecture v2.0, incorporating the observability and resilience enhancements.

```md
# Data Normalization Architecture - Technical Documentation (Version 2.0)

**Version:** 2.0.0
**Status:** Proposed
**Last Updated:** 2025-02-28
**Owners:** Engineering Team

## Table of Contents

- [Introduction](#introduction)
    - [Objectives](#objectives)
    - [Scope](#scope)
- [Architecture](#architecture)
- [Core Components](#core-components)
    - [Schema Registry](#schema-registry)
    - [Transform Pipeline (Resilient Stages)](#transform-pipeline-resilient-stages)
    - [Resilient Normalizer](#resilient-normalizer)
    - [Data Quality Monitoring](#data-quality-monitoring)
    - [Data Quality Dashboard](#data-quality-dashboard)
    - [Error Reporting (Sentry)](#error-reporting-sentry)
- [API Reference](#api-reference)
    - [Schema Registry API](#schema-registry-api)
    - [Transform Pipeline API](#transform-pipeline-api)
    - [Resilient Normalizer API](#resilient-normalizer-api)
    - [Data Quality Monitoring API (if applicable)](#data-quality-monitoring-api-if-applicable)
- [Configuration](#configuration)
    - [Normalization Configuration](#normalization-configuration)
    - [Resilience Configuration](#resilience-configuration)
    - [Observability Configuration](#observability-configuration)
    - [Environment Variables](#environment-variables)
- [Usage Examples](#usage-examples)
    - [Basic Form Normalization with Resilience](#basic-form-normalization-with-resilience)
    - [Bulk Import Normalization with Error Handling](#bulk-import-normalization-with-error-handling)
    - [Monitoring Data Quality via Dashboard](#monitoring-data-quality-via-dashboard)
- [Testing](#testing)
    - [Unit Testing Normalizers](#unit-testing-normalizers)
    - [Integration Testing Pipelines](#integration-testing-pipelines)
    - [Observability Testing](#observability-testing)
    - [Resilience Testing](#resilience-testing)
- [Troubleshooting](#troubleshooting)
    - [Common Issues](#common-issues)
    - [Debugging and Logging](#debugging-and-logging)
    - [Monitoring and Alerting](#monitoring-and-alerting)
- [Design Decisions](#design-decisions)
    - [Layered Pipeline Architecture](#layered-pipeline-architecture)
    - [Schema-Driven Approach for Validation and Normalization](#schema-driven-approach-for-validation-and-normalization)
    - [Resilience and Fallback Strategies](#resilience-and-fallback-strategies)
    - [Integrated Observability](#integrated-observability)
    - [Reusable Input Components (Design System)](#reusable-input-components-design-system)
- [Contributing](#contributing)
    - [Adding New Normalizers](#adding-new-normalizers-1)
    - [Modifying Existing Normalizers](#modifying-existing-normalizers-1)
    - [Contributing to Observability](#contributing-to-observability)
    - [Testing Contributions](#testing-contributions)
- [Change Log](#change-log)

## Introduction

The Lavel AI Data Normalization Architecture (Version 2.0) standardizes how data is validated, transformed, and stored across the platform, with a strong emphasis on **resilience and observability**. This document details the implementation, APIs, configuration, and usage patterns for engineers working on the Lavel platform, reflecting the significant enhancements in version 2.0.

### Objectives

- **Ensure Consistent Data Formatting:** Guarantee uniform data structure and format regardless of the input source.
- **Provide Transparent Transformations:** Make data transformations easily understandable and auditable for users and engineers.
- **Handle Errors Gracefully and Resiliently:** Implement robust error handling and fallback mechanisms to prevent pipeline failures and data loss.
- **Optimize Performance of Data Processing:** Maintain efficient data processing operations, even with complex normalization rules and large datasets.
- **Support Future Schema Evolution:** Facilitate seamless schema updates and versioning with minimal disruption to existing data and processes.
- **Integrated Observability:**  Incorporate comprehensive logging, monitoring, and error reporting to gain deep insights into the data normalization process and ensure data quality.

### Scope

This architecture applies to all data validation and normalization within the Lavel platform, specifically targeting:

- Form inputs from user interfaces
- API payloads received from external applications
- Bulk data imports and exports (CSV, JSON, etc.)
- Integrations with external systems and data sources

## Architecture

```mermaid
flowchart LR
┌─────────────────┐     ┌───────────────────┐     ┌─────────────────┐
│  Input Sources  │────►│  Schema Registry  │────►│  Form Components│
└────────┬────────┘     └─────────┬─────────┘     └────────┬────────┘
         │                        │                        │
         │              ┌─────────▼─────────┐              │
         │              │  Transform Pipeline│              │
         │              │ (Resilient Stages)│              │
         │              └─────────┬─────────┘              │
         │                        │                        │
         │         ┌──────────────▼───────────────────┐    │
         │         │ Stage 1: Sanitization           │    │
         │         │     - Input Cleaning            │    │
         │         │     - Error Logging & Monitoring│    │
         │         └──────────────┬───────────────────┘    │
         │                        │                        │
         │         ┌──────────────▼───────────────────┐    │
         │         │ Stage 2: Normalization          │    │
         │         │     - Format Standardization    │    │
         │         │     - Resilient Normalization   │    │
         │         │     - Error Logging & Monitoring│    │
         │         └──────────────┬───────────────────┘    │
         │                        │                        │
         │         ┌──────────────▼───────────────────┐    │
         │         │ Stage 3: Validation             │    │
         │         │     - Schema Validation         │    │
         │         │     - Resilience & Fallback     │    │
         │         │     - Error Logging & Monitoring│    │
         │         └──────────────┬───────────────────┘    │
         │                        │                        │
         │         ┌──────────────▼───────────────────┐    │
         │         │ Stage 4: Data Quality Monitoring│    │
         │         │     - Metric Calculation        │    │
         │         │     - Metric Reporting        │    │
         │         │     - Logging                   │    │
         │         └──────────────┬───────────────────┘    │
         │                        │                        │
         └──────────────►  Data Quality Dashboard◄──────────────┘
                        └─────────┬─────────┘
                                  │
                        ┌─────────▼─────────┐     ┌─────────────────┐
                        │  Database Storage │────►│  External       │
                        └───────────────────┘     │  Systems       │
                                                  └─────────────────┘
                                  │
                        ┌─────────▼─────────┐
                        │  Error Reporting  │
                        │  (Sentry)         │
                        └───────────────────┘
```

The architecture follows a four-stage pipeline pattern, emphasizing resilience and observability at each step:
1.  **Input Sources:** Data enters the system from various sources.
2.  **Schema Registry:** The central repository provides schemas, normalizers, and configurations for data entities.
3.  **Transform Pipeline (Resilient Stages):** Data flows through a pipeline with four distinct stages:
    *   **Stage 1: Sanitization:** Cleanses input data, removing potential threats and inconsistencies. Observability is built-in through logging and monitoring of sanitization processes and issues.
    *   **Stage 2: Normalization:** Standardizes data formats using configured normalizers and resilient error handling. Observability is maintained with logging and monitoring of normalization steps and fallback actions.
    *   **Stage 3: Validation:** Validates data against schemas, applying resilience and fallback strategies for validation failures. Observability features track validation outcomes and error details.
    *   **Stage 4: Data Quality Monitoring:** Calculates and reports data quality metrics, providing insights into data health and pipeline effectiveness.
4.  **Data Quality Dashboard:** Visualizes data quality metrics, enabling proactive monitoring and issue detection.
5.  **Database Storage:** Normalized and validated data is persisted in the database.
6.  **External Systems:** Normalized data can be consumed by external systems.
7.  **Error Reporting (Sentry):** Unhandled errors and exceptions are reported to Sentry for centralized error tracking and debugging.

## Core Components

### Schema Registry

The **Schema Registry** is the central component for managing data schemas, normalizers, and configurations. It provides:

- **Schema Storage:**  A repository for Zod schemas defining the structure and validation rules for each data entity (e.g., `client`, `team`, `case`).
- **Normalizer Configuration:**  Associates normalizer functions with schema fields, specifying how data should be transformed (e.g., `titleCase` for names, `lowercase` for emails).
- **Schema Versioning:**  Supports schema versioning to manage schema evolution and data migrations over time.
- **Schema Retrieval API:**  Provides an API to register, retrieve, and list schemas and their associated configurations.
- **Location:** `packages/schema/src/registry.ts`

### Transform Pipeline (Resilient Stages)

The **Transform Pipeline** is the heart of the architecture, responsible for orchestrating the data normalization process through a series of stages. Key features include:

- **Stage-Based Processing:** Data progresses through a defined sequence of stages: Sanitization, Normalization, Validation, and Data Quality Monitoring.
- **Resilience:** Each stage is designed to be resilient, incorporating error handling and fallback mechanisms using the `ResilientNormalizer`.
- **Observability:**  Each stage includes built-in logging and monitoring to track processing steps, performance, and errors.
- **Contextual Processing:** Pipelines operate within a context, providing information such as user ID, tenant ID, and input source, enabling contextual normalization and auditing.
- **Pipeline Definition API:**  Provides an API to create and configure transformation pipelines with custom stages and resilience options.
- **Location:** `packages/schema/src/pipeline/index.ts`, `packages/schema/src/pipeline/team-pipeline.ts` (example)

**Pipeline Stages:**

1.  **Sanitization Stage:**
    - **Purpose:** Cleans raw input data to remove potentially harmful or invalid characters and formats.
    - **Functionality:** Applies sanitization rules (e.g., HTML sanitization, input escaping, whitespace trimming).
    - **Observability:** Logs sanitization operations and any data modifications. Monitors for suspicious input patterns or sanitization errors.
    - **Implementation Example:** `packages/schema/src/pipeline/team-pipeline.ts` - `sanitizeTeamData`

2.  **Normalization Stage:**
    - **Purpose:** Standardizes data formats to ensure consistency across the platform.
    - **Functionality:** Applies configured normalizer functions (from Schema Registry) to transform data (e.g., case normalization, phone number formatting, date formatting). Utilizes `ResilientNormalizer` for robust normalization.
    - **Observability:** Logs normalization transformations applied to each field and tracks the effectiveness of normalizers. Monitors for normalization errors and fallback actions.
    - **Implementation Example:** `packages/schema/src/pipeline/team-pipeline.ts` - `normalizeTeamData`

3.  **Validation Stage:**
    - **Purpose:**  Enforces data integrity by validating data against predefined schemas.
    - **Functionality:** Uses Zod schemas (from Schema Registry) to validate data structure and types. Employs resilience strategies to handle validation failures, potentially using fallback values or rejecting invalid data.
    - **Observability:** Logs validation outcomes (success/failure) for each data entity. Monitors validation error rates and specific validation issues.
    - **Implementation Example:** `packages/schema/src/pipeline/team-pipeline.ts` - Validation logic within the pipeline definition.

4.  **Data Quality Monitoring Stage:**
    - **Purpose:** Continuously assesses and monitors the quality of normalized data.
    - **Functionality:** Calculates data quality metrics (completeness, validity, consistency, accuracy - if applicable). Reports metrics to the Data Quality Dashboard and logs metrics for historical analysis.
    - **Observability:** Provides real-time data quality scores and trends. Enables alerting based on data quality degradation.
    - **Implementation Example:** `packages/schema/src/pipeline/team-pipeline.ts` - `monitorDataQuality`, `packages/schema/src/monitoring/index.ts`

### Resilient Normalizer

The **Resilient Normalizer** is a utility class designed to enhance the robustness of the normalization and validation processes. It offers:

- **Error Recovery Strategies:**  Defines configurable strategies for handling normalization and validation errors:
    - `reject`: Throws an error, halting processing.
    - `use-default`: Uses predefined default values for fields with errors.
    - `use-partial`: Attempts to use partially valid data, discarding invalid fields.
    - `use-original`: Retains the original, unnormalized data in case of errors.
- **Error Logging:**  Logs normalization and validation errors, providing context for debugging and analysis.
- **Configuration Options:**  Allows configuration of the error recovery strategy, default values (for `use-default` strategy), and error logging behavior.
- **API:**  Provides a `normalize` method that takes a Zod schema and data as input and returns a result object indicating success or failure, along with normalized data (or fallback data in case of errors) and error details.
- **Location:** `packages/schema/src/resilience/error-handler.ts`

### Data Quality Monitoring

The **Data Quality Monitoring** component is responsible for continuously tracking and reporting on the quality of data processed by the normalization pipeline. It includes:

- **Metric Calculation:** Defines and calculates data quality metrics relevant to the Lavel platform (e.g., completeness of key fields, validity against schemas, consistency across datasets).
- **Metric Reporting:**  Reports calculated metrics to the Data Quality Dashboard for visualization and analysis.
- **Metric Logging:** Logs metric values for historical tracking and auditing.
- **Configurable Metrics:** Allows for defining and customizing data quality metrics based on specific entity types and business requirements.
- **Location:** `packages/schema/src/monitoring/index.ts`

### Data Quality Dashboard

The **Data Quality Dashboard** provides a visual interface for monitoring data quality metrics. It features:

- **Metric Visualization:** Displays data quality metrics in charts, graphs, and tables, providing a clear overview of data health.
- **Trend Analysis:**  Shows trends in data quality metrics over time, enabling detection of data degradation or improvement.
- **Alerting (Future Enhancement):**  Potentially integrates with alerting systems to trigger notifications when data quality metrics fall below predefined thresholds.
- **Customizable Views:** Allows users to customize dashboards to focus on specific entities, metrics, or time ranges.
- **Technology:**  Implementation details for the dashboard (technology stack, specific charting libraries) are separate and would reside within the UI application (e.g., `apps/app/`).

### Error Reporting (Sentry)

**Error Reporting (Sentry)** is integrated to provide centralized error tracking and alerting. Key aspects include:

- **Automated Error Capture:**  Automatically captures unhandled exceptions and errors that occur within the Data Normalization Architecture.
- **Detailed Error Reports:**  Provides detailed error reports including stack traces, context information (user ID, tenant ID, input source), and environment details.
- **Centralized Error Tracking:**  Sends error reports to a Sentry project for centralized management, analysis, and resolution.
- **Alerting and Notifications:**  Sentry can be configured to send alerts and notifications when new errors occur, enabling prompt issue resolution.
- **Integration:**  Utilizes `@sentry/nextjs` for integration within Next.js applications (both client-side and server-side).
- **Location:** `packages/observability/` - client and server initialization, error parsing and capturing utilities.

## API Reference

### Schema Registry API

*(Illustrative - actual API may vary based on implementation)*

```typescript
import { schemaRegistry, SchemaInfo } from '@repo/schema';
import { z } from 'zod';

// Register a new schema
schemaRegistry.register({
  name: 'client',
  version: '1.0.0',
  description: 'Schema for client entity',
  schema: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  config: { // Normalization configurations per field
    name: { trim: true, titleCase: true },
    email: { lowercase: true },
    phone: { formatPhone: true, defaultRegion: 'US' },
  }
} as SchemaInfo);

// Retrieve a schema by name and version
const clientSchemaInfo = schemaRegistry.get('client', '1.0.0');
if (clientSchemaInfo) {
  const schema = clientSchemaInfo.schema;
  const config = clientSchemaInfo.config;
  // ... use schema and config ...
}

// Retrieve the latest version of a schema
const latestClientSchemaInfo = schemaRegistry.get('client'); // Version defaults to 'latest'
if (latestClientSchemaInfo) {
  // ...
}

// List all registered schemas
const allSchemas: SchemaInfo[] = schemaRegistry.list();
```

### Transform Pipeline API

*(Illustrative - actual API may vary based on implementation)*

```typescript
import { createTransformPipeline, TransformationStage, TransformationContext } from '@repo/schema';
import { ResilientNormalizer, ResilienceOptions } from '@repo/schema/resilience/error-handler';
import { teamSchema } from '@repo/schema/entities/team'; // Example schema

// Define pipeline stages
const sanitizeStage: TransformationStage<any> = {
  name: 'sanitize',
  transform: (data, context) => sanitizeTeamData(data), // Assuming sanitizeTeamData function exists
};

const normalizeStage: TransformationStage<any> = {
  name: 'normalize',
  transform: (data, context) => normalizeTeamData(data), // Assuming normalizeTeamData function exists
};

const validateStage: TransformationStage<any> = {
  name: 'validate',
  transform: async (data, context) => {
    const resilientValidator = new ResilientNormalizer({ strategy: 'use-partial' }); // Example resilience strategy
    const validationResult = await resilientValidator.normalize(teamSchema, data, context);
    if (!validationResult.success) {
      console.warn("[Validation Stage] Validation errors, using partial data:", validationResult.errors);
      // Even with 'use-partial', you might want to throw an error if you want to reject the entire pipeline in case of validation issues.
      // throw new Error("Validation Failed", { cause: validationResult.errors });
    }
    return validationResult.result; // Returns partial data on validation failure if 'use-partial' strategy is used
  },
};

const monitoringStage: TransformationStage<any> = {
  name: 'monitor',
  transform: (data, context) => monitorDataQuality('team', data), // Assuming monitorDataQuality function exists
};


// Create a transformation pipeline with resilience options
const teamPipeline = createTransformPipeline({
  name: 'teamDataPipeline',
  stages: [sanitizeStage, normalizeStage, validateStage, monitoringStage],
  resilienceOptions: { // Pipeline-level resilience configuration
    strategy: 'use-partial', // Default resilience strategy for pipeline stages
    logErrors: true,
  }
});

// Process data through the pipeline
const inputData = { name: '  my team  ', description: 'Team description with <script>alert("XSS")</script>', members: [] };
const context: TransformationContext = { userId: 'user-123', source: 'web-form' };

teamPipeline.process(inputData, context)
  .then(pipelineResult => {
    console.log("Pipeline Result:", pipelineResult.result);
    console.log("Changes:", pipelineResult.changes);
    console.log("Metrics:", pipelineResult.metrics);
  })
  .catch(error => {
    console.error("Pipeline Error:", error); // Pipeline level error handling (if strategy 'reject' is used and an error is not recovered)
  });
```

### Resilient Normalizer API

*(Illustrative - actual API may vary based on implementation)*

```typescript
import { ResilientNormalizer, ResilienceOptions } from '@repo/schema/resilience/error-handler';
import { teamSchema, TeamData } from '@repo/schema/entities/team'; // Example schema

const resilienceConfig: ResilienceOptions = {
  strategy: 'use-default',
  defaultValues: { name: 'Default Team Name', members: [] },
  logErrors: true,
};

const resilientNormalizer = new ResilientNormalizer(resilienceConfig);

const dataToNormalize = { name: '', members: null }; // Invalid data

resilientNormalizer.normalize<TeamData>(teamSchema, dataToNormalize, { source: 'api-import' })
  .then(normalizationResult => {
    if (normalizationResult.success) {
      console.log("Normalization Success:", normalizationResult.result);
    } else {
      console.warn("Normalization Failed:", normalizationResult.errors);
      console.log("Fallback Result:", normalizationResult.result); // Will be default values in this example
      console.log("Used Fallback:", normalizationResult.usedFallback); // true
    }
  })
  .catch(error => {
    console.error("Normalization Process Error:", error); // Error during normalization process itself (not validation error)
  });
```

### Data Quality Monitoring API (if applicable)

*(Illustrative - if you expose an API to query metrics directly)*

```typescript
// Example - if you have an API to query metrics
import { dataQualityMonitoring } from '@repo/schema'; // Hypothetical API endpoint

dataQualityMonitoring.getMetricsForEntity('client', 'completeness', { timeRange: 'last-24-hours' })
  .then(metrics => {
    console.log("Client Completeness Metrics:", metrics);
  })
  .catch(error => {
    console.error("Error fetching metrics:", error);
  });
```

## Configuration

The Data Normalization Architecture is configured through configuration files and environment variables, allowing for customization per environment and use case.

### Normalization Configuration

Normalization behavior is primarily configured within the `packages/schema/src/config/normalization.config.ts` file.

```typescript
// packages/schema/src/config/normalization.config.ts
export default {
  enableFeedback: true, // Enable UI feedback for normalization changes
  strictness: process.env.NODE_ENV === 'production' ? 'moderate' : 'relaxed', // Validation strictness level
  localization: {
    defaultLocale: 'en-US',
    defaultPhoneRegion: 'US',
  },
  textNormalization: {
    trimWhitespace: true,
    normalizeCase: true,
    removeExtraSpaces: true,
  },
  // ... other normalization configurations ...
};
```

### Resilience Configuration

Resilience strategies for the Transform Pipeline and `ResilientNormalizer` are configured programmatically when creating pipelines and normalizers, as shown in the API Reference examples.

```typescript
// Example resilience configuration for a pipeline stage or ResilientNormalizer
const resilienceConfig: ResilienceOptions = {
  strategy: 'use-partial', // 'use-default', 'use-original', 'reject'
  defaultValues: { /* ... default values if using 'use-default' strategy ... */ },
  logErrors: true, // Enable error logging
};
```

### Observability Configuration

Observability features (logging, monitoring, error reporting) are configured through:

- **Logging Configuration:** Logging levels and destinations can be configured within the logging utility (`packages/observability/log.ts` or a dedicated logging library configuration).
- **Monitoring Configuration:**  Configuration for data quality metrics, monitoring intervals, and dashboard integrations would be defined in the `packages/schema/src/monitoring/index.ts` or a separate monitoring configuration file.
- **Error Reporting (Sentry) Configuration:** Sentry is configured using environment variables (Sentry DSN) and within the `packages/observability/` files. See Sentry documentation for detailed configuration options.

### Environment Variables

Environment variables can override default configurations and provide environment-specific settings:

| Variable                    | Description                                 | Default   |
|-----------------------------|---------------------------------------------|-----------|
| `NORMALIZATION_STRICTNESS`  | Validation strictness (strict/moderate/relaxed) | `moderate`|
| `NORMALIZATION_FEEDBACK`    | Show normalization feedback to users         | `true`    |
| `DEFAULT_LOCALE`            | Default locale for normalization            | `en-US`   |
| `NORMALIZATION_LOG_LEVEL`   | Logging level for normalization pipeline (e.g., `verbose`, `info`, `warn`, `error`) | `info`    |
| `SENTRY_DSN`                | Sentry Data Source Name (for error reporting) | *Not Set* |
| `BETTERSTACK_API_KEY`       | API Key for BetterStack status monitoring   | *Not Set* |
| `BETTERSTACK_URL`           | URL for BetterStack status page            | *Not Set* |

## Usage Examples

### Basic Form Normalization with Resilience

```typescript
import { processTeamData } from '@repo/schema/pipeline/team-pipeline'; // Example pipeline
import { useState } from 'react';

function TeamFormComponent() {
  const [formData, setFormData] = useState({ name: '', description: '', members: [] });
  const [normalizedData, setNormalizedData] = useState(null);
  const [pipelineErrors, setPipelineErrors] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await processTeamData(formData, { userId: 'user-form', source: 'team-form' });
      setNormalizedData(result.result);
      setPipelineErrors(null); // Clear any previous errors
      console.log("Normalized Data:", result.result);
      console.log("Normalization Changes:", result.changes);
      console.log("Pipeline Metrics:", result.metrics);
      // ... proceed to save normalizedData to database ...
    } catch (error) {
      console.error("Normalization Pipeline Error:", error);
      setPipelineErrors(error);
      setNormalizedData(null); // Clear normalized data if error occurred
      // Optionally display error feedback to the user
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... form fields bound to formData state ... */}
      <button type="submit">Submit Team</button>
      {pipelineErrors && <p className="text-destructive">Error during normalization: {pipelineErrors.message}</p>}
      {normalizedData && <p className="text-success">Data Normalized Successfully!</p>}
    </form>
  );
}
```

### Bulk Import Normalization with Error Handling

```typescript
import { createBulkNormalizer } from '@repo/schema/bulk'; // Hypothetical bulk normalizer utility
import { clientSchema } from '@repo/schema/entities/client'; // Example schema

async function normalizeClientCSVImport(csvData) {
  const bulkNormalizer = createBulkNormalizer({
    schema: clientSchema,
    batchSize: 100,
    reportProgress: true,
    resilienceOptions: { strategy: 'use-partial', logErrors: true }, // Resilience for bulk normalization
  });

  const results = await bulkNormalizer.process(csvData, {
    continueOnError: true, // Continue processing even if some items have errors
    context: { source: 'csv-import' }
  });

  console.log("Bulk Normalization Results:", results);
  // results object contains:
  // - normalized: array of successfully normalized items
  // - errors: array of errors encountered during normalization
  // - metrics: overall bulk normalization metrics

  return {
    normalizedClients: results.items,
    importErrors: results.errors,
    bulkMetrics: results.metrics,
  };
}
```

### Monitoring Data Quality via Dashboard

*(Assuming a Data Quality Dashboard UI is implemented)*

1.  **Access the Data Quality Dashboard:** Navigate to the Data Quality Dashboard URL within the Lavel AI platform (implementation-specific URL).
2.  **View Data Quality Metrics:**  The dashboard will display charts and graphs showing data quality metrics for different entities (e.g., clients, teams, cases). Metrics might include completeness scores, validation success rates, and consistency metrics.
3.  **Analyze Trends:**  Observe trends in data quality metrics over time to identify potential data quality issues or improvements.
4.  **Set up Alerts (Future):**  In the future, configure alerts within the dashboard to be notified when data quality metrics fall below acceptable levels.

## Testing

Comprehensive testing is critical to ensure the reliability and effectiveness of the Data Normalization Architecture. Testing should cover various aspects:

### Unit Testing Normalizers

- **Purpose:** Verify the correctness of individual normalizer functions in isolation.
- **Scope:** Test each normalizer function in `packages/schema/src/utils/normalize.ts` and entity-specific normalizers.
- **Test Cases:** Cover various input scenarios including valid inputs, invalid inputs, edge cases (empty strings, null values, special characters), and locale-specific inputs.
- **Example:** `packages/schema/tests/normalization/name-normalizer.test.ts` (as provided in initial documentation).

### Integration Testing Pipelines

- **Purpose:** Validate the end-to-end functionality of transformation pipelines, ensuring stages are correctly integrated and data flows as expected.
- **Scope:** Test pipelines defined in `packages/schema/src/pipeline/` (e.g., `teamPipeline`, client pipelines).
- **Test Cases:**
    - Process valid data through pipelines and verify the normalized output.
    - Process invalid data and test resilience strategies (fallback behavior, error handling).
    - Verify that changes are tracked correctly and metrics are generated.
    - Test pipeline behavior with different configurations and contexts.
- **Example:** `packages/schema/tests/integration/client-normalization.test.ts` (as provided in initial documentation, needs to be adapted for pipeline testing).

### Observability Testing

- **Purpose:** Verify that logging, monitoring, and error reporting features are working correctly.
- **Scope:** Test logging at each pipeline stage, data quality metric calculation and reporting, and error reporting to Sentry.
- **Test Cases:**
    - Introduce errors in pipeline stages and verify that errors are logged with appropriate context.
    - Validate that data quality metrics are calculated correctly and reported to the dashboard (or logged).
    - Simulate exceptions within pipelines and verify that error reports are sent to Sentry.
    - Test different logging levels and verify that logs are filtered correctly.

### Resilience Testing

- **Purpose:**  Ensure that resilience strategies (configured in `ResilientNormalizer` and pipelines) function as expected under error conditions.
- **Scope:** Test the `ResilientNormalizer` class and pipelines configured with different resilience strategies (`use-partial`, `use-default`, `use-original`, `reject`).
- **Test Cases:**
    - Provide invalid data to pipelines and normalizers and verify that the chosen resilience strategy is applied (e.g., partial data is returned, default values are used, errors are rejected).
    - Verify that fallback mechanisms are triggered correctly and log messages indicate fallback actions.
    - Test error scenarios and ensure that the system recovers gracefully without crashing.

## Troubleshooting

### Common Issues

| Issue                       | Possible Cause                           | Solution                                                     | Observability Tools for Diagnosis                                  |
|-----------------------------|------------------------------------------|--------------------------------------------------------------|--------------------------------------------------------------------|
| Inconsistent normalization  | Different pipeline configurations        | Ensure consistent configuration across environments           | Check configuration files, environment variables, pipeline logs     |
| Normalization errors        | Unexpected input formats                 | Add additional validation and sanitization steps              | Examine pipeline logs for error details, Sentry error reports       |
| Validation errors           | Data violates schema constraints          | Review schema definitions, adjust normalizers, or update input data | Check validation error logs, Sentry error reports, data quality metrics |
| Performance issues          | Large data sets or complex rules         | Use bulk normalization with batching for large sets, optimize normalizers | Monitor pipeline metrics (stage timings), system performance metrics |
| UI feedback not showing     | Configuration disabled                   | Check `enableFeedback` in configuration                     | Inspect browser console for configuration settings                |
| Data quality degradation    | Changes in data sources, pipeline errors  | Investigate data quality dashboard for metric trends         | Analyze pipeline logs and Sentry error reports for root causes     |

### Debugging and Logging

- **Enable Detailed Logging:** Configure logging level to `verbose` or `debug` in `packages/schema/src/config/normalization.config.ts` (if implemented as a configuration option) or through environment variables (`NORMALIZATION_LOG_LEVEL`).
- **Examine Pipeline Logs:** Check application logs (using your logging infrastructure - e.g., `@repo/observability/log`) for detailed logs of each pipeline stage, transformations, validation results, and errors. Logs should include context information (stage name, entity type, user ID, etc.).
- **Use Debugger:** Step through the pipeline code using a debugger to inspect data transformations and identify issues at specific stages.

### Monitoring and Alerting

- **Data Quality Dashboard:** Regularly monitor the Data Quality Dashboard to track data quality metrics, identify trends, and detect anomalies.
- **Sentry Error Dashboard:**  Use the Sentry dashboard to monitor error reports from the Data Normalization Architecture. Investigate new errors, analyze stack traces, and resolve issues promptly.
- **Alert Configuration (Future):**  In the future, set up alerts in your monitoring system or Data Quality Dashboard to be notified automatically when data quality metrics degrade or error rates exceed thresholds.

## Design Decisions

### Layered Pipeline Architecture

- **Rationale:**  The pipeline pattern promotes modularity, maintainability, and testability. Each stage has a specific responsibility (sanitization, normalization, validation, monitoring), making the system easier to understand and evolve. Layered approach allows for targeted error handling and optimization at each step.

### Schema-Driven Approach for Validation and Normalization

- **Rationale:** Using schemas (Zod) as the central definition for both validation rules and normalization configurations ensures consistency, reduces code duplication, and simplifies schema evolution. Schemas act as a single source of truth for data structure and transformation logic.

### Resilience and Fallback Strategies

- **Rationale:** Data normalization pipelines often encounter errors due to unexpected input formats or data quality issues. Implementing resilience strategies (via `ResilientNormalizer`) is crucial for building robust systems that can handle errors gracefully without complete failure. Configurable fallback strategies allow for flexibility in how errors are handled based on business requirements.

### Integrated Observability

- **Rationale:** Observability (logging, monitoring, error reporting) is no longer an afterthought but a core design principle. Integrating observability into each pipeline stage provides essential insights into the data normalization process, enabling proactive issue detection, performance monitoring, and data quality assurance. Centralized error reporting (Sentry) streamlines debugging and resolution.

### Reusable Input Components (Design System)

- **Rationale:** Creating reusable, normalization-aware input components in the Design System promotes consistency across UI forms, reduces code duplication, and simplifies form development. Embedding normalization logic within input components ensures that data entered through UI forms is automatically normalized, aligning with the overall architecture.

## Contributing

### Adding New Normalizers

1.  **Create Normalizer Function:** Implement a new normalizer function in `packages/schema/src/utils/normalize.ts` or a relevant utility file (e.g., `packages/schema/src/utils/client.ts` for client-specific normalizers).
2.  **Unit Tests:** Write unit tests for the new normalizer in the appropriate test file (e.g., `packages/schema/tests/normalization/`). Ensure comprehensive test coverage for various input scenarios.
3.  **Register Normalizer in Schema:** Register the new normalizer in the `config` section of the relevant schema definition in `packages/schema/src/entities/`. Associate the normalizer with the appropriate schema field.
4.  **Documentation:** Document the new normalizer function in `packages/schema/README.md` or relevant documentation sections, explaining its purpose, usage, and any configuration options.

### Modifying Existing Normalizers

1.  **Create New Schema Version:** When modifying an existing normalizer, create a new version of the schema in `packages/schema/src/evolution/schema-versions.ts`.
2.  **Implement Migration (if needed):** If the schema change is not backward-compatible, provide data migration utilities to transform data normalized with the old schema to the new schema version.
3.  **Update Tests:** Update unit and integration tests to cover both the old and new behavior of the modified normalizer and schema version.
4.  **Document Changes:** Document the changes in the schema version history and update the documentation to reflect the modified normalizer and schema version.

### Contributing to Observability

1.  **Enhance Logging:**  Add more detailed and contextual logging to pipeline stages or normalizers to improve debugging and monitoring. Follow existing logging conventions and use appropriate logging levels.
2.  **Add New Metrics:** Define and implement new data quality metrics in `packages/schema/src/monitoring/index.ts` to provide more comprehensive data quality insights.
3.  **Improve Dashboard Visualizations:** Contribute to the Data Quality Dashboard UI (implementation-specific location) to enhance visualizations, add new metrics, or improve user experience.
4.  **Error Reporting Enhancements:** Improve error reporting to Sentry by adding more context information to error reports or implementing custom error handling logic.

### Testing Contributions

- **Unit Tests:** Ensure all code changes are accompanied by unit tests with adequate coverage.
- **Integration Tests:** Update or add integration tests to verify the impact of changes on pipeline functionality and data flow.
- **Observability Tests:**  For contributions related to observability, add tests to verify logging, monitoring, and error reporting features.
- **Resilience Tests:** For contributions that modify error handling or resilience strategies, add tests to validate the intended resilience behavior under error conditions.

## Change Log

| Version | Date       | Changes                                                                                                                                                                                                 |
|---------|------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 2.0.0   | 2025-02-28 | - **Revised Architecture:**  Introduced Resilient Stages in Transform Pipeline, Data Quality Dashboard, Enhanced Error Reporting (Sentry).\n            - **Integrated Observability:** Added error logging and monitoring to each pipeline stage, data quality metrics, and Sentry integration.\n            - **Enhanced Resilience:** Implemented `ResilientNormalizer` with configurable error recovery strategies.\n            - **Updated Documentation:** Rewritten documentation to reflect Version 2.0 architecture and new features. |
| 1.0.0   | 2025-02-27 | Initial documentation (Version 1.0)                                                                                                                                                                    |
```