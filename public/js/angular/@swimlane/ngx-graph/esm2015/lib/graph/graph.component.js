import { __decorate, __metadata } from "tslib";
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
let GraphComponent = class GraphComponent extends BaseChartComponent {
    constructor(el, zone, cd, layoutService) {
        super(el, zone, cd);
        this.el = el;
        this.zone = zone;
        this.cd = cd;
        this.layoutService = layoutService;
        this.legend = false;
        this.nodes = [];
        this.clusters = [];
        this.links = [];
        this.activeEntries = [];
        this.draggingEnabled = true;
        this.panningEnabled = true;
        this.panningAxis = PanningAxis.Both;
        this.enableZoom = true;
        this.zoomSpeed = 0.1;
        this.minZoomLevel = 0.1;
        this.maxZoomLevel = 4.0;
        this.autoZoom = false;
        this.panOnZoom = true;
        this.animate = false;
        this.autoCenter = false;
        this.enableTrackpadSupport = false;
        this.showMiniMap = false;
        this.miniMapMaxWidth = 100;
        this.miniMapPosition = MiniMapPosition.UpperRight;
        this.activate = new EventEmitter();
        this.deactivate = new EventEmitter();
        this.zoomChange = new EventEmitter();
        this.clickHandler = new EventEmitter();
        this.isMouseMoveCalled = false;
        this.graphSubscription = new Subscription();
        this.subscriptions = [];
        this.margin = [0, 0, 0, 0];
        this.results = [];
        this.isPanning = false;
        this.isDragging = false;
        this.initialized = false;
        this.graphDims = { width: 0, height: 0 };
        this._oldLinks = [];
        this.oldNodes = new Set();
        this.oldClusters = new Set();
        this.transformationMatrix = identity();
        this._touchLastX = null;
        this._touchLastY = null;
        this.minimapScaleCoefficient = 3;
        this.minimapOffsetX = 0;
        this.minimapOffsetY = 0;
        this.isMinimapPanning = false;
        this.groupResultsBy = node => node.label;
    }
    /**
     * Get the current zoom level
     */
    get zoomLevel() {
        return this.transformationMatrix.a;
    }
    /**
     * Set the current zoom level
     */
    set zoomLevel(level) {
        this.zoomTo(Number(level));
    }
    /**
     * Get the current `x` position of the graph
     */
    get panOffsetX() {
        return this.transformationMatrix.e;
    }
    /**
     * Set the current `x` position of the graph
     */
    set panOffsetX(x) {
        this.panTo(Number(x), null);
    }
    /**
     * Get the current `y` position of the graph
     */
    get panOffsetY() {
        return this.transformationMatrix.f;
    }
    /**
     * Set the current `y` position of the graph
     */
    set panOffsetY(y) {
        this.panTo(null, Number(y));
    }
    /**
     * Angular lifecycle event
     *
     *
     * @memberOf GraphComponent
     */
    ngOnInit() {
        if (this.update$) {
            this.subscriptions.push(this.update$.subscribe(() => {
                this.update();
            }));
        }
        if (this.center$) {
            this.subscriptions.push(this.center$.subscribe(() => {
                this.center();
            }));
        }
        if (this.zoomToFit$) {
            this.subscriptions.push(this.zoomToFit$.subscribe(() => {
                this.zoomToFit();
            }));
        }
        if (this.panToNode$) {
            this.subscriptions.push(this.panToNode$.subscribe((nodeId) => {
                this.panToNodeId(nodeId);
            }));
        }
        this.minimapClipPathId = `minimapClip${id()}`;
    }
    ngOnChanges(changes) {
        const { layout, layoutSettings, nodes, clusters, links } = changes;
        this.setLayout(this.layout);
        if (layoutSettings) {
            this.setLayoutSettings(this.layoutSettings);
        }
        this.update();
    }
    setLayout(layout) {
        this.initialized = false;
        if (!layout) {
            layout = 'dagre';
        }
        if (typeof layout === 'string') {
            this.layout = this.layoutService.getLayout(layout);
            this.setLayoutSettings(this.layoutSettings);
        }
    }
    setLayoutSettings(settings) {
        if (this.layout && typeof this.layout !== 'string') {
            this.layout.settings = settings;
        }
    }
    /**
     * Angular lifecycle event
     *
     *
     * @memberOf GraphComponent
     */
    ngOnDestroy() {
        super.ngOnDestroy();
        for (const sub of this.subscriptions) {
            sub.unsubscribe();
        }
        this.subscriptions = null;
    }
    /**
     * Angular lifecycle event
     *
     *
     * @memberOf GraphComponent
     */
    ngAfterViewInit() {
        super.ngAfterViewInit();
        setTimeout(() => this.update());
    }
    /**
     * Base class update implementation for the dag graph
     *
     * @memberOf GraphComponent
     */
    update() {
        super.update();
        if (!this.curve) {
            this.curve = shape.curveBundle.beta(1);
        }
        this.zone.run(() => {
            this.dims = calculateViewDimensions({
                width: this.width,
                height: this.height,
                margins: this.margin,
                showLegend: this.legend
            });
            this.seriesDomain = this.getSeriesDomain();
            this.setColors();
            this.legendOptions = this.getLegendOptions();
            this.createGraph();
            this.updateTransform();
            this.initialized = true;
        });
    }
    /**
     * Creates the dagre graph engine
     *
     * @memberOf GraphComponent
     */
    createGraph() {
        this.graphSubscription.unsubscribe();
        this.graphSubscription = new Subscription();
        const initializeNode = (n) => {
            if (!n.meta) {
                n.meta = {};
            }
            if (!n.id) {
                n.id = id();
            }
            if (!n.dimension) {
                n.dimension = {
                    width: this.nodeWidth ? this.nodeWidth : 30,
                    height: this.nodeHeight ? this.nodeHeight : 30
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
            nodes: this.nodes.length > 0 ? [...this.nodes].map(initializeNode) : [],
            clusters: this.clusters && this.clusters.length > 0 ? [...this.clusters].map(initializeNode) : [],
            edges: this.links.length > 0
                ? [...this.links].map(e => {
                    if (!e.id) {
                        e.id = id();
                    }
                    return e;
                })
                : []
        };
        requestAnimationFrame(() => this.draw());
    }
    /**
     * Draws the graph using dagre layouts
     *
     *
     * @memberOf GraphComponent
     */
    draw() {
        if (!this.layout || typeof this.layout === 'string') {
            return;
        }
        // Calc view dims for the nodes
        this.applyNodeDimensions();
        // Recalc the layout
        const result = this.layout.run(this.graph);
        const result$ = result instanceof Observable ? result : of(result);
        this.graphSubscription.add(result$.subscribe(graph => {
            this.graph = graph;
            this.tick();
        }));
        if (this.graph.nodes.length === 0) {
            return;
        }
        result$.pipe(first()).subscribe(() => this.applyNodeDimensions());
    }
    tick() {
        // Transposes view options to the node
        const oldNodes = new Set();
        this.graph.nodes.map(n => {
            n.transform = `translate(${n.position.x - n.dimension.width / 2 || 0}, ${n.position.y - n.dimension.height / 2 || 0})`;
            if (!n.data) {
                n.data = {};
            }
            n.data.color = this.colors.getColor(this.groupResultsBy(n));
            oldNodes.add(n.id);
        });
        const oldClusters = new Set();
        (this.graph.clusters || []).map(n => {
            n.transform = `translate(${n.position.x - n.dimension.width / 2 || 0}, ${n.position.y - n.dimension.height / 2 || 0})`;
            if (!n.data) {
                n.data = {};
            }
            n.data.color = this.colors.getColor(this.groupResultsBy(n));
            oldClusters.add(n.id);
        });
        // Prevent animations on new nodes
        setTimeout(() => {
            this.oldNodes = oldNodes;
            this.oldClusters = oldClusters;
        }, 500);
        // Update the labels to the new positions
        const newLinks = [];
        for (const edgeLabelId in this.graph.edgeLabels) {
            const edgeLabel = this.graph.edgeLabels[edgeLabelId];
            const normKey = edgeLabelId.replace(/[^\w-]*/g, '');
            const isMultigraph = this.layout && typeof this.layout !== 'string' && this.layout.settings && this.layout.settings.multigraph;
            let oldLink = isMultigraph
                ? this._oldLinks.find(ol => `${ol.source}${ol.target}${ol.id}` === normKey)
                : this._oldLinks.find(ol => `${ol.source}${ol.target}` === normKey);
            const linkFromGraph = isMultigraph
                ? this.graph.edges.find(nl => `${nl.source}${nl.target}${nl.id}` === normKey)
                : this.graph.edges.find(nl => `${nl.source}${nl.target}` === normKey);
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
            const points = edgeLabel.points;
            const line = this.generateLine(points);
            const newLink = Object.assign({}, oldLink);
            newLink.line = line;
            newLink.points = points;
            this.updateMidpointOnEdge(newLink, points);
            const textPos = points[Math.floor(points.length / 2)];
            if (textPos) {
                newLink.textTransform = `translate(${textPos.x || 0},${textPos.y || 0})`;
            }
            newLink.textAngle = 0;
            if (!newLink.oldLine) {
                newLink.oldLine = newLink.line;
            }
            this.calcDominantBaseline(newLink);
            newLinks.push(newLink);
        }
        this.graph.edges = newLinks;
        // Map the old links for animations
        if (this.graph.edges) {
            this._oldLinks = this.graph.edges.map(l => {
                const newL = Object.assign({}, l);
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
        requestAnimationFrame(() => this.redrawLines());
        this.cd.markForCheck();
    }
    getMinimapTransform() {
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
    }
    updateGraphDims() {
        let minX = +Infinity;
        let maxX = -Infinity;
        let minY = +Infinity;
        let maxY = -Infinity;
        for (let i = 0; i < this.graph.nodes.length; i++) {
            const node = this.graph.nodes[i];
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
    }
    updateMinimap() {
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
    }
    /**
     * Measures the node element and applies the dimensions
     *
     * @memberOf GraphComponent
     */
    applyNodeDimensions() {
        if (this.nodeElements && this.nodeElements.length) {
            this.nodeElements.map(elem => {
                const nativeElement = elem.nativeElement;
                const node = this.graph.nodes.find(n => n.id === nativeElement.id);
                if (!node) {
                    return;
                }
                // calculate the height
                let dims;
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
                if (this.nodeHeight) {
                    node.dimension.height =
                        node.dimension.height && node.meta.forceDimensions ? node.dimension.height : this.nodeHeight;
                }
                else {
                    node.dimension.height =
                        node.dimension.height && node.meta.forceDimensions ? node.dimension.height : dims.height;
                }
                if (this.nodeMaxHeight) {
                    node.dimension.height = Math.max(node.dimension.height, this.nodeMaxHeight);
                }
                if (this.nodeMinHeight) {
                    node.dimension.height = Math.min(node.dimension.height, this.nodeMinHeight);
                }
                if (this.nodeWidth) {
                    node.dimension.width =
                        node.dimension.width && node.meta.forceDimensions ? node.dimension.width : this.nodeWidth;
                }
                else {
                    // calculate the width
                    if (nativeElement.getElementsByTagName('text').length) {
                        let maxTextDims;
                        try {
                            for (const textElem of nativeElement.getElementsByTagName('text')) {
                                const currentBBox = textElem.getBBox();
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
                if (this.nodeMaxWidth) {
                    node.dimension.width = Math.max(node.dimension.width, this.nodeMaxWidth);
                }
                if (this.nodeMinWidth) {
                    node.dimension.width = Math.min(node.dimension.width, this.nodeMinWidth);
                }
            });
        }
    }
    /**
     * Redraws the lines when dragged or viewport updated
     *
     * @memberOf GraphComponent
     */
    redrawLines(_animate = this.animate) {
        this.linkElements.map(linkEl => {
            const edge = this.graph.edges.find(lin => lin.id === linkEl.nativeElement.id);
            if (edge) {
                const linkSelection = select(linkEl.nativeElement).select('.line');
                linkSelection
                    .attr('d', edge.oldLine)
                    .transition()
                    .ease(ease.easeSinInOut)
                    .duration(_animate ? 500 : 0)
                    .attr('d', edge.line);
                const textPathSelection = select(this.chartElement.nativeElement).select(`#${edge.id}`);
                textPathSelection
                    .attr('d', edge.oldTextPath)
                    .transition()
                    .ease(ease.easeSinInOut)
                    .duration(_animate ? 500 : 0)
                    .attr('d', edge.textPath);
                this.updateMidpointOnEdge(edge, edge.points);
            }
        });
    }
    /**
     * Calculate the text directions / flipping
     *
     * @memberOf GraphComponent
     */
    calcDominantBaseline(link) {
        const firstPoint = link.points[0];
        const lastPoint = link.points[link.points.length - 1];
        link.oldTextPath = link.textPath;
        if (lastPoint.x < firstPoint.x) {
            link.dominantBaseline = 'text-before-edge';
            // reverse text path for when its flipped upside down
            link.textPath = this.generateLine([...link.points].reverse());
        }
        else {
            link.dominantBaseline = 'text-after-edge';
            link.textPath = link.line;
        }
    }
    /**
     * Generate the new line path
     *
     * @memberOf GraphComponent
     */
    generateLine(points) {
        const lineFunction = shape
            .line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(this.curve);
        return lineFunction(points);
    }
    /**
     * Zoom was invoked from event
     *
     * @memberOf GraphComponent
     */
    onZoom($event, direction) {
        if (this.enableTrackpadSupport && !$event.ctrlKey) {
            this.pan($event.deltaX * -1, $event.deltaY * -1);
            return;
        }
        const zoomFactor = 1 + (direction === 'in' ? this.zoomSpeed : -this.zoomSpeed);
        // Check that zooming wouldn't put us out of bounds
        const newZoomLevel = this.zoomLevel * zoomFactor;
        if (newZoomLevel <= this.minZoomLevel || newZoomLevel >= this.maxZoomLevel) {
            return;
        }
        // Check if zooming is enabled or not
        if (!this.enableZoom) {
            return;
        }
        if (this.panOnZoom === true && $event) {
            // Absolute mouse X/Y on the screen
            const mouseX = $event.clientX;
            const mouseY = $event.clientY;
            // Transform the mouse X/Y into a SVG X/Y
            const svg = this.chart.nativeElement.querySelector('svg');
            const svgGroup = svg.querySelector('g.chart');
            const point = svg.createSVGPoint();
            point.x = mouseX;
            point.y = mouseY;
            const svgPoint = point.matrixTransform(svgGroup.getScreenCTM().inverse());
            // Panzoom
            this.pan(svgPoint.x, svgPoint.y, true);
            this.zoom(zoomFactor);
            this.pan(-svgPoint.x, -svgPoint.y, true);
        }
        else {
            this.zoom(zoomFactor);
        }
    }
    /**
     * Pan by x/y
     *
     * @param x
     * @param y
     */
    pan(x, y, ignoreZoomLevel = false) {
        const zoomLevel = ignoreZoomLevel ? 1 : this.zoomLevel;
        this.transformationMatrix = transform(this.transformationMatrix, translate(x / zoomLevel, y / zoomLevel));
        this.updateTransform();
    }
    /**
     * Pan to a fixed x/y
     *
     */
    panTo(x, y) {
        if (x === null || x === undefined || isNaN(x) || y === null || y === undefined || isNaN(y)) {
            return;
        }
        const panX = -this.panOffsetX - x * this.zoomLevel + this.dims.width / 2;
        const panY = -this.panOffsetY - y * this.zoomLevel + this.dims.height / 2;
        this.transformationMatrix = transform(this.transformationMatrix, translate(panX / this.zoomLevel, panY / this.zoomLevel));
        this.updateTransform();
    }
    /**
     * Zoom by a factor
     *
     */
    zoom(factor) {
        this.transformationMatrix = transform(this.transformationMatrix, scale(factor, factor));
        this.zoomChange.emit(this.zoomLevel);
        this.updateTransform();
    }
    /**
     * Zoom to a fixed level
     *
     */
    zoomTo(level) {
        this.transformationMatrix.a = isNaN(level) ? this.transformationMatrix.a : Number(level);
        this.transformationMatrix.d = isNaN(level) ? this.transformationMatrix.d : Number(level);
        this.zoomChange.emit(this.zoomLevel);
        this.updateTransform();
        this.update();
    }
    /**
     * Drag was invoked from an event
     *
     * @memberOf GraphComponent
     */
    onDrag(event) {
        if (!this.draggingEnabled) {
            return;
        }
        const node = this.draggingNode;
        if (this.layout && typeof this.layout !== 'string' && this.layout.onDrag) {
            this.layout.onDrag(node, event);
        }
        node.position.x += event.movementX / this.zoomLevel;
        node.position.y += event.movementY / this.zoomLevel;
        // move the node
        const x = node.position.x - node.dimension.width / 2;
        const y = node.position.y - node.dimension.height / 2;
        node.transform = `translate(${x}, ${y})`;
        for (const link of this.graph.edges) {
            if (link.target === node.id ||
                link.source === node.id ||
                link.target.id === node.id ||
                link.source.id === node.id) {
                if (this.layout && typeof this.layout !== 'string') {
                    const result = this.layout.updateEdge(this.graph, link);
                    const result$ = result instanceof Observable ? result : of(result);
                    this.graphSubscription.add(result$.subscribe(graph => {
                        this.graph = graph;
                        this.redrawEdge(link);
                    }));
                }
            }
        }
        this.redrawLines(false);
        this.updateMinimap();
    }
    redrawEdge(edge) {
        const line = this.generateLine(edge.points);
        this.calcDominantBaseline(edge);
        edge.oldLine = edge.line;
        edge.line = line;
    }
    /**
     * Update the entire view for the new pan position
     *
     *
     * @memberOf GraphComponent
     */
    updateTransform() {
        this.transform = toSVG(smoothMatrix(this.transformationMatrix, 100));
    }
    /**
     * Node was clicked
     *
     *
     * @memberOf GraphComponent
     */
    onClick(event) {
        this.select.emit(event);
    }
    /**
     * Node was focused
     *
     *
     * @memberOf GraphComponent
     */
    onActivate(event) {
        if (this.activeEntries.indexOf(event) > -1) {
            return;
        }
        this.activeEntries = [event, ...this.activeEntries];
        this.activate.emit({ value: event, entries: this.activeEntries });
    }
    /**
     * Node was defocused
     *
     * @memberOf GraphComponent
     */
    onDeactivate(event) {
        const idx = this.activeEntries.indexOf(event);
        this.activeEntries.splice(idx, 1);
        this.activeEntries = [...this.activeEntries];
        this.deactivate.emit({ value: event, entries: this.activeEntries });
    }
    /**
     * Get the domain series for the nodes
     *
     * @memberOf GraphComponent
     */
    getSeriesDomain() {
        return this.nodes
            .map(d => this.groupResultsBy(d))
            .reduce((nodes, node) => (nodes.indexOf(node) !== -1 ? nodes : nodes.concat([node])), [])
            .sort();
    }
    /**
     * Tracking for the link
     *
     *
     * @memberOf GraphComponent
     */
    trackLinkBy(index, link) {
        return link.id;
    }
    /**
     * Tracking for the node
     *
     *
     * @memberOf GraphComponent
     */
    trackNodeBy(index, node) {
        return node.id;
    }
    /**
     * Sets the colors the nodes
     *
     *
     * @memberOf GraphComponent
     */
    setColors() {
        this.colors = new ColorHelper(this.scheme, 'ordinal', this.seriesDomain, this.customColors);
    }
    /**
     * Gets the legend options
     *
     * @memberOf GraphComponent
     */
    getLegendOptions() {
        return {
            scaleType: 'ordinal',
            domain: this.seriesDomain,
            colors: this.colors
        };
    }
    /**
     * On mouse move event, used for panning and dragging.
     *
     * @memberOf GraphComponent
     */
    onMouseMove($event) {
        this.isMouseMoveCalled = true;
        if ((this.isPanning || this.isMinimapPanning) && this.panningEnabled) {
            this.panWithConstraints(this.panningAxis, $event);
        }
        else if (this.isDragging && this.draggingEnabled) {
            this.onDrag($event);
        }
    }
    onMouseDown(event) {
        this.isMouseMoveCalled = false;
    }
    graphClick(event) {
        if (!this.isMouseMoveCalled)
            this.clickHandler.emit(event);
    }
    /**
     * On touch start event to enable panning.
     *
     * @memberOf GraphComponent
     */
    onTouchStart(event) {
        this._touchLastX = event.changedTouches[0].clientX;
        this._touchLastY = event.changedTouches[0].clientY;
        this.isPanning = true;
    }
    /**
     * On touch move event, used for panning.
     *
     */
    onTouchMove($event) {
        if (this.isPanning && this.panningEnabled) {
            const clientX = $event.changedTouches[0].clientX;
            const clientY = $event.changedTouches[0].clientY;
            const movementX = clientX - this._touchLastX;
            const movementY = clientY - this._touchLastY;
            this._touchLastX = clientX;
            this._touchLastY = clientY;
            this.pan(movementX, movementY);
        }
    }
    /**
     * On touch end event to disable panning.
     *
     * @memberOf GraphComponent
     */
    onTouchEnd(event) {
        this.isPanning = false;
    }
    /**
     * On mouse up event to disable panning/dragging.
     *
     * @memberOf GraphComponent
     */
    onMouseUp(event) {
        this.isDragging = false;
        this.isPanning = false;
        this.isMinimapPanning = false;
        if (this.layout && typeof this.layout !== 'string' && this.layout.onDragEnd) {
            this.layout.onDragEnd(this.draggingNode, event);
        }
    }
    /**
     * On node mouse down to kick off dragging
     *
     * @memberOf GraphComponent
     */
    onNodeMouseDown(event, node) {
        if (!this.draggingEnabled) {
            return;
        }
        this.isDragging = true;
        this.draggingNode = node;
        if (this.layout && typeof this.layout !== 'string' && this.layout.onDragStart) {
            this.layout.onDragStart(node, event);
        }
    }
    /**
     * On minimap drag mouse down to kick off minimap panning
     *
     * @memberOf GraphComponent
     */
    onMinimapDragMouseDown() {
        this.isMinimapPanning = true;
    }
    /**
     * On minimap pan event. Pans the graph to the clicked position
     *
     * @memberOf GraphComponent
     */
    onMinimapPanTo(event) {
        let x = event.offsetX - (this.dims.width - (this.graphDims.width + this.minimapOffsetX) / this.minimapScaleCoefficient);
        let y = event.offsetY + this.minimapOffsetY / this.minimapScaleCoefficient;
        this.panTo(x * this.minimapScaleCoefficient, y * this.minimapScaleCoefficient);
        this.isMinimapPanning = true;
    }
    /**
     * Center the graph in the viewport
     */
    center() {
        this.panTo(this.graphDims.width / 2, this.graphDims.height / 2);
    }
    /**
     * Zooms to fit the entier graph
     */
    zoomToFit() {
        const heightZoom = this.dims.height / this.graphDims.height;
        const widthZoom = this.dims.width / this.graphDims.width;
        let zoomLevel = Math.min(heightZoom, widthZoom, 1);
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
    }
    /**
     * Pans to the node
     * @param nodeId
     */
    panToNodeId(nodeId) {
        const node = this.graph.nodes.find(n => n.id === nodeId);
        if (!node) {
            return;
        }
        this.panTo(node.position.x, node.position.y);
    }
    panWithConstraints(key, event) {
        let x = event.movementX;
        let y = event.movementY;
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
    }
    updateMidpointOnEdge(edge, points) {
        if (!edge || !points) {
            return;
        }
        if (points.length % 2 === 1) {
            edge.midPoint = points[Math.floor(points.length / 2)];
        }
        else {
            const _first = points[points.length / 2];
            const _second = points[points.length / 2 - 1];
            edge.midPoint = {
                x: (_first.x + _second.x) / 2,
                y: (_first.y + _second.y) / 2
            };
        }
    }
};
GraphComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: NgZone },
    { type: ChangeDetectorRef },
    { type: LayoutService }
];
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
export { GraphComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JhcGguY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHN3aW1sYW5lL25neC1ncmFwaC8iLCJzb3VyY2VzIjpbImxpYi9ncmFwaC9ncmFwaC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUVBLE9BQU8sRUFDTCxhQUFhLEVBQ2IsdUJBQXVCLEVBQ3ZCLFNBQVMsRUFDVCxZQUFZLEVBQ1osVUFBVSxFQUNWLFlBQVksRUFDWixZQUFZLEVBQ1osS0FBSyxFQUNMLFNBQVMsRUFDVCxNQUFNLEVBQ04sTUFBTSxFQUNOLFNBQVMsRUFDVCxXQUFXLEVBQ1gsU0FBUyxFQUNULFlBQVksRUFDWixpQkFBaUIsRUFDakIsTUFBTSxFQUNOLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsYUFBYSxFQUNkLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFDTCxrQkFBa0IsRUFDbEIsY0FBYyxFQUNkLFdBQVcsRUFFWCx1QkFBdUIsRUFDeEIsTUFBTSxzQkFBc0IsQ0FBQztBQUM5QixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQ3RDLE9BQU8sS0FBSyxLQUFLLE1BQU0sVUFBVSxDQUFDO0FBQ2xDLE9BQU8sS0FBSyxJQUFJLE1BQU0sU0FBUyxDQUFDO0FBQ2hDLE9BQU8sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNwRCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkMsT0FBTyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFbkcsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBSXpELE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDakMsT0FBTyxFQUFFLFdB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QixFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7O3FDQUMzQixVQUFVOztpREFPN0I7QUFHRDtJQURDLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztxQ0FDNUIsVUFBVTs7aURBRTVCO0FBR0Q7SUFEQyxZQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7cUNBQ3pCLFVBQVU7O2dEQUUzQjtBQW1CRDtJQURDLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7O2lEQVk5QztBQWlCRDtJQURDLFlBQVksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDOztxQ0FDNUIsVUFBVTs7K0NBTzFCO0FBdCtCVSxjQUFjO0lBUDFCLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxXQUFXO1FBRXJCLDBoTUFBbUM7UUFDbkMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7UUFDckMsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07O0tBQ2hELENBQUM7cUNBbUZjLFVBQVU7UUFDVCxNQUFNO1FBQ1IsaUJBQWlCO1FBQ0wsYUFBYTtHQXJGM0IsY0FBYyxDQWdtQzFCO1NBaG1DWSxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiLy8gcmVuYW1lIHRyYW5zaXRpb24gZHVlIHRvIGNvbmZsaWN0IHdpdGggZDMgdHJhbnNpdGlvblxuaW1wb3J0IHsgYW5pbWF0ZSwgc3R5bGUsIHRyYW5zaXRpb24gYXMgbmdUcmFuc2l0aW9uLCB0cmlnZ2VyIH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XG5pbXBvcnQge1xuICBBZnRlclZpZXdJbml0LFxuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ29tcG9uZW50LFxuICBDb250ZW50Q2hpbGQsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSG9zdExpc3RlbmVyLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgUXVlcnlMaXN0LFxuICBUZW1wbGF0ZVJlZixcbiAgVmlld0NoaWxkLFxuICBWaWV3Q2hpbGRyZW4sXG4gIFZpZXdFbmNhcHN1bGF0aW9uLFxuICBOZ1pvbmUsXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBPbkNoYW5nZXMsXG4gIFNpbXBsZUNoYW5nZXNcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBCYXNlQ2hhcnRDb21wb25lbnQsXG4gIENoYXJ0Q29tcG9uZW50LFxuICBDb2xvckhlbHBlcixcbiAgVmlld0RpbWVuc2lvbnMsXG4gIGNhbGN1bGF0ZVZpZXdEaW1lbnNpb25zXG59IGZyb20gJ0Bzd2ltbGFuZS9uZ3gtY2hhcnRzJztcbmltcG9ydCB7IHNlbGVjdCB9IGZyb20gJ2QzLXNlbGVjdGlvbic7XG5pbXBvcnQgKiBhcyBzaGFwZSBmcm9tICdkMy1zaGFwZSc7XG5pbXBvcnQgKiBhcyBlYXNlIGZyb20gJ2QzLWVhc2UnO1xuaW1wb3J0ICdkMy10cmFuc2l0aW9uJztcbmltcG9ydCB7IE9ic2VydmFibGUsIFN1YnNjcmlwdGlvbiwgb2YgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IGZpcnN0IH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHsgaWRlbnRpdHksIHNjYWxlLCBzbW9vdGhNYXRyaXgsIHRvU1ZHLCB0cmFuc2Zvcm0sIHRyYW5zbGF0ZSB9IGZyb20gJ3RyYW5zZm9ybWF0aW9uLW1hdHJpeCc7XG5pbXBvcnQgeyBMYXlvdXQgfSBmcm9tICcuLi9tb2RlbHMvbGF5b3V0Lm1vZGVsJztcbmltcG9ydCB7IExheW91dFNlcnZpY2UgfSBmcm9tICcuL2xheW91dHMvbGF5b3V0LnNlcnZpY2UnO1xuaW1wb3J0IHsgRWRnZSB9IGZyb20gJy4uL21vZGVscy9lZGdlLm1vZGVsJztcbmltcG9ydCB7IE5vZGUsIENsdXN0ZXJOb2RlIH0gZnJvbSAnLi4vbW9kZWxzL25vZGUubW9kZWwnO1xuaW1wb3J0IHsgR3JhcGggfSBmcm9tICcuLi9tb2RlbHMvZ3JhcGgubW9kZWwnO1xuaW1wb3J0IHsgaWQgfSBmcm9tICcuLi91dGlscy9pZCc7XG5pbXBvcnQgeyBQYW5uaW5nQXhpcyB9IGZyb20gJy4uL2VudW1zL3Bhbm5pbmcuZW51bSc7XG5pbXBvcnQgeyBNaW5pTWFwUG9zaXRpb24gfSBmcm9tICcuLi9lbnVtcy9taW5pLW1hcC1wb3NpdGlvbi5lbnVtJztcbmltcG9ydCB7IHRocm90dGxlYWJsZSB9IGZyb20gJy4uL3V0aWxzL3Rocm90dGxlJztcblxuLyoqXG4gKiBNYXRyaXhcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBNYXRyaXgge1xuICBhOiBudW1iZXI7XG4gIGI6IG51bWJlcjtcbiAgYzogbnVtYmVyO1xuICBkOiBudW1iZXI7XG4gIGU6IG51bWJlcjtcbiAgZjogbnVtYmVyO1xufVxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICduZ3gtZ3JhcGgnLFxuICBzdHlsZVVybHM6IFsnLi9ncmFwaC5jb21wb25lbnQuc2NzcyddLFxuICB0ZW1wbGF0ZVVybDogJ2dyYXBoLmNvbXBvbmVudC5odG1sJyxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbiAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2hcbn0pXG5leHBvcnQgY2xhc3MgR3JhcGhDb21wb25lbnQgZXh0ZW5kcyBCYXNlQ2hhcnRDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBBZnRlclZpZXdJbml0IHtcbiAgQElucHV0KCkgbGVnZW5kOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIG5vZGVzOiBOb2RlW10gPSBbXTtcbiAgQElucHV0KCkgY2x1c3RlcnM6IENsdXN0ZXJOb2RlW10gPSBbXTtcbiAgQElucHV0KCkgbGlua3M6IEVkZ2VbXSA9IFtdO1xuICBASW5wdXQoKSBhY3RpdmVFbnRyaWVzOiBhbnlbXSA9IFtdO1xuICBASW5wdXQoKSBjdXJ2ZTogYW55O1xuICBASW5wdXQoKSBkcmFnZ2luZ0VuYWJsZWQgPSB0cnVlO1xuICBASW5wdXQoKSBub2RlSGVpZ2h0OiBudW1iZXI7XG4gIEBJbnB1dCgpIG5vZGVNYXhIZWlnaHQ6IG51bWJlcjtcbiAgQElucHV0KCkgbm9kZU1pbkhlaWdodDogbnVtYmVyO1xuICBASW5wdXQoKSBub2RlV2lkdGg6IG51bWJlcjtcbiAgQElucHV0KCkgbm9kZU1pbldpZHRoOiBudW1iZXI7XG4gIEBJbnB1dCgpIG5vZGVNYXhXaWR0aDogbnVtYmVyO1xuICBASW5wdXQoKSBwYW5uaW5nRW5hYmxlZDogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIHBhbm5pbmdBeGlzOiBQYW5uaW5nQXhpcyA9IFBhbm5pbmdBeGlzLkJvdGg7XG4gIEBJbnB1dCgpIGVuYWJsZVpvb20gPSB0cnVlO1xuICBASW5wdXQoKSB6b29tU3BlZWQgPSAwLjE7XG4gIEBJbnB1dCgpIG1pblpvb21MZXZlbCA9IDAuMTtcbiAgQElucHV0KCkgbWF4Wm9vbUxldmVsID0gNC4wO1xuICBASW5wdXQoKSBhdXRvWm9vbSA9IGZhbHNlO1xuICBASW5wdXQoKSBwYW5Pblpvb20gPSB0cnVlO1xuICBASW5wdXQoKSBhbmltYXRlPyA9IGZhbHNlO1xuICBASW5wdXQoKSBhdXRvQ2VudGVyID0gZmFsc2U7XG4gIEBJbnB1dCgpIHVwZGF0ZSQ6IE9ic2VydmFibGU8YW55PjtcbiAgQElucHV0KCkgY2VudGVyJDogT2JzZXJ2YWJsZTxhbnk+O1xuICBASW5wdXQoKSB6b29tVG9GaXQkOiBPYnNlcnZhYmxlPGFueT47XG4gIEBJbnB1dCgpIHBhblRvTm9kZSQ6IE9ic2VydmFibGU8YW55PjtcbiAgQElucHV0KCkgbGF5b3V0OiBzdHJpbmcgfCBMYXlvdXQ7XG4gIEBJbnB1dCgpIGxheW91dFNldHRpbmdzOiBhbnk7XG4gIEBJbnB1dCgpIGVuYWJsZVRyYWNrcGFkU3VwcG9ydCA9IGZhbHNlO1xuICBASW5wdXQoKSBzaG93TWluaU1hcDogYm9vbGVhbiA9IGZhbHNlO1xuICBASW5wdXQoKSBtaW5pTWFwTWF4V2lkdGg6IG51bWJlciA9IDEwMDtcbiAgQElucHV0KCkgbWluaU1hcE1heEhlaWdodDogbnVtYmVyO1xuICBASW5wdXQoKSBtaW5pTWFwUG9zaXRpb246IE1pbmlNYXBQb3NpdGlvbiA9IE1pbmlNYXBQb3NpdGlvbi5VcHBlclJpZ2h0O1xuXG4gIEBPdXRwdXQoKSBhY3RpdmF0ZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBkZWFjdGl2YXRlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgQE91dHB1dCgpIHpvb21DaGFuZ2U6IEV2ZW50RW1pdHRlcjxudW1iZXI+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgY2xpY2tIYW5kbGVyOiBFdmVudEVtaXR0ZXI8TW91c2VFdmVudD4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG5cbiAgQENvbnRlbnRDaGlsZCgnbGlua1RlbXBsYXRlJykgbGlua1RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICBAQ29udGVudENoaWxkKCdub2RlVGVtcGxhdGUnKSBub2RlVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG4gIEBDb250ZW50Q2hpbGQoJ2NsdXN0ZXJUZW1wbGF0ZScpIGNsdXN0ZXJUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcbiAgQENvbnRlbnRDaGlsZCgnZGVmc1RlbXBsYXRlJykgZGVmc1RlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICBAQ29udGVudENoaWxkKCdtaW5pTWFwTm9kZVRlbXBsYXRlJykgbWluaU1hcE5vZGVUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcblxuICBAVmlld0NoaWxkKENoYXJ0Q29tcG9uZW50LCB7IHJlYWQ6IEVsZW1lbnRSZWYsIHN0YXRpYzogdHJ1ZSB9KSBjaGFydDogRWxlbWVudFJlZjtcbiAgQFZpZXdDaGlsZHJlbignbm9kZUVsZW1lbnQnKSBub2RlRWxlbWVudHM6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPjtcbiAgQFZpZXdDaGlsZHJlbignbGlua0VsZW1lbnQnKSBsaW5rRWxlbWVudHM6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPjtcblxuICBwcml2YXRlIGlzTW91c2VNb3ZlQ2FsbGVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgZ3JhcGhTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbiA9IG5ldyBTdWJzY3JpcHRpb24oKTtcbiAgc3Vic2NyaXB0aW9uczogU3Vic2NyaXB0aW9uW10gPSBbXTtcbiAgY29sb3JzOiBDb2xvckhlbHBlcjtcbiAgZGltczogVmlld0RpbWVuc2lvbnM7XG4gIG1hcmdpbiA9IFswLCAwLCAwLCAwXTtcbiAgcmVzdWx0cyA9IFtdO1xuICBzZXJpZXNEb21haW46IGFueTtcbiAgdHJhbnNmb3JtOiBzdHJpbmc7XG4gIGxlZ2VuZE9wdGlvbnM6IGFueTtcbiAgaXNQYW5uaW5nID0gZmFsc2U7XG4gIGlzRHJhZ2dpbmcgPSBmYWxzZTtcbiAgZHJhZ2dpbmdOb2RlOiBOb2RlO1xuICBpbml0aWFsaXplZCA9IGZhbHNlO1xuICBncmFwaDogR3JhcGg7XG4gIGdyYXBoRGltczogYW55ID0geyB3aWR0aDogMCwgaGVpZ2h0OiAwIH07XG4gIF9vbGRMaW5rczogRWRnZVtdID0gW107XG4gIG9sZE5vZGVzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcbiAgb2xkQ2x1c3RlcnM6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xuICB0cmFuc2Zvcm1hdGlvbk1hdHJpeDogTWF0cml4ID0gaWRlbnRpdHkoKTtcbiAgX3RvdWNoTGFzdFggPSBudWxsO1xuICBfdG91Y2hMYXN0WSA9IG51bGw7XG4gIG1pbmltYXBTY2FsZUNvZWZmaWNpZW50OiBudW1iZXIgPSAzO1xuICBtaW5pbWFwVHJhbnNmb3JtOiBzdHJpbmc7XG4gIG1pbmltYXBPZmZzZXRYOiBudW1iZXIgPSAwO1xuICBtaW5pbWFwT2Zmc2V0WTogbnVtYmVyID0gMDtcbiAgaXNNaW5pbWFwUGFubmluZyA9IGZhbHNlO1xuICBtaW5pbWFwQ2xpcFBhdGhJZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZWw6IEVsZW1lbnRSZWYsXG4gICAgcHVibGljIHpvbmU6IE5nWm9uZSxcbiAgICBwdWJsaWMgY2Q6IENoYW5nZURldGVjdG9yUmVmLFxuICAgIHByaXZhdGUgbGF5b3V0U2VydmljZTogTGF5b3V0U2VydmljZVxuICApIHtcbiAgICBzdXBlcihlbCwgem9uZSwgY2QpO1xuICB9XG5cbiAgQElucHV0KClcbiAgZ3JvdXBSZXN1bHRzQnk6IChub2RlOiBhbnkpID0+IHN0cmluZyA9IG5vZGUgPT4gbm9kZS5sYWJlbDtcblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IHpvb20gbGV2ZWxcbiAgICovXG4gIGdldCB6b29tTGV2ZWwoKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXguYTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGN1cnJlbnQgem9vbSBsZXZlbFxuICAgKi9cbiAgQElucHV0KCd6b29tTGV2ZWwnKVxuICBzZXQgem9vbUxldmVsKGxldmVsKSB7XG4gICAgdGhpcy56b29tVG8oTnVtYmVyKGxldmVsKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGB4YCBwb3NpdGlvbiBvZiB0aGUgZ3JhcGhcbiAgICovXG4gIGdldCBwYW5PZmZzZXRYKCkge1xuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4LmU7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBjdXJyZW50IGB4YCBwb3NpdGlvbiBvZiB0aGUgZ3JhcGhcbiAgICovXG4gIEBJbnB1dCgncGFuT2Zmc2V0WCcpXG4gIHNldCBwYW5PZmZzZXRYKHgpIHtcbiAgICB0aGlzLnBhblRvKE51bWJlcih4KSwgbnVsbCk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGB5YCBwb3NpdGlvbiBvZiB0aGUgZ3JhcGhcbiAgICovXG4gIGdldCBwYW5PZmZzZXRZKCkge1xuICAgIHJldHVybiB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4LmY7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHRoZSBjdXJyZW50IGB5YCBwb3NpdGlvbiBvZiB0aGUgZ3JhcGhcbiAgICovXG4gIEBJbnB1dCgncGFuT2Zmc2V0WScpXG4gIHNldCBwYW5PZmZzZXRZKHkpIHtcbiAgICB0aGlzLnBhblRvKG51bGwsIE51bWJlcih5KSk7XG4gIH1cblxuICAvKipcbiAgICogQW5ndWxhciBsaWZlY3ljbGUgZXZlbnRcbiAgICpcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBuZ09uSW5pdCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy51cGRhdGUkKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChcbiAgICAgICAgdGhpcy51cGRhdGUkLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2VudGVyJCkge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnB1c2goXG4gICAgICAgIHRoaXMuY2VudGVyJC5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuY2VudGVyKCk7XG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAodGhpcy56b29tVG9GaXQkKSB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMucHVzaChcbiAgICAgICAgdGhpcy56b29tVG9GaXQkLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy56b29tVG9GaXQoKTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucGFuVG9Ob2RlJCkge1xuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnB1c2goXG4gICAgICAgIHRoaXMucGFuVG9Ob2RlJC5zdWJzY3JpYmUoKG5vZGVJZDogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgdGhpcy5wYW5Ub05vZGVJZChub2RlSWQpO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICB0aGlzLm1pbmltYXBDbGlwUGF0aElkID0gYG1pbmltYXBDbGlwJHtpZCgpfWA7XG4gIH1cblxuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKTogdm9pZCB7XG4gICAgY29uc3QgeyBsYXlvdXQsIGxheW91dFNldHRpbmdzLCBub2RlcywgY2x1c3RlcnMsIGxpbmtzIH0gPSBjaGFuZ2VzO1xuICAgIHRoaXMuc2V0TGF5b3V0KHRoaXMubGF5b3V0KTtcbiAgICBpZiAobGF5b3V0U2V0dGluZ3MpIHtcbiAgICAgIHRoaXMuc2V0TGF5b3V0U2V0dGluZ3ModGhpcy5sYXlvdXRTZXR0aW5ncyk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlKCk7XG4gIH1cblxuICBzZXRMYXlvdXQobGF5b3V0OiBzdHJpbmcgfCBMYXlvdXQpOiB2b2lkIHtcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgaWYgKCFsYXlvdXQpIHtcbiAgICAgIGxheW91dCA9ICdkYWdyZSc7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbGF5b3V0ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5sYXlvdXQgPSB0aGlzLmxheW91dFNlcnZpY2UuZ2V0TGF5b3V0KGxheW91dCk7XG4gICAgICB0aGlzLnNldExheW91dFNldHRpbmdzKHRoaXMubGF5b3V0U2V0dGluZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHNldExheW91dFNldHRpbmdzKHNldHRpbmdzOiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5sYXlvdXQgJiYgdHlwZW9mIHRoaXMubGF5b3V0ICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5sYXlvdXQuc2V0dGluZ3MgPSBzZXR0aW5ncztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQW5ndWxhciBsaWZlY3ljbGUgZXZlbnRcbiAgICpcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIGZvciAoY29uc3Qgc3ViIG9mIHRoaXMuc3Vic2NyaXB0aW9ucykge1xuICAgICAgc3ViLnVuc3Vic2NyaWJlKCk7XG4gICAgfVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQW5ndWxhciBsaWZlY3ljbGUgZXZlbnRcbiAgICpcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBuZ0FmdGVyVmlld0luaXQoKTogdm9pZCB7XG4gICAgc3VwZXIubmdBZnRlclZpZXdJbml0KCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZSgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCYXNlIGNsYXNzIHVwZGF0ZSBpbXBsZW1lbnRhdGlvbiBmb3IgdGhlIGRhZyBncmFwaFxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBzdXBlci51cGRhdGUoKTtcbiAgICBpZiAoIXRoaXMuY3VydmUpIHtcbiAgICAgIHRoaXMuY3VydmUgPSBzaGFwZS5jdXJ2ZUJ1bmRsZS5iZXRhKDEpO1xuICAgIH1cblxuICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xuICAgICAgdGhpcy5kaW1zID0gY2FsY3VsYXRlVmlld0RpbWVuc2lvbnMoe1xuICAgICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodCxcbiAgICAgICAgbWFyZ2luczogdGhpcy5tYXJnaW4sXG4gICAgICAgIHNob3dMZWdlbmQ6IHRoaXMubGVnZW5kXG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zZXJpZXNEb21haW4gPSB0aGlzLmdldFNlcmllc0RvbWFpbigpO1xuICAgICAgdGhpcy5zZXRDb2xvcnMoKTtcbiAgICAgIHRoaXMubGVnZW5kT3B0aW9ucyA9IHRoaXMuZ2V0TGVnZW5kT3B0aW9ucygpO1xuXG4gICAgICB0aGlzLmNyZWF0ZUdyYXBoKCk7XG4gICAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybSgpO1xuICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWU7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyB0aGUgZGFncmUgZ3JhcGggZW5naW5lXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgY3JlYXRlR3JhcGgoKTogdm9pZCB7XG4gICAgdGhpcy5ncmFwaFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuZ3JhcGhTdWJzY3JpcHRpb24gPSBuZXcgU3Vic2NyaXB0aW9uKCk7XG4gICAgY29uc3QgaW5pdGlhbGl6ZU5vZGUgPSAobjogTm9kZSkgPT4ge1xuICAgICAgaWYgKCFuLm1ldGEpIHtcbiAgICAgICAgbi5tZXRhID0ge307XG4gICAgICB9XG4gICAgICBpZiAoIW4uaWQpIHtcbiAgICAgICAgbi5pZCA9IGlkKCk7XG4gICAgICB9XG4gICAgICBpZiAoIW4uZGltZW5zaW9uKSB7XG4gICAgICAgIG4uZGltZW5zaW9uID0ge1xuICAgICAgICAgIHdpZHRoOiB0aGlzLm5vZGVXaWR0aCA/IHRoaXMubm9kZVdpZHRoIDogMzAsXG4gICAgICAgICAgaGVpZ2h0OiB0aGlzLm5vZGVIZWlnaHQgPyB0aGlzLm5vZGVIZWlnaHQgOiAzMFxuICAgICAgICB9O1xuICAgICAgICBuLm1ldGEuZm9yY2VEaW1lbnNpb25zID0gZmFsc2U7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuLm1ldGEuZm9yY2VEaW1lbnNpb25zID0gbi5tZXRhLmZvcmNlRGltZW5zaW9ucyA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IG4ubWV0YS5mb3JjZURpbWVuc2lvbnM7XG4gICAgICB9XG4gICAgICBuLnBvc2l0aW9uID0ge1xuICAgICAgICB4OiAwLFxuICAgICAgICB5OiAwXG4gICAgICB9O1xuICAgICAgbi5kYXRhID0gbi5kYXRhID8gbi5kYXRhIDoge307XG4gICAgICByZXR1cm4gbjtcbiAgICB9O1xuXG4gICAgdGhpcy5ncmFwaCA9IHtcbiAgICAgIG5vZGVzOiB0aGlzLm5vZGVzLmxlbmd0aCA+IDAgPyBbLi4udGhpcy5ub2Rlc10ubWFwKGluaXRpYWxpemVOb2RlKSA6IFtdLFxuICAgICAgY2x1c3RlcnM6IHRoaXMuY2x1c3RlcnMgJiYgdGhpcy5jbHVzdGVycy5sZW5ndGggPiAwID8gWy4uLnRoaXMuY2x1c3RlcnNdLm1hcChpbml0aWFsaXplTm9kZSkgOiBbXSxcbiAgICAgIGVkZ2VzOlxuICAgICAgICB0aGlzLmxpbmtzLmxlbmd0aCA+IDBcbiAgICAgICAgICA/IFsuLi50aGlzLmxpbmtzXS5tYXAoZSA9PiB7XG4gICAgICAgICAgICAgIGlmICghZS5pZCkge1xuICAgICAgICAgICAgICAgIGUuaWQgPSBpZCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICA6IFtdXG4gICAgfTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB0aGlzLmRyYXcoKSk7XG4gIH1cblxuICAvKipcbiAgICogRHJhd3MgdGhlIGdyYXBoIHVzaW5nIGRhZ3JlIGxheW91dHNcbiAgICpcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBkcmF3KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5sYXlvdXQgfHwgdHlwZW9mIHRoaXMubGF5b3V0ID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBDYWxjIHZpZXcgZGltcyBmb3IgdGhlIG5vZGVzXG4gICAgdGhpcy5hcHBseU5vZGVEaW1lbnNpb25zKCk7XG5cbiAgICAvLyBSZWNhbGMgdGhlIGxheW91dFxuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMubGF5b3V0LnJ1bih0aGlzLmdyYXBoKTtcbiAgICBjb25zdCByZXN1bHQkID0gcmVzdWx0IGluc3RhbmNlb2YgT2JzZXJ2YWJsZSA/IHJlc3VsdCA6IG9mKHJlc3VsdCk7XG4gICAgdGhpcy5ncmFwaFN1YnNjcmlwdGlvbi5hZGQoXG4gICAgICByZXN1bHQkLnN1YnNjcmliZShncmFwaCA9PiB7XG4gICAgICAgIHRoaXMuZ3JhcGggPSBncmFwaDtcbiAgICAgICAgdGhpcy50aWNrKCk7XG4gICAgICB9KVxuICAgICk7XG5cbiAgICBpZiAodGhpcy5ncmFwaC5ub2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXN1bHQkLnBpcGUoZmlyc3QoKSkuc3Vic2NyaWJlKCgpID0+IHRoaXMuYXBwbHlOb2RlRGltZW5zaW9ucygpKTtcbiAgfVxuXG4gIHRpY2soKSB7XG4gICAgLy8gVHJhbnNwb3NlcyB2aWV3IG9wdGlvbnMgdG8gdGhlIG5vZGVcbiAgICBjb25zdCBvbGROb2RlczogU2V0PHN0cmluZz4gPSBuZXcgU2V0KCk7XG5cbiAgICB0aGlzLmdyYXBoLm5vZGVzLm1hcChuID0+IHtcbiAgICAgIG4udHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke24ucG9zaXRpb24ueCAtIG4uZGltZW5zaW9uLndpZHRoIC8gMiB8fCAwfSwgJHtcbiAgICAgICAgbi5wb3NpdGlvbi55IC0gbi5kaW1lbnNpb24uaGVpZ2h0IC8gMiB8fCAwXG4gICAgICB9KWA7XG4gICAgICBpZiAoIW4uZGF0YSkge1xuICAgICAgICBuLmRhdGEgPSB7fTtcbiAgICAgIH1cbiAgICAgIG4uZGF0YS5jb2xvciA9IHRoaXMuY29sb3JzLmdldENvbG9yKHRoaXMuZ3JvdXBSZXN1bHRzQnkobikpO1xuICAgICAgb2xkTm9kZXMuYWRkKG4uaWQpO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgb2xkQ2x1c3RlcnM6IFNldDxzdHJpbmc+ID0gbmV3IFNldCgpO1xuXG4gICAgKHRoaXMuZ3JhcGguY2x1c3RlcnMgfHwgW10pLm1hcChuID0+IHtcbiAgICAgIG4udHJhbnNmb3JtID0gYHRyYW5zbGF0ZSgke24ucG9zaXRpb24ueCAtIG4uZGltZW5zaW9uLndpZHRoIC8gMiB8fCAwfSwgJHtcbiAgICAgICAgbi5wb3NpdGlvbi55IC0gbi5kaW1lbnNpb24uaGVpZ2h0IC8gMiB8fCAwXG4gICAgICB9KWA7XG4gICAgICBpZiAoIW4uZGF0YSkge1xuICAgICAgICBuLmRhdGEgPSB7fTtcbiAgICAgIH1cbiAgICAgIG4uZGF0YS5jb2xvciA9IHRoaXMuY29sb3JzLmdldENvbG9yKHRoaXMuZ3JvdXBSZXN1bHRzQnkobikpO1xuICAgICAgb2xkQ2x1c3RlcnMuYWRkKG4uaWQpO1xuICAgIH0pO1xuXG4gICAgLy8gUHJldmVudCBhbmltYXRpb25zIG9uIG5ldyBub2Rlc1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5vbGROb2RlcyA9IG9sZE5vZGVzO1xuICAgICAgdGhpcy5vbGRDbHVzdGVycyA9IG9sZENsdXN0ZXJzO1xuICAgIH0sIDUwMCk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGxhYmVscyB0byB0aGUgbmV3IHBvc2l0aW9uc1xuICAgIGNvbnN0IG5ld0xpbmtzID0gW107XG4gICAgZm9yIChjb25zdCBlZGdlTGFiZWxJZCBpbiB0aGlzLmdyYXBoLmVkZ2VMYWJlbHMpIHtcbiAgICAgIGNvbnN0IGVkZ2VMYWJlbCA9IHRoaXMuZ3JhcGguZWRnZUxhYmVsc1tlZGdlTGFiZWxJZF07XG5cbiAgICAgIGNvbnN0IG5vcm1LZXkgPSBlZGdlTGFiZWxJZC5yZXBsYWNlKC9bXlxcdy1dKi9nLCAnJyk7XG5cbiAgICAgIGNvbnN0IGlzTXVsdGlncmFwaCA9XG4gICAgICAgIHRoaXMubGF5b3V0ICYmIHR5cGVvZiB0aGlzLmxheW91dCAhPT0gJ3N0cmluZycgJiYgdGhpcy5sYXlvdXQuc2V0dGluZ3MgJiYgdGhpcy5sYXlvdXQuc2V0dGluZ3MubXVsdGlncmFwaDtcblxuICAgICAgbGV0IG9sZExpbmsgPSBpc011bHRpZ3JhcGhcbiAgICAgICAgPyB0aGlzLl9vbGRMaW5rcy5maW5kKG9sID0+IGAke29sLnNvdXJjZX0ke29sLnRhcmdldH0ke29sLmlkfWAgPT09IG5vcm1LZXkpXG4gICAgICAgIDogdGhpcy5fb2xkTGlua3MuZmluZChvbCA9PiBgJHtvbC5zb3VyY2V9JHtvbC50YXJnZXR9YCA9PT0gbm9ybUtleSk7XG5cbiAgICAgIGNvbnN0IGxpbmtGcm9tR3JhcGggPSBpc011bHRpZ3JhcGhcbiAgICAgICAgPyB0aGlzLmdyYXBoLmVkZ2VzLmZpbmQobmwgPT4gYCR7bmwuc291cmNlfSR7bmwudGFyZ2V0fSR7bmwuaWR9YCA9PT0gbm9ybUtleSlcbiAgICAgICAgOiB0aGlzLmdyYXBoLmVkZ2VzLmZpbmQobmwgPT4gYCR7bmwuc291cmNlfSR7bmwudGFyZ2V0fWAgPT09IG5vcm1LZXkpO1xuXG4gICAgICBpZiAoIW9sZExpbmspIHtcbiAgICAgICAgb2xkTGluayA9IGxpbmtGcm9tR3JhcGggfHwgZWRnZUxhYmVsO1xuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgb2xkTGluay5kYXRhICYmXG4gICAgICAgIGxpbmtGcm9tR3JhcGggJiZcbiAgICAgICAgbGlua0Zyb21HcmFwaC5kYXRhICYmXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KG9sZExpbmsuZGF0YSkgIT09IEpTT04uc3RyaW5naWZ5KGxpbmtGcm9tR3JhcGguZGF0YSlcbiAgICAgICkge1xuICAgICAgICAvLyBDb21wYXJlIG9sZCBsaW5rIHRvIG5ldyBsaW5rIGFuZCByZXBsYWNlIGlmIG5vdCBlcXVhbFxuICAgICAgICBvbGRMaW5rLmRhdGEgPSBsaW5rRnJvbUdyYXBoLmRhdGE7XG4gICAgICB9XG5cbiAgICAgIG9sZExpbmsub2xkTGluZSA9IG9sZExpbmsubGluZTtcblxuICAgICAgY29uc3QgcG9pbnRzID0gZWRnZUxhYmVsLnBvaW50cztcbiAgICAgIGNvbnN0IGxpbmUgPSB0aGlzLmdlbmVyYXRlTGluZShwb2ludHMpO1xuXG4gICAgICBjb25zdCBuZXdMaW5rID0gT2JqZWN0LmFzc2lnbih7fSwgb2xkTGluayk7XG4gICAgICBuZXdMaW5rLmxpbmUgPSBsaW5lO1xuICAgICAgbmV3TGluay5wb2ludHMgPSBwb2ludHM7XG5cbiAgICAgIHRoaXMudXBkYXRlTWlkcG9pbnRPbkVkZ2UobmV3TGluaywgcG9pbnRzKTtcblxuICAgICAgY29uc3QgdGV4dFBvcyA9IHBvaW50c1tNYXRoLmZsb29yKHBvaW50cy5sZW5ndGggLyAyKV07XG4gICAgICBpZiAodGV4dFBvcykge1xuICAgICAgICBuZXdMaW5rLnRleHRUcmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7dGV4dFBvcy54IHx8IDB9LCR7dGV4dFBvcy55IHx8IDB9KWA7XG4gICAgICB9XG5cbiAgICAgIG5ld0xpbmsudGV4dEFuZ2xlID0gMDtcbiAgICAgIGlmICghbmV3TGluay5vbGRMaW5lKSB7XG4gICAgICAgIG5ld0xpbmsub2xkTGluZSA9IG5ld0xpbmsubGluZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jYWxjRG9taW5hbnRCYXNlbGluZShuZXdMaW5rKTtcbiAgICAgIG5ld0xpbmtzLnB1c2gobmV3TGluayk7XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaC5lZGdlcyA9IG5ld0xpbmtzO1xuXG4gICAgLy8gTWFwIHRoZSBvbGQgbGlua3MgZm9yIGFuaW1hdGlvbnNcbiAgICBpZiAodGhpcy5ncmFwaC5lZGdlcykge1xuICAgICAgdGhpcy5fb2xkTGlua3MgPSB0aGlzLmdyYXBoLmVkZ2VzLm1hcChsID0+IHtcbiAgICAgICAgY29uc3QgbmV3TCA9IE9iamVjdC5hc3NpZ24oe30sIGwpO1xuICAgICAgICBuZXdMLm9sZExpbmUgPSBsLmxpbmU7XG4gICAgICAgIHJldHVybiBuZXdMO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy51cGRhdGVNaW5pbWFwKCk7XG5cbiAgICBpZiAodGhpcy5hdXRvWm9vbSkge1xuICAgICAgdGhpcy56b29tVG9GaXQoKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5hdXRvQ2VudGVyKSB7XG4gICAgICAvLyBBdXRvLWNlbnRlciB3aGVuIHJlbmRlcmluZ1xuICAgICAgdGhpcy5jZW50ZXIoKTtcbiAgICB9XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4gdGhpcy5yZWRyYXdMaW5lcygpKTtcbiAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xuICB9XG5cbiAgZ2V0TWluaW1hcFRyYW5zZm9ybSgpOiBzdHJpbmcge1xuICAgIHN3aXRjaCAodGhpcy5taW5pTWFwUG9zaXRpb24pIHtcbiAgICAgIGNhc2UgTWluaU1hcFBvc2l0aW9uLlVwcGVyTGVmdDoge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG4gICAgICBjYXNlIE1pbmlNYXBQb3NpdGlvbi5VcHBlclJpZ2h0OiB7XG4gICAgICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyAodGhpcy5kaW1zLndpZHRoIC0gdGhpcy5ncmFwaERpbXMud2lkdGggLyB0aGlzLm1pbmltYXBTY2FsZUNvZWZmaWNpZW50KSArICcsJyArIDAgKyAnKSc7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGVHcmFwaERpbXMoKSB7XG4gICAgbGV0IG1pblggPSArSW5maW5pdHk7XG4gICAgbGV0IG1heFggPSAtSW5maW5pdHk7XG4gICAgbGV0IG1pblkgPSArSW5maW5pdHk7XG4gICAgbGV0IG1heFkgPSAtSW5maW5pdHk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdyYXBoLm5vZGVzW2ldO1xuICAgICAgbWluWCA9IG5vZGUucG9zaXRpb24ueCA8IG1pblggPyBub2RlLnBvc2l0aW9uLnggOiBtaW5YO1xuICAgICAgbWluWSA9IG5vZGUucG9zaXRpb24ueSA8IG1pblkgPyBub2RlLnBvc2l0aW9uLnkgOiBtaW5ZO1xuICAgICAgbWF4WCA9IG5vZGUucG9zaXRpb24ueCArIG5vZGUuZGltZW5zaW9uLndpZHRoID4gbWF4WCA/IG5vZGUucG9zaXRpb24ueCArIG5vZGUuZGltZW5zaW9uLndpZHRoIDogbWF4WDtcbiAgICAgIG1heFkgPSBub2RlLnBvc2l0aW9uLnkgKyBub2RlLmRpbWVuc2lvbi5oZWlnaHQgPiBtYXhZID8gbm9kZS5wb3NpdGlvbi55ICsgbm9kZS5kaW1lbnNpb24uaGVpZ2h0IDogbWF4WTtcbiAgICB9XG4gICAgbWluWCAtPSAxMDA7XG4gICAgbWluWSAtPSAxMDA7XG4gICAgbWF4WCArPSAxMDA7XG4gICAgbWF4WSArPSAxMDA7XG4gICAgdGhpcy5ncmFwaERpbXMud2lkdGggPSBtYXhYIC0gbWluWDtcbiAgICB0aGlzLmdyYXBoRGltcy5oZWlnaHQgPSBtYXhZIC0gbWluWTtcbiAgICB0aGlzLm1pbmltYXBPZmZzZXRYID0gbWluWDtcbiAgICB0aGlzLm1pbmltYXBPZmZzZXRZID0gbWluWTtcbiAgfVxuXG4gIEB0aHJvdHRsZWFibGUoNTAwKVxuICB1cGRhdGVNaW5pbWFwKCkge1xuICAgIGlmICghdGhpcy5zaG93TWluaU1hcCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgaGVpZ2h0L3dpZHRoIHRvdGFsLCBidXQgb25seSBpZiB3ZSBoYXZlIGFueSBub2Rlc1xuICAgIGlmICh0aGlzLmdyYXBoLm5vZGVzICYmIHRoaXMuZ3JhcGgubm9kZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnVwZGF0ZUdyYXBoRGltcygpO1xuXG4gICAgICBpZiAodGhpcy5taW5pTWFwTWF4V2lkdGgpIHtcbiAgICAgICAgdGhpcy5taW5pbWFwU2NhbGVDb2VmZmljaWVudCA9IHRoaXMuZ3JhcGhEaW1zLndpZHRoIC8gdGhpcy5taW5pTWFwTWF4V2lkdGg7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5taW5pTWFwTWF4SGVpZ2h0KSB7XG4gICAgICAgIHRoaXMubWluaW1hcFNjYWxlQ29lZmZpY2llbnQgPSBNYXRoLm1heChcbiAgICAgICAgICB0aGlzLm1pbmltYXBTY2FsZUNvZWZmaWNpZW50LFxuICAgICAgICAgIHRoaXMuZ3JhcGhEaW1zLmhlaWdodCAvIHRoaXMubWluaU1hcE1heEhlaWdodFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLm1pbmltYXBUcmFuc2Zvcm0gPSB0aGlzLmdldE1pbmltYXBUcmFuc2Zvcm0oKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTWVhc3VyZXMgdGhlIG5vZGUgZWxlbWVudCBhbmQgYXBwbGllcyB0aGUgZGltZW5zaW9uc1xuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIGFwcGx5Tm9kZURpbWVuc2lvbnMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMubm9kZUVsZW1lbnRzICYmIHRoaXMubm9kZUVsZW1lbnRzLmxlbmd0aCkge1xuICAgICAgdGhpcy5ub2RlRWxlbWVudHMubWFwKGVsZW0gPT4ge1xuICAgICAgICBjb25zdCBuYXRpdmVFbGVtZW50ID0gZWxlbS5uYXRpdmVFbGVtZW50O1xuICAgICAgICBjb25zdCBub2RlID0gdGhpcy5ncmFwaC5ub2Rlcy5maW5kKG4gPT4gbi5pZCA9PT0gbmF0aXZlRWxlbWVudC5pZCk7XG4gICAgICAgIGlmICghbm9kZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgaGVpZ2h0XG4gICAgICAgIGxldCBkaW1zO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGRpbXMgPSBuYXRpdmVFbGVtZW50LmdldEJCb3goKTtcbiAgICAgICAgICBpZiAoIWRpbXMud2lkdGggfHwgIWRpbXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIC8vIFNraXAgZHJhd2luZyBpZiBlbGVtZW50IGlzIG5vdCBkaXNwbGF5ZWQgLSBGaXJlZm94IHdvdWxkIHRocm93IGFuIGVycm9yIGhlcmVcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubm9kZUhlaWdodCkge1xuICAgICAgICAgIG5vZGUuZGltZW5zaW9uLmhlaWdodCA9XG4gICAgICAgICAgICBub2RlLmRpbWVuc2lvbi5oZWlnaHQgJiYgbm9kZS5tZXRhLmZvcmNlRGltZW5zaW9ucyA/IG5vZGUuZGltZW5zaW9uLmhlaWdodCA6IHRoaXMubm9kZUhlaWdodDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBub2RlLmRpbWVuc2lvbi5oZWlnaHQgPVxuICAgICAgICAgICAgbm9kZS5kaW1lbnNpb24uaGVpZ2h0ICYmIG5vZGUubWV0YS5mb3JjZURpbWVuc2lvbnMgPyBub2RlLmRpbWVuc2lvbi5oZWlnaHQgOiBkaW1zLmhlaWdodDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm5vZGVNYXhIZWlnaHQpIHtcbiAgICAgICAgICBub2RlLmRpbWVuc2lvbi5oZWlnaHQgPSBNYXRoLm1heChub2RlLmRpbWVuc2lvbi5oZWlnaHQsIHRoaXMubm9kZU1heEhlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubm9kZU1pbkhlaWdodCkge1xuICAgICAgICAgIG5vZGUuZGltZW5zaW9uLmhlaWdodCA9IE1hdGgubWluKG5vZGUuZGltZW5zaW9uLmhlaWdodCwgdGhpcy5ub2RlTWluSGVpZ2h0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm5vZGVXaWR0aCkge1xuICAgICAgICAgIG5vZGUuZGltZW5zaW9uLndpZHRoID1cbiAgICAgICAgICAgIG5vZGUuZGltZW5zaW9uLndpZHRoICYmIG5vZGUubWV0YS5mb3JjZURpbWVuc2lvbnMgPyBub2RlLmRpbWVuc2lvbi53aWR0aCA6IHRoaXMubm9kZVdpZHRoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGNhbGN1bGF0ZSB0aGUgd2lkdGhcbiAgICAgICAgICBpZiAobmF0aXZlRWxlbWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgndGV4dCcpLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IG1heFRleHREaW1zO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZm9yIChjb25zdCB0ZXh0RWxlbSBvZiBuYXRpdmVFbGVtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0ZXh0JykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50QkJveCA9IHRleHRFbGVtLmdldEJCb3goKTtcbiAgICAgICAgICAgICAgICBpZiAoIW1heFRleHREaW1zKSB7XG4gICAgICAgICAgICAgICAgICBtYXhUZXh0RGltcyA9IGN1cnJlbnRCQm94O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpZiAoY3VycmVudEJCb3gud2lkdGggPiBtYXhUZXh0RGltcy53aWR0aCkge1xuICAgICAgICAgICAgICAgICAgICBtYXhUZXh0RGltcy53aWR0aCA9IGN1cnJlbnRCQm94LndpZHRoO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKGN1cnJlbnRCQm94LmhlaWdodCA+IG1heFRleHREaW1zLmhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBtYXhUZXh0RGltcy5oZWlnaHQgPSBjdXJyZW50QkJveC5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgICAgICAvLyBTa2lwIGRyYXdpbmcgaWYgZWxlbWVudCBpcyBub3QgZGlzcGxheWVkIC0gRmlyZWZveCB3b3VsZCB0aHJvdyBhbiBlcnJvciBoZXJlXG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGUuZGltZW5zaW9uLndpZHRoID1cbiAgICAgICAgICAgICAgbm9kZS5kaW1lbnNpb24ud2lkdGggJiYgbm9kZS5tZXRhLmZvcmNlRGltZW5zaW9ucyA/IG5vZGUuZGltZW5zaW9uLndpZHRoIDogbWF4VGV4dERpbXMud2lkdGggKyAyMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9kZS5kaW1lbnNpb24ud2lkdGggPVxuICAgICAgICAgICAgICBub2RlLmRpbWVuc2lvbi53aWR0aCAmJiBub2RlLm1ldGEuZm9yY2VEaW1lbnNpb25zID8gbm9kZS5kaW1lbnNpb24ud2lkdGggOiBkaW1zLndpZHRoO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm5vZGVNYXhXaWR0aCkge1xuICAgICAgICAgIG5vZGUuZGltZW5zaW9uLndpZHRoID0gTWF0aC5tYXgobm9kZS5kaW1lbnNpb24ud2lkdGgsIHRoaXMubm9kZU1heFdpZHRoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ub2RlTWluV2lkdGgpIHtcbiAgICAgICAgICBub2RlLmRpbWVuc2lvbi53aWR0aCA9IE1hdGgubWluKG5vZGUuZGltZW5zaW9uLndpZHRoLCB0aGlzLm5vZGVNaW5XaWR0aCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWRyYXdzIHRoZSBsaW5lcyB3aGVuIGRyYWdnZWQgb3Igdmlld3BvcnQgdXBkYXRlZFxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIHJlZHJhd0xpbmVzKF9hbmltYXRlID0gdGhpcy5hbmltYXRlKTogdm9pZCB7XG4gICAgdGhpcy5saW5rRWxlbWVudHMubWFwKGxpbmtFbCA9PiB7XG4gICAgICBjb25zdCBlZGdlID0gdGhpcy5ncmFwaC5lZGdlcy5maW5kKGxpbiA9PiBsaW4uaWQgPT09IGxpbmtFbC5uYXRpdmVFbGVtZW50LmlkKTtcblxuICAgICAgaWYgKGVkZ2UpIHtcbiAgICAgICAgY29uc3QgbGlua1NlbGVjdGlvbiA9IHNlbGVjdChsaW5rRWwubmF0aXZlRWxlbWVudCkuc2VsZWN0KCcubGluZScpO1xuICAgICAgICBsaW5rU2VsZWN0aW9uXG4gICAgICAgICAgLmF0dHIoJ2QnLCBlZGdlLm9sZExpbmUpXG4gICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5lYXNlKGVhc2UuZWFzZVNpbkluT3V0KVxuICAgICAgICAgIC5kdXJhdGlvbihfYW5pbWF0ZSA/IDUwMCA6IDApXG4gICAgICAgICAgLmF0dHIoJ2QnLCBlZGdlLmxpbmUpO1xuXG4gICAgICAgIGNvbnN0IHRleHRQYXRoU2VsZWN0aW9uID0gc2VsZWN0KHRoaXMuY2hhcnRFbGVtZW50Lm5hdGl2ZUVsZW1lbnQpLnNlbGVjdChgIyR7ZWRnZS5pZH1gKTtcbiAgICAgICAgdGV4dFBhdGhTZWxlY3Rpb25cbiAgICAgICAgICAuYXR0cignZCcsIGVkZ2Uub2xkVGV4dFBhdGgpXG4gICAgICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgICAgIC5lYXNlKGVhc2UuZWFzZVNpbkluT3V0KVxuICAgICAgICAgIC5kdXJhdGlvbihfYW5pbWF0ZSA/IDUwMCA6IDApXG4gICAgICAgICAgLmF0dHIoJ2QnLCBlZGdlLnRleHRQYXRoKTtcblxuICAgICAgICB0aGlzLnVwZGF0ZU1pZHBvaW50T25FZGdlKGVkZ2UsIGVkZ2UucG9pbnRzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIHRleHQgZGlyZWN0aW9ucyAvIGZsaXBwaW5nXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgY2FsY0RvbWluYW50QmFzZWxpbmUobGluayk6IHZvaWQge1xuICAgIGNvbnN0IGZpcnN0UG9pbnQgPSBsaW5rLnBvaW50c1swXTtcbiAgICBjb25zdCBsYXN0UG9pbnQgPSBsaW5rLnBvaW50c1tsaW5rLnBvaW50cy5sZW5ndGggLSAxXTtcbiAgICBsaW5rLm9sZFRleHRQYXRoID0gbGluay50ZXh0UGF0aDtcblxuICAgIGlmIChsYXN0UG9pbnQueCA8IGZpcnN0UG9pbnQueCkge1xuICAgICAgbGluay5kb21pbmFudEJhc2VsaW5lID0gJ3RleHQtYmVmb3JlLWVkZ2UnO1xuXG4gICAgICAvLyByZXZlcnNlIHRleHQgcGF0aCBmb3Igd2hlbiBpdHMgZmxpcHBlZCB1cHNpZGUgZG93blxuICAgICAgbGluay50ZXh0UGF0aCA9IHRoaXMuZ2VuZXJhdGVMaW5lKFsuLi5saW5rLnBvaW50c10ucmV2ZXJzZSgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGluay5kb21pbmFudEJhc2VsaW5lID0gJ3RleHQtYWZ0ZXItZWRnZSc7XG4gICAgICBsaW5rLnRleHRQYXRoID0gbGluay5saW5lO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZW5lcmF0ZSB0aGUgbmV3IGxpbmUgcGF0aFxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIGdlbmVyYXRlTGluZShwb2ludHM6IGFueSk6IGFueSB7XG4gICAgY29uc3QgbGluZUZ1bmN0aW9uID0gc2hhcGVcbiAgICAgIC5saW5lPGFueT4oKVxuICAgICAgLngoZCA9PiBkLngpXG4gICAgICAueShkID0+IGQueSlcbiAgICAgIC5jdXJ2ZSh0aGlzLmN1cnZlKTtcbiAgICByZXR1cm4gbGluZUZ1bmN0aW9uKHBvaW50cyk7XG4gIH1cblxuICAvKipcbiAgICogWm9vbSB3YXMgaW52b2tlZCBmcm9tIGV2ZW50XG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgb25ab29tKCRldmVudDogV2hlZWxFdmVudCwgZGlyZWN0aW9uKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZW5hYmxlVHJhY2twYWRTdXBwb3J0ICYmICEkZXZlbnQuY3RybEtleSkge1xuICAgICAgdGhpcy5wYW4oJGV2ZW50LmRlbHRhWCAqIC0xLCAkZXZlbnQuZGVsdGFZICogLTEpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHpvb21GYWN0b3IgPSAxICsgKGRpcmVjdGlvbiA9PT0gJ2luJyA/IHRoaXMuem9vbVNwZWVkIDogLXRoaXMuem9vbVNwZWVkKTtcblxuICAgIC8vIENoZWNrIHRoYXQgem9vbWluZyB3b3VsZG4ndCBwdXQgdXMgb3V0IG9mIGJvdW5kc1xuICAgIGNvbnN0IG5ld1pvb21MZXZlbCA9IHRoaXMuem9vbUxldmVsICogem9vbUZhY3RvcjtcbiAgICBpZiAobmV3Wm9vbUxldmVsIDw9IHRoaXMubWluWm9vbUxldmVsIHx8IG5ld1pvb21MZXZlbCA+PSB0aGlzLm1heFpvb21MZXZlbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIHpvb21pbmcgaXMgZW5hYmxlZCBvciBub3RcbiAgICBpZiAoIXRoaXMuZW5hYmxlWm9vbSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnBhbk9uWm9vbSA9PT0gdHJ1ZSAmJiAkZXZlbnQpIHtcbiAgICAgIC8vIEFic29sdXRlIG1vdXNlIFgvWSBvbiB0aGUgc2NyZWVuXG4gICAgICBjb25zdCBtb3VzZVggPSAkZXZlbnQuY2xpZW50WDtcbiAgICAgIGNvbnN0IG1vdXNlWSA9ICRldmVudC5jbGllbnRZO1xuXG4gICAgICAvLyBUcmFuc2Zvcm0gdGhlIG1vdXNlIFgvWSBpbnRvIGEgU1ZHIFgvWVxuICAgICAgY29uc3Qgc3ZnID0gdGhpcy5jaGFydC5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ3N2ZycpO1xuICAgICAgY29uc3Qgc3ZnR3JvdXAgPSBzdmcucXVlcnlTZWxlY3RvcignZy5jaGFydCcpO1xuXG4gICAgICBjb25zdCBwb2ludCA9IHN2Zy5jcmVhdGVTVkdQb2ludCgpO1xuICAgICAgcG9pbnQueCA9IG1vdXNlWDtcbiAgICAgIHBvaW50LnkgPSBtb3VzZVk7XG4gICAgICBjb25zdCBzdmdQb2ludCA9IHBvaW50Lm1hdHJpeFRyYW5zZm9ybShzdmdHcm91cC5nZXRTY3JlZW5DVE0oKS5pbnZlcnNlKCkpO1xuXG4gICAgICAvLyBQYW56b29tXG4gICAgICB0aGlzLnBhbihzdmdQb2ludC54LCBzdmdQb2ludC55LCB0cnVlKTtcbiAgICAgIHRoaXMuem9vbSh6b29tRmFjdG9yKTtcbiAgICAgIHRoaXMucGFuKC1zdmdQb2ludC54LCAtc3ZnUG9pbnQueSwgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuem9vbSh6b29tRmFjdG9yKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUGFuIGJ5IHgveVxuICAgKlxuICAgKiBAcGFyYW0geFxuICAgKiBAcGFyYW0geVxuICAgKi9cbiAgcGFuKHg6IG51bWJlciwgeTogbnVtYmVyLCBpZ25vcmVab29tTGV2ZWw6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgIGNvbnN0IHpvb21MZXZlbCA9IGlnbm9yZVpvb21MZXZlbCA/IDEgOiB0aGlzLnpvb21MZXZlbDtcbiAgICB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4ID0gdHJhbnNmb3JtKHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXgsIHRyYW5zbGF0ZSh4IC8gem9vbUxldmVsLCB5IC8gem9vbUxldmVsKSk7XG5cbiAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhbiB0byBhIGZpeGVkIHgveVxuICAgKlxuICAgKi9cbiAgcGFuVG8oeDogbnVtYmVyLCB5OiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZiAoeCA9PT0gbnVsbCB8fCB4ID09PSB1bmRlZmluZWQgfHwgaXNOYU4oeCkgfHwgeSA9PT0gbnVsbCB8fCB5ID09PSB1bmRlZmluZWQgfHwgaXNOYU4oeSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYW5YID0gLXRoaXMucGFuT2Zmc2V0WCAtIHggKiB0aGlzLnpvb21MZXZlbCArIHRoaXMuZGltcy53aWR0aCAvIDI7XG4gICAgY29uc3QgcGFuWSA9IC10aGlzLnBhbk9mZnNldFkgLSB5ICogdGhpcy56b29tTGV2ZWwgKyB0aGlzLmRpbXMuaGVpZ2h0IC8gMjtcblxuICAgIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXggPSB0cmFuc2Zvcm0oXG4gICAgICB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4LFxuICAgICAgdHJhbnNsYXRlKHBhblggLyB0aGlzLnpvb21MZXZlbCwgcGFuWSAvIHRoaXMuem9vbUxldmVsKVxuICAgICk7XG5cbiAgICB0aGlzLnVwZGF0ZVRyYW5zZm9ybSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFpvb20gYnkgYSBmYWN0b3JcbiAgICpcbiAgICovXG4gIHpvb20oZmFjdG9yOiBudW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4ID0gdHJhbnNmb3JtKHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXgsIHNjYWxlKGZhY3RvciwgZmFjdG9yKSk7XG4gICAgdGhpcy56b29tQ2hhbmdlLmVtaXQodGhpcy56b29tTGV2ZWwpO1xuICAgIHRoaXMudXBkYXRlVHJhbnNmb3JtKCk7XG4gIH1cblxuICAvKipcbiAgICogWm9vbSB0byBhIGZpeGVkIGxldmVsXG4gICAqXG4gICAqL1xuICB6b29tVG8obGV2ZWw6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXguYSA9IGlzTmFOKGxldmVsKSA/IHRoaXMudHJhbnNmb3JtYXRpb25NYXRyaXguYSA6IE51bWJlcihsZXZlbCk7XG4gICAgdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeC5kID0gaXNOYU4obGV2ZWwpID8gdGhpcy50cmFuc2Zvcm1hdGlvbk1hdHJpeC5kIDogTnVtYmVyKGxldmVsKTtcbiAgICB0aGlzLnpvb21DaGFuZ2UuZW1pdCh0aGlzLnpvb21MZXZlbCk7XG4gICAgdGhpcy51cGRhdGVUcmFuc2Zvcm0oKTtcbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIERyYWcgd2FzIGludm9rZWQgZnJvbSBhbiBldmVudFxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIG9uRHJhZyhldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5kcmFnZ2luZ0VuYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuZHJhZ2dpbmdOb2RlO1xuICAgIGlmICh0aGlzLmxheW91dCAmJiB0eXBlb2YgdGhpcy5sYXlvdXQgIT09ICdzdHJpbmcnICYmIHRoaXMubGF5b3V0Lm9uRHJhZykge1xuICAgICAgdGhpcy5sYXlvdXQub25EcmFnKG5vZGUsIGV2ZW50KTtcbiAgICB9XG5cbiAgICBub2RlLnBvc2l0aW9uLnggKz0gZXZlbnQubW92ZW1lbnRYIC8gdGhpcy56b29tTGV2ZWw7XG4gICAgbm9kZS5wb3NpdGlvbi55ICs9IGV2ZW50Lm1vdmVtZW50WSAvIHRoaXMuem9vbUxldmVsO1xuXG4gICAgLy8gbW92ZSB0aGUgbm9kZVxuICAgIGNvbnN0IHggPSBub2RlLnBvc2l0aW9uLnggLSBub2RlLmRpbWVuc2lvbi53aWR0aCAvIDI7XG4gICAgY29uc3QgeSA9IG5vZGUucG9zaXRpb24ueSAtIG5vZGUuZGltZW5zaW9uLmhlaWdodCAvIDI7XG4gICAgbm9kZS50cmFuc2Zvcm0gPSBgdHJhbnNsYXRlKCR7eH0sICR7eX0pYDtcblxuICAgIGZvciAoY29uc3QgbGluayBvZiB0aGlzLmdyYXBoLmVkZ2VzKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGxpbmsudGFyZ2V0ID09PSBub2RlLmlkIHx8XG4gICAgICAgIGxpbmsuc291cmNlID09PSBub2RlLmlkIHx8XG4gICAgICAgIChsaW5rLnRhcmdldCBhcyBhbnkpLmlkID09PSBub2RlLmlkIHx8XG4gICAgICAgIChsaW5rLnNvdXJjZSBhcyBhbnkpLmlkID09PSBub2RlLmlkXG4gICAgICApIHtcbiAgICAgICAgaWYgKHRoaXMubGF5b3V0ICYmIHR5cGVvZiB0aGlzLmxheW91dCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLmxheW91dC51cGRhdGVFZGdlKHRoaXMuZ3JhcGgsIGxpbmspO1xuICAgICAgICAgIGNvbnN0IHJlc3VsdCQgPSByZXN1bHQgaW5zdGFuY2VvZiBPYnNlcnZhYmxlID8gcmVzdWx0IDogb2YocmVzdWx0KTtcbiAgICAgICAgICB0aGlzLmdyYXBoU3Vic2NyaXB0aW9uLmFkZChcbiAgICAgICAgICAgIHJlc3VsdCQuc3Vic2NyaWJlKGdyYXBoID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5ncmFwaCA9IGdyYXBoO1xuICAgICAgICAgICAgICB0aGlzLnJlZHJhd0VkZ2UobGluayk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJlZHJhd0xpbmVzKGZhbHNlKTtcbiAgICB0aGlzLnVwZGF0ZU1pbmltYXAoKTtcbiAgfVxuXG4gIHJlZHJhd0VkZ2UoZWRnZTogRWRnZSkge1xuICAgIGNvbnN0IGxpbmUgPSB0aGlzLmdlbmVyYXRlTGluZShlZGdlLnBvaW50cyk7XG4gICAgdGhpcy5jYWxjRG9taW5hbnRCYXNlbGluZShlZGdlKTtcbiAgICBlZGdlLm9sZExpbmUgPSBlZGdlLmxpbmU7XG4gICAgZWRnZS5saW5lID0gbGluZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGVudGlyZSB2aWV3IGZvciB0aGUgbmV3IHBhbiBwb3NpdGlvblxuICAgKlxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIHVwZGF0ZVRyYW5zZm9ybSgpOiB2b2lkIHtcbiAgICB0aGlzLnRyYW5zZm9ybSA9IHRvU1ZHKHNtb290aE1hdHJpeCh0aGlzLnRyYW5zZm9ybWF0aW9uTWF0cml4LCAxMDApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb2RlIHdhcyBjbGlja2VkXG4gICAqXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgb25DbGljayhldmVudDogYW55KTogdm9pZCB7XG4gICAgdGhpcy5zZWxlY3QuZW1pdChldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogTm9kZSB3YXMgZm9jdXNlZFxuICAgKlxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIG9uQWN0aXZhdGUoZXZlbnQpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5hY3RpdmVFbnRyaWVzLmluZGV4T2YoZXZlbnQpID4gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5hY3RpdmVFbnRyaWVzID0gW2V2ZW50LCAuLi50aGlzLmFjdGl2ZUVudHJpZXNdO1xuICAgIHRoaXMuYWN0aXZhdGUuZW1pdCh7IHZhbHVlOiBldmVudCwgZW50cmllczogdGhpcy5hY3RpdmVFbnRyaWVzIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vZGUgd2FzIGRlZm9jdXNlZFxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIG9uRGVhY3RpdmF0ZShldmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGlkeCA9IHRoaXMuYWN0aXZlRW50cmllcy5pbmRleE9mKGV2ZW50KTtcblxuICAgIHRoaXMuYWN0aXZlRW50cmllcy5zcGxpY2UoaWR4LCAxKTtcbiAgICB0aGlzLmFjdGl2ZUVudHJpZXMgPSBbLi4udGhpcy5hY3RpdmVFbnRyaWVzXTtcblxuICAgIHRoaXMuZGVhY3RpdmF0ZS5lbWl0KHsgdmFsdWU6IGV2ZW50LCBlbnRyaWVzOiB0aGlzLmFjdGl2ZUVudHJpZXMgfSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBkb21haW4gc2VyaWVzIGZvciB0aGUgbm9kZXNcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBnZXRTZXJpZXNEb21haW4oKTogYW55W10ge1xuICAgIHJldHVybiB0aGlzLm5vZGVzXG4gICAgICAubWFwKGQgPT4gdGhpcy5ncm91cFJlc3VsdHNCeShkKSlcbiAgICAgIC5yZWR1Y2UoKG5vZGVzOiBzdHJpbmdbXSwgbm9kZSk6IGFueVtdID0+IChub2Rlcy5pbmRleE9mKG5vZGUpICE9PSAtMSA/IG5vZGVzIDogbm9kZXMuY29uY2F0KFtub2RlXSkpLCBbXSlcbiAgICAgIC5zb3J0KCk7XG4gIH1cblxuICAvKipcbiAgICogVHJhY2tpbmcgZm9yIHRoZSBsaW5rXG4gICAqXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgdHJhY2tMaW5rQnkoaW5kZXg6IG51bWJlciwgbGluazogRWRnZSk6IGFueSB7XG4gICAgcmV0dXJuIGxpbmsuaWQ7XG4gIH1cblxuICAvKipcbiAgICogVHJhY2tpbmcgZm9yIHRoZSBub2RlXG4gICAqXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgdHJhY2tOb2RlQnkoaW5kZXg6IG51bWJlciwgbm9kZTogTm9kZSk6IGFueSB7XG4gICAgcmV0dXJuIG5vZGUuaWQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY29sb3JzIHRoZSBub2Rlc1xuICAgKlxuICAgKlxuICAgKiBAbWVtYmVyT2YgR3JhcGhDb21wb25lbnRcbiAgICovXG4gIHNldENvbG9ycygpOiB2b2lkIHtcbiAgICB0aGlzLmNvbG9ycyA9IG5ldyBDb2xvckhlbHBlcih0aGlzLnNjaGVtZSwgJ29yZGluYWwnLCB0aGlzLnNlcmllc0RvbWFpbiwgdGhpcy5jdXN0b21Db2xvcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGxlZ2VuZCBvcHRpb25zXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgZ2V0TGVnZW5kT3B0aW9ucygpOiBhbnkge1xuICAgIHJldHVybiB7XG4gICAgICBzY2FsZVR5cGU6ICdvcmRpbmFsJyxcbiAgICAgIGRvbWFpbjogdGhpcy5zZXJpZXNEb21haW4sXG4gICAgICBjb2xvcnM6IHRoaXMuY29sb3JzXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBtb3VzZSBtb3ZlIGV2ZW50LCB1c2VkIGZvciBwYW5uaW5nIGFuZCBkcmFnZ2luZy5cbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDptb3VzZW1vdmUnLCBbJyRldmVudCddKVxuICBvbk1vdXNlTW92ZSgkZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICB0aGlzLmlzTW91c2VNb3ZlQ2FsbGVkID0gdHJ1ZTtcbiAgICBpZiAoKHRoaXMuaXNQYW5uaW5nIHx8IHRoaXMuaXNNaW5pbWFwUGFubmluZykgJiYgdGhpcy5wYW5uaW5nRW5hYmxlZCkge1xuICAgICAgdGhpcy5wYW5XaXRoQ29uc3RyYWludHModGhpcy5wYW5uaW5nQXhpcywgJGV2ZW50KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuaXNEcmFnZ2luZyAmJiB0aGlzLmRyYWdnaW5nRW5hYmxlZCkge1xuICAgICAgdGhpcy5vbkRyYWcoJGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDptb3VzZWRvd24nLCBbJyRldmVudCddKVxuICBvbk1vdXNlRG93bihldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIHRoaXMuaXNNb3VzZU1vdmVDYWxsZWQgPSBmYWxzZTtcbiAgfVxuXG4gIEBIb3N0TGlzdGVuZXIoJ2RvY3VtZW50OmNsaWNrJywgWyckZXZlbnQnXSlcbiAgZ3JhcGhDbGljayhldmVudDogTW91c2VFdmVudCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pc01vdXNlTW92ZUNhbGxlZCkgdGhpcy5jbGlja0hhbmRsZXIuZW1pdChldmVudCk7XG4gIH1cblxuICAvKipcbiAgICogT24gdG91Y2ggc3RhcnQgZXZlbnQgdG8gZW5hYmxlIHBhbm5pbmcuXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgb25Ub3VjaFN0YXJ0KGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLl90b3VjaExhc3RYID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICB0aGlzLl90b3VjaExhc3RZID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WTtcblxuICAgIHRoaXMuaXNQYW5uaW5nID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPbiB0b3VjaCBtb3ZlIGV2ZW50LCB1c2VkIGZvciBwYW5uaW5nLlxuICAgKlxuICAgKi9cbiAgQEhvc3RMaXN0ZW5lcignZG9jdW1lbnQ6dG91Y2htb3ZlJywgWyckZXZlbnQnXSlcbiAgb25Ub3VjaE1vdmUoJGV2ZW50OiBhbnkpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc1Bhbm5pbmcgJiYgdGhpcy5wYW5uaW5nRW5hYmxlZCkge1xuICAgICAgY29uc3QgY2xpZW50WCA9ICRldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgY29uc3QgY2xpZW50WSA9ICRldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5jbGllbnRZO1xuICAgICAgY29uc3QgbW92ZW1lbnRYID0gY2xpZW50WCAtIHRoaXMuX3RvdWNoTGFzdFg7XG4gICAgICBjb25zdCBtb3ZlbWVudFkgPSBjbGllbnRZIC0gdGhpcy5fdG91Y2hMYXN0WTtcbiAgICAgIHRoaXMuX3RvdWNoTGFzdFggPSBjbGllbnRYO1xuICAgICAgdGhpcy5fdG91Y2hMYXN0WSA9IGNsaWVudFk7XG5cbiAgICAgIHRoaXMucGFuKG1vdmVtZW50WCwgbW92ZW1lbnRZKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT24gdG91Y2ggZW5kIGV2ZW50IHRvIGRpc2FibGUgcGFubmluZy5cbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBvblRvdWNoRW5kKGV2ZW50OiBhbnkpIHtcbiAgICB0aGlzLmlzUGFubmluZyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIE9uIG1vdXNlIHVwIGV2ZW50IHRvIGRpc2FibGUgcGFubmluZy9kcmFnZ2luZy5cbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBASG9zdExpc3RlbmVyKCdkb2N1bWVudDptb3VzZXVwJywgWyckZXZlbnQnXSlcbiAgb25Nb3VzZVVwKGV2ZW50OiBNb3VzZUV2ZW50KTogdm9pZCB7XG4gICAgdGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XG4gICAgdGhpcy5pc1Bhbm5pbmcgPSBmYWxzZTtcbiAgICB0aGlzLmlzTWluaW1hcFBhbm5pbmcgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5sYXlvdXQgJiYgdHlwZW9mIHRoaXMubGF5b3V0ICE9PSAnc3RyaW5nJyAmJiB0aGlzLmxheW91dC5vbkRyYWdFbmQpIHtcbiAgICAgIHRoaXMubGF5b3V0Lm9uRHJhZ0VuZCh0aGlzLmRyYWdnaW5nTm9kZSwgZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBub2RlIG1vdXNlIGRvd24gdG8ga2ljayBvZmYgZHJhZ2dpbmdcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBvbk5vZGVNb3VzZURvd24oZXZlbnQ6IE1vdXNlRXZlbnQsIG5vZGU6IGFueSk6IHZvaWQge1xuICAgIGlmICghdGhpcy5kcmFnZ2luZ0VuYWJsZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5pc0RyYWdnaW5nID0gdHJ1ZTtcbiAgICB0aGlzLmRyYWdnaW5nTm9kZSA9IG5vZGU7XG5cbiAgICBpZiAodGhpcy5sYXlvdXQgJiYgdHlwZW9mIHRoaXMubGF5b3V0ICE9PSAnc3RyaW5nJyAmJiB0aGlzLmxheW91dC5vbkRyYWdTdGFydCkge1xuICAgICAgdGhpcy5sYXlvdXQub25EcmFnU3RhcnQobm9kZSwgZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPbiBtaW5pbWFwIGRyYWcgbW91c2UgZG93biB0byBraWNrIG9mZiBtaW5pbWFwIHBhbm5pbmdcbiAgICpcbiAgICogQG1lbWJlck9mIEdyYXBoQ29tcG9uZW50XG4gICAqL1xuICBvbk1pbmltYXBEcmFnTW91c2VEb3duKCk6IHZvaWQge1xuICAgIHRoaXMuaXNNaW5pbWFwUGFubmluZyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogT24gbWluaW1hcCBwYW4gZXZlbnQuIFBhbnMgdGhlIGdyYXBoIHRvIHRoZSBjbGlja2VkIHBvc2l0aW9uXG4gICAqXG4gICAqIEBtZW1iZXJPZiBHcmFwaENvbXBvbmVudFxuICAgKi9cbiAgb25NaW5pbWFwUGFuVG8oZXZlbnQ6IE1vdXNlRXZlbnQpOiB2b2lkIHtcbiAgICBsZXQgeCA9XG4gICAgICBldmVudC5vZmZzZXRYIC0gKHRoaXMuZGltcy53aWR0aCAtICh0aGlzLmdyYXBoRGltcy53aWR0aCArIHRoaXMubWluaW1hcE9mZnNldFgpIC8gdGhpcy5taW5pbWFwU2NhbGVDb2VmZmljaWVudCk7XG4gICAgbGV0IHkgPSBldmVudC5vZmZzZXRZICsgdGhpcy5taW5pbWFwT2Zmc2V0WSAvIHRoaXMubWluaW1hcFNjYWxlQ29lZmZpY2llbnQ7XG5cbiAgICB0aGlzLnBhblRvKHggKiB0aGlzLm1pbmltYXBTY2FsZUNvZWZmaWNpZW50LCB5ICogdGhpcy5taW5pbWFwU2NhbGVDb2VmZmljaWVudCk7XG4gICAgdGhpcy5pc01pbmltYXBQYW5uaW5nID0gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDZW50ZXIgdGhlIGdyYXBoIGluIHRoZSB2aWV3cG9ydFxuICAgKi9cbiAgY2VudGVyKCk6IHZvaWQge1xuICAgIHRoaXMucGFuVG8odGhpcy5ncmFwaERpbXMud2lkdGggLyAyLCB0aGlzLmdyYXBoRGltcy5oZWlnaHQgLyAyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBab29tcyB0byBmaXQgdGhlIGVudGllciBncmFwaFxuICAgKi9cbiAgem9vbVRvRml0KCk6IHZvaWQge1xuICAgIGNvbnN0IGhlaWdodFpvb20gPSB0aGlzLmRpbXMuaGVpZ2h0IC8gdGhpcy5ncmFwaERpbXMuaGVpZ2h0O1xuICAgIGNvbnN0IHdpZHRoWm9vbSA9IHRoaXMuZGltcy53aWR0aCAvIHRoaXMuZ3JhcGhEaW1zLndpZHRoO1xuICAgIGxldCB6b29tTGV2ZWwgPSBNYXRoLm1pbihoZWlnaHRab29tLCB3aWR0aFpvb20sIDEpO1xuXG4gICAgaWYgKHpvb21MZXZlbCA8IHRoaXMubWluWm9vbUxldmVsKSB7XG4gICAgICB6b29tTGV2ZWwgPSB0aGlzLm1pblpvb21MZXZlbDtcbiAgICB9XG5cbiAgICBpZiAoem9vbUxldmVsID4gdGhpcy5tYXhab29tTGV2ZWwpIHtcbiAgICAgIHpvb21MZXZlbCA9IHRoaXMubWF4Wm9vbUxldmVsO1xuICAgIH1cblxuICAgIGlmICh6b29tTGV2ZWwgIT09IHRoaXMuem9vbUxldmVsKSB7XG4gICAgICB0aGlzLnpvb21MZXZlbCA9IHpvb21MZXZlbDtcbiAgICAgIHRoaXMudXBkYXRlVHJhbnNmb3JtKCk7XG4gICAgICB0aGlzLnpvb21DaGFuZ2UuZW1pdCh0aGlzLnpvb21MZXZlbCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBhbnMgdG8gdGhlIG5vZGVcbiAgICogQHBhcmFtIG5vZGVJZFxuICAgKi9cbiAgcGFuVG9Ob2RlSWQobm9kZUlkOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5ncmFwaC5ub2Rlcy5maW5kKG4gPT4gbi5pZCA9PT0gbm9kZUlkKTtcbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnBhblRvKG5vZGUucG9zaXRpb24ueCwgbm9kZS5wb3NpdGlvbi55KTtcbiAgfVxuXG4gIHByaXZhdGUgcGFuV2l0aENvbnN0cmFpbnRzKGtleTogc3RyaW5nLCBldmVudDogTW91c2VFdmVudCkge1xuICAgIGxldCB4ID0gZXZlbnQubW92ZW1lbnRYO1xuICAgIGxldCB5ID0gZXZlbnQubW92ZW1lbnRZO1xuICAgIGlmICh0aGlzLmlzTWluaW1hcFBhbm5pbmcpIHtcbiAgICAgIHggPSAtdGhpcy5taW5pbWFwU2NhbGVDb2VmZmljaWVudCAqIHggKiB0aGlzLnpvb21MZXZlbDtcbiAgICAgIHkgPSAtdGhpcy5taW5pbWFwU2NhbGVDb2VmZmljaWVudCAqIHkgKiB0aGlzLnpvb21MZXZlbDtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgY2FzZSBQYW5uaW5nQXhpcy5Ib3Jpem9udGFsOlxuICAgICAgICB0aGlzLnBhbih4LCAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFBhbm5pbmdBeGlzLlZlcnRpY2FsOlxuICAgICAgICB0aGlzLnBhbigwLCB5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aGlzLnBhbih4LCB5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVNaWRwb2ludE9uRWRnZShlZGdlOiBFZGdlLCBwb2ludHM6IGFueSk6IHZvaWQge1xuICAgIGlmICghZWRnZSB8fCAhcG9pbnRzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHBvaW50cy5sZW5ndGggJSAyID09PSAxKSB7XG4gICAgICBlZGdlLm1pZFBvaW50ID0gcG9pbnRzW01hdGguZmxvb3IocG9pbnRzLmxlbmd0aCAvIDIpXTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgX2ZpcnN0ID0gcG9pbnRzW3BvaW50cy5sZW5ndGggLyAyXTtcbiAgICAgIGNvbnN0IF9zZWNvbmQgPSBwb2ludHNbcG9pbnRzLmxlbmd0aCAvIDIgLSAxXTtcbiAgICAgIGVkZ2UubWlkUG9pbnQgPSB7XG4gICAgICAgIHg6IChfZmlyc3QueCArIF9zZWNvbmQueCkgLyAyLFxuICAgICAgICB5OiAoX2ZpcnN0LnkgKyBfc2Vjb25kLnkpIC8gMlxuICAgICAgfTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==