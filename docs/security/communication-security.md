# Security Documentation - Communication & Viewings Security

Protections engineered to secure conversations and scheduling interactions.

## Security Controls

1. **Anti-IDOR (Insecure Direct Object Reference)**:
   - Queries fetch participant attributes directly from conversation parameters (`c.seeker_id` or `c.provider_id`) verified against `auth.uid()`.
   - Modifying viewing statuses requires checking caller owns listing or matches participant ID.

2. **Blocking Safeguards**:
   - Sending messages or requesting viewings verifies neither participant has blocked the other.
   - Blocking immediately locks active threads.

3. **Spam & Rate Limiting Throttles**:
   - Memory-based sliding-window checks block automation scripts.
   - Throttles thread creation (5/hour) and messaging rate (60/min).
