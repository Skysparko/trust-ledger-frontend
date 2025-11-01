# API Integration Architecture

This codebase follows a layered, class-based service pattern for API integration.

## Architecture Overview

```
Component → Custom Hook (useTask) → SwrFetcher → API Class (TaskApi) → BaseApi → Axios Instance → Backend
```

## Architecture Layers

### 1. Axios Instance Layer (`lib/axios.ts`)

- Configured Axios instance with base URL
- **Request interceptor**: Adds auth token from cookies/localStorage
- **Response interceptor**: Handles 401 errors and redirects to login
- Global configuration for all API calls

### 2. Base API Class (`api/base.api.ts`)

- Abstract base class with static methods
- Common HTTP methods: `get`, `post`, `put`, `delete`, `patch`
- Unified error handling
- Handles FormData for file uploads
- Extracts data from standardized API response format: `{ success, data, message }`

### 3. Domain-Specific API Classes (`api/*.api.ts`)

- Static class methods (no instantiation needed)
- Each class represents a domain/entity:
  - `AuthApi` - Authentication
  - `InvestmentApi` - Investments
  - `IssuanceApi` - Bond issuances
  - `ProjectApi` - Projects
  - `ProfileApi` - User profile
  - `AdminApi` - Admin operations
- Methods use BaseApi methods internally
- Type-safe with TypeScript generics

### 4. SWR Fetcher Adapter (`hooks/swr-fetcher.ts`)

- Centralized mapping between API classes and SWR keys
- Provides `SwrKeys` object for consistent key generation
- All fetcher functions are available for direct API calls

### 5. Custom Hooks (`hooks/swr/*.ts`)

- React hooks wrapping SWR
- Use SwrKeys for consistent data fetching
- Expose useSWR features (loading, error, mutate)
- Available hooks:
  - `useAuth()` - Current authenticated user
  - `useInvestments()` - List investments
  - `useIssuances()` - List issuances
  - `useProjects()` - List projects
  - `useProfile()` - User profile
  - `useAdmin*()` - Admin operations

## Usage Examples

### Using API Classes Directly

```typescript
import { AuthApi } from "@/api/auth.api";

// Login
const user = await AuthApi.login({ email: "user@example.com", password: "password" });

// Get investments
import { InvestmentApi } from "@/api/investment.api";
const investments = await InvestmentApi.getInvestments();
```

### Using Custom Hooks

```typescript
import { useInvestments } from "@/hooks/swr/useInvestments";

function MyComponent() {
  const { investments, isLoading, error, mutate } = useInvestments();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {investments.map(inv => (
        <div key={inv.id}>{inv.issuance}</div>
      ))}
    </div>
  );
}
```

### Creating Mutations

```typescript
import { useCreateInvestment } from "@/hooks/swr/useInvestments";

function CreateInvestmentForm() {
  const { createInvestment, isCreating, error } = useCreateInvestment();
  
  const handleSubmit = async (data) => {
    await createInvestment(data);
    // Data will be automatically revalidated
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Pattern Characteristics

✅ Class-based static methods (no instantiation)  
✅ Layered architecture (separation of concerns)  
✅ Centralized error handling  
✅ Type safety with TypeScript generics  
✅ Interceptors for cross-cutting concerns (auth)  
✅ SWR integration for data fetching/caching  
✅ Standardized API response format

