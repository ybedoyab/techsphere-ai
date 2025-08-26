"""
🚀 Servidor API Flask para subida de datasets y entrenamiento de modelos
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import tempfile
import json
from pathlib import Path
import threading
import time
from datetime import datetime
import io
import csv

from src.api.upload_handler import upload_handler
from src.utils.logger import LoggerFactory

app = Flask(__name__)
CORS(app)  # Permitir CORS para el frontend

# Configuración
UPLOAD_FOLDER = 'temp_uploads'
ALLOWED_EXTENSIONS = {'csv'}
MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB

# Estado global del entrenamiento
training_status = {
    'is_running': False,
    'progress': 0,
    'current_step': '',
    'logs': [],
    'error': None
}

# Crear directorio de uploads
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Verificar estado del servidor"""
    return jsonify({
        'status': 'healthy',
        'message': 'API Server funcionando correctamente'
    })

@app.route('/api/upload-dataset', methods=['POST'])
def upload_dataset():
    """Subir y validar dataset CSV"""
    try:
        # Verificar si hay archivo en la request
        if 'file' not in request.files:
            return jsonify({'error': 'No se encontró archivo'}), 400
        
        file = request.files['file']
        
        # Verificar nombre del archivo
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        # Verificar extensión
        if not upload_handler.allowed_file(file.filename):
            return jsonify({'error': 'Solo se permiten archivos CSV'}), 400
        
        # Verificar tamaño
        if request.content_length > MAX_CONTENT_LENGTH:
            return jsonify({'error': 'Archivo demasiado grande (máximo 50MB)'}), 400
        
        # Guardar archivo temporalmente
        temp_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(temp_path)
        
        # Procesar dataset
        use_as_default = request.form.get('use_as_default', 'false').lower() == 'true'
        result = upload_handler.process_uploaded_dataset(temp_path, use_as_default)
        
        # Limpiar archivo temporal
        os.remove(temp_path)
        
        if result.get('success'):
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        return jsonify({'error': f'Error procesando archivo: {str(e)}'}), 500

