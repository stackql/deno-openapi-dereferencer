// Copyright 2024 StackQL. All rights reserved. MIT License.

/**
 * A Deno module for recursively dereferencing and flattening OpenAPI specifications.
 * This module provides functions to handle `$ref`, `allOf`, `oneOf`, and `anyOf` structures,
 * creating a fully dereferenced and optionally flattened document.
 *
 * ## Features
 *
 * - **Full dereferencing**: Resolves all `$ref` references within an OpenAPI specification.
 * - **Flattening**: Merges `allOf` schemas into a single object.
 * - **Selective processing**: Allows dereferencing from a specific path within the document.
 *
 * ## Usage
 *
 * ### Importing the Module
 *
 * To use this module, import it from JSR:
 *
 * ```typescript
 * import { 
 *  dereferenceApi, 
 *  flattenAllOf, 
 *  selectFirstOfOneOf, 
 *  selectFirstOfAnyOf 
 * } from "jsr:@stackql/deno-openapi-dereferencer";
 * ```
 *
 * ### Examples
 *
 * #### Fully Dereference an OpenAPI Document
 *
 * ```typescript
 * import { dereferenceApi } from "jsr:@stackql/deno-openapi-dereferencer";
 * const apiDoc = await Deno.readTextFile("./path/to/openapi.yaml");
 * const dereferencedDoc = await dereferenceApi(apiDoc);
 * console.log(dereferencedDoc);
 * ```
 *
 * #### Flatten `allOf` Properties
 *
 * ```typescript
 * import { flattenAllOf } from "jsr:@stackql/deno-openapi-dereferencer";
 * const flattenedDoc = await flattenAllOf(dereferencedDoc);
 * console.log(flattenedDoc);
 * ```
 *
 * ## Functions
 *
 * - {@linkcode dereferenceApi} - Dereferences `$ref` properties from a specified path in the OpenAPI document.
 * - {@linkcode flattenAllOf} - Flattens `allOf` properties, merging schemas into a single object.
 * - {@linkcode selectFirstOfOneOf} - Simplifies `oneOf` arrays by selecting the first schema.
 * - {@linkcode selectFirstOfAnyOf} - Simplifies `anyOf` arrays by selecting the first schema.
 *
 * ## Testing
 *
 * Run tests using Deno’s testing suite:
 *
 * ```bash
 * deno test --allow-read
 * ```
 *
 * @module
 */

export * from "./dereferencer.ts";