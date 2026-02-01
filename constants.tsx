
import React from 'react';
import { ComponentType, Terminal } from './types';

export interface ComponentTemplate {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
  terminals: Terminal[];
  defaultValue?: string;
}

export const COMPONENTS: ComponentTemplate[] = [
  {
    type: ComponentType.BATTERY,
    label: '9V Battery',
    defaultValue: '9V',
    icon: (
      <svg width="40" height="60" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="10" width="30" height="45" rx="2" fill="#334155" />
        <rect x="10" y="5" width="8" height="5" fill="#94a3b8" />
        <rect x="22" y="5" width="8" height="5" fill="#94a3b8" />
        <text x="20" y="40" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">9V</text>
      </svg>
    ),
    terminals: [
      { id: 'pos', name: 'Positive', x: 14, y: 5 },
      { id: 'neg', name: 'Negative', x: 26, y: 5 }
    ]
  },
  {
    type: ComponentType.RESISTOR,
    label: 'Resistor',
    defaultValue: '220Ω',
    icon: (
      <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 10H15L17.5 5L22.5 15L27.5 5L32.5 15L37.5 5L42.5 15L45 10H60" stroke="#f59e0b" strokeWidth="2" />
      </svg>
    ),
    terminals: [
      { id: 't1', name: 'Terminal 1', x: 0, y: 10 },
      { id: 't2', name: 'Terminal 2', x: 60, y: 10 }
    ]
  },
  {
    type: ComponentType.LED,
    label: 'Red LED',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="15" r="10" fill="#ef4444" />
        <path d="M15 35V25M25 35V25" stroke="#94a3b8" strokeWidth="2" />
      </svg>
    ),
    terminals: [
      { id: 'anode', name: 'Anode (+)', x: 15, y: 35 },
      { id: 'cathode', name: 'Cathode (-)', x: 25, y: 35 }
    ]
  },
  {
    type: ComponentType.SWITCH,
    label: 'Switch',
    icon: (
      <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="5" cy="15" r="3" fill="#64748b" />
        <circle cx="35" cy="15" r="3" fill="#64748b" />
        <line x1="5" y1="15" x2="30" y2="5" stroke="#64748b" strokeWidth="2" />
      </svg>
    ),
    terminals: [
      { id: 't1', name: 'Terminal 1', x: 5, y: 15 },
      { id: 't2', name: 'Terminal 2', x: 35, y: 15 }
    ]
  },
  {
    type: ComponentType.GROUND,
    label: 'Ground',
    icon: (
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="15" y1="0" x2="15" y2="20" stroke="#000" strokeWidth="2" />
        <line x1="5" y1="20" x2="25" y2="20" stroke="#000" strokeWidth="2" />
        <line x1="10" y1="25" x2="20" y2="25" stroke="#000" strokeWidth="2" />
      </svg>
    ),
    terminals: [
      { id: 'gnd', name: 'Ground', x: 15, y: 0 }
    ]
  }
];
