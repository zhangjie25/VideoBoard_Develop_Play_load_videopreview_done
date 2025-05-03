import React, { useRef, useCallback, createContext, useMemo } from 'react';
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlow,
  Controls,
  Background,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import './index.css';

// Components
import Sidebar from './components/SideBar/Sidebar';
import InfoPanel from './components/InfoPanel/InfoPanel';
import BaseCardTemplate from './components/BaseCard/BaseCard';
import BkCardTemplate from './components/BkCard/BkCard';

// Hooks
import useSidebarNodeSelect from './hooks/useSidebarNodeSelect';
import useSidebarEdge from './hooks/useSidebarEdge';
import useSidebarNodeAdd from './hooks/useSidebarNodeAdd';
import useBaseCardTabDnD from './hooks/useBaseCardTabDnD';

// Define node types
const nodeTypes = {
  BaseCard: BaseCardTemplate,
  BkCard: BkCardTemplate,
};

// Create the context
export const FlowInteractionContext = createContext({
  reorderTabs: () => console.warn('reorderTabs called without Provider'),
  moveTabToNode: () => console.warn('moveTabToNode called without Provider'),
  extractTabToNewNode: () => console.warn('extractTabToNewNode called without Provider'),
});

const DnDFlow = () => {
  // State management (React Flow handles nodes/edges internally now via hooks)
  // We still might need nodes/edges directly for some logic, but hooks manage the state.
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Standard React Flow hooks
  const { screenToFlowPosition } = useReactFlow(); // Already using useReactFlow internally

  // Instantiate custom hooks (they use useReactFlow internally now)
  const { reorderTabs, moveTabToNode, extractTabToNewNode } = useBaseCardTabDnD(edges, setEdges); // Pass only needed args
  const { addNode } = useSidebarNodeAdd(); // No longer needs setNodes or handlers

  // Other custom hooks
  const { selectedNode, onNodeClick, onPaneClick } = useSidebarNodeSelect();
  const { onConnect } = useSidebarEdge(setEdges);

  const reactFlowWrapper = useRef(null);

  // --- Event Handlers ---

  // Combined Drag Over handler (remains the same)
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    const isSidebarDrag = event.dataTransfer.types.includes('dragfromsidebar');
    const isTabDrag = event.dataTransfer.types.includes('application/json');
    if (isSidebarDrag || isTabDrag) {
      event.dataTransfer.dropEffect = 'move';
    } else {
      event.dataTransfer.dropEffect = 'none';
    }
  }, []);

  // Combined Drop handler for the canvas (remains mostly the same logic)
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Check for sidebar drag first
      const sidebarNodeType = event.dataTransfer.getData('DragFromSideBar');
      if (sidebarNodeType) {
        addNode(sidebarNodeType, position); // Use addNode from the hook
        return; // Added return to prevent falling through
      }

      // Check for tab drag
      const tabDataString = event.dataTransfer.getData('application/json');
      if (tabDataString) {
        try {
          const { sourceNodeId, tabData } = JSON.parse(tabDataString);
          if (sourceNodeId && tabData) {
            // Dropped on pane, extract to new node
            extractTabToNewNode(sourceNodeId, tabData, position); // Use extract from the hook
          }
        } catch (error) {
          console.error("Failed to parse tab drop data on canvas:", error);
        }
      }
    },
    [screenToFlowPosition, addNode, extractTabToNewNode] // Dependencies are stable hooks/functions
  );

  // --- Context Value ---
  // Memoize context value to prevent unnecessary re-renders of consumers
  const flowInteractionContextValue = useMemo(() => ({
    reorderTabs,
    moveTabToNode,
    extractTabToNewNode,
    // Add setNodes here if needed by consumers directly, but prefer useReactFlow
    // setNodes: setNodes, // Example if needed
  }), [reorderTabs, moveTabToNode, extractTabToNewNode]);

  return (
    // Provide the context value
    <FlowInteractionContext.Provider value={flowInteractionContextValue}>
      <div className="dndflow">
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            style={{ backgroundColor: "#F7F9FB" }}
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
        <Sidebar />
        <InfoPanel selectedNode={selectedNode} />
      </div>
    </FlowInteractionContext.Provider>
  );
};

// Main export remains the same
export default () => (
  <ReactFlowProvider>
    <DnDFlow />
  </ReactFlowProvider>
);
