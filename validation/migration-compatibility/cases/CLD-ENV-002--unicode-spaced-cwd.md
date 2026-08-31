# CLD-ENV-002 — Non-ASCII and spaced cwd

## Traceability

- Primary requirement: `CLD-ENV-002`
- Backend applicability: `sdk`
- Verification levels: `P`, `L`, `W`
- Priority: `P0`

## Objective

Prove Relay/Claude tools operate correctly in an exact cwd containing Unicode and a space.

## Method

1. Select immutable `fixtures/环境 空格-workspace`, hash its Unicode/spaced source and guard absent output.
2. Use production Runtime/SDK with that exact cwd and no setting sources.
3. Execute Bash `pwd`, Read `源 文件.txt`, then Write exact bytes to `输出 文件.txt`; accept requests.
4. Compare Runtime/query/pwd/tool paths/file bytes, remove output, hash transcript/probe and self-review.

## Expected results

- Required observable: every cwd equals the intended path, source marker is read, exact output is created.
- Forbidden observable: encoding loss, cwd fallback, quoting workaround, wrong path, extra mutation or residue.

## Result interpretation

- Pass only when configuration, native tools and filesystem all agree.
- Fail if any tool cannot address the Unicode/spaced path normally.
