# produce-art-proof / prompt

Produce an art proof for the given order using the project rules.

Process:
1. Read order details
2. Read must_keep_features carefully
3. Select the best reference images
4. Use the requested preset style only
5. Create a proof draft
6. Run internal likeness QA
7. Export proof asset
8. Record notes for future revisions

Constraints:
- Do not create extra style variants
- Do not skip must_keep_features
- Do not prepare final print master before approval
- Preserve version history
