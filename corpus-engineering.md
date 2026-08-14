# Corpus Engineering

## Why This Is a Discipline, Not a Step

Most RAG tutorials skip from "download a PDF" to "embed it." Production corpus engineering is the unglamorous work that determines whether your retrieval actually works at scale. A bad corpus pipeline produces:
- Inconsistent chunk boundaries that break mid-sentence
- Duplicates that inflate retrieval scores
- Missing metadata that makes filtering impossible
- Stale documents that hallucinate outdated facts
- Corrupt OCR that embeds gibberish

Build this pipeline once, reuse it across all three flagship projects.

---

## Pipeline Overview

```
Source Acquisition
  ↓
Format Detection + Routing
  ↓
Text Extraction (PDF / HTML / DOCX / Image)
  ↓
OCR (for scanned/image-based documents)
  ↓
Cleaning + Normalization
  ↓
Language Detection + Filtering
  ↓
Quality Filtering
  ↓
Deduplication
  ↓
Metadata Extraction
  ↓
Chunking
  ↓
Embedding
  ↓
Indexing (Vector Store + Metadata DB)
  ↓
Delta / Freshness Management
```

---

## Source Acquisition

### Crawling strategies

| Strategy | When to use | Tools |
|---|---|---|
| Sitemap crawl | Structured sites with sitemap.xml | Scrapy, httpx + sitemap parser |
| Recursive link crawl | Sites without sitemaps | Scrapy, Playwright (JS-rendered) |
| API ingestion | arXiv, PubMed, GitHub, EU Publications | Official APIs, pagination |
| S3/GCS dump | arXiv bulk, Common Crawl | boto3, gsutil |
| RSS/Atom feeds | News, blog updates | feedparser |
| Direct file download | Gov portals, regulatory sites | httpx, wget |

### Rate limiting and politeness

Always: respect `robots.txt`, set a crawl delay (1–2s minimum), use a descriptive `User-Agent`, store raw files before processing so you can re-run extraction without re-crawling.

---

## Format Detection and Routing

Never trust file extensions alone — detect MIME type from the file header:

```python
import magic
mime = magic.from_file(path, mime=True)
# application/pdf → PDF pipeline
# text/html → HTML pipeline
# application/vnd.openxmlformats-officedocument.wordprocessingml.document → DOCX
# image/png, image/jpeg → OCR pipeline
```

---

## Text Extraction

### PDF extraction

| Scenario | Tool | Notes |
|---|---|---|
| Native/digital PDF | pdfplumber, pypdf | Fast, preserves layout metadata |
| Mixed (digital + scanned) | pdfplumber + fallback to OCR | Detect scanned pages by checking extracted text length |
| Complex layout (tables, columns) | Marker (open source) | Best quality for academic and regulatory PDFs |
| Production-grade, cloud | Azure Document Intelligence, AWS Textract | High accuracy, pay-per-page |
| Self-hosted, high accuracy | Unstructured.io (open source) | Handles tables, headers, footers |

**Scanned page detection heuristic:** if `extracted_text_chars / page_area < threshold` → route to OCR.

### HTML extraction

Remove navigation, ads, footers, sidebars — keep only the main content:

| Tool | Notes |
|---|---|
| trafilatura | Best general-purpose content extractor |
| BeautifulSoup + custom rules | When you control the site structure |
| readability-lxml | Mozilla Readability port |
| Playwright + trafilatura | JS-rendered pages |

### DOCX / PPTX / XLSX

| Tool | Notes |
|---|---|
| python-docx | DOCX text + style extraction |
| python-pptx | Slide text + speaker notes |
| openpyxl | Excel cell content |
| Unstructured.io | Handles all three with layout awareness |

---

## OCR Tooling

