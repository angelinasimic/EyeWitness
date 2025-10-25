import React, { useEffect, useRef } from 'react';
import { SpaceWeatherData } from '../types';
import * as d3 from 'd3';

interface KpChartProps {
  kpData: SpaceWeatherData[];
}

/**
 * Simple D3 line chart for Kp index data
 */
export function KpChart({ kpData }: KpChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || kpData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous renders

    const width = 600;
    const height = 200;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(kpData, d => new Date(d.time)) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 9])
      .range([height - margin.bottom, margin.top]);

    // Create line generator
    const line = d3.line<SpaceWeatherData>()
      .x(d => xScale(new Date(d.time)))
      .y(d => yScale(d.kp))
      .curve(d3.curveMonotoneX);

    // Add axes
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat((d: any) => d3.timeFormat('%H:%M')(d)));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Add axis labels
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Kp Index');

    // Add Kp threshold lines
    const alertThreshold = 6;
    svg.append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', yScale(alertThreshold))
      .attr('y2', yScale(alertThreshold))
      .attr('stroke', '#e74c3c')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5,5');

    svg.append('text')
      .attr('x', width - margin.right - 10)
      .attr('y', yScale(alertThreshold) - 5)
      .attr('text-anchor', 'end')
      .style('font-size', '12px')
      .style('fill', '#e74c3c')
      .text('Alert Threshold (Kp ≥ 6)');

    // Add the line
    svg.append('path')
      .datum(kpData)
      .attr('fill', 'none')
      .attr('stroke', '#3498db')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add data points
    svg.selectAll('.dot')
      .data(kpData)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => xScale(new Date(d.time)))
      .attr('cy', d => yScale(d.kp))
      .attr('r', 3)
      .attr('fill', d => d.kp >= alertThreshold ? '#e74c3c' : '#3498db');

  }, [kpData]);

  const latestKp = kpData.length > 0 ? kpData[kpData.length - 1].kp : 0;
  const hasAlert = latestKp >= 6;

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>Space Weather (Kp Index)</h3>
        {hasAlert && (
          <div style={{ 
            backgroundColor: '#e74c3c', 
            color: 'white', 
            padding: '5px 10px', 
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            ⚠️ SPACE WEATHER ALERT
          </div>
        )}
      </div>
      
      <svg 
        ref={svgRef} 
        width={600} 
        height={200}
        style={{ display: 'block', margin: '0 auto' }}
      />
      
      <div style={{ 
        marginTop: '10px', 
        fontSize: '12px', 
        color: '#666',
        textAlign: 'center'
      }}>
        Latest Kp: {latestKp.toFixed(1)} {hasAlert && '(Alert Level)'}
      </div>
    </div>
  );
}