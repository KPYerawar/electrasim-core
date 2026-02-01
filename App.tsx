
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ComponentType, ArduinoComponent } from './types';

const PIN_RANGE = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const App: React.FC = () => {
  const [components, setComponents] = useState<ArduinoComponent[]>([
    { id: 'uno_0', type: ComponentType.UNO, x: 50, y: 150, pin: null, label: 'A1' },
    { id: 'led_0', type: ComponentType.LED, x: 550, y: 100, pin: 12, arduinoId: 'uno_0' },
    { id: 'button_0', type: ComponentType.BUTTON, x: 550, y: 300, pin: 2, arduinoId: 'uno_0' }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isCodeOpen, setIsCodeOpen] = useState(true);
  const [arduinoCodes, setArduinoCodes] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLDivElement>(null);

  const arduinos = useMemo(() => components.filter(c => c.type === ComponentType.UNO), [components]);

  // Generate individual code for each Arduino
  const generateCodes = useCallback(() => {
    const newCodes: Record<string, string> = {};

    arduinos.forEach((uno) => {
      const assignedComponents = components.filter(c => c.arduinoId === uno.id);
      const leds = assignedComponents.filter(c => c.type === ComponentType.LED);
      const buttons = assignedComponents.filter(c => c.type === ComponentType.BUTTON);

      let sketch = `/**\n * Sketch for ${uno.label || 'Arduino'}\n */\n\n`;

      if (leds.length === 0 && buttons.length === 0) {
        sketch += `// No components assigned to this Arduino.\n// Drag components and set their target to ${uno.label}.`;
      } else {
        leds.forEach((l, i) => sketch += `const int ledPin${i} = ${l.pin};\n`);
        buttons.forEach((b, i) => sketch += `const int buttonPin${i} = ${b.pin};\n`);
        
        sketch += `\nvoid setup() {\n`;
        leds.forEach((l, i) => sketch += `  pinMode(ledPin${i}, OUTPUT);\n`);
        buttons.forEach((b, i) => sketch += `  pinMode(buttonPin${i}, INPUT_PULLUP);\n`);
        sketch += `}\n\n`;

        sketch += `void loop() {\n`;
        if (leds.length > 0 && buttons.length > 0) {
          sketch += `  if (digitalRead(buttonPin0) == LOW) {\n`;
          sketch += `    digitalWrite(ledPin0, HIGH);\n`;
          sketch += `  } else {\n`;
          sketch += `    digitalWrite(ledPin0, LOW);\n`;
          sketch += `  }\n`;
        } else {
          sketch += `  // Add logic here...\n`;
        }
        sketch += `}`;
      }
      newCodes[uno.id] = sketch;
    });

    setArduinoCodes(newCodes);
  }, [components, arduinos]);

  useEffect(() => {
    generateCodes();
  }, [generateCodes]);

  const onDragStart = (e: React.DragEvent, type: ComponentType) => {
    if (isSimulating) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('componentType', type);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isSimulating || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 50;
    const y = e.clientY - rect.top - 50;
    const type = e.dataTransfer.getData('componentType') as ComponentType;

    if (type) {
      const isUno = type === ComponentType.UNO;
      const count = components.filter(c => c.type === type).length;
      
      const newComp: ArduinoComponent = {
        id: `${type}_${Date.now()}`,
        type,
        x,
        y,
        pin: isUno ? null : PIN_RANGE[0],
        label: isUno ? `A${arduinos.length + 1}` : undefined,
        arduinoId: !isUno && arduinos.length > 0 ? arduinos[0].id : undefined
      };
      setComponents(prev => [...prev, newComp]);
    }
  };

  const updatePin = (id: string, pin: number) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, pin } : c));
  };

  const updateTargetArduino = (id: string, targetId: string) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, arduinoId: targetId } : c));
  };

  const deleteComponent = (id: string) => {
    if (isSimulating) return;
    setComponents(prev => {
      const filtered = prev.filter(c => c.id !== id);
      // If we delete an Arduino, unassign its children
      return filtered.map(c => c.arduinoId === id ? { ...c, arduinoId: undefined } : c);
    });
  };

  const handleButtonState = (compId: string, isPressed: boolean) => {
    if (!isSimulating) return;
    const btn = components.find(c => c.id === compId);
    if (!btn || !btn.arduinoId) return;

    // Logic: Find LED assigned to same Arduino
    const targetLed = components.find(c => c.type === ComponentType.LED && c.arduinoId === btn.arduinoId);
    if (targetLed) {
      const ledEl = document.querySelector(`#${targetLed.id} wokwi-led`) as any;
      if (ledEl) ledEl.value = isPressed;
    }
  };

  // Component Stats for Top Bar
  const stats = useMemo(() => {
    return [
      { type: ComponentType.UNO, icon: '📟', count: arduinos.length },
      { type: ComponentType.LED, icon: '💡', count: components.filter(c => c.type === ComponentType.LED).length },
      { type: ComponentType.BUTTON, icon: '🔘', count: components.filter(c => c.type === ComponentType.BUTTON).length },
    ];
  }, [components, arduinos]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#121217] text-slate-200">
      {/* Header */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#121217] z-30 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white">E</div>
            <h1 className="font-bold text-lg tracking-tight">ElectraSim</h1>
          </div>
          
          {/* Component Usage Tracker */}
          <div className="h-6 w-px bg-white/10 mx-2" />
          <div className="flex items-center gap-4">
            {stats.map(s => (
              <div key={s.type} className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                <span className="text-sm">{s.icon}</span>
                <span className="text-xs font-bold text-white/60">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCodeOpen(!isCodeOpen)}
            className={`p-2 rounded-lg transition-colors ${isCodeOpen ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/5'}`}
            title="Toggle Code View"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>
          </button>
          
          <div className="flex items-center gap-2">
            {!isSimulating ? (
              <button onClick={() => setIsSimulating(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Start
              </button>
            ) : (
              <button onClick={() => setIsSimulating(false)} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg> Stop
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Palette */}
        <aside className="w-64 bg-[#2d2d3a] border-r border-white/10 flex flex-col z-20 shrink-0">
          <div className="p-4 border-b border-white/5"><h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Library</h2></div>
          <div className={`p-4 space-y-4 ${isSimulating ? 'opacity-50 pointer-events-none' : ''}`}>
            {[
              { type: ComponentType.UNO, label: 'Arduino Uno', icon: '📟', color: 'bg-blue-500/20' },
              { type: ComponentType.LED, label: 'Red LED', icon: '💡', color: 'bg-red-500/20' },
              { type: ComponentType.BUTTON, label: 'Push Button', icon: '🔘', color: 'bg-green-500/20' }
            ].map(item => (
              <div key={item.type} draggable onDragStart={(e) => onDragStart(e, item.type)} className="p-3 rounded-lg border border-white/5 bg-white/5 flex items-center gap-3 cursor-grab hover:bg-white/10 transition-all">
                <div className={`w-8 h-8 ${item.color} rounded flex items-center justify-center text-lg`}>{item.icon}</div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <main ref={canvasRef} className="flex-1 canvas-grid relative overflow-hidden" onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
          {arduinos.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="bg-indigo-500/10 border border-indigo-500/20 px-8 py-6 rounded-2xl backdrop-blur-md text-center">
                <div className="text-4xl mb-4">📟</div>
                <h3 className="text-xl font-bold text-indigo-300">No Arduino Found</h3>
                <p className="text-sm text-white/40 mt-1 max-w-[200px]">Drag an Arduino from the library to start generating code.</p>
              </div>
            </div>
          )}

          {components.map(comp => {
            const isUno = comp.type === ComponentType.UNO;
            return (
              <div 
                key={comp.id} id={comp.id} style={{ left: comp.x, top: comp.y }}
                className={`absolute flex flex-col items-center gap-3 group p-4 rounded-xl transition-all ${!isSimulating ? 'cursor-move hover:bg-white/5 border border-transparent hover:border-white/10' : ''}`}
                onMouseDown={(e) => {
                  if (isSimulating || (e.target as HTMLElement).tagName === 'SELECT') return;
                  const startX = e.clientX, startY = e.clientY, initialX = comp.x, initialY = comp.y;
                  const move = (me: MouseEvent) => setComponents(p => p.map(c => c.id === comp.id ? { ...c, x: initialX + (me.clientX - startX), y: initialY + (me.clientY - startY) } : c));
                  const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
                  document.addEventListener('mousemove', move); document.addEventListener('mouseup', up);
                }}
              >
                <div className="relative">
                  {isUno && <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xl">{comp.label}</div>}
                  {comp.type === ComponentType.UNO && <wokwi-arduino-uno />}
                  {comp.type === ComponentType.LED && <wokwi-led color="red" />}
                  {comp.type === ComponentType.BUTTON && (
                    <wokwi-pushbutton onMouseDown={() => handleButtonState(comp.id, true)} onMouseUp={() => handleButtonState(comp.id, false)} />
                  )}
                </div>

                {!isUno && (
                  <div className="flex flex-col gap-1.5 p-2 bg-black/60 rounded-xl border border-white/5 backdrop-blur-md shadow-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Connect to</span>
                      <select 
                        disabled={isSimulating} value={comp.arduinoId || ''} onChange={(e) => updateTargetArduino(comp.id, e.target.value)}
                        className="bg-transparent text-indigo-300 text-[11px] font-bold outline-none border-none cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {arduinos.map(a => <option key={a.id} value={a.id} className="bg-[#121217]">{a.label}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Digital Pin</span>
                      <select 
                        disabled={isSimulating} value={comp.pin || ''} onChange={(e) => updatePin(comp.id, parseInt(e.target.value))}
                        className="bg-transparent text-white text-[11px] font-bold outline-none border-none cursor-pointer"
                      >
                        {PIN_RANGE.map(p => <option key={p} value={p} className="bg-[#121217]">D{p}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {!isSimulating && (
                  <button onClick={(e) => { e.stopPropagation(); deleteComponent(comp.id); }} className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg z-30">✕</button>
                )}
              </div>
            );
          })}
        </main>

        {/* Code View */}
        {isCodeOpen && (
          <aside className="w-96 flex flex-col border-l border-white/10 z-20 shrink-0 bg-[#0f0f13] overflow-auto">
            <div className="p-4 bg-[#121217] border-b border-white/10 flex items-center justify-between sticky top-0 z-10">
              <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Sketches</h2>
              <div className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-[9px] text-green-500 font-bold uppercase tracking-wider">Auto-Sync</div>
            </div>

            {arduinos.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-8 text-center">
                <p className="text-xs text-white/20 italic">No Arduinos present on canvas to generate code.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 p-4">
                {arduinos.map(uno => (
                  <div key={uno.id} className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-4 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-400">{uno.label} Sketch</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(arduinoCodes[uno.id] || '')}
                        className="text-[9px] uppercase tracking-widest font-bold hover:text-white transition-colors"
                      >Copy</button>
                    </div>
                    <pre className="p-4 text-[12px] font-['Fira_Code'] text-[#dcdcaa] leading-relaxed overflow-auto">
                      {arduinoCodes[uno.id]}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

export default App;

