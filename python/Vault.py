import json
import os
import pickle
import shutil
from mimetypes import guess_type as mime_type
from urllib.parse import unquote

import flask
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


def manipulate(dic, sep=""):
    arr = []
    for i in dic.keys():
        temp = {}
        temp["key"] = sep + str(len(arr))
        if str.isdigit(str(i)):
            temp["label"] = dic[i]
            key_map_file[temp["key"]] = temp["label"]
            temp["ext"] = os.path.splitext(temp["label"])[-1][1:]
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
    dic = pickle.load(fobj)


app = flask.Flask(__name__)
dir_structure = manipulate(dic["__Tree__"])


@app.route("/")
def home():
    return "RESTFul API"


@app.route("/api/v1/pswrd", methods=["GET"])
def password():
    return jsonify(dic["__Pswrd__"])


@app.route("/api/v1/tree", methods=["GET"])
def tree():
    return json.dumps(dir_structure)


@app.route("/api/v1/save", methods=["GET"])
def save():
    try:
        key = request.args["key"]
        path = unquote(request.args["path"])
        for i in key_map_file.keys():
            if i == key:
                file_name = key_map_file[i]
                break
        with open(path, "wb") as fobj:
            fobj.write(dic[file_name])
        return jsonify(True)
    except:
        return jsonify(False)


app.run(host="127.7.3.0", port=1728)
