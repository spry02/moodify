#!/bin/bash
# Helper script to start VS Code with GPU support for TensorFlow

echo "🚀 Uruchamianie VS Code z obsługą GPU dla TensorFlow..."
echo ""

cd /home/dupa/Pulpit/moodify

# Aktywuj venv
if [ -d ".venv" ]; then
    source .venv/bin/activate
    echo "✅ Aktywowano venv"
else
    echo "❌ Brak .venv - uruchom najpierw: python -m venv .venv"
    exit 1
fi

# Pobierz ścieżkę do site-packages
SITE_PACKAGES=$(python -c "import site; print(site.getsitepackages()[0])" 2>/dev/null)

if [ -z "$SITE_PACKAGES" ]; then
    echo "❌ Nie można znaleźć site-packages"
    exit 1
fi

# Ustaw LD_LIBRARY_PATH dla bibliotek NVIDIA CUDA
export LD_LIBRARY_PATH="\
$SITE_PACKAGES/nvidia/cuda_runtime/lib:\
$SITE_PACKAGES/nvidia/cudnn/lib:\
$SITE_PACKAGES/nvidia/cublas/lib:\
$SITE_PACKAGES/nvidia/cufft/lib:\
$SITE_PACKAGES/nvidia/curand/lib:\
$SITE_PACKAGES/nvidia/cusolver/lib:\
$SITE_PACKAGES/nvidia/cusparse/lib:\
$SITE_PACKAGES/nvidia/nvjitlink/lib:\
${LD_LIBRARY_PATH}"

echo "✅ Ustawiono LD_LIBRARY_PATH dla NVIDIA CUDA"
echo ""
echo "📊 Sprawdzanie GPU..."

# Sprawdź czy TensorFlow widzi GPU
GPU_CHECK=$(python -c "import tensorflow as tf; gpus = tf.config.list_physical_devices('GPU'); print(len(gpus))" 2>/dev/null)

if [ "$GPU_CHECK" -gt "0" ]; then
    echo "✅ TensorFlow wykrył $GPU_CHECK GPU!"
    python -c "import tensorflow as tf; print('   GPU:', tf.config.list_physical_devices('GPU')[0])" 2>/dev/null
else
    echo "⚠️  TensorFlow NIE wykrył GPU - sprawdź instalację"
fi

echo ""
echo "🚀 Uruchamiam VS Code..."
code .

echo ""
echo "✅ VS Code uruchomiony z obsługą GPU!"
echo "   Możesz teraz otworzyć backend/models/model_training.ipynb"
