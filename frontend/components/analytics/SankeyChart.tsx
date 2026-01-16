'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SankeyNode {
  name: string;
  value: number;
}

interface SankeyProps {
  data: SankeyNode[];
}

export function Sankey({ data }: SankeyProps) {
  // Calculate positions and flows
  const { nodes, links } = useMemo(() => {
    const nodes = data.map((item, index) => ({
      id: item.name,
      x: (index / (data.length - 1)) * 100,
      y: 50,
      value: item.value,
    }));

    const links = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const source = nodes[i];
      const target = nodes[i + 1];
      const value = Math.min(source.value, target.value);
      
      links.push({
        source: source.id,
        target: target.id,
        value,
        sourceX: source.x,
        targetX: target.x,
      });
    }

    return { nodes, links };
  }, [data]);

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Links */}
        {links.map((link, index) => {
          const sourceNode = nodes.find((n) => n.id === link.source);
          const targetNode = nodes.find((n) => n.id === link.target);
          
          if (!sourceNode || !targetNode) return null;

          const width = (link.value / maxValue) * 5;
          const yOffset = 50 - (width / 2);

          return (
            <motion.path
              key={index}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 1, delay: index * 0.2 }}
              d={`M ${sourceNode.x} ${yOffset} L ${targetNode.x} ${yOffset + width} L ${targetNode.x} ${yOffset} L ${sourceNode.x} ${yOffset + width} Z`}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--primary))"
              strokeWidth={0.5}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node, index) => (
          <g key={node.id}>
            <motion.circle
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              cx={node.x}
              cy={node.y}
              r={Math.max(2, (node.value / maxValue) * 8)}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth={1}
            />
            <text
              x={node.x}
              y={node.y + 15}
              textAnchor="middle"
              fontSize="3"
              fill="hsl(var(--foreground))"
              className="font-medium"
            >
              {node.id}
            </text>
            <text
              x={node.x}
              y={node.y + 18}
              textAnchor="middle"
              fontSize="2"
              fill="hsl(var(--muted-foreground))"
            >
              {node.value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
