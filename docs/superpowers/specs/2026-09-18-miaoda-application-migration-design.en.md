# Miaoda Application Page Migration Design

## Background

The LIVE Studio Local Data Access application page currently lives inside the VitePress documentation site. `DeveloperApplication.vue` implements a bilingual three-step form and submits applications through Formspree. This migration separates the application capability into an independently maintained, tested, and deployed application.

## Goals

- Create a private GitHub repository named `tiktok-live-studio-developer-application`.
- Migrate the application page without copying documentation, protocols, samples, or the gift catalog.
- Preserve English and Chinese content, the three-step form, responsive behavior, keyboard accessibility, and the existing TikTok visual style.
- Deploy the public application page as a Miaoda full-stack application.
- Write submissions from the Miaoda server to a new Feishu Base.
- Complete one real test submission and verify the full record in Base.

## Non-goals

- Do not modify or retire the existing Cloudflare Pages site.
- Do not redesign application review, credential delivery, or notification workflows.
- Do not migrate documentation navigation, search, demos, or the Agent Skill.
- Do not call Feishu OpenAPI directly from the browser or expose application credentials to the client.

## System Boundaries

The system has three isolated units:

1. **Application frontend** collects answers, validates each step, and presents submission state. It has no Feishu credentials.
2. **Miaoda server API** validates and normalizes requests, handles idempotency and duplicates, and calls Feishu OpenAPI.
3. **Feishu Base** stores application records for operational filtering, review, and collaboration.

The new repository contains only the frontend, server API, automated tests, deployment configuration, and project documentation. The current documentation repository remains unchanged and serves only as the migration source.

## Technical Approach

Use a locally developed Miaoda full-stack application.

- Build the frontend with Vue 3, TypeScript, and Vite.
- Extract reusable code from `DeveloperApplication.vue`, `developer-application.css`, `application-submission.mjs`, and the required icons.
- Remove all VitePress runtime dependencies and expose the form at the root route.
- Select English or Chinese from the browser language by default and provide an explicit language switch.
- Replace the Formspree endpoint with same-origin `POST /api/applications`.
- Keep the Feishu application credentials and Base identifiers in server-side environment or secure Miaoda configuration.
- Use Feishu OpenAPI to create records in the `Applications` table.
- Set the Miaoda runtime visibility to public for signed-out external users.

## Page Behavior

The page preserves the current three steps:

1. Applicant: full name, work email, country or region, team or company, role, and TikTok username.
2. Project: project name, description, technology stack, testing timeline, and demo URL.
3. Data needs: event types, interaction design, additional notes, and contact consent.

Client rules:

- Validate only fields visible in the current step.
- Require at least one LIVE event.
- Disable navigation and submission controls while submitting.
- Preserve all answers after a failed request.
- Do not retry automatically after a timeout or an uncertain result.
- Hide the form after success and display the returned `Application ID`.
- Reject a non-empty honeypot field and explain that autofill may have caused it.

## API Contract

### Request

`POST /api/applications`

The JSON body accepts only:

- `fullName`
- `workEmail`
- `countryOrRegion`
- `teamOrCompany`
- `role`
- `tiktokUsername`
- `gameName`
- `gameDescription`
- `technologyStack`
- `demoUrl`
- `testingTimeline`
- `eventTypes`
- `interactionDesign`
- `additionalNotes`
- `locale`
- `consent`
- `honeypot`

The server validates required fields, types, lengths, email and URL formats, enum values, and the honeypot. Unknown fields are ignored. Standard logs must not contain request headers, cookies, or submitted answers.

### Success Response

```json
{
  "ok": true,
  "applicationId": "APP-20260918-XXXXXX",
  "deduplicated": false
}
```

### Error Responses

| HTTP status | Code | Meaning |
| --- | --- | --- |
| `400` | `VALIDATION_ERROR` | Field validation failed |
| `409` | `SUBMISSION_CONFLICT` | The duplicate request could not be handled safely |
| `429` | `RATE_LIMITED` | Submission rate is too high |
| `502` | `BASE_WRITE_FAILED` | Base write failed |
| `504` | `SUBMISSION_UNCONFIRMED` | The write result could not be confirmed |

