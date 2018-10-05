rm index.zip
zip index.zip -r index.js node_modules
aws lambda update-function-code --function-name pay_all --zip-file fileb://index.zip
