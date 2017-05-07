import pandas as pd
import numpy as np
from keras.models import Sequential
from keras.layers import Dense, LSTM, Bidirectional, Dropout

data = pd.read_csv('data/train.tsv', delimiter='\t', header=0)
categories = {1: 'foods', 2: 'electronics', 3: 'clothes', 4: 'household'}

num_examples = len(data['product'])
num_categories = len(categories)

txt = ''
max_example_len = 0
for p in data['product']:
    if len(p) > max_example_len:
        max_example_len = len(p)
    txt += p
chars = set(txt)

print('total chars={}, max_example_len={}'.format(len(chars), max_example_len))

char_indices = dict((c, i) for i, c in enumerate(chars))
indices_char = dict((i, c) for i, c in enumerate(chars))

X = np.ones((num_examples, max_example_len), dtype=np.int64) * -1

for i, product in enumerate(data['product']):
      for j,char in enumerate(product):
          X[i,j] = char_indices[char]

Y = np.zeros((num_examples, num_categories), dtype=np.float64)

for i,category in enumerate(data['category']):
    Y[i, category-1] = 1

ids = np.arange(num_examples)
np.random.shuffle(ids)

X = X[ids]
Y = Y[ids]

x_train = X[:800]
x_test = X[800:]

y_train = Y[:800]
y_test = Y[800:]

#input = Input(shape=(max_example_len,), dtype='float32')
#bi_lstm = Bidirectional(LSTM(128, return_sequences=False, dropout=0.15, recurrent_dropout=0.15, implementation=0))(input)

#output = Dropout(0.3)(bi_lstm)

model = Sequential()

model.add(Dense(128, activation='relu', input_shape=(max_example_len,)))
model.add(Dropout(0.3))
model.add(Dense(4, activation='sigmoid'))

model.summary()

model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
model.fit(x_train, y_train, validation_data=(x_test, y_test), batch_size=1,
          epochs=5, shuffle=True)

score = model.evaluate(x_test, y_test, batch_size=1)
result = model.predict(x_test[10][np.newaxis])

print("\nprediction = {}, y={}".format(result, y_test[10]))

