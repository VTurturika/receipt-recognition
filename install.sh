#!/bin/bash

printf "Refreshing apt cache...\n\n"
sudo apt update
printf "\nOK\n\n"

printf "Installing python3 and pip3...\n\n"
sudo apt install -y python3 python3-pip
printf "\nOK\n\n"

printf "Installing common python stuff\n(pandas, numpy, cherrypy)...\n\n"
sudo pip3 install pandas numpy cherrypy
printf "\nOK\n\n"

printf "Installing machine learning stuff\n(tensorflow, keras, h5py, )...\n\n"
sudo pip3 install tensorflow keras h5py pandas numpy
printf "\nOK\n\n"

printf "Installing OCR stuff\n(tesseract-ocr, pyocr)...\n\n"
sudo apt install -y tesseract-ocr tesseract-ocr-ukr
sudo pip3 install pyocr
printf "\nOK\n\n"

printf "Installing NodeJS...\n\n"
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt install -y nodejs
sudo apt install -y build-essential
printf "\nOK\n\n"

printf "Installing forever...\n\n"
sudo npm install -g forever
printf "\nOK\n\n"

printf "Installing MongoDB...\n\n"
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.2.list
sudo apt update
sudo apt install -y mongodb-org
sudo service mongod start
printf "\nOK\n\n"

printf "All dependencies are successfully installed!\n\n"
printf "Setting up system...\n\n"

printf "Installing Node dependencies...\n"
cd web
npm install
printf "\nOK\n\n"

printf "Starting Node server...\n"
mkdir uploads
sudo forever start -o out.log server.js
printf "\nOK\n\n"

printf "Starting python server...\n"
cd ../recognation
python3 server.py
printf "\nOK\n\n"

printf "System is successfully installed and started!\n\n"
