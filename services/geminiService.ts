
import { GoogleGenAI, Type } from "@google/genai";
import { PlacedComponent, Connection, ValidationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function validateCircuit(
  components: PlacedComponent[],
  connections: Connection[]
): Promise<ValidationResult> {
  const circuitData = {
    components: components.map(c => ({ id: c.id, type: c.type, value: c.value })),
    connections: connections.map(conn => ({
      from: `${conn.fromId}.${conn.fromTerminal}`,
      to: `${conn.toId}.${conn.toTerminal}`
    }))
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this electronic circuit and provide a validation report.
      Circuit Data: ${JSON.stringify(circuitData)}`,
      config: {
        systemInstruction: "You are an expert electronics engineer. Validate the provided circuit schematic. Check for short circuits, open loops, missing ground, missing current limiting resistors for LEDs, and general functionality. Return ONLY a JSON object.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            message: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["isValid", "message", "suggestions"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result as ValidationResult;
  } catch (error) {
    console.error("Validation error:", error);
    return {
      isValid: false,
      message: "Unable to validate circuit at this time.",
      suggestions: ["Check your internet connection", "Ensure the circuit is not empty"]
    };
  }
}
