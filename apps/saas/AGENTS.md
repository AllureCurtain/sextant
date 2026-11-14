# apps/saas — SaaS app

TanStack Start + Hono, React 19. A working tool with sign-up, login, Stripe billing, usage credits, admin console.

## Rules

- API contract first: Zod schemas + a routes table before handlers. No undocumented endpoint.
- Auth: Better Auth. Sessions on D1. Never expose raw credentials to the frontend; never log tokens or secrets.
- Money and credits are integers in minor units, never floating point. Stripe amounts are cents.
- Stripe webhooks: verify the signature, deduplicate by event id, translate the event into one internal entitlement change. Test mode only unless the site owner switches to live keys.
- A paywalled action checks the entitlement first, then consumes credits; never consume before the check passes.
- Admin routes require the admin role; never gate admin by client-side checks alone.
- Styling: Tailwind CSS v4. Components: shadcn/ui (Radix primitives). Icons: lucide-react. Forms: React Hook Form + Zod. Server state: TanStack Query.
- Do not import anything from `apps/content`.
