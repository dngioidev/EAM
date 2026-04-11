# Input Sanitization

## Validation Pipe (Global)

Set in `main.ts` — strips unknown fields and validates all inputs:

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,            // Strip properties not in DTO
  forbidNonWhitelisted: true, // Throw 400 if unknown properties present
  transform: true,            // Auto-transform payloads to DTO types
  disableErrorMessages: false,
  validationError: { target: false }, // Don't expose the class in errors
}));
```

## SQL Injection Prevention

TypeORM parameterized queries are the default defense. Enforce:

```typescript
// ❌ String interpolation — SQL injection risk
.where(`order.reference = '${userInput}'`)

// ✅ Parameterized — safe
.where('order.reference = :ref', { ref: userInput })
```

Never use raw SQL without parameterization.

## HTML/Script Injection Prevention

For any field that might be rendered in HTML output (e.g., product names, notes):

```typescript
import { IsString, MaxLength, Matches } from 'class-validator';

export class CreateProductDto {
  // Reject HTML tags in name fields
  @IsString()
  @MaxLength(255)
  @Matches(/^[^<>]*$/, { message: 'HTML tags are not allowed' })
  name: string;

  @IsString()
  @MaxLength(2000)
  description: string;
}
```

## Path Traversal Prevention

Never use user input directly in file paths:

```typescript
// ❌ Dangerous
const filePath = `./uploads/${userInput}`;
fs.readFile(filePath);

// ✅ Safe
import path from 'path';
const safeFilename = path.basename(userInput); // strips path components
const uploadDir = path.resolve('./uploads');
const filePath = path.join(uploadDir, safeFilename);
// Verify file is still inside upload dir
if (!filePath.startsWith(uploadDir)) {
  throw new BadRequestException('Invalid file path');
}
```

## Security Headers Validation

Ensure these are set (Helmet sets most of them):

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```
