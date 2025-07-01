
import pandas as pd
from sentence_transformers import SentenceTransformer, util
import torch
import symspellpy
from symspellpy.symspellpy import SymSpell, Verbosity
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

# --- Load Excel File ---
df = pd.read_excel("kpi_data.xlsx").fillna("")

# --- SymSpell Setup for Spelling Correction ---
sym_spell = SymSpell(max_dictionary_edit_distance=2, prefix_length=7)
dictionary_words = set()

for col in df.columns:
    for value in df[col].astype(str):
        for word in value.split():
            dictionary_words.add(word.lower())

for word in dictionary_words:
    sym_spell.create_dictionary_entry(word, 1)

def correct_spelling(query):
    corrected = []
    for word in query.split():
        suggestions = sym_spell.lookup(word, Verbosity.CLOSEST, max_edit_distance=2)
        corrected.append(suggestions[0].term if suggestions else word)
    return " ".join(corrected)

# --- Sentence Embedding Model ---
embedder = SentenceTransformer('all-MiniLM-L6-v2')
corpus = [" ".join([str(cell) for cell in row.values]) for _, row in df.iterrows()]
corpus_embeddings = embedder.encode(corpus, convert_to_tensor=True)

# --- LLaMA 3.1 Model (Local Pipeline) ---
llama_pipeline = pipeline("text-generation", model="meta-llama/Meta-Llama-3-8B-Instruct", 
                          tokenizer="meta-llama/Meta-Llama-3-8B-Instruct", 
                          torch_dtype=torch.float16, device=0)

def generate_response_llama(prompt):
    result = llama_pipeline(prompt, max_new_tokens=300, do_sample=True, temperature=0.7)
    return result[0]["generated_text"].split("Answer:")[-1].strip()

# --- Main Chatbot Logic ---
def find_best_match(query):
    corrected_query = correct_spelling(query)
    query_embedding = embedder.encode(corrected_query, convert_to_tensor=True)
    scores = util.pytorch_cos_sim(query_embedding, corpus_embeddings)[0]
    top_idx = torch.argmax(scores).item()
    top_score = scores[top_idx].item()
    return top_idx, top_score, corrected_query

def get_followup_suggestions(query_embedding, threshold=0.45):
    scores = util.pytorch_cos_sim(query_embedding, corpus_embeddings)[0]
    sorted_indices = torch.argsort(scores, descending=True)
    suggestions = []
    for idx in sorted_indices:
        score = scores[idx].item()
        if score < threshold:
            break
        suggestions.append(df.iloc[idx]["KPI Name"] if "KPI Name" in df.columns else df.iloc[idx][0])
        if len(suggestions) >= 3:
            break
    return suggestions

def chatbot_answer(user_query):
    idx, score, corrected_query = find_best_match(user_query)
    if score < 0.55:
        query_embedding = embedder.encode(corrected_query, convert_to_tensor=True)
        followups = get_followup_suggestions(query_embedding)
        if followups:
            return f"I'm not sure what you meant. Did you mean:
- " + "
- ".join(followups)
        else:
            return "Sorry, I couldn't find relevant data in your file."

    matched_row = df.iloc[idx]
    data_summary = ", ".join([f"{col}: {matched_row[col]}" for col in df.columns if matched_row[col]])
    prompt = f'User asked: "{user_query}"\nRelevant data from Excel: {data_summary}\nAnswer:'
    return generate_response_llama(prompt)

# Example call:
# print(chatbot_answer("what is gross producton"))
