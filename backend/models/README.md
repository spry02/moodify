# Modele AI - Moodify

Ten folder zawiera wszystko związane z modelami AI do rozpoznawania emocji.

## Struktura

```
models/
├── data_preprocessing.ipynb          # Notebook do preprocessingu danych
├── model_training.ipynb              # Notebook do trenowania modeli (🎮 GPU!)
├── moodify_datasets_analysis.ipynb   # Notebook do analizy datasetów
├── GPU_SETUP.md                      # Instrukcja konfiguracji GPU
├── processed_data/                   # Przetworzone dane treningowe
│   ├── train_text.csv
│   ├── val_text.csv
│   ├── test_text.csv
│   ├── train_images.csv
│   ├── val_images.csv
│   ├── test_images.csv
│   └── data_paths.json
└── saved_models/                     # Wytrenowane modele
    ├── image_model_best.h5           # Najlepszy model dla obrazów
    ├── image_model_final.h5          # Finalny model dla obrazów
    ├── image_emotion_map.json        # Mapowanie emocji dla modelu obrazowego
    ├── svm_text_model.pkl            # Model SVM dla tekstu
    └── tfidf_vectorizer.pkl          # Wektoryzator TF-IDF dla tekstu
```

## Modele

### Model obrazowy (CNN)
- **Pliki**: `image_model_best.h5`, `image_model_final.h5`, `image_emotion_map.json`
- **Dataset**: AffectNet (450k obrazów)
- **Architektura**: Transfer Learning (MobileNetV2) + Custom layers
- **Emocje**: happy, sad, anger, fear, surprise
- **GPU**: Trening wymaga ~2-4GB VRAM (RTX 2060 - 6GB)

### Model tekstowy (SVM)
- **Pliki**: `svm_text_model.pkl`, `tfidf_vectorizer.pkl`
- **Dataset**: Emotion Dataset (20k tekstów)
- **Algorytm**: TF-IDF + SVM
- **Emocje**: sadness, joy, love, anger, fear, surprise
- **CPU**: Trening na CPU (szybki)

## Użycie

### 🎮 Z obsługą GPU (zalecane dla modelu obrazowego)
```bash
cd /home/dupa/Pulpit/moodify
./start_vscode_with_gpu.sh
```
Potem otwórz notebooki w VS Code.

### 📝 Kolejność kroków
1. **Preprocessing danych**: Uruchom `data_preprocessing.ipynb`
2. **Trening modeli**: Uruchom `model_training.ipynb` (🎮 z GPU!)
3. **Analiza**: Zobacz `moodify_datasets_analysis.ipynb`

### ⚙️ Konfiguracja GPU
Zobacz `GPU_SETUP.md` dla pełnej instrukcji konfiguracji NVIDIA GPU (RTX 2060).

**TL;DR:** Musisz uruchomić VS Code z ustawionym `LD_LIBRARY_PATH` aby TensorFlow widział biblioteki CUDA.

## Wymagania

### Dla modelu tekstowego (CPU)
- Python 3.12+
- scikit-learn
- pandas, numpy

### Dla modelu obrazowego (GPU)
- Python 3.12+
- TensorFlow 2.20 z CUDA
- NVIDIA GPU (RTX 2060 lub lepszy)
- CUDA 12.5 + cuDNN 9 (zainstalowane przez `tensorflow[and-cuda]`)
- ~4GB VRAM dla treningu