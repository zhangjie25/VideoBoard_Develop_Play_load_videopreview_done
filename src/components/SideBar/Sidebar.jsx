import React from 'react';
import { useReactFlow } from '@xyflow/react';
import { storeBoardState, loadBoardState } from '../../utils/indexedDBStorage';

export default () => {
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('DragFromSideBar', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleSave = async () => {
    try {
      const nodes = getNodes();
      const edges = getEdges();

      // Save to IndexedDB
      await storeBoardState({
        nodes,
        edges,
        timestamp: new Date().toISOString()
      });

      alert('Board saved successfully!');
    } catch (error) {
      console.error('Error saving board:', error);
      alert('Failed to save board: ' + error.message);
    }
  };

  const handleLoad = async () => {
    try {
      const boardData = await loadBoardState();
      
      if (!boardData) {
        alert('No saved board found.');
        return;
      }

      // Load nodes and edges
      setNodes(boardData.nodes || []);
      setEdges(boardData.edges || []);
      
      alert('Board loaded successfully!');
    } catch (error) {
      console.error('Error loading board:', error);
      alert('Failed to load board: ' + error.message);
    }
  };

  return (
    <aside>
      <div className="dndnode" onDragStart={(event) => onDragStart(event, 'BaseCard')} draggable>
        Default Node
      </div>
      <div className="dndnode background-card" onDragStart={(event) => onDragStart(event, 'BkCard')} draggable>
        BackGround Card
      </div>
      
      {/* Save and Load buttons at the bottom */}
      <div className="sidebar-actions">
        <button className="sidebar-button save-button" onClick={handleSave}>
          Save Board
        </button>
        <button className="sidebar-button load-button" onClick={handleLoad}>
          Load Board
        </button>
      </div>
    </aside>
  );
};
