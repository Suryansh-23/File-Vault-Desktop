from json import dumps
import json
from os.path import splitext
from pickle import load
from mimetypes import guess_type as mime_type
from urllib.parse import unquote
import random as rd
import string

from flask import Flask
from flask import jsonify, request

type_map_icon = {
    "image": "pi pi-image",
    "video": "pi pi-video",
    "audio": "pi pi-volume-up",
    "application": "pi pi-desktop",
    "text": "pi pi-file",
}

key_map_file = {}
locked = True
AUTH = False


def random_key():
    str_pool = string.ascii_letters + string.digits
    return "".join(rd.choices(str_pool, k=20))


def manipulate(dic, sep=""):
    arr = []
    for i in dic.keys():
        temp = {}
        temp["key"] = sep + str(len(arr))
        if str.isdigit(str(i)):
            temp["label"] = dic[i]
            key_map_file[temp["key"]] = temp["label"]
            temp["ext"] = splitext(temp["label"])[-1][1:]
            mime = mime_type(temp["label"])[0]
            if mime:
                file_type = mime.split("/")[0]
                temp["icon"] = type_map_icon[file_type]
            else:
                temp["icon"] = "pi pi-question-circle"
        else:
            temp["label"] = i
            temp["icon"] = "pi pi-folder"
            temp["children"] = manipulate(dic[i], sep=temp["key"] + "-")
        arr.append(temp)
    return arr


with open(".\.\Vault.pickle", "rb") as fobj:
    dic = load(fobj)


app = Flask(__name__)
dir_structure = manipulate(dic["__Tree__"])


@app.route("/")
def home():
    return "RESTFul API"


@app.route("/api/v1/auth")
def password():
    if dic["__Pswrd__"] == request.headers.get("Pass-Key"):
        key = random_key()
        global AUTH
        AUTH = key
        return jsonify(key)
    return jsonify(False), 401


@app.route("/api/v1/tree", methods=["GET"])
def tree():
    if AUTH == request.headers.get("Auth-Key"):
        return jsonify(dumps(dir_structure))
    return jsonify(False), 401


@app.route("/api/v1/save", methods=["GET"])
def save():
    if AUTH == request.headers.get("Auth-Key"):
        try:
            key = request.header.get("Key")
            path = unquote(request.header.get("Path"))
            for i in key_map_file.keys():
                if i == key:
                    file_name = key_map_file[i]
                    break
            with open(path, "wb") as fobj:
                fobj.write(dic[file_name])
            return jsonify(True)
        except:
            return jsonify(False)
    return jsonify(False), 401


app.run(host="127.7.3.0", port=1728)
