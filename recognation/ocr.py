import numpy as np
import re
from keras.models import load_model
import pyocr
from pyocr.builders import TextBuilder
from PIL import Image

class OcrHandler:

    def __init__(self):
        file = open('bi_grams', 'r')
        list = [x.strip('\n') for x in file.readlines()]
        self.bigrams = dict((bi, i) for i, bi in enumerate(list))
        self.model = load_model('trained_model')
        self.ocr = pyocr.get_available_tools()[0]

    def encode(self, str):
        str = '@' + str + '@'
        zipped = zip(*[str[i:] for i in range(2)])
        pairs = [x for x in zipped]
        result = np.zeros((50), dtype=np.int64)
        for i, pair in enumerate(pairs):
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
                    product['measure'] = has_measure_price.group('measure')
                    product['price'] = has_measure_price.group('price')
                    product_name = re.sub('^\d+', '', product_lines[i+1].strip())
                    product['name'] = product_name

                    has_product_price = product_price.match(product_lines[i+1].strip())

                    if has_product_price:
                        product['product_price'] = has_product_price.group('total')
                        skip_iterations = [i+1]
                    else:
                        has_product_price = product_price.match(product_lines[i+2].strip())
                        if has_product_price:
                            product['product_price'] = has_product_price.group('total')
                            product['name'] += \
                                re.sub('\S+\s+(?P<total>\d+((,|\.)\d+)?)\s*(А|д)$', '',
                                       product_lines[i+2].strip())
                            skip_iterations = [i+1, i+2]
                        else:
                            product['product_price'] = None
                            skip_iterations = [i+1, i+2]

                    parsed_products.append(product)

                else:
                    product_name = re.sub('^\d+', '', line.strip())
                    product['name'] = product_name

                    has_product_price = product_price.match(line.strip())
                    if has_product_price:
                        product['product_price'] = has_product_price.group('total')
                        skip_iterations = []
                    elif i+1 < len(product_lines):
                        has_product_price = product_price.match(product_lines[i+1].strip())
                        if has_product_price:
                            product['product_price'] = has_product_price.group('total')
                            product['name'] += \
                                re.sub('\S+\s+(?P<total>\d+((,|\.)\d+)?)\s*(А|д)$', '',
                                        product_lines[i + 1].strip())
                            skip_iterations = [i+1]
                        else:
                            product['product_price'] = None
                            skip_iterations = [i+1]

                    parsed_products.append(product)

        return parsed_products

    @staticmethod
    def remove_invalid_chars(string):
        return ''.join([c for c in string if c not in set('\'«.-*:%[]!?”“')]).replace('=', ' ')
