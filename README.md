# receipt-recognition
Self-hosted automated receipt recognition system (my university diploma project)
## Main features:
* Make receipt OCR by photo;
* Automate selects receipt items (temporary only [Velmart](https://velmart.ua/ua/) receipts);
* Classify selected items by 5 categories (foods, electronics, clothes, household);
* Automated relearning neural network;
* Saves receipt to NoSQL database;
* Friendly rest-api;
* Only Open Source technologies;
## Installation
1. ``git clone https://github.com/VTurturika/receipt-recognition.git && cd receipt-recognition``
2. ``sudo ./install.sh``
3. Enjoy!
## Used technologies
* [Tensorflow](https://tensorflow.org)
* [keras](https://keras.io)
* [NumPy](http://www.numpy.org/)
* [CherryPy](http://cherrypy.org/)
* [Tesseract-OCR](https://github.com/tesseract-ocr/tesseract)
* [PyOCR](https://github.com/openpaperwork/pyocr)
* [NodeJS](https://nodejs.org/en/)
* [Express](http://expressjs.com/)
* [MongoDB](https://www.mongodb.com/)
## Requirements
* 64-bit Debian-based linux distribution (ubuntu will be perfect)
## Licence
* MIT
