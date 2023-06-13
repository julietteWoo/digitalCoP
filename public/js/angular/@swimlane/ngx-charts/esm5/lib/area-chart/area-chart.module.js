import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { AreaChartComponent } from './area-chart.component';
import { AreaChartNormalizedComponent } from './area-chart-normalized.component';
import { AreaChartStackedComponent } from './area-chart-stacked.component';
import { AreaSeriesComponent } from './area-series.component';
import { ChartCommonModule } from '../common/chart-common.module';
var AreaChartModule = /** @class */ (function () {
    function AreaChartModule() {
    }
    AreaChartModule = __decorate([
        NgModule({
            imports: [ChartCommonModule],
            declarations: [AreaChartComponent, AreaChartNormalizedComponent, AreaChartStackedComponent, AreaSeriesComponent],
            exports: [AreaChartComponent, AreaChartNormalizedComponent, AreaChartStackedComponent, AreaSeriesComponent]
        })
    ], AreaChartModule);
    return AreaChartModule;
}());
export { AreaChartModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXJlYS1jaGFydC5tb2R1bGUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ac3dpbWxhbmUvbmd4LWNoYXJ0cy8iLCJzb3VyY2VzIjpbImxpYi9hcmVhLWNoYXJ0L2FyZWEtY2hhcnQubW9kdWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQzVELE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ2pGLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQzlELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBT2xFO0lBQUE7SUFBOEIsQ0FBQztJQUFsQixlQUFlO1FBTDNCLFFBQVEsQ0FBQztZQUNSLE9BQU8sRUFBRSxDQUFDLGlCQUFpQixDQUFDO1lBQzVCLFlBQVksRUFBRSxDQUFDLGtCQUFrQixFQUFFLDRCQUE0QixFQUFFLHlCQUF5QixFQUFFLG1CQUFtQixDQUFDO1lBQ2hILE9BQU8sRUFBRSxDQUFDLGtCQUFrQixFQUFFLDRCQUE0QixFQUFFLHlCQUF5QixFQUFFLG1CQUFtQixDQUFDO1NBQzVHLENBQUM7T0FDVyxlQUFlLENBQUc7SUFBRCxzQkFBQztDQUFBLEFBQS9CLElBQStCO1NBQWxCLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQXJlYUNoYXJ0Q29tcG9uZW50IH0gZnJvbSAnLi9hcmVhLWNoYXJ0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBBcmVhQ2hhcnROb3JtYWxpemVkQ29tcG9uZW50IH0gZnJvbSAnLi9hcmVhLWNoYXJ0LW5vcm1hbGl6ZWQuY29tcG9uZW50JztcbmltcG9ydCB7IEFyZWFDaGFydFN0YWNrZWRDb21wb25lbnQgfSBmcm9tICcuL2FyZWEtY2hhcnQtc3RhY2tlZC5jb21wb25lbnQnO1xuaW1wb3J0IHsgQXJlYVNlcmllc0NvbXBvbmVudCB9IGZyb20gJy4vYXJlYS1zZXJpZXMuY29tcG9uZW50JztcbmltcG9ydCB7IENoYXJ0Q29tbW9uTW9kdWxlIH0gZnJvbSAnLi4vY29tbW9uL2NoYXJ0LWNvbW1vbi5tb2R1bGUnO1xuXG5ATmdNb2R1bGUoe1xuICBpbXBvcnRzOiBbQ2hhcnRDb21tb25Nb2R1bGVdLFxuICBkZWNsYXJhdGlvbnM6IFtBcmVhQ2hhcnRDb21wb25lbnQsIEFyZWFDaGFydE5vcm1hbGl6ZWRDb21wb25lbnQsIEFyZWFDaGFydFN0YWNrZWRDb21wb25lbnQsIEFyZWFTZXJpZXNDb21wb25lbnRdLFxuICBleHBvcnRzOiBbQXJlYUNoYXJ0Q29tcG9uZW50LCBBcmVhQ2hhcnROb3JtYWxpemVkQ29tcG9uZW50LCBBcmVhQ2hhcnRTdGFja2VkQ29tcG9uZW50LCBBcmVhU2VyaWVzQ29tcG9uZW50XVxufSlcbmV4cG9ydCBjbGFzcyBBcmVhQ2hhcnRNb2R1bGUge31cbiJdfQ==