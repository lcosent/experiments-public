"use client";

import React, { useRef, useEffect, useState } from 'react';

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  type: string;
}

interface Particle {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  progress: number; // 0 to 1
  color: string;
  size: number;
}

function toFriendlyLog(log: string): string {
  if (log.includes("Initiating compute job quote")) return "Requesting compute cost quote...";
  if (log.includes("Quote: 1.20 USDC")) return "Quote received: 1.20 USDC for 2 minutes execution";
  if (log.includes("Lock Escrow transaction validated")) return "Securing 1.20 USDC in Escrow Vault...";
  if (log.includes("escrowed. Dispatching intent")) return "Escrow verified. Notifying compute provider...";
  if (log.includes("Intent received. Launching")) return "Compute provider booting virtual GPU container...";
  if (log.includes("Container running. Emitting")) return "GPU running. Processing compute job...";
  if (log.includes("Tick 1/4")) return "Compute progress: 25% completed. Settling micropayment...";
  if (log.includes("Tick 2/4")) return "Compute progress: 50% completed. Settling micropayment...";
  if (log.includes("Tick 3/4")) return "Compute progress: 75% completed. Settling micropayment...";
  if (log.includes("Tick 4/4")) return "Compute progress: 100% completed. Settling micropayment...";
  if (log.includes("Escrow settled completely")) return "Compute complete. Escrow funds released to provider.";
  if (log.includes("Machine compute transaction completed")) return "Transaction finished successfully!";
  if (log.includes("Machine Payment Network initialized")) return "Payment network ready.";
  if (log.includes("Ready for transaction simulation")) return "Click button to start.";
  return log;
}

