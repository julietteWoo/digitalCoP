import { id } from '../../utils/id';
import * as dagre from 'dagre';
import { Orientation } from './dagre';
export class DagreClusterLayout {
    constructor() {
        this.defaultSettings = {
            orientation: Orientation.LEFT_TO_RIGHT,
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
    run(graph) {
        this.createDagreGraph(graph);
        dagre.layout(this.dagreGraph);
        graph.edgeLabels = this.dagreGraph._edgeLabels;
        const dagreToOutput = node => {
            const dagreNode = this.dagreGraph._nodes[node.id];
            return Object.assign(Object.assign({}, node), { position: {
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
    }
    updateEdge(graph, edge) {
        const sourceNode = graph.nodes.find(n => n.id === edge.source);
        const targetNode = graph.nodes.find(n => n.id === edge.target);
        // determine new arrow position
        const dir = sourceNode.position.y <= targetNode.position.y ? -1 : 1;
        const startingPoint = {
            x: sourceNode.position.x,
            y: sourceNode.position.y - dir * (sourceNode.dimension.height / 2)
        };
        const endingPoint = {
            x: targetNode.position.x,
            y: targetNode.position.y + dir * (targetNode.dimension.height / 2)
        };
        // generate new points
        edge.points = [startingPoint, endingPoint];
        return graph;
    }
    createDagreGraph(graph) {
        const settings = Object.assign({}, this.defaultSettings, this.settings);
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
        this.dagreGraph.setDefaultEdgeLabel(() => {
            return {
            /* empty */
            };
        });
        this.dagreNodes = graph.nodes.map((n) => {
            const node = Object.assign({}, n);
            node.width = n.dimension.width;
            node.height = n.dimension.height;
            node.x = n.position.x;
            node.y = n.position.y;
            return node;
        });
        this.dagreClusters = graph.clusters || [];
        this.dagreEdges = graph.edges.map(l => {
            const newLink = Object.assign({}, l);
            if (!newLink.id) {
                newLink.id = id();
            }
            return newLink;
        });
        for (const node of this.dagreNodes) {
            this.dagreGraph.setNode(node.id, node);
        }
        for (const cluster of this.dagreClusters) {
            this.dagreGraph.setNode(cluster.id, cluster);
            cluster.childNodeIds.forEach(childNodeId => {
                this.dagreGraph.setParent(childNodeId, cluster.id);
            });
        }
        // update dagre
        for (const edge of this.dagreEdges) {
            if (settings.multigraph) {
                this.dagreGraph.setEdge(edge.source, edge.target, edge, edge.id);
            }
            else {
                this.dagreGraph.setEdge(edge.source, edge.target);
            }
        }
        return this.dagreGraph;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFncmVDbHVzdGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHN3aW1sYW5lL25neC1ncmFwaC8iLCJzb3VyY2VzIjpbImxpYi9ncmFwaC9sYXlvdXRzL2RhZ3JlQ2x1c3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDcEMsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFHL0IsT0FBTyxFQUFpQixXQUFXLEVBQUUsTUFBTSxTQUFTLENBQUM7QUFFckQsTUFBTSxPQUFPLGtCQUFrQjtJQUEvQjtRQUNFLG9CQUFlLEdBQWtCO1lBQy9CLFdBQVcsRUFBRSxXQUFXLENBQUMsYUFBYTtZQUN0QyxPQUFPLEVBQUUsRUFBRTtZQUNYLE9BQU8sRUFBRSxFQUFFO1lBQ1gsV0FBVyxFQUFFLEdBQUc7WUFDaEIsV0FBVyxFQUFFLEdBQUc7WUFDaEIsV0FBVyxFQUFFLEVBQUU7WUFDZixVQUFVLEVBQUUsSUFBSTtZQUNoQixRQUFRLEVBQUUsSUFBSTtTQUNmLENBQUM7UUFDRixhQUFRLEdBQWtCLEVBQUUsQ0FBQztJQXNIL0IsQ0FBQztJQS9HQyxHQUFHLENBQUMsS0FBWTtRQUNkLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUU5QixLQUFLLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDO1FBRS9DLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxFQUFFO1lBQzNCLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNsRCx1Q0FDSyxJQUFJLEtBQ1AsUUFBUSxFQUFFO29CQUNSLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztvQkFDZCxDQUFDLEVBQUUs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LENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3hDO1FBRUQsS0FBSyxNQUFNLE9BQU8sSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3hDLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDN0MsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0JBQ3pDLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDckQsQ0FBQyxDQUFDLENBQUM7U0FDSjtRQUVELGVBQWU7UUFDZixLQUFLLE1BQU0sSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDbEMsSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFO2dCQUN2QixJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUNsRTtpQkFBTTtnQkFDTCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUNuRDtTQUNGO1FBRUQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExheW91dCB9IGZyb20gJy4uLy4uL21vZGVscy9sYXlvdXQubW9kZWwnO1xuaW1wb3J0IHsgR3JhcGggfSBmcm9tICcuLi8uLi9tb2RlbHMvZ3JhcGgubW9kZWwnO1xuaW1wb3J0IHsgaWQgfSBmcm9tICcuLi8uLi91dGlscy9pZCc7XG5pbXBvcnQgKiBhcyBkYWdyZSBmcm9tICdkYWdyZSc7XG5pbXBvcnQgeyBFZGdlIH0gZnJvbSAnLi4vLi4vbW9kZWxzL2VkZ2UubW9kZWwnO1xuaW1wb3J0IHsgTm9kZSwgQ2x1c3Rlck5vZGUgfSBmcm9tICcuLi8uLi9tb2RlbHMvbm9kZS5tb2RlbCc7XG5pbXBvcnQgeyBEYWdyZVNldHRpbmdzLCBPcmllbnRhdGlvbiB9IGZyb20gJy4vZGFncmUnO1xuXG5leHBvcnQgY2xhc3MgRGFncmVDbHVzdGVyTGF5b3V0IGltcGxlbWVudHMgTGF5b3V0IHtcbiAgZGVmYXVsdFNldHRpbmdzOiBEYWdyZVNldHRpbmdzID0ge1xuICAgIG9yaWVudGF0aW9uOiBPcmllbnRhdGlvbi5MRUZUX1RPX1JJR0hULFxuICAgIG1hcmdpblg6IDIwLFxuICAgIG1hcmdpblk6IDIwLFxuICAgIGVkZ2VQYWRkaW5nOiAxMDAsXG4gICAgcmFua1BhZGRpbmc6IDEwMCxcbiAgICBub2RlUGFkZGluZzogNTAsXG4gICAgbXVsdGlncmFwaDogdHJ1ZSxcbiAgICBjb21wb3VuZDogdHJ1ZVxuICB9O1xuICBzZXR0aW5nczogRGFncmVTZXR0aW5ncyA9IHt9O1xuXG4gIGRhZ3JlR3JhcGg6IGFueTtcbiAgZGFncmVOb2RlczogTm9kZVtdO1xuICBkYWdyZUNsdXN0ZXJzOiBDbHVzdGVyTm9kZVtdO1xuICBkYWdyZUVkZ2VzOiBhbnk7XG5cbiAgcnVuKGdyYXBoOiBHcmFwaCk6IEdyYXBoIHtcbiAgICB0aGlzLmNyZWF0ZURhZ3JlR3JhcGgoZ3JhcGgpO1xuICAgIGRhZ3JlLmxheW91dCh0aGlzLmRhZ3JlR3JhcGgpO1xuXG4gICAgZ3JhcGguZWRnZUxhYmVscyA9IHRoaXMuZGFncmVHcmFwaC5fZWRnZUxhYmVscztcblxuICAgIGNvbnN0IGRhZ3JlVG9PdXRwdXQgPSBub2RlID0+IHtcbiAgICAgIGNvbnN0IGRhZ3JlTm9kZSA9IHRoaXMuZGFncmVHcmFwaC5fbm9kZXNbbm9kZS5pZF07XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5ub2RlLFxuICAgICAgICBwb3NpdGlvbjoge1xuICAgICAgICAgIHg6IGRhZ3JlTm9kZS54LFxuICAgICAgICAgIHk6IGRhZ3JlTm9kZS55XG4gICAgICAgIH0sXG4gICAgICAgIGRpbWVuc2lvbjoge1xuICAgICAgICAgIHdpZHRoOiBkYWdyZU5vZGUud2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiBkYWdyZU5vZGUuaGVpZ2h0XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcbiAgICBncmFwaC5jbHVzdGVycyA9IChncmFwaC5jbHVzdGVycyB8fCBbXSkubWFwKGRhZ3JlVG9PdXRwdXQpO1xuICAgIGdyYXBoLm5vZGVzID0gZ3JhcGgubm9kZXMubWFwKGRhZ3JlVG9PdXRwdXQpO1xuXG4gICAgcmV0dXJuIGdyYXBoO1xuICB9XG5cbiAgdXBkYXRlRWRnZShncmFwaDogR3JhcGgsIGVkZ2U6IEVkZ2UpOiBHcmFwaCB7XG4gICAgY29uc3Qgc291cmNlTm9kZSA9IGdyYXBoLm5vZGVzLmZpbmQobiA9PiBuLmlkID09PSBlZGdlLnNvdXJjZSk7XG4gICAgY29uc3QgdGFyZ2V0Tm9kZSA9IGdyYXBoLm5vZGVzLmZpbmQobiA9PiBuLmlkID09PSBlZGdlLnRhcmdldCk7XG5cbiAgICAvLyBkZXRlcm1pbmUgbmV3IGFycm93IHBvc2l0aW9uXG4gICAgY29uc3QgZGlyID0gc291cmNlTm9kZS5wb3NpdGlvbi55IDw9IHRhcmdldE5vZGUucG9zaXRpb24ueSA/IC0xIDogMTtcbiAgICBjb25zdCBzdGFydGluZ1BvaW50ID0ge1xuICAgICAgeDogc291cmNlTm9kZS5wb3NpdGlvbi54LFxuICAgICAgeTogc291cmNlTm9kZS5wb3NpdGlvbi55IC0gZGlyICogKHNvdXJjZU5vZGUuZGltZW5zaW9uLmhlaWdodCAvIDIpXG4gICAgfTtcbiAgICBjb25zdCBlbmRpbmdQb2ludCA9IHtcbiAgICAgIHg6IHRhcmdldE5vZGUucG9zaXRpb24ueCxcbiAgICAgIHk6IHRhcmdldE5vZGUucG9zaXRpb24ueSArIGRpciAqICh0YXJnZXROb2RlLmRpbWVuc2lvbi5oZWlnaHQgLyAyKVxuICAgIH07XG5cbiAgICAvLyBnZW5lcmF0ZSBuZXcgcG9pbnRzXG4gICAgZWRnZS5wb2ludHMgPSBbc3RhcnRpbmdQb2ludCwgZW5kaW5nUG9pbnRdO1xuICAgIHJldHVybiBncmFwaDtcbiAgfVxuXG4gIGNyZWF0ZURhZ3JlR3JhcGgoZ3JhcGg6IEdyYXBoKTogYW55IHtcbiAgICBjb25zdCBzZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIHRoaXMuZGVmYXVsdFNldHRpbmdzLCB0aGlzLnNldHRpbmdzKTtcbiAgICB0aGlzLmRhZ3JlR3JhcGggPSBuZXcgZGFncmUuZ3JhcGhsaWIuR3JhcGgoeyBjb21wb3VuZDogc2V0dGluZ3MuY29tcG91bmQsIG11bHRpZ3JhcGg6IHNldHRpbmdzLm11bHRpZ3JhcGggfSk7XG4gICAgdGhpcy5kYWdyZUdyYXBoLnNldEdyYXBoKHtcbiAgICAgIHJhbmtkaXI6IHNldHRpbmdzLm9yaWVudGF0aW9uLFxuICAgICAgbWFyZ2lueDogc2V0dGluZ3MubWFyZ2luWCxcbiAgICAgIG1hcmdpbnk6IHNldHRpbmdzLm1hcmdpblksXG4gICAgICBlZGdlc2VwOiBzZXR0aW5ncy5lZGdlUGFkZGluZyxcbiAgICAgIHJhbmtzZXA6IHNldHRpbmdzLnJhbmtQYWRkaW5nLFxuICAgICAgbm9kZXNlcDogc2V0dGluZ3Mubm9kZVBhZGRpbmcsXG4gICAgICBhbGlnbjogc2V0dGluZ3MuYWxpZ24sXG4gICAgICBhY3ljbGljZXI6IHNldHRpbmdzLmFjeWNsaWNlcixcbiAgICAgIHJhbmtlcjogc2V0dGluZ3MucmFua2VyLFxuICAgICAgbXVsdGlncmFwaDogc2V0dGluZ3MubXVsdGlncmFwaCxcbiAgICAgIGNvbXBvdW5kOiBzZXR0aW5ncy5jb21wb3VuZFxuICAgIH0pO1xuXG4gICAgLy8gRGVmYXVsdCB0byBhc3NpZ25pbmcgYSBuZXcgb2JqZWN0IGFzIGEgbGFiZWwgZm9yIGVhY2ggbmV3IGVkZ2UuXG4gICAgdGhpcy5kYWdyZUdyYXBoLnNldERlZmF1bHRFZGdlTGFiZWwoKCkgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLyogZW1wdHkgKi9cbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICB0aGlzLmRhZ3JlTm9kZXMgPSBncmFwaC5ub2Rlcy5tYXAoKG46IE5vZGUpID0+IHtcbiAgICAgIGNvbnN0IG5vZGU6IGFueSA9IE9iamVjdC5hc3NpZ24oe30sIG4pO1xuICAgICAgbm9kZS53aWR0aCA9IG4uZGltZW5zaW9uLndpZHRoO1xuICAgICAgbm9kZS5oZWlnaHQgPSBuLmRpbWVuc2lvbi5oZWlnaHQ7XG4gICAgICBub2RlLnggPSBuLnBvc2l0aW9uLng7XG4gICAgICBub2RlLnkgPSBuLnBvc2l0aW9uLnk7XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9KTtcblxuICAgIHRoaXMuZGFncmVDbHVzdGVycyA9IGdyYXBoLmNsdXN0ZXJzIHx8IFtdO1xuXG4gICAgdGhpcy5kYWdyZUVkZ2VzID0gZ3JhcGguZWRnZXMubWFwKGwgPT4ge1xuICAgICAgY29uc3QgbmV3TGluazogYW55ID0gT2JqZWN0LmFzc2lnbih7fSwgbCk7XG4gICAgICBpZiAoIW5ld0xpbmsuaWQpIHtcbiAgICAgICAgbmV3TGluay5pZCA9IGlkKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3TGluaztcbiAgICB9KTtcblxuICAgIGZvciAoY29uc3Qgbm9kZSBvZiB0aGlzLmRhZ3JlTm9kZXMpIHtcbiAgICAgIHRoaXMuZGFncmVHcmFwaC5zZXROb2RlKG5vZGUuaWQsIG5vZGUpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgY2x1c3RlciBvZiB0aGlzLmRhZ3JlQ2x1c3RlcnMpIHtcbiAgICAgIHRoaXMuZGFncmVHcmFwaC5zZXROb2RlKGNsdXN0ZXIuaWQsIGNsdXN0ZXIpO1xuICAgICAgY2x1c3Rlci5jaGlsZE5vZGVJZHMuZm9yRWFjaChjaGlsZE5vZGVJZCA9PiB7XG4gICAgICAgIHRoaXMuZGFncmVHcmFwaC5zZXRQYXJlbnQoY2hpbGROb2RlSWQsIGNsdXN0ZXIuaWQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gdXBkYXRlIGRhZ3JlXG4gICAgZm9yIChjb25zdCBlZGdlIG9mIHRoaXMuZGFncmVFZGdlcykge1xuICAgICAgaWYgKHNldHRpbmdzLm11bHRpZ3JhcGgpIHtcbiAgICAgICAgdGhpcy5kYWdyZUdyYXBoLnNldEVkZ2UoZWRnZS5zb3VyY2UsIGVkZ2UudGFyZ2V0LCBlZGdlLCBlZGdlLmlkKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZGFncmVHcmFwaC5zZXRFZGdlKGVkZ2Uuc291cmNlLCBlZGdlLnRhcmdldCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZGFncmVHcmFwaDtcbiAgfVxufVxuIl19