@app.route('/api/start-training', methods=['POST'])
def start_training():
    """Iniciar entrenamiento del modelo"""
    global training_status
    
    if training_status['is_running']:
        return jsonify({'error': 'El entrenamiento ya está en curso'}), 400
    
    try:
        # Resetear estado
        training_status.update({
            'is_running': True,
            'progress': 0,
            'current_step': 'Iniciando entrenamiento...',
            'logs': [],
            'error': None
        })
        
        # Entrenamiento real del modelo en background
        def train_model():
            global training_status
            
            try:
                # Paso 1: Cargar datos
                training_status.update({
                    'current_step': 'Cargando datos...',
                    'progress': 10,
                    'logs': [{'timestamp': datetime.now().strftime('%H:%M:%S'), 'step': 'Cargando datos...', 'progress': 10}]
                })
                
                # Cargar dataset desde el archivo subido más recientemente
                from src.data.repository import CSVDataSource
                import pandas as pd
                import numpy as np
                from sklearn.model_selection import train_test_split
                from sklearn.feature_extraction.text import TfidfVectorizer
                from sklearn.linear_model import LogisticRegression
                from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
                import joblib
                import os
                
                # Buscar el dataset más reciente
                data_dir = Path("data/raw")
                csv_files = list(data_dir.glob("*.csv"))
                if not csv_files:
                    raise Exception("No se encontraron archivos CSV para entrenar")
                
                latest_file = max(csv_files, key=os.path.getctime)
                print(f"📁 Dataset encontrado: {latest_file}")
                print(f"📅 Última modificación: {datetime.fromtimestamp(os.path.getctime(latest_file))}")
                
                data_source = CSVDataSource(str(latest_file), separator=";")
                data = data_source.load_data()
                print(f"📊 Dataset cargado: {data.shape}")
                print(f"📋 Columnas disponibles: {list(data.columns)}")
                print(f"🔢 Primeras 3 filas:")
                print(data.head(3).to_string())
                
                # Paso 2: Preprocesamiento
                training_status.update({
                    'current_step': 'Preprocesando texto...',
                    'progress': 25,
                    'logs': training_status['logs'] + [{'timestamp': datetime.now().strftime('%H:%M:%S'), 'step': 'Preprocesando texto...', 'progress': 25}]
                })
                
                # Combinar título y abstract
                data['combined_text'] = data['title'] + ' ' + data['abstract']
                
                # Limpiar texto
                data['combined_text'] = data['combined_text'].str.lower()
                data['combined_text'] = data['combined_text'].str.replace(r'[^\w\s]', ' ', regex=True)
                
                # Paso 3: Extraer características
                training_status.update({
                    'current_step': 'Extrayendo características...',
                    'progress': 40,
                    'logs': training_status['logs'] + [{'timestamp': datetime.now().strftime('%H:%M:%S'), 'step': 'Extrayendo características...', 'progress': 40}]
                })
                
                # Vectorizar texto usando TF-IDF
                vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
                X = vectorizer.fit_transform(data['combined_text'])
                
                print(f"🔍 Vectorización TF-IDF completada. Forma de X: {X.shape}")
                print(f"📊 Número de características extraídas: {X.shape[1]}")
                
                # Preparar etiquetas (tomar solo la primera etiqueta para simplificar)
                y = data['group'].str.split('|').str[0]
                print(f"🏷️ Etiquetas preparadas. Número de clases: {y.nunique()}")
                print(f"📋 Clases únicas: {y.unique().tolist()}")
                
                # Dividir en train/test
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                print(f"✂️ División train/test completada:")
                print(f"   - X_train: {X_train.shape}")
                print(f"   - X_test: {X_test.shape}")
                print(f"   - y_train: {y_train.shape[0]} muestras")
                print(f"   - y_test: {y_test.shape[0]} muestras")
                
                # Paso 4: Entrenar modelo
                training_status.update({
                    'current_step': 'Entrenando modelo...',
                    'progress': 70,
                    'logs': training_status['logs'] + [{'timestamp': datetime.now().strftime('%H:%M:%S'), 'step': 'Entrenando modelo...', 'progress': 70}]
                })
                
                # Entrenar modelo de regresión logística
                model = LogisticRegression(max_iter=1000, random_state=42)
                model.fit(X_train, y_train)
                
                # Paso 5: Evaluar resultados
                training_status.update({
                    'current_step': 'Evaluando resultados...',
                    'progress': 90,
                    'logs': training_status['logs'] + [{'timestamp': datetime.now().strftime('%H:%M:%S'), 'step': 'Evaluando resultados...', 'progress': 90}]
                })
                
                # Predicciones
                y_pred = model.predict(X_test)
                print(f"🎯 Predicciones generadas: {len(y_pred)} muestras")
                
                # Calcular métricas
                accuracy = accuracy_score(y_test, y_pred)
                precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted')
                conf_matrix = confusion_matrix(y_test, y_pred)
                
                print(f"📊 Métricas calculadas:")
                print(f"   - Accuracy: {accuracy:.4f}")
                print(f"   - Precision: {precision:.4f}")
                print(f"   - Recall: {recall:.4f}")
                print(f"   - F1-Score: {f1:.4f}")
                print(f"   - Matriz de confusión: {conf_matrix.shape}")
                
                # Obtener clases únicas de y (no de y.unique() que puede causar problemas)
                unique_classes = sorted(y.unique().tolist())
                print(f"🏷️ Clases para matriz de confusión: {unique_classes}")
                
                # Paso 6: Guardar modelo y resultados
                training_status.update({
                    'current_step': 'Guardando modelo...',
                    'progress': 100,
                    'logs': training_status['logs'] + [{'timestamp': datetime.now().strftime('%H:%M:%S'), 'step': 'Guardando modelo...', 'progress': 100}]
                })
                
                # Crear directorio para modelos si no existe
                models_dir = Path("models")
                models_dir.mkdir(exist_ok=True)
                
                # Guardar modelo
                model_path = models_dir / "medical_classifier.joblib"
                joblib.dump(model, model_path)
                
                # Guardar vectorizer
                vectorizer_path = models_dir / "tfidf_vectorizer.joblib"
                joblib.dump(vectorizer, vectorizer_path)
                
                # Guardar métricas
                metrics = {
                    'accuracy': float(accuracy),
                    'precision': float(precision),
                    'recall': float(recall),
                    'f1_score': float(f1),
                    'confusion_matrix': conf_matrix.tolist(),
                    'classes': unique_classes, # Usar las clases únicas obtenidas
                    'training_samples': X_train.shape[0],
                    'test_samples': X_test.shape[0]
                }
                
                metrics_path = models_dir / "training_metrics.json"
                with open(metrics_path, 'w', encoding='utf-8') as f:
                    json.dump(metrics, f, ensure_ascii=False, indent=2)
                
                # Actualizar estado final
                training_status.update({
                    'is_running': False,
                    'current_step': 'Entrenamiento completado',
                    'progress': 100,
                    'logs': training_status['logs'] + [{'timestamp': datetime.now().strftime('%H:%M:%S'), 'step': 'Entrenamiento completado', 'progress': 100}]
                })
                
                print(f"✅ Modelo entrenado y guardado en {model_path}")
                print(f"📊 Métricas: Accuracy={accuracy:.3f}, F1={f1:.3f}")
                
            except Exception as e:
                print(f"❌ Error en entrenamiento: {e}")
                training_status.update({
                    'is_running': False,
                    'current_step': f'Error: {str(e)}',
                    'progress': 0,
                    'error': str(e)
                })
        
        # Ejecutar en thread separado
        thread = threading.Thread(target=train_model)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'message': 'Entrenamiento iniciado correctamente',
            'status': 'started'
        })
        
    except Exception as e:
        training_status['error'] = str(e)
        training_status['is_running'] = False
        return jsonify({'error': f'Error iniciando entrenamiento: {str(e)}'}), 500

