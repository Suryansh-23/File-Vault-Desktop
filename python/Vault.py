from json import dumps, loads
from sys import exit
from os.path import splitext, split, basename
from os import mkdir
from pickle import load
from mimetypes import guess_type as mime_type
from random import choices
from string import ascii_letters, digits

from flask import Flask
from flask import jsonify, request

# Map Table for giving icons for each file type consumable by the frontend
type_map_icon = {
    "image": "pi pi-image",
    "video": "pi pi-video",
    "audio": "pi pi-volume-up",
    "application": "pi pi-desktop",
    "text": "pi pi-file",
}

key_map_file = {}  # Map Table for accessing file names from their keys
file_map_key = {}
keys_list = []
AUTH = ""  # AUTH (global var) for maintaining a valid Auth-Key to be used to verify connection with authenticated clients only


def random_key():
    """Generates a random auth key"""
    str_pool = ascii_letters + digits
    return "".join(choices(str_pool, k=20))


def manipulate(dic, sep=""):
    """Converts standard python data structure hash table to a formatted object consumable by js frontend"""
    arr = []
    for i in dic.keys():
        temp = {}
        temp["key"] = sep + str(len(arr))
        keys_list.append(temp["key"])
        if type(i) == type(1):  # Checks for int type
            temp["label"] = basename(dic[i])
            key_map_file[temp["key"]] = dic[i]
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


def download_multiple(dic: dict, path: str, whitelist: list, partial: list, dirs: list):
    print("white", whitelist)
    for i in dic:
        if type(i) == type(1):  # Checks for int type
            if file_map_key[dic[i]] in whitelist:
                with open(path + "\\" + basename(dic[i]), "wb") as fobj:
                    fobj.write(vault[dic[i]])
        else:
            print("dirs[i][0]", dirs[i][0])
            if dirs[i][0] in whitelist or dirs[i][0] in partial:
                mkdir(path + "\\" + i)
                download_multiple(dic[i], path + "\\" + i, whitelist, partial, dirs)
    return True


def download_vault(dic: dict, path: str):
    mkdir(path)
    for i in dic:
        if type(i) == type(1):  # Checks for int type
            with open(path + "\\" + basename(dic[i]), "wb") as fobj:
                fobj.write(vault[dic[i]])
        else:
            download_vault(dic[i], path + "\\" + i)
    return True


def shutdown_server():
    func = request.environ.get("werkzeug.server.shutdown")
    if func is None:
        raise RuntimeError("Not running with the Werkzeug Server")
    func()


with open(".\.\Vault.pickle", "rb") as fobj:
    vault = load(fobj)


app = Flask(__name__)
dir_structure = manipulate(vault["__Tree__"])


@app.route("/")
def home():
    """Standard API Route for Testing if API is online"""
    return "RESTFul API"


@app.route("/api/auth")
def password():
    """API Route for Auth Service
    Auth -> Gets Pass-Key in Header -> Checks if Pass-Key is correct -> If correct sets global AUTH to Auth Key gen by random_key() -> Sends Auth-Key string to frontend
    """
    if vault["__Pswrd__"] == request.headers.get("Pass-Key"):
        key = random_key()
        global AUTH
        AUTH = key
        return jsonify(key)
    return jsonify(False), 401


@app.route("/api/tree", methods=["GET"])
def tree():
    """API Route sends directory structure object (Formatted) to frontend if correct Auth-Key Present"""
    if AUTH == request.headers.get("Auth-Key"):
        return jsonify(dumps(dir_structure))
    # return jsonify(dumps(dir_structure))  # remove in prod
    return jsonify(False), 401


@app.route("/api/keys", methods=["GET"])
def keys():
    """API Route sends directory structure object (Formatted) to frontend if correct Auth-Key Present"""
    if AUTH == request.headers.get("Auth-Key"):
        try:
            return jsonify(keys_list)
        except:
            return jsonify(False), 500
    return jsonify(False), 401


@app.route("/api/save", methods=["GET"])
def save():
    """API Route saves file for the provided Key at the Path provided in the Header"""
    if AUTH == request.headers.get("Auth-Key"):
        try:
            key = request.headers.get("Key")
            path = request.headers.get("Path")
            for i in key_map_file.keys():
                if i == key:
                    file_name = key_map_file[i]
                    break
            with open(path, "wb") as fobj:
                fobj.write(vault[file_name])
            return jsonify(True)
        except:
            return jsonify(False), 500
    return jsonify(False), 401


@app.route("/api/save_many", methods=["GET"])
def save_many():
    """API Route saves multiple files selected by the user at the frontend, passed in the form of an array"""
    # if AUTH == request.headers.get("Auth-Key"):
    # try:
    path = request.headers.get("Path")
    whitelist = loads(request.headers.get("Checked"))
    partial = loads(request.headers.get("Partial-Checked"))

    file_map_key.update({j: i for i, j in key_map_file.items()})
    dirs = {basename(split(i)[0]): j for i, j in file_map_key.items()}

    mkdir(path + "\\" + "Vault_Files")
    download_multiple(
        vault["__Tree__"], path + "\\" + "Vault_Files", whitelist, partial, dirs
    )
    return jsonify(True), 200
    # except:
    # return jsonify(False), 500
    # return jsonify(False), 401


@app.route("/api/save_all", methods=["GET"])
def save_all():
    """API Route saves all the files present in the Vault at the specefic Path"""
    if AUTH == request.headers.get("Auth-Key"):
        try:
            path = request.headers.get("Path")
            download_vault(vault["__Tree__"], path + "\\" + "Vault_Files")
            return jsonify(True), 200
        except:
            return jsonify(False), 500
    return jsonify(False), 401


@app.route("/kill", methods=["GET"])
def kill():
    if AUTH == request.headers.get("Auth-Key"):
        # try:
        shutdown_server()
    #     except:
    #         return jsonify(False), 500
    # return jsonify(False), 401


app.run(host="127.7.3.0", port=1728, debug=True)
