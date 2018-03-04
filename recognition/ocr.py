import random

import numpy as np
import pyocr
import re

from datetime import datetime
from pytz import timezone
from pyocr.builders import TextBuilder
from PIL import Image
from keras.models import load_model

class OcrHandler:

    def __init__(self):
        file = open('bi_grams', 'r', encoding="utf-8")
        list = [x.strip('\n') for x in file.readlines()]
        self.bigrams = dict((bi, i) for i, bi in enumerate(list))
        self.ocr = pyocr.get_available_tools()[0]
        self.categories = {1: 'foods', 2: 'electronics', 3: 'clothes', 4: 'household', 5: 'others'}

    def encode(self, str):
        str = '@' + OcrHandler.remove_invalid_chars(str) + '@'
        zipped = zip(*[str[i:] for i in range(2)])
        pairs = [x for x in zipped]
        result = np.zeros((50), dtype=np.int64)
        for i, pair in enumerate(pairs):
            if i < len(pairs):
                result[i] = self.bigrams[pair[0] + pair[1]]
        return result

    def make_ocr(self, image):

        receipt = self.ocr.image_to_string(
            Image.open(image),
            lang='ukr',
            builder=TextBuilder()
        )
        return receipt

    def parse(self, receipt):

        lines = receipt.split('\n')
        non_null_lines = []
        for line in lines:
            if len(line) > 1:
                non_null_lines.append(line)

        products_start = 0
        products_end = 0
        for i, line in enumerate(non_null_lines):
            if 'Кассир' in line or 'КАСИР' in line or 'самообс' in line:
                products_start = i+2
            if 'Касcа' in line:
                products_start = i + 1
            if 'Запрошуємо на роботу' in line or 'на роботу' in line or 'роботу' in line:
                products_end = i-1
            if 'Менеджерів' in line:
                products_end = i-2
            if 'Продавців' in line:
                products_end = i-3
            if 'Касирів' in line:
                products_end = i-4

        if products_start != products_end \
           and products_end > 0 \
           and products_start < products_end:
            product_lines = non_null_lines[products_start:products_end+1]
        else:
            product_lines = None

        parsed_products = []
        if product_lines:
            product_lines = [OcrHandler.remove_invalid_chars(x) for x in product_lines]

            measure_price = re.compile('(?P<measure>\d+(,\d+)*)\s+х\s+(?P<price>\d+(,\d+)*)')
            product_price = re.compile('\S+\s+(?P<total>\d+((,|\.)\d+)?)\s*(А|д)$')
            skip_iterations = []
            for i, line in enumerate(product_lines):

                has_measure_price = measure_price.match(line.strip())

                if i in skip_iterations:
                    continue

                product = dict()
                if has_measure_price:
                    product['measure'] = float(has_measure_price.group('measure').replace(',', '.'))
                    product['measure_price'] = float(has_measure_price.group('price').replace(',', '.'))
                    product_name = re.sub('^\d+', '', product_lines[i+1].strip())
                    product['name'] = product_name

                    has_product_price = product_price.match(product_lines[i+1].strip())

                    if has_product_price:
                        product['price'] = float(has_product_price.group('total').replace(',', '.'))
                        skip_iterations = [i+1]
                    else:
                        has_product_price = product_price.match(product_lines[i+2].strip())
                        if has_product_price:
                            product['price'] = float(has_product_price.group('total').replace(',', '.'))
                            product['name'] += \
                                re.sub('\S+\s+(?P<total>\d+((,|\.)\d+)?)\s*(А|д)$', '',
                                       product_lines[i+2].strip())
                            skip_iterations = [i+1, i+2]
                        else:
                            product['price'] = None
                            skip_iterations = [i+1, i+2]

                    parsed_products.append(product)

                else:
                    product_name = re.sub('^\d+', '', line.strip())
                    product['name'] = product_name

                    has_product_price = product_price.match(line.strip())
                    if has_product_price:
                        product['price'] = float(has_product_price.group('total').replace(',', '.'))
                        skip_iterations = []
                    elif i+1 < len(product_lines):
                        has_product_price = product_price.match(product_lines[i+1].strip())
                        if has_product_price:
                            product['price'] = float(has_product_price.group('total').replace(',', '.'))
                            product['name'] += \
                                re.sub('\S+\s+(?P<total>\d+((,|\.)\d+)?)\s*(А|д)$', '',
                                        product_lines[i + 1].strip())
                            skip_iterations = [i+1]
                        else:
                            product['price'] = None
                            skip_iterations = [i+1]

                    parsed_products.append(product)

            parsed_products = [x for x in parsed_products if len(x['name']) > 0]
            for i, product in enumerate(parsed_products):
                product['number'] = i+1
                product['category'] = self.make_prediction(product['name'])

        return parsed_products

    def make_prediction(self, product):
        try:
            encoded_product = self.encode(product)
            model = load_model('trained_model')
            prediction = model.predict(encoded_product[np.newaxis])
            if max(prediction[0]) > 0.3:
                return self.categories[ np.argmax(prediction[0]) + 1 ]
            else:
                return self.categories[5]
        except:
            print('error catched')
            return self.categories[random.randint(1, 5)]

    def prepare_response(sefl, items):

        response = dict({
            'feedbackToken': '',
            'date': str(datetime.now(timezone('Europe/Kiev')))[0:10],
            'time':  str(datetime.now(timezone('Europe/Kiev')))[11:16],
            'total': sum([float(x['price']) for x in items if 'price' in x.keys() and x['price']]),
            'currency': 'UAH'
        })
        count_category = {items.count(x): x['category'] for x in items}
        response['commonCategory'] = count_category[max(count_category.keys())] \
            if len(items) > 0 else None
        response['items'] = items
        return response

    @staticmethod
    def remove_invalid_chars(string):
        return ''.join([c for c in string if c not in set('\'«.-*:%[]!?/”“')]).replace('=', ' ')

    def remove_non_bigrams_chars(self, string):
        return ''.join([c for c in string if c not in set(self.bigrams.values())])
