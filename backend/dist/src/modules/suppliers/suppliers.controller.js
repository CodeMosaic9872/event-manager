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
exports.SuppliersController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const suppliers_service_1 = require("./suppliers.service");
const jwt_util_1 = require("../../common/utils/jwt.util");
const auth_guard_1 = require("../../common/guards/auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const list_suppliers_query_dto_1 = require("./dto/list-suppliers-query.dto");
const supplier_suggestions_query_dto_1 = require("./dto/supplier-suggestions-query.dto");
const upsert_supplier_profile_dto_1 = require("./dto/upsert-supplier-profile.dto");
const supplier_draft_dto_1 = require("./dto/supplier-draft.dto");
const share_supplier_dto_1 = require("./dto/share-supplier.dto");
const supplier_private_profile_dto_1 = require("./dto/supplier-private-profile.dto");
let SuppliersController = class SuppliersController {
    constructor(suppliersService, prisma) {
        this.suppliersService = suppliersService;
        this.prisma = prisma;
    }
    listSuppliers(query) {
        return this.suppliersService.list(query);
    }
    getSupplier(slugOrId) {
        return this.suppliersService.getByIdOrSlug(slugOrId);
    }
    async suggestions(query) {
        const q = query.q ?? '';
        if (!q) {
            return [];
        }
        return this.suppliersService.suggestions(q, query.take);
    }
    createProfile(user, body) {
        const userId = user?.id;
        if (!userId || userId.startsWith('anonymous:')) {
            throw new common_1.UnauthorizedException('Authenticated user required');
        }
        return this.suppliersService.upsertProfile(userId, body);
    }
    patchProfile(user, body) {
        const userId = user?.id;
        if (!userId || userId.startsWith('anonymous:')) {
            throw new common_1.UnauthorizedException('Authenticated user required');
        }
        return this.suppliersService.upsertProfile(userId, body);
    }
    addMedia(user, body) {
        const userId = user?.id;
        if (!userId || userId.startsWith('anonymous:')) {
            throw new common_1.UnauthorizedException('Authenticated user required');
        }
        return this.suppliersService.addMedia(userId, body);
    }
    deleteMedia(user, id) {
        const userId = user?.id;
        if (!userId || userId.startsWith('anonymous:')) {
            throw new common_1.UnauthorizedException('Authenticated user required');
        }
        return this.suppliersService.deleteMedia(userId, id);
    }
    updateAttributes(user, body) {
        const userId = user?.id;
        if (!userId || userId.startsWith('anonymous:')) {
            throw new common_1.UnauthorizedException('Authenticated user required');
        }
        return this.suppliersService.updateAttributes(userId, body);
    }
    updateServiceAreas(user, body) {
        const userId = user?.id;
        if (!userId || userId.startsWith('anonymous:')) {
            throw new common_1.UnauthorizedException('Authenticated user required');
        }
        return this.suppliersService.updateServiceAreas(userId, body.serviceAreas);
    }
    async favorite(supplierId, authorization) {
        const { userId, anonymousSessionId } = await this.resolveActor(authorization);
        return this.suppliersService.saveFavorite(userId, anonymousSessionId, supplierId);
    }
    async share(supplierId, authorization, body) {
        const { userId, anonymousSessionId } = await this.resolveActor(authorization);
        return this.suppliersService.trackShare(userId, anonymousSessionId, supplierId, body);
    }
    async unfavorite(supplierId, authorization) {
        const { userId, anonymousSessionId } = await this.resolveActor(authorization);
        return this.suppliersService.removeFavorite(userId, anonymousSessionId, supplierId);
    }
    async listFavorites(authorization) {
        const { userId, anonymousSessionId } = await this.resolveActor(authorization);
        return this.suppliersService.listFavorites(userId, anonymousSessionId);
    }
    saveDraft(body) {
        return this.suppliersService.upsertDraft(body.supplierId, body);
    }
    getDraft(supplierId) {
        return this.suppliersService.getDraft(supplierId);
    }
    async resolveActor(authorization) {
        const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;
        if (!token) {
            return { userId: null, anonymousSessionId: null };
        }
        if (token.startsWith('anon_')) {
            const session = await this.prisma.anonymousSession.findUnique({ where: { token } });
            return { userId: null, anonymousSessionId: session?.id ?? null };
        }
        try {
            const decoded = (0, jwt_util_1.verifyAccessToken)(token);
            return { userId: decoded.sub, anonymousSessionId: null };
        }
        catch {
            return { userId: null, anonymousSessionId: null };
        }
    }
};
exports.SuppliersController = SuppliersController;
__decorate([
    (0, common_1.Get)('suppliers'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [list_suppliers_query_dto_1.ListSuppliersQueryDto]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "listSuppliers", null);
__decorate([
    (0, common_1.Get)('suppliers/:slugOrId'),
    __param(0, (0, common_1.Param)('slugOrId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "getSupplier", null);
__decorate([
    (0, common_1.Get)('search/suggestions'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_suggestions_query_dto_1.SupplierSuggestionsQueryDto]),
    __metadata("design:returntype", Promise)
], SuppliersController.prototype, "suggestions", null);
__decorate([
    (0, common_1.Post)('supplier/profile'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upsert_supplier_profile_dto_1.UpsertSupplierProfileDto]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "createProfile", null);
__decorate([
    (0, common_1.Patch)('supplier/profile'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upsert_supplier_profile_dto_1.UpsertSupplierProfileDto]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "patchProfile", null);
__decorate([
    (0, common_1.Post)('supplier/media'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, supplier_private_profile_dto_1.AddSupplierMediaDto]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "addMedia", null);
__decorate([
    (0, common_1.Delete)('supplier/media/:id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "deleteMedia", null);
__decorate([
    (0, common_1.Patch)('supplier/attributes'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, supplier_private_profile_dto_1.UpdateSupplierAttributesDto]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "updateAttributes", null);
__decorate([
    (0, common_1.Patch)('supplier/service-areas'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, supplier_private_profile_dto_1.UpdateSupplierServiceAreasDto]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "updateServiceAreas", null);
__decorate([
    (0, common_1.Post)('suppliers/:id/favorite'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SuppliersController.prototype, "favorite", null);
__decorate([
    (0, common_1.Post)('suppliers/:id/share'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, share_supplier_dto_1.ShareSupplierDto]),
    __metadata("design:returntype", Promise)
], SuppliersController.prototype, "share", null);
__decorate([
    (0, common_1.Delete)('suppliers/:id/favorite'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SuppliersController.prototype, "unfavorite", null);
__decorate([
    (0, common_1.Get)('users/me/favorites'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SuppliersController.prototype, "listFavorites", null);
__decorate([
    (0, common_1.Post)('supplier/draft'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [supplier_draft_dto_1.UpsertSupplierDraftDto]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "saveDraft", null);
__decorate([
    (0, common_1.Get)('supplier/draft/:supplierId'),
    __param(0, (0, common_1.Param)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SuppliersController.prototype, "getDraft", null);
exports.SuppliersController = SuppliersController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [suppliers_service_1.SuppliersService,
        prisma_service_1.PrismaService])
], SuppliersController);
//# sourceMappingURL=suppliers.controller.js.map