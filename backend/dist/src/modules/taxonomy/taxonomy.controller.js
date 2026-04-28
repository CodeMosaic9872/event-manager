"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxonomyController = void 0;
const common_1 = require("@nestjs/common");
const taxonomy_service_1 = require("./taxonomy.service");
const taxonomy_mapping_query_dto_1 = require("./dto/taxonomy-mapping-query.dto");
let TaxonomyController = class TaxonomyController {
    constructor(taxonomyService) {
        this.taxonomyService = taxonomyService;
    }
    eventTypes() {
        return this.taxonomyService.getEventTypes();
    }
    categories() {
        return this.taxonomyService.getCategories();
    }
    subcategories(categoryId) {
        return this.taxonomyService.getSubcategories(categoryId);
    }
    filterDefinitions(categoryId) {
        return this.taxonomyService.getFilterDefinitions(categoryId);
    }
    mapping(query) {
        return this.taxonomyService.getMapping(query);
    }
};
exports.TaxonomyController = TaxonomyController;
__decorate([
    (0, common_1.Get)('event-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TaxonomyController.prototype, "eventTypes", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TaxonomyController.prototype, "categories", null);
__decorate([
    (0, common_1.Get)('categories/:id/subcategories'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TaxonomyController.prototype, "subcategories", null);
__decorate([
    (0, common_1.Get)('filter-definitions'),
    __param(0, (0, common_1.Query)('categoryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TaxonomyController.prototype, "filterDefinitions", null);
__decorate([
    (0, common_1.Get)('mapping'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [taxonomy_mapping_query_dto_1.TaxonomyMappingQueryDto]),
    __metadata("design:returntype", void 0)
], TaxonomyController.prototype, "mapping", null);
exports.TaxonomyController = TaxonomyController = __decorate([
    (0, common_1.Controller)('taxonomy'),
    __metadata("design:paramtypes", [taxonomy_service_1.TaxonomyService])
], TaxonomyController);
//# sourceMappingURL=taxonomy.controller.js.map