# @stackql/deno-openapi-dereferencer

A Deno module to recursively dereference and flatten OpenAPI specifications. This module provides functions to handle `$ref`, `allOf`, `oneOf`, and `anyOf` structures, creating a fully dereferenced and optionally flattened document.

## Features

- **Full dereferencing**: Resolves all `$ref` references within an OpenAPI specification.
- **Flattening**: Merges `allOf` schemas into a single object.
- **Selective processing**: Allows dereferencing from a specific path within the document.

## Usage

### Importing the Module

To use the module, import it from Deno Land:

```typescript
import { dereferenceApi, flattenAllOf, selectFirstOfOneOf, selectFirstOfAnyOf } from "jsr:@stackql/deno-openapi-dereferencer@latest";
```

### Example Usage

#### Fully Dereference an OpenAPI Document

```typescript
import { dereferenceApi } from "jsr:@stackql/deno-openapi-dereferencer@latest";
const apiDoc = await Deno.readTextFile("./path/to/openapi.yaml");
const dereferencedDoc = await dereferenceApi(apiDoc);
console.log(dereferencedDoc);
```

#### Flatten `allOf` Properties

```typescript
import { flattenAllOf } from "jsr:@stackql/deno-openapi-dereferencer@latest";
const flattenedDoc = await flattenAllOf(dereferencedDoc);
console.log(flattenedDoc);
```

### Functions

- **`dereferenceApi(apiDoc: any, startAt: string = "$"): Promise<any>`**  
  Dereferences `$ref` properties from a specified path in the OpenAPI document. If no path is provided, it dereferences the entire document.

- **`flattenAllOf(apiDoc: any): Promise<any>`**  
  Flattens `allOf` properties in an OpenAPI document, merging schemas into a single object.

- **`selectFirstOfOneOf(apiDoc: any): Promise<any>`**  
  Simplifies `oneOf` arrays by selecting the first schema.

- **`selectFirstOfAnyOf(apiDoc: any): Promise<any>`**  
  Simplifies `anyOf` arrays by selecting the first schema.

## Testing

Run tests using Deno’s testing suite:

```bash
deno test --allow-read
```

## License

MIT License.
