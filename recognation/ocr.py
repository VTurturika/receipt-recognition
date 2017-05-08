import numpy as np
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

        txt = self.ocr.image_to_string(
            Image.open(image),
            lang='ukr',
            builder=TextBuilder()
        )

        return txt
