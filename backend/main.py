import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from langchain_core.messages import HumanMessage, AIMessage
from model.model import build_chain, Fennec
from helper import findExtension
from pathlib import Path

ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt', 'csv', 'md']
DATA_DIR = "./data"

rag_chain = None
chat_history = []

@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs(DATA_DIR, exist_ok=True)
    yield

app = FastAPI(lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.post('/upload')
async def upload(files: List[UploadFile] = File(...)):
    global rag_chain, chat_history
    for file in files:
        extension = findExtension(file.filename)
        if extension not in ALLOWED_EXTENSIONS:
            return JSONResponse(content={"error": f"{file.filename} is not a supported file type."}, status_code=400)
    for f in Path(DATA_DIR).iterdir():
        f.unlink()
    current_saved_files = []
    for file in files:
        with open(f"{DATA_DIR}/{file.filename}", "wb") as f:
            f.write(await file.read())
        current_saved_files.append(file.filename)
    try:
        print(f"Building chain for: {current_saved_files}")
        rag_chain = build_chain()
        chat_history = []
        return {"message": f"{len(current_saved_files)} file(s) uploaded and indexed.", "files": current_saved_files}
    except FileNotFoundError as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post('/askFennec')
def askFennec(msg: dict):
    global chat_history
    if rag_chain is None:
        return JSONResponse(content={"error": "No document uploaded yet. Call /upload first."}, status_code=503)
    try:
        question = msg['text']
        print(f'question is: {question}')
        response = Fennec(question, rag_chain, chat_history)
        chat_history.append(HumanMessage(content=question))
        chat_history.append(AIMessage(content=response))
        return {'response': response, 'history_length': len(chat_history) // 2}
    except KeyError:
        return JSONResponse(content={"error": "Request body must contain a 'text' key."}, status_code=400)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.delete('/history')
def clear_history():
    global chat_history, rag_chain
    chat_history = []
    rag_chain = None
    for file in Path(DATA_DIR).iterdir():
        file.unlink()
    return {"message": "History got deleted"}