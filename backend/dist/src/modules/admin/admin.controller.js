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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const admin_service_1 = require("./admin.service");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    suppliers() {
        return this.adminService.listSuppliers();
    }
    incompleteSuppliers() {
        return this.adminService.listIncompleteSuppliers();
    }
    approve(id, body) {
        return this.adminService.approveSupplier(id, body.adminUserId);
    }
    reject(id, body) {
        return this.adminService.rejectSupplier(id, body.reason, body.adminUserId);
    }
    feature(id) {
        return { id, featured: true };
    }
    aiUsage() {
        return this.adminService.aiUsage();
    }
    aiFailures() {
        return this.adminService.aiFailures();
    }
    aiConversations() {
        return this.adminService.aiConversations();
    }
    notifications() {
        return this.adminService.notifications();
    }
    retryNotification(id) {
        return this.adminService.retryNotification(id);
    }
    automationRules() {
        return this.adminService.automationRules();
    }
    updateAutomationRule(id, body) {
        return { id, updated: true, body };
    }
    automationRuns() {
        return this.adminService.automationRuns();
    }
    createEventType(body) {
        return this.adminService.createEventType({
            key: String(body.key),
            name: String(body.name),
            isActive: body.isActive === undefined ? true : Boolean(body.isActive),
        });
    }
    updateEventType(id, body) {
        return this.adminService.updateEventType(id, {
            key: body.key ? String(body.key) : undefined,
            name: body.name ? String(body.name) : undefined,
            isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
        });
    }
    deleteEventType(id) {
        return this.adminService.deleteEventType(id);
    }
    createCategory(body) {
        return this.adminService.createCategory({
            key: String(body.key),
            name: String(body.name),
            sortOrder: body.sortOrder === undefined ? 0 : Number(body.sortOrder),
            isActive: body.isActive === undefined ? true : Boolean(body.isActive),
        });
    }
    updateCategory(id, body) {
        return this.adminService.updateCategory(id, {
            key: body.key ? String(body.key) : undefined,
            name: body.name ? String(body.name) : undefined,
            sortOrder: body.sortOrder === undefined ? undefined : Number(body.sortOrder),
            isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
        });
    }
    deleteCategory(id) {
        return this.adminService.deleteCategory(id);
    }
    createSubcategory(body) {
        return this.adminService.createSubcategory({
            categoryId: String(body.categoryId),
            key: String(body.key),
            name: String(body.name),
            sortOrder: body.sortOrder === undefined ? 0 : Number(body.sortOrder),
            isActive: body.isActive === undefined ? true : Boolean(body.isActive),
        });
    }
    updateSubcategory(id, body) {
        return this.adminService.updateSubcategory(id, {
            categoryId: body.categoryId ? String(body.categoryId) : undefined,
            key: body.key ? String(body.key) : undefined,
            name: body.name ? String(body.name) : undefined,
            sortOrder: body.sortOrder === undefined ? undefined : Number(body.sortOrder),
            isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
        });
    }
    deleteSubcategory(id) {
        return this.adminService.deleteSubcategory(id);
    }
    createFilterDefinition(body) {
        return this.adminService.createFilterDefinition({
            scope: String(body.scope),
            categoryId: body.categoryId ? String(body.categoryId) : undefined,
            key: String(body.key),
            label: String(body.label),
            type: String(body.type),
            optionsJson: body.optionsJson,
            sortOrder: body.sortOrder === undefined ? 0 : Number(body.sortOrder),
            isActive: body.isActive === undefined ? true : Boolean(body.isActive),
        });
    }
    updateFilterDefinition(id, body) {
        return this.adminService.updateFilterDefinition(id, {
            scope: body.scope ? String(body.scope) : undefined,
            categoryId: body.categoryId === undefined ? undefined : body.categoryId === null ? null : String(body.categoryId),
            key: body.key ? String(body.key) : undefined,
            label: body.label ? String(body.label) : undefined,
            type: body.type ? String(body.type) : undefined,
            optionsJson: body.optionsJson,
            sortOrder: body.sortOrder === undefined ? undefined : Number(body.sortOrder),
            isActive: body.isActive === undefined ? undefined : Boolean(body.isActive),
        });
    }
    deleteFilterDefinition(id) {
        return this.adminService.deleteFilterDefinition(id);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('suppliers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "suppliers", null);
__decorate([
    (0, common_1.Get)('suppliers/incomplete'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "incompleteSuppliers", null);
__decorate([
    (0, common_1.Post)('suppliers/:id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('suppliers/:id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)('suppliers/:id/feature'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "feature", null);
__decorate([
    (0, common_1.Get)('ai/usage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "aiUsage", null);
__decorate([
    (0, common_1.Get)('ai/failures'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "aiFailures", null);
__decorate([
    (0, common_1.Get)('ai/conversations'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "aiConversations", null);
__decorate([
    (0, common_1.Get)('notifications'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "notifications", null);
__decorate([
    (0, common_1.Post)('notifications/retry/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "retryNotification", null);
__decorate([
    (0, common_1.Get)('automations/rules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "automationRules", null);
__decorate([
    (0, common_1.Patch)('automations/rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateAutomationRule", null);
__decorate([
    (0, common_1.Get)('automations/runs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "automationRuns", null);
__decorate([
    (0, common_1.Post)('taxonomy/event-types'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createEventType", null);
__decorate([
    (0, common_1.Patch)('taxonomy/event-types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateEventType", null);
__decorate([
    (0, common_1.Post)('taxonomy/event-types/:id/delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteEventType", null);
__decorate([
    (0, common_1.Post)('taxonomy/categories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createCategory", null);
__decorate([
    (0, common_1.Patch)('taxonomy/categories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateCategory", null);
__decorate([
    (0, common_1.Post)('taxonomy/categories/:id/delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteCategory", null);
__decorate([
    (0, common_1.Post)('taxonomy/subcategories'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createSubcategory", null);
__decorate([
    (0, common_1.Patch)('taxonomy/subcategories/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateSubcategory", null);
__decorate([
    (0, common_1.Post)('taxonomy/subcategories/:id/delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteSubcategory", null);
__decorate([
    (0, common_1.Post)('taxonomy/filter-definitions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "createFilterDefinition", null);
__decorate([
    (0, common_1.Patch)('taxonomy/filter-definitions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "updateFilterDefinition", null);
__decorate([
    (0, common_1.Post)('taxonomy/filter-definitions/:id/delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "deleteFilterDefinition", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map