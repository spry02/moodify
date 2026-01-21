# Dokumentacja backend - Moodify

## Zakres i cel
Backend zawiera notebooki i artefakty do:
- pobierania i analizy zbiorow danych (AffectNet, Emotion)
- preprocessingu danych tekstowych i obrazowych
- trenowania modeli tekstowych i obrazowych
- strojenia hiperparametrow oraz ewaluacji

## Struktura folderu
Ponizej opis kluczowych plikow i katalogow. W backend sa dwie warstwy:
1) `backend/` - wersja bazowa pipeline'u
2) `backend/models/` - wersja rozszerzona (tuning, dodatkowe notebooki i logi)

```
backend/
  data_preprocessing.ipynb          - pobieranie danych i preprocessing
  model_training.ipynb              - trening modeli (wersja bazowa)
  moodify_datasets_analysis.ipynb   - analiza i wizualizacja zbiorow danych
  processed_data/                   - CSV-y i konfiguracja sciezek
  saved_models/                     - wytrenowane modele i mapy etykiet
  models/
    data_preprocessing.ipynb        - jak wyzej (druga kopia)
    model_training.ipynb            - trening + augmentacje + Keras Tuner
    moodify_datasets_analysis.ipynb - analiza zbiorow (druga kopia)
    tensorboard_viewer.ipynb        - podglad logow TensorBoard
    test_predictions.ipynb          - test predykcji na zbiorach obrazow
    processed_data/                 - CSV-y i konfiguracja sciezek (druga kopia)
    saved_models/                   - modele (druga kopia)
    keras_tuner/                    - wyniki Hyperband + logi
```

## Zrodla danych i mapowanie emocji
Notebook `data_preprocessing.ipynb` korzysta z:
- AffectNet przez `kagglehub.dataset_download("mstjebashazida/affectnet")`
- Emotion dataset przez `load_dataset("dair-ai/emotion")`

Mapowanie etykiet dla Emotion (HF):
- 0 Sadness -> Smutek
- 1 Joy -> Szczescie
- 2 Love -> Szczescie
- 3 Anger -> Zlosc
- 4 Fear -> Strach
- 5 Surprise -> Zaskoczenie

Mapowanie folderow AffectNet:
- happy -> Szczescie
- sad -> Smutek
- anger -> Zlosc
- fear -> Strach
- surprise -> Zaskoczenie

Finalnie uzywane jest 5 klas: Szczescie, Smutek, Zlosc, Strach, Zaskoczenie.

## Preprocessing danych (data_preprocessing.ipynb)
Funkcje i efekty:
- pobranie AffectNet i Emotion
- normalizacja etykiet do 5 wspolnych emocji
- przygotowanie CSV dla tekstu i obrazow
- zapis konfiguracji `data_paths.json` z bazowa sciezka do AffectNet

Podzial danych obrazowych:
- 70% train, 15% val, 15% test
- stratyfikacja po etykietach (`train_test_split` z `stratify`)

Formaty plikow:
- `processed_data/train_text.csv`, `val_text.csv`, `test_text.csv`
  - kolumny: `text`, `emotion`
- `processed_data/train_images.csv`, `val_images.csv`, `test_images.csv`
  - kolumny: `path`, `emotion`
  - `path` jest sciezka wzgledna do AffectNet
- `processed_data/data_paths.json`
  - `affectnet_base_path` to baza do budowania pelnych sciezek

Uwaga o `data_paths.json`:
- w `backend/processed_data` zapisano sciezke absolutna do cache KaggleHub
- w `backend/models/processed_data` zapisano sciezke relatywna (`../../data`)

## Trening modelu tekstowego (model_training.ipynb)
Algorytm i konfiguracja:
- wektoryzacja: `TfidfVectorizer(max_features=5000, min_df=2, max_df=0.8, ngram_range=(1, 2))`
- klasyfikator: `SVC(kernel='linear')`
- ewaluacja: accuracy, classification report, confusion matrix

Artefakty:
- `saved_models/svm_text_model.pkl`
- `saved_models/tfidf_vectorizer.pkl`

