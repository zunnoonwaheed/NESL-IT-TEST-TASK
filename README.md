# Canvas AI

A real-time canvas app where you type what shapes you want in plain English and AI generates them for you. Open it in multiple tabs and watch everything sync instantly.

## What does it do?

You type something like "make a grid of 12 circles" and it creates them on the canvas. You can drag them around and everything updates across all your browser tabs in real-time. The AI (Groq's Llama 3.3) figures out the layout from your description.

Pretty straightforward. No login, no database, just works.

## Stack

Built this with:
- React 19 and TypeScript on the frontend
- NestJS backend
- Socket.io for real-time stuff
- React Konva for the canvas rendering
- Zustand for state management
- Groq API for the AI part

Used Vite because it's fast and TailwindCSS because I didn't want to write a bunch of custom CSS.

## Running it locally

You need Node 18 or higher. Get a free Groq API key from console.groq.com (takes like 30 seconds to sign up).

```bash
# Install dependencies
npm run install:all

# Make a server/.env file
PORT=3001
GROQ_API_KEY=your_key_here
CLIENT_URL=http://localhost:5173

# Make a client/.env file
VITE_SOCKET_URL=http://localhost:3001

# Start everything
npm run dev
```

Go to localhost:5173 and you should see it. Open another tab to see the real-time sync.

## How it actually works

When you enter a prompt:
1. Frontend sends it through a websocket to the backend
2. Backend hits Groq's API with a system prompt that forces JSON output
3. AI spits out JSON with shape definitions
4. Backend validates it (checks bounds, max shapes, etc)
5. Sends it back to all connected clients
6. React Konva renders the shapes

Dragging is optimistic - it updates locally first so there's no lag, then syncs to the server when you let go.

If the AI screws up or you don't have an API key, there's a fallback that tries to parse your prompt for patterns like "grid" or "star" and generates layouts algorithmically.

## Project structure

```
client/src/
  components/     # React components
  store/          # Zustand state
  hooks/          # useSocket and stuff
  socket/         # Socket.io setup

server/src/
  modules/
    ai/           # Groq integration
    websocket/    # Socket handlers
  config/         # env vars

shared/           # Types used by both
```

Nothing fancy. Kept it simple.

## Why Groq?

Tried this with GPT-4 first but it was too slow for real-time. Groq with Llama 3.3 is stupid fast (like sub-second) and surprisingly good at JSON generation. Plus free tier is generous.

The system prompt is basically "only return JSON in this exact format" and it mostly works. Still validate everything server-side because you can't trust LLMs.

## Features

Works as required:
- Type prompts in natural language
- AI generates shapes
- Drag shapes around the canvas
- Real-time sync via websockets
- Only circles and rectangles
- Max 12 shapes
- Labels are 2 chars max
- Shapes stay in bounds

Extra stuff I added:
- Persists to localStorage (survives refresh)
- Keyboard shortcuts (Delete to remove, Escape to deselect)
- Fallback patterns when AI fails
- Dark theme because light theme hurts my eyes

## Try these prompts

```
Create a 3x4 grid of circles labeled A to L
Make a star with 6 points
4 rectangles in a row
6 circles in a hexagon shape
Two rows of 4 circles each
```

Or just describe whatever. Sometimes it works great, sometimes you get weird results. That's LLMs for you.

## Decisions I made

**No database** - Didn't need it. Server holds state in memory and syncs new tabs. Client uses localStorage. If the server restarts you lose everything but who cares for a demo.

**Zustand instead of Redux** - Redux is overkill. Zustand is like 3 lines of code and has persistence built in.

**Optimistic updates** - Dragging feels instant because we update local state immediately instead of waiting for the server. Server sync happens in the background.

**Copied shared types** - Yeah I know I should use a proper monorepo setup but copying a types file is way simpler and this isn't a huge project.

**NestJS** - Probably overkill for this but I like the structure and it scales well if I ever want to add more features.

## What's missing

Honestly built this in a couple hours so there's a lot:
- No tests whatsoever
- No undo/redo
- Can't resize shapes
- No rooms/auth so everyone shares one canvas
- Mobile works but isn't optimized
- Error handling is basic
- No CI/CD
- State is lost if server crashes

It's a demo. Works well enough.

## Socket events

Client sends:
- `canvas:generate` with your prompt
- `node:move` when you drag something

Server sends:
- `canvas:generated` with new shapes
- `node:moved` when someone else moves something

Pretty simple protocol.

## Running in production

Don't. This isn't production-ready. But if you really want to:
- Set up a real database
- Add authentication
- Add proper error tracking
- Write some tests
- Set up HTTPS
- Add rate limiting on the AI endpoint

You get the idea.

## License

MIT. Do whatever you want with it.
