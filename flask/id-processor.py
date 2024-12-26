import re
from datetime import datetime
from typing import List, Dict, Union, Optional

class IDCardProcessor:
    def __init__(self):
        self.HEADER_KEYWORDS = [
            'ROYAUME',
            'MAROC',
            'CARTE',
            'NATIONALE',
            'IDENTITE',
            "D'IDENTITE",
            'ELECTRONIQUE'
        ]

    def process_id_card(self, front_text_array, back_text_array):
        data = {
            'first_name': '',
            'last_name': '',
            'date_of_birth': '',
            'place_of_birth': '',
            'expiry_date': '',
            'card_number': '',
            'father_name': '',
            'mother_name': '',
            'address': '',
            'civil_status_number': '',
            'gender': '',
            'verification_status': 'verified'
        }

        self._process_back_text(back_text_array, data)

        self._process_front_text(front_text_array, data)

        return self._format_response(data)

    def _process_back_text(self, back_text_array, data):
        for item in back_text_array:
            text = item['text'].strip() if isinstance(item, dict) else item.strip()

            if 'Fils de' in text:
                data['father_name'] = text.split('Fils de')[-1].strip()
            
            if 'et de' in text:
                data['mother_name'] = text.split('et de')[-1].strip()
            
            if 'Adresse' in text:
                data['address'] = text.split('Adresse')[-1].strip()
            
            if self._is_civil_status_number(text):
                data['civil_status_number'] = text
            
            if 'Sexe' in text:
                data['gender'] = text.replace('Sexe', '').strip()

    def _process_front_text(self, front_text_array, data):
        valid_names = []
        dates = []

        for item in front_text_array:
            text = item['text'].strip() if isinstance(item, dict) else item.strip()
            
            if self._is_valid_name(text):
                valid_names.append(text)

        if len(valid_names) >= 2:
            data['first_name'], data['last_name'] = valid_names[:2]

        for item in front_text_array:
            text = item['text'].strip() if isinstance(item, dict) else item.strip()

            if self._is_date_format(text):
                dates.append(text)
            
            if self._is_id_number(text):
                data['card_number'] = text
            
            if text.lower().startswith(('a ', 'à ')):
                data['place_of_birth'] = text[2:].upper()


        if len(dates) >= 2:
            sorted_dates = sorted(dates, key=lambda x: self._get_year(x))
            data['date_of_birth'] = self._format_date(sorted_dates[0])
            data['expiry_date'] = self._format_date(sorted_dates[-1])

    def _format_response(self, data):
        """Format and validate the final response"""
        missing_fields = self._get_missing_fields(data)
        
        response = {
            'success': len(missing_fields) == 0,
            'data': {
                'name': f"{data['first_name']} {data['last_name']}",
                'first_name': data['first_name'],
                'last_name': data['last_name'],
                'id_number': data['card_number'],
                'date_of_birth': data['date_of_birth'],
                'place_of_birth': data['place_of_birth'],
                'expiry_date': data['expiry_date'],
                'father_name': data['father_name'],
                'mother_name': data['mother_name'],
                'address': data['address'],
                'civil_status_number': data['civil_status_number'],
                'gender': data['gender'],
                'verification_status': data['verification_status']
            }
        }
        
        if missing_fields:
            response['missing_fields'] = missing_fields
            
        return response


    def _is_date_format(self, text):
        import re
        return bool(re.match(r'^\d{2}\.\d{2}\.\d{4}$', text))

    def _format_date(self, date_str):
        day, month, year = date_str.split('.')
        return f"{day.zfill(2)}.{month.zfill(2)}.{year}"

    def _get_year(self, date_str):
        return int(date_str.split('.')[-1])

    def _is_id_number(self, text):
        import re
        return bool(re.match(r'^[A-Z]{1,2}\d{6}$', text))

    def _is_civil_status_number(self, text):
        import re
        return bool(re.match(r'^\d{3}/\d{4}$', text))

    def _is_header(self, text):
        return any(keyword in text for keyword in self.HEADER_KEYWORDS)

    def _is_valid_name(self, text):
        clean_text = text.replace(' ', '')
        return (len(clean_text) >= 2 and 
                clean_text.isalpha() and 
                clean_text.isupper() and 
                not self._is_header(text))

    def _get_missing_fields(self, data):
        missing_fields = []
        
        if not data['first_name'] or len(data['first_name']) <= 1:
            missing_fields.append('valid first name')
        if not data['last_name'] or len(data['last_name']) <= 1:
            missing_fields.append('valid last name')
        if not data['date_of_birth']:
            missing_fields.append('date of birth')
        if not data['place_of_birth']:
            missing_fields.append('place of birth')
        if not data['card_number']:
            missing_fields.append('ID number')
        if not data['father_name']:
            missing_fields.append("father's name")
        if not data['mother_name']:
            missing_fields.append("mother's name")
        if not data['address']:
            missing_fields.append('address')
        if not data['civil_status_number']:
            missing_fields.append('civil status number')
        if not data['gender']:
            missing_fields.append('gender')
            
        return missing_fields