export default function NetworkSimulator({ devMode }: { devMode: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes] = useState<Node[]>([
    { id: '1', name: 'Agent Alice (Requestor)', x: 120, y: 150, color: '#0969da', type: 'agent' },
    { id: '2', name: 'DComp (Provider)', x: 480, y: 150, color: '#1a7f37', type: 'provider' },
    { id: '3', name: 'USDC Escrow Vault', x: 300, y: 320, color: '#8250df', type: 'vault' }
  ]);
  const [, setParticles] = useState<Particle[]>([]);
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Machine Payment Network initialized.",
    "[SYSTEM] Ready for transaction simulation."
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Grid background
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Edges
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = 2;
      // Edge: Alice -> Vault
      ctx.beginPath();
      ctx.moveTo(nodes[0]!.x, nodes[0]!.y);
      ctx.lineTo(nodes[2]!.x, nodes[2]!.y);
      ctx.stroke();

      // Edge: Vault -> DComp
      ctx.beginPath();
      ctx.moveTo(nodes[2]!.x, nodes[2]!.y);
      ctx.lineTo(nodes[1]!.x, nodes[1]!.y);
      ctx.stroke();

      // Edge: DComp -> Alice (Compute channel)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(26, 127, 55, 0.08)';
      ctx.setLineDash([5, 5]);
      ctx.moveTo(nodes[1]!.x, nodes[1]!.y);
      ctx.lineTo(nodes[0]!.x, nodes[0]!.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Update and Draw Particles
      setParticles(prev => {
        const nextParticles: Particle[] = [];
        prev.forEach(p => {
          const updatedProgress = p.progress + 0.02;
          if (updatedProgress < 1) {
            // Draw particle
            const currentX = p.fromX + (p.toX - p.fromX) * updatedProgress;
            const currentY = p.fromY + (p.toY - p.fromY) * updatedProgress;

            ctx.beginPath();
            ctx.arc(currentX, currentY, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            nextParticles.push({ ...p, progress: updatedProgress });
          }
        });
        return nextParticles;
      });

      // Draw Nodes
      nodes.forEach(node => {
        // Outer border
        ctx.beginPath();
        ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = '#1f2328';
        ctx.font = "bold 11px 'JetBrains Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + 45);
        
        // Node Type
        ctx.fillStyle = '#8c959f';
        ctx.font = "9px 'JetBrains Mono', monospace";
        ctx.fillText(node.type.toUpperCase(), node.x, node.y - 36);
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [nodes]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  const simulateTransaction = async () => {
    if (isRunning) return;
    setIsRunning(true);
    
    // Step 1: Alice locks funds in Escrow Vault
    addLog("[MPP] Initiating compute job quote...");
    await new Promise(r => setTimeout(r, 600));
    addLog("[MPP] Quote: 1.20 USDC estimated for 120 seconds execution.");
    
    // Send particle from Alice to Vault
    setParticles(prev => [
      ...prev,
      { id: Math.random().toString(), fromX: nodes[0]!.x, fromY: nodes[0]!.y, toX: nodes[2]!.x, toY: nodes[2]!.y, progress: 0, color: '#0969da', size: 5 }
    ]);
    await new Promise(r => setTimeout(r, 1000));
    
    addLog("[VAULT] Lock Escrow transaction validated. TX Hash: 0x8a927d...");
    addLog("[VAULT] 1.20 USDC escrowed. Dispatching intent sign to provider...");
    
    // Send particle from Vault to Provider
    setParticles(prev => [
      ...prev,
      { id: Math.random().toString(), fromX: nodes[2]!.x, fromY: nodes[2]!.y, toX: nodes[1]!.x, toY: nodes[1]!.y, progress: 0, color: '#8250df', size: 5 }
    ]);
    await new Promise(r => setTimeout(r, 1000));
    
    addLog("[PROVIDER] Intent received. Launching virtual GPU container...");
    await new Promise(r => setTimeout(r, 800));
    addLog("[PROVIDER] Container running. Emitting compute ticks...");

    // Stream ticks from Provider to Alice
    for (let i = 1; i <= 4; i++) {
      addLog(`[METER] Tick ${i}/4: 0.30 USDC micro-payment settled.`);
      
      // Particle from Provider to Vault (payment settlement)
      setParticles(prev => [
        ...prev,
        { id: Math.random().toString(), fromX: nodes[2]!.x, fromY: nodes[2]!.y, toX: nodes[1]!.x, toY: nodes[1]!.y, progress: 0, color: '#1a7f37', size: 4 }
      ]);
      
      // Particle from Provider to Alice (compute telemetry)
      setParticles(prev => [
        ...prev,
        { id: Math.random().toString(), fromX: nodes[1]!.x, fromY: nodes[1]!.y, toX: nodes[0]!.x, toY: nodes[0]!.y, progress: 0, color: '#1a7f37', size: 4 }
      ]);

      await new Promise(r => setTimeout(r, 1200));
    }

    addLog("[VAULT] Escrow settled completely. Closing channel.");
    addLog("[SYSTEM] Machine compute transaction completed successfully.");
    setIsRunning(false);
  };

  return (
    <div className="simulator-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginTop: '24px' }}>
      <div style={{ background: 'rgba(246, 248, 250, 0.6)', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '0px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#1f2328' }}>
          <span style={{ color: '#0969da' }}>## </span>1. Compute Network Visualizer
        </h3>
        <canvas 
          ref={canvasRef} 
          width={600} 
          height={380} 
          style={{ width: '100%', height: 'auto', background: '#ffffff', borderRadius: 0, border: '1px solid rgba(0, 0, 0, 0.08)' }} 
        />
        <button 
          onClick={simulateTransaction} 
          disabled={isRunning}
          onMouseEnter={() => setBtnHover(true)}
          onMouseLeave={() => setBtnHover(false)}
          style={{
            background: isRunning ? 'transparent' : btnHover ? '#8250df' : '#ffffff',
            color: isRunning ? '#8c959f' : btnHover ? '#ffffff' : '#8250df',
            border: isRunning ? '1px solid rgba(0,0,0,0.08)' : '1px solid #8250df',
            borderRadius: 0,
            padding: '10px 16px',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s ease',
            fontFamily: "'JetBrains Mono', monospace"
          }}
        >
          {isRunning ? 'Simulation In Progress...' : '> Trigger Agent Transaction Flow'}
        </button>
      </div>

      <div style={{ background: 'rgba(246, 248, 250, 0.6)', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '0px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: '#1f2328' }}>
          <span style={{ color: '#0969da' }}>## </span>2. Real-time Transaction Ledger
        </h3>
        <div style={{
          background: 'rgba(0, 0, 0, 0.02)',
          borderLeft: '2px solid #0969da',
          borderRadius: 0,
          padding: '12px 16px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.75rem',
          height: '350px',
          overflowY: 'auto',
          color: '#1f2328',
          lineHeight: '1.7',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {logs.map((log, i) => {
            const isSystem = log.startsWith("[SYSTEM]");
            const isError = log.includes("[ERROR]");
            const isSuccess = log.includes("[SUCCESS]") || log.includes("[METER]") || log.includes("[PROVIDER]");
            
            let color = '#1f2328';
            if (isError) color = '#cf222e';
            else if (isSuccess) color = '#1a7f37';
            else if (isSystem) color = '#0969da';
            
            const displayText = devMode ? log : toFriendlyLog(log);
            
            return (
              <div key={i} style={{ color, borderBottom: '1px solid rgba(0,0,0,0.02)', paddingBottom: '4px' }}>
                &gt; {displayText}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
