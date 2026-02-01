
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ComponentType, ArduinoComponent } from './types';

const PIN_RANGE = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const App: React.FC = () => {
  // Balanced layout for component-only view
  const [components, setComponents] = useState<ArduinoComponent[]>([
    { id: 'uno_0', type: ComponentType.UNO, x: 50, y: 150, pin: null },
    { id: 'led_0', type: ComponentType.LED, x: 550, y: 100, pin: 12 },
    { id: 'button_0', type: ComponentType.BUTTON, x: 550, y: 300, pin: 2 }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [code, setCode] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Generate Arduino Code based on logical pin assignments
  const generateArduinoCode = useCallback(() => {
    const leds = components.filter(c => c.type === ComponentType.LED);
    const buttons = components.filter(c => c.type === ComponentType.BUTTON);

    let sketch = `/**\n * ElectraSim Generated Sketch\n */\n\n`;

    leds.forEach((l, i) => sketch += `const int ledPin${i} = ${l.pin};\n`);
    buttons.forEach((b, i) => sketch += `const int buttonPin${i} = ${b.pin};\n`);
    
    sketch += `\nvoid setup() {\n`;
    leds.forEach((l, i) => sketch += `  pinMode(ledPin${i}, OUTPUT);\n`);
    buttons.forEach((b, i) => sketch += `  pinMode(buttonPin${i}, INPUT_PULLUP);\n`);
    sketch += `}\n\n`;

    sketch += `void loop() {\n`;
    if (leds.length > 0 && buttons.length > 0) {
      sketch += `  // Logical Link: If button (Pin ${buttons[0].pin}) is LOW, turn on LED (Pin ${leds[0].pin})\n`;
      sketch += `  int state = digitalRead(buttonPin0);\n`;
      sketch += `  if (state == LOW) {\n`;
      sketch += `    digitalWrite(ledPin0, HIGH);\n`;
      sketch += `  } else {\n`;
      sketch += `    digitalWrite(ledPin0, LOW);\n`;
      sketch += `  }\n`;
    } else {
      sketch += `  // Add an LED and a Button to see interactive logic!\n`;
    }
    sketch += `}`;
    setCode(sketch);
  }, [components]);

  useEffect(() => {
    generateArduinoCode();
  }, [generateArduinoCode]);

  // Handle Drag from Palette
  const onDragStart = (e: React.DragEvent, type: ComponentType) => {
    if (isSimulating) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('componentType', type);
  };

  // Handle Drop on Canvas
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isSimulating || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 50;
    const y = e.clientY - rect.top - 50;
    const type = e.dataTransfer.getData('componentType') as ComponentType;

    if (type) {
      // Conflict Resolution: Auto-select next available pin
      const usedPins = components.map(c => c.pin).filter(p => p !== null);
      const nextPin = PIN_RANGE.find(p => !usedPins.includes(p)) || null;

      const newComp: ArduinoComponent = {
        id: `${type}_${Date.now()}`,
        type,
        x,
        y,
        pin: type === ComponentType.UNO ? null : nextPin
      };
      setComponents(prev => [...prev, newComp]);
    }
  };

  const updatePin = (id: string, pin: number) => {
    setComponents(prev => {
      // Logic for automatic swap if pin is already taken
      const targetPinOwner = prev.find(c => c.pin === pin && c.id !== id);
      const currentComp = prev.find(c => c.id === id);
      
      if (targetPinOwner && currentComp) {
        return prev.map(c => {
          if (c.id === id) return { ...c, pin };
          if (c.id === targetPinOwner.id) return { ...c, pin: currentComp.pin };
          return c;
        });
      }
      return prev.map(c => c.id === id ? { ...c, pin } : c);
    });
  };

  const deleteComponent = (id: string) => {
    if (isSimulating) return;
    setComponents(prev => prev.filter(c => c.id !== id));
  };

  // Simulation Logic handling
  const handleButtonState = (isPressed: boolean) => {
    if (!isSimulating) return;
    
    // Simple logical simulation: First button controls first LED
    const firstButton = components.find(c => c.type === ComponentType.BUTTON);
    const firstLed = components.find(c => c.type === ComponentType.LED);
    
    if (firstButton && firstLed) {
      const ledEl = document.querySelector(`#${firstLed.id} wokwi-led`) as any;
      if (ledEl) {
        ledEl.value = isPressed;
      }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#121217] text-slate-200">
      {/* Header */}
      <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#121217] z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white">A</div>
          <h1 className="font-bold text-lg tracking-tight">ElectraSim <span className="text-white/40 font-normal text-sm ml-2">v1.0</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {!isSimulating ? (
              <button 
                onClick={() => setIsSimulating(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-all active:scale-95 shadow-lg"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Start Simulation
              </button>
            ) : (
              <button 
                onClick={() => setIsSimulating(false)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-all active:scale-95 shadow-lg"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
                Stop Simulation
              </button>
            )}
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${isSimulating ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-green-500/20 text-green-400'}`}>
            {isSimulating ? 'Live Simulation' : 'Design Mode'}
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Palette */}
        <aside className="w-64 bg-[#2d2d3a] border-r border-white/10 flex flex-col z-20 shrink-0">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Components</h2>
          </div>
          <div className={`p-4 space-y-4 transition-opacity ${isSimulating ? 'opacity-50 pointer-events-none' : ''}`}>
            {[
              { type: ComponentType.UNO, label: 'Arduino Uno', icon: '📟', color: 'bg-blue-500/20' },
              { type: ComponentType.LED, label: 'Red LED', icon: '💡', color: 'bg-red-500/20' },
              { type: ComponentType.BUTTON, label: 'Push Button', icon: '🔘', color: 'bg-green-500/20' }
            ].map(item => (
              <div 
                key={item.type}
                draggable
                onDragStart={(e) => onDragStart(e, item.type)}
                className="p-3 rounded-lg border border-white/5 bg-white/5 flex items-center gap-3 cursor-grab hover:bg-white/10 hover:-translate-y-0.5 transition-all"
              >
                <div className={`w-8 h-8 ${item.color} rounded flex items-center justify-center`}>{item.icon}</div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-auto p-6 bg-black/20">
            <p className="text-[11px] text-white/30 leading-relaxed">
              Drag components and assign Pins. The simulation connects them logically without messy wires.
            </p>
          </div>
        </aside>

        {/* Canvas Area */}
        <main 
          ref={canvasRef}
          className="flex-1 canvas-grid relative overflow-hidden"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {components.map(comp => {
            const usedPinsByOthers = components
              .filter(c => c.id !== comp.id && c.pin !== null)
              .map(c => c.pin);

            return (
              <div 
                key={comp.id}
                id={comp.id}
                style={{ left: comp.x, top: comp.y }}
                className={`absolute flex flex-col items-center gap-3 group p-4 rounded-xl transition-all ${!isSimulating ? 'cursor-move hover:bg-white/5 border border-transparent hover:border-white/10' : ''}`}
                onMouseDown={(e) => {
                  if (isSimulating) return;
                  if ((e.target as HTMLElement).tagName === 'SELECT' || (e.target as HTMLElement).tagName.startsWith('WOKWI')) return;
                  
                  const startX = e.clientX;
                  const startY = e.clientY;
                  const initialX = comp.x;
                  const initialY = comp.y;
                  
                  const onMouseMove = (moveEvent: MouseEvent) => {
                    const newX = initialX + (moveEvent.clientX - startX);
                    const newY = initialY + (moveEvent.clientY - startY);
                    setComponents(prev => prev.map(c => c.id === comp.id ? { ...c, x: newX, y: newY } : c));
                  };
                  
                  const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', onMouseUp);
                  };
                  
                  document.addEventListener('mousemove', onMouseMove);
                  document.addEventListener('mouseup', onMouseUp);
                }}
              >
                {/* Wokwi Element */}
                <div className="relative">
                  {comp.type === ComponentType.UNO && <wokwi-arduino-uno />}
                  {comp.type === ComponentType.LED && <wokwi-led color="red" />}
                  {comp.type === ComponentType.BUTTON && (
                    <wokwi-pushbutton 
                      onMouseDown={() => handleButtonState(true)}
                      onMouseUp={() => handleButtonState(false)}
                      onMouseLeave={() => handleButtonState(false)}
                    />
                  )}
                </div>

                {/* Pin Control (Logical Wiring) */}
                {comp.type !== ComponentType.UNO && (
                  <div className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-full shadow-xl backdrop-blur-md">
                    <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-tight">Logical Pin</span>
                    <select 
                      disabled={isSimulating}
                      value={comp.pin || ''}
                      onChange={(e) => updatePin(comp.id, parseInt(e.target.value))}
                      className="bg-transparent text-white text-[12px] font-bold outline-none border-none cursor-pointer disabled:opacity-50"
                    >
                      {PIN_RANGE.map(p => (
                        <option 
                          key={p} 
                          value={p} 
                          className="bg-[#2d2d3a] text-white"
                        >
                          D{p} {usedPinsByOthers.includes(p) ? '(Swap)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Delete Button */}
                {!isSimulating && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteComponent(comp.id);
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg z-30 hover:scale-110 active:scale-90"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </main>

        {/* Code View */}
        <aside className="w-96 flex flex-col border-l border-white/10 z-20 shrink-0 bg-[#0f0f13]">
          <div className="p-4 bg-[#121217] border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-widest">Live Code</h2>
            <div className="flex gap-2">
               <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Synced</span>
               <button 
                onClick={() => {
                  navigator.clipboard.writeText(code);
                }}
                className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
          <pre className="flex-1 p-6 text-[13px] font-['Fira_Code'] text-[#dcdcaa] overflow-auto whitespace-pre-wrap select-text leading-relaxed">
            {code}
          </pre>
        </aside>
      </div>
    </div>
  );
};

export default App;