| Tool | Accuracy | Speed | Self-hosted | Best for |
|---|---|---|---|---|
| Tesseract | Medium | Fast | Yes | Simple scans, no complex layout |
| EasyOCR | Medium-High | Medium | Yes | Multi-language, handwriting |
| PaddleOCR | High | Fast | Yes | Tables, structured forms |
| Marker | High | Medium | Yes | Academic PDFs, complex layouts |
| Azure Document Intelligence | Very High | Medium | No (cloud API) | Production, tables, forms |
| AWS Textract | Very High | Medium | No (cloud API) | Forms, tables, checkboxes |
| Google Document AI | Very High | Medium | No (cloud API) | Multi-language, handwriting |

**For Project 3 (sovereign):** PaddleOCR or Marker — no cloud API calls on regulated documents.

**Pre-processing for better OCR accuracy:** deskew, denoise, binarize images before passing to Tesseract/EasyOCR.

---

## Cleaning and Normalization

Steps to apply in order:

1. **Strip headers/footers** — page numbers, document titles repeated on every page
2. **Normalize whitespace** — collapse multiple spaces/newlines, fix hyphenated line breaks
3. **Fix encoding** — normalize to UTF-8, handle Windows-1252 artifacts
4. **Remove boilerplate** — legal disclaimers, copyright notices, table-of-contents entries (if not needed)
5. **Normalize unicode** — NFC normalization, remove zero-width spaces
6. **Table handling** — convert to Markdown tables or linearize rows as `key: value` pairs (tables embedded in text chunks confuse embeddings)

---

## Language Detection and Filtering

```python
from langdetect import detect, DetectorFactory
DetectorFactory.seed = 42  # deterministic

lang = detect(text)
```

Or use `fasttext` for faster/more accurate detection at scale.

**Policy decisions to make explicitly:**
- Which languages to keep (monolingual vs multilingual index)
- Whether to use language-specific embedding models or multilingual (e.g., `multilingual-e5-large`)
- Whether to translate non-primary-language documents or index them separately

---

## Quality Filtering

Discard documents that fail these checks:

| Check | Threshold | Reason |
|---|---|---|
| Minimum character count | < 100 chars → discard | Empty or corrupt extraction |
| Text density (chars / pages) | < 50 chars/page → likely scanned, re-route to OCR | |
| Alphabet ratio | < 60% alphabetic → likely garbage/OCR noise | |
| Repetition ratio | > 40% repeated n-grams → boilerplate or crawler artifact | |
| Language confidence | < 0.8 → discard or flag for manual review | |

---

## Deduplication

Run deduplication **before** embedding — embeddings of near-duplicates inflate retrieval scores and waste index space.

### Exact deduplication

```python
import hashlib
content_hash = hashlib.sha256(normalized_text.encode()).hexdigest()
# Store in a seen_hashes set; skip if already seen
```

### Near-duplicate deduplication

**MinHash + LSH (recommended for large corpora):**
- Use `datasketch` library
- Shingling: convert text to character or word n-grams
- MinHash signatures: 128 hash functions
- LSH bands: find candidates with Jaccard similarity > 0.8
- Compute exact Jaccard on candidates → keep one per cluster

**SimHash (faster, less accurate):**
- Good for web-scale crawls
- 64-bit fingerprints, Hamming distance threshold of 3

**Semantic deduplication (expensive, use sparingly):**
- Embed documents, cluster by cosine similarity > 0.95
- Useful when documents are paraphrased versions of each other

---

## Metadata Extraction

Every chunk must carry metadata for filtering, citation, and governance:

| Field | Source | Notes |
|---|---|---|
| `doc_id` | UUID at ingest | Stable identifier for lineage |
| `source_url` | Crawl record | For citation links |
| `title` | PDF metadata / H1 tag / filename | Fallback chain |
| `author` | PDF metadata | Optional |
| `date_published` | PDF metadata / HTML meta / filename pattern | Critical for freshness |
| `date_ingested` | Timestamp at pipeline run | For delta indexing |
| `language` | langdetect output | For multilingual filtering |
| `source_type` | `arxiv`, `gov_pdf`, `github_readme`, etc. | For source-type filtering |
| `section` | From document structure (H2, H3) | Enables section-level filtering |
| `page_number` | From PDF extractor | For citation ("page 12 of X") |
| `chunk_index` | Position within document | For parent-document retrieval |
| `content_hash` | SHA256 of normalized text | For deduplication and change detection |

