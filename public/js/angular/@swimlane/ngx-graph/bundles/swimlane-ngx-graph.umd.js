(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@swimlane/ngx-charts'), require('d3-selection'), require('d3-shape'), require('d3-ease'), require('d3-transition'), require('rxjs'), require('rxjs/operators'), require('transformation-matrix'), require('dagre'), require('d3-force'), require('webcola'), require('d3-dispatch'), require('d3-timer')) :
    typeof define === 'function' && define.amd ? define('@swimlane/ngx-graph', ['exports', '@angular/core', '@swimlane/ngx-charts', 'd3-selection', 'd3-shape', 'd3-ease', 'd3-transition', 'rxjs', 'rxjs/operators', 'transformation-matrix', 'dagre', 'd3-force', 'webcola', 'd3-dispatch', 'd3-timer'], factory) :
    (global = global || self, factory((global.swimlane = global.swimlane || {}, global.swimlane['ngx-graph'] = {}), global.ng.core, global.ngxCharts, global.d3Selection, global.d3Shape, global.d3Ease, null, global.rxjs, global.rxjs.operators, global.transformationMatrix, global.dagre, global.d3Force, global.webcola, global.d3Dispatch, global.d3Timer));
}(this, (function (exports, core, ngxCharts, d3Selection, d3Shape, d3Ease, d3Transition, rxjs, operators, transformationMatrix, dagre, d3Force, webcola, d3Dispatch, d3Timer) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
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
    }

    function __createBinding(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }

    function __exportStar(m, exports) {
        for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    var cache = {};
    /**
     * Generates a short id.
     *
     */
    function id() {
        var newId = ('0000' + ((Math.random() * Math.pow(36, 4)) << 0).toString(36)).slice(-4);
        newId = "a" + newId;
        // ensure not already used
        if (!cache[newId]) {
            cache[newId] = true;
            return newId;
        }
        return id();
    }


    (function (Orientation) {
        Orientation["LEFT_TO_RIGHT"] = "LR";
        Orientation["RIGHT_TO_LEFT"] = "RL";
        Orientation["TOP_TO_BOTTOM"] = "TB";
        Orientation["BOTTOM_TO_TOM"] = "BT";
    })(exports.Orientation || (exports.Orientation = {}));

    (function (Alignment) {
        Alignment["CENTER"] = "C";
        Alignment["UP_LEFT"] = "UL";
        Alignment["UP_RIGHT"] = "UR";
        Alignment["DOWN_LEFT"] = "DL";
        Alignment["DOWN_RIGHT"] = "DR";
    })(exports.Alignment || (exports.Alignment = {}));
    var DagreLayout = /** @class */ (function () {
        function DagreLayout() {
            this.defaultSettings = {
                orientation: exports.Orientation.LEFT_TO_RIGHT,
                marginX: 20,
                marginY: 20,
                edgePadding: 100,
                rankPadding: 100,
                nodePadding: 50,
                multigraph: true,
                compound: true
            };
            this.settings = {};
        }
        DagreLayout.prototype.run = function (graph) {
            this.createDagreGraph(graph);
            dagre.layout(this.dagreGraph);
            graph.edgeLabels = this.dagreGraph._edgeLabels;
            var _loop_1 = function (dagreNodeId) {
                var dagreNode = this_1.dagreGraph._nodes[dagreNodeId];
                var node = graph.nodes.find(function (n) { return n.id === dagreNode.id; });
                node.position = {
                    x: dagreNode.x,
                    y: dagreNode.y
                };
                node.dimension = {
                    width: dagreNode.width,
                    height: dagreNode.height
                };
            };
            var this_1 = this;
            for (var dagreNodeId in this.dagreGraph._nodes) {
                _loop_1(dagreNodeId);
            }
            return graph;
        };
        DagreLayout.prototype.updateEdge = function (graph, edge) {
            var sourceNode = graph.nodes.find(function (n) { return n.id === edge.source; });
            var targetNode = graph.nodes.find(function (n) { return n.id === edge.target; });
            // determine new arrow position
            var dir = sourceNode.position.y <= targetNode.position.y ? -1 : 1;
            var startingPoint = {
                x: sourceNode.position.x,
                y: sourceNode.position.y - dir * (sourceNode.dimension.height / 2)
            };
            var endingPoint = {
                x: targetNode.position.x,
                y: targetNode.position.y + dir * (targetNode.dimension.height / 2)
            };
            // generate new points
            edge.points = [startingPoint, endingPoint];
            return graph;
        };
        DagreLayout.prototype.createDagreGraph = function (graph) {
            var e_1, _a, e_2, _b;
            var settings = Object.assign({}, this.defaultSettings, this.settings);
            this.dagreGraph = new dagre.graphlib.Graph({ compound: settings.compound, multigraph: settings.multigraph });
            this.dagreGraph.setGraph({
                rankdir: settings.orientation,
                marginx: settings.marginX,
                marginy: settings.marginY,
                edgesep: settings.edgePadding,
                ranksep: settings.rankPadding,
                nodesep: settings.nodePadding,
                align: settings.align,
                acyclicer: settings.acyclicer,
                ranker: settings.ranker,
                multigraph: settings.multigraph,
                compound: settings.compound
            });
            // Default to assigning a new object as a label for each new edge.
            this.dagreGraph.setDefaultEdgeLabel(function () {
                return {
                /* empty */
                };
            });
            this.dagreNodes = graph.nodes.map(function (n) {
                var node = Object.assign({}, n);
                node.width = n.dimension.width;
                node.height = n.dimension.height;
                node.x = n.position.x;
                node.y = n.position.y;
                return node;
            });
            this.dagreEdges = graph.edges.map(function (l) {
                var newLink = Object.assign({}, l);
                if (!newLink.id) {
                    newLink.id = id();
                }
                return newLink;
            });
            try {
                for (var _c = __values(this.dagreNodes), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var node = _d.value;
                    if (!node.width) {
                        node.width = 20;
                    }
                    if (!node.height) {
                        node.height = 30;
                    }
                    // update dagre
                    this.dagreGraph.setNode(node.id, node);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                // update dagre
                for (var _e = __values(this.dagreEdges), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var edge = _f.value;
                    if (settings.multigraph) {
                        this.dagreGraph.setEdge(edge.source, edge.target, edge, edge.id);
                    }
                    else {
                        this.dagreGraph.setEdge(edge.source, edge.target);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return this.dagreGraph;
        };
        return DagreLayout;
    }());

    var DagreClusterLayout = /** @class */ (function () {
        function DagreClusterLayout() {
            this.defaultSettings = {
                orientation: exports.Orientation.LEFT_TO_RIGHT,
                marginX: 20,
                marginY: 20,
                edgePadding: 100,
                rankPadding: 100,
                nodePadding: 50,
                multigraph: true,
                compound: true
            };
            this.settings = {};
        }
        DagreClusterLayout.prototype.run = function (graph) {
            var _this = this;
            this.createDagreGraph(graph);
            dagre.layout(this.dagreGraph);
            graph.edgeLabels = this.dagreGraph._edgeLabels;
            var dagreToOutput = function (node) {
                var dagreNode = _this.dagreGraph._nodes[node.id];
                return __assign(__assign({}, node), { position: {
                        x: dagreNode.x,
                        y: dagreNode.y
                    }, dimension: {
                        width: dagreNode.width,
                        height: dagreNode.height
                    } });
            };
            graph.clusters = (graph.clusters || []).map(dagreToOutput);
            graph.nodes = graph.nodes.map(dagreToOutput);
            return graph;
        };
        DagreClusterLayout.prototype.updateEdge = function (graph, edge) {
            var sourceNode = graph.nodes.find(function (n) { return n.id === edge.source; });
            var targetNode = graph.nodes.find(function (n) { return n.id === edge.target; });
            // determine new arrow position
            var dir = sourceNode.position.y <= targetNode.position.y ? -1 : 1;
            var startingPoint = {
                x: sourceNode.position.x,
                y: sourceNode.position.y - dir * (sourceNode.dimension.height / 2)
            };
            var endingPoint = {
                x: targetNode.position.x,
                y: targetNode.position.y + dir * (targetNode.dimension.height / 2)
            };
            // generate new points
            edge.points = [startingPoint, endingPoint];
            return graph;
        };
        DagreClusterLayout.prototype.createDagreGraph = function (graph) {
            var e_1, _a, e_2, _b, e_3, _c;
            var _this = this;
            var settings = Object.assign({}, this.defaultSettings, this.settings);
            this.dagreGraph = new dagre.graphlib.Graph({ compound: settings.compound, multigraph: settings.multigraph });
            this.dagreGraph.setGraph({
                rankdir: settings.orientation,
                marginx: settings.marginX,
                marginy: settings.marginY,
                edgesep: settings.edgePadding,
                ranksep: settings.rankPadding,
                nodesep: settings.nodePadding,
                align: settings.align,
                acyclicer: settings.acyclicer,
                ranker: settings.ranker,
                multigraph: settings.multigraph,
                compound: settings.compound
            });
            // Default to assigning a new object as a label for each new edge.
            this.dagreGraph.setDefaultEdgeLabel(function () {
                return {
                /* empty */
                };
            });
            this.dagreNodes = graph.nodes.map(function (n) {
                var node = Object.assign({}, n);
                node.width = n.dimension.width;
                node.height = n.dimension.height;
                node.x = n.position.x;
                node.y = n.position.y;
                return node;
            });
            this.dagreClusters = graph.clusters || [];
            this.dagreEdges = graph.edges.map(function (l) {
                var newLink = Object.assign({}, l);
                if (!newLink.id) {
                    newLink.id = id();
                }
                return newLink;
            });
            try {
                for (var _d = __values(this.dagreNodes), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var node = _e.value;
                    this.dagreGraph.setNode(node.id, node);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var _loop_1 = function (cluster) {
                this_1.dagreGraph.setNode(cluster.id, cluster);
                cluster.childNodeIds.forEach(function (childNodeId) {
                    _this.dagreGraph.setParent(childNodeId, cluster.id);
                });
            };
            var this_1 = this;
            try {
                for (var _f = __values(this.dagreClusters), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var cluster = _g.value;
                    _loop_1(cluster);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                }
                finally { if (e_2) throw e_2.error; }
            }
            try {
                // update dagre
                for (var _h = __values(this.dagreEdges), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var edge = _j.value;
                    if (settings.multigraph) {
                        this.dagreGraph.setEdge(edge.source, edge.target, edge, edge.id);
                    }
                    else {
                        this.dagreGraph.setEdge(edge.source, edge.target);
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return this.dagreGraph;
        };
        return DagreClusterLayout;
    }());

    var DEFAULT_EDGE_NAME = '\x00';
    var GRAPH_NODE = '\x00';
    var EDGE_KEY_DELIM = '\x01';
    var DagreNodesOnlyLayout = /** @class */ (function () {
        function DagreNodesOnlyLayout() {
            this.defaultSettings = {
                orientation: exports.Orientation.LEFT_TO_RIGHT,
                marginX: 20,
                marginY: 20,
                edgePadding: 100,
                rankPadding: 100,
                nodePadding: 50,
                curveDistance: 20,
                multigraph: true,
                compound: true
            };
            this.settings = {};
        }
        DagreNodesOnlyLayout.prototype.run = function (graph) {
            var e_1, _a;
            this.createDagreGraph(graph);
            dagre.layout(this.dagreGraph);
            graph.edgeLabels = this.dagreGraph._edgeLabels;
            var _loop_1 = function (dagreNodeId) {
                var dagreNode = this_1.dagreGraph._nodes[dagreNodeId];
                var node = graph.nodes.find(function (n) { return n.id === dagreNode.id; });
                node.position = {
                    x: dagreNode.x,
                    y: dagreNode.y
                };
                node.dimension = {
                    width: dagreNode.width,
                    height: dagreNode.height
                };
            };
            var this_1 = this;
            for (var dagreNodeId in this.dagreGraph._nodes) {
                _loop_1(dagreNodeId);
            }
            try {
                for (var _b = __values(graph.edges), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var edge = _c.value;
                    this.updateEdge(graph, edge);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return graph;
        };
        DagreNodesOnlyLayout.prototype.updateEdge = function (graph, edge) {
            var _a, _b, _c, _d;
            var sourceNode = graph.nodes.find(function (n) { return n.id === edge.source; });
            var targetNode = graph.nodes.find(function (n) { return n.id === edge.target; });
            var rankAxis = this.settings.orientation === 'BT' || this.settings.orientation === 'TB' ? 'y' : 'x';
            var orderAxis = rankAxis === 'y' ? 'x' : 'y';
            var rankDimension = rankAxis === 'y' ? 'height' : 'width';
            // determine new arrow position
            var dir = sourceNode.position[rankAxis] <= targetNode.position[rankAxis] ? -1 : 1;
            var startingPoint = (_a = {},
                _a[orderAxis] = sourceNode.position[orderAxis],
                _a[rankAxis] = sourceNode.position[rankAxis] - dir * (sourceNode.dimension[rankDimension] / 2),
                _a);
            var endingPoint = (_b = {},
                _b[orderAxis] = targetNode.position[orderAxis],
                _b[rankAxis] = targetNode.position[rankAxis] + dir * (targetNode.dimension[rankDimension] / 2),
                _b);
            var curveDistance = this.settings.curveDistance || this.defaultSettings.curveDistance;
            // generate new points
            edge.points = [
                startingPoint,
                (_c = {},
                    _c[orderAxis] = startingPoint[orderAxis],
                    _c[rankAxis] = startingPoint[rankAxis] - dir * curveDistance,
                    _c),
                (_d = {},
                    _d[orderAxis] = endingPoint[orderAxis],
                    _d[rankAxis] = endingPoint[rankAxis] + dir * curveDistance,
                    _d),
                endingPoint
            ];
            var edgeLabelId = "" + edge.source + EDGE_KEY_DELIM + edge.target + EDGE_KEY_DELIM + DEFAULT_EDGE_NAME;
            var matchingEdgeLabel = graph.edgeLabels[edgeLabelId];
            if (matchingEdgeLabel) {
                matchingEdgeLabel.points = edge.points;
            }
            return graph;
        };
        DagreNodesOnlyLayout.prototype.createDagreGraph = function (graph) {
            var e_2, _a, e_3, _b;
            var settings = Object.assign({}, this.defaultSettings, this.settings);
            this.dagreGraph = new dagre.graphlib.Graph({ compound: settings.compound, multigraph: settings.multigraph });
            this.dagreGraph.setGraph({
                rankdir: settings.orientation,
                marginx: settings.marginX,
                marginy: settings.marginY,
                edgesep: settings.edgePadding,
                ranksep: settings.rankPadding,
                nodesep: settings.nodePadding,
                align: settings.align,
                acyclicer: settings.acyclicer,
                ranker: settings.ranker,
                multigraph: settings.multigraph,
                compound: settings.compound
            });
            // Default to assigning a new object as a label for each new edge.
            this.dagreGraph.setDefaultEdgeLabel(function () {
                return {
                /* empty */
                };
            });
            this.dagreNodes = graph.nodes.map(function (n) {
                var node = Object.assign({}, n);
                node.width = n.dimension.width;
                node.height = n.dimension.height;
                node.x = n.position.x;
                node.y = n.position.y;
                return node;
            });
            this.dagreEdges = graph.edges.map(function (l) {
                var newLink = Object.assign({}, l);
                if (!newLink.id) {
                    newLink.id = id();
                }
                return newLink;
            });
            try {
                for (var _c = __values(this.dagreNodes), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var node = _d.value;
                    if (!node.width) {
                        node.width = 20;
                    }
                    if (!node.height) {
                        node.height = 30;
                    }
                    // update dagre
                    this.dagreGraph.setNode(node.id, node);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_2) throw e_2.error; }
            }
            try {
                // update dagre
                for (var _e = __values(this.dagreEdges), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var edge = _f.value;
                    if (settings.multigraph) {
                        this.dagreGraph.setEdge(edge.source, edge.target, edge, edge.id);
                    }
                    else {
                        this.dagreGraph.setEdge(edge.source, edge.target);
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_3) throw e_3.error; }
            }
            return this.dagreGraph;
        };
        return DagreNodesOnlyLayout;
    }());

    function toD3Node(maybeNode) {
        if (typeof maybeNode === 'string') {
            return {
                id: maybeNode,
                x: 0,
                y: 0
            };
        }
        return maybeNode;
    }
    var D3ForceDirectedLayout = /** @class */ (function () {
        function D3ForceDirectedLayout() {
            this.defaultSettings = {
                force: d3Force.forceSimulation().force('charge', d3Force.forceManyBody().strength(-150)).force('collide', d3Force.forceCollide(5)),
                forceLink: d3Force.forceLink()
                    .id(function (node) { return node.id; })
                    .distance(function () { return 100; })
            };
            this.settings = {};
            this.outputGraph$ = new rxjs.Subject();
        }
        D3ForceDirectedLayout.prototype.run = function (graph) {
            var _this = this;
            this.inputGraph = graph;
            this.d3Graph = {
                nodes: __spread(this.inputGraph.nodes.map(function (n) { return (__assign({}, n)); })),
                edges: __spread(this.inputGraph.edges.map(function (e) { return (__assign({}, e)); }))
            };
            this.outputGraph = {
                nodes: [],
                edges: [],
                edgeLabels: []
            };
            this.outputGraph$.next(this.outputGraph);
            this.settings = Object.assign({}, this.defaultSettings, this.settings);
            if (this.settings.force) {
                this.settings.force
                    .nodes(this.d3Graph.nodes)
                    .force('link', this.settings.forceLink.links(this.d3Graph.edges))
                    .alpha(0.5)
                    .restart()
                    .on('tick', function () {
                    _this.outputGraph$.next(_this.d3GraphToOutputGraph(_this.d3Graph));
                });
            }
            return this.outputGraph$.asObservable();
        };
        D3ForceDirectedLayout.prototype.updateEdge = function (graph, edge) {
            var _this = this;
            var settings = Object.assign({}, this.defaultSettings, this.settings);
            if (settings.force) {
                settings.force
                    .nodes(this.d3Graph.nodes)
                    .force('link', settings.forceLink.links(this.d3Graph.edges))
                    .alpha(0.5)
                    .restart()
                    .on('tick', function () {
                    _this.outputGraph$.next(_this.d3GraphToOutputGraph(_this.d3Graph));
                });
            }
            return this.outputGraph$.asObservable();
        };
        D3ForceDirectedLayout.prototype.d3GraphToOutputGraph = function (d3Graph) {
            this.outputGraph.nodes = this.d3Graph.nodes.map(function (node) { return (__assign(__assign({}, node), { id: node.id || id(), position: {
                    x: node.x,
                    y: node.y
                }, dimension: {
                    width: (node.dimension && node.dimension.width) || 20,
                    height: (node.dimension && node.dimension.height) || 20
                }, transform: "translate(" + (node.x - ((node.dimension && node.dimension.width) || 20) / 2 || 0) + ", " + (node.y - ((node.dimension && node.dimension.height) || 20) / 2 || 0) + ")" })); });
            this.outputGraph.edges = this.d3Graph.edges.map(function (edge) { return (__assign(__assign({}, edge), { source: toD3Node(edge.source).id, target: toD3Node(edge.target).id, points: [
                    {
                        x: toD3Node(edge.source).x,
                        y: toD3Node(edge.source).y
                    },
                    {
                        x: toD3Node(edge.target).x,
                        y: toD3Node(edge.target).y
                    }
                ] })); });
            this.outputGraph.edgeLabels = this.outputGraph.edges;
            return this.outputGraph;
        };
        D3ForceDirectedLayout.prototype.onDragStart = function (draggingNode, $event) {
            this.settings.force.alphaTarget(0.3).restart();
            var node = this.d3Graph.nodes.find(function (d3Node) { return d3Node.id === draggingNode.id; });
            if (!node) {
                return;
            }
            this.draggingStart = { x: $event.x - node.x, y: $event.y - node.y };
            node.fx = $event.x - this.draggingStart.x;
            node.fy = $event.y - this.draggingStart.y;
        };
        D3ForceDirectedLayout.prototype.onDrag = function (draggingNode, $event) {
            if (!draggingNode) {
                return;
            }
            var node = this.d3Graph.nodes.find(function (d3Node) { return d3Node.id === draggingNode.id; });
            if (!node) {
                return;
            }
            node.fx = $event.x - this.draggingStart.x;
            node.fy = $event.y - this.draggingStart.y;
        };
        D3ForceDirectedLayout.prototype.onDragEnd = function (draggingNode, $event) {
            if (!draggingNode) {
                return;
            }
            var node = this.d3Graph.nodes.find(function (d3Node) { return d3Node.id === draggingNode.id; });
            if (!node) {
                return;
            }
            this.settings.force.alphaTarget(0);
            node.fx = undefined;
            node.fy = undefined;
        };
        return D3ForceDirectedLayout;
    }());

    function toNode(nodes, nodeRef) {
        if (typeof nodeRef === 'number') {
            return nodes[nodeRef];
        }
        return nodeRef;
    }
    var ColaForceDirectedLayout = /** @class */ (function () {
        function ColaForceDirectedLayout() {
            this.defaultSettings = {
                force: webcola.d3adaptor(__assign(__assign(__assign({}, d3Dispatch), d3Force), d3Timer))
                    .linkDistance(150)
                    .avoidOverlaps(true),
                viewDimensions: {
                    width: 600,
                    height: 600,
                    xOffset: 0
                }
            };
            this.settings = {};
            this.outputGraph$ = new rxjs.Subject();
        }
        ColaForceDirectedLayout.prototype.run = function (graph) {
            var _this = this;
            this.inputGraph = graph;
            if (!this.inputGraph.clusters) {
                this.inputGraph.clusters = [];
            }
            this.internalGraph = {
                nodes: __spread(this.inputGraph.nodes.map(function (n) { return (__assign(__assign({}, n), { width: n.dimension ? n.dimension.width : 20, height: n.dimension ? n.dimension.height : 20 })); })),
                groups: __spread(this.inputGraph.clusters.map(function (cluster) { return ({
                    padding: 5,
                    groups: cluster.childNodeIds
                        .map(function (nodeId) { return _this.inputGraph.clusters.findIndex(function (node) { return node.id === nodeId; }); })
                        .filter(function (x) { return x >= 0; }),
                    leaves: cluster.childNodeIds
                        .map(function (nodeId) { return _this.inputGraph.nodes.findIndex(function (node) { return node.id === nodeId; }); })
                        .filter(function (x) { return x >= 0; })
                }); })),
                links: __spread(this.inputGraph.edges
                    .map(function (e) {
                    var sourceNodeIndex = _this.inputGraph.nodes.findIndex(function (node) { return e.source === node.id; });
                    var targetNodeIndex = _this.inputGraph.nodes.findIndex(function (node) { return e.target === node.id; });
                    if (sourceNodeIndex === -1 || targetNodeIndex === -1) {
                        return undefined;
                    }
                    return __assign(__assign({}, e), { source: sourceNodeIndex, target: targetNodeIndex });
                })
                    .filter(function (x) { return !!x; })),
                groupLinks: __spread(this.inputGraph.edges
                    .map(function (e) {
                    var sourceNodeIndex = _this.inputGraph.nodes.findIndex(function (node) { return e.source === node.id; });
                    var targetNodeIndex = _this.inputGraph.nodes.findIndex(function (node) { return e.target === node.id; });
                    if (sourceNodeIndex >= 0 && targetNodeIndex >= 0) {
                        return undefined;
                    }
                    return e;
                })
                    .filter(function (x) { return !!x; }))
            };
            this.outputGraph = {
                nodes: [],
                clusters: [],
                edges: [],
                edgeLabels: []
            };
            this.outputGraph$.next(this.outputGraph);
            this.settings = Object.assign({}, this.defaultSettings, this.settings);
            if (this.settings.force) {
                this.settings.force = this.settings.force
                    .nodes(this.internalGraph.nodes)
                    .groups(this.internalGraph.groups)
                    .links(this.internalGraph.links)
                    .alpha(0.5)
                    .on('tick', function () {
                    if (_this.settings.onTickListener) {
                        _this.settings.onTickListener(_this.internalGraph);
                    }
                    _this.outputGraph$.next(_this.internalGraphToOutputGraph(_this.internalGraph));
                });
                if (this.settings.viewDimensions) {
                    this.settings.force = this.settings.force.size([
                        this.settings.viewDimensions.width,
                        this.settings.viewDimensions.height
                    ]);
                }
                if (this.settings.forceModifierFn) {
                    this.settings.force = this.settings.forceModifierFn(this.settings.force);
                }
                this.settings.force.start();
            }
            return this.outputGraph$.asObservable();
        };
        ColaForceDirectedLayout.prototype.updateEdge = function (graph, edge) {
            var settings = Object.assign({}, this.defaultSettings, this.settings);
            if (settings.force) {
                settings.force.start();
            }
            return this.outputGraph$.asObservable();
        };
        ColaForceDirectedLayout.prototype.internalGraphToOutputGraph = function (internalGraph) {
            var _this = this;
            this.outputGraph.nodes = internalGraph.nodes.map(function (node) { return (__assign(__assign({}, node), { id: node.id || id(), position: {
                    x: node.x,
                    y: node.y
                }, dimension: {
                    width: (node.dimension && node.dimension.width) || 20,
                    height: (node.dimension && node.dimension.height) || 20
                }, transform: "translate(" + (node.x - ((node.dimension && node.dimension.width) || 20) / 2 || 0) + ", " + (node.y - ((node.dimension && node.dimension.height) || 20) / 2 || 0) + ")" })); });
            this.outputGraph.edges = internalGraph.links
                .map(function (edge) {
                var source = toNode(internalGraph.nodes, edge.source);
                var target = toNode(internalGraph.nodes, edge.target);
                return __assign(__assign({}, edge), { source: source.id, target: target.id, points: [
                        source.bounds.rayIntersection(target.bounds.cx(), target.bounds.cy()),
                        target.bounds.rayIntersection(source.bounds.cx(), source.bounds.cy())
                    ] });
            })
                .concat(internalGraph.groupLinks.map(function (groupLink) {
                var sourceNode = internalGraph.nodes.find(function (foundNode) { return foundNode.id === groupLink.source; });
                var targetNode = internalGraph.nodes.find(function (foundNode) { return foundNode.id === groupLink.target; });
                var source = sourceNode || internalGraph.groups.find(function (foundGroup) { return foundGroup.id === groupLink.source; });
                var target = targetNode || internalGraph.groups.find(function (foundGroup) { return foundGroup.id === groupLink.target; });
                return __assign(__assign({}, groupLink), { source: source.id, target: target.id, points: [
                        source.bounds.rayIntersection(target.bounds.cx(), target.bounds.cy()),
                        target.bounds.rayIntersection(source.bounds.cx(), source.bounds.cy())
                    ] });
            }));
            this.outputGraph.clusters = internalGraph.groups.map(function (group, index) {
                var inputGroup = _this.inputGraph.clusters[index];
                return __assign(__assign({}, inputGroup), { dimension: {
                        width: group.bounds ? group.bounds.width() : 20,
                        height: group.bounds ? group.bounds.height() : 20
                    }, position: {
                        x: group.bounds ? group.bounds.x + group.bounds.width() / 2 : 0,
                        y: group.bounds ? group.bounds.y + group.bounds.height() / 2 : 0
                    } });
            });
            this.outputGraph.edgeLabels = this.outputGraph.edges;
            return this.outputGraph;
        };
        ColaForceDirectedLayout.prototype.onDragStart = function (draggingNode, $event) {
            var nodeIndex = this.outputGraph.nodes.findIndex(function (foundNode) { return foundNode.id === draggingNode.id; });
            var node = this.internalGraph.nodes[nodeIndex];
            if (!node) {
                return;
            }
            this.draggingStart = { x: node.x - $event.x, y: node.y - $event.y };
            node.fixed = 1;
            this.settings.force.start();
        };
        ColaForceDirectedLayout.prototype.onDrag = function (draggingNode, $event) {
            if (!draggingNode) {
                return;
            }
            var nodeIndex = this.outputGraph.nodes.findIndex(function (foundNode) { return foundNode.id === draggingNode.id; });
            var node = this.internalGraph.nodes[nodeIndex];
            if (!node) {
                return;
            }
            node.x = this.draggingStart.x + $event.x;
            node.y = this.draggingStart.y + $event.y;
        };
        ColaForceDirectedLayout.prototype.onDragEnd = function (draggingNode, $event) {
            if (!draggingNode) {
                return;
            }
            var nodeIndex = this.outputGraph.nodes.findIndex(function (foundNode) { return foundNode.id === draggingNode.id; });
            var node = this.internalGraph.nodes[nodeIndex];
            if (!node) {
                return;
            }
            node.fixed = 0;
        };
        return ColaForceDirectedLayout;
    }());

    var layouts = {
        dagre: DagreLayout,
        dagreCluster: DagreClusterLayout,
        dagreNodesOnly: DagreNodesOnlyLayout,
        d3ForceDirected: D3ForceDirectedLayout,
        colaForceDirected: ColaForceDirectedLayout
    };
    var LayoutService = /** @class */ (function () {
        function LayoutService() {
        }
        LayoutService.prototype.getLayout = function (name) {
            if (layouts[name]) {
                return new layouts[name]();
            }
            else {
                throw new Error("Unknown layout type '" + name + "'");
            }
        };
        LayoutService = __decorate([
            core.Injectable()
        ], LayoutService);
        return LayoutService;
    }());


    (function (PanningAxis) {
        PanningAxis["Both"] = "both";
        PanningAxis["Horizontal"] = "horizontal";
        PanningAxis["Vertical"] = "vertical";
    })(exports.PanningAxis || (exports.PanningAxis = {}));


    (function (MiniMapPosition) {
        MiniMapPosition["UpperLeft"] = "UpperLeft";
        MiniMapPosition["UpperRight"] = "UpperRight";
    })(exports.MiniMapPosition || (exports.MiniMapPosition = {}));

    /**
     * Throttle a function
     *
     * @export
     * @param {*}      func
     * @param {number} wait
     * @param {*}      [options]
     * @returns
     */
    function throttle(func, wait, options) {
        options = options || {};
        var context;
        var args;
        var result;
        var timeout = null;
        var previous = 0;
        function later() {
            previous = options.leading === false ? 0 : +new Date();
            timeout = null;
            result = func.apply(context, args);
        }
        return function () {
            var now = +new Date();
            if (!previous && options.leading === false) {
                previous = now;
            }
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
            }
            else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    }
    /**
     * Throttle decorator
     *
     *  class MyClass {
     *    throttleable(10)
     *    myFn() { ... }
     *  }
     *
     * @export
     * @param {number} duration
     * @param {*} [options]
     * @returns
     */
    function throttleable(duration, options) {
        return function innerDecorator(target, key, descriptor) {
            return {
                configurable: true,
                enumerable: descriptor.enumerable,
                get: function getter() {
                    Object.defineProperty(this, key, {
                        configurable: true,
                        enumerable: descriptor.enumerable,
                        value: throttle(descriptor.value, duration, options)
                    });
                    return this[key];
                }
            };
        };
    }

    var GraphComponent = /** @class */ (function (_super) {
        __extends(GraphComponent, _super);
        function GraphComponent(el, zone, cd, layoutService) {
            var _this = _super.call(this, el, zone, cd) || this;
            _this.el = el;
            _this.zone = zone;
            _this.cd = cd;
            _this.layoutService = layoutService;
            _this.legend = false;
            _this.nodes = [];
            _this.clusters = [];
            _this.links = [];
            _this.activeEntries = [];
            _this.draggingEnabled = true;
            _this.panningEnabled = true;
            _this.panningAxis = exports.PanningAxis.Both;
            _this.enableZoom = true;
            _this.zoomSpeed = 0.1;
            _this.minZoomLevel = 0.1;
            _this.maxZoomLevel = 4.0;
            _this.autoZoom = false;
            _this.panOnZoom = true;
            _this.animate = false;
            _this.autoCenter = false;
            _this.enableTrackpadSupport = false;
            _this.showMiniMap = false;
            _this.miniMapMaxWidth = 100;
            _this.miniMapPosition = exports.MiniMapPosition.UpperRight;
            _this.activate = new core.EventEmitter();
            _this.deactivate = new core.EventEmitter();
            _this.zoomChange = new core.EventEmitter();
            _this.clickHandler = new core.EventEmitter();
            _this.isMouseMoveCalled = false;
            _this.graphSubscription = new rxjs.Subscription();
            _this.subscriptions = [];
            _this.margin = [0, 0, 0, 0];
            _this.results = [];
            _this.isPanning = false;
            _this.isDragging = false;
            _this.initialized = false;
            _this.graphDims = { width: 0, height: 0 };
            _this._oldLinks = [];
            _this.oldNodes = new Set();
            _this.oldClusters = new Set();
            _this.transformationMatrix = transformationMatrix.identity();
            _this._touchLastX = null;
            _this._touchLastY = null;
            _this.minimapScaleCoefficient = 3;
            _this.minimapOffsetX = 0;
            _this.minimapOffsetY = 0;
            _this.isMinimapPanning = false;
            _this.groupResultsBy = function (node) { return node.label; };
            return _this;
        }
        Object.defineProperty(GraphComponent.prototype, "zoomLevel", {
            /**
             * Get the current zoom level
             */
            get: function () {
                return this.transformationMatrix.a;
            },
            /**
             * Set the current zoom level
             */
            set: function (level) {
                this.zoomTo(Number(level));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GraphComponent.prototype, "panOffsetX", {
            /**
             * Get the current `x` position of the graph
             */
            get: function () {
                return this.transformationMatrix.e;
            },
            /**
             * Set the current `x` position of the graph
             */
            set: function (x) {
                this.panTo(Number(x), null);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GraphComponent.prototype, "panOffsetY", {
            /**
             * Get the current `y` position of the graph
             */
            get: function () {
                return this.transformationMatrix.f;
            },
            /**
             * Set the current `y` position of the graph
             */
            set: function (y) {
                this.panTo(null, Number(y));
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Angular lifecycle event
         *
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.ngOnInit = function () {
            var _this = this;
            if (this.update$) {
                this.subscriptions.push(this.update$.subscribe(function () {
                    _this.update();
                }));
            }
            if (this.center$) {
                this.subscriptions.push(this.center$.subscribe(function () {
                    _this.center();
                }));
            }
            if (this.zoomToFit$) {
                this.subscriptions.push(this.zoomToFit$.subscribe(function () {
                    _this.zoomToFit();
                }));
            }
            if (this.panToNode$) {
                this.subscriptions.push(this.panToNode$.subscribe(function (nodeId) {
                    _this.panToNodeId(nodeId);
                }));
            }
            this.minimapClipPathId = "minimapClip" + id();
        };
        GraphComponent.prototype.ngOnChanges = function (changes) {
            var layout = changes.layout, layoutSettings = changes.layoutSettings, nodes = changes.nodes, clusters = changes.clusters, links = changes.links;
            this.setLayout(this.layout);
            if (layoutSettings) {
                this.setLayoutSettings(this.layoutSettings);
            }
            this.update();
        };
        GraphComponent.prototype.setLayout = function (layout) {
            this.initialized = false;
            if (!layout) {
                layout = 'dagre';
            }
            if (typeof layout === 'string') {
                this.layout = this.layoutService.getLayout(layout);
                this.setLayoutSettings(this.layoutSettings);
            }
        };
        GraphComponent.prototype.setLayoutSettings = function (settings) {
            if (this.layout && typeof this.layout !== 'string') {
                this.layout.settings = settings;
            }
        };
        /**
         * Angular lifecycle event
         *
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.ngOnDestroy = function () {
            var e_1, _a;
            _super.prototype.ngOnDestroy.call(this);
            try {
                for (var _b = __values(this.subscriptions), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var sub = _c.value;
                    sub.unsubscribe();
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            this.subscriptions = null;
        };
        /**
         * Angular lifecycle event
         *
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.ngAfterViewInit = function () {
            var _this = this;
            _super.prototype.ngAfterViewInit.call(this);
            setTimeout(function () { return _this.update(); });
        };
        /**
         * Base class update implementation for the dag graph
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.update = function () {
            var _this = this;
            _super.prototype.update.call(this);
            if (!this.curve) {
                this.curve = d3Shape.curveBundle.beta(1);
            }
            this.zone.run(function () {
                _this.dims = ngxCharts.calculateViewDimensions({
                    width: _this.width,
                    height: _this.height,
                    margins: _this.margin,
                    showLegend: _this.legend
                });
                _this.seriesDomain = _this.getSeriesDomain();
                _this.setColors();
                _this.legendOptions = _this.getLegendOptions();
                _this.createGraph();
                _this.updateTransform();
                _this.initialized = true;
            });
        };
        /**
         * Creates the dagre graph engine
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.createGraph = function () {
            var _this = this;
            this.graphSubscription.unsubscribe();
            this.graphSubscription = new rxjs.Subscription();
            var initializeNode = function (n) {
                if (!n.meta) {
                    n.meta = {};
                }
                if (!n.id) {
                    n.id = id();
                }
                if (!n.dimension) {
                    n.dimension = {
                        width: _this.nodeWidth ? _this.nodeWidth : 30,
                        height: _this.nodeHeight ? _this.nodeHeight : 30
                    };
                    n.meta.forceDimensions = false;
                }
                else {
                    n.meta.forceDimensions = n.meta.forceDimensions === undefined ? true : n.meta.forceDimensions;
                }
                n.position = {
                    x: 0,
                    y: 0
                };
                n.data = n.data ? n.data : {};
                return n;
            };
            this.graph = {
                nodes: this.nodes.length > 0 ? __spread(this.nodes).map(initializeNode) : [],
                clusters: this.clusters && this.clusters.length > 0 ? __spread(this.clusters).map(initializeNode) : [],
                edges: this.links.length > 0
                    ? __spread(this.links).map(function (e) {
                        if (!e.id) {
                            e.id = id();
                        }
                        return e;
                    })
                    : []
            };
            requestAnimationFrame(function () { return _this.draw(); });
        };
        /**
         * Draws the graph using dagre layouts
         *
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.draw = function () {
            var _this = this;
            if (!this.layout || typeof this.layout === 'string') {
                return;
            }
            // Calc view dims for the nodes
            this.applyNodeDimensions();
            // Recalc the layout
            var result = this.layout.run(this.graph);
            var result$ = result instanceof rxjs.Observable ? result : rxjs.of(result);
            this.graphSubscription.add(result$.subscribe(function (graph) {
                _this.graph = graph;
                _this.tick();
            }));
            if (this.graph.nodes.length === 0) {
                return;
            }
            result$.pipe(operators.first()).subscribe(function () { return _this.applyNodeDimensions(); });
        };
        GraphComponent.prototype.tick = function () {
            var _this = this;
            // Transposes view options to the node
            var oldNodes = new Set();
            this.graph.nodes.map(function (n) {
                n.transform = "translate(" + (n.position.x - n.dimension.width / 2 || 0) + ", " + (n.position.y - n.dimension.height / 2 || 0) + ")";
                if (!n.data) {
                    n.data = {};
                }
                n.data.color = _this.colors.getColor(_this.groupResultsBy(n));
                oldNodes.add(n.id);
            });
            var oldClusters = new Set();
            (this.graph.clusters || []).map(function (n) {
                n.transform = "translate(" + (n.position.x - n.dimension.width / 2 || 0) + ", " + (n.position.y - n.dimension.height / 2 || 0) + ")";
                if (!n.data) {
                    n.data = {};
                }
                n.data.color = _this.colors.getColor(_this.groupResultsBy(n));
                oldClusters.add(n.id);
            });
            // Prevent animations on new nodes
            setTimeout(function () {
                _this.oldNodes = oldNodes;
                _this.oldClusters = oldClusters;
            }, 500);
            // Update the labels to the new positions
            var newLinks = [];
            var _loop_1 = function (edgeLabelId) {
                var edgeLabel = this_1.graph.edgeLabels[edgeLabelId];
                var normKey = edgeLabelId.replace(/[^\w-]*/g, '');
                var isMultigraph = this_1.layout && typeof this_1.layout !== 'string' && this_1.layout.settings && this_1.layout.settings.multigraph;
                var oldLink = isMultigraph
                    ? this_1._oldLinks.find(function (ol) { return "" + ol.source + ol.target + ol.id === normKey; })
                    : this_1._oldLinks.find(function (ol) { return "" + ol.source + ol.target === normKey; });
                var linkFromGraph = isMultigraph
                    ? this_1.graph.edges.find(function (nl) { return "" + nl.source + nl.target + nl.id === normKey; })
                    : this_1.graph.edges.find(function (nl) { return "" + nl.source + nl.target === normKey; });
                if (!oldLink) {
                    oldLink = linkFromGraph || edgeLabel;
                }
                else if (oldLink.data &&
                    linkFromGraph &&
                    linkFromGraph.data &&
                    JSON.stringify(oldLink.data) !== JSON.stringify(linkFromGraph.data)) {
                    // Compare old link to new link and replace if not equal
                    oldLink.data = linkFromGraph.data;
                }
                oldLink.oldLine = oldLink.line;
                var points = edgeLabel.points;
                var line = this_1.generateLine(points);
                var newLink = Object.assign({}, oldLink);
                newLink.line = line;
                newLink.points = points;
                this_1.updateMidpointOnEdge(newLink, points);
                var textPos = points[Math.floor(points.length / 2)];
                if (textPos) {
                    newLink.textTransform = "translate(" + (textPos.x || 0) + "," + (textPos.y || 0) + ")";
                }
                newLink.textAngle = 0;
                if (!newLink.oldLine) {
                    newLink.oldLine = newLink.line;
                }
                this_1.calcDominantBaseline(newLink);
                newLinks.push(newLink);
            };
            var this_1 = this;
            for (var edgeLabelId in this.graph.edgeLabels) {
                _loop_1(edgeLabelId);
            }
            this.graph.edges = newLinks;
            // Map the old links for animations
            if (this.graph.edges) {
                this._oldLinks = this.graph.edges.map(function (l) {
                    var newL = Object.assign({}, l);
                    newL.oldLine = l.line;
                    return newL;
                });
            }
            this.updateMinimap();
            if (this.autoZoom) {
                this.zoomToFit();
            }
            if (this.autoCenter) {
                // Auto-center when rendering
                this.center();
            }
            requestAnimationFrame(function () { return _this.redrawLines(); });
            this.cd.markForCheck();
        };
        GraphComponent.prototype.getMinimapTransform = function () {
            switch (this.miniMapPosition) {
                case exports.MiniMapPosition.UpperLeft: {
                    return '';
                }
                case exports.MiniMapPosition.UpperRight: {
                    return 'translate(' + (this.dims.width - this.graphDims.width / this.minimapScaleCoefficient) + ',' + 0 + ')';
                }
                default: {
                    return '';
                }
            }
        };
        GraphComponent.prototype.updateGraphDims = function () {
            var minX = +Infinity;
            var maxX = -Infinity;
            var minY = +Infinity;
            var maxY = -Infinity;
            for (var i = 0; i < this.graph.nodes.length; i++) {
                var node = this.graph.nodes[i];
                minX = node.position.x < minX ? node.position.x : minX;
                minY = node.position.y < minY ? node.position.y : minY;
                maxX = node.position.x + node.dimension.width > maxX ? node.position.x + node.dimension.width : maxX;
                maxY = node.position.y + node.dimension.height > maxY ? node.position.y + node.dimension.height : maxY;
            }
            minX -= 100;
            minY -= 100;
            maxX += 100;
            maxY += 100;
            this.graphDims.width = maxX - minX;
            this.graphDims.height = maxY - minY;
            this.minimapOffsetX = minX;
            this.minimapOffsetY = minY;
        };
        GraphComponent.prototype.updateMinimap = function () {
            if (!this.showMiniMap) {
                return;
            }
            // Calculate the height/width total, but only if we have any nodes
            if (this.graph.nodes && this.graph.nodes.length) {
                this.updateGraphDims();
                if (this.miniMapMaxWidth) {
                    this.minimapScaleCoefficient = this.graphDims.width / this.miniMapMaxWidth;
                }
                if (this.miniMapMaxHeight) {
                    this.minimapScaleCoefficient = Math.max(this.minimapScaleCoefficient, this.graphDims.height / this.miniMapMaxHeight);
                }
                this.minimapTransform = this.getMinimapTransform();
            }
        };
        /**
         * Measures the node element and applies the dimensions
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.applyNodeDimensions = function () {
            var _this = this;
            if (this.nodeElements && this.nodeElements.length) {
                this.nodeElements.map(function (elem) {
                    var e_2, _a;
                    var nativeElement = elem.nativeElement;
                    var node = _this.graph.nodes.find(function (n) { return n.id === nativeElement.id; });
                    if (!node) {
                        return;
                    }
                    // calculate the height
                    var dims;
                    try {
                        dims = nativeElement.getBBox();
                        if (!dims.width || !dims.height) {
                            return;
                        }
                    }
                    catch (ex) {
                        // Skip drawing if element is not displayed - Firefox would throw an error here
                        return;
                    }
                    if (_this.nodeHeight) {
                        node.dimension.height =
                            node.dimension.height && node.meta.forceDimensions ? node.dimension.height : _this.nodeHeight;
                    }
                    else {
                        node.dimension.height =
                            node.dimension.height && node.meta.forceDimensions ? node.dimension.height : dims.height;
                    }
                    if (_this.nodeMaxHeight) {
                        node.dimension.height = Math.max(node.dimension.height, _this.nodeMaxHeight);
                    }
                    if (_this.nodeMinHeight) {
                        node.dimension.height = Math.min(node.dimension.height, _this.nodeMinHeight);
                    }
                    if (_this.nodeWidth) {
                        node.dimension.width =
                            node.dimension.width && node.meta.forceDimensions ? node.dimension.width : _this.nodeWidth;
                    }
                    else {
                        // calculate the width
                        if (nativeElement.getElementsByTagName('text').length) {
                            var maxTextDims = void 0;
                            try {
                                try {
                                    for (var _b = __values(nativeElement.getElementsByTagName('text')), _c = _b.next(); !_c.done; _c = _b.next()) {
                                        var textElem = _c.value;
                                        var currentBBox = textElem.getBBox();
                                        if (!maxTextDims) {
                                            maxTextDims = currentBBox;
                                        }
                                        else {
                                            if (currentBBox.width > maxTextDims.width) {
                                                maxTextDims.width = currentBBox.width;
                                            }
                                            if (currentBBox.height > maxTextDims.height) {
                                                maxTextDims.height = currentBBox.height;
                                            }
                                        }
                                    }
                                }
                                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                                finally {
                                    try {
                                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                    }
                                    finally { if (e_2) throw e_2.error; }
                                }
                            }
                            catch (ex) {
                                // Skip drawing if element is not displayed - Firefox would throw an error here
                                return;
                            }
                            node.dimension.width =
                                node.dimension.width && node.meta.forceDimensions ? node.dimension.width : maxTextDims.width + 20;
                        }
                        else {
                            node.dimension.width =
                                node.dimension.width && node.meta.forceDimensions ? node.dimension.width : dims.width;
                        }
                    }
                    if (_this.nodeMaxWidth) {
                        node.dimension.width = Math.max(node.dimension.width, _this.nodeMaxWidth);
                    }
                    if (_this.nodeMinWidth) {
                        node.dimension.width = Math.min(node.dimension.width, _this.nodeMinWidth);
                    }
                });
            }
        };
        /**
         * Redraws the lines when dragged or viewport updated
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.redrawLines = function (_animate) {
            var _this = this;
            if (_animate === void 0) { _animate = this.animate; }
            this.linkElements.map(function (linkEl) {
                var edge = _this.graph.edges.find(function (lin) { return lin.id === linkEl.nativeElement.id; });
                if (edge) {
                    var linkSelection = d3Selection.select(linkEl.nativeElement).select('.line');
                    linkSelection
                        .attr('d', edge.oldLine)
                        .transition()
                        .ease(d3Ease.easeSinInOut)
                        .duration(_animate ? 500 : 0)
                        .attr('d', edge.line);
                    var textPathSelection = d3Selection.select(_this.chartElement.nativeElement).select("#" + edge.id);
                    textPathSelection
                        .attr('d', edge.oldTextPath)
                        .transition()
                        .ease(d3Ease.easeSinInOut)
                        .duration(_animate ? 500 : 0)
                        .attr('d', edge.textPath);
                    _this.updateMidpointOnEdge(edge, edge.points);
                }
            });
        };
        /**
         * Calculate the text directions / flipping
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.calcDominantBaseline = function (link) {
            var firstPoint = link.points[0];
            var lastPoint = link.points[link.points.length - 1];
            link.oldTextPath = link.textPath;
            if (lastPoint.x < firstPoint.x) {
                link.dominantBaseline = 'text-before-edge';
                // reverse text path for when its flipped upside down
                link.textPath = this.generateLine(__spread(link.points).reverse());
            }
            else {
                link.dominantBaseline = 'text-after-edge';
                link.textPath = link.line;
            }
        };
        /**
         * Generate the new line path
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.generateLine = function (points) {
            var lineFunction = d3Shape.line()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .curve(this.curve);
            return lineFunction(points);
        };
        /**
         * Zoom was invoked from event
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.onZoom = function ($event, direction) {
            if (this.enableTrackpadSupport && !$event.ctrlKey) {
                this.pan($event.deltaX * -1, $event.deltaY * -1);
                return;
            }
            var zoomFactor = 1 + (direction === 'in' ? this.zoomSpeed : -this.zoomSpeed);
            // Check that zooming wouldn't put us out of bounds
            var newZoomLevel = this.zoomLevel * zoomFactor;
            if (newZoomLevel <= this.minZoomLevel || newZoomLevel >= this.maxZoomLevel) {
                return;
            }
            // Check if zooming is enabled or not
            if (!this.enableZoom) {
                return;
            }
            if (this.panOnZoom === true && $event) {
                // Absolute mouse X/Y on the screen
                var mouseX = $event.clientX;
                var mouseY = $event.clientY;
                // Transform the mouse X/Y into a SVG X/Y
                var svg = this.chart.nativeElement.querySelector('svg');
                var svgGroup = svg.querySelector('g.chart');
                var point = svg.createSVGPoint();
                point.x = mouseX;
                point.y = mouseY;
                var svgPoint = point.matrixTransform(svgGroup.getScreenCTM().inverse());
                // Panzoom
                this.pan(svgPoint.x, svgPoint.y, true);
                this.zoom(zoomFactor);
                this.pan(-svgPoint.x, -svgPoint.y, true);
            }
            else {
                this.zoom(zoomFactor);
            }
        };
        /**
         * Pan by x/y
         *
         * @param x
         * @param y
         */
        GraphComponent.prototype.pan = function (x, y, ignoreZoomLevel) {
            if (ignoreZoomLevel === void 0) { ignoreZoomLevel = false; }
            var zoomLevel = ignoreZoomLevel ? 1 : this.zoomLevel;
            this.transformationMatrix = transformationMatrix.transform(this.transformationMatrix, transformationMatrix.translate(x / zoomLevel, y / zoomLevel));
            this.updateTransform();
        };
        /**
         * Pan to a fixed x/y
         *
         */
        GraphComponent.prototype.panTo = function (x, y) {
            if (x === null || x === undefined || isNaN(x) || y === null || y === undefined || isNaN(y)) {
                return;
            }
            var panX = -this.panOffsetX - x * this.zoomLevel + this.dims.width / 2;
            var panY = -this.panOffsetY - y * this.zoomLevel + this.dims.height / 2;
            this.transformationMatrix = transformationMatrix.transform(this.transformationMatrix, transformationMatrix.translate(panX / this.zoomLevel, panY / this.zoomLevel));
            this.updateTransform();
        };
        /**
         * Zoom by a factor
         *
         */
        GraphComponent.prototype.zoom = function (factor) {
            this.transformationMatrix = transformationMatrix.transform(this.transformationMatrix, transformationMatrix.scale(factor, factor));
            this.zoomChange.emit(this.zoomLevel);
            this.updateTransform();
        };
        /**
         * Zoom to a fixed level
         *
         */
        GraphComponent.prototype.zoomTo = function (level) {
            this.transformationMatrix.a = isNaN(level) ? this.transformationMatrix.a : Number(level);
            this.transformationMatrix.d = isNaN(level) ? this.transformationMatrix.d : Number(level);
            this.zoomChange.emit(this.zoomLevel);
            this.updateTransform();
            this.update();
        };
        /**
         * Drag was invoked from an event
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.onDrag = function (event) {
            var e_3, _a;
            var _this = this;
            if (!this.draggingEnabled) {
                return;
            }
            var node = this.draggingNode;
            if (this.layout && typeof this.layout !== 'string' && this.layout.onDrag) {
                this.layout.onDrag(node, event);
            }
            node.position.x += event.movementX / this.zoomLevel;
            node.position.y += event.movementY / this.zoomLevel;
            // move the node
            var x = node.position.x - node.dimension.width / 2;
            var y = node.position.y - node.dimension.height / 2;
            node.transform = "translate(" + x + ", " + y + ")";
            var _loop_2 = function (link) {
                if (link.target === node.id ||
                    link.source === node.id ||
                    link.target.id === node.id ||
                    link.source.id === node.id) {
                    if (this_2.layout && typeof this_2.layout !== 'string') {
                        var result = this_2.layout.updateEdge(this_2.graph, link);
                        var result$ = result instanceof rxjs.Observable ? result : rxjs.of(result);
                        this_2.graphSubscription.add(result$.subscribe(function (graph) {
                            _this.graph = graph;
                            _this.redrawEdge(link);
                        }));
                    }
                }
            };
            var this_2 = this;
            try {
                for (var _b = __values(this.graph.edges), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var link = _c.value;
                    _loop_2(link);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_3) throw e_3.error; }
            }
            this.redrawLines(false);
            this.updateMinimap();
        };
        GraphComponent.prototype.redrawEdge = function (edge) {
            var line = this.generateLine(edge.points);
            this.calcDominantBaseline(edge);
            edge.oldLine = edge.line;
            edge.line = line;
        };
        /**
         * Update the entire view for the new pan position
         *
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.updateTransform = function () {
            this.transform = transformationMatrix.toSVG(transformationMatrix.smoothMatrix(this.transformationMatrix, 100));
        };
        /**
         * Node was clicked
         *
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.onClick = function (event) {
            this.select.emit(event);
        };
        /**
         * Node was focused
         *
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.onActivate = function (event) {
            if (this.activeEntries.indexOf(event) > -1) {
                return;
            }
            this.activeEntries = __spread([event], this.activeEntries);
            this.activate.emit({ value: event, entries: this.activeEntries });
        };
        /**
         * Node was defocused
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.onDeactivate = function (event) {
            var idx = this.activeEntries.indexOf(event);
            this.activeEntries.splice(idx, 1);
            this.activeEntries = __spread(this.activeEntries);
            this.deactivate.emit({ value: event, entries: this.activeEntries });
        };
        /**
         * Get the domain series for the nodes
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.getSeriesDomain = function () {
            var _this = this;
            return this.nodes
                .map(function (d) { return _this.groupResultsBy(d); })
                .reduce(function (nodes, node) { return (nodes.indexOf(node) !== -1 ? nodes : nodes.concat([node])); }, [])
                .sort();
        };
        /**
         * Tracking for the link
         *
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.trackLinkBy = function (index, link) {
            return link.id;
        };
        /**
         * Tracking for the node
         *
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.trackNodeBy = function (index, node) {
            return node.id;
        };
        /**
         * Sets the colors the nodes
         *
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.setColors = function () {
            this.colors = new ngxCharts.ColorHelper(this.scheme, 'ordinal', this.seriesDomain, this.customColors);
        };
        /**
         * Gets the legend options
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.getLegendOptions = function () {
            return {
                scaleType: 'ordinal',
                domain: this.seriesDomain,
                colors: this.colors
            };
        };
        /**
         * On mouse move event, used for panning and dragging.
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.onMouseMove = function ($event) {
            this.isMouseMoveCalled = true;
            if ((this.isPanning || this.isMinimapPanning) && this.panningEnabled) {
                this.panWithConstraints(this.panningAxis, $event);
            }
            else if (this.isDragging && this.draggingEnabled) {
                this.onDrag($event);
            }
        };
        GraphComponent.prototype.onMouseDown = function (event) {
            this.isMouseMoveCalled = false;
        };
        GraphComponent.prototype.graphClick = function (event) {
            if (!this.isMouseMoveCalled)
                this.clickHandler.emit(event);
        };
        /**
         * On touch start event to enable panning.
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.onTouchStart = function (event) {
            this._touchLastX = event.changedTouches[0].clientX;
            this._touchLastY = event.changedTouches[0].clientY;
            this.isPanning = true;
        };
        /**
         * On touch move event, used for panning.
         *
         */
        GraphComponent.prototype.onTouchMove = function ($event) {
            if (this.isPanning && this.panningEnabled) {
                var clientX = $event.changedTouches[0].clientX;
                var clientY = $event.changedTouches[0].clientY;
                var movementX = clientX - this._touchLastX;
                var movementY = clientY - this._touchLastY;
                this._touchLastX = clientX;
                this._touchLastY = clientY;
                this.pan(movementX, movementY);
            }
        };
        /**
         * On touch end event to disable panning.
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.onTouchEnd = function (event) {
            this.isPanning = false;
        };
        /**
         * On mouse up event to disable panning/dragging.
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.onMouseUp = function (event) {
            this.isDragging = false;
            this.isPanning = false;
            this.isMinimapPanning = false;
            if (this.layout && typeof this.layout !== 'string' && this.layout.onDragEnd) {
                this.layout.onDragEnd(this.draggingNode, event);
            }
        };
        /**
         * On node mouse down to kick off dragging
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.onNodeMouseDown = function (event, node) {
            if (!this.draggingEnabled) {
                return;
            }
            this.isDragging = true;
            this.draggingNode = node;
            if (this.layout && typeof this.layout !== 'string' && this.layout.onDragStart) {
                this.layout.onDragStart(node, event);
            }
        };
        /**
         * On minimap drag mouse down to kick off minimap panning
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.onMinimapDragMouseDown = function () {
            this.isMinimapPanning = true;
        };
        /**
         * On minimap pan event. Pans the graph to the clicked position
         *
         * @memberOf GraphComponent
         */
        GraphComponent.prototype.onMinimapPanTo = function (event) {
            var x = event.offsetX - (this.dims.width - (this.graphDims.width + this.minimapOffsetX) / this.minimapScaleCoefficient);
            var y = event.offsetY + this.minimapOffsetY / this.minimapScaleCoefficient;
            this.panTo(x * this.minimapScaleCoefficient, y * this.minimapScaleCoefficient);
            this.isMinimapPanning = true;
        };
        /**
         * Center the graph in the viewport
         */
        GraphComponent.prototype.center = function () {
            this.panTo(this.graphDims.width / 2, this.graphDims.height / 2);
        };
        /**
         * Zooms to fit the entier graph
         */
        GraphComponent.prototype.zoomToFit = function () {
            var heightZoom = this.dims.height / this.graphDims.height;
            var widthZoom = this.dims.width / this.graphDims.width;
            var zoomLevel = Math.min(heightZoom, widthZoom, 1);
            if (zoomLevel < this.minZoomLevel) {
                zoomLevel = this.minZoomLevel;
            }
            if (zoomLevel > this.maxZoomLevel) {
                zoomLevel = this.maxZoomLevel;
            }
            if (zoomLevel !== this.zoomLevel) {
                this.zoomLevel = zoomLevel;
                this.updateTransform();
                this.zoomChange.emit(this.zoomLevel);
            }
        };
        /**
         * Pans to the node
         * @param nodeId
         */
        GraphComponent.prototype.panToNodeId = function (nodeId) {
            var node = this.graph.nodes.find(function (n) { return n.id === nodeId; });
            if (!node) {
                return;
            }
            this.panTo(node.position.x, node.position.y);
        };
        GraphComponent.prototype.panWithConstraints = function (key, event) {
            var x = event.movementX;
            var y = event.movementY;
            if (this.isMinimapPanning) {
                x = -this.minimapScaleCoefficient * x * this.zoomLevel;
                y = -this.minimapScaleCoefficient * y * this.zoomLevel;
            }
            switch (key) {
                case exports.PanningAxis.Horizontal:
                    this.pan(x, 0);
                    break;
                case exports.PanningAxis.Vertical:
                    this.pan(0, y);
                    break;
                default:
                    this.pan(x, y);
                    break;
            }
        };
        GraphComponent.prototype.updateMidpointOnEdge = function (edge, points) {
            if (!edge || !points) {
                return;
            }
            if (points.length % 2 === 1) {
                edge.midPoint = points[Math.floor(points.length / 2)];
            }
            else {
                var _first = points[points.length / 2];
                var _second = points[points.length / 2 - 1];
                edge.midPoint = {
                    x: (_first.x + _second.x) / 2,
                    y: (_first.y + _second.y) / 2
                };
            }
        };
        GraphComponent.ctorParameters = function () { return [
            { type: core.ElementRef },
            { type: core.NgZone },
            { type: core.ChangeDetectorRef },
            { type: LayoutService }
        ]; };
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], GraphComponent.prototype, "legend", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], GraphComponent.prototype, "nodes", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], GraphComponent.prototype, "clusters", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], GraphComponent.prototype, "links", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Array)
        ], GraphComponent.prototype, "activeEntries", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GraphComponent.prototype, "curve", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GraphComponent.prototype, "draggingEnabled", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GraphComponent.prototype, "nodeHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GraphComponent.prototype, "nodeMaxHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GraphComponent.prototype, "nodeMinHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GraphComponent.prototype, "nodeWidth", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GraphComponent.prototype, "nodeMinWidth", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GraphComponent.prototype, "nodeMaxWidth", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], GraphComponent.prototype, "panningEnabled", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], GraphComponent.prototype, "panningAxis", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GraphComponent.prototype, "enableZoom", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GraphComponent.prototype, "zoomSpeed", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GraphComponent.prototype, "minZoomLevel", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GraphComponent.prototype, "maxZoomLevel", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GraphComponent.prototype, "autoZoom", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GraphComponent.prototype, "panOnZoom", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GraphComponent.prototype, "animate", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GraphComponent.prototype, "autoCenter", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", rxjs.Observable)
        ], GraphComponent.prototype, "update$", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", rxjs.Observable)
        ], GraphComponent.prototype, "center$", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", rxjs.Observable)
        ], GraphComponent.prototype, "zoomToFit$", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", rxjs.Observable)
        ], GraphComponent.prototype, "panToNode$", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GraphComponent.prototype, "layout", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GraphComponent.prototype, "layoutSettings", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Object)
        ], GraphComponent.prototype, "enableTrackpadSupport", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Boolean)
        ], GraphComponent.prototype, "showMiniMap", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GraphComponent.prototype, "miniMapMaxWidth", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Number)
        ], GraphComponent.prototype, "miniMapMaxHeight", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", String)
        ], GraphComponent.prototype, "miniMapPosition", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], GraphComponent.prototype, "activate", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], GraphComponent.prototype, "deactivate", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], GraphComponent.prototype, "zoomChange", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", core.EventEmitter)
        ], GraphComponent.prototype, "clickHandler", void 0);
        __decorate([
            core.ContentChild('linkTemplate'),
            __metadata("design:type", core.TemplateRef)
        ], GraphComponent.prototype, "linkTemplate", void 0);
        __decorate([
            core.ContentChild('nodeTemplate'),
            __metadata("design:type", core.TemplateRef)
        ], GraphComponent.prototype, "nodeTemplate", void 0);
        __decorate([
            core.ContentChild('clusterTemplate'),
            __metadata("design:type", core.TemplateRef)
        ], GraphComponent.prototype, "clusterTemplate", void 0);
        __decorate([
            core.ContentChild('defsTemplate'),
            __metadata("design:type", core.TemplateRef)
        ], GraphComponent.prototype, "defsTemplate", void 0);
        __decorate([
            core.ContentChild('miniMapNodeTemplate'),
            __metadata("design:type", core.TemplateRef)
        ], GraphComponent.prototype, "miniMapNodeTemplate", void 0);
        __decorate([
            core.ViewChild(ngxCharts.ChartComponent, { read: core.ElementRef, static: true }),
            __metadata("design:type", core.ElementRef)
        ], GraphComponent.prototype, "chart", void 0);
        __decorate([
            core.ViewChildren('nodeElement'),
            __metadata("design:type", core.QueryList)
        ], GraphComponent.prototype, "nodeElements", void 0);
        __decorate([
            core.ViewChildren('linkElement'),
            __metadata("design:type", core.QueryList)
        ], GraphComponent.prototype, "linkElements", void 0);
        __decorate([
            core.Input(),
            __metadata("design:type", Function)
        ], GraphComponent.prototype, "groupResultsBy", void 0);
        __decorate([
            core.Input('zoomLevel'),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], GraphComponent.prototype, "zoomLevel", null);
        __decorate([
            core.Input('panOffsetX'),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], GraphComponent.prototype, "panOffsetX", null);
        __decorate([
            core.Input('panOffsetY'),
            __metadata("design:type", Object),
            __metadata("design:paramtypes", [Object])
        ], GraphComponent.prototype, "panOffsetY", null);
        __decorate([
            throttleable(500),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", []),
            __metadata("design:returntype", void 0)
        ], GraphComponent.prototype, "updateMinimap", null);
        __decorate([
            core.HostListener('document:mousemove', ['$event']),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [MouseEvent]),
            __metadata("design:returntype", void 0)
        ], GraphComponent.prototype, "onMouseMove", null);
        __decorate([
            core.HostListener('document:mousedown', ['$event']),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [MouseEvent]),
            __metadata("design:returntype", void 0)
        ], GraphComponent.prototype, "onMouseDown", null);
        __decorate([
            core.HostListener('document:click', ['$event']),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [MouseEvent]),
            __metadata("design:returntype", void 0)
        ], GraphComponent.prototype, "graphClick", null);
        __decorate([
            core.HostListener('document:touchmove', ['$event']),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], GraphComponent.prototype, "onTouchMove", null);
        __decorate([
            core.HostListener('document:mouseup', ['$event']),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [MouseEvent]),
            __metadata("design:returntype", void 0)
        ], GraphComponent.prototype, "onMouseUp", null);
        GraphComponent = __decorate([
            core.Component({
                selector: 'ngx-graph',
                template: "<ngx-charts-chart\n  [view]=\"[width, height]\"\n  [showLegend]=\"legend\"\n  [legendOptions]=\"legendOptions\"\n  (legendLabelClick)=\"onClick($event)\"\n  (legendLabelActivate)=\"onActivate($event)\"\n  (legendLabelDeactivate)=\"onDeactivate($event)\"\n  mouseWheel\n  (mouseWheelUp)=\"onZoom($event, 'in')\"\n  (mouseWheelDown)=\"onZoom($event, 'out')\"\n>\n  <svg:g\n    *ngIf=\"initialized && graph\"\n    [attr.transform]=\"transform\"\n    (touchstart)=\"onTouchStart($event)\"\n    (touchend)=\"onTouchEnd($event)\"\n    class=\"graph chart\"\n  >\n    <defs>\n      <ng-container *ngIf=\"defsTemplate\" [ngTemplateOutlet]=\"defsTemplate\"></ng-container>\n      <svg:path\n        class=\"text-path\"\n        *ngFor=\"let link of graph.edges\"\n        [attr.d]=\"link.textPath\"\n        [attr.id]=\"link.id\"\n      ></svg:path>\n    </defs>\n\n    <svg:rect\n      class=\"panning-rect\"\n      [attr.width]=\"dims.width * 100\"\n      [attr.height]=\"dims.height * 100\"\n      [attr.transform]=\"'translate(' + (-dims.width || 0) * 50 + ',' + (-dims.height || 0) * 50 + ')'\"\n      (mousedown)=\"isPanning = true\"\n    />\n\n    <ng-content></ng-content>\n\n    <svg:g class=\"clusters\">\n      <svg:g\n        #clusterElement\n        *ngFor=\"let node of graph.clusters; trackBy: trackNodeBy\"\n        class=\"node-group\"\n        [class.old-node]=\"animate && oldClusters.has(node.id)\"\n        [id]=\"node.id\"\n        [attr.transform]=\"node.transform\"\n        (click)=\"onClick(node)\"\n      >\n        <ng-container\n          *ngIf=\"clusterTemplate\"\n          [ngTemplateOutlet]=\"clusterTemplate\"\n          [ngTemplateOutletContext]=\"{ $implicit: node }\"\n        ></ng-container>\n        <svg:g *ngIf=\"!clusterTemplate\" class=\"node cluster\">\n          <svg:rect\n            [attr.width]=\"node.dimension.width\"\n            [attr.height]=\"node.dimension.height\"\n            [attr.fill]=\"node.data?.color\"\n          />\n          <svg:text alignment-baseline=\"central\" [attr.x]=\"10\" [attr.y]=\"node.dimension.height / 2\">\n            {{ node.label }}\n          </svg:text>\n        </svg:g>\n      </svg:g>\n    </svg:g>\n\n    <svg:g class=\"links\">\n      <svg:g #linkElement *ngFor=\"let link of graph.edges; trackBy: trackLinkBy\" class=\"link-group\" [id]=\"link.id\">\n        <ng-container\n          *ngIf=\"linkTemplate\"\n          [ngTemplateOutlet]=\"linkTemplate\"\n          [ngTemplateOutletContext]=\"{ $implicit: link }\"\n        ></ng-container>\n        <svg:path *ngIf=\"!linkTemplate\" class=\"edge\" [attr.d]=\"link.line\" />\n      </svg:g>\n    </svg:g>\n\n    <svg:g class=\"nodes\">\n      <svg:g\n        #nodeElement\n        *ngFor=\"let node of graph.nodes; trackBy: trackNodeBy\"\n        class=\"node-group\"\n        [class.old-node]=\"animate && oldNodes.has(node.id)\"\n        [id]=\"node.id\"\n        [attr.transform]=\"node.transform\"\n        (click)=\"onClick(node)\"\n        (mousedown)=\"onNodeMouseDown($event, node)\"\n      >\n        <ng-container\n          *ngIf=\"nodeTemplate\"\n          [ngTemplateOutlet]=\"nodeTemplate\"\n          [ngTemplateOutletContext]=\"{ $implicit: node }\"\n        ></ng-container>\n        <svg:circle\n          *ngIf=\"!nodeTemplate\"\n          r=\"10\"\n          [attr.cx]=\"node.dimension.width / 2\"\n          [attr.cy]=\"node.dimension.height / 2\"\n          [attr.fill]=\"node.data?.color\"\n        />\n      </svg:g>\n    </svg:g>\n  </svg:g>\n\n  <svg:clipPath [attr.id]=\"minimapClipPathId\">\n    <svg:rect\n      [attr.width]=\"graphDims.width / minimapScaleCoefficient\"\n      [attr.height]=\"graphDims.height / minimapScaleCoefficient\"\n    ></svg:rect>\n  </svg:clipPath>\n\n  <svg:g\n    class=\"minimap\"\n    *ngIf=\"showMiniMap\"\n    [attr.transform]=\"minimapTransform\"\n    [attr.clip-path]=\"'url(#' + minimapClipPathId + ')'\"\n  >\n    <svg:rect\n      class=\"minimap-background\"\n      [attr.width]=\"graphDims.width / minimapScaleCoefficient\"\n      [attr.height]=\"graphDims.height / minimapScaleCoefficient\"\n      (mousedown)=\"onMinimapPanTo($event)\"\n    ></svg:rect>\n\n    <svg:g\n      [style.transform]=\"\n        'translate(' +\n        -minimapOffsetX / minimapScaleCoefficient +\n        'px,' +\n        -minimapOffsetY / minimapScaleCoefficient +\n        'px)'\n      \"\n    >\n      <svg:g class=\"minimap-nodes\" [style.transform]=\"'scale(' + 1 / minimapScaleCoefficient + ')'\">\n        <svg:g\n          #nodeElement\n          *ngFor=\"let node of graph.nodes; trackBy: trackNodeBy\"\n          class=\"node-group\"\n          [class.old-node]=\"animate && oldNodes.has(node.id)\"\n          [id]=\"node.id\"\n          [attr.transform]=\"node.transform\"\n        >\n          <ng-container\n            *ngIf=\"miniMapNodeTemplate\"\n            [ngTemplateOutlet]=\"miniMapNodeTemplate\"\n            [ngTemplateOutletContext]=\"{ $implicit: node }\"\n          ></ng-container>\n          <ng-container\n            *ngIf=\"!miniMapNodeTemplate && nodeTemplate\"\n            [ngTemplateOutlet]=\"nodeTemplate\"\n            [ngTemplateOutletContext]=\"{ $implicit: node }\"\n          ></ng-container>\n          <svg:circle\n            *ngIf=\"!nodeTemplate && !miniMapNodeTemplate\"\n            r=\"10\"\n            [attr.cx]=\"node.dimension.width / 2 / minimapScaleCoefficient\"\n            [attr.cy]=\"node.dimension.height / 2 / minimapScaleCoefficient\"\n            [attr.fill]=\"node.data?.color\"\n          />\n        </svg:g>\n      </svg:g>\n\n      <svg:rect\n        [attr.transform]=\"\n          'translate(' +\n          panOffsetX / zoomLevel / -minimapScaleCoefficient +\n          ',' +\n          panOffsetY / zoomLevel / -minimapScaleCoefficient +\n          ')'\n        \"\n        class=\"minimap-drag\"\n        [class.panning]=\"isMinimapPanning\"\n        [attr.width]=\"width / minimapScaleCoefficient / zoomLevel\"\n        [attr.height]=\"height / minimapScaleCoefficient / zoomLevel\"\n        (mousedown)=\"onMinimapDragMouseDown()\"\n      ></svg:rect>\n    </svg:g>\n  </svg:g>\n</ngx-charts-chart>\n",
                encapsulation: core.ViewEncapsulation.None,
                changeDetection: core.ChangeDetectionStrategy.OnPush,
                styles: [".minimap .minimap-background{fill:rgba(0,0,0,.1)}.minimap .minimap-drag{fill:rgba(0,0,0,.2);stroke:#fff;stroke-width:1px;stroke-dasharray:2px;stroke-dashoffset:2px;cursor:pointer}.minimap .minimap-drag.panning{fill:rgba(0,0,0,.3)}.minimap .minimap-nodes{opacity:.5;pointer-events:none}.graph{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.graph .edge{stroke:#666;fill:none}.graph .edge .edge-label{stroke:none;font-size:12px;fill:#251e1e}.graph .panning-rect{fill:transparent;cursor:move}.graph .node-group.old-node{transition:transform .5s ease-in-out}.graph .node-group .node:focus{outline:0}.graph .cluster rect{opacity:.2}"]
            }),
            __metadata("design:paramtypes", [core.ElementRef,
                core.NgZone,
                core.ChangeDetectorRef,
                LayoutService])
        ], GraphComponent);
        return GraphComponent;
    }(ngxCharts.BaseChartComponent));

    /**
     * Mousewheel directive
     * https://github.com/SodhanaLibrary/angular2-examples/blob/master/app/mouseWheelDirective/mousewheel.directive.ts
     *
     * @export
     */
    // tslint:disable-next-line: directive-selector
    var MouseWheelDirective = /** @class */ (function () {
        function MouseWheelDirective() {
            this.mouseWheelUp = new core.EventEmitter();
            this.mouseWheelDown = new core.EventEmitter();
        }
        MouseWheelDirective.prototype.onMouseWheelChrome = function (event) {
            this.mouseWheelFunc(event);
        };
        MouseWheelDirective.prototype.onMouseWheelFirefox = function (event) {
            this.mouseWheelFunc(event);
        };
        MouseWheelDirective.prototype.onWheel = function (event) {
            this.mouseWheelFunc(event);
        };
        MouseWheelDirective.prototype.onMouseWheelIE = function (event) {
            this.mouseWheelFunc(event);
        };
        MouseWheelDirective.prototype.mouseWheelFunc = function (event) {
            if (window.event) {
                event = window.event;
            }
            var delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail || event.deltaY || event.deltaX));
            // Firefox don't have native support for wheel event, as a result delta values are reverse
            var isWheelMouseUp = event.wheelDelta ? delta > 0 : delta < 0;
            var isWheelMouseDown = event.wheelDelta ? delta < 0 : delta > 0;
            if (isWheelMouseUp) {
                this.mouseWheelUp.emit(event);
            }
            else if (isWheelMouseDown) {
                this.mouseWheelDown.emit(event);
            }
            // for IE
            event.returnValue = false;
            // for Chrome and Firefox
            if (event.preventDefault) {
                event.preventDefault();
            }
        };
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], MouseWheelDirective.prototype, "mouseWheelUp", void 0);
        __decorate([
            core.Output(),
            __metadata("design:type", Object)
        ], MouseWheelDirective.prototype, "mouseWheelDown", void 0);
        __decorate([
            core.HostListener('mousewheel', ['$event']),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], MouseWheelDirective.prototype, "onMouseWheelChrome", null);
        __decorate([
            core.HostListener('DOMMouseScroll', ['$event']),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], MouseWheelDirective.prototype, "onMouseWheelFirefox", null);
        __decorate([
            core.HostListener('wheel', ['$event']),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], MouseWheelDirective.prototype, "onWheel", null);
        __decorate([
            core.HostListener('onmousewheel', ['$event']),
            __metadata("design:type", Function),
            __metadata("design:paramtypes", [Object]),
            __metadata("design:returntype", void 0)
        ], MouseWheelDirective.prototype, "onMouseWheelIE", null);
        MouseWheelDirective = __decorate([
            core.Directive({ selector: '[mouseWheel]' })
        ], MouseWheelDirective);
        return MouseWheelDirective;
    }());

    var GraphModule = /** @class */ (function () {
        function GraphModule() {
        }
        GraphModule = __decorate([
            core.NgModule({
                imports: [ngxCharts.ChartCommonModule],
                declarations: [GraphComponent, MouseWheelDirective],
                exports: [GraphComponent, MouseWheelDirective],
                providers: [LayoutService]
            })
        ], GraphModule);
        return GraphModule;
    }());

    var NgxGraphModule = /** @class */ (function () {
        function NgxGraphModule() {
        }
        NgxGraphModule = __decorate([
            core.NgModule({
                imports: [ngxCharts.NgxChartsModule],
                exports: [GraphModule]
            })
        ], NgxGraphModule);
        return NgxGraphModule;
    }());

    exports.ColaForceDirectedLayout = ColaForceDirectedLayout;
    exports.D3ForceDirectedLayout = D3ForceDirectedLayout;
    exports.DagreClusterLayout = DagreClusterLayout;
    exports.DagreLayout = DagreLayout;
    exports.DagreNodesOnlyLayout = DagreNodesOnlyLayout;
    exports.GraphComponent = GraphComponent;
    exports.GraphModule = GraphModule;
    exports.MouseWheelDirective = MouseWheelDirective;
    exports.NgxGraphModule = NgxGraphModule;
    exports.toD3Node = toD3Node;
    exports.toNode = toNode;
    exports.ɵa = LayoutService;
    exports.ɵb = throttleable;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=swimlane-ngx-graph.umd.js.map
