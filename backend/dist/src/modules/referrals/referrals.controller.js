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
exports.AdminReferralsController = exports.ReferralsController = void 0;
const common_1 = require("@nestjs/common");
const referrals_service_1 = require("./referrals.service");
let ReferralsController = class ReferralsController {
    constructor(referralsService) {
        this.referralsService = referralsService;
    }
    link(supplierId) {
        return this.referralsService.getLink(supplierId);
    }
    regenerate(supplierId) {
        return this.referralsService.regenerateLink(supplierId);
    }
    attributions(supplierId) {
        return this.referralsService.listAttributions(supplierId);
    }
    rewards(supplierId) {
        return this.referralsService.listRewards(supplierId);
    }
};
exports.ReferralsController = ReferralsController;
__decorate([
    (0, common_1.Get)('link'),
    __param(0, (0, common_1.Query)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReferralsController.prototype, "link", null);
__decorate([
    (0, common_1.Post)('link/regenerate'),
    __param(0, (0, common_1.Query)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReferralsController.prototype, "regenerate", null);
__decorate([
    (0, common_1.Get)('attributions'),
    __param(0, (0, common_1.Query)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReferralsController.prototype, "attributions", null);
__decorate([
    (0, common_1.Get)('rewards'),
    __param(0, (0, common_1.Query)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReferralsController.prototype, "rewards", null);
exports.ReferralsController = ReferralsController = __decorate([
    (0, common_1.Controller)('supplier/referrals'),
    __metadata("design:paramtypes", [referrals_service_1.ReferralsService])
], ReferralsController);
let AdminReferralsController = class AdminReferralsController {
    list() {
        return { referrals: [] };
    }
    patchReward(id) {
        return { id, updated: true };
    }
};
exports.AdminReferralsController = AdminReferralsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminReferralsController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)('rewards/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminReferralsController.prototype, "patchReward", null);
exports.AdminReferralsController = AdminReferralsController = __decorate([
    (0, common_1.Controller)('admin/referrals')
], AdminReferralsController);
//# sourceMappingURL=referrals.controller.js.map