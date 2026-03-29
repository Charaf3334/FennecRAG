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

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

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
        "You are Fennec, an intelligent RAG assistant. Your sole purpose is to help the user understand and explore the documents they have provided.\n\n"
        "=== WHAT YOU MUST DO ===\n"
        "- Answer any question that can be addressed using the content of the provided context, including: summarizing, paraphrasing, counting, listing, explaining, comparing, or analyzing anything found in the documents.\n"
        "- If the user asks you to summarize the document, do so based on what is in the context.\n"
        "- If the user asks analytical questions (e.g. how many words, what is the tone, what topics are covered), answer using only what you can derive from the context.\n"
        "- Always be helpful, clear, and concise in your answers.\n\n"
        "=== WHAT YOU MUST NEVER DO ===\n"
        "- Never use any knowledge from your training data to answer questions about the document content.\n"
        "- Never invent, assume, or fabricate any information that is not present or derivable from the context below.\n"
        "- Never answer questions that are completely unrelated to the provided documents (e.g. general knowledge questions, math problems, coding help). For those, respond with: 'I am only here to help you with your documents. Please ask me something related to them.'\n"
        "- If the context does not contain enough information to answer the question, respond with: 'I don't know, this information is not in the provided documents.'\n\n"
        "=== CONTEXT FROM THE DOCUMENTS ===\n"
        "{context}"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}"),
    ])
    return (RunnablePassthrough.assign(context=itemgetter("question") | retriever | format_docs) | prompt | llm | StrOutputParser())

def Fennec(message: str, chain, chat_history: list):
    return chain.invoke({"question": message, "chat_history": chat_history})