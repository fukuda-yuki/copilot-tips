# Data Access Exception Checklist

Use this checklist before recommending raw SQL or stored procedure reuse in a C# / .NET codebase.

## Required Evidence

- What EF Core approach was attempted or considered?
- What performance or query-shape limitation remains?
- What measurement, benchmark, or operational evidence exists?
- What boundary will isolate the exception path from the rest of the application?

## Red Flags

- No benchmark or no production evidence
- Raw SQL proposed as the default path
- Query logic pushed into controllers or views
- Stored procedure reuse justified only by "it already exists"
