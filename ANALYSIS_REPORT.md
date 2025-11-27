# Application Analysis Report

## Executive Summary
The TTRPG Message Application has a functional core but suffers from **critical security vulnerabilities**, **logical race conditions**, and **data integrity risks**. Immediate remediation is required before this application can be safely used, even in a trusted environment.

## 1. Critical Security Vulnerabilities

### 1.1. Insecure ChatHub Message Handling
**Severity:** Critical
**File:** `TtrpgMessageApi/Hubs/ChatHub.cs`
- **Issue:** The `SendMessage` method blindly trusts the client-provided `isDm`, `user` (SenderName), and `playerId` parameters.
- **Impact:** Any connected user (including players) can impersonate the DM or other players, and send messages to private chat threads they do not belong to.
- **Remediation:**
    - Determine `isDm` based on the authenticated user's claims (Context.User), not client input.
    - Determine `SenderName` from the server-side state (e.g., look up the Player/DM by ID/Connection).
    - Validate that the `playerId` target matches the authenticated user's rights.

### 1.2. Unverified Player Connection
**Severity:** High
**File:** `TtrpgMessageApi/Hubs/ChatHub.cs`
- **Issue:** The `JoinSession` method allows any connection to claim any `playerId`. It does not verify that the SignalR connection belongs to the user who authenticated via the REST API.
- **Impact:** A malicious user could brute-force or guess `playerId`s and spy on their private chats with the DM.
- **Remediation:** Implement a temporary token system or claim-based auth for players connecting to SignalR, ensuring the connection ID is linked to the authorized player.

## 2. Logical Bugs & Race Conditions

### 2.1. SignalR Race Condition & Recursion
**Severity:** Medium
**File:** `ttrpg-message-client/src/app/signalr.service.ts`
- **Issue:** The `startConnection` method calls `invokeJoinSession`. Inside `invokeJoinSession`, there is logic that attempts to `start()` the connection *again* if it's disconnected, and then calls `invokeJoinSession` recursively or redundantly.
- **Impact:** This can lead to double invocations, errors in the console, or infinite loops if the connection is unstable.
- **Remediation:** Simplify the connection logic. `startConnection` should ensure connection is established. `invokeJoinSession` should only invoke the method, potentially waiting for the connection promise to resolve first.

### 2.2. Data Integrity in Session Joining
**Severity:** Medium
**File:** `TtrpgMessageApi/Controllers/SessionController.cs`
- **Issue:** In `JoinSession`, a `Player` is created and saved, and *then* a `Character` is created and saved in a separate `SaveChanges` call.
- **Impact:** If the second save fails, the database is left with an orphaned `Player` record that has no `Character`.
- **Remediation:** Wrap both operations in a single transaction or single `SaveChanges` call.

### 2.3. Dangerous Type Parsing
**Severity:** Low
**File:** `TtrpgMessageApi/Hubs/ChatHub.cs`
- **Issue:** Uses `int.Parse(sessionId)` without `try-catch` or `TryParse`.
- **Impact:** Sending a non-numeric `sessionId` will cause an unhandled exception on the server.
- **Remediation:** Use `int.TryParse` and return a proper error or ignore invalid inputs.

## 3. Functional & UX Gaps

### 3.1. Missing Features
- **Typing Indicators:** No visual cue when the DM or Player is typing.
- **Message Deletion/Editing:** No ability to correct mistakes.
- **Online Status:** No way to know if the DM or a specific player is currently connected.
- **Visual Distinction:** Messages from the DM are not clearly visually distinct in the `ChatComponent` (Player view) other than potentially by name.

### 3.2. Error Handling
- **Database Failures:** While `SendMessage` catches DB errors, the client UX for a failed message send is minimal (just a console error).

## 4. Code Quality
- **Hardcoded Strings:** Role names ("Player", "DM") and group names are constructed with string interpolation in multiple places.
- **Frontend Strict Mode:** Angular strict template checking might fail with some current constructs if strict mode is fully enabled.

## Recommendations
1. **Prioritize Security:** Fix the `ChatHub` trust issues immediately.
2. **Fix SignalR Logic:** Refactor `SignalrService` to use a clean `ensureConnection()` pattern.
3. **Enhance UX:** Add basic visual feedback for message distinction and connection status.
