import { useCallback } from 'react';
import { addEdge } from '@xyflow/react';

export default function useSidebarEdge(setEdges) {
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return { onConnect };
} 