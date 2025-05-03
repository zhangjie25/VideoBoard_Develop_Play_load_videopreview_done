import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import useCreateId from './useCreateId';

export default function useTabDragDrop(/* nodes, setNodes, */ edges, setEdges) {
  const { setNodes, getNodes } = useReactFlow();
  const generateId = useCreateId('node');
  const generateTabId = useCreateId('tab');

  // Reorder tabs within a node
  const reorderTabs = useCallback((nodeId, tabs, sourceIndex, targetIndex) => {
    // Create a new array with the reordered tabs
    const newTabs = [...tabs];
    const [movedTab] = newTabs.splice(sourceIndex, 1);
    newTabs.splice(targetIndex, 0, movedTab);
    
    // Update the node's tabs
    setNodes(nds => nds.map(node => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, tabs: newTabs } } 
        : node
    ));
    
    return newTabs;
  }, [setNodes]);

  // Move a tab from one node to another
  const moveTabToNode = useCallback((sourceNodeId, targetNodeId, tabData) => {
    // Create a new tab with the same data but new ID
    const newTabId = generateTabId();
    const newTab = {
      ...tabData,
      id: newTabId
    };
    
    // Update both source and target nodes atomically
    setNodes(nds => nds.map(node => {
      if (node.id === sourceNodeId) {
        const originalTabs = node.data.tabs || [];
        const newTabs = originalTabs.filter(tab => tab.id !== tabData.id);
        const sourceActiveTab = node.data.activeTab === tabData.id 
                               ? (newTabs.length ? newTabs[0].id : null)
                               : node.data.activeTab;
        return { 
          ...node, 
          data: { 
            ...node.data, 
            tabs: newTabs.length ? newTabs : [{ id: generateTabId(), title: 'NewTab', text: '', image: null }],
            activeTab: sourceActiveTab
          } 
        };
      }
      
      if (node.id === targetNodeId) {
        const targetTabs = node.data.tabs || [];
        return { 
          ...node, 
          data: { 
            ...node.data, 
            tabs: [...targetTabs, newTab],
            activeTab: newTabId // Activate the moved tab in the target
          } 
        };
      }
      
      return node;
    }));
    
    return newTabId;
  }, [setNodes, generateTabId]);

  // Extract tab to new node
  const extractTabToNewNode = useCallback((sourceNodeId, tabData, position) => {
    // Create a new node with the tab data
    const newNodeId = generateId();
    const newTabId = generateTabId();
    
    // Create a new tab for the new node
    const newTab = {
      ...tabData,
      id: newTabId
    };
    
    // Create the new node
    const newNode = {
      id: newNodeId,
      type: 'BaseCard',
      position,
      data: {
        label: tabData.title,
        tabs: [newTab],
        activeTab: newTabId,
        nodeId: newNodeId,
        // Handlers are removed - BaseCard will get them via context
      },
      dragHandle: '.card-header.for-drag'
    };
    
    // Add the new node
    setNodes(nds => [...nds, newNode]);
    
    // Update the source node (remove tab)
    setNodes(nds => nds.map(node => {
      if (node.id === sourceNodeId) {
        const originalTabs = node.data.tabs || [];
        const newTabs = originalTabs.filter(tab => tab.id !== tabData.id);
        const sourceActiveTab = node.data.activeTab === tabData.id 
                               ? (newTabs.length ? newTabs[0].id : null)
                               : node.data.activeTab;
        return { 
          ...node, 
          data: { 
            ...node.data, 
            tabs: newTabs.length ? newTabs : [{ id: generateTabId(), title: 'NewTab', text: '', image: null }],
            activeTab: sourceActiveTab
          } 
        };
      }
      return node;
    }));
    
    return { nodeId: newNodeId, tabId: newTabId };
  }, [setNodes, generateId, generateTabId]);

  return {
    reorderTabs,
    moveTabToNode,
    extractTabToNewNode
  };
} 