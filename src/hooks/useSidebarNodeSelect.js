import { useState, useCallback } from 'react';

export default function useSidebarNodeSelect() {
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return { selectedNode, onNodeClick, onPaneClick };
} 