import { JSONPath } from "https://esm.sh/jsonpath-plus@7.0.0";

export async function dereferenceApi(
  apiDoc: any,
  startAt: string = "$"
): Promise<any> {
  const dereferencedDoc = JSON.parse(JSON.stringify(apiDoc)); // Deep copy to avoid mutation

  async function processSchema(schema: any): Promise<any> {
    if (!schema) return schema;
 
    // Dereference `$ref`
    if (schema.$ref) {
      schema = await resolveRef(schema, apiDoc);
    }
  
    // Recursively process nested objects
    if (typeof schema === "object" && schema !== null) {
      for (const key in schema) {
        schema[key] = await processSchema(schema[key]);
      }
    }
  
    return schema;
  }
 
  // Use JSONPath to get the target schema using `startAt`
  const startSchema = JSONPath({
    path: startAt,
    json: dereferencedDoc,
    resultType: "value"
  });

  if (startSchema.length === 0) {
    console.warn(`Path ${startAt} could not be fully resolved.`);
    return undefined;
  }

  // Process only the first matching startSchema if specified
  const processedSection = await processSchema(startSchema[0]);

  // Replace the original section with the processed section
  JSONPath({
    path: startAt,
    json: dereferencedDoc,
    resultType: "value",
    callback: () => processedSection
  });

  return dereferencedDoc;
}

export async function flattenAllOf(apiDoc: any): Promise<any> {
  async function processAllOf(schema: any): Promise<any> {
    if (!schema || typeof schema !== "object") return schema;

    if (schema.allOf && Array.isArray(schema.allOf)) {
      // Flatten allOf by merging all properties into a single schema object
      schema = schema.allOf.reduce((merged: any, subSchema: any) => {
        return {
          ...merged,
          ...subSchema,
          properties: {
            ...(merged.properties || {}),
            ...(subSchema.properties || {}),
          },
        };
      }, {});

      // Remove the allOf property as it's now flattened
      delete schema.allOf;
    }

    // Recursively process nested schemas
    for (const key in schema) {
      schema[key] = await processAllOf(schema[key]);
    }

    return schema;
  }

  // Deep clone to avoid mutating original document
  const flattenedDoc = JSON.parse(JSON.stringify(apiDoc));
  await processAllOf(flattenedDoc);
  return flattenedDoc;
}

export async function selectFirstOfOneOf(apiDoc: any): Promise<any> {
  async function processOneOf(schema: any): Promise<any> {
    if (!schema || typeof schema !== "object") return schema;

    if (schema.oneOf && Array.isArray(schema.oneOf)) {
      // Replace oneOf with the first item in the array
      schema = schema.oneOf[0];
    }

    // Recursively process nested schemas
    for (const key in schema) {
      schema[key] = await processOneOf(schema[key]);
    }

    return schema;
  }

  // Deep clone to avoid mutating original document
  const processedDoc = JSON.parse(JSON.stringify(apiDoc));
  await processOneOf(processedDoc);
  return processedDoc;
}

export async function selectFirstOfAnyOf(apiDoc: any): Promise<any> {
  async function processAnyOf(schema: any): Promise<any> {
    if (!schema || typeof schema !== "object") return schema;

    if (schema.anyOf && Array.isArray(schema.anyOf)) {
      // Replace anyOf with the first item in the array
      schema = schema.anyOf[0];
    }

    // Recursively process nested schemas
    for (const key in schema) {
      schema[key] = await processAnyOf(schema[key]);
    }

    return schema;
  }

  // Deep clone to avoid mutating original document
  const processedDoc = JSON.parse(JSON.stringify(apiDoc));
  await processAnyOf(processedDoc);
  return processedDoc;
}

async function resolveRef(obj: any, api: any): Promise<any> {
  if (obj && obj.$ref) {
    const refPath = obj.$ref.replace(/^#\//, '').split('/');
    let derefObj = api;
    for (const part of refPath) {
      derefObj = derefObj[part];
      if (!derefObj) throw new Error(`Could not resolve $ref path: ${obj.$ref}`);
    }
    return await resolveRef(derefObj, api); // Recursively dereference nested $ref
  }
  
  if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      obj[key] = await resolveRef(obj[key], api);
    }
  }
  
  return obj;
}
