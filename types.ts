
export enum ComponentType {
  UNO = 'uno',
  LED = 'led',
  BUTTON = 'button',
  BATTERY = 'battery',
  RESISTOR = 'resistor',
  SWITCH = 'switch',
  GROUND = 'ground'
}

export interface Terminal {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface Connection {
  fromId: string;
  fromTerminal: string;
  toId: string;
  toTerminal: string;
}

export interface ArduinoComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  pin: number | null;
  value?: string;
  arduinoId?: string; // Links component to a specific Arduino unit
  label?: string;     // Friendly name (e.g., A1, A2)
}

export type PlacedComponent = ArduinoComponent;

export interface ValidationResult {
  isValid: boolean;
  message: string;
  suggestions: string[];
}

