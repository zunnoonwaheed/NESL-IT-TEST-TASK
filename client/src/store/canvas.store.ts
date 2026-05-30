import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShapeNode, NodeMovePayload } from '../shared/types';

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

interface CanvasStore {
  nodes: ShapeNode[];
  isGenerating: boolean;
  connectionStatus: ConnectionStatus;
  lastPrompt: string;
  error: string | null;
  selectedNodeId: string | null;

  setNodes: (nodes: ShapeNode[]) => void;
  moveNode: (payload: NodeMovePayload) => void;
  setGenerating: (loading: boolean) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setLastPrompt: (prompt: string) => void;
  setError: (error: string | null) => void;
  clearCanvas: () => void;
  setSelectedNode: (nodeId: string | null) => void;
  deleteNode: (nodeId: string) => void;
}

export const useCanvasStore = create<CanvasStore>()(
  persist(
    (set) => ({
      nodes: [],
      isGenerating: false,
      connectionStatus: 'disconnected',
      lastPrompt: '',
      error: null,
      selectedNodeId: null,

      setNodes: (nodes) => set({ nodes, error: null }),

      moveNode: (payload) =>
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === payload.id
              ? { ...node, x: payload.x, y: payload.y }
              : node,
          ),
        })),

      setGenerating: (isGenerating) => set({ isGenerating }),
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
      setLastPrompt: (lastPrompt) => set({ lastPrompt }),
      setError: (error) => set({ error }),
      clearCanvas: () => set({ nodes: [], lastPrompt: '', error: null, selectedNodeId: null }),
      setSelectedNode: (selectedNodeId) => set({ selectedNodeId }),
      deleteNode: (nodeId) =>
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== nodeId),
          selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        })),
    }),
    {
      name: 'canvas-state',
      partialize: (state) => ({ nodes: state.nodes, lastPrompt: state.lastPrompt }),
    },
  ),
);
