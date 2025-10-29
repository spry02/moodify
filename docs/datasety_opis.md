# 📊 Dokumentacja Zbiorów Danych - Projekt Moodify

## 1. AffectNet - Zbiór do Rozpoznawania Emocji z Twarzy

### 📋 Podstawowe Informacje

**Twórcy:** Mohammad H. Mahoor i Ali Mollahosseini (University of Denver)  
**Rok powstania:** 2017  
**Rozmiar:** ~450,000 zdjęć twarzy  
**Źródło:** Zdjęcia z internetu (Google, Bing, Yahoo)

### � Zawartość Zbioru

**8 kategorii emocji:**
1. Neutral (Neutralna) 😐
2. Happy (Szczęście) 😊
3. Sad (Smutek) 😢
4. Surprise (Zaskoczenie) 😲
5. Fear (Strach) 😨
6. Disgust (Wstręt) 🤢
7. Anger (Gniew) 😠
8. Contempt (Pogarda) 😤

**Statystyki:**
- Training: ~287,000 zdjęć
- Validation: ~4,000 zdjęć
- Różnorodność: wiele kultur, wieku, płci
- Jakość: różne oświetlenie i kąty (realistyczne warunki)

### ✅ Kategorie Użyte w Projekcie

**Wybrane 6 emocji:**
- Happy, Sad, Anger, Fear, Surprise, Neutral

**Pominięte 2 emocje:**
- Disgust, Contempt (brak odpowiednika w tekście)

### 💡 Dlaczego AffectNet?

✅ Największy publicznie dostępny zbiór (450k zdjęć)  
✅ Realistyczne warunki - nie studio, prawdziwe życie  
✅ Różnorodność demograficzna  
✅ Dostępny przez Kaggle

---

## 2. Emotion Dataset - Zbiór Tekstowy z Emocjami

### 📋 Podstawowe Informacje

**Twórcy:** Dair.ai (open-source AI organization)  
**Rok publikacji:** 2020  
**Rozmiar:** 20,000 przykładów tekstowych  
**Źródło:** Tweety w języku angielskim

### � Zawartość Zbioru

**6 kategorii emocji:**
1. Sadness (Smutek) 😢
2. Joy (Radość) 😊
3. Love (Miłość) ❤️
4. Anger (Gniew) 😠
5. Fear (Strach) 😨
6. Surprise (Zaskoczenie) 😲

**Statystyki:**
- Training: 16,000 tekstów
- Validation: 2,000 tekstów
- Test: 2,000 tekstów
- Średnia długość: 15-20 słów (krótkie tweety)

### ✅ Kategorie Użyte w Projekcie

**Wszystkie 6 emocji zostają użyte**

**Mapowanie Love:**
- Love → Happy (obie są pozytywnymi emocjami)

### 💡 Dlaczego Emotion Dataset?

✅ Prosty i gotowy do użycia  
✅ Łatwa integracja z Hugging Face  
✅ Zbalansowany rozkład klas  
✅ Kompatybilny z modelami BERT

---

## 3. 🔄 Mapowanie Emocji Między Zbiorami

### Wspólne emocje (5):

| Tekst | Twarz | Status |
|-------|-------|--------|
| Joy | Happy | ✅ |
| Sadness | Sad | ✅ |
| Anger | Anger | ✅ |
| Fear | Fear | ✅ |
| Surprise | Surprise | ✅ |

### Dodatkowe mapowanie:
- **Love → Happy** (obie pozytywne emocje)
- **Neutral** - tylko dla twarzy

### 🎯 Finalne Kategorie w Projekcie

**5 wspólnych emocji:**
1. Happy/Joy (Szczęście/Radość)
2. Sad/Sadness (Smutek)
3. Anger (Gniew)
4. Fear (Strach)
5. Surprise (Zaskoczenie)

**Plus:** Neutral (tylko twarz)

---

## 4. 📈 Statystyki Finalne

| Zbiór | Użyte | Rozmiar | Procent |
|-------|-------|---------|---------|
| **AffectNet** | 6/8 emocji | ~350k zdjęć | 75% |
| **Emotion** | 6/6 emocji | 20k tekstów | 100% |

---

## 5. 🤖 Transfer Learning - Sugerowane Modele

### Dla Rozpoznawania Twarzy (AffectNet)

**Rekomendowane modele:**

1. **ResNet-50** (Residual Network)
   - Pre-trained na ImageNet
   - 50 warstw, ~25M parametrów
   - Idealny dla początku projektu
   - Dobry balans: szybkość ↔ dokładność

2. **EfficientNet-B0**
   - Najnowszy, zoptymalizowany model
   - Mniejszy i szybszy niż ResNet
   - Lepsza dokładność przy mniejszych rozmiarach
   - Polecany dla urządzeń mobilnych

3. **VGGFace2**
   - Specjalnie trenowany na twarzach
   - Najlepsza opcja dla emocji
   - Większy rozmiar, wolniejszy
   - Najwyższa dokładność

### Dla Analizy Tekstu (Emotion Dataset)

**Co to jest Transfer Learning w NLP?**  
Wykorzystujemy modele BERT/RoBERTa, które są wytrenowane na ogromnych korpusach tekstów (Wikipedia, książki) i już "rozumieją" język angielski, gramatykę i kontekst. Musimy je tylko dostroić do rozpoznawania emocji.

**Rekomendowane modele:**

1. **DistilBERT**
   - Lżejsza wersja BERT (40% mniejszy)
   - 2x szybszy przy 97% dokładności BERT
   - **Najlepsza opcja dla tego projektu**
   - Idealny dla prototypowania

2. **RoBERTa-base**
   - Ulepszona wersja BERT
   - Lepsza dokładność
   - Wolniejszy i większy
   - Dla finalnej wersji produkcyjnej

3. **BERT-base-uncased**
   - Klasyczny BERT
   - Sprawdzony i stabilny
   - Dobra dokumentacja
   - Bezpieczny wybór

### 🎯 Dlaczego Transfer Learning?

**Bez Transfer Learning:**
- Trenowanie od zera: ~tydzień czasu GPU
- Potrzeba: setki tysięcy przykładów
- Dokładność: 60-70%

**Z Transfer Learning:**
- Trenowanie: kilka godzin
- Potrzeba: kilkanaście tysięcy przykładów
- Dokładność: 85-95%

---

## 6. ✅ Podsumowanie

### Dlaczego Te Zbiory?

1. **Komplementarność** - obrazy + tekst
2. **Wspólne emocje** - 5 kategorii pasują idealnie
3. **Dostępność** - Kaggle + Hugging Face
4. **Jakość** - używane w badaniach naukowych
5. **Rozmiar** - wystarczająco duże dla Transfer Learning

### Finalna Konfiguracja

**Emocje:** Happy, Sad, Anger, Fear, Surprise (+ Neutral dla twarzy)  
**Model dla twarzy:** ResNet-50 lub EfficientNet-B0  
**Model dla tekstu:** DistilBERT  
**Technika:** Transfer Learning (pre-trained modele)