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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxonomyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TaxonomyService = class TaxonomyService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getEventTypes() {
        return this.prisma.eventType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    }
    getCategories() {
        return this.prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    }
    getSubcategories(categoryId) {
        return this.prisma.subcategory.findMany({
            where: { categoryId, isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
    }
    getFilterDefinitions(categoryId) {
        return this.prisma.filterDefinition.findMany({
            where: {
                isActive: true,
                OR: [{ scope: 'GLOBAL' }, categoryId ? { scope: 'CATEGORY', categoryId } : undefined].filter(Boolean),
            },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async getMapping(query) {
        const mappings = await this.prisma.eventCategorySubcategoryMap.findMany({
            where: {
                eventTypeId: query.eventTypeId ?? undefined,
                categoryId: query.categoryId ?? undefined,
            },
            include: {
                eventType: { select: { id: true, key: true, name: true } },
                category: { select: { id: true, key: true, name: true } },
                subcategory: { select: { id: true, key: true, name: true } },
            },
            orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
        });
        return {
            filters: {
                eventTypeId: query.eventTypeId ?? null,
                categoryId: query.categoryId ?? null,
            },
            count: mappings.length,
            items: mappings.map((row) => ({
                eventType: row.eventType,
                category: row.category,
                subcategory: row.subcategory,
                priority: row.priority,
                isDefault: row.isDefault,
            })),
        };
    }
};
exports.TaxonomyService = TaxonomyService;
exports.TaxonomyService = TaxonomyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TaxonomyService);
//# sourceMappingURL=taxonomy.service.js.map