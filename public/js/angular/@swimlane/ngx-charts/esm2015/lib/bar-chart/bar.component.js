import { __decorate } from "tslib";
import { Component, Input, Output, EventEmitter, HostListener, ElementRef, SimpleChanges, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { select } from 'd3-selection';
import { roundedRect } from '../common/shape.helper';
import { id } from '../utils/id';
let BarComponent = class BarComponent {
    constructor(element) {
        this.roundEdges = true;
        this.gradient = false;
        this.offset = 0;
        this.isActive = false;
        this.animations = true;
        this.noBarWhenZero = true;
        this.select = new EventEmitter();
        this.activate = new EventEmitter();
        this.deactivate = new EventEmitter();
        this.hasGradient = false;
        this.hideBar = false;
        this.element = element.nativeElement;
    }
    ngOnChanges(changes) {
        if (changes.roundEdges) {
            this.loadAnimation();
        }
        this.update();
    }
    update() {
        this.gradientId = 'grad' + id().toString();
        this.gradientFill = `url(#${this.gradientId})`;
        if (this.gradient || this.stops) {
            this.gradientStops = this.getGradient();
            this.hasGradient = true;
        }
        else {
            this.hasGradient = false;
        }
        this.updatePathEl();
        this.checkToHideBar();
    }
    loadAnimation() {
        this.path = this.getStartingPath();
        setTimeout(this.update.bind(this), 100);
    }
    updatePathEl() {
        const node = select(this.element).select('.bar');
        const path = this.getPath();
        if (this.animations) {
            node
                .transition()
                .duration(500)
                .attr('d', path);
        }
        else {
            node.attr('d', path);
        }
    }
    getGradient() {
        if (this.stops) {
            return this.stops;
        }
        return [
            {
                offset: 0,
                color: this.fill,
                opacity: this.getStartOpacity()
            },
            {
                offset: 100,
                color: this.fill,
                opacity: 1
            }
        ];
    }
    getStartingPath() {
        if (!this.animations) {
            return this.getPath();
        }
        let radius = this.getRadius();
        let path;
        if (this.roundEdges) {
            if (this.orientation === 'vertical') {
                radius = Math.min(this.height, radius);
                path = roundedRect(this.x, this.y + this.height, this.width, 1, 0, this.edges);
            }
            else if (this.orientation === 'horizontal') {
                radius = Math.min(this.width, radius);
                path = roundedRect(this.x, this.y, 1, this.height, 0, this.edges);
            }
        }
        else {
            if (this.orientation === 'vertical') {
                path = roundedRect(this.x, this.y + this.height, this.width, 1, 0, this.edges);
            }
            else if (this.orientation === 'horizontal') {
                path = roundedRect(this.x, this.y, 1, this.height, 0, this.edges);
            }
        }
        return path;
    }
    getPath() {
        let radius = this.getRadius();
        let path;
        if (this.roundEdges) {
            if (this.orientation === 'vertical') {
                radius = Math.min(this.height, radius);
                path = roundedRect(this.x, this.y, this.width, this.height, radius, this.edges);
            }
            else if (this.orientation === 'horizontal') {
                radius = Math.min(this.width, radius);
                path = roundedRect(this.x, this.y, this.width, this.height, radius, this.edges);
            }
        }
        else {
            path = roundedRect(this.x, this.y, this.width, this.height, radius, this.edges);
        }
        return path;
    }
    getRadius() {
        let radius = 0;
        if (this.roundEdges && this.height > 5 && this.width > 5) {
            radius = Math.floor(Math.min(5, this.height / 2, this.width / 2));
        }
        return radius;
    }
    getStartOpacity() {
        if (this.roundEdges) {
            return 0.2;
        }
        else {
            return 0.5;
        }
    }
    get edges() {
        let edges = [false, false, false, false];
        if (this.roundEdges) {
            if (this.orientation === 'vertical') {
                if (this.data.value > 0) {
                    edges = [true, true, false, false];
                }
                else {
                    edges = [false, false, true, true];
                }
            }
            else if (this.orientation === 'horizontal') {
                if (this.data.value > 0) {
                    edges = [false, true, false, true];
                }
                else {
                    edges = [true, false, true, false];
                }
            }
        }
        return edges;
    }
    onMouseEnter() {
        this.activate.emit(this.data);
    }
    onMouseLeave() {
        this.deactivate.emit(this.data);
    }
    checkToHideBar() {
        this.hideBar =
            this.noBarWhenZero &&
                ((this.orientation === 'vertical' && this.height === 0) ||
                    (this.orientation === 'horizontal' && this.width === 0));
    }
};
BarComponent.ctorParameters = () => [
    { type: ElementRef }
];
__decorate([
    Input()
], BarComponent.prototype, "fill", void 0);
__decorate([
    Input()
], BarComponent.prototype, "data", void 0);
__decorate([
    Input()
], BarComponent.prototype, "width", void 0);
__decorate([
    Input()
], BarComponent.prototype, "height", void 0);
__decorate([
    Input()
], BarComponent.prototype, "x", void 0);
__decorate([
    Input()
], BarComponent.prototype, "y", void 0);
__decorate([
    Input()
], BarComponent.prototype, "orientation", void 0);
__decorate([
    Input()
], BarComponent.prototype, "roundEdges", void 0);
__decorate([
    Input()
], BarComponent.prototype, "gradient", void 0);
__decorate([
    Input()
], BarComponent.prototype, "offset", void 0);
__decorate([
    Input()
], BarComponent.prototype, "isActive", void 0);
__decorate([
    Input()
], BarComponent.prototype, "stops", void 0);
__decorate([
    Input()
], BarComponent.prototype, "animations", void 0);
__decorate([
    Input()
], BarComponent.prototype, "ariaLabel", void 0);
__decorate([
    Input()
], BarComponent.prototype, "noBarWhenZero", void 0);
__decorate([
    Output()
], BarComponent.prototype, "select", void 0);
__decorate([
    Output()
], BarComponent.prototype, "activate", void 0);
__decorate([
    Output()
], BarComponent.prototype, "deactivate", void 0);
__decorate([
    HostListener('mouseenter')
], BarComponent.prototype, "onMouseEnter", null);
__decorate([
    HostListener('mouseleave')
], BarComponent.prototype, "onMouseLeave", null);
BarComponent = __decorate([
    Component({
        selector: 'g[ngx-charts-bar]',
        template: `
    <svg:defs *ngIf="hasGradient">
      <svg:g ngx-charts-svg-linear-gradient [orientation]="orientation" [name]="gradientId" [stops]="gradientStops" />
    </svg:defs>
    <svg:path
      class="bar"
      stroke="none"
      role="img"
      tabIndex="-1"
      [class.active]="isActive"
      [class.hidden]="hideBar"
      [attr.d]="path"
      [attr.aria-label]="ariaLabel"
      [attr.fill]="hasGradient ? gradientFill : fill"
      (click)="select.emit(data)"
    />
  `,
        changeDetection: ChangeDetectionStrategy.OnPush
    })
], BarComponent);
export { BarComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0Bzd2ltbGFuZS9uZ3gtY2hhcnRzLyIsInNvdXJjZXMiOlsibGliL2Jhci1jaGFydC9iYXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0wsU0FBUyxFQUNULEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLFlBQVksRUFDWixVQUFVLEVBQ1YsYUFBYSxFQUNiLFNBQVMsRUFDVCx1QkFBdUIsRUFDeEIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUN0QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDckQsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQTBCakMsSUFBYSxZQUFZLEdBQXpCLE1BQWEsWUFBWTtJQThCdkIsWUFBWSxPQUFtQjtRQXRCdEIsZUFBVSxHQUFZLElBQUksQ0FBQztRQUMzQixhQUFRLEdBQVksS0FBSyxDQUFDO1FBQzFCLFdBQU0sR0FBRyxDQUFDLENBQUM7UUFDWCxhQUFRLEdBQVksS0FBSyxDQUFDO1FBRTFCLGVBQVUsR0FBWSxJQUFJLENBQUM7UUFFM0Isa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFFN0IsV0FBTSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDNUIsYUFBUSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFDOUIsZUFBVSxHQUFHLElBQUksWUFBWSxFQUFFLENBQUM7UUFRMUMsZ0JBQVcsR0FBWSxLQUFLLENBQUM7UUFDN0IsWUFBTyxHQUFZLEtBQUssQ0FBQztRQUd2QixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7SUFDdkMsQ0FBQztJQUVELFdBQVcsQ0FBQyxPQUFzQjtRQUNoQyxJQUFJLE9BQU8sQ0FBQyxVQUFVLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1NBQ3RCO1FBQ0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQ2hCLENBQUM7SUFFRCxNQUFNO1FBQ0osSUFBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLEdBQUcsRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDM0MsSUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQztRQUUvQyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtZQUMvQixJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN4QyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztTQUN6QjthQUFNO1lBQ0wsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7U0FDMUI7UUFFRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFRCxhQUFhO1FBQ1gsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDbkMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxZQUFZO1FBQ1YsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDakQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVCLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNuQixJQUFJO2lCQUNELFVBQVUsRUFBRTtpQkFDWixRQUFRLENBQUMsR0FBRyxDQUFDO2lCQUNiLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDcEI7YUFBTTtZQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3RCO0lBQ0gsQ0FBQztJQUVELFdBQVc7UUFDVCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7U0FDbkI7UUFFRCxPQUFPO1lBQ0w7Z0JBQ0UsTUFBTSxFQUFFLENBQUM7Z0JBQ1QsS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNoQixPQUFPLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRTthQUNoQztZQUNEO2dCQUNFLE1BQU0sRUFBRSxHQUFHO2dCQUNYLEtBQUssRUFBRSxJQUFJLENBQUMsSUFBSTtnQkFDaEIsT0FBTyxFQUFFLENBQUM7YUFDWDtTQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQ3ZCO1FBRUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzlCLElBQUksSUFBSSxDQUFDO1FBRVQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ25CLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxVQUFVLEVBQUU7Z0JBQ25DLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNoRjtpQkFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssWUFBWSxFQUFFO2dCQUM1QyxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN0QyxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ25FO1NBQ0Y7YUFBTTtZQUNMLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxVQUFVLEVBQUU7Z0JBQ25DLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNoRjtpQkFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssWUFBWSxFQUFFO2dCQUM1QyxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ25FO1NBQ0Y7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxPQUFPO1FBQ0wsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzlCLElBQUksSUFBSSxDQUFDO1FBRVQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ25CLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxVQUFVLEVBQUU7Z0JBQ25DLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3ZDLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2pGO2lCQUFNLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxZQUFZLEVBQUU7Z0JBQzVDLE1BQU0sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3RDLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2pGO1NBQ0Y7YUFBTTtZQUNMLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsU0FBUztRQUNQLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztRQUVmLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtZQUN4RCxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkU7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsZUFBZTtRQUNiLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNuQixPQUFPLEdBQUcsQ0FBQztTQUNaO2FBQU07WUFDTCxPQUFPLEdBQUcsQ0FBQztTQUNaO0lBQ0gsQ0FBQztJQUVELElBQUksS0FBSztRQUNQLElBQUksS0FBSyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ25CLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxVQUFVLEVBQUU7Z0JBQ25DLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO29CQUN2QixLQUFLLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDcEM7cUJBQU07b0JBQ0wsS0FBSyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7aUJBQ3BDO2FBQ0Y7aUJBQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLFlBQVksRUFBRTtnQkFDNUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7b0JBQ3ZCLEtBQUssR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUNwQztxQkFBTTtvQkFDTCxLQUFLLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztpQkFDcEM7YUFDRjtTQUNGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBR0QsWUFBWTtRQUNWLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBR0QsWUFBWTtRQUNWLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRU8sY0FBYztRQUNwQixJQUFJLENBQUMsT0FBTztZQUNWLElBQUksQ0FBQyxhQUFhO2dCQUNsQixDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxVQUFVLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7b0JBQ3JELENBQUMsSUFBSSxDQUFDLFdBQVcsS0FBSyxZQUFZLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7Q0FDRixDQUFBOztZQW5Lc0IsVUFBVTs7QUE3QnRCO0lBQVIsS0FBSyxFQUFFOzBDQUFNO0FBQ0w7SUFBUixLQUFLLEVBQUU7MENBQVc7QUFDVjtJQUFSLEtBQUssRUFBRTsyQ0FBZTtBQUNkO0lBQVIsS0FBSyxFQUFFOzRDQUFnQjtBQUNmO0lBQVIsS0FBSyxFQUFFO3VDQUFXO0FBQ1Y7SUFBUixLQUFLLEVBQUU7dUNBQVc7QUFDVjtJQUFSLEtBQUssRUFBRTtpREFBYTtBQUNaO0lBQVIsS0FBSyxFQUFFO2dEQUE0QjtBQUMzQjtJQUFSLEtBQUssRUFBRTs4Q0FBMkI7QUFDMUI7SUFBUixLQUFLLEVBQUU7NENBQVk7QUFDWDtJQUFSLEtBQUssRUFBRTs4Q0FBMkI7QUFDMUI7SUFBUixLQUFLLEVBQUU7MkNBQWM7QUFDYjtJQUFSLEtBQUssRUFBRTtnREFBNEI7QUFDM0I7SUFBUixLQUFLLEVBQUU7K0NBQW1CO0FBQ2xCO0lBQVIsS0FBSyxFQUFFO21EQUErQjtBQUU3QjtJQUFULE1BQU0sRUFBRTs0Q0FBNkI7QUFDNUI7SUFBVCxNQUFNLEVBQUU7OENBQStCO0FBQzlCO0lBQVQsTUFBTSxFQUFFO2dEQUFpQztBQStKMUM7SUFEQyxZQUFZLENBQUMsWUFBWSxDQUFDO2dEQUcxQjtBQUdEO0lBREMsWUFBWSxDQUFDLFlBQVksQ0FBQztnREFHMUI7QUF6TFUsWUFBWTtJQXJCeEIsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLG1CQUFtQjtRQUM3QixRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQlQ7UUFDRCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtLQUNoRCxDQUFDO0dBQ1csWUFBWSxDQWlNeEI7U0FqTVksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIENvbXBvbmVudCxcbiAgSW5wdXQsXG4gIE91dHB1dCxcbiAgRXZlbnRFbWl0dGVyLFxuICBIb3N0TGlzdGVuZXIsXG4gIEVsZW1lbnRSZWYsXG4gIFNpbXBsZUNoYW5nZXMsXG4gIE9uQ2hhbmdlcyxcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3lcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBzZWxlY3QgfSBmcm9tICdkMy1zZWxlY3Rpb24nO1xuaW1wb3J0IHsgcm91bmRlZFJlY3QgfSBmcm9tICcuLi9jb21tb24vc2hhcGUuaGVscGVyJztcbmltcG9ydCB7IGlkIH0gZnJvbSAnLi4vdXRpbHMvaWQnO1xuXG4vKiB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmUgKi9cbmltcG9ydCB7IHRyYW5zaXRpb24gfSBmcm9tICdkMy10cmFuc2l0aW9uJztcblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZ1tuZ3gtY2hhcnRzLWJhcl0nLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxzdmc6ZGVmcyAqbmdJZj1cImhhc0dyYWRpZW50XCI+XG4gICAgICA8c3ZnOmcgbmd4LWNoYXJ0cy1zdmctbGluZWFyLWdyYWRpZW50IFtvcmllbnRhdGlvbl09XCJvcmllbnRhdGlvblwiIFtuYW1lXT1cImdyYWRpZW50SWRcIiBbc3RvcHNdPVwiZ3JhZGllbnRTdG9wc1wiIC8+XG4gICAgPC9zdmc6ZGVmcz5cbiAgICA8c3ZnOnBhdGhcbiAgICAgIGNsYXNzPVwiYmFyXCJcbiAgICAgIHN0cm9rZT1cIm5vbmVcIlxuICAgICAgcm9sZT1cImltZ1wiXG4gICAgICB0YWJJbmRleD1cIi0xXCJcbiAgICAgIFtjbGFzcy5hY3RpdmVdPVwiaXNBY3RpdmVcIlxuICAgICAgW2NsYXNzLmhpZGRlbl09XCJoaWRlQmFyXCJcbiAgICAgIFthdHRyLmRdPVwicGF0aFwiXG4gICAgICBbYXR0ci5hcmlhLWxhYmVsXT1cImFyaWFMYWJlbFwiXG4gICAgICBbYXR0ci5maWxsXT1cImhhc0dyYWRpZW50ID8gZ3JhZGllbnRGaWxsIDogZmlsbFwiXG4gICAgICAoY2xpY2spPVwic2VsZWN0LmVtaXQoZGF0YSlcIlxuICAgIC8+XG4gIGAsXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXG59KVxuZXhwb3J0IGNsYXNzIEJhckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIEBJbnB1dCgpIGZpbGw7XG4gIEBJbnB1dCgpIGRhdGE6IGFueTtcbiAgQElucHV0KCkgd2lkdGg6IG51bWJlcjtcbiAgQElucHV0KCkgaGVpZ2h0OiBudW1iZXI7XG4gIEBJbnB1dCgpIHg6IG51bWJlcjtcbiAgQElucHV0KCkgeTogbnVtYmVyO1xuICBASW5wdXQoKSBvcmllbnRhdGlvbjtcbiAgQElucHV0KCkgcm91bmRFZGdlczogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIGdyYWRpZW50OiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIG9mZnNldCA9IDA7XG4gIEBJbnB1dCgpIGlzQWN0aXZlOiBib29sZWFuID0gZmFsc2U7XG4gIEBJbnB1dCgpIHN0b3BzOiBhbnlbXTtcbiAgQElucHV0KCkgYW5pbWF0aW9uczogYm9vbGVhbiA9IHRydWU7XG4gIEBJbnB1dCgpIGFyaWFMYWJlbDogc3RyaW5nO1xuICBASW5wdXQoKSBub0JhcldoZW5aZXJvOiBib29sZWFuID0gdHJ1ZTtcblxuICBAT3V0cHV0KCkgc2VsZWN0ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICBAT3V0cHV0KCkgYWN0aXZhdGUgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIEBPdXRwdXQoKSBkZWFjdGl2YXRlID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gIGVsZW1lbnQ6IGFueTtcbiAgcGF0aDogYW55O1xuICBncmFkaWVudElkOiBhbnk7XG4gIGdyYWRpZW50RmlsbDogYW55O1xuICBzdGFydE9wYWNpdHk6IGFueTtcbiAgZ3JhZGllbnRTdG9wczogYW55W107XG4gIGhhc0dyYWRpZW50OiBib29sZWFuID0gZmFsc2U7XG4gIGhpZGVCYXI6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihlbGVtZW50OiBFbGVtZW50UmVmKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudC5uYXRpdmVFbGVtZW50O1xuICB9XG5cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQge1xuICAgIGlmIChjaGFuZ2VzLnJvdW5kRWRnZXMpIHtcbiAgICAgIHRoaXMubG9hZEFuaW1hdGlvbigpO1xuICAgIH1cbiAgICB0aGlzLnVwZGF0ZSgpO1xuICB9XG5cbiAgdXBkYXRlKCk6IHZvaWQge1xuICAgIHRoaXMuZ3JhZGllbnRJZCA9ICdncmFkJyArIGlkKCkudG9TdHJpbmcoKTtcbiAgICB0aGlzLmdyYWRpZW50RmlsbCA9IGB1cmwoIyR7dGhpcy5ncmFkaWVudElkfSlgO1xuXG4gICAgaWYgKHRoaXMuZ3JhZGllbnQgfHwgdGhpcy5zdG9wcykge1xuICAgICAgdGhpcy5ncmFkaWVudFN0b3BzID0gdGhpcy5nZXRHcmFkaWVudCgpO1xuICAgICAgdGhpcy5oYXNHcmFkaWVudCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGFzR3JhZGllbnQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0ZVBhdGhFbCgpO1xuICAgIHRoaXMuY2hlY2tUb0hpZGVCYXIoKTtcbiAgfVxuXG4gIGxvYWRBbmltYXRpb24oKTogdm9pZCB7XG4gICAgdGhpcy5wYXRoID0gdGhpcy5nZXRTdGFydGluZ1BhdGgoKTtcbiAgICBzZXRUaW1lb3V0KHRoaXMudXBkYXRlLmJpbmQodGhpcyksIDEwMCk7XG4gIH1cblxuICB1cGRhdGVQYXRoRWwoKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHNlbGVjdCh0aGlzLmVsZW1lbnQpLnNlbGVjdCgnLmJhcicpO1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLmdldFBhdGgoKTtcbiAgICBpZiAodGhpcy5hbmltYXRpb25zKSB7XG4gICAgICBub2RlXG4gICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgLmR1cmF0aW9uKDUwMClcbiAgICAgICAgLmF0dHIoJ2QnLCBwYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZS5hdHRyKCdkJywgcGF0aCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0R3JhZGllbnQoKSB7XG4gICAgaWYgKHRoaXMuc3RvcHMpIHtcbiAgICAgIHJldHVybiB0aGlzLnN0b3BzO1xuICAgIH1cblxuICAgIHJldHVybiBbXG4gICAgICB7XG4gICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgY29sb3I6IHRoaXMuZmlsbCxcbiAgICAgICAgb3BhY2l0eTogdGhpcy5nZXRTdGFydE9wYWNpdHkoKVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgb2Zmc2V0OiAxMDAsXG4gICAgICAgIGNvbG9yOiB0aGlzLmZpbGwsXG4gICAgICAgIG9wYWNpdHk6IDFcbiAgICAgIH1cbiAgICBdO1xuICB9XG5cbiAgZ2V0U3RhcnRpbmdQYXRoKCkge1xuICAgIGlmICghdGhpcy5hbmltYXRpb25zKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRQYXRoKCk7XG4gICAgfVxuXG4gICAgbGV0IHJhZGl1cyA9IHRoaXMuZ2V0UmFkaXVzKCk7XG4gICAgbGV0IHBhdGg7XG5cbiAgICBpZiAodGhpcy5yb3VuZEVkZ2VzKSB7XG4gICAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgICByYWRpdXMgPSBNYXRoLm1pbih0aGlzLmhlaWdodCwgcmFkaXVzKTtcbiAgICAgICAgcGF0aCA9IHJvdW5kZWRSZWN0KHRoaXMueCwgdGhpcy55ICsgdGhpcy5oZWlnaHQsIHRoaXMud2lkdGgsIDEsIDAsIHRoaXMuZWRnZXMpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgcmFkaXVzID0gTWF0aC5taW4odGhpcy53aWR0aCwgcmFkaXVzKTtcbiAgICAgICAgcGF0aCA9IHJvdW5kZWRSZWN0KHRoaXMueCwgdGhpcy55LCAxLCB0aGlzLmhlaWdodCwgMCwgdGhpcy5lZGdlcyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAndmVydGljYWwnKSB7XG4gICAgICAgIHBhdGggPSByb3VuZGVkUmVjdCh0aGlzLngsIHRoaXMueSArIHRoaXMuaGVpZ2h0LCB0aGlzLndpZHRoLCAxLCAwLCB0aGlzLmVkZ2VzKTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XG4gICAgICAgIHBhdGggPSByb3VuZGVkUmVjdCh0aGlzLngsIHRoaXMueSwgMSwgdGhpcy5oZWlnaHQsIDAsIHRoaXMuZWRnZXMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBwYXRoO1xuICB9XG5cbiAgZ2V0UGF0aCgpIHtcbiAgICBsZXQgcmFkaXVzID0gdGhpcy5nZXRSYWRpdXMoKTtcbiAgICBsZXQgcGF0aDtcblxuICAgIGlmICh0aGlzLnJvdW5kRWRnZXMpIHtcbiAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAndmVydGljYWwnKSB7XG4gICAgICAgIHJhZGl1cyA9IE1hdGgubWluKHRoaXMuaGVpZ2h0LCByYWRpdXMpO1xuICAgICAgICBwYXRoID0gcm91bmRlZFJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0LCByYWRpdXMsIHRoaXMuZWRnZXMpO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcpIHtcbiAgICAgICAgcmFkaXVzID0gTWF0aC5taW4odGhpcy53aWR0aCwgcmFkaXVzKTtcbiAgICAgICAgcGF0aCA9IHJvdW5kZWRSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgcmFkaXVzLCB0aGlzLmVkZ2VzKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcGF0aCA9IHJvdW5kZWRSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCwgcmFkaXVzLCB0aGlzLmVkZ2VzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcGF0aDtcbiAgfVxuXG4gIGdldFJhZGl1cygpOiBudW1iZXIge1xuICAgIGxldCByYWRpdXMgPSAwO1xuXG4gICAgaWYgKHRoaXMucm91bmRFZGdlcyAmJiB0aGlzLmhlaWdodCA+IDUgJiYgdGhpcy53aWR0aCA+IDUpIHtcbiAgICAgIHJhZGl1cyA9IE1hdGguZmxvb3IoTWF0aC5taW4oNSwgdGhpcy5oZWlnaHQgLyAyLCB0aGlzLndpZHRoIC8gMikpO1xuICAgIH1cblxuICAgIHJldHVybiByYWRpdXM7XG4gIH1cblxuICBnZXRTdGFydE9wYWNpdHkoKTogbnVtYmVyIHtcbiAgICBpZiAodGhpcy5yb3VuZEVkZ2VzKSB7XG4gICAgICByZXR1cm4gMC4yO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gMC41O1xuICAgIH1cbiAgfVxuXG4gIGdldCBlZGdlcygpIHtcbiAgICBsZXQgZWRnZXMgPSBbZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2VdO1xuICAgIGlmICh0aGlzLnJvdW5kRWRnZXMpIHtcbiAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAndmVydGljYWwnKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGEudmFsdWUgPiAwKSB7XG4gICAgICAgICAgZWRnZXMgPSBbdHJ1ZSwgdHJ1ZSwgZmFsc2UsIGZhbHNlXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlZGdlcyA9IFtmYWxzZSwgZmFsc2UsIHRydWUsIHRydWVdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJykge1xuICAgICAgICBpZiAodGhpcy5kYXRhLnZhbHVlID4gMCkge1xuICAgICAgICAgIGVkZ2VzID0gW2ZhbHNlLCB0cnVlLCBmYWxzZSwgdHJ1ZV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWRnZXMgPSBbdHJ1ZSwgZmFsc2UsIHRydWUsIGZhbHNlXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZWRnZXM7XG4gIH1cblxuICBASG9zdExpc3RlbmVyKCdtb3VzZWVudGVyJylcbiAgb25Nb3VzZUVudGVyKCk6IHZvaWQge1xuICAgIHRoaXMuYWN0aXZhdGUuZW1pdCh0aGlzLmRhdGEpO1xuICB9XG5cbiAgQEhvc3RMaXN0ZW5lcignbW91c2VsZWF2ZScpXG4gIG9uTW91c2VMZWF2ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlYWN0aXZhdGUuZW1pdCh0aGlzLmRhdGEpO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGVja1RvSGlkZUJhcigpIHtcbiAgICB0aGlzLmhpZGVCYXIgPVxuICAgICAgdGhpcy5ub0JhcldoZW5aZXJvICYmXG4gICAgICAoKHRoaXMub3JpZW50YXRpb24gPT09ICd2ZXJ0aWNhbCcgJiYgdGhpcy5oZWlnaHQgPT09IDApIHx8XG4gICAgICAgICh0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcgJiYgdGhpcy53aWR0aCA9PT0gMCkpO1xuICB9XG59XG4iXX0=