# Canvas AI — Frontend

The React-based frontend for the Canvas AI application. Built with React 19, TypeScript, Vite, and React Konva for high-performance 2D canvas rendering.

## Tech Stack

- **React 19** - Modern UI framework with new features
- **TypeScript** - Type safety and better developer experience
- **Vite** - Lightning-fast build tool and dev server
- **React Konva** - Canvas rendering library for draggable shapes
- **Zustand** - Lightweight state management with persistence
- **Socket.io Client** - Real-time WebSocket communication
- **TailwindCSS v4** - Modern utility-first styling

## Project Structure

```
src/
├── components/
│   ├── Canvas/          # Konva Stage, loading and empty states
│   ├── PromptBar/       # Prompt input and example chips
│   ├── ShapeNode/       # CircleNode, RectangleNode (Konva shapes)
│   └── ui/              # Reusable UI components
├── hooks/               # useSocket - socket event listeners
├── pages/               # HomePage layout
├── services/            # canvasService - socket emit wrappers
├── socket/              # Socket.io singleton instance
├── store/               # Zustand store with localStorage persistence
├── utils/               # clampNodePosition for boundary enforcement
├── constants/           # Example prompts
└── shared/              # Shared types and constants (synced from /shared)
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
VITE_SOCKET_URL=http://localhost:3001
```

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Features

- **Real-time Sync** - Canvas updates instantly across all open tabs via WebSockets
- **Draggable Shapes** - Smooth drag interactions with boundary clamping
- **Optimistic Updates** - Local drag feedback without waiting for server
- **Persistence** - Canvas state survives page refresh via localStorage
- **Responsive Design** - Adaptive canvas scaling for different screen sizes
- **Professional UI** - Dark theme with glassmorphism and animations
- **Type Safety** - Full TypeScript coverage with shared types

## State Management

The app uses Zustand with the `persist` middleware for automatic localStorage synchronization:

```typescript
// State automatically persists to localStorage
const nodes = useCanvasStore((s) => s.nodes);
const setNodes = useCanvasStore((s) => s.setNodes);
```

## Socket Events

The client listens for and emits these socket events:

**Emit:**
- `canvas:generate` - Generate shapes from prompt
- `node:move` - Update node position after drag

**Listen:**
- `canvas:generated` - Receive generated shapes
- `node:moved` - Receive node position update from other clients

## Canvas Rendering

Uses React Konva for high-performance 2D rendering:

- **Stage** - Main canvas container
- **Layer** - Rendering layer with dynamic scaling
- **CircleNode** - Circle shape component
- **RectangleNode** - Rectangle shape component

## Keyboard Shortcuts

- `Delete` or `Backspace` - Delete selected shape
- `Escape` - Deselect shape

## Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [React Konva Documentation](https://konvajs.org/docs/react/)
- [Zustand Documentation](https://zustand.docs.pmnd.rs)
- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)
