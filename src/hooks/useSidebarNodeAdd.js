import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import useCreateId from './useCreateId';

export default function useSidebarNodeAdd() {
  const { setNodes } = useReactFlow();
  const generateId = useCreateId('node');
  const generateTabId = useCreateId('tab');

  const addNode = useCallback((nodeType, position) => {
    const newNodeId = generateId();
    const initialTabId = generateTabId();
    const newNode = {
      id: newNodeId,
      type: nodeType,
      position,
      data: {
        label: 'NewNode',
        nodeId: newNodeId,
        ...(nodeType === 'BaseCard' && {
          tabs: [
            { id: initialTabId, title: 'New Tab', text: '', image: null }
          ],
          activeTab: initialTabId,
        }),
      },
      ...(nodeType === 'BaseCard' && {
        dragHandle: '.card-header.for-drag'
      })
    };

    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, generateId, generateTabId]);

  return { addNode };
} 