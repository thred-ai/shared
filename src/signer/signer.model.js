var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var events_1 = __importDefault(require("events"));
var ThredSigner = /** @class */ (function (_super) {
    __extends(ThredSigner, _super);
    function ThredSigner(chains, networkVersion, maskOtherWallets, autoRefresh, selectedAddress) {
        if (chains === void 0) { chains = []; }
        if (networkVersion === void 0) { networkVersion = 1; }
        if (maskOtherWallets === void 0) { maskOtherWallets = true; }
        if (autoRefresh === void 0) { autoRefresh = true; }
        var _this = _super.call(this) || this;
        _this._metamask = {
            isUnlocked: function () {
                return Promise.resolve(true);
            }
        };
        _this.chainId = "0x".concat(networkVersion.toString(16));
        _this.chains = chains;
        _this.networkVersion = String(networkVersion);
        _this.isMetaMask = maskOtherWallets;
        _this.isBraveWallet = maskOtherWallets;
        _this.selectedAddress = selectedAddress !== null && selectedAddress !== void 0 ? selectedAddress : null;
        _this.autoRefreshOnNetworkChange = autoRefresh;
        return _this;
    }
    ThredSigner.prototype.enable = function () {
        try {
            var data = {
                method: 'eth_accounts',
                params: [],
                chainId: this.chainId
            };
            return this.request(data);
        }
        catch (err) {
            console.log(JSON.stringify(err.message));
            return Promise.reject(err.message);
        }
    };
    ThredSigner.prototype.isConnected = function () {
        return Promise.resolve(true);
    };
    ThredSigner.prototype.send = function (method, params) {
        if (params === void 0) { params = {}; }
        try {
            return this.request({ method: method, params: params });
        }
        catch (err) {
            console.log(JSON.stringify(err));
            return Promise.resolve(null);
        }
    };
    ThredSigner.prototype._sendSync = function (req) {
        console.log('SEND SYNC');
        console.log(JSON.stringify(req));
    };
    ThredSigner.prototype.sendAsync = function (req, callback) {
        try {
            var jsonrpc_1 = req.jsonrpc;
            var id_1 = req.id;
            var method_1 = req.method;
            this.request(req)
                .then(function (returnData) {
                callback(null, { jsonrpc: jsonrpc_1, id: id_1, method: method_1, result: returnData }); //
            })["catch"](function (e) {
                console.error(JSON.stringify(e.message));
                callback(e, null);
            });
        }
        catch (err) {
            console.log(JSON.stringify(err));
            callback(err, null);
        }
    };
    ThredSigner.prototype.connect = function (req) { };
    ThredSigner.prototype.request = function (req) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var method, params, chainId, chain, data, value, value, w, callData, rawData, returnData, err, err, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        method = req.method;
                        params = req.params;
                        chainId = (_a = req.chainId) !== null && _a !== void 0 ? _a : this.networkVersion;
                        if (!(method === 'eth_chainId')) return [3 /*break*/, 1];
                        return [2 /*return*/, Promise.resolve(this.chainId)];
                    case 1:
                        if (!(method === 'wallet_switchEthereumChain')) return [3 /*break*/, 2];
                        chain = (_b = params[0].chainId) !== null && _b !== void 0 ? _b : '0x1';
                        this.chainId = chain;
                        this.networkVersion = String(parseInt(this.chainId, 16));
                        this.emit('chainChanged', this.chainId);
                        return [2 /*return*/, Promise.resolve(null)];
                    case 2:
                        data = {
                            method: method,
                            params: params,
                            chainId: chainId
                        };
                        if (method === 'personal_sign') {
                            data.params[0] = params[0].slice(2);
                            console.log("sign message");
                        }
                        else if (method === 'eth_sendTransaction') {
                            value = data.params[0].value;
                            if (!value) {
                                data.params[0].value = '0x0';
                                value = '0x0';
                            }
                            data.displayValue = value;
                            data.symbol = this.chains.find(function (c) { return String(c.id) == String(data.chainId); }).currency;
                        }
                        else if (method === 'eth_signTypedData_v4') {
                            data.params[1] = JSON.parse(data.params[1]);
                        }
                        else if (method === 'eth_estimateGas') {
                            value = data.params[0].value;
                            if (!value) {
                                data.params[0].value = '0x0';
                            }
                        }
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        w = window;
                        callData = JSON.stringify(data);
                        return [4 /*yield*/, w.thred_request(callData)];
                    case 4:
                        rawData = _c.sent();
                        returnData = rawData ? JSON.parse(rawData) : null;
                        try {
                            if (returnData.data == '0x') {
                                returnData.data = null;
                            }
                            if (returnData == 'rejected') {
                                err = new Error();
                                err.message = 'User rejected the request.';
                                return [2 /*return*/, Promise.reject(err.message)];
                            }
                            else if (returnData.success == false && returnData.error != null) {
                                err = new Error();
                                err.message = returnData.error.message;
                                return [2 /*return*/, Promise.reject(err.message)];
                            }
                            if (method == 'eth_requestAccounts' || method == 'eth_accounts') {
                                this.selectedAddress = returnData.data[0];
                                this.emit('connect', { chainId: this.chainId });
                            }
                            return [2 /*return*/, Promise.resolve(returnData.data)];
                        }
                        catch (error) {
                            console.log(JSON.stringify(error.message));
                            return [2 /*return*/, Promise.reject(error.message)];
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _c.sent();
                        console.log(e_1.message);
                        return [2 /*return*/, Promise.reject(e_1.message)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return ThredSigner;
}(events_1["default"]));
exports["default"] = ThredSigner;
