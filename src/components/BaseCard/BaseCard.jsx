import React, { useCallback, useRef, useContext, memo } from 'react';
import { Handle, useReactFlow } from '@xyflow/react';
import './BaseCard.css';

// Import components
import CardHeader from './CardHeader';
import TabContainer from './TabContainer';
import TabContent from './TabContent';
import useCreateId from '../../hooks/useCreateId';
import { FlowInteractionContext } from '../../App';

// Use the id prop passed by React Flow directly
function BaseCardTemplateComponent({ data, isConnectable, id }) {
  const { setNodes } = useReactFlow();
  const { reorderTabs, moveTabToNode } = useContext(FlowInteractionContext);
  const generateTabId = useCreateId('tab');
  const cardRef = useRef(null);

  // Extract state from data prop (handlers removed)
  const {
    label,
    tabs = [],
    activeTab: activeTabId,
  } = data;

  // Ensure tabs is always an array and has at least one tab if empty
  const currentTabs = (!tabs || tabs.length === 0)
    ? [{ id: generateTabId(), title: 'Initial Tab', text: '', image: null }]
    : tabs;

  // Determine the active tab ID, defaulting to the first tab if necessary
  const currentActiveTabId = activeTabId && currentTabs.some(t => t.id === activeTabId)
    ? activeTabId
    : currentTabs[0]?.id;

  const nodeLabel = label || 'Node Content';
  const [expanded, setExpanded] = React.useState(true);

  // --- Modified Tab Handlers (using setNodes from useReactFlow) ---

  const updateNodeData = useCallback((newData) => {
    setNodes(nds => nds.map(node =>
      node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
    ));
  }, [setNodes, id]);

  const handleTabClick = useCallback((tabId) => {
    updateNodeData({ activeTab: tabId });
  }, [updateNodeData]);

  const addTab = useCallback(() => {
    const newTabId = generateTabId();
    const newTab = { id: newTabId, title: 'New Tab', text: '', image: null };
    const newTabs = [...currentTabs, newTab];
    updateNodeData({ tabs: newTabs, activeTab: newTabId });
  }, [currentTabs, generateTabId, updateNodeData]);

  const removeTab = useCallback((tabIdToRemove) => {
    if (currentTabs.length <= 1) return;

    const newTabs = currentTabs.filter(tab => tab.id !== tabIdToRemove);
    let newActiveTabId = currentActiveTabId;
    if (currentActiveTabId === tabIdToRemove) {
      newActiveTabId = newTabs[0]?.id || null;
    }
    updateNodeData({ tabs: newTabs, activeTab: newActiveTabId });
  }, [currentTabs, currentActiveTabId, updateNodeData]);

  const updateTabText = useCallback((tabId, newText) => {
    const newTabs = currentTabs.map(tab =>
      tab.id === tabId ? {...tab, text: newText} : tab
    );
    updateNodeData({ tabs: newTabs });
  }, [currentTabs, updateNodeData]);

  const updateTabImage = useCallback((tabId, newImage, filePath) => {
    const newTabs = currentTabs.map(tab =>
      tab.id === tabId ? {...tab, image: newImage, filePath} : tab
    );
    updateNodeData({ tabs: newTabs });
  }, [currentTabs, updateNodeData]);

  // --- Drag and Drop Handlers (using context functions) ---

  const handleTabDropInContainer = useCallback((dropData, targetIndex, event) => {
    const { sourceNodeId, tabData } = dropData;
    if (!sourceNodeId || !tabData) return;

    if (sourceNodeId === id) {
      const sourceIndex = currentTabs.findIndex(tab => tab.id === tabData.id);
      if (sourceIndex !== -1 && targetIndex !== null && sourceIndex !== targetIndex && (sourceIndex !== targetIndex -1 || targetIndex === 0 )) {
         const adjustedTargetIndex = (sourceIndex < targetIndex && targetIndex > 0) ? targetIndex - 1 : targetIndex;
         if (sourceIndex !== adjustedTargetIndex) {
             reorderTabs(id, currentTabs, sourceIndex, adjustedTargetIndex);
         }
      }
    } else {
      moveTabToNode(sourceNodeId, id, tabData);
    }
  }, [id, currentTabs, reorderTabs, moveTabToNode]);

  // Drag over the main card area
  const handleCardDragOver = useCallback((e) => {
    const isTabDrag = e.dataTransfer.types.includes('application/json');
    if (isTabDrag) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
         cardRef.current?.classList.add('tab-drop-target');
    }
  }, []);

   // Drag leave the main card area, remove the drop target class
  const handleCardDragLeave = useCallback((e) => {
     cardRef.current?.classList.remove('tab-drop-target');
  }, []);

  // Drop onto the main card area (not the tab container)
  const handleCardDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    cardRef.current?.classList.remove('tab-drop-target');

    const dataString = e.dataTransfer.getData('application/json');
    if (!dataString) return;

    try {
      const { sourceNodeId, tabData } = JSON.parse(dataString);
      if (sourceNodeId && tabData && sourceNodeId !== id) {
        moveTabToNode(sourceNodeId, id, tabData);
      }
    } catch (error) {
      console.error("Failed to parse tab drop data on card:", error);
    }
  }, [id, moveTabToNode]);

  // --- Render ---
  return (
    <div
      ref={cardRef}
      className={`base-card ${expanded ? 'expanded' : ''}`}
      onDragOver={handleCardDragOver}
      onDrop={handleCardDrop}
      onDragLeave={handleCardDragLeave}
    >
      <Handle
        type="target"
        position="top"
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />

      <div className="card-div">
        <CardHeader
          nodeLabel={nodeLabel}
          expanded={expanded}
          onToggleExpand={() => setExpanded(!expanded)}
        />

        {expanded && (
          <>
            <TabContainer
              nodeId={id}
              tabs={currentTabs}
              activeTabId={currentActiveTabId}
              onTabChange={handleTabClick}
              onAddTab={addTab}
              onTabDrop={handleTabDropInContainer}
              onTabRemove={removeTab}
            />

            <TabContent
              tabs={currentTabs}
              activeTabId={currentActiveTabId}
              onTabTextChange={updateTabText}
              onTabImageChange={updateTabImage}
              nodeId={id}
            />
          </>
        )}
      </div>

      <Handle
        type="source"
        position="bottom"
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
    </div>
  );
}

// Memoize the component
const BaseCardTemplate = memo(BaseCardTemplateComponent);

export default BaseCardTemplate;
