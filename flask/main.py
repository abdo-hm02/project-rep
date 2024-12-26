from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
import logging
from datetime import datetime
import cv2
from paddleocr import PaddleOCR
from face_comparator import FaceComparator
from id_processor import IDCardProcessor 
import numpy as np
from flask_cors import CORS
import fitz


# Initialize Flask app
app = Flask(__name__)
CORS(app) 

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
app.config['UPLOAD_FOLDER'] = 'temp_uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

KEYS = ["Marque", "Genre", "Modele", "Numero d'immatriculation", "Type carburant", "N du chassis"]

# Initialize face comparator and OCR
face_comparator = FaceComparator(similarity_threshold=0.4)
ocr = PaddleOCR(use_angle_cls=True, lang='en')

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file):
    """Save uploaded file and return the path"""
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        return filepath
    return None

def cleanup_files(files):
    """Clean up temporary files"""
    for file in files:
        try:
            if file and os.path.exists(file):
                os.remove(file)
        except Exception as e:
            logger.error(f"Error cleaning up file {file}: {str(e)}")

def extracting_now_text(image_path):
    """Extract text from an image or PDF and return organized text line by line."""
    try:
        if image_path.lower().endswith('.pdf'):
            # Process PDF: Convert each page to an image
            pdf_doc = fitz.open(image_path)
            text_lines = []

            for page_number in range(len(pdf_doc)):
                page = pdf_doc[page_number]
                pix = page.get_pixmap()
                image = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
                # Convert image to BGR for PaddleOCR
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                ocr_result = ocr.ocr(image)
                
                # Extract lines of text
                for line in ocr_result[0]:
                    text_lines.append(line[1][0])

            return {"lines": text_lines}

        else:
            # Process image files (JPG, PNG, etc.)
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("Could not read image")

            result = ocr.ocr(image)
            if not result or not result[0]:
                return {"lines": []}

            # Extract lines of text
            text_lines = [line[1][0] for line in result[0]]

            return {"lines": text_lines}

    except Exception as e:
        logger.error(f"Error in OCR processing: {str(e)}")
        raise





"""Extraction for carte grise"""
def extract_text_from_image(image_path):
   
    try:
        if image_path.lower().endswith('.pdf'):
            # Process PDF: Convert each page to an image
            pdf_doc = fitz.open(image_path)
            text_lines = []

            for page_number in range(len(pdf_doc)):
                page = pdf_doc[page_number]
                pix = page.get_pixmap()
                image = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
                # Convert image to BGR for PaddleOCR
                image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
                ocr_result = ocr.ocr(image)
                
                # Extract lines of text
                for line in ocr_result[0]:
                    text_lines.append(line[1][0])

            structured_data = {
            "Marque": None,
            "Genre": None,
            "Modele": None,
            "Numero d'immatriculation": None,
            "Type carburant": None,
            "N du chassis": None,
            "Adresse": None,
            "Fin de validite": None
            }

            # Mapping logic to fill structured fields
            for i, line in enumerate(text_lines):
                line_lower = line.lower()

                if "marque" in line_lower:
                    structured_data["Marque"] = text_lines[i + 1] if i + 1 < len(text_lines) else None
                elif "genre" in line_lower:
                    structured_data["Genre"] = text_lines[i + 1] if i + 1 < len(text_lines) else None
                elif "modele" in line_lower:
                    structured_data["Modele"] = text_lines[i + 1] if i + 1 < len(text_lines) else None
                elif "numero d'immatriculation" in line_lower or "numero dmatncuaton" in line_lower:
                    structured_data["Numero d'immatriculation"] = text_lines[i + 1] if i + 1 < len(text_lines) else None
                elif "type carburant" in line_lower:
                    structured_data["Type carburant"] = text_lines[i + 1] if i + 1 < len(text_lines) else None
                elif "n du chassis" in line_lower:
                    structured_data["N du chassis"] = text_lines[i + 1] if i + 1 < len(text_lines) else None
                elif "adresse" in line_lower:
                    structured_data["Adresse"] = " ".join(text_lines[i + 1 : i + 4])  # Combine next lines for full address
                elif "fin de validite" in line_lower:
                    structured_data["Fin de validite"] = text_lines[i + 1] if i + 1 < len(text_lines) else None

            return structured_data
            

        else:
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("Could not read image")

            result = ocr.ocr(image)
            
            if not result or not result[0]:
                return []

            # Create simple list with just text and order
            text_list = []
            for idx, line in enumerate(result[0], 1):
                text = line[1][0]  # Get just the text
                # Get y-coordinate of the text box for vertical ordering
                y_coord = line[0][0][1]  # Get y-coordinate of first point
                text_list.append({
                    "order": idx,
                    "text": text,
                    "y_coord": y_coord  # We'll use this for sorting
                })

            # Sort by vertical position (top to bottom)
            text_list.sort(key=lambda x: x["y_coord"])
            
            # Remove y_coord and reassign order numbers after sorting
            final_list = []
            for idx, item in enumerate(text_list, 1):
                final_list.append({
                    "order": idx,
                    "text": item["text"]
                })

            return final_list

    except Exception as e:
        logger.error(f"Error in OCR processing: {str(e)}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy lol',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/compare-faces', methods=['POST'])
def compare_faces():
    """Compare faces in two uploaded images"""
    saved_files = []
    
    try:
        if 'image1' not in request.files or 'image2' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Both image1 and image2 must be provided'
            }), 400

        image1 = request.files['image1']
        image2 = request.files['image2']

        image1_path = save_uploaded_file(image1)
        image2_path = save_uploaded_file(image2)
        saved_files = [image1_path, image2_path]

        if not image1_path or not image2_path:
            return jsonify({
                'success': False,
                'error': 'Invalid file format. Allowed formats: png, jpg, jpeg'
            }), 400

        face_comparator = FaceComparator(similarity_threshold=0.4)
        result = face_comparator.compare_faces(image1_path, image2_path)
        
        # Force convert any potential numpy bool_ to Python bool
        if 'match' in result:
            result['match'] = True if result['match'] else False
        
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Error processing request: {str(e)}'
        }), 500

    finally:
        cleanup_files(saved_files)