@app.route('/api/training-status', methods=['GET'])
def get_training_status():
    """Obtener estado actual del entrenamiento"""
    return jsonify(training_status)

@app.route('/api/stop-training', methods=['POST'])
def stop_training():
    """Detener entrenamiento en curso"""
    global training_status
    
    if not training_status['is_running']:
        return jsonify({'message': 'No hay entrenamiento en curso'})
    
    training_status['is_running'] = False
    training_status['current_step'] = 'Entrenamiento detenido por el usuario'
    
    return jsonify({
        'message': 'Entrenamiento detenido correctamente',
        'status': 'stopped'
    })

@app.route('/api/dataset-info', methods=['GET'])
def get_dataset_info():
    """Obtener información del dataset actual"""
    try:
        # Verificar si existe el dataset por defecto
        default_dataset = Path('data/raw/challenge_data-18-ago.csv')
        
        if default_dataset.exists():
            # Análisis básico del dataset
            import pandas as pd
            
            df = pd.read_csv(default_dataset, sep=';')
            basic_info = {
                'total_records': len(df),
                'columns': list(df.columns),
                'sample_titles': df['title'].head(3).tolist()
            }
            
            return jsonify({
                'exists': True,
                'path': str(default_dataset),
                'analysis': {
                    'basic_info': basic_info
                }
            })
        else:
            return jsonify({
                'exists': False,
                'message': 'No se encontró dataset por defecto'
            })
            
    except Exception as e:
        return jsonify({
            'exists': False,
            'message': f'Error analizando dataset: {str(e)}'
        }), 500

@app.route('/api/model-metrics', methods=['GET'])
def get_model_metrics():
    """Obtener métricas del modelo entrenado"""
    try:
        metrics_path = Path("models/training_metrics.json")
        if not metrics_path.exists():
            return jsonify({'error': 'No hay métricas disponibles. Entrena el modelo primero.'}), 404
        
        with open(metrics_path, 'r', encoding='utf-8') as f:
            metrics = json.load(f)
        
        return jsonify({
            'success': True,
            'metrics': {
                'accuracy': metrics['accuracy'],
                'precision': metrics['precision'],
                'recall': metrics['recall'],
                'f1_score': metrics['f1_score'],
                'training_samples': metrics['training_samples'],
                'test_samples': metrics['test_samples']
            }
        })
        
    except Exception as e:
        return jsonify({'error': f'Error obteniendo métricas: {str(e)}'}), 500

