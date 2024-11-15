import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { 
  dereferenceApi,
  flattenAllOf,
  selectFirstOfOneOf,
  selectFirstOfAnyOf,
} from "./dereferencer.ts";
import { read } from "https://deno.land/x/openapi@0.1.0/mod.ts";

// Read the sample OpenAPI document
const apiDocApps = await read("./tests/docs/apps.yaml");
const apiDocVpcs = await read("./tests/docs/vpcs.yaml");
const apiDocBilling = await read("./tests/docs/billing.yaml");

// Test dereferenceApi function to ensure all $ref's are dereferenced
Deno.test("should fully dereference an OpenAPI document", async () => {
  const dereferencedDoc = await dereferenceApi(apiDocApps);

  // Traverse through dereferencedDoc to check for any remaining $ref keys
  function hasRefs(schema: any): boolean {
    if (typeof schema !== "object" || schema === null) return false;
    if (schema.$ref) return true;

    for (const key in schema) {
      if (hasRefs(schema[key])) return true;
    }
    return false;
  }

  // Assert that there are no $ref properties in the document
  const refsExist = hasRefs(dereferencedDoc);
  assertEquals(refsExist, false, "The document should not contain any $ref properties.");
});

// Test dereferenceApi function starting from a specific path
Deno.test("should dereference an OpenAPI document from a specific path", async () => {
  const dereferencedDoc = await dereferenceApi(apiDocApps, '$.components.responses');

  // Write dereferenced output to a file for inspection, run with `deno test --allow-read --allow-write`
  // const yamlContent = yaml.dump(dereferencedDoc, { lineWidth: -1 });
  // Deno.writeTextFileSync("./tests/docs/apps-output.yaml", yamlContent);

  function hasRefs(schema: any): boolean {
    if (typeof schema !== "object" || schema === null) return false;
    if (schema.$ref) return true;

    for (const key in schema) {
      if (hasRefs(schema[key])) return true;
    }
    return false;
  }

  // Assert that there are no $ref properties in components.responses
  const refsInResponsesExist = hasRefs(dereferencedDoc.components?.responses);
  assertEquals(refsInResponsesExist, false, "The document's components.responses should not contain any $ref properties.");

  // Assert that $ref properties still exist in components.schemas
  const refsInSchemasExist = hasRefs(dereferencedDoc.paths);
  assertEquals(refsInSchemasExist, true, "The document's components.schemas should still contain $ref properties in paths.");
});

// Test flattenAllOf function to ensure all allOf properties are flattened
Deno.test("should flatten allOf properties in an OpenAPI document", async () => {

    function hasAllOf(schema: any): boolean {
      if (typeof schema !== "object" || schema === null) return false;
      if (schema.allOf) return true;
    
      return Object.values(schema).some((value) => hasAllOf(value));
    }
  
    const dereferencedDoc = await dereferenceApi(apiDocVpcs, "$.components"); // Dereference components only
    const flattenedDoc = await flattenAllOf(dereferencedDoc);
  
    // Access the specific schema to test the allOf flattening
    const allVpcsSchema = flattenedDoc.components?.responses?.all_vpcs?.content?.["application/json"]?.schema;
  
    // Confirm that there are no `allOf` properties left in the schema
    assertEquals(hasAllOf(allVpcsSchema), false, "The schema should not contain any allOf properties after flattening.");
  
    // Confirm essential structure is retained
    assertEquals("properties" in allVpcsSchema, true, "The flattened schema should contain properties.");

    assertEquals("vpcs" in allVpcsSchema.properties, true, "The 'vpcs' property should exist in the flattened schema.");

    assertEquals("meta" in allVpcsSchema.properties, true, "The 'meta' property should exist in the flattened schema.");
  
    // Verify specific property fields
    const vpcsProperties = allVpcsSchema.properties.vpcs.items.properties;
    assertEquals("name" in vpcsProperties, true, "The 'name' property should be present in flattened vpcs items.");

    assertEquals("created_at" in vpcsProperties, true, "The 'created_at' property should be present in flattened vpcs items.");

    assertEquals("region" in vpcsProperties, true, "The 'region' property should be present in flattened vpcs items.");
});

// Test ignorePaths in dereferenceApi function, should fail without ignorePaths
Deno.test("Negative Test: dereferenceApi should fail without ignorePaths", async () => {
  try {
    await dereferenceApi(apiDocBilling);
    console.error("Test failed: Expected an error due to unresolved $ref in x-stackQL-resources.");
  } catch (error) {
    if (error instanceof Error) {
      console.log("Test passed: Caught expected error:", error.message);
    } else {
      console.error("Test failed: Caught unexpected error type");
    }
  }
});

// Test ignorePaths in dereferenceApi function, should succeed with ignorePaths
Deno.test("Positive Test: dereferenceApi should succeed with ignorePaths", async () => {
  const ignorePaths = ["$.components.x-stackQL-resources"];
  try {
    const dereferencedDoc = await dereferenceApi(apiDocBilling, "$", ignorePaths);
    
    // Check if a known ref in `components` is resolved
    if (!dereferencedDoc.components.schemas["billing.v1.CostList"].properties.metadata.properties.next) {
      console.error("Test failed: Expected metadata next property to be resolved.");
    }

    // Check if a known ref in `paths` is resolved
    if (!dereferencedDoc.paths["/billing/v1/costs"].get.responses["200"].content["application/json"].schema.properties.data) {
      console.error("Test failed: Expected data property in paths to be resolved.");
    }

    console.log("Test passed: Dereferencing succeeded with ignorePaths.");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Test failed: Unexpected error with ignorePaths:", error.message);
    } else {
      console.error("Test failed: Caught unexpected error type");
    }
  }
});  
