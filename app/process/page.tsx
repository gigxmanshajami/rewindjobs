// @ts-nocheck
'use client';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Background,
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

const initialNodes = [
  // First row
  {
    id: '1',
    type: 'input',
    data: { label: 'Register yourself on the portal' },
    position: { x: 50, y: 50 },
  },
  { id: '2', data: { label: 'Fill all the details including your date of availability' }, position: { x: 250, y: 50 } },
  { id: '3', data: { label: 'The data is analysed by our backend team' }, position: { x: 450, y: 50 } },
  { id: '4', data: { label: 'Mapping is done with the existing demands in hand' }, position: { x: 650, y: 50 } },

  // Second row
  { id: '5', data: { label: 'Mapping is also done through our AI tool and scanners' }, position: { x: 250, y: 150 } },
  { id: '6', data: { label: 'We connect back with specific demands and expectations which matches your profile' }, position: { x: 450, y: 150 } },
  { id: '7', data: { label: 'Our team takes it ahead and schedules interviews' }, position: { x: 650, y: 150 } },
  { id: '8', data: { label: 'Final onboarding is done' }, position: { x: 850, y: 150 } },

  // Third row
  { id: '9', data: { label: 'Review and feedback collection' }, position: { x: 250, y: 250 } },
  { id: '10', data: { label: 'Long-term engagement and support' }, position: { x:640, y: 250 } },
  { id: '11', data: { label: 'End of process' }, position: { x: 850, y: 250 } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e5-6', source: '5', target: '6' },
  { id: 'e6-7', source: '6', target: '7' },
  { id: 'e7-8', source: '7', target: '8' },
  
  { id: 'e8-9', source: '8', target: '9' },
  { id: 'e9-10', source: '9', target: '10' },
  { id: 'e10-11', source: '10', target: '11' },
];

const hide = (hidden) => (nodeOrEdge) => {
  return {
    ...nodeOrEdge,
    hidden,
  };
};

const RecruitmentFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [hidden, setHidden] = useState(false);

  const onConnect = useCallback(
    (params) => setEdges((els) => addEdge(params, els)),
    [],
  );

  useEffect(() => {
    setNodes((nds) => nds.map(hide(hidden)));
    setEdges((eds) => eds.map(hide(hidden)));
  }, [hidden]);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#F7F9FB' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
    
        fitView // Ensures the flow fits the screen
      >
        <Controls />
        {/* <Background /> */}
      </ReactFlow>
    </div>
  );
};

export default RecruitmentFlow;