---

## Chunking Strategies

### Fixed-size with overlap (baseline)

```
chunk_size = 512 tokens
overlap = 64 tokens (12.5%)
```

- Simple, predictable
- Good default for homogeneous corpora
- Overlap preserves context across boundaries

### Recursive character splitting

Split on paragraph → sentence → word → character, in that order, until within `chunk_size`. This is the LangChain `RecursiveCharacterTextSplitter` approach. Better than fixed-size because it respects natural boundaries.

### Semantic chunking

Split when the semantic similarity between consecutive sentences drops below a threshold (embedding-based). Produces variable-length chunks that respect topic boundaries. Slower but higher quality. Use for high-value corpora where you can pay the indexing cost.

### Document-structure-aware chunking

Parse document structure (H1/H2/H3, PDF section headers) and chunk within sections. Each chunk inherits the section path as metadata. Best for regulatory documents (AI Act articles, policy sections) where section identity matters.

### Sentence-window chunking

Embed individual sentences for high-precision retrieval, but return a window of ±2–3 sentences around the match to the LLM. Combines precision (retrieval) with context (generation).

### Parent-document retrieval

Embed small chunks (128–256 tokens) for precise retrieval, but return their parent chunk (512–1024 tokens) to the LLM. Implemented via a `chunk_id → parent_id` mapping in metadata. Best for long regulatory and legal documents.

### Chunk size guidelines

| Use case | Chunk size | Overlap |
|---|---|---|
| High-precision Q&A | 128–256 tokens | 20–30 tokens |
| General knowledge retrieval | 512 tokens | 64 tokens |
| Long-form synthesis | 1024 tokens | 128 tokens |
| Parent chunks (parent-doc retrieval) | 1024–2048 tokens | 0 (parent boundaries) |

---

## Embedding

- Always embed the **cleaned, normalized** text — not the raw extraction
- For contextual retrieval (Anthropic pattern): prepend an LLM-generated summary of the chunk's context before embedding — significant recall improvement for high-value corpora
- Store both the raw chunk text (for the LLM) and the embedding (for retrieval) — they can differ
- Batch embedding: process 100–500 chunks per API call; use async for high throughput
- Monitor embedding API costs — at scale, embedding a 10k-doc corpus can cost €50–200 depending on model

---

## Delta / Freshness Indexing

Don't re-index the entire corpus on every update:

1. **Change detection:** compare `content_hash` of newly crawled doc against stored hash — re-index only if changed
2. **Crawl schedules:** high-churn sources (news, regulatory updates) → daily; stable sources (books, archived docs) → weekly or on-demand
3. **Soft delete:** when a source document is deleted or superseded, mark its chunks as `archived=true` in metadata and exclude from retrieval — don't delete immediately (needed for audit trail in Project 3)
4. **Right-to-be-forgotten (Project 3):** when a data subject requests deletion, cascade: source doc → all chunks → all embeddings → all cached answers derived from those chunks. Build this propagation path before onboarding real data.
5. **Index versioning:** tag the index with a version identifier; rollback = point to previous version

---

## Quality Evaluation for the Corpus

The corpus quality determines the ceiling of retrieval quality. Measure:

| Metric | How to measure |
|---|---|
| Coverage | Sample 50 expected queries; what % return at least one relevant chunk in top-10? |
| Deduplication rate | % of chunks removed as duplicates |
| Extraction quality | Sample 20 docs manually; score extraction accuracy (1–5) |
| Metadata completeness | % of chunks with all required metadata fields populated |
| Language distribution | % per language |
| Freshness | Median age of documents in the index |
| Chunk size distribution | Histogram — check for outliers (too short = noise, too long = low precision) |

Run this audit before wiring the corpus to your RAG system. Retrieval failures are almost always corpus failures in disguise.
