import { __decorate, __extends, __metadata, __read, __spread, __values } from "tslib";
import { AfterViewInit, ChangeDetectionStrategy, Component, ContentChild, ElementRef, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, QueryList, TemplateRef, ViewChild, ViewChildren, ViewEncapsulation, NgZone, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { BaseChartComponent, ChartComponent, ColorHelper, calculateViewDimensions } from '@swimlane/ngx-charts';
import { select } from 'd3-selection';
import * as shape from 'd3-shape';
import * as ease from 'd3-ease';
import 'd3-transition';
import { Observable, Subscription, of } from 'rxjs';
import { first } from 'rxjs/operators';
import { identity, scale, smoothMatrix, toSVG, transform, translate } from 'transformation-matrix';
import { LayoutService } from './layouts/layout.service';
import { id } from '../utils/id';
import { PanningAxis } from '../enums/panning.enum';
import { MiniMapPosition } from '../enums/mini-map-position.enum';
import { throttleable } from '../utils/throttle';
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
        _this.panningAxis = PanningAxis.Both;
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
        _this.miniMapPosition = MiniMapPosition.UpperRight;
        _this.activate = new EventEmitter();
        _this.deactivate = new EventEmitter();
        _this.zoomChange = new EventEmitter();
        _this.clickHandler = new EventEmitter();
        _this.isMouseMoveCalled = false;
        _this.graphSubscription = new Subscription();
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
        _this.transformationMatrix = identity();
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
            this.curve = shape.curveBundle.beta(1);
        }
        this.zone.run(function () {
            _this.dims = calculateViewDimensions({
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
        this.graphSubscription = new Subscription();
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
        var result$ = result instanceof Observable ? result : of(result);
        this.graphSubscription.add(result$.subscribe(function (graph) {
            _this.graph = graph;
            _this.tick();
        }));
        if (this.graph.nodes.length === 0) {
            return;
        }
        result$.pipe(first()).subscribe(function () { return _this.applyNodeDimensions(); });
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
            case MiniMapPosition.UpperLeft: {
                return '';
            }
            case MiniMapPosition.UpperRight: {
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
                var linkSelection = select(linkEl.nativeElement).select('.line');
                linkSelection
                    .attr('d', edge.oldLine)
                    .transition()
                    .ease(ease.easeSinInOut)
                    .duration(_animate ? 500 : 0)
                    .attr('d', edge.line);
                var textPathSelection = select(_this.chartElement.nativeElement).select("#" + edge.id);
                textPathSelection
                    .attr('d', edge.oldTextPath)
                    .transition()
                    .ease(ease.easeSinInOut)
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
        var lineFunction = shape
            .line()
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
        this.transformationMatrix = transform(this.transformationMatrix, translate(x / zoomLevel, y / zoomLevel));
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
        this.transformationMatrix = transform(this.transformationMatrix, translate(panX / this.zoomLevel, panY / this.zoomLevel));
        this.updateTransform();
    };
    /**
     * Zoom by a factor
     *
     */
    GraphComponent.prototype.zoom = function (factor) {
        this.transformationMatrix = transform(this.transformationMatrix, scale(factor, factor));
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
                    var result$ = result instanceof Observable ? result : of(result);
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
        this.transform = toSVG(smoothMatrix(this.transformationMatrix, 100));
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
        this.colors = new ColorHelper(this.scheme, 'ordinal', this.seriesDomain, this.customColors);
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
            case PanningAxis.Horizontal:
                this.pan(x, 0);
                break;
            case PanningAxis.Vertical:
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
        { type: ElementRef },
        { type: NgZone },
        { type: ChangeDetectorRef },
        { type: LayoutService }
    ]; };
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], GraphComponent.prototype, "legend", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], GraphComponent.prototype, "nodes", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], GraphComponent.prototype, "clusters", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], GraphComponent.prototype, "links", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Array)
    ], GraphComponent.prototype, "activeEntries", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GraphComponent.prototype, "curve", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GraphComponent.prototype, "draggingEnabled", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GraphComponent.prototype, "nodeHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GraphComponent.prototype, "nodeMaxHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GraphComponent.prototype, "nodeMinHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GraphComponent.prototype, "nodeWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GraphComponent.prototype, "nodeMinWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GraphComponent.prototype, "nodeMaxWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], GraphComponent.prototype, "panningEnabled", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], GraphComponent.prototype, "panningAxis", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GraphComponent.prototype, "enableZoom", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GraphComponent.prototype, "zoomSpeed", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GraphComponent.prototype, "minZoomLevel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GraphComponent.prototype, "maxZoomLevel", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GraphComponent.prototype, "autoZoom", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GraphComponent.prototype, "panOnZoom", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GraphComponent.prototype, "animate", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GraphComponent.prototype, "autoCenter", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Observable)
    ], GraphComponent.prototype, "update$", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Observable)
    ], GraphComponent.prototype, "center$", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Observable)
    ], GraphComponent.prototype, "zoomToFit$", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Observable)
    ], GraphComponent.prototype, "panToNode$", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GraphComponent.prototype, "layout", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GraphComponent.prototype, "layoutSettings", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], GraphComponent.prototype, "enableTrackpadSupport", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean)
    ], GraphComponent.prototype, "showMiniMap", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GraphComponent.prototype, "miniMapMaxWidth", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number)
    ], GraphComponent.prototype, "miniMapMaxHeight", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], GraphComponent.prototype, "miniMapPosition", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], GraphComponent.prototype, "activate", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], GraphComponent.prototype, "deactivate", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], GraphComponent.prototype, "zoomChange", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], GraphComponent.prototype, "clickHandler", void 0);
    __decorate([
        ContentChild('linkTemplate'),
        __metadata("design:type", TemplateRef)
    ], GraphComponent.prototype, "linkTemplate", void 0);
    __decorate([
        ContentChild('nodeTemplate'),
        __metadata("design:type", TemplateRef)
    ], GraphComponent.prototype, "nodeTemplate", void 0);
    __decorate([
        ContentChild('clusterTemplate'),
        __metadata("design:type", TemplateRef)
    ], GraphComponent.prototype, "clusterTemplate", void 0);
    __decorate([
        ContentChild('defsTemplate'),
        __metadata("design:type", TemplateRef)
    ], GraphComponent.prototype, "defsTemplate", void 0);
    __decorate([
        ContentChild('miniMapNodeTemplate'),
        __metadata("design:type", TemplateRef)
    ], GraphComponent.prototype, "miniMapNodeTemplate", void 0);
    __decorate([
        ViewChild(ChartComponent, { read: ElementRef, static: true }),
        __metadata("design:type", ElementRef)
    ], GraphComponent.prototype, "chart", void 0);
    __decorate([
        ViewChildren('nodeElement'),
        __metadata("design:type", QueryList)
    ], GraphComponent.prototype, "nodeElements", void 0);
    __decorate([
        ViewChildren('linkElement'),
        __metadata("design:type", QueryList)
    ], GraphComponent.prototype, "linkElements", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Function)
    ], GraphComponent.prototype, "groupResultsBy", void 0);
    __decorate([
        Input('zoomLevel'),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], GraphComponent.prototype, "zoomLevel", null);
    __decorate([
        Input('panOffsetX'),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], GraphComponent.prototype, "panOffsetX", null);
    __decorate([
        Input('panOffsetY'),
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
        HostListener('document:mousemove', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], GraphComponent.prototype, "onMouseMove", null);
    __decorate([
        HostListener('document:mousedown', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], GraphComponent.prototype, "onMouseDown", null);
    __decorate([
        HostListener('document:click', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], GraphComponent.prototype, "graphClick", null);
    __decorate([
        HostListener('document:touchmove', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Object]),
        __metadata("design:returntype", void 0)
    ], GraphComponent.prototype, "onTouchMove", null);
    __decorate([
        HostListener('document:mouseup', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [MouseEvent]),
        __metadata("design:returntype", void 0)
    ], GraphComponent.prototype, "onMouseUp", null);
    GraphComponent = __decorate([
        Component({
            selector: 'ngx-graph',
            template: "<ngx-charts-chart\n  [view]=\"[width, height]\"\n  [showLegend]=\"legend\"\n  [legendOptions]=\"legendOptions\"\n  (legendLabelClick)=\"onClick($event)\"\n  (legendLabelActivate)=\"onActivate($event)\"\n  (legendLabelDeactivate)=\"onDeactivate($event)\"\n  mouseWheel\n  (mouseWheelUp)=\"onZoom($event, 'in')\"\n  (mouseWheelDown)=\"onZoom($event, 'out')\"\n>\n  <svg:g\n    *ngIf=\"initialized && graph\"\n    [attr.transform]=\"transform\"\n    (touchstart)=\"onTouchStart($event)\"\n    (touchend)=\"onTouchEnd($event)\"\n    class=\"graph chart\"\n  >\n    <defs>\n      <ng-container *ngIf=\"defsTemplate\" [ngTemplateOutlet]=\"defsTemplate\"></ng-container>\n      <svg:path\n        class=\"text-path\"\n        *ngFor=\"let link of graph.edges\"\n        [attr.d]=\"link.textPath\"\n        [attr.id]=\"link.id\"\n      ></svg:path>\n    </defs>\n\n    <svg:rect\n      class=\"panning-rect\"\n      [attr.width]=\"dims.width * 100\"\n      [attr.height]=\"dims.height * 100\"\n      [attr.transform]=\"'translate(' + (-dims.width || 0) * 50 + ',' + (-dims.height || 0) * 50 + ')'\"\n      (mousedown)=\"isPanning = true\"\n    />\n\n    <ng-content></ng-content>\n\n    <svg:g class=\"clusters\">\n      <svg:g\n        #clusterElement\n        *ngFor=\"let node of graph.clusters; trackBy: trackNodeBy\"\n        class=\"node-group\"\n        [class.old-node]=\"animate && oldClusters.has(node.id)\"\n        [id]=\"node.id\"\n        [attr.transform]=\"node.transform\"\n        (click)=\"onClick(node)\"\n      >\n        <ng-container\n          *ngIf=\"clusterTemplate\"\n          [ngTemplateOutlet]=\"clusterTemplate\"\n          [ngTemplateOutletContext]=\"{ $implicit: node }\"\n        ></ng-container>\n        <svg:g *ngIf=\"!clusterTemplate\" class=\"node cluster\">\n          <svg:rect\n            [attr.width]=\"node.dimension.width\"\n            [attr.height]=\"node.dimension.height\"\n            [attr.fill]=\"node.data?.color\"\n          />\n          <svg:text alignment-baseline=\"central\" [attr.x]=\"10\" [attr.y]=\"node.dimension.height / 2\">\n            {{ node.label }}\n          </svg:text>\n        </svg:g>\n      </svg:g>\n    </svg:g>\n\n    <svg:g class=\"links\">\n      <svg:g #linkElement *ngFor=\"let link of graph.edges; trackBy: trackLinkBy\" class=\"link-group\" [id]=\"link.id\">\n        <ng-container\n          *ngIf=\"linkTemplate\"\n          [ngTemplateOutlet]=\"linkTemplate\"\n          [ngTemplateOutletContext]=\"{ $implicit: link }\"\n        ></ng-container>\n        <svg:path *ngIf=\"!linkTemplate\" class=\"edge\" [attr.d]=\"link.line\" />\n      </svg:g>\n    </svg:g>\n\n    <svg:g class=\"nodes\">\n      <svg:g\n        #nodeElement\n        *ngFor=\"let node of graph.nodes; trackBy: trackNodeBy\"\n        class=\"node-group\"\n        [class.old-node]=\"animate && oldNodes.has(node.id)\"\n        [id]=\"node.id\"\n        [attr.transform]=\"node.transform\"\n        (click)=\"onClick(node)\"\n        (mousedown)=\"onNodeMouseDown($event, node)\"\n      >\n        <ng-container\n          *ngIf=\"nodeTemplate\"\n          [ngTemplateOutlet]=\"nodeTemplate\"\n          [ngTemplateOutletContext]=\"{ $implicit: node }\"\n        ></ng-container>\n        <svg:circle\n          *ngIf=\"!nodeTemplate\"\n          r=\"10\"\n          [attr.cx]=\"node.dimension.width / 2\"\n          [attr.cy]=\"node.dimension.height / 2\"\n          [attr.fill]=\"node.data?.color\"\n        />\n      </svg:g>\n    </svg:g>\n  </svg:g>\n\n  <svg:clipPath [attr.id]=\"minimapClipPathId\">\n    <svg:rect\n      [attr.width]=\"graphDims.width / minimapScaleCoefficient\"\n      [attr.height]=\"graphDims.height / minimapScaleCoefficient\"\n    ></svg:rect>\n  </svg:clipPath>\n\n  <svg:g\n    class=\"minimap\"\n    *ngIf=\"showMiniMap\"\n    [attr.transform]=\"minimapTransform\"\n    [attr.clip-path]=\"'url(#' + minimapClipPathId + ')'\"\n  >\n    <svg:rect\n      class=\"minimap-background\"\n      [attr.width]=\"graphDims.width / minimapScaleCoefficient\"\n      [attr.height]=\"graphDims.height / minimapScaleCoefficient\"\n      (mousedown)=\"onMinimapPanTo($event)\"\n    ></svg:rect>\n\n    <svg:g\n      [style.transform]=\"\n        'translate(' +\n        -minimapOffsetX / minimapScaleCoefficient +\n        'px,' +\n        -minimapOffsetY / minimapScaleCoefficient +\n        'px)'\n      \"\n    >\n      <svg:g class=\"minimap-nodes\" [style.transform]=\"'scale(' + 1 / minimapScaleCoefficient + ')'\">\n        <svg:g\n          #nodeElement\n          *ngFor=\"let node of graph.nodes; trackBy: trackNodeBy\"\n          class=\"node-group\"\n          [class.old-node]=\"animate && oldNodes.has(node.id)\"\n          [id]=\"node.id\"\n          [attr.transform]=\"node.transform\"\n        >\n          <ng-container\n            *ngIf=\"miniMapNodeTemplate\"\n            [ngTemplateOutlet]=\"miniMapNodeTemplate\"\n            [ngTemplateOutletContext]=\"{ $implicit: node }\"\n          ></ng-container>\n          <ng-container\n            *ngIf=\"!miniMapNodeTemplate && nodeTemplate\"\n            [ngTemplateOutlet]=\"nodeTemplate\"\n            [ngTemplateOutletContext]=\"{ $implicit: node }\"\n          ></ng-container>\n          <svg:circle\n            *ngIf=\"!nodeTemplate && !miniMapNodeTemplate\"\n            r=\"10\"\n            [attr.cx]=\"node.dimension.width / 2 / minimapScaleCoefficient\"\n            [attr.cy]=\"node.dimension.height / 2 / minimapScaleCoefficient\"\n            [attr.fill]=\"node.data?.color\"\n          />\n        </svg:g>\n      </svg:g>\n\n      <svg:rect\n        [attr.transform]=\"\n          'translate(' +\n          panOffsetX / zoomLevel / -minimapScaleCoefficient +\n          ',' +\n          panOffsetY / zoomLevel / -minimapScaleCoefficient +\n          ')'\n        \"\n        class=\"minimap-drag\"\n        [class.panning]=\"isMinimapPanning\"\n        [attr.width]=\"width / minimapScaleCoefficient / zoomLevel\"\n        [attr.height]=\"height / minimapScaleCoefficient / zoomLevel\"\n        (mousedown)=\"onMinimapDragMouseDown()\"\n      ></svg:rect>\n    </svg:g>\n  </svg:g>\n</ngx-charts-chart>\n",
            encapsulation: ViewEncapsulation.None,
            changeDetection: ChangeDetectionStrategy.OnPush,
            styles: [".minimap .minimap-background{fill:rgba(0,0,0,.1)}.minimap .minimap-drag{fill:rgba(0,0,0,.2);stroke:#fff;stroke-width:1px;stroke-dasharray:2px;stroke-dashoffset:2px;cursor:pointer}.minimap .minimap-drag.panning{fill:rgba(0,0,0,.3)}.minimap .minimap-nodes{opacity:.5;pointer-events:none}.graph{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.graph .edge{stroke:#666;fill:none}.graph .edge .edge-label{stroke:none;font-size:12px;fill:#251e1e}.graph .panning-rect{fill:transparent;cursor:move}.graph .node-group.old-node{transition:transform .5s ease-in-out}.graph .node-group .node:focus{outline:0}.graph .cluster rect{opacity:.2}"]
        }),
        __metadata("design:paramtypes", [ElementRef,
            NgZone,
            ChangeDetectorRef,
            LayoutService])
    ], GraphComponent);
    return GraphComponent;
}(BaseChartComponent));
export { GraphComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGguY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHN3aW1sYW5lL25neC1ncmFwaC8iLCJzb3VyY2VzIjpbImxpYi9ncmFwaC9ncmFwaC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLE9BQU8sRUFDTCxhQUFhLEVBQ2IsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxZQUFZLEVBQ1osVUFBVSxFQUNWLFlBQVksRUFDWixZQUFZLEVBQ1osS0FBSyxFQUNMLFNBQVMsRUFDVCxNQUFNLEVBQ04sTUFBTSxFQUNOLFNBQVMsRUFDVCxXQUFXLEVBQ1gsU0FBUyxFQUNULFlBQVksRUFDWixpQkFBaUIsRUFDakIsTUFBTSxFQUNOLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsYUFBYSxFQUNkLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsY0FBYyxFQUNkLFdBQVcsRUFFWCx1QkFBdUIsRUFDeEIsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3RDLE9BQU8sS0FBSyxLQUFLLE1BQU0sVUFBVSxDQUFDO0FBQ2xDLE9BQU8sS0FBSyxJQUFJLE1BQU0sU0FBUyxDQUFDO0FBQ2hDLE9BQU8sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNwRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkMsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFbkcsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBSXpELE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDakMsT0FBTyxFQUFFLFdB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LGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNOztTQUNoRCxDQUFDO3lDQW1GYyxVQUFVO1lBQ1QsTUFBTTtZQUNSLGlCQUFpQjtZQUNMLGFBQWE7T0FyRjNCLGNBQWMsQ0FnbUMxQjtJQUFELHFCQUFDO0NBQUEsQUFobUNELENBQW9DLGtCQUFrQixHQWdtQ3JEO1NBaG1DWSxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiLy8gcmVuYW1lIHRyYW5zaXRpb24gZHVlIHRvIGNvbmZsaWN0IHdpdGggZDMgdHJhbnNpdGlvblxuaW1wb3J0IHsgYW5pbWF0ZSwgc3R5bGUsIHRyYW5zaXRpb24gYXMgbmdUcmFuc2l0aW9uLCB0cmlnZ2VyIH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBDb250ZW50Q2hpbGQsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSG9zdExpc3RlbmVyLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgUXVlcnlMaXN0LFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NoaWxkLFxuICBWaWV3Q2hpbGRyZW4sXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBOZ1pvbmUsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBPbkNoYW5nZXMsXG4gIFNpbXBsZUNoYW5nZXNcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBCYXNlQ2hhcnRDb21wb25lbnQsXG4gIENoYXJ0Q29tcG9uZW50LFxuICBDb2xvckhlbHBlcixcbiAgVmlld0RpbWVuc2lvbnMsXG4gIGNhbGN1bGF0ZVZpZXdEaW1lbnNpb25zXG59IGZyb20gJ0Bzd2ltbGFuZS9uZ3gtY2hhcnRzJztcbmltcG9ydCB7IHNlbGVjdCB9IGZyb20gJ2QzLXNlbGVjdGlvbic7XG5pbXBvcnQgKiBhcyBzaGFwZSBmcm9tICdkMy1zaGFwZSc7XG5pbXBvcnQgKiBhcyBlYXNlIGZyb20gJ2QzLWVhc2UnO1xuaW1wb3J0ICdkMy10cmFuc2l0aW9uJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YnNjcmlwdGlvbiwgb2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZpcnN0IH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgaWRlbnRpdHksIHNjYWxlLCBzbW9vdGhNYXRyaXgsIHRvU1ZHLCB0cmFuc2Zvcm0sIHRyYW5zbGF0ZSB9IGZyb20gJ3RyYW5zZm9ybWF0aW9uLW1hdHJpeCc7XG5pbXBvcnQgeyBMYXlvdXQgfSBmcm9tICcuLi9tb2RlbHMvbGF5b3V0Lm1vZGVsJztcbmltcG9ydCB7IExheW91dFNlcnZpY2UgfSBmcm9tICcuL2xheW91dHMvbGF5b3V0LnNlcnZpY2UnO1xuaW1wb3J0IHsgRWRnZSB9IGZyb20gJy4uL21vZGVscy9lZGdlLm1vZGVsJztcbmltcG9ydCB7IE5vZGUsIENsdXN0ZXJOb2RlIH0gZnJvbSAnLi4vbW9kZWxzL25vZGUubW9kZWwnO1xuaW1wb3J0IHsgR3JhcGggfSBmcm9tICcuLi9tb2RlbHMvZ3JhcGgubW9kZWwnO1xuaW1wb3J0IHsgaWQgfSBmcm9tICcuLi91dGlscy9pZCc7XG5pbXBvcnQgeyBQYW5uaW5nQXhpcyB9IGZyb20gJy4uL2VudW1zL3Bhbm5pbmcuZW51bSc7XG5pbXBvcnQgeyBNaW5pTWFwUG9zaXRpb24gfSBmcm9tICcuLi9lbnVtcy9taW5pLW1hcC1wb3NpdGlvbi5lbnVtJztcbmltcG9ydCB7IHRocm90dGxlYWJsZSB9IGZyb20gJy4uL3V0aWxzL3Rocm90dGxlJztcblxuLyoqXG4gKiBNYXRyaXhcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRyaXgge1xuICBhOiBudW1iZXI7XG4gIGI6IG51bWJlcjtcbiAgYzogbnVtYmVyO1xuICBkOiBudW1iZXI7XG4gIGU6IG51bWJlcjtcbiAgZjogbnVtYmVyO1xufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICduZ3gtZ3JhcGgnLFxuICBzdHlsZVVybHM6IFsnLi9ncmFwaC5jb21wb25lbnQuc2NzcyddLFxuICB0ZW1wbGF0ZVVybDogJ2dyYXBoLmNvbXBvbmVudC5odG1sJyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hcbn0pXG5leHBvcnQgY2xhc3MgR3JhcGhDb21wb25lbnQgZXh0ZW5kcyBCYXNlQ2hhcnRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBBZnRlclZpZXdJbml0IHtcbiAgQElucHV0KCkgbGVnZW5kOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIG5vZGVzOiBOb2RlW10gPSBbXTtcbiAgQElucHV0KCkgY2x1c3RlcnM6IENsdXN0ZXJOb2RlW10gPSBbXTtcbiAgQElucHV0KCkgbGlua3M6IEVkZ2VbXSA9IFtdO1xuICBASW5wdXQoKSBhY3RpdmVFbnRyaWVzOiBhbnlbXSA9IFtdO1xuICBASW5wdXQoKSBjdXJ2ZTogYW55O1xuICBASW5wdXQoKSBkcmFnZ2luZ0VuYWJsZWQgPSB0cnVlO1xuICBASW5wdXQoKSBub2RlSGVpZ2h0OiBudW1iZXI7XG4gIEBJbnB1dCgpIG5vZGVNYXhIZWlnaHQ6IG51bWJlcjtcbiAgQElucHV0KCkgbm9kZU1pbkhlaWdodDogbnVtYmVyO1xuICBASW5wdXQoKSBub2RlV2lkdGg6IG51bWJlcjtcbiAgQElucHV0KCkgbm9kZU1pbldpZHRoOiBudW1iZXI7XG4gIEBJbnB1dCgpIG5vZGVNYXhXaWR0aDogbnVtYmVyO1xuICBASW5wdXQoKSBwYW5uaW5nRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHBhbm5pbmdBeGlzOiBQYW5uaW5nQXhpcyA9IFBhbm5pbmdBeGlzLkJvdGg7XG4gIEBJbnB1dCgpIGVuYWJsZVpvb20gPSB0cnVlO1xuICBASW5wdXQoKSB6b29tU3BlZWQgPSAwLjE7XG4gIEBJbnB1dCgpIG1pblpvb21MZXZlbCA9IDAuMTtcbiAgQElucHV0KCkgbWF4Wm9vbUxldmVsID0gNC4wO1xuICBASW5wdXQoKSBhdXRvWm9vbSA9IGZhbHNlO1xuICBASW5wdXQoKSBwYW5Pblpvb20gPSB0cnVlO1xuICBASW5wdXQoKSBhbmltYXRlPyA9IGZhbHNlO1xuICBASW5wdXQoKSBhdXRvQ2VudGVyID0gZmFsc2U7XG4gIEBJbnB1dCgpIHVwZGF0ZSQ6IE9ic2VydmFibGU8YW55PjtcbiAgQElucHV0KCkgY2VudGVyJDogT2JzZXJ2YWJsZTxhbnk+O1xuICBASW5wdXQoKSB6b29tVG9GaXQkOiBPYnNlcnZhYmxlPGFueT47XG4gIEBJbnB1dCgpIHBhblRvTm9kZSQ6IE9ic2VydmFibGU8YW55PjtcbiAgQElucHV0KCkgbGF5b3V0OiBzdHJpbmcgfCBMYXlvdXQ7XG4gIEBJbnB1dCgpIGxheW91dFNldHRpbmdzOiBhbnk7XG4gIEBJbnB1dCgpIGVuYWJsZVRyYWNrcGFkU3VwcG9ydCA9IGZhbHNlO1xuICBASW5wdXQoKSBzaG93TWluaU1hcDogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSBtaW5pTWFwTWF4V2lkdGg6IG51bWJlciA9IDEwMDtcbiAgQElucHV0KCkgbWluaU1hcE1heEhlaWdodDogbnVtYmVyO1xuICBASW5wdXQoKSBtaW5pTWFwUG9zaXRpb246IE1pbmlNYXBQb3NpdGlvbiA9IE1pbmlNYXBQb3NpdGlvbi5VcHBlclJpZ2h0O1xuXG4gIEBPdXRwdXQoKSBhY3RpdmF0ZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBkZWFjdGl2YXRlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIHpvb21DaGFuZ2U6IEV2ZW50RW1pdHRlcjxudW1iZXI+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgY2xpY2tIYW5kbGVyOiBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgQENvbnRlbnRDaGlsZCgnbGlua1RlbXBsYXRlJykgbGlua1RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICBAQ29udGVudENoaWxkKCdub2RlVGVtcGxhdGUnKSBub2RlVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG4gIEBDb250ZW50Q2hpbGQoJ2NsdXN0ZXJUZW1wbGF0ZScpIGNsdXN0ZXJUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcbiAgQENvbnRlbnRDaGlsZCgnZGVmc1RlbXBsYXRlJykgZGVmc1RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICBAQ29udGVudENoaWxkKCdtaW5pTWFwTm9kZVRlbXBsYXRlJykgbWluaU1hcE5vZGVUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcblxuICBAVmlld0NoaWxkKENoYXJ0Q29tcG9uZW50LCB7IHJlYWQ6IEVsZW1lbnRSZWYsIHN0YXRpYzogdHJ1ZSB9KSBjaGFydDogRWxlbWVudFJlZjtcbiAgQFZpZXdDaGlsZHJlbignbm9kZUVsZW1lbnQnKSBub2RlRWxlbWVudHM6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPjtcbiAgQFZpZXdDaGlsZHJlbignbGlua0VsZW1lbnQnKSBsaW5rRWxlbWVudHM6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPjtcblxuICBwcml2YXRlIGlzTW91c2VNb3ZlQ2FsbGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgZ3JhcGhTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcbiAgc3Vic2NyaXB0aW9uczogU3Vic2NyaXB0aW9uW10gPSBbXTtcbiAgY29sb3JzOiBDb2xvckhlbHBlcjtcbiAgZGltczogVmlld0RpbWVuc2lvbnM7XG4gIG1hcmdpbiA9IFswLCAwLCAwLCAwXTtcbiAgcmVzdWx0cyA9IFtdO1xuICBzZXJpZXNEb21haW46IGFueTtcbiAgdHJhbnNmb3JtOiBzdHJpbmc7XG4gIGxlZ2VuZE9wdGlvbnM6IGFueTtcbiAgaXNQYW5uaW5nID0gZmFsc2U7XG4gIGlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgZHJhZ2dpbmdOb2RlOiBOb2RlO1xuICBpbml0aWFsaXplZCA9IGZhbHNlO1xuICBncmFwaDogR3JhcGg7XG4gIGdyYXBoRGltczogYW55ID0geyB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG4gIF9vbGRMaW5rczogRWRnZVtdID0gW107XG4gIG9sZE5vZGVzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcbiAgb2xkQ2x1c3RlcnM6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xuICB0cmFuc2Zvcm1hdGlvbk1hdHJpeDogTWF0cml4ID0gaWRlbnRpdHkoKTtcbiAgX3RvdWNoTGFzdFggPSBudWxsO1xuICBfdG91Y2hMYXN0WSA9IG51bGw7XG4gIG1pbmltYXBTY2FsZUNvZWZmaWNpZW50OiBudW1iZXIgPSAzO1xuICBtaW5pbWFwVHJhbnNmb3JtOiBzdHJpbmc7XG4gIG1pbmltYXBPZmZzZXRYOiBudW1iZXIgPSAwO1xuICBtaW5pbWFwT2Zmc2V0WTogbnVtYmVyID0gMDtcbiAgaXNNaW5pbWFwUGFubmluZyA9IGZhbHNlO1xuICBtaW5pbWFwQ2xpcFBhdGhJZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHVibGljIHpvbmU6IE5nWm9uZSxcbiAgICBwdWJsaWMgY2Q6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgbGF5b3V0U2VydmljZTogTGF5b3V0U2VydmljZVxuICApIHtcbiAgICBzdXBlcihlbCwgem9uZSwgY2QpO1xuICB9XG5cbiAgQElucHV0KClcbiAgZ3JvdXBSZXN1bHRzQnk6IChub2RlOiBhbnkpID0+IHN0cmluZyA9IG5vZGUgPT4gbm9kZS5sYWJlbDtcblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IHpvb20gbGV2ZWxcbiAgICovXG4gIGdldCB6b29tTGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXguYTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGN1cnJlbnQgem9vbSBsZXZlbFxuICAgKi9cbiAgQElucHV0KCd6b29tTGV2ZWwnKVxuICBzZXQgem9vbUxldmVsKGxldmVsKSB7XG4gICAgdGhpcy56b29tVG8oTnVtYmVyKGxldmVsKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGB4YCBwb3NpdGlvbiBvZiB0aGUgZ3JhcGhcbiAgICovXG4gIGdldCBwYW5PZmZzZXRYKCkge1xuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4LmU7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBjdXJyZW50IGB4YCBwb3NpdGlvbiBvZiB0aGUgZ3JhcGhcbiAgICovXG4gIEBJbnB1dCgncGFuT2Zmc2V0WCcpXG4gIHNldCBwYW5PZmZzZXRYKHgpIHtcbiAgICB0aGlzLnBhblRvKE51bWJlcih4KSwgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGB5YCBwb3NpdGlvbiBvZiB0aGUgZ3JhcGhcbiAgICovXG4gIGdldCBwYW5PZmZzZXRZKCkge1xuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4LmY7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBjdXJyZW50IGB5YCBwb3NpdGlvbiBvZiB0aGUgZ3JhcGhcbiAgICovXG4gIEBJbnB1dCgncGFuT2Zmc2V0WScpXG4gIHNldCBwYW5PZmZzZXRZKHkpIHtcbiAgICB0aGlzLnBhblRvKG51bGwsIE51bWJlcih5KSk7XG4gIH1cblxuICAvKipcbiAgICogQW5ndWxhciBsaWZlY3ljbGUgZXZlbnRcbiAgICpcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy51cGRhdGUkKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChcbiAgICAgICAgdGhpcy51cGRhdGUkLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2VudGVyJCkge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnB1c2goXG4gICAgICAgIHRoaXMuY2VudGVyJC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuY2VudGVyKCk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy56b29tVG9GaXQkKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChcbiAgICAgICAgdGhpcy56b29tVG9GaXQkLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy56b29tVG9GaXQoKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucGFuVG9Ob2RlJCkge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnB1c2goXG4gICAgICAgIHRoaXMucGFuVG9Ob2RlJC5zdWJzY3JpYmUoKG5vZGVJZDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgdGhpcy5wYW5Ub05vZGVJZChub2RlSWQpO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLm1pbmltYXBDbGlwUGF0aElkID0gYG1pbmltYXBDbGlwJHtpZCgpfWA7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgY29uc3QgeyBsYXlvdXQsIGxheW91dFNldHRpbmdzLCBub2RlcywgY2x1c3RlcnMsIGxpbmtzIH0gPSBjaGFuZ2VzO1xuICAgIHRoaXMuc2V0TGF5b3V0KHRoaXMubGF5b3V0KTtcbiAgICBpZiAobGF5b3V0U2V0dGluZ3MpIHtcbiAgICAgIHRoaXMuc2V0TGF5b3V0U2V0dGluZ3ModGhpcy5sYXlvdXRTZXR0aW5ncyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICBzZXRMYXlvdXQobGF5b3V0OiBzdHJpbmcgfCBMYXlvdXQpOiB2b2lkIHtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgaWYgKCFsYXlvdXQpIHtcbiAgICAgIGxheW91dCA9ICdkYWdyZSc7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbGF5b3V0ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5sYXlvdXQgPSB0aGlzLmxheW91dFNlcnZpY2UuZ2V0TGF5b3V0KGxheW91dCk7XG4gICAgICB0aGlzLnNldExheW91dFNldHRpbmdzKHRoaXMubGF5b3V0U2V0dGluZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHNldExheW91dFNldHRpbmdzKHNldHRpbmdzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5sYXlvdXQgJiYgdHlwZW9mIHRoaXMubGF5b3V0ICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5sYXlvdXQuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW5ndWxhciBsaWZlY3ljbGUgZXZlbnRcbiAgICpcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIGZvciAoY29uc3Qgc3ViIG9mIHRoaXMuc3Vic2NyaXB0aW9ucykge1xuICAgICAgc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQW5ndWxhciBsaWZlY3ljbGUgZXZlbnRcbiAgICpcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgc3VwZXIubmdBZnRlclZpZXdJbml0KCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZSgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCYXNlIGNsYXNzIHVwZGF0ZSBpbXBsZW1lbnRhdGlvbiBmb3IgdGhlIGRhZyBncmFwaFxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBzdXBlci51cGRhdGUoKTtcbiAgICBpZiAoIXRoaXMuY3VydmUpIHtcbiAgICAgIHRoaXMuY3VydmUgPSBzaGFwZS5jdXJ2ZUJ1bmRsZS5iZXRhKDEpO1xuICAgIH1cblxuICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgdGhpcy5kaW1zID0gY2FsY3VsYXRlVmlld0RpbWVuc2lvbnMoe1xuICAgICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgbWFyZ2luczogdGhpcy5tYXJnaW4sXG4gICAgICAgIHNob3dMZWdlbmQ6IHRoaXMubGVnZW5kXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZXJpZXNEb21haW4gPSB0aGlzLmdldFNlcmllc0RvbWFpbigpO1xuICAgICAgdGhpcy5zZXRDb2xvcnMoKTtcbiAgICAgIHRoaXMubGVnZW5kT3B0aW9ucyA9IHRoaXMuZ2V0TGVnZW5kT3B0aW9ucygpO1xuXG4gICAgICB0aGlzLmNyZWF0ZUdyYXBoKCk7XG4gICAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybSgpO1xuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgZGFncmUgZ3JhcGggZW5naW5lXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgY3JlYXRlR3JhcGgoKTogdm9pZCB7XG4gICAgdGhpcy5ncmFwaFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuZ3JhcGhTdWJzY3JpcHRpb24gPSBuZXcgU3Vic2NyaXB0aW9uKCk7XG4gICAgY29uc3QgaW5pdGlhbGl6ZU5vZGUgPSAobjogTm9kZSkgPT4ge1xuICAgICAgaWYgKCFuLm1ldGEpIHtcbiAgICAgICAgbi5tZXRhID0ge307XG4gICAgICB9XG4gICAgICBpZiAoIW4uaWQpIHtcbiAgICAgICAgbi5pZCA9IGlkKCk7XG4gICAgICB9XG4gICAgICBpZiAoIW4uZGltZW5zaW9uKSB7XG4gICAgICAgIG4uZGltZW5zaW9uID0ge1xuICAgICAgICAgIHdpZHRoOiB0aGlzLm5vZGVXaWR0aCA/IHRoaXMubm9kZVdpZHRoIDogMzAsXG4gICAgICAgICAgaGVpZ2h0OiB0aGlzLm5vZGVIZWlnaHQgPyB0aGlzLm5vZGVIZWlnaHQgOiAzMFxuICAgICAgICB9O1xuICAgICAgICBuLm1ldGEuZm9yY2VEaW1lbnNpb25zID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuLm1ldGEuZm9yY2VEaW1lbnNpb25zID0gbi5tZXRhLmZvcmNlRGltZW5zaW9ucyA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IG4ubWV0YS5mb3JjZURpbWVuc2lvbnM7XG4gICAgICB9XG4gICAgICBuLnBvc2l0aW9uID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgICB9O1xuICAgICAgbi5kYXRhID0gbi5kYXRhID8gbi5kYXRhIDoge307XG4gICAgICByZXR1cm4gbjtcbiAgICB9O1xuXG4gICAgdGhpcy5ncmFwaCA9IHtcbiAgICAgIG5vZGVzOiB0aGlzLm5vZGVzLmxlbmd0aCA+IDAgPyBbLi4udGhpcy5ub2Rlc10ubWFwKGluaXRpYWxpemVOb2RlKSA6IFtdLFxuICAgICAgY2x1c3RlcnM6IHRoaXMuY2x1c3RlcnMgJiYgdGhpcy5jbHVzdGVycy5sZW5ndGggPiAwID8gWy4uLnRoaXMuY2x1c3RlcnNdLm1hcChpbml0aWFsaXplTm9kZSkgOiBbXSxcbiAgICAgIGVkZ2VzOlxuICAgICAgICB0aGlzLmxpbmtzLmxlbmd0aCA+IDBcbiAgICAgICAgICA/IFsuLi50aGlzLmxpbmtzXS5tYXAoZSA9PiB7XG4gICAgICAgICAgICAgIGlmICghZS5pZCkge1xuICAgICAgICAgICAgICAgIGUuaWQgPSBpZCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICA6IFtdXG4gICAgfTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLmRyYXcoKSk7XG4gIH1cblxuICAvKipcbiAgICogRHJhd3MgdGhlIGdyYXBoIHVzaW5nIGRhZ3JlIGxheW91dHNcbiAgICpcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBkcmF3KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5sYXlvdXQgfHwgdHlwZW9mIHRoaXMubGF5b3V0ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBDYWxjIHZpZXcgZGltcyBmb3IgdGhlIG5vZGVzXG4gICAgdGhpcy5hcHBseU5vZGVEaW1lbnNpb25zKCk7XG5cbiAgICAvLyBSZWNhbGMgdGhlIGxheW91dFxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMubGF5b3V0LnJ1bih0aGlzLmdyYXBoKTtcbiAgICBjb25zdCByZXN1bHQkID0gcmVzdWx0IGluc3RhbmNlb2YgT2JzZXJ2YWJsZSA/IHJlc3VsdCA6IG9mKHJlc3VsdCk7XG4gICAgdGhpcy5ncmFwaFN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICByZXN1bHQkLnN1YnNjcmliZShncmFwaCA9PiB7XG4gICAgICAgIHRoaXMuZ3JhcGggPSBncmFwaDtcbiAgICAgICAgdGhpcy50aWNrKCk7XG4gICAgICB9KVxuICAgICk7XG5cbiAgICBpZiAodGhpcy5ncmFwaC5ub2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXN1bHQkLnBpcGUoZmlyc3QoKSkuc3Vic2NyaWJlKCgpID0+IHRoaXMuYXBwbHlOb2RlRGltZW5zaW9ucygpKTtcbiAgfVxuXG4gIHRpY2soKSB7XG4gICAgLy8gVHJhbnNwb3NlcyB2aWV3IG9wdGlvbnMgdG8gdGhlIG5vZGVcbiAgICBjb25zdCBvbGROb2RlczogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XG5cbiAgICB0aGlzLmdyYXBoLm5vZGVzLm1hcChuID0+IHtcbiAgICAgIG4udHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke24ucG9zaXRpb24ueCAtIG4uZGltZW5zaW9uLndpZHRoIC8gMiB8fCAwfSwgJHtcbiAgICAgICAgbi5wb3NpdGlvbi55IC0gbi5kaW1lbnNpb24uaGVpZ2h0IC8gMiB8fCAwXG4gICAgICB9KWA7XG4gICAgICBpZiAoIW4uZGF0YSkge1xuICAgICAgICBuLmRhdGEgPSB7fTtcbiAgICAgIH1cbiAgICAgIG4uZGF0YS5jb2xvciA9IHRoaXMuY29sb3JzLmdldENvbG9yKHRoaXMuZ3JvdXBSZXN1bHRzQnkobikpO1xuICAgICAgb2xkTm9kZXMuYWRkKG4uaWQpO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgb2xkQ2x1c3RlcnM6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xuXG4gICAgKHRoaXMuZ3JhcGguY2x1c3RlcnMgfHwgW10pLm1hcChuID0+IHtcbiAgICAgIG4udHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke24ucG9zaXRpb24ueCAtIG4uZGltZW5zaW9uLndpZHRoIC8gMiB8fCAwfSwgJHtcbiAgICAgICAgbi5wb3NpdGlvbi55IC0gbi5kaW1lbnNpb24uaGVpZ2h0IC8gMiB8fCAwXG4gICAgICB9KWA7XG4gICAgICBpZiAoIW4uZGF0YSkge1xuICAgICAgICBuLmRhdGEgPSB7fTtcbiAgICAgIH1cbiAgICAgIG4uZGF0YS5jb2xvciA9IHRoaXMuY29sb3JzLmdldENvbG9yKHRoaXMuZ3JvdXBSZXN1bHRzQnkobikpO1xuICAgICAgb2xkQ2x1c3RlcnMuYWRkKG4uaWQpO1xuICAgIH0pO1xuXG4gICAgLy8gUHJldmVudCBhbmltYXRpb25zIG9uIG5ldyBub2Rlc1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5vbGROb2RlcyA9IG9sZE5vZGVzO1xuICAgICAgdGhpcy5vbGRDbHVzdGVycyA9IG9sZENsdXN0ZXJzO1xuICAgIH0sIDUwMCk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGxhYmVscyB0byB0aGUgbmV3IHBvc2l0aW9uc1xuICAgIGNvbnN0IG5ld0xpbmtzID0gW107XG4gICAgZm9yIChjb25zdCBlZGdlTGFiZWxJZCBpbiB0aGlzLmdyYXBoLmVkZ2VMYWJlbHMpIHtcbiAgICAgIGNvbnN0IGVkZ2VMYWJlbCA9IHRoaXMuZ3JhcGguZWRnZUxhYmVsc1tlZGdlTGFiZWxJZF07XG5cbiAgICAgIGNvbnN0IG5vcm1LZXkgPSBlZGdlTGFiZWxJZC5yZXBsYWNlKC9bXlxcdy1dKi9nLCAnJyk7XG5cbiAgICAgIGNvbnN0IGlzTXVsdGlncmFwaCA9XG4gICAgICAgIHRoaXMubGF5b3V0ICYmIHR5cGVvZiB0aGlzLmxheW91dCAhPT0gJ3N0cmluZycgJiYgdGhpcy5sYXlvdXQuc2V0dGluZ3MgJiYgdGhpcy5sYXlvdXQuc2V0dGluZ3MubXVsdGlncmFwaDtcblxuICAgICAgbGV0IG9sZExpbmsgPSBpc011bHRpZ3JhcGhcbiAgICAgICAgPyB0aGlzLl9vbGRMaW5rcy5maW5kKG9sID0+IGAke29sLnNvdXJjZX0ke29sLnRhcmdldH0ke29sLmlkfWAgPT09IG5vcm1LZXkpXG4gICAgICAgIDogdGhpcy5fb2xkTGlua3MuZmluZChvbCA9PiBgJHtvbC5zb3VyY2V9JHtvbC50YXJnZXR9YCA9PT0gbm9ybUtleSk7XG5cbiAgICAgIGNvbnN0IGxpbmtGcm9tR3JhcGggPSBpc011bHRpZ3JhcGhcbiAgICAgICAgPyB0aGlzLmdyYXBoLmVkZ2VzLmZpbmQobmwgPT4gYCR7bmwuc291cmNlfSR7bmwudGFyZ2V0fSR7bmwuaWR9YCA9PT0gbm9ybUtleSlcbiAgICAgICAgOiB0aGlzLmdyYXBoLmVkZ2VzLmZpbmQobmwgPT4gYCR7bmwuc291cmNlfSR7bmwudGFyZ2V0fWAgPT09IG5vcm1LZXkpO1xuXG4gICAgICBpZiAoIW9sZExpbmspIHtcbiAgICAgICAgb2xkTGluayA9IGxpbmtGcm9tR3JhcGggfHwgZWRnZUxhYmVsO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgb2xkTGluay5kYXRhICYmXG4gICAgICAgIGxpbmtGcm9tR3JhcGggJiZcbiAgICAgICAgbGlua0Zyb21HcmFwaC5kYXRhICYmXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KG9sZExpbmsuZGF0YSkgIT09IEpTT04uc3RyaW5naWZ5KGxpbmtGcm9tR3JhcGguZGF0YSlcbiAgICAgICkge1xuICAgICAgICAvLyBDb21wYXJlIG9sZCBsaW5rIHRvIG5ldyBsaW5rIGFuZCByZXBsYWNlIGlmIG5vdCBlcXVhbFxuICAgICAgICBvbGRMaW5rLmRhdGEgPSBsaW5rRnJvbUdyYXBoLmRhdGE7XG4gICAgICB9XG5cbiAgICAgIG9sZExpbmsub2xkTGluZSA9IG9sZExpbmsubGluZTtcblxuICAgICAgY29uc3QgcG9pbnRzID0gZWRnZUxhYmVsLnBvaW50cztcbiAgICAgIGNvbnN0IGxpbmUgPSB0aGlzLmdlbmVyYXRlTGluZShwb2ludHMpO1xuXG4gICAgICBjb25zdCBuZXdMaW5rID0gT2JqZWN0LmFzc2lnbih7fSwgb2xkTGluayk7XG4gICAgICBuZXdMaW5rLmxpbmUgPSBsaW5lO1xuICAgICAgbmV3TGluay5wb2ludHMgPSBwb2ludHM7XG5cbiAgICAgIHRoaXMudXBkYXRlTWlkcG9pbnRPbkVkZ2UobmV3TGluaywgcG9pbnRzKTtcblxuICAgICAgY29uc3QgdGV4dFBvcyA9IHBvaW50c1tNYXRoLmZsb29yKHBvaW50cy5sZW5ndGggLyAyKV07XG4gICAgICBpZiAodGV4dFBvcykge1xuICAgICAgICBuZXdMaW5rLnRleHRUcmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7dGV4dFBvcy54IHx8IDB9LCR7dGV4dFBvcy55IHx8IDB9KWA7XG4gICAgICB9XG5cbiAgICAgIG5ld0xpbmsudGV4dEFuZ2xlID0gMDtcbiAgICAgIGlmICghbmV3TGluay5vbGRMaW5lKSB7XG4gICAgICAgIG5ld0xpbmsub2xkTGluZSA9IG5ld0xpbmsubGluZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jYWxjRG9taW5hbnRCYXNlbGluZShuZXdMaW5rKTtcbiAgICAgIG5ld0xpbmtzLnB1c2gobmV3TGluayk7XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaC5lZGdlcyA9IG5ld0xpbmtzO1xuXG4gICAgLy8gTWFwIHRoZSBvbGQgbGlua3MgZm9yIGFuaW1hdGlvbnNcbiAgICBpZiAodGhpcy5ncmFwaC5lZGdlcykge1xuICAgICAgdGhpcy5fb2xkTGlua3MgPSB0aGlzLmdyYXBoLmVkZ2VzLm1hcChsID0+IHtcbiAgICAgICAgY29uc3QgbmV3TCA9IE9iamVjdC5hc3NpZ24oe30sIGwpO1xuICAgICAgICBuZXdMLm9sZExpbmUgPSBsLmxpbmU7XG4gICAgICAgIHJldHVybiBuZXdMO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVNaW5pbWFwKCk7XG5cbiAgICBpZiAodGhpcy5hdXRvWm9vbSkge1xuICAgICAgdGhpcy56b29tVG9GaXQoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hdXRvQ2VudGVyKSB7XG4gICAgICAvLyBBdXRvLWNlbnRlciB3aGVuIHJlbmRlcmluZ1xuICAgICAgdGhpcy5jZW50ZXIoKTtcbiAgICB9XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5yZWRyYXdMaW5lcygpKTtcbiAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgZ2V0TWluaW1hcFRyYW5zZm9ybSgpOiBzdHJpbmcge1xuICAgIHN3aXRjaCAodGhpcy5taW5pTWFwUG9zaXRpb24pIHtcbiAgICAgIGNhc2UgTWluaU1hcFBvc2l0aW9uLlVwcGVyTGVmdDoge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG4gICAgICBjYXNlIE1pbmlNYXBQb3NpdGlvbi5VcHBlclJpZ2h0OiB7XG4gICAgICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyAodGhpcy5kaW1zLndpZHRoIC0gdGhpcy5ncmFwaERpbXMud2lkdGggLyB0aGlzLm1pbmltYXBTY2FsZUNvZWZmaWNpZW50KSArICcsJyArIDAgKyAnKSc7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGVHcmFwaERpbXMoKSB7XG4gICAgbGV0IG1pblggPSArSW5maW5pdHk7XG4gICAgbGV0IG1heFggPSAtSW5maW5pdHk7XG4gICAgbGV0IG1pblkgPSArSW5maW5pdHk7XG4gICAgbGV0IG1heFkgPSAtSW5maW5pdHk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdyYXBoLm5vZGVzW2ldO1xuICAgICAgbWluWCA9IG5vZGUucG9zaXRpb24ueCA8IG1pblggPyBub2RlLnBvc2l0aW9uLnggOiBtaW5YO1xuICAgICAgbWluWSA9IG5vZGUucG9zaXRpb24ueSA8IG1pblkgPyBub2RlLnBvc2l0aW9uLnkgOiBtaW5ZO1xuICAgICAgbWF4WCA9IG5vZGUucG9zaXRpb24ueCArIG5vZGUuZGltZW5zaW9uLndpZHRoID4gbWF4WCA/IG5vZGUucG9zaXRpb24ueCArIG5vZGUuZGltZW5zaW9uLndpZHRoIDogbWF4WDtcbiAgICAgIG1heFkgPSBub2RlLnBvc2l0aW9uLnkgKyBub2RlLmRpbWVuc2lvbi5oZWlnaHQgPiBtYXhZID8gbm9kZS5wb3NpdGlvbi55ICsgbm9kZS5kaW1lbnNpb24uaGVpZ2h0IDogbWF4WTtcbiAgICB9XG4gICAgbWluWCAtPSAxMDA7XG4gICAgbWluWSAtPSAxMDA7XG4gICAgbWF4WCArPSAxMDA7XG4gICAgbWF4WSArPSAxMDA7XG4gICAgdGhpcy5ncmFwaERpbXMud2lkdGggPSBtYXhYIC0gbWluWDtcbiAgICB0aGlzLmdyYXBoRGltcy5oZWlnaHQgPSBtYXhZIC0gbWluWTtcbiAgICB0aGlzLm1pbmltYXBPZmZzZXRYID0gbWluWDtcbiAgICB0aGlzLm1pbmltYXBPZmZzZXRZID0gbWluWTtcbiAgfVxuXG4gIEB0aHJvdHRsZWFibGUoNTAwKVxuICB1cGRhdGVNaW5pbWFwKCkge1xuICAgIGlmICghdGhpcy5zaG93TWluaU1hcCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgaGVpZ2h0L3dpZHRoIHRvdGFsLCBidXQgb25seSBpZiB3ZSBoYXZlIGFueSBub2Rlc1xuICAgIGlmICh0aGlzLmdyYXBoLm5vZGVzICYmIHRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnVwZGF0ZUdyYXBoRGltcygpO1xuXG4gICAgICBpZiAodGhpcy5taW5pTWFwTWF4V2lkdGgpIHtcbiAgICAgICAgdGhpcy5taW5pbWFwU2NhbGVDb2VmZmljaWVudCA9IHRoaXMuZ3JhcGhEaW1zLndpZHRoIC8gdGhpcy5taW5pTWFwTWF4V2lkdGg7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5taW5pTWFwTWF4SGVpZ2h0KSB7XG4gICAgICAgIHRoaXMubWluaW1hcFNjYWxlQ29lZmZpY2llbnQgPSBNYXRoLm1heChcbiAgICAgICAgICB0aGlzLm1pbmltYXBTY2FsZUNvZWZmaWNpZW50LFxuICAgICAgICAgIHRoaXMuZ3JhcGhEaW1zLmhlaWdodCAvIHRoaXMubWluaU1hcE1heEhlaWdodFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm1pbmltYXBUcmFuc2Zvcm0gPSB0aGlzLmdldE1pbmltYXBUcmFuc2Zvcm0oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWVhc3VyZXMgdGhlIG5vZGUgZWxlbWVudCBhbmQgYXBwbGllcyB0aGUgZGltZW5zaW9uc1xuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIGFwcGx5Tm9kZURpbWVuc2lvbnMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubm9kZUVsZW1lbnRzICYmIHRoaXMubm9kZUVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgdGhpcy5ub2RlRWxlbWVudHMubWFwKGVsZW0gPT4ge1xuICAgICAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gZWxlbS5uYXRpdmVFbGVtZW50O1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5ncmFwaC5ub2Rlcy5maW5kKG4gPT4gbi5pZCA9PT0gbmF0aXZlRWxlbWVudC5pZCk7XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgaGVpZ2h0XG4gICAgICAgIGxldCBkaW1zO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGRpbXMgPSBuYXRpdmVFbGVtZW50LmdldEJCb3goKTtcbiAgICAgICAgICBpZiAoIWRpbXMud2lkdGggfHwgIWRpbXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIC8vIFNraXAgZHJhd2luZyBpZiBlbGVtZW50IGlzIG5vdCBkaXNwbGF5ZWQgLSBGaXJlZm94IHdvdWxkIHRocm93IGFuIGVycm9yIGhlcmVcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubm9kZUhlaWdodCkge1xuICAgICAgICAgIG5vZGUuZGltZW5zaW9uLmhlaWdodCA9XG4gICAgICAgICAgICBub2RlLmRpbWVuc2lvbi5oZWlnaHQgJiYgbm9kZS5tZXRhLmZvcmNlRGltZW5zaW9ucyA/IG5vZGUuZGltZW5zaW9uLmhlaWdodCA6IHRoaXMubm9kZUhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBub2RlLmRpbWVuc2lvbi5oZWlnaHQgPVxuICAgICAgICAgICAgbm9kZS5kaW1lbnNpb24uaGVpZ2h0ICYmIG5vZGUubWV0YS5mb3JjZURpbWVuc2lvbnMgPyBub2RlLmRpbWVuc2lvbi5oZWlnaHQgOiBkaW1zLmhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm5vZGVNYXhIZWlnaHQpIHtcbiAgICAgICAgICBub2RlLmRpbWVuc2lvbi5oZWlnaHQgPSBNYXRoLm1heChub2RlLmRpbWVuc2lvbi5oZWlnaHQsIHRoaXMubm9kZU1heEhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubm9kZU1pbkhlaWdodCkge1xuICAgICAgICAgIG5vZGUuZGltZW5zaW9uLmhlaWdodCA9IE1hdGgubWluKG5vZGUuZGltZW5zaW9uLmhlaWdodCwgdGhpcy5ub2RlTWluSGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm5vZGVXaWR0aCkge1xuICAgICAgICAgIG5vZGUuZGltZW5zaW9uLndpZHRoID1cbiAgICAgICAgICAgIG5vZGUuZGltZW5zaW9uLndpZHRoICYmIG5vZGUubWV0YS5mb3JjZURpbWVuc2lvbnMgPyBub2RlLmRpbWVuc2lvbi53aWR0aCA6IHRoaXMubm9kZVdpZHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgd2lkdGhcbiAgICAgICAgICBpZiAobmF0aXZlRWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndGV4dCcpLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IG1heFRleHREaW1zO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCB0ZXh0RWxlbSBvZiBuYXRpdmVFbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0ZXh0JykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50QkJveCA9IHRleHRFbGVtLmdldEJCb3goKTtcbiAgICAgICAgICAgICAgICBpZiAoIW1heFRleHREaW1zKSB7XG4gICAgICAgICAgICAgICAgICBtYXhUZXh0RGltcyA9IGN1cnJlbnRCQm94O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEJCb3gud2lkdGggPiBtYXhUZXh0RGltcy53aWR0aCkge1xuICAgICAgICAgICAgICAgICAgICBtYXhUZXh0RGltcy53aWR0aCA9IGN1cnJlbnRCQm94LndpZHRoO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRCQm94LmhlaWdodCA+IG1heFRleHREaW1zLmhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBtYXhUZXh0RGltcy5oZWlnaHQgPSBjdXJyZW50QkJveC5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAvLyBTa2lwIGRyYXdpbmcgaWYgZWxlbWVudCBpcyBub3QgZGlzcGxheWVkIC0gRmlyZWZveCB3b3VsZCB0aHJvdyBhbiBlcnJvciBoZXJlXG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGUuZGltZW5zaW9uLndpZHRoID1cbiAgICAgICAgICAgICAgbm9kZS5kaW1lbnNpb24ud2lkdGggJiYgbm9kZS5tZXRhLmZvcmNlRGltZW5zaW9ucyA/IG5vZGUuZGltZW5zaW9uLndpZHRoIDogbWF4VGV4dERpbXMud2lkdGggKyAyMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9kZS5kaW1lbnNpb24ud2lkdGggPVxuICAgICAgICAgICAgICBub2RlLmRpbWVuc2lvbi53aWR0aCAmJiBub2RlLm1ldGEuZm9yY2VEaW1lbnNpb25zID8gbm9kZS5kaW1lbnNpb24ud2lkdGggOiBkaW1zLndpZHRoO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm5vZGVNYXhXaWR0aCkge1xuICAgICAgICAgIG5vZGUuZGltZW5zaW9uLndpZHRoID0gTWF0aC5tYXgobm9kZS5kaW1lbnNpb24ud2lkdGgsIHRoaXMubm9kZU1heFdpZHRoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ub2RlTWluV2lkdGgpIHtcbiAgICAgICAgICBub2RlLmRpbWVuc2lvbi53aWR0aCA9IE1hdGgubWluKG5vZGUuZGltZW5zaW9uLndpZHRoLCB0aGlzLm5vZGVNaW5XaWR0aCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWRyYXdzIHRoZSBsaW5lcyB3aGVuIGRyYWdnZWQgb3Igdmlld3BvcnQgdXBkYXRlZFxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIHJlZHJhd0xpbmVzKF9hbmltYXRlID0gdGhpcy5hbmltYXRlKTogdm9pZCB7XG4gICAgdGhpcy5saW5rRWxlbWVudHMubWFwKGxpbmtFbCA9PiB7XG4gICAgICBjb25zdCBlZGdlID0gdGhpcy5ncmFwaC5lZGdlcy5maW5kKGxpbiA9PiBsaW4uaWQgPT09IGxpbmtFbC5uYXRpdmVFbGVtZW50LmlkKTtcblxuICAgICAgaWYgKGVkZ2UpIHtcbiAgICAgICAgY29uc3QgbGlua1NlbGVjdGlvbiA9IHNlbGVjdChsaW5rRWwubmF0aXZlRWxlbWVudCkuc2VsZWN0KCcubGluZScpO1xuICAgICAgICBsaW5rU2VsZWN0aW9uXG4gICAgICAgICAgLmF0dHIoJ2QnLCBlZGdlLm9sZExpbmUpXG4gICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5lYXNlKGVhc2UuZWFzZVNpbkluT3V0KVxuICAgICAgICAgIC5kdXJhdGlvbihfYW5pbWF0ZSA/IDUwMCA6IDApXG4gICAgICAgICAgLmF0dHIoJ2QnLCBlZGdlLmxpbmUpO1xuXG4gICAgICAgIGNvbnN0IHRleHRQYXRoU2VsZWN0aW9uID0gc2VsZWN0KHRoaXMuY2hhcnRFbGVtZW50Lm5hdGl2ZUVsZW1lbnQpLnNlbGVjdChgIyR7ZWRnZS5pZH1gKTtcbiAgICAgICAgdGV4dFBhdGhTZWxlY3Rpb25cbiAgICAgICAgICAuYXR0cignZCcsIGVkZ2Uub2xkVGV4dFBhdGgpXG4gICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5lYXNlKGVhc2UuZWFzZVNpbkluT3V0KVxuICAgICAgICAgIC5kdXJhdGlvbihfYW5pbWF0ZSA/IDUwMCA6IDApXG4gICAgICAgICAgLmF0dHIoJ2QnLCBlZGdlLnRleHRQYXRoKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZU1pZHBvaW50T25FZGdlKGVkZ2UsIGVkZ2UucG9pbnRzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIHRleHQgZGlyZWN0aW9ucyAvIGZsaXBwaW5nXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgY2FsY0RvbWluYW50QmFzZWxpbmUobGluayk6IHZvaWQge1xuICAgIGNvbnN0IGZpcnN0UG9pbnQgPSBsaW5rLnBvaW50c1swXTtcbiAgICBjb25zdCBsYXN0UG9pbnQgPSBsaW5rLnBvaW50c1tsaW5rLnBvaW50cy5sZW5ndGggLSAxXTtcbiAgICBsaW5rLm9sZFRleHRQYXRoID0gbGluay50ZXh0UGF0aDtcblxuICAgIGlmIChsYXN0UG9pbnQueCA8IGZpcnN0UG9pbnQueCkge1xuICAgICAgbGluay5kb21pbmFudEJhc2VsaW5lID0gJ3RleHQtYmVmb3JlLWVkZ2UnO1xuXG4gICAgICAvLyByZXZlcnNlIHRleHQgcGF0aCBmb3Igd2hlbiBpdHMgZmxpcHBlZCB1cHNpZGUgZG93blxuICAgICAgbGluay50ZXh0UGF0aCA9IHRoaXMuZ2VuZXJhdGVMaW5lKFsuLi5saW5rLnBvaW50c10ucmV2ZXJzZSgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGluay5kb21pbmFudEJhc2VsaW5lID0gJ3RleHQtYWZ0ZXItZWRnZSc7XG4gICAgICBsaW5rLnRleHRQYXRoID0gbGluay5saW5lO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSB0aGUgbmV3IGxpbmUgcGF0aFxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIGdlbmVyYXRlTGluZShwb2ludHM6IGFueSk6IGFueSB7XG4gICAgY29uc3QgbGluZUZ1bmN0aW9uID0gc2hhcGVcbiAgICAgIC5saW5lPGFueT4oKVxuICAgICAgLngoZCA9PiBkLngpXG4gICAgICAueShkID0+IGQueSlcbiAgICAgIC5jdXJ2ZSh0aGlzLmN1cnZlKTtcbiAgICByZXR1cm4gbGluZUZ1bmN0aW9uKHBvaW50cyk7XG4gIH1cblxuICAvKipcbiAgICogWm9vbSB3YXMgaW52b2tlZCBmcm9tIGV2ZW50XG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgb25ab29tKCRldmVudDogV2hlZWxFdmVudCwgZGlyZWN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZW5hYmxlVHJhY2twYWRTdXBwb3J0ICYmICEkZXZlbnQuY3RybEtleSkge1xuICAgICAgdGhpcy5wYW4oJGV2ZW50LmRlbHRhWCAqIC0xLCAkZXZlbnQuZGVsdGFZICogLTEpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHpvb21GYWN0b3IgPSAxICsgKGRpcmVjdGlvbiA9PT0gJ2luJyA/IHRoaXMuem9vbVNwZWVkIDogLXRoaXMuem9vbVNwZWVkKTtcblxuICAgIC8vIENoZWNrIHRoYXQgem9vbWluZyB3b3VsZG4ndCBwdXQgdXMgb3V0IG9mIGJvdW5kc1xuICAgIGNvbnN0IG5ld1pvb21MZXZlbCA9IHRoaXMuem9vbUxldmVsICogem9vbUZhY3RvcjtcbiAgICBpZiAobmV3Wm9vbUxldmVsIDw9IHRoaXMubWluWm9vbUxldmVsIHx8IG5ld1pvb21MZXZlbCA+PSB0aGlzLm1heFpvb21MZXZlbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIHpvb21pbmcgaXMgZW5hYmxlZCBvciBub3RcbiAgICBpZiAoIXRoaXMuZW5hYmxlWm9vbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnBhbk9uWm9vbSA9PT0gdHJ1ZSAmJiAkZXZlbnQpIHtcbiAgICAgIC8vIEFic29sdXRlIG1vdXNlIFgvWSBvbiB0aGUgc2NyZWVuXG4gICAgICBjb25zdCBtb3VzZVggPSAkZXZlbnQuY2xpZW50WDtcbiAgICAgIGNvbnN0IG1vdXNlWSA9ICRldmVudC5jbGllbnRZO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gdGhlIG1vdXNlIFgvWSBpbnRvIGEgU1ZHIFgvWVxuICAgICAgY29uc3Qgc3ZnID0gdGhpcy5jaGFydC5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3N2ZycpO1xuICAgICAgY29uc3Qgc3ZnR3JvdXAgPSBzdmcucXVlcnlTZWxlY3RvcignZy5jaGFydCcpO1xuXG4gICAgICBjb25zdCBwb2ludCA9IHN2Zy5jcmVhdGVTVkdQb2ludCgpO1xuICAgICAgcG9pbnQueCA9IG1vdXNlWDtcbiAgICAgIHBvaW50LnkgPSBtb3VzZVk7XG4gICAgICBjb25zdCBzdmdQb2ludCA9IHBvaW50Lm1hdHJpeFRyYW5zZm9ybShzdmdHcm91cC5nZXRTY3JlZW5DVE0oKS5pbnZlcnNlKCkpO1xuXG4gICAgICAvLyBQYW56b29tXG4gICAgICB0aGlzLnBhbihzdmdQb2ludC54LCBzdmdQb2ludC55LCB0cnVlKTtcbiAgICAgIHRoaXMuem9vbSh6b29tRmFjdG9yKTtcbiAgICAgIHRoaXMucGFuKC1zdmdQb2ludC54LCAtc3ZnUG9pbnQueSwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuem9vbSh6b29tRmFjdG9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGFuIGJ5IHgveVxuICAgKlxuICAgKiBAcGFyYW0geFxuICAgKiBAcGFyYW0geVxuICAgKi9cbiAgcGFuKHg6IG51bWJlciwgeTogbnVtYmVyLCBpZ25vcmVab29tTGV2ZWw6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgIGNvbnN0IHpvb21MZXZlbCA9IGlnbm9yZVpvb21MZXZlbCA/IDEgOiB0aGlzLnpvb21MZXZlbDtcbiAgICB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4ID0gdHJhbnNmb3JtKHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXgsIHRyYW5zbGF0ZSh4IC8gem9vbUxldmVsLCB5IC8gem9vbUxldmVsKSk7XG5cbiAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhbiB0byBhIGZpeGVkIHgveVxuICAgKlxuICAgKi9cbiAgcGFuVG8oeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAoeCA9PT0gbnVsbCB8fCB4ID09PSB1bmRlZmluZWQgfHwgaXNOYU4oeCkgfHwgeSA9PT0gbnVsbCB8fCB5ID09PSB1bmRlZmluZWQgfHwgaXNOYU4oeSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYW5YID0gLXRoaXMucGFuT2Zmc2V0WCAtIHggKiB0aGlzLnpvb21MZXZlbCArIHRoaXMuZGltcy53aWR0aCAvIDI7XG4gICAgY29uc3QgcGFuWSA9IC10aGlzLnBhbk9mZnNldFkgLSB5ICogdGhpcy56b29tTGV2ZWwgKyB0aGlzLmRpbXMuaGVpZ2h0IC8gMjtcblxuICAgIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXggPSB0cmFuc2Zvcm0oXG4gICAgICB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4LFxuICAgICAgdHJhbnNsYXRlKHBhblggLyB0aGlzLnpvb21MZXZlbCwgcGFuWSAvIHRoaXMuem9vbUxldmVsKVxuICAgICk7XG5cbiAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFpvb20gYnkgYSBmYWN0b3JcbiAgICpcbiAgICovXG4gIHpvb20oZmFjdG9yOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4ID0gdHJhbnNmb3JtKHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXgsIHNjYWxlKGZhY3RvciwgZmFjdG9yKSk7XG4gICAgdGhpcy56b29tQ2hhbmdlLmVtaXQodGhpcy56b29tTGV2ZWwpO1xuICAgIHRoaXMudXBkYXRlVHJhbnNmb3JtKCk7XG4gIH1cblxuICAvKipcbiAgICogWm9vbSB0byBhIGZpeGVkIGxldmVsXG4gICAqXG4gICAqL1xuICB6b29tVG8obGV2ZWw6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXguYSA9IGlzTmFOKGxldmVsKSA/IHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXguYSA6IE51bWJlcihsZXZlbCk7XG4gICAgdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeC5kID0gaXNOYU4obGV2ZWwpID8gdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeC5kIDogTnVtYmVyKGxldmVsKTtcbiAgICB0aGlzLnpvb21DaGFuZ2UuZW1pdCh0aGlzLnpvb21MZXZlbCk7XG4gICAgdGhpcy51cGRhdGVUcmFuc2Zvcm0oKTtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIERyYWcgd2FzIGludm9rZWQgZnJvbSBhbiBldmVudFxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIG9uRHJhZyhldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5kcmFnZ2luZ0VuYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuZHJhZ2dpbmdOb2RlO1xuICAgIGlmICh0aGlzLmxheW91dCAmJiB0eXBlb2YgdGhpcy5sYXlvdXQgIT09ICdzdHJpbmcnICYmIHRoaXMubGF5b3V0Lm9uRHJhZykge1xuICAgICAgdGhpcy5sYXlvdXQub25EcmFnKG5vZGUsIGV2ZW50KTtcbiAgICB9XG5cbiAgICBub2RlLnBvc2l0aW9uLnggKz0gZXZlbnQubW92ZW1lbnRYIC8gdGhpcy56b29tTGV2ZWw7XG4gICAgbm9kZS5wb3NpdGlvbi55ICs9IGV2ZW50Lm1vdmVtZW50WSAvIHRoaXMuem9vbUxldmVsO1xuXG4gICAgLy8gbW92ZSB0aGUgbm9kZVxuICAgIGNvbnN0IHggPSBub2RlLnBvc2l0aW9uLnggLSBub2RlLmRpbWVuc2lvbi53aWR0aCAvIDI7XG4gICAgY29uc3QgeSA9IG5vZGUucG9zaXRpb24ueSAtIG5vZGUuZGltZW5zaW9uLmhlaWdodCAvIDI7XG4gICAgbm9kZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYDtcblxuICAgIGZvciAoY29uc3QgbGluayBvZiB0aGlzLmdyYXBoLmVkZ2VzKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGxpbmsudGFyZ2V0ID09PSBub2RlLmlkIHx8XG4gICAgICAgIGxpbmsuc291cmNlID09PSBub2RlLmlkIHx8XG4gICAgICAgIChsaW5rLnRhcmdldCBhcyBhbnkpLmlkID09PSBub2RlLmlkIHx8XG4gICAgICAgIChsaW5rLnNvdXJjZSBhcyBhbnkpLmlkID09PSBub2RlLmlkXG4gICAgICApIHtcbiAgICAgICAgaWYgKHRoaXMubGF5b3V0ICYmIHR5cGVvZiB0aGlzLmxheW91dCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLmxheW91dC51cGRhdGVFZGdlKHRoaXMuZ3JhcGgsIGxpbmspO1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCQgPSByZXN1bHQgaW5zdGFuY2VvZiBPYnNlcnZhYmxlID8gcmVzdWx0IDogb2YocmVzdWx0KTtcbiAgICAgICAgICB0aGlzLmdyYXBoU3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgICAgIHJlc3VsdCQuc3Vic2NyaWJlKGdyYXBoID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5ncmFwaCA9IGdyYXBoO1xuICAgICAgICAgICAgICB0aGlzLnJlZHJhd0VkZ2UobGluayk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJlZHJhd0xpbmVzKGZhbHNlKTtcbiAgICB0aGlzLnVwZGF0ZU1pbmltYXAoKTtcbiAgfVxuXG4gIHJlZHJhd0VkZ2UoZWRnZTogRWRnZSkge1xuICAgIGNvbnN0IGxpbmUgPSB0aGlzLmdlbmVyYXRlTGluZShlZGdlLnBvaW50cyk7XG4gICAgdGhpcy5jYWxjRG9taW5hbnRCYXNlbGluZShlZGdlKTtcbiAgICBlZGdlLm9sZExpbmUgPSBlZGdlLmxpbmU7XG4gICAgZWRnZS5saW5lID0gbGluZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGVudGlyZSB2aWV3IGZvciB0aGUgbmV3IHBhbiBwb3NpdGlvblxuICAgKlxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIHVwZGF0ZVRyYW5zZm9ybSgpOiB2b2lkIHtcbiAgICB0aGlzLnRyYW5zZm9ybSA9IHRvU1ZHKHNtb290aE1hdHJpeCh0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4LCAxMDApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb2RlIHdhcyBjbGlja2VkXG4gICAqXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgb25DbGljayhldmVudDogYW55KTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3QuZW1pdChldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogTm9kZSB3YXMgZm9jdXNlZFxuICAgKlxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIG9uQWN0aXZhdGUoZXZlbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5hY3RpdmVFbnRyaWVzLmluZGV4T2YoZXZlbnQpID4gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5hY3RpdmVFbnRyaWVzID0gW2V2ZW50LCAuLi50aGlzLmFjdGl2ZUVudHJpZXNdO1xuICAgIHRoaXMuYWN0aXZhdGUuZW1pdCh7IHZhbHVlOiBldmVudCwgZW50cmllczogdGhpcy5hY3RpdmVFbnRyaWVzIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vZGUgd2FzIGRlZm9jdXNlZFxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIG9uRGVhY3RpdmF0ZShldmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuYWN0aXZlRW50cmllcy5pbmRleE9mKGV2ZW50KTtcblxuICAgIHRoaXMuYWN0aXZlRW50cmllcy5zcGxpY2UoaWR4LCAxKTtcbiAgICB0aGlzLmFjdGl2ZUVudHJpZXMgPSBbLi4udGhpcy5hY3RpdmVFbnRyaWVzXTtcblxuICAgIHRoaXMuZGVhY3RpdmF0ZS5lbWl0KHsgdmFsdWU6IGV2ZW50LCBlbnRyaWVzOiB0aGlzLmFjdGl2ZUVudHJpZXMgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBkb21haW4gc2VyaWVzIGZvciB0aGUgbm9kZXNcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBnZXRTZXJpZXNEb21haW4oKTogYW55W10ge1xuICAgIHJldHVybiB0aGlzLm5vZGVzXG4gICAgICAubWFwKGQgPT4gdGhpcy5ncm91cFJlc3VsdHNCeShkKSlcbiAgICAgIC5yZWR1Y2UoKG5vZGVzOiBzdHJpbmdbXSwgbm9kZSk6IGFueVtdID0+IChub2Rlcy5pbmRleE9mKG5vZGUpICE9PSAtMSA/IG5vZGVzIDogbm9kZXMuY29uY2F0KFtub2RlXSkpLCBbXSlcbiAgICAgIC5zb3J0KCk7XG4gIH1cblxuICAvKipcbiAgICogVHJhY2tpbmcgZm9yIHRoZSBsaW5rXG4gICAqXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgdHJhY2tMaW5rQnkoaW5kZXg6IG51bWJlciwgbGluazogRWRnZSk6IGFueSB7XG4gICAgcmV0dXJuIGxpbmsuaWQ7XG4gIH1cblxuICAvKipcbiAgICogVHJhY2tpbmcgZm9yIHRoZSBub2RlXG4gICAqXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgdHJhY2tOb2RlQnkoaW5kZXg6IG51bWJlciwgbm9kZTogTm9kZSk6IGFueSB7XG4gICAgcmV0dXJuIG5vZGUuaWQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY29sb3JzIHRoZSBub2Rlc1xuICAgKlxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIHNldENvbG9ycygpOiB2b2lkIHtcbiAgICB0aGlzLmNvbG9ycyA9IG5ldyBDb2xvckhlbHBlcih0aGlzLnNjaGVtZSwgJ29yZGluYWwnLCB0aGlzLnNlcmllc0RvbWFpbiwgdGhpcy5jdXN0b21Db2xvcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGxlZ2VuZCBvcHRpb25zXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgZ2V0TGVnZW5kT3B0aW9ucygpOiBhbnkge1xuICAgIHJldHVybiB7XG4gICAgICBzY2FsZVR5cGU6ICdvcmRpbmFsJyxcbiAgICAgIGRvbWFpbjogdGhpcy5zZXJpZXNEb21haW4sXG4gICAgICBjb2xvcnM6IHRoaXMuY29sb3JzXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBtb3VzZSBtb3ZlIGV2ZW50LCB1c2VkIGZvciBwYW5uaW5nIGFuZCBkcmFnZ2luZy5cbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDptb3VzZW1vdmUnLCBbJyRldmVudCddKVxuICBvbk1vdXNlTW92ZSgkZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLmlzTW91c2VNb3ZlQ2FsbGVkID0gdHJ1ZTtcbiAgICBpZiAoKHRoaXMuaXNQYW5uaW5nIHx8IHRoaXMuaXNNaW5pbWFwUGFubmluZykgJiYgdGhpcy5wYW5uaW5nRW5hYmxlZCkge1xuICAgICAgdGhpcy5wYW5XaXRoQ29uc3RyYWludHModGhpcy5wYW5uaW5nQXhpcywgJGV2ZW50KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNEcmFnZ2luZyAmJiB0aGlzLmRyYWdnaW5nRW5hYmxlZCkge1xuICAgICAgdGhpcy5vbkRyYWcoJGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDptb3VzZWRvd24nLCBbJyRldmVudCddKVxuICBvbk1vdXNlRG93bihldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuaXNNb3VzZU1vdmVDYWxsZWQgPSBmYWxzZTtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OmNsaWNrJywgWyckZXZlbnQnXSlcbiAgZ3JhcGhDbGljayhldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pc01vdXNlTW92ZUNhbGxlZCkgdGhpcy5jbGlja0hhbmRsZXIuZW1pdChldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogT24gdG91Y2ggc3RhcnQgZXZlbnQgdG8gZW5hYmxlIHBhbm5pbmcuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgb25Ub3VjaFN0YXJ0KGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLl90b3VjaExhc3RYID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICB0aGlzLl90b3VjaExhc3RZID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WTtcblxuICAgIHRoaXMuaXNQYW5uaW5nID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiB0b3VjaCBtb3ZlIGV2ZW50LCB1c2VkIGZvciBwYW5uaW5nLlxuICAgKlxuICAgKi9cbiAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6dG91Y2htb3ZlJywgWyckZXZlbnQnXSlcbiAgb25Ub3VjaE1vdmUoJGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc1Bhbm5pbmcgJiYgdGhpcy5wYW5uaW5nRW5hYmxlZCkge1xuICAgICAgY29uc3QgY2xpZW50WCA9ICRldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgY29uc3QgY2xpZW50WSA9ICRldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZO1xuICAgICAgY29uc3QgbW92ZW1lbnRYID0gY2xpZW50WCAtIHRoaXMuX3RvdWNoTGFzdFg7XG4gICAgICBjb25zdCBtb3ZlbWVudFkgPSBjbGllbnRZIC0gdGhpcy5fdG91Y2hMYXN0WTtcbiAgICAgIHRoaXMuX3RvdWNoTGFzdFggPSBjbGllbnRYO1xuICAgICAgdGhpcy5fdG91Y2hMYXN0WSA9IGNsaWVudFk7XG5cbiAgICAgIHRoaXMucGFuKG1vdmVtZW50WCwgbW92ZW1lbnRZKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT24gdG91Y2ggZW5kIGV2ZW50IHRvIGRpc2FibGUgcGFubmluZy5cbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBvblRvdWNoRW5kKGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLmlzUGFubmluZyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIE9uIG1vdXNlIHVwIGV2ZW50IHRvIGRpc2FibGUgcGFubmluZy9kcmFnZ2luZy5cbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDptb3VzZXVwJywgWyckZXZlbnQnXSlcbiAgb25Nb3VzZVVwKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgdGhpcy5pc1Bhbm5pbmcgPSBmYWxzZTtcbiAgICB0aGlzLmlzTWluaW1hcFBhbm5pbmcgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5sYXlvdXQgJiYgdHlwZW9mIHRoaXMubGF5b3V0ICE9PSAnc3RyaW5nJyAmJiB0aGlzLmxheW91dC5vbkRyYWdFbmQpIHtcbiAgICAgIHRoaXMubGF5b3V0Lm9uRHJhZ0VuZCh0aGlzLmRyYWdnaW5nTm9kZSwgZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBub2RlIG1vdXNlIGRvd24gdG8ga2ljayBvZmYgZHJhZ2dpbmdcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBvbk5vZGVNb3VzZURvd24oZXZlbnQ6IE1vdXNlRXZlbnQsIG5vZGU6IGFueSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5kcmFnZ2luZ0VuYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICB0aGlzLmRyYWdnaW5nTm9kZSA9IG5vZGU7XG5cbiAgICBpZiAodGhpcy5sYXlvdXQgJiYgdHlwZW9mIHRoaXMubGF5b3V0ICE9PSAnc3RyaW5nJyAmJiB0aGlzLmxheW91dC5vbkRyYWdTdGFydCkge1xuICAgICAgdGhpcy5sYXlvdXQub25EcmFnU3RhcnQobm9kZSwgZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBtaW5pbWFwIGRyYWcgbW91c2UgZG93biB0byBraWNrIG9mZiBtaW5pbWFwIHBhbm5pbmdcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBvbk1pbmltYXBEcmFnTW91c2VEb3duKCk6IHZvaWQge1xuICAgIHRoaXMuaXNNaW5pbWFwUGFubmluZyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogT24gbWluaW1hcCBwYW4gZXZlbnQuIFBhbnMgdGhlIGdyYXBoIHRvIHRoZSBjbGlja2VkIHBvc2l0aW9uXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgb25NaW5pbWFwUGFuVG8oZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBsZXQgeCA9XG4gICAgICBldmVudC5vZmZzZXRYIC0gKHRoaXMuZGltcy53aWR0aCAtICh0aGlzLmdyYXBoRGltcy53aWR0aCArIHRoaXMubWluaW1hcE9mZnNldFgpIC8gdGhpcy5taW5pbWFwU2NhbGVDb2VmZmljaWVudCk7XG4gICAgbGV0IHkgPSBldmVudC5vZmZzZXRZICsgdGhpcy5taW5pbWFwT2Zmc2V0WSAvIHRoaXMubWluaW1hcFNjYWxlQ29lZmZpY2llbnQ7XG5cbiAgICB0aGlzLnBhblRvKHggKiB0aGlzLm1pbmltYXBTY2FsZUNvZWZmaWNpZW50LCB5ICogdGhpcy5taW5pbWFwU2NhbGVDb2VmZmljaWVudCk7XG4gICAgdGhpcy5pc01pbmltYXBQYW5uaW5nID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDZW50ZXIgdGhlIGdyYXBoIGluIHRoZSB2aWV3cG9ydFxuICAgKi9cbiAgY2VudGVyKCk6IHZvaWQge1xuICAgIHRoaXMucGFuVG8odGhpcy5ncmFwaERpbXMud2lkdGggLyAyLCB0aGlzLmdyYXBoRGltcy5oZWlnaHQgLyAyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBab29tcyB0byBmaXQgdGhlIGVudGllciBncmFwaFxuICAgKi9cbiAgem9vbVRvRml0KCk6IHZvaWQge1xuICAgIGNvbnN0IGhlaWdodFpvb20gPSB0aGlzLmRpbXMuaGVpZ2h0IC8gdGhpcy5ncmFwaERpbXMuaGVpZ2h0O1xuICAgIGNvbnN0IHdpZHRoWm9vbSA9IHRoaXMuZGltcy53aWR0aCAvIHRoaXMuZ3JhcGhEaW1zLndpZHRoO1xuICAgIGxldCB6b29tTGV2ZWwgPSBNYXRoLm1pbihoZWlnaHRab29tLCB3aWR0aFpvb20sIDEpO1xuXG4gICAgaWYgKHpvb21MZXZlbCA8IHRoaXMubWluWm9vbUxldmVsKSB7XG4gICAgICB6b29tTGV2ZWwgPSB0aGlzLm1pblpvb21MZXZlbDtcbiAgICB9XG5cbiAgICBpZiAoem9vbUxldmVsID4gdGhpcy5tYXhab29tTGV2ZWwpIHtcbiAgICAgIHpvb21MZXZlbCA9IHRoaXMubWF4Wm9vbUxldmVsO1xuICAgIH1cblxuICAgIGlmICh6b29tTGV2ZWwgIT09IHRoaXMuem9vbUxldmVsKSB7XG4gICAgICB0aGlzLnpvb21MZXZlbCA9IHpvb21MZXZlbDtcbiAgICAgIHRoaXMudXBkYXRlVHJhbnNmb3JtKCk7XG4gICAgICB0aGlzLnpvb21DaGFuZ2UuZW1pdCh0aGlzLnpvb21MZXZlbCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBhbnMgdG8gdGhlIG5vZGVcbiAgICogQHBhcmFtIG5vZGVJZFxuICAgKi9cbiAgcGFuVG9Ob2RlSWQobm9kZUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5ncmFwaC5ub2Rlcy5maW5kKG4gPT4gbi5pZCA9PT0gbm9kZUlkKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnBhblRvKG5vZGUucG9zaXRpb24ueCwgbm9kZS5wb3NpdGlvbi55KTtcbiAgfVxuXG4gIHByaXZhdGUgcGFuV2l0aENvbnN0cmFpbnRzKGtleTogc3RyaW5nLCBldmVudDogTW91c2VFdmVudCkge1xuICAgIGxldCB4ID0gZXZlbnQubW92ZW1lbnRYO1xuICAgIGxldCB5ID0gZXZlbnQubW92ZW1lbnRZO1xuICAgIGlmICh0aGlzLmlzTWluaW1hcFBhbm5pbmcpIHtcbiAgICAgIHggPSAtdGhpcy5taW5pbWFwU2NhbGVDb2VmZmljaWVudCAqIHggKiB0aGlzLnpvb21MZXZlbDtcbiAgICAgIHkgPSAtdGhpcy5taW5pbWFwU2NhbGVDb2VmZmljaWVudCAqIHkgKiB0aGlzLnpvb21MZXZlbDtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgY2FzZSBQYW5uaW5nQXhpcy5Ib3Jpem9udGFsOlxuICAgICAgICB0aGlzLnBhbih4LCAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFBhbm5pbmdBeGlzLlZlcnRpY2FsOlxuICAgICAgICB0aGlzLnBhbigwLCB5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLnBhbih4LCB5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVNaWRwb2ludE9uRWRnZShlZGdlOiBFZGdlLCBwb2ludHM6IGFueSk6IHZvaWQge1xuICAgIGlmICghZWRnZSB8fCAhcG9pbnRzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHBvaW50cy5sZW5ndGggJSAyID09PSAxKSB7XG4gICAgICBlZGdlLm1pZFBvaW50ID0gcG9pbnRzW01hdGguZmxvb3IocG9pbnRzLmxlbmd0aCAvIDIpXTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgX2ZpcnN0ID0gcG9pbnRzW3BvaW50cy5sZW5ndGggLyAyXTtcbiAgICAgIGNvbnN0IF9zZWNvbmQgPSBwb2ludHNbcG9pbnRzLmxlbmd0aCAvIDIgLSAxXTtcbiAgICAgIGVkZ2UubWlkUG9pbnQgPSB7XG4gICAgICAgIHg6IChfZmlyc3QueCArIF9zZWNvbmQueCkgLyAyLFxuICAgICAgICB5OiAoX2ZpcnN0LnkgKyBfc2Vjb25kLnkpIC8gMlxuICAgICAgfTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==