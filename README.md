<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://neon.com/brand/neon-logo-dark-color.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://neon.com/brand/neon-logo-light-color.svg">
  <img width="250px" alt="Neon Logo fallback" src="https://neon.com/brand/neon-logo-dark-color.svg">
</picture>

# Safe Auth Testing with Vercel & Neon Branching

A reference implementation demonstrating how to test sensitive authentication features (like RBAC) using **Vercel Preview Deployments** and **Neon Database Branching**.

---

Testing authentication changes—like adding a moderation queue or changing user roles—is risky in production. Traditional staging environments are often difficult to keep in sync with real user data.

This repository demonstrates a workflow where every Pull Request triggers a **Vercel Preview Deployment** backed by a dedicated **Neon Database Branch**.

Because [Neon Auth](https://neon.tech/docs/auth/overview) data lives in your database, the branch contains a snapshot of your **actual production users**. This allows you to test complex admin workflows using real accounts in an isolated environment, with zero risk to your live application.

Follow the full guide on [Neon: Testing Auth changes safely with Vercel and Neon Branching](https://neon.com/guides/vercel-neon-auth-branching).

## ⚡ The Workflow

This project relies on the **[Vercel Manged Neon Integration](https://neon.tech/docs/guides/vercel-managed-integration)** to automate infrastructure:

1.  **Production**: The `main` branch connects to your primary Neon database.
2.  **Pull Request**: When you open a PR, Vercel triggers a Preview Deployment.
3.  **Automated Branching**: Neon automatically creates a database branch for that PR.
4.  **Isolated Testing**: The integration injects the specific `NEON_AUTH_BASE_URL` and `DATABASE_URL` for that branch into the Vercel Preview. You can log in, promote users to Admins, or delete data; production remains untouched.

## 🛠 Tech Stack

-   **Next.js** (App Router)
-   **Neon Auth** (Authentication & User Management)
-   **Drizzle ORM** (Schema & Queries)
-   **Vercel** (Deployment & Integration Automation)

## 🚀 Get Started

Follow the steps on the [Neon Guide](https://neon.com/guides/vercel-neon-auth-branching) to setup Vercel, Neon and GitHub for this workflow.

### The Demo Scenario
This repository contains a simple **Message Board** to demonstrate the workflow.

**Phase 1: Production (Open Board)**
*   Deploy the `main` branch.
*   Sign up two users (`user@example.com`, `admin@example.com`).
*   Post messages. Observe they appear to all users.
    
    <p align="left">
        <img src="./images/message_board_application.png" alt="Message Board Application Screenshot" width="600"/>
    </p>

**Phase 2: Preview (Moderation Queue)**
*   Create a branch `feat/moderation`.
*   Implement logic where posts default to `isApproved: false`.
*   Push to GitHub to trigger a **Vercel Preview**.

**Phase 3: Verification**
*   Open the Vercel Preview URL.
*   Log in as `user@example.com` (using their **real production password**).
*   Post a message. Observe it is pending.
*   Log in as `admin@example.com`.
*   **Safe Experimentation:** Go to the Neon Console, switch to the *Preview Branch*, and manually promote `admin@example.com` to the `admin` role.
*   Approve the message in the Preview UI.
*   **Result:** You tested a destructive permission change without affecting the production database or user roles.
    
    <p align="left">
        <img src="./images/message_board_admin_view.png" alt="Message Board Admin View Screenshot" width="600"/>
    </p>

## ⚙️ How it works

The application uses **Server Actions** to check permissions against the database.

Because Neon Auth data is branched, the `role` check in the code below runs against the **branch's** `neon_auth.users` table, ensuring total isolation.

```typescript
// app/actions.ts
export async function approveMessage(messageId: string) {
  // 1. Get the session (Verified against the Branch Auth URL)
  const { data } = await authServer.getSession();
  
  // 2. Check Role (Checked against the Branch Database)
  if (data?.user.role !== 'admin') {
      throw new Error("Unauthorized");
  }

  // 3. Mutate Data (Applied to the Branch Database)
  await db.update(messages)
      .set({ isApproved: true })
      .where(eq(messages.id, messageId));
}
```

## 📚 Learn more

-   [Neon Guide: Testing Auth changes safely with Vercel and Neon Branching](https://neon.com/guides/vercel-neon-auth-branching)
-   [Neon Auth Overview](https://neon.com/docs/auth/overview)
-   [Vercel-Managed Neon Integration](https://neon.com/docs/guides/vercel-managed-integration)
-   [Neon Database Branching](https://neon.com/branching)
