# DockerSwag 🐳

**DockerSwag** is a modern, AI-powered visual editor for Docker Compose. It allows developers to design, configure, and manage Docker services through an intuitive UI while leveraging Google Gemini AI for intelligent generation and analysis.

<img width="2752" height="1536" alt="dockerswag" src="https://github.com/user-attachments/assets/e845f5b0-46b1-4d87-b850-a0113a7b72b6" />


https://github.com/user-attachments/assets/d092c407-7209-4c64-8df8-905946c401d6



## ✨ Features

- **Visual Service Editor**: Easily configure services, ports, volumes, environment variables, restart policies, and **service dependencies** without wrestling with YAML indentation.
- **Advanced Build Configuration**: Support for `build` contexts alongside pre-built images. Choose between **Manual** setup (Dockerfile, target, args), **Repo** mode (clone as context), or **AI Assist** to generate complex build configurations from natural language.
- **AI Magic Generation**: Describe the service you need (e.g., *"A Postgres database with user 'admin' and password 'secret'"*), and let Gemini AI build the configuration for you.
- **Repo to Compose**: Paste a GitHub repository URL, and the AI will infer the technology stack (e.g., Node.js + MongoDB) and generate a complete Docker Compose configuration for it.
- **Intelligent Analysis**: One-click security and performance auditing of your entire stack. Get actionable insights on best practices.
- **Smart Import & Migration**: Paste any `docker-compose.yml` (v1, v2, or v3). The app automatically attempts to migrate it to modern v3.8 standards and loads it into the visual editor.
- **Real-time Preview**: Watch the `docker-compose.yml` file generate instantly as you edit the UI.
- **History Control**: Built-in Undo/Redo functionality to experiment safely.
- **Export**: Download your production-ready `docker-compose.yml` with a single click.

## 🚀 Getting Started

1. **Create a Stack**:
   - Click **"Add Empty"** to start from scratch.
   - Click **"Generate with AI"** to create a specific service via prompt.
   - Click **"Repo"** to generate a full stack from a GitHub URL.
2. **Configure**: Select a service from the sidebar and use the editor panel to tweak images, ports, environment variables, and map out dependencies (`depends_on`).
3. **Build Settings**: Toggle between "Pre-built Image" and "Build from Source" in the editor. Use the **AI Assist** tab to let Gemini figure out your build context and arguments.
4. **Analyze**: Click the "Analyze" button to run a security and performance check on your stack.
5. **Export**: Once satisfied, click "Export" to download your file.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **Icons**: Lucide React
- **Build**: Vite (implied environment)

## 🔑 Environment Setup

This application requires a Google Gemini API Key to function.

Ensure `process.env.API_KEY` is available in your build environment.

---
*Built with ❤️ for the container community.*
