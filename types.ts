
// Fix: Added missing members to ComponentType, and exported Terminal, Connection, and PlacedComponent to resolve compilation errors.
export enum ComponentType {
  UNO = 'uno',
  LED = 'led',
  BUTTON = 'button',
  BATTERY = 'battery',
  RESISTOR = 'resistor',
  SWITCH = 'switch',
  GROUND = 'ground'
}

// Fix: Added Terminal interface for component connection points used in constants.tsx
export interface Terminal {
  id: string;
  name: string;
  x: number;
  y: number;
}

// Fix: Added Connection interface for defining links between component terminals
export interface Connection {
  fromId: string;
  fromTerminal: string;
  toId: string;
  toTerminal: string;
}

// Fix: Enhanced ArduinoComponent to include optional value for circuit validation
export interface ArduinoComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  pin: number | null;
  value?: string;
}

// Fix: Exported PlacedComponent as an alias for ArduinoComponent to support geminiService.ts
export type PlacedComponent = ArduinoComponent;

export interface ValidationResult {
  isValid: boolean;
  message: string;
  suggestions: string[];
}