@app.route('/api/process-id-card', methods=['POST'])
def process_id_card():
    saved_files = []
    try:
       
        if 'front_image' not in request.files or 'back_image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Both front and back ID images must be provided'
            }), 400

        front_image = request.files['front_image']
        back_image = request.files['back_image']
        
        front_image_path = save_uploaded_file(front_image)
        back_image_path = save_uploaded_file(back_image)
        saved_files = [front_image_path, back_image_path]

        if not front_image_path or not back_image_path:
            return jsonify({
                'success': False,
                'error': 'Invalid file format. Allowed formats: png, jpg, jpeg'
            }), 400

        front_text = extract_text_from_image(front_image_path)
        back_text = extract_text_from_image(back_image_path)

        id_processor = IDCardProcessor()
        result = id_processor.process_id_card(front_text, back_text)
        
        return jsonify(result)

    except Exception as e:
        logger.error(f"Error processing ID card: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Error processing ID card: {str(e)}'
        }), 500

    finally:
        cleanup_files(saved_files)


@app.route('/api/extract-text', methods=['POST'])
def extract_text():
    """Extract text from uploaded image using PaddleOCR"""
    saved_files = []
    
    try:
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400

        image = request.files['image']
        image_path = save_uploaded_file(image)
        saved_files = [image_path]

        if not image_path:
            return jsonify({
                'success': False,
                'error': 'Invalid file format. Allowed formats: png, jpg, jpeg'
            }), 400

        text_list = extract_text_from_image(image_path)
        
        return jsonify({
            'success': True,
            'text_count': len(text_list),
            'extracted_text': text_list
        })

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error processing request: {str(e)}'
        }), 500

    finally:
        cleanup_files(saved_files)

@app.route('/api/extracting-text', methods=['POST'])
def extracting_text():
    """Extract text from uploaded image using PaddleOCR"""
    saved_files = []
    
    try:
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided'
            }), 400

        image = request.files['image']
        image_path = save_uploaded_file(image)
        saved_files = [image_path]

        if not image_path:
            return jsonify({
                'success': False,
                'error': 'Invalid file format. Allowed formats: png, jpg, jpeg'
            }), 400

        text_list = extracting_now_text(image_path)
        
        return jsonify({
            'success': True,
            'text_count': len(text_list),
            'extracted_text': text_list
        })

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error processing request: {str(e)}'
        }), 500

    finally:
        cleanup_files(saved_files)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
