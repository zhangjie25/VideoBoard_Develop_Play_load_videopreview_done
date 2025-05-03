import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';

export default function useSidebarDnD(addNode) {
  const { screenToFlowPosition } = useReactFlow();

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('DragFromSideBar');
      
      if (!nodeType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      addNode(nodeType, position);
    },
    [screenToFlowPosition, addNode],
  );

  return { onDragOver, onDrop };
} 