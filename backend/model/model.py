from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader, TextLoader, CSVLoader, UnstructuredWordDocumentLoader, UnstructuredMarkdownLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_ollama import OllamaEmbeddings, ChatOllama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from operator import itemgetter

EMBEDDINGS_MODEL = "nomic-embed-text"
LLM_MODEL = "gemma3:4b"
DATA_DIR = "./data"

def build_chain():
    embeddings = OllamaEmbeddings(model=EMBEDDINGS_MODEL)
    docs = []
    loaders = [
        DirectoryLoader(DATA_DIR, glob="./*.pdf",  loader_cls=PyPDFLoader),
        DirectoryLoader(DATA_DIR, glob="./*.txt",  loader_cls=TextLoader),
        DirectoryLoader(DATA_DIR, glob="./*.csv",  loader_cls=CSVLoader),
        DirectoryLoader(DATA_DIR, glob="./*.docx", loader_cls=UnstructuredWordDocumentLoader),
        DirectoryLoader(DATA_DIR, glob="./*.md",   loader_cls=UnstructuredMarkdownLoader),
    ]
    for loader in loaders:
        docs.extend(loader.load())
    if not docs:
        raise FileNotFoundError(f"No PDF files found in '{DATA_DIR}'.")
    chunks = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=80).split_documents(docs)
    vector_db = Chroma.from_documents(documents=chunks, embedding=embeddings)
    retriever = vector_db.as_retriever(search_kwargs={"k": 4})
    llm = ChatOllama(model=LLM_MODEL)
    prompt = ChatPromptTemplate.from_messages([
        ("system", 
        "You are Fennec, a strict RAG assistant. "
        "You MUST answer ONLY using the information in the context below. "
        "Do NOT use any knowledge from your training data. "
        "Do NOT make assumptions or infer anything beyond what is explicitly written. "
        "If the answer is not found word-for-word in the context, respond with: 'I don't know, this information is not in the provided documents.' "
        "Context:\n{context}"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}"),
    ])
    return (RunnablePassthrough.assign(context=itemgetter("question") | retriever) | prompt | llm | StrOutputParser())

def Fennec(message: str, chain, chat_history: list):
    return chain.invoke({"question": message, "chat_history": chat_history})