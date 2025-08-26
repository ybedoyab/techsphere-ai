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
        
        # Simular entrenamiento en background
        def train_model():
            global training_status
            
            steps = [
                ('Cargando datos...', 10),
                ('Preprocesando texto...', 25),
                ('Extrayendo características...', 40),
                ('Entrenando modelo...', 70),
                ('Evaluando resultados...', 90),
                ('Guardando modelo...', 100)
            ]
            
            for step, progress in steps:
                training_status['current_step'] = step
                training_status['progress'] = progress
                
                # Agregar log
                log_entry = {
                    'timestamp': time.strftime('%H:%M:%S'),
                    'step': step,
                    'progress': progress
                }
                training_status['logs'].append(log_entry)
                
                time.sleep(2)  # Simular trabajo
            
            training_status['is_running'] = False
            training_status['current_step'] = 'Entrenamiento completado'
        
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
