import os
import re
import string
import PyPDF2
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# Download stopwords if not available
import nltk
nltk.download('punkt')
nltk.download('stopwords')

# Define stopwords
stop_words = set(stopwords.words('english'))

# Directory containing the PDFs
pdf_dir = "src/data/ndma24"


if not os.path.exists(pdf_dir):
    print(
        f"Error: The directory {pdf_dir} does not exist. Please check the directory name or path "
    )
    exit()


def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    text = ""
    with open(pdf_path, "rb") as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + " "
    return text


def clean_text(text):
    """Clean and preprocess text."""
    text = text.lower()  # Convert to lowercase
    text = re.sub(r"\d+", "", text)  # Remove numbers
    text = text.translate(str.maketrans(
        "", "", string.punctuation))  # Remove punctuation
    text = re.sub(r"\s+", " ", text)  # Remove extra whitespace
    tokens = word_tokenize(text)  # Tokenize words
    # Remove stopwords
    tokens = [word for word in tokens if word not in stop_words]
    return " ".join(tokens)


# Extract and clean text from all bulletins
all_texts = []
for pdf_file in os.listdir(pdf_dir):
    if pdf_file.endswith(".pdf"):
        pdf_path = os.path.join(pdf_dir, pdf_file)
        text = extract_text_from_pdf(pdf_path)
        cleaned_text = clean_text(text)
        all_texts.append(cleaned_text)

# Combine all bulletins into one large corpus and save in txt file
output_file = "ndma_corpus.txt"

with open(output_file, "w", encoding="utf-8") as file:
    for text in all_texts:  # 'all_texts' contains preprocessed text from all pdf
        file.write(text + "\n\n\n")  # separate each document with a blank line
print(f"Corpus saved to {output_file}")
