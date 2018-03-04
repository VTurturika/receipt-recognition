FROM gcr.io/tensorflow/tensorflow:latest-py3
RUN apt update && apt upgrade -y \
    && apt install -y tesseract-ocr tesseract-ocr-ukr \
    && rm -r /var/lib/apt/lists/*
RUN pip install cherrypy keras pyocr
WORKDIR /recognition
CMD ["python3", "server.py"]
