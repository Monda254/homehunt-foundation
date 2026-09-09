# Performance Audit & Optimization Review

## Core Web Vitals Benchmarks

- **First Contentful Paint (FCP)**: < 1.2s
- **Largest Contentful Paint (LCP)**: < 2.1s
- **Cumulative Layout Shift (CLS)**: < 0.05
- **Time to Interactive (TTI)**: < 2.5s

## Bundle & Asset Optimization Strategies

1. **Code Splitting**: Route-level automatic code splitting with TanStack Router.
2. **Database Querying**: PostGIS spatial queries utilize indexed geometry columns (`ST_DWithin`, `GIST`).
3. **Static Caching**: Assets served via CDN with immutable cache headers for hashed JS/CSS assets.
