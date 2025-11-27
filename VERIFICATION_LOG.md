# Verification Log

## 1. Security Vulnerability (ChatHub)
**Issue:** `SendMessage` previously trusted client parameters for `isDm` and `SenderName`.
**Remediation:**
- Updated `ChatHub.SendMessage` to verify authentication using `Context.User`.
- For unauthenticated users (players), it verifies that the `ConnectionId` matches the player's stored connection in the database.
- Added `[Authorize]` to `RegisterDmConnection`.

**Verification:**
- **Before Fix:** The `verify_security.py` script successfully sent a message impersonating the DM (Connection remained open, no error returned).
- **After Fix:** The `verify_security.py` script received a server error: `"Failed to invoke 'SendMessage' due to an error on the server."` (which corresponds to the `HubException("Unauthorized...")` being thrown and logged).
- **Conclusion:** The vulnerability is patched. Unauthorized users cannot send messages as DM.

## 2. SignalR Race Condition
**Issue:** Infinite recursion in connection logic.
**Remediation:** Refactored `signalr.service.ts` to use a promise-based `ensureConnection` pattern.
**Verification:** Code review confirms the removal of the recursive call loop.

## 3. Data Integrity
**Issue:** Player/Character creation was not atomic.
**Remediation:** Updated `SessionController.JoinSession` to use a single `SaveChanges` call.
**Verification:** Code review confirms correctness of EF Core graph addition.
