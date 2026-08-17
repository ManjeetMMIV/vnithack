import React, { useEffect, useRef, useState } from 'react';

export default function GraphVisualizer({ graphData, title }) {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [positions, setPositions] = useState({});

  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate layout positions
    const nodes = graphData.nodes;
    const edges = graphData.edges;
    const newPositions = {};

    const clerkNode = nodes.find(n => n.type === 'CLERK');
    const propNodes = nodes.filter(n => n.type === 'PROPERTY');
    const otherNodes = nodes.filter(n => n.type !== 'CLERK' && n.type !== 'PROPERTY');

    // Place Clerk at center
    if (clerkNode) {
      newPositions[clerkNode.id] = { x: centerX, y: centerY, node: clerkNode };
    }

    // Place Properties in inner ring
    const propRadius = Math.min(width, height) * 0.26;
    propNodes.forEach((p, idx) => {
      const angle = (idx / Math.max(1, propNodes.length)) * Math.PI * 2 - Math.PI / 2;
      newPositions[p.id] = {
        x: centerX + Math.cos(angle) * propRadius,
        y: centerY + Math.sin(angle) * propRadius,
        node: p,
      };
    });

    // Place Citizens / Companies in outer ring
    const outerRadius = Math.min(width, height) * 0.42;
    otherNodes.forEach((o, idx) => {
      const angle = (idx / Math.max(1, otherNodes.length)) * Math.PI * 2;
      newPositions[o.id] = {
        x: centerX + Math.cos(angle) * outerRadius,
        y: centerY + Math.sin(angle) * outerRadius,
        node: o,
      };
    });

    setPositions(newPositions);

    // Animation Frame for rendering
    let animId;
    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Edges
      edges.forEach(edge => {
        const from = newPositions[edge.from];
        const to = newPositions[edge.to];
        if (!from || !to) return;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);

        if (edge.highlight) {
          ctx.strokeStyle = `rgba(214, 48, 49, ${0.7 + Math.sin(pulse) * 0.3})`;
          ctx.lineWidth = 3.5;
        } else {
          ctx.strokeStyle = edge.color || '#b2bec3';
          ctx.lineWidth = edge.dashes ? 1.5 : 2;
        }

        if (edge.dashes) {
          ctx.setLineDash([4, 4]);
        } else {
          ctx.setLineDash([]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw relationship label midpoint
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        ctx.fillStyle = edge.highlight ? '#d63031' : '#636e72';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(edge.label || '', midX, midY - 4);
      });

      // 2. Draw Nodes
      nodes.forEach(node => {
        const pos = newPositions[node.id];
        if (!pos) return;

        const isHovered = hoveredNode && hoveredNode.id === node.id;
        const radius = (node.size || 20) + (isHovered ? 4 : 0);

        // Node Glow for highlighted/clerk
        if (node.type === 'CLERK' || isHovered) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = node.color ? `${node.color}33` : 'rgba(108, 92, 231, 0.2)';
          ctx.fill();
        }

        // Node Circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color || '#6c5ce7';
        ctx.fill();
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // Node Type Badge / Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const typeInitial = node.type ? node.type.charAt(0) : 'N';
        ctx.fillText(typeInitial, pos.x, pos.y);

        // Node Label below circle
        ctx.fillStyle = '#2d3436';
        ctx.font = '10px "Inter", sans-serif';
        ctx.textBaseline = 'top';
        ctx.fillText(node.name || node.id, pos.x, pos.y + radius + 4);
      });

      pulse += 0.05;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [graphData, hoveredNode]);

  // Handle Mouse Move for Hover Tooltips
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found = null;
    Object.values(positions).forEach(({ x: nx, y: ny, node }) => {
      const dist = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
      if (dist <= (node.size || 20) + 5) {
        found = { ...node, screenX: e.clientX, screenY: e.clientY };
      }
    });

    setHoveredNode(found);
  };

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return null;
  }

  return (
    <div className="graph-visualizer-card">
      <div className="graph-header">
        <div className="graph-title-group">
          <h3>🕸️ Transaction & Syndicate Network Graph</h3>
          <span className="graph-subtitle">{title || 'Live Relationship Trails & Entity Connections'}</span>
        </div>
        <div className="graph-legend">
          <span className="legend-item"><span className="legend-dot clerk"></span> Clerk</span>
          <span className="legend-item"><span className="legend-dot property"></span> Property</span>
          <span className="legend-item"><span className="legend-dot citizen"></span> Citizen</span>
          <span className="legend-item"><span className="legend-dot company"></span> Company</span>
          <span className="legend-item"><span className="legend-dot fraud"></span> Fraud Loop</span>
        </div>
      </div>

      <div className="canvas-wrapper" onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredNode(null)}>
        <canvas ref={canvasRef} width={760} height={420} className="graph-canvas" />

        {hoveredNode && (
          <div
            className="graph-tooltip"
            style={{
              left: `${hoveredNode.screenX ? hoveredNode.screenX - canvasRef.current.getBoundingClientRect().left + 15 : 20}px`,
              top: `${hoveredNode.screenY ? hoveredNode.screenY - canvasRef.current.getBoundingClientRect().top + 15 : 20}px`,
            }}
          >
            <div className="tooltip-type">{hoveredNode.type}</div>
            <div className="tooltip-name">{hoveredNode.name || hoveredNode.id}</div>
            <div className="tooltip-details">{hoveredNode.details || hoveredNode.id}</div>
          </div>
        )}
      </div>
    </div>
  );
}
