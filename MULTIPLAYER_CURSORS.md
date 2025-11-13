# Multiplayer Cursors Feature

This website features real-time multiplayer cursors using Cloudflare's PartyServer (maintained fork of PartyKit) deployed on Cloudflare Workers.

## Architecture

- **Server**: PartyServer (`party/cursor.ts`) handles WebSocket connections and broadcasts cursor positions
- **Client**: React component (`src/components/MultiplayerCursors.tsx`) tracks and displays ghost cursors
- **Deployment**: PartyServer runs on Cloudflare Workers (edge network)
- **Packages**: Uses `partyserver` and `partysocket` from Cloudflare's maintained fork

## About PartyServer

This project uses [Cloudflare's maintained fork](https://github.com/cloudflare/partykit) of PartyKit, called PartyServer. The original PartyKit (`partykit/partykit` on GitHub) is no longer maintained and has known issues. Cloudflare's fork provides:
- Active maintenance and bug fixes
- Native Cloudflare Workers integration
- Improved performance and reliability
- Durable Objects support

## Development

### Running Locally

You need to run **two** servers:

1. **Astro dev server** (your website):
   ```bash
   yarn dev
   ```

2. **PartyServer dev server** (WebSocket server via Wrangler):
   ```bash
   yarn party:dev
   ```

The PartyServer runs on `localhost:8787` by default (Wrangler's default port).

### Testing

1. Start both servers
2. Open your website in multiple browser windows (or incognito mode)
3. Move your cursor - you should see ghost cursors from other windows!

## Deployment

### Deploy PartyServer to Cloudflare Workers

PartyServer uses **Wrangler** (Cloudflare's official CLI) for deployment, not the old PartyKit CLI.

1. **Login to Cloudflare** (first time only):
   ```bash
   npx wrangler login
   ```
   This will open your browser to authenticate with your Cloudflare account.

2. **Deploy the server**:
   ```bash
   yarn party:deploy
   ```

3. **Get your PartyServer URL**:
   After deployment, you'll receive a URL like: `portfolio-multiplayer-cursor.YOUR_SUBDOMAIN.workers.dev`

### Configure Production Environment

Add the PartyServer URL to your Vercel environment variables:

1. Go to your Vercel project settings
2. Add environment variable:
   - **Name**: `PUBLIC_PARTYKIT_HOST`
   - **Value**: `portfolio-multiplayer-cursor.YOUR_SUBDOMAIN.workers.dev` (without `https://`)

3. Redeploy your Astro site

**Note**: You can also set a custom domain for your Worker in the Cloudflare dashboard.

## How It Works

1. When someone visits your website, the `MultiplayerCursors` component connects to the PartyServer via WebSocket
2. Mouse movements are throttled to ~60fps and sent to the server as percentage coordinates (0-100%)
3. The server broadcasts each cursor position to all other connected clients
4. Ghost cursors are rendered with smooth transitions and unique colors
5. When someone leaves, their cursor fades away

## Features

- **Real-time synchronization** via WebSockets
- **Smooth animations** with CSS transitions
- **Unique colors** for up to 10 simultaneous users
- **Efficient throttling** to prevent bandwidth overuse
- **Global edge network** via Cloudflare Workers
- **Auto-cleanup** when users leave

## Customization

### Change cursor colors

Edit the CSS in `src/styles/multiplayer-cursors.css`:

```css
.ghost-cursor:nth-child(1) { --cursor-hue: 200; } /* Blue */
.ghost-cursor:nth-child(2) { --cursor-hue: 280; } /* Purple */
/* ... */
```

### Change room

Multiple rooms allow separate cursor spaces. Edit `src/layouts/Layout.astro`:

```astro
<MultiplayerCursors client:only="react" host={PARTYKIT_HOST} room="custom-room" />
```

### Adjust throttling

Edit `src/components/MultiplayerCursors.tsx`:

```typescript
// Current: 16ms (~60fps)
throttleRef.current = window.setTimeout(() => {
  throttleRef.current = null;
}, 16);
```

## Cost

PartyServer runs on Cloudflare Workers, which offers a generous free tier:
- **100,000 requests/day**
- **Unlimited Durable Objects (with usage-based pricing after free tier)**
- Built on Cloudflare's global edge network

Perfect for portfolio websites!

## Troubleshooting

### Cursors not appearing locally

Make sure both servers are running:
- Astro: `yarn dev` → http://localhost:4321
- PartyServer: `yarn party:dev` → http://localhost:8787

**Important**: Update your `.env` or environment to point to the correct local port:
```env
PUBLIC_PARTYKIT_HOST=localhost:8787
```

### Cursors not appearing in production

1. Check PartyServer deployment: `yarn party:deploy`
2. Verify environment variable in Vercel: `PUBLIC_PARTYKIT_HOST`
3. Ensure the value doesn't include `https://`
4. Check your Cloudflare Workers dashboard for deployment status

### Package Information

This project uses Cloudflare's maintained fork:
- **Server package**: `partyserver` (not the old `partykit`)
- **WebSocket client**: `partysocket`
- **Deployment tool**: `wrangler` (Cloudflare's official CLI)
- **GitHub**: https://github.com/cloudflare/partykit
- **Note**: The original `partykit/partykit` is unmaintained and should not be used

### Configuration Files

- **wrangler.json**: Cloudflare Workers configuration (defines Durable Objects)
- **party/cursor.ts**: Your PartyServer implementation
- No `partykit.json` needed (that was for the old unmaintained version)

### Too many cursors

The server broadcasts to all clients in the same room. You can create room-per-page by using the current path as the room name.
