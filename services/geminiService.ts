import { GoogleGenAI, Type } from "@google/genai";
import { DockerService, AnalysisResult } from "../types";
import { v4 as uuidv4 } from 'uuid'; // We will use a simple random ID generator instead since uuid isn't standard in browser without polyfills, implemented locally below.

// Simple ID generator to avoid external dep for this specific file if UUID isn't available
const generateId = () => Math.random().toString(36).substring(2, 15);

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateServiceFromPrompt = async (prompt: string): Promise<DockerService> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a Docker Compose service configuration for: ${prompt}. Return a single service object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Service name (lowercase, no spaces)" },
            image: { type: Type.STRING, description: "Docker image name including tag" },
            ports: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  host: { type: Type.STRING },
                  container: { type: Type.STRING }
                }
              }
            },
            environment: {
              type: Type.OBJECT,
              description: "Key value pairs for environment variables"
            },
            volumes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  target: { type: Type.STRING }
                }
              }
            },
            command: { type: Type.STRING, description: "Optional start command" }
          },
          required: ["name", "image"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);

    // Transform AI response to our internal format
    const service: DockerService = {
      id: generateId(),
      name: data.name || 'generated-service',
      image: data.image || 'ubuntu:latest',
      command: data.command,
      restart: 'unless-stopped',
      ports: (data.ports || []).map((p: any) => ({
        id: generateId(),
        host: String(p.host),
        container: String(p.container),
        protocol: 'tcp'
      })),
      environment: Object.entries(data.environment || {}).map(([key, value]) => ({
        id: generateId(),
        key,
        value: String(value)
      })),
      volumes: (data.volumes || []).map((v: any) => ({
        id: generateId(),
        source: v.source,
        target: v.target
      })),
      networks: [],
      dependsOn: []
    };

    return service;
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw error;
  }
};

export const explainService = async (serviceYaml: string): Promise<string> => {
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain what this Docker Compose service does in 2 concise sentences:\n\n${serviceYaml}`,
    });
    return response.text || "Could not generate explanation.";
  } catch (error) {
    console.error(error);
    return "AI service unavailable.";
  }
}

export const analyzeComposeConfig = async (yaml: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following Docker Compose configuration. Provide a summary, and list specific points for security improvements, performance optimizations, and general best practices.
      
      YAML:
      ${yaml}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A brief 1-2 sentence overview of the stack" },
            security: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of security concerns or improvements" 
            },
            performance: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of performance optimizations" 
            },
            bestPractices: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of general docker best practices" 
            }
          },
          required: ["summary", "security", "performance", "bestPractices"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("AI Analysis failed:", error);
    throw error;
  }
};

export const parseAndMigrateYaml = async (yamlInput: string): Promise<DockerService[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are a Docker Compose expert. 
        1. Analyze the provided Docker Compose file (it may be version 1, 2, or 3).
        2. Migrate it to modern Docker Compose v3.8 best practices (e.g. converting 'links' to 'depends_on' or networks).
        3. Extract the services into a JSON structure matching the schema.
        
        Input YAML:
        ${yamlInput}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            services: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Service key name" },
                  image: { type: Type.STRING },
                  command: { type: Type.STRING },
                  restart: { type: Type.STRING },
                  ports: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        host: { type: Type.STRING },
                        container: { type: Type.STRING },
                        protocol: { type: Type.STRING }
                      }
                    }
                  },
                  environment: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        key: { type: Type.STRING },
                        value: { type: Type.STRING }
                      }
                    }
                  },
                  volumes: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        source: { type: Type.STRING },
                        target: { type: Type.STRING }
                      }
                    }
                  },
                  networks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  dependsOn: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  mem_limit: { type: Type.STRING }
                },
                required: ["name", "image"]
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsed = JSON.parse(text);
    
    // Map to internal DockerService type with IDs
    return parsed.services.map((s: any) => ({
      id: generateId(),
      name: s.name,
      image: s.image,
      command: s.command,
      restart: s.restart,
      ports: (s.ports || []).map((p: any) => ({
        id: generateId(),
        host: String(p.host),
        container: String(p.container),
        protocol: p.protocol || 'tcp'
      })),
      environment: (s.environment || []).map((e: any) => ({
        id: generateId(),
        key: e.key,
        value: String(e.value)
      })),
      volumes: (s.volumes || []).map((v: any) => ({
        id: generateId(),
        source: v.source,
        target: v.target
      })),
      networks: s.networks || [],
      dependsOn: s.dependsOn || [],
      mem_limit: s.mem_limit
    }));

  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};