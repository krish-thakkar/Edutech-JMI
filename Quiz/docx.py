from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    ServiceContext,
    load_index_from_storage
)
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.groq import Groq
import warnings

# Ignore warnings
warnings.filterwarnings('ignore')

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


# Configure uploads folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# GROQ API Key
GROQ_API_KEY = "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"

# Define a global index and service context variables
index = None
service_context = None

def initialize_service_context():
    """Initialize the service context with embedding model and LLM."""
    global service_context
    embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
    llm = Groq(model="llama-3.2-1b-preview", api_key=GROQ_API_KEY)
    service_context = ServiceContext.from_defaults(embed_model=embed_model, llm=llm)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    global index, service_context

    # Check if the request has a file
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save the uploaded file
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filepath)

    # Initialize service context if not already done
    if service_context is None:
        initialize_service_context()

    # Read and process the uploaded document
    reader = SimpleDirectoryReader(input_files=[filepath])
    documents = reader.load_data()
    text_splitter = SentenceSplitter(chunk_size=600, chunk_overlap=100)
    nodes = text_splitter.get_nodes_from_documents(documents, show_progress=True)

    # Create and persist the index
    index = VectorStoreIndex.from_documents(
        documents, show_progress=True, service_context=service_context, node_parser=nodes
    )
    index.storage_context.persist(persist_dir="./storage_mini")

    return jsonify({"message": "File uploaded and indexed successfully."})

@app.route('/query', methods=['POST'])
def query_index():
    global index, service_context

    if index is None:
        return jsonify({"error": "No document has been indexed yet."}), 400

    data = request.get_json()
    query = data.get('query')

    if not query:
        return jsonify({"error": "Query text is required."}), 400

    # Load the index from storage
    storage_context = StorageContext.from_defaults(persist_dir="./storage_mini")
    index = load_index_from_storage(storage_context, service_context=service_context)

    # Query the index
    query_engine = index.as_query_engine(service_context=service_context)
    response = query_engine.query(query)

    return jsonify({"response": response.response})

if __name__ == '__main__':
    app.run(debug=True ,port=5500)