Error responses must not contain Feishu credentials, internal stacks, or full upstream responses.

## Idempotency and Duplicates

- The client creates an idempotency key for every explicit submission attempt.
- The server uses that key as the primary duplicate check.
- A repeated work email and project name within a short window returns the existing `Application ID` rather than creating another record.
- The server does not blindly repeat an upstream write after a timeout. It returns `SUBMISSION_UNCONFIRMED` and directs the user to the support address.

## Base Data Model

Create a new Base with an `Applications` table:

| Field | Type | Rule |
| --- | --- | --- |
| `Application ID` | Text | Server-generated and unique |
| `Submitted At` | Date and time | Server-generated |
| `Status` | Single select | Defaults to `Pending` |
| `Full Name` | Text | Required |
| `Work Email` | Text | Required email |
| `Country or Region` | Text | Required |
| `Team or Company` | Text | Optional |
| `Role` | Text | Required |
| `TikTok Username` | Text | Optional |
| `Game Name` | Text | Required |
| `Game Description` | Long text | Required |
| `Technology Stack` | Single select | Required |
| `Demo URL` | URL | Optional |
| `Testing Timeline` | Single select | Required |
| `Event Types` | Multiple select | At least one |
| `Interaction Design` | Long text | Required |
| `Additional Notes` | Long text | Optional |
| `Locale` | Single select | `en` or `zh-CN` |
| `Source` | Text | Fixed to the Miaoda application page |
| `Consent` | Checkbox | Must be true |

## Security and Privacy

- Keep Feishu `App ID`, `App Secret`, access tokens, and Base identifiers in secure server-side configuration.
- Never commit `.env` files, credential files, real applications, or test-user private data.
- Enforce input length limits on both client and server, with the server as the source of truth.
- Log only request IDs, result codes, durations, and redacted error details.
- Public runtime visibility only allows opening the application. It does not grant users direct Base access.

## Test Design

### Unit Tests

- Field normalization and allowlisting.
- Required-field, email, URL, enum, and length validation.
- Honeypot rejection.
- Idempotency and duplicate detection.
- Feishu field mapping.
- Mapping upstream failures to public API errors.

### Browser Tests

- Complete English and Chinese flows.
- Desktop and mobile layouts.
- Keyboard navigation, focus movement, and accessible states.
- Preserving values when moving backward.
- Requiring at least one event.
- Producing only one request after repeated clicks.
- Success, confirmed failure, and unconfirmed-result states.

### Integration Acceptance

- Submit one clearly marked real test application.
- Verify every field, timestamp, status, and application ID in Base.
- Open the public Miaoda URL in a signed-out window and complete a submission.
- Delete or mark the test record after verification so it does not enter the real review queue.

## Repository and Delivery

- Repository: `tiktok-live-studio-developer-application`.
- Visibility: private.
- Default branch: `main`.
- Preserve traceable migration commits without copying unrelated Git history from the documentation repository.
- Document local development, tests, Miaoda initialization, environment variables, and release procedures in the README.
- Deliver the private repository, Miaoda management entry, public Miaoda URL, and Feishu Base link.

## Implementation Order

1. Create the standalone local project and write key behavior tests first.
2. Migrate frontend components, styles, fonts, and required assets.
3. Implement server validation, idempotency, and the Base adapter.
4. Create the Base and configure its fields.
5. Create the Miaoda application, initialize the local full-stack project, and configure secrets.
6. Run unit tests, build checks, and browser tests.
7. Create the private GitHub repository and push `main`.
8. Release the Miaoda application and set public visibility.
9. Perform one real end-to-end acceptance test and verify the Base record.

## Completion Criteria

- The new repository contains only the application and required assets.
- Unit, build, and browser tests pass locally.
- Signed-out users can open the public Miaoda URL.
- English and Chinese submissions create records in the new Base.
- The page exposes no Feishu credentials and logs no complete application payloads.
- One real test submission creates exactly one complete Base record.
