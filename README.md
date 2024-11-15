# @stackql/deno-openapi-dereferencer

A Deno module to recursively dereference and flatten OpenAPI specifications. This module provides functions to handle `$ref`, `allOf`, `oneOf`, and `anyOf` structures, creating a fully dereferenced and optionally flattened document.  

See the project on [__jsr__](https://jsr.io/@stackql/deno-openapi-dereferencer) for more info.

## Features

- **Full dereferencing**: Resolves all `$ref` references within an OpenAPI specification.
- **Flattening**: Merges `allOf` schemas into a single object.
- **Selective processing**: Allows dereferencing from a specific path within the document.
- **Path-based exclusion**: Optionally skip dereferencing for specific paths within the document using `ignorePaths`.

## Usage

### Importing the Module

To use the module, import it from Deno Land:

```typescript
import { 
    dereferenceApi, 
    flattenAllOf, 
    selectFirstOfOneOf, 
    selectFirstOfAnyOf 
} from "jsr:@stackql/deno-openapi-dereferencer";
```

### Example Usage

#### Fully Dereference an OpenAPI Document

```typescript
import { dereferenceApi } from "jsr:@stackql/deno-openapi-dereferencer";

const apiDoc = await Deno.readTextFile("./path/to/openapi.yaml");
const dereferencedDoc = await dereferenceApi(apiDoc);
console.log(dereferencedDoc);
```

#### Flatten `allOf` Properties

```typescript
import { flattenAllOf } from "jsr:@stackql/deno-openapi-dereferencer";

const flattenedDoc = await flattenAllOf(dereferencedDoc);
console.log(flattenedDoc);
```

#### Selective Dereferencing with Ignore Paths

```typescript
import { dereferenceApi } from "jsr:@stackql/deno-openapi-dereferencer";

const apiDoc = await Deno.readTextFile("./path/to/openapi.yaml");
const ignorePaths = ["$.components.x-stackQL-resources"];  // Exclude specific paths
const dereferencedDoc = await dereferenceApi(apiDoc, "$", ignorePaths);
console.log(dereferencedDoc);
```

### Functions

- **`dereferenceApi(apiDoc: any, startAt: string = "$", ignorePaths?: string[]): Promise<any>`**  
  Dereferences `$ref` properties from a specified path in the OpenAPI document. 
  - **Parameters:**
    - `apiDoc`: The OpenAPI document object to be dereferenced.
    - `startAt` (optional): JSONPath to specify the starting point for dereferencing. Defaults to the root (`"$"`).
    - `ignorePaths` (optional): Array of JSONPath expressions. Any `$ref` found in these paths will be ignored.
  - **Returns**: The fully dereferenced document.

- **`flattenAllOf(apiDoc: any): Promise<any>`**  
  Flattens `allOf` properties in an OpenAPI document, merging schemas into a single object.
  - **Parameters:**
    - `apiDoc`: The OpenAPI document object to be flattened.
  - **Returns**: The document with `allOf` properties flattened.

- **`selectFirstOfOneOf(apiDoc: any): Promise<any>`**  
  Simplifies `oneOf` arrays by selecting the first schema.
  - **Parameters:**
    - `apiDoc`: The OpenAPI document object to process.
  - **Returns**: The document with `oneOf` arrays simplified.

- **`selectFirstOfAnyOf(apiDoc: any): Promise<any>`**  
  Simplifies `anyOf` arrays by selecting the first schema.
  - **Parameters:**
    - `apiDoc`: The OpenAPI document object to process.
  - **Returns**: The document with `anyOf` arrays simplified.

## Testing

Run tests using Deno’s testing suite:

```bash
deno test --allow-read
```

## License

MIT License.