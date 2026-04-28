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
exports.AiPlanningController = void 0;
const common_1 = require("@nestjs/common");
const ai_planning_service_1 = require("./ai-planning.service");
const ai_quota_guard_1 = require("./guards/ai-quota.guard");
const auth_guard_1 = require("../../common/guards/auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AiPlanningController = class AiPlanningController {
    constructor(aiPlanningService) {
        this.aiPlanningService = aiPlanningService;
    }
    createConversation(user, body) {
        const userId = user && !user.id.startsWith('anonymous:') ? user.id : undefined;
        return this.aiPlanningService.createConversation({ ...body, userId });
    }
    getConversation(id) {
        return this.aiPlanningService.getConversation(id);
    }
    sendMessage(user, id, body) {
        const userId = user && !user.id.startsWith('anonymous:') ? user.id : undefined;
        return this.aiPlanningService.sendMessage({
            conversationId: id,
            userId,
            ...body,
        });
    }
};
exports.AiPlanningController = AiPlanningController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AiPlanningController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AiPlanningController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, ai_quota_guard_1.AiQuotaGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], AiPlanningController.prototype, "sendMessage", null);
exports.AiPlanningController = AiPlanningController = __decorate([
    (0, common_1.Controller)('ai/conversations'),
    __metadata("design:paramtypes", [ai_planning_service_1.AiPlanningService])
], AiPlanningController);
//# sourceMappingURL=ai-planning.controller.js.map