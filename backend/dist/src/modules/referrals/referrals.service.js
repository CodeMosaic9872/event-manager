"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let ReferralsService = class ReferralsService {
    getLink(supplierId) {
        return {
            supplierId,
            code: `ref_${supplierId}`,
            url: `https://event-marketplace.example/ref/${supplierId}`,
        };
    }
    regenerateLink(supplierId) {
        const code = `ref_${(0, crypto_1.randomBytes)(4).toString('hex')}`;
        return {
            supplierId,
            code,
            url: `https://event-marketplace.example/ref/${code}`,
        };
    }
    listAttributions(supplierId) {
        return { supplierId, attributions: [] };
    }
    listRewards(supplierId) {
        return { supplierId, rewards: [] };
    }
};
exports.ReferralsService = ReferralsService;
exports.ReferralsService = ReferralsService = __decorate([
    (0, common_1.Injectable)()
], ReferralsService);
//# sourceMappingURL=referrals.service.js.map