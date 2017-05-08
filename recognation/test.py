import numpy as np
from keras.models import load_model

file = open('bi_grams', 'r')
list = [x.strip('\n') for x in file.readlines()]

bigrams_indices = dict((bi, i) for i, bi in enumerate(list))
indices_bigrams = dict((i, bi) for i, bi in enumerate(list))

def encode(str):
    str = '@'+str+'@'
    zipped = zip(*[str[i:] for i in range(2)])
    pairs=[x for x in zipped]
    result = np.zeros((50),dtype=np.int64)
    for i,pair in enumerate(pairs):
        result[i] = bigrams_indices[pair[0]+pair[1]]
    return result


model = load_model('trained_model')

print(model.predict(encode('DVD-центр')[np.newaxis]))