## Trening modelu obrazowego - wersja bazowa (backend/model_training.ipynb)
Konfiguracja:
- baza: MobileNetV2 (ImageNet, `include_top=False`)
- wejscie: 224x224, batch 32
- head: GlobalAveragePooling2D -> Dense(128) -> Dropout(0.5) -> Dense(5, softmax)
- optymalizator: Adam, `learning_rate=1e-4`
- trening: do 20 epok, early stopping, checkpoint na `val_accuracy`

Artefakty:
- `saved_models/image_model_best.h5`
- `saved_models/image_model_final.h5`
- `saved_models/image_emotion_map.json` (mapa id -> emocja)

## Trening modelu obrazowego - wersja rozszerzona (backend/models/model_training.ipynb)
Dodatki i roznice wzgledem wersji bazowej:
- fragment konfiguracji CUDA (LD_LIBRARY_PATH, `ctypes.CDLL`) dla TensorFlow
- augmentacje obrazu: flip, brightness, contrast, saturation, rotacje, zoom/crop
- filtracja wierszy z `emotion == neutral` (jesli wystapia)

Tuning Hyperband (Keras Tuner):
- `max_epochs=10`, `factor=3`, `hyperband_iterations=1`
- hiperparametry: `dropout_1` (0.3/0.5), `dropout_2` (0.3/0.4),
  `learning_rate` (0.0003/0.001), `units_1` (256), `units_2` (192)
- fine-tuning ostatnich 20 warstw MobileNetV2
- logi w `models/keras_tuner/tensorboard_logs`

Finalny trening:
- do 50 epok, `EarlyStopping` i `ReduceLROnPlateau`
- checkpoint `saved_models/image_model_best.h5`
- zapis finalny `saved_models/image_model_final.h5`

## Analiza zbiorow (moodify_datasets_analysis.ipynb)
Notebook do sanity check:
- przeglad struktury AffectNet i Emotion
- losowe przyklady, rozklady klas, statystyki
- mapowanie emocji do 5 wspolnych klas

## Test predykcji (backend/models/test_predictions.ipynb)
Cel i dane:
- ladowanie `saved_models/image_model_final.h5` i `image_emotion_map.json`
- ewaluacja na `processed_data/test_images.csv`
- dodatkowe testy na `processed_data/data_test/` (lokalne obrazki)

Sciezki danych:
- `BASE_PATH` pobierany z KaggleHub albo ustawiony na lokalna sciezke
- wymaga aktualnego `data_paths.json` lub poprawnego `BASE_PATH`

## Keras Tuner (backend/models/keras_tuner)
Struktura:
- `moodify_hyperband_fast/` i `moodify_hyperband_finetuned/`
  - `trial_XXXX/` z plikami `trial.json`, `build_config.json`,
    `checkpoint.weights.h5`
- `tensorboard_logs/` - logi TensorBoard dla poszczegolnych uruchomien

Notebook do podgladu:
- `backend/models/tensorboard_viewer.ipynb`
- komenda: `%tensorboard --logdir keras_tuner/tensorboard_logs`

## Zaleznosci
Najczesciej uzywane biblioteki:
- kagglehub, datasets (Hugging Face)
- pandas, numpy
- scikit-learn
- tensorflow, keras, keras-tuner
- matplotlib, seaborn
- Pillow (PIL), opencv-python (cv2)

## Typowy przebieg pracy
1. Uruchom `data_preprocessing.ipynb` (generuje `processed_data/`).
2. Wybierz jedna wersje treningu:
   - `backend/model_training.ipynb` (bazowa)
   - `backend/models/model_training.ipynb` (rozszerzona + tuning)
3. (Opcjonalnie) `backend/models/tensorboard_viewer.ipynb` dla logow.
4. (Opcjonalnie) `backend/models/test_predictions.ipynb` dla ewaluacji.

## Uwaga o duplikacji
Pliki w `backend/` i `backend/models/` maja podobne nazwy, ale
nie sa identyczne. Wersja w `backend/models/` zawiera tuning,
augmentacje i dodatkowe notebooki, wiec przy pracy w praktyce
warto trzymac sie jednej "warstwy" aby uniknac rozjazdu artefaktow.

