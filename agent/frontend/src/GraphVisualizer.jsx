import React, { useRef, useEffect, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function GraphVisualizer({ graphData, title }) {
  const fgRef = useRef();
  
  const [data, setData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    if (!graphData || !graphData.nodes) return;
    const links = (graphData.edges || []).map(e => ({
      ...e,
      source: e.from,
      target: e.to
    }));
    setData({ nodes: graphData.nodes, links });
  }, [graphData]);

  // Tune physics and center graph on load
  useEffect(() => {
    if (fgRef.current) {
      // Increase repulsion to push nodes apart
      fgRef.current.d3Force('charge').strength(-400);
      // Increase the resting distance of the links
      fgRef.current.d3Force('link').distance(80);
    }
    
    if (fgRef.current && data.nodes.length > 0) {
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
      }, 500);
    }
  }, [data]);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return null;
  }

  const paintNode = useCallback((node, ctx, globalScale) => {
    // Scale down the original sizes which were meant for a larger native canvas
    const radius = (node.size ? node.size / 2.5 : 6);
    
    // Draw outer glow if Clerk
    if (node.type === 'CLERK') {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.color ? `${node.color}33` : 'rgba(108, 92, 231, 0.2)';
      ctx.fill();
    }
    
    // Draw Node
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = node.color || '#6c5ce7';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#fff';
    ctx.stroke();

    // Draw label
    const label = node.name || node.id;
    const fontSize = 12/globalScale;
    ctx.font = `${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = '#2d3436';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(label, node.x, node.y + radius + 2);
    
    // Initial
    const initial = node.type ? node.type.charAt(0) : 'N';
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, node.x, node.y);
  }, []);

  const paintLink = useCallback((link, ctx, globalScale) => {
    const start = link.source;
    const end = link.target;
    if (!start || !end || !start.x || !end.x) return;

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    
    if (link.highlight) {
      ctx.strokeStyle = 'rgba(214, 48, 49, 0.8)';
      ctx.lineWidth = 2 / globalScale;
    } else {
      ctx.strokeStyle = link.color || '#b2bec3';
      ctx.lineWidth = link.dashes ? 1 / globalScale : 1.5 / globalScale;
    }
    
    if (link.dashes) {
      ctx.setLineDash([4/globalScale, 4/globalScale]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }, []);

  return (
    <div className="graph-visualizer-card">
      <div className="graph-header">
        <div className="graph-title-group">
          <h3>Transaction & Syndicate Network Graph</h3>
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
      <div className="canvas-wrapper" style={{ height: 420 }}>
        <ForceGraph2D
          ref={fgRef}
          width={760}
          height={420}
          graphData={data}
          nodeCanvasObject={paintNode}
          linkCanvasObject={paintLink}
          d3Force="charge"
          nodeRelSize={6}
          d3VelocityDecay={0.1}
          cooldownTicks={100}
        />
      </div>
    </div>
  );
}