@app.route('/api/confusion-matrix', methods=['GET'])
def get_confusion_matrix():
    """Obtener matriz de confusión del modelo entrenado"""
    try:
        metrics_path = Path("models/training_metrics.json")
        if not metrics_path.exists():
            return jsonify({'error': 'No hay matriz de confusión disponible. Entrena el modelo primero.'}), 404
        
        with open(metrics_path, 'r', encoding='utf-8') as f:
            metrics = json.load(f)
        
        return jsonify({
            'success': True,
            'confusion_matrix': metrics['confusion_matrix'],
            'classes': metrics['classes']
        })
        
    except Exception as e:
        return jsonify({'error': f'Error obteniendo matriz de confusión: {str(e)}'}), 500

# ====================== PREDICCIONES ======================
@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    """Generar predicciones para el dataset cargado usando el modelo entrenado"""
    try:
        from sklearn.preprocessing import LabelEncoder
        import pandas as pd
        import joblib

        models_dir = Path("models")
        model_path = models_dir / "medical_classifier.joblib"
        vectorizer_path = models_dir / "tfidf_vectorizer.joblib"

        if not model_path.exists() or not vectorizer_path.exists():
            return jsonify({'error': 'Modelo no disponible. Entrena el modelo primero.'}), 404

        # Cargar modelo y vectorizador
        model = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)

        # Buscar dataset más reciente
        data_dir = Path("data/raw")
        csv_files = list(data_dir.glob("*.csv"))
        if not csv_files:
            return jsonify({'error': 'No hay dataset disponible.'}), 404
        latest_file = max(csv_files, key=os.path.getctime)

        # Cargar dataset
        df = pd.read_csv(latest_file, sep=';')
        if not {'title', 'abstract', 'group'}.issubset(df.columns):
            return jsonify({'error': 'El dataset debe contener columnas title, abstract y group'}), 400

        # Preparar textos y predecir
        combined_text = (df['title'].fillna('') + ' ' + df['abstract'].fillna('')).str.lower().str.replace(r'[^\w\s]', ' ', regex=True)
        X = vectorizer.transform(combined_text)
        y_pred = model.predict(X)

        predictions = []
        for idx, row in df.iterrows():
            predictions.append({
                'title': str(row.get('title', '')),
                'abstract': str(row.get('abstract', '')),
                'group': str(row.get('group', '')),
                'group_predicted': str(y_pred[idx])
            })

        return jsonify({'success': True, 'predictions': predictions})
    except Exception as e:
        return jsonify({'error': f'Error generando predicciones: {str(e)}'}), 500


@app.route('/api/predictions-csv', methods=['GET'])
def download_predictions_csv():
    """Descargar CSV con title, abstract, group, group_predicted"""
    try:
        # Reutilizar la lógica de get_predictions
        with app.test_request_context():
            resp = get_predictions()
            # Flask can return (response, status), handle both
            if isinstance(resp, tuple):
                payload, status = resp
                if status != 200:
                    return resp
                data = payload.get_json()
            else:
                data = resp.get_json()

        if not data or not data.get('success'):
            return jsonify({'error': 'No se pudieron generar predicciones'}), 500

        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['title', 'abstract', 'group', 'group_predicted'])
        for p in data['predictions']:
            writer.writerow([
                p.get('title', ''),
                p.get('abstract', ''),
                p.get('group', ''),
                p.get('group_predicted', '')
            ])

        mem = io.BytesIO(output.getvalue().encode('utf-8'))
        mem.seek(0)
        return send_file(mem, as_attachment=True, download_name='predictions.csv', mimetype='text/csv')
    except Exception as e:
        return jsonify({'error': f'Error descargando CSV: {str(e)}'}), 500

if __name__ == '__main__':
    print("🚀 Iniciando servidor API...")
    print("📍 Endpoints disponibles:")
    print("   - GET  /api/health")
    print("   - POST /api/upload-dataset")
    print("   - POST /api/start-training")
    print("   - GET  /api/training-status")
    print("   - POST /api/stop-training")
    print("   - GET  /api/dataset-info")
    print(f"🌐 Servidor ejecutándose en http://localhost:5000")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        use_reloader=False
    )
