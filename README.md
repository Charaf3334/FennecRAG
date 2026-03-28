# FennecRAG
Local AI-powered RAG designed to understand your documents effortlessly.

# Installation

### 1. Install Ollama
Before cloning the project, make sure you have <a href="https://ollama.com">Ollama</a> installed.
After installing Ollama, verify it's working properly by running:
```bash
ollama list
```
You should see something like:
```bash
NAME    ID    SIZE    MODIFIED
```
If the list is empty, that's normal, it just means no models are installed yet.

### 2. Install the Required Models
Fennec uses **gemma3:4b** as the LLM and **nomic-embed-text** as the embeddings model.
To install them, simply run:
```bash
ollama pull gemma3:4b
ollama pull nomic-embed-text
```
After installing, run `ollama list` and you will see something like:
```bash
NAME                       ID              SIZE      MODIFIED
gemma3:4b                  a2af6cc3eb7f    3.3 GB    2 minutes ago
nomic-embed-text:latest    0a109f422b47    274 MB    30 seconds ago
```
That's it, Fennec's dependencies are installed.

### 3. Run Fennec
Clone the repository:
```bash
git clone https://github.com/Charaf3334/FennecRAG.git
```
Navigate to the project directory:
```bash
cd FennecRAG
```
Then launch the application using Docker:
```bash
docker compose up -d
```
Fennec is now ready!

# Usage
Open your browser and go to:
```bash
http://localhost:3000
```
That's it, start asking questions about your documents with Fennec!

# Note
While developing and coding Fennec, I encountered limitations due to hardware constraints, which sometimes prevented using stronger models for both the LLM and embeddings.
