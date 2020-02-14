from flask import Flask, request
from flask_cors import CORS
from json import dumps

APP = Flask(__name__)
CORS(APP)

data = {}
number = 1

@APP.route('/post', methods=['POST'])
def post():
    global number
    id = number
    data[id] = {'id': id, 'content': request.form.get('content'), 'upvotes': 0, 'resolved': False}
    number += 1
    return dumps({'id': id})

@APP.route('/like', methods=['POST', 'OPTIONS'])
def like():
    data[int(request.form.get('id'))]['upvotes'] += 1
    return dumps({})

@APP.route('/dismiss', methods=['DELETE'])
def dismiss():
    del data[int(request.form.get('id'))]
    return dumps({})

@APP.route('/get', methods=['GET'])
def get():
    dataList = data.values()
    new_data = sorted(dataList, key=lambda x: x['upvotes'], reverse=True)
    return dumps({'posts': new_data})

@APP.route('/edit', methods=['PUT'])
def edit():
    data[int(request.form.get('id'))]['content'] = request.form.get('content')
    return dumps({})

@APP.route('/resolve', methods=['POST'])
def resolve():
    data[int(request.form.get('id'))]['resolved'] = True
    return dumps({})

@APP.route('/clear', methods=['DELETE'])
def clear():
    data.clear()
    return dumps({})