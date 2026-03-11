# ShivMarg Documentation

This directory contains documentation for the ShivMarg project.

## Analytics

The `/analytics` folder contains comprehensive guides for implementing Vercel Web Analytics:

- **[getting-started.md](./analytics/getting-started.md)** - Complete guide to implementing Vercel Web Analytics across different frameworks including:
  - Next.js (Pages and App Router)
  - Remix
  - Nuxt
  - SvelteKit
  - Astro
  - Create React App
  - Vue
  - Plain HTML/Static Sites
  - Other frameworks

## Implementation Status

The ShivMarg project currently uses:
- â Vercel Speed Insights (already implemented)
- â Vercel Web Analytics (newly added to `index.html`)

### Web Analytics Implementation

For this static HTML site, Vercel Web Analytics has been integrated by adding the following scripts to the `<head>` section of `index.html`:

```html
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>
```

This implementation:
- Does not require any npm packages
- Automatically tracks page views
- Sends data to `/_vercel/insights/view` endpoint
- Works out of the box once deployed to Vercel

## Next Steps

1. Deploy the site to Vercel
2. Enable Web Analytics in the Vercel dashboard (Analytics tab)
3. View analytics data in the Vercel dashboard after deployment
4. Optionally add custom events for tracking specific user interactions

For more detailed information, see the [Getting Started Guide](./analytics/getting-started.md).
