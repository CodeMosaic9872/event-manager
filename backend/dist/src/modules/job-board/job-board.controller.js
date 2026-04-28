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
exports.JobQueryController = exports.JobApplicationController = exports.JobBoardController = void 0;
const common_1 = require("@nestjs/common");
const job_board_service_1 = require("./job-board.service");
const job_publish_guard_1 = require("./guards/job-publish.guard");
const supplier_only_guard_1 = require("./guards/supplier-only.guard");
const auth_guard_1 = require("../../common/guards/auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let JobBoardController = class JobBoardController {
    constructor(jobBoardService) {
        this.jobBoardService = jobBoardService;
    }
    listPublicJobs() {
        return this.jobBoardService.listPublicJobs();
    }
    createJob(user, body) {
        const userId = user?.id;
        if (!userId || userId.startsWith('anonymous:')) {
            throw new common_1.UnauthorizedException('Authenticated user required');
        }
        return this.jobBoardService.createJob({ userId, ...body });
    }
    patchJob(user, id, body) {
        const userId = user?.id;
        if (!userId || userId.startsWith('anonymous:')) {
            throw new common_1.UnauthorizedException('Authenticated user required');
        }
        return this.jobBoardService.updateJob(id, userId, body);
    }
    publish(user, id) {
        const userId = user?.id;
        if (!userId || userId.startsWith('anonymous:')) {
            throw new common_1.UnauthorizedException('Authenticated user required');
        }
        return this.jobBoardService.publishJob(id, userId);
    }
    close(user, id) {
        const userId = user?.id;
        if (!userId || userId.startsWith('anonymous:')) {
            throw new common_1.UnauthorizedException('Authenticated user required');
        }
        return this.jobBoardService.closeJob(id, userId);
    }
    apply(user, id, body) {
        const userId = user?.id;
        if (!userId || userId.startsWith('anonymous:')) {
            throw new common_1.UnauthorizedException('Authenticated supplier required');
        }
        return this.jobBoardService.applyForUser(id, userId, body.message);
    }
    applications(id) {
        return this.jobBoardService.listApplications(id);
    }
};
exports.JobBoardController = JobBoardController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], JobBoardController.prototype, "listPublicJobs", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, job_publish_guard_1.JobPublishGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], JobBoardController.prototype, "createJob", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], JobBoardController.prototype, "patchJob", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, job_publish_guard_1.JobPublishGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], JobBoardController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/close'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], JobBoardController.prototype, "close", null);
__decorate([
    (0, common_1.Post)(':id/applications'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, supplier_only_guard_1.SupplierOnlyGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], JobBoardController.prototype, "apply", null);
__decorate([
    (0, common_1.Get)(':id/applications'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobBoardController.prototype, "applications", null);
exports.JobBoardController = JobBoardController = __decorate([
    (0, common_1.Controller)('jobs'),
    __metadata("design:paramtypes", [job_board_service_1.JobBoardService])
], JobBoardController);
let JobApplicationController = class JobApplicationController {
    constructor(jobBoardService) {
        this.jobBoardService = jobBoardService;
    }
    updateStatus(id, body) {
        return this.jobBoardService.updateApplicationStatus(id, body.status);
    }
};
exports.JobApplicationController = JobApplicationController;
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], JobApplicationController.prototype, "updateStatus", null);
exports.JobApplicationController = JobApplicationController = __decorate([
    (0, common_1.Controller)('job-applications'),
    __metadata("design:paramtypes", [job_board_service_1.JobBoardService])
], JobApplicationController);
let JobQueryController = class JobQueryController {
    constructor(jobBoardService) {
        this.jobBoardService = jobBoardService;
    }
    userJobs(user) {
        const userId = user?.id;
        if (!userId || userId.startsWith('anonymous:')) {
            throw new common_1.UnauthorizedException('Authenticated user required');
        }
        return this.jobBoardService.listUserJobs(userId);
    }
    supplierRecommendedJobs(supplierId) {
        return { supplierId, jobs: [], note: 'Recommendation endpoint scaffolded for ranking logic.' };
    }
};
exports.JobQueryController = JobQueryController;
__decorate([
    (0, common_1.Get)('users/me/jobs'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], JobQueryController.prototype, "userJobs", null);
__decorate([
    (0, common_1.Get)('supplier/jobs/recommended'),
    __param(0, (0, common_1.Query)('supplierId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], JobQueryController.prototype, "supplierRecommendedJobs", null);
exports.JobQueryController = JobQueryController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [job_board_service_1.JobBoardService])
], JobQueryController);
//# sourceMappingURL=job-board.controller.js